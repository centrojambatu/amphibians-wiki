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

    with httpx.Client(headers={'User-Agent': 'amphibians-wiki-jambatu/1.0 (https://anfibiosecuador.ec)'}) as client:
        for i in range(0, total, args.batch_size):
            lote = registros[i:i + args.batch_size]
            log.info(f'--- Lote {i // args.batch_size + 1} | registros {i+1}–{min(i+len(lote), total)} de {total} ---')

            actualizaciones = []

            for rec in lote:
                rid = rec['id']
                catalogo = rec['catalogo_museo']
                numero = rec['numero_museo']

                fecha = buscar_fecha_gbif(client, catalogo, numero)

                if fecha:
                    encontrados += 1
                    log.info(f'  ✓ {catalogo} {numero} → {fecha}')
                    actualizaciones.append({'id': rid, 'fecha': fecha})
                else:
                    no_encontrados += 1
                    log.debug(f'  - {catalogo} {numero} → sin fecha en GBIF')

                # Pausa respetuosa para no sobrecargar GBIF
                time.sleep(0.3)

            # Actualizar en batch
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
            elif actualizaciones and args.dry_run:
                log.info(f'  [DRY RUN] Se actualizarían {len(actualizaciones)} registros en este lote')

            # Progreso
            elapsed = (datetime.now() - inicio).seconds
            pct = (i + len(lote)) / total * 100
            rps = (i + len(lote)) / max(elapsed, 1)
            restante = int((total - i - len(lote)) / max(rps, 0.01))
            log.info(f'Progreso: {pct:.1f}% | Encontrados: {encontrados} | Sin fecha: {no_encontrados} | ETA: ~{restante}s')

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
