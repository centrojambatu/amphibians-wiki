#!/usr/bin/env python3
"""
Script para actualizar fechas en coleccion_externa consultando la API de GBIF.
Busca registros por catalogNumber + institutionCode y actualiza el campo fecha.

Uso:
    python3 scripts/update-fechas-gbif.py [--dry-run] [--batch-size 100] [--catalogo QCAZA]

Opciones:
    --dry-run       Solo muestra lo que haría, sin actualizar la base de datos
    --batch-size    Número de registros a procesar por lote (default: 100)
    --catalogo      Procesar solo un catálogo específico (ej: QCAZA, QCAZ, KU)
    --limit         Límite total de registros a procesar (útil para pruebas)
"""
import os
import sys
import time
import argparse
import logging
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

try:
    import httpx
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'httpx'])
    import httpx

# ─── Configuración ────────────────────────────────────────────────────────────

load_dotenv('.env.local')

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s',
    datefmt='%H:%M:%S'
)
log = logging.getLogger(__name__)

GBIF_BASE = 'https://api.gbif.org/v1/occurrence/search'

# Algunos catálogos tienen nombres distintos en GBIF. Este mapeo indica cómo
# aparecen en los campos institutionCode o collectionCode de GBIF.
CATALOGO_GBIF_MAP = {
    'QCAZA': ['QCAZA', 'QCAZ'],
    'QCAZ':  ['QCAZ', 'QCAZA'],
    'DHMECN': ['DHMECN'],
    'KU':    ['KU', 'KUBI'],
    'USNM':  ['USNM'],
    'MCZ':   ['MCZ'],
    'AMNH':  ['AMNH'],
    'LACM':  ['LACM'],
    'UMMZ':  ['UMMZ'],
    'ANSP':  ['ANSP'],
    'FMNH':  ['FMNH'],
    'CAS':   ['CAS'],
    'MHNG':  ['MHNG'],
    'RMNH':  ['RMNH', 'RNMH'],
}


# ─── GBIF ─────────────────────────────────────────────────────────────────────

def buscar_fecha_gbif(client: httpx.Client, catalogo: str, numero: str, retries: int = 3) -> str | None:
    """
    Busca la eventDate en GBIF para un espécimen dado.
    Retorna la fecha como string 'YYYY-MM-DD' o None si no se encuentra.
    """
    aliases = CATALOGO_GBIF_MAP.get(catalogo, [catalogo])

    for alias in aliases:
        for intento in range(retries):
            try:
                resp = client.get(
                    GBIF_BASE,
                    params={
                        'catalogNumber': numero,
                        'institutionCode': alias,
                        'basisOfRecord': 'PRESERVED_SPECIMEN',
                        'limit': 5,
                    },
                    timeout=30.0,
                )

                if resp.status_code == 503:
                    wait = 2 ** intento * 5  # 5s, 10s, 20s
                    log.warning(f'GBIF 503 para {alias}:{numero} – esperando {wait}s (intento {intento+1})')
                    time.sleep(wait)
                    continue

                if resp.status_code != 200:
                    log.warning(f'GBIF HTTP {resp.status_code} para {alias}:{numero}')
                    break

                data = resp.json()
                for rec in data.get('results', []):
                    event_date = rec.get('eventDate')
                    if event_date:
                        # eventDate puede ser 'YYYY', 'YYYY-MM', 'YYYY-MM-DD'
                        # Solo guardamos si tiene al menos año-mes-día
                        partes = event_date.split('-')
                        if len(partes) >= 3:
                            return f"{partes[0]}-{partes[1]}-{partes[2][:2]}"
                        elif len(partes) == 2:
                            return f"{partes[0]}-{partes[1]}-01"
                        elif len(partes) == 1 and partes[0].isdigit():
                            return f"{partes[0]}-01-01"
                break  # Sin resultados pero sin error → pasar al siguiente alias

            except (httpx.TimeoutException, httpx.NetworkError, httpx.RemoteProtocolError) as e:
                wait = 2 ** intento * 3
                log.warning(f'Error conexión para {alias}:{numero} – esperando {wait}s (intento {intento+1}): {type(e).__name__}')
                time.sleep(wait)

    return None


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description='Actualizar fechas de coleccion_externa desde GBIF')
    parser.add_argument('--dry-run', action='store_true', help='No actualiza la BD, solo muestra resultados')
    parser.add_argument('--batch-size', type=int, default=100, help='Registros por lote (default: 100)')
    parser.add_argument('--catalogo', type=str, default=None, help='Procesar solo este catálogo (ej: QCAZA)')
    parser.add_argument('--limit', type=int, default=None, help='Límite total de registros a procesar')
    args = parser.parse_args()

    # Supabase
    url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    if not url or not key:
        log.error('Variables de entorno NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY requeridas')
        sys.exit(1)

    supabase: Client = create_client(url, key)

    # Obtener registros sin fecha
    log.info('Obteniendo registros sin fecha de coleccion_externa...')
    query = supabase.table('coleccion_externa') \
        .select('id, catalogo_museo, numero_museo') \
        .is_('fecha', 'null') \
        .not_.is_('catalogo_museo', 'null') \
        .not_.is_('numero_museo', 'null')

    if args.catalogo:
        query = query.eq('catalogo_museo', args.catalogo)

    if args.limit:
        query = query.limit(args.limit)

    resp = query.execute()
    registros = resp.data
    total = len(registros)
    log.info(f'Total registros a procesar: {total}')

    if total == 0:
        log.info('No hay registros para procesar.')
        return

    # Estadísticas
    encontrados = 0
    no_encontrados = 0
    errores = 0
    actualizados = 0

    inicio = datetime.now()

    # ─── Estrategia 1: Descargar catálogos completos de GBIF ─────────────────
    # Para catálogos grandes, descargamos TODOS los registros de esa institución
    # de una vez y cruzamos en memoria (mucho más rápido que 1 request por registro)

    # Agrupar registros por catálogo
    por_catalogo = {}
    for rec in registros:
        cat = rec['catalogo_museo']
        if cat not in por_catalogo:
            por_catalogo[cat] = []
        por_catalogo[cat].append(rec)

    log.info(f'Catálogos a procesar: {list(por_catalogo.keys())}')

    with httpx.Client(
        headers={'User-Agent': 'amphibians-wiki-jambatu/1.0 (https://anfibiosecuador.ec)'},
        timeout=60.0,
    ) as client:

        for catalogo, cat_registros in por_catalogo.items():
            cat_total = len(cat_registros)
            log.info(f'\n{"="*60}')
            log.info(f'Catálogo: {catalogo} ({cat_total} registros sin fecha)')

            # Construir índice: numero_museo → lista de ids
            num_to_ids = {}
            for rec in cat_registros:
                num = str(rec['numero_museo']).strip()
                if num not in num_to_ids:
                    num_to_ids[num] = []
                num_to_ids[num].append(rec['id'])

            aliases = CATALOGO_GBIF_MAP.get(catalogo, [catalogo])
            gbif_fechas = {}  # numero_museo → fecha

            # Intentar descargar todos los registros del catálogo de GBIF
            for alias in aliases:
                log.info(f'  Descargando registros GBIF para institutionCode={alias}...')
                offset_gbif = 0
                gbif_total = None

                while True:
                    try:
                        resp = client.get(GBIF_BASE, params={
                            'institutionCode': alias,
                            'basisOfRecord': 'PRESERVED_SPECIMEN',
                            'classKey': '131',  # Amphibia
                            'limit': 300,
                            'offset': offset_gbif,
                            'fields': 'catalogNumber,eventDate',
                        })

                        if resp.status_code == 503:
                            log.warning(f'  GBIF 503 — esperando 30s...')
                            time.sleep(30)
                            continue

                        if resp.status_code == 429:
                            log.warning(f'  GBIF 429 Rate Limited — esperando 60s...')
                            time.sleep(60)
                            continue

                        if resp.status_code != 200:
                            log.warning(f'  GBIF HTTP {resp.status_code} para {alias}')
                            break

                        data = resp.json()
                        if gbif_total is None:
                            gbif_total = data.get('count', 0)
                            log.info(f'  Total en GBIF para {alias}: {gbif_total}')

                        results = data.get('results', [])
                        if not results:
                            break

                        for rec in results:
                            cat_num = str(rec.get('catalogNumber', '')).strip()
                            event_date = rec.get('eventDate', '')

                            if cat_num and event_date and cat_num not in gbif_fechas:
                                partes = event_date.split('-')
                                if len(partes) >= 3:
                                    gbif_fechas[cat_num] = f"{partes[0]}-{partes[1]}-{partes[2][:2]}"
                                elif len(partes) == 2:
                                    gbif_fechas[cat_num] = f"{partes[0]}-{partes[1]}-01"
                                elif len(partes) == 1 and partes[0].isdigit():
                                    gbif_fechas[cat_num] = f"{partes[0]}-01-01"

                        offset_gbif += len(results)

                        if offset_gbif >= gbif_total or len(results) < 300:
                            break

                        # Pausa entre páginas (respetar rate limit)
                        time.sleep(0.5)

                    except (httpx.TimeoutException, httpx.NetworkError) as e:
                        log.warning(f'  Error red: {type(e).__name__} — esperando 10s...')
                        time.sleep(10)

                log.info(f'  Fechas encontradas en GBIF para {alias}: {len(gbif_fechas)}')

                if len(gbif_fechas) > 0:
                    break  # Encontramos datos con este alias, no probar otros

            # ─── Cruzar con nuestros registros ────────────────────────────────
            actualizaciones = []

            # Intentar match directo por numero_museo
            for num, ids in num_to_ids.items():
                fecha = gbif_fechas.get(num)

                # Algunos catálogos usan prefijos (ej: QCAZA12345 en GBIF vs 12345 en nuestra BD)
                if not fecha:
                    for prefix in aliases:
                        fecha = gbif_fechas.get(f"{prefix}{num}")
                        if fecha:
                            break

                if fecha:
                    encontrados += len(ids)
                    for rid in ids:
                        actualizaciones.append({'id': rid, 'fecha': fecha})
                else:
                    no_encontrados += len(ids)

            log.info(f'  Matches: {len(actualizaciones)} de {cat_total}')

            # ─── Actualizar BD ────────────────────────────────────────────────
            if actualizaciones and not args.dry_run:
                for upd in actualizaciones:
                    try:
                        supabase.table('coleccion_externa') \
                            .update({'fecha': upd['fecha']}) \
                            .eq('id', upd['id']) \
                            .execute()
                        actualizados += 1
                    except Exception as e:
                        log.error(f'Error actualizando id={upd["id"]}: {e}')
                        errores += 1
                log.info(f'  Actualizados en BD: {actualizados}')
            elif actualizaciones and args.dry_run:
                log.info(f'  [DRY RUN] Se actualizarían {len(actualizaciones)} registros')

            # Progreso global
            procesados = encontrados + no_encontrados
            elapsed = (datetime.now() - inicio).seconds
            pct = procesados / total * 100 if total > 0 else 0
            log.info(f'Progreso global: {pct:.1f}% | Encontrados: {encontrados} | Sin fecha: {no_encontrados}')

    # Resumen final
    print('\n' + '='*60)
    print(f'RESUMEN FINAL')
    print(f'  Total procesados:     {total}')
    print(f'  Fecha encontrada:     {encontrados} ({encontrados/total*100:.1f}%)')
    print(f'  Sin fecha en GBIF:    {no_encontrados} ({no_encontrados/total*100:.1f}%)')
    if not args.dry_run:
        print(f'  Actualizados en BD:   {actualizados}')
        print(f'  Errores al actualizar:{errores}')
    else:
        print(f'  [DRY RUN] No se realizaron cambios en la BD')
    print(f'  Tiempo total:         {datetime.now() - inicio}')
    print('='*60)


if __name__ == '__main__':
    main()
