#!/usr/bin/env python3
"""
Script para actualizar fechas en coleccion_externa consultando la API de GBIF.
Busca registros por catalogNumber + institutionCode (misma lógica que la mapoteca)
y actualiza el campo fecha.

Uso:
    python3 scripts/update-fechas-gbif.py [--dry-run] [--batch-size 100] [--catalogo QCAZA] [--limit 500]
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


# ─── Mapeo de catálogos — misma lógica que MapotecaMap.tsx GbifLink ───────────

def get_gbif_params(catalogo: str, numero: str) -> list[dict]:
    """
    Retorna una lista de dicts de parámetros GBIF a probar para un catálogo+número.
    Misma lógica que el componente GbifLink de la mapoteca.
    """
    variantes = []

    if catalogo == 'KU':
        variantes.append({
            'institutionCode': 'KU',
            'catalogNumber': numero,
            'collectionCode': 'KUH',
        })
        # También probar sin collectionCode
        variantes.append({
            'institutionCode': 'KU',
            'catalogNumber': numero,
        })
    elif catalogo == 'QCAZA':
        variantes.append({
            'institutionCode': 'QCAZ',
            'catalogNumber': f'QCAZA{numero}',
        })
        variantes.append({
            'institutionCode': 'QCAZ',
            'catalogNumber': numero,
        })
    elif catalogo == 'QCAZ':
        variantes.append({
            'institutionCode': 'QCAZ',
            'catalogNumber': f'QCAZA{numero}',
        })
        variantes.append({
            'institutionCode': 'QCAZ',
            'catalogNumber': numero,
        })
    elif catalogo == 'AMNH':
        variantes.append({
            'institutionCode': 'AMNH',
            'catalogNumber': f'A-{numero}',
        })
        variantes.append({
            'institutionCode': 'AMNH',
            'catalogNumber': numero,
        })
    elif catalogo == 'USNM':
        variantes.append({
            'institutionCode': 'USNM',
            'catalogNumber': f'USNM {numero}',
        })
        variantes.append({
            'institutionCode': 'USNM',
            'catalogNumber': numero,
        })
    elif catalogo == 'DHMECN':
        variantes.append({
            'institutionCode': 'DHMECN',
            'catalogNumber': f'DHMECN {numero}',
        })
        variantes.append({
            'institutionCode': 'DHMECN',
            'catalogNumber': numero,
        })
    elif catalogo == 'MCZ':
        variantes.append({
            'institutionCode': 'MCZ',
            'catalogNumber': f'MCZ:Herp:A-{numero}',
        })
        variantes.append({
            'institutionCode': 'MCZ',
            'catalogNumber': numero,
        })
    elif catalogo == 'LACM':
        variantes.append({
            'institutionCode': 'LACM',
            'catalogNumber': numero,
        })
    elif catalogo == 'UMMZ':
        variantes.append({
            'institutionCode': 'UMMZ',
            'catalogNumber': numero,
        })
    elif catalogo == 'ANSP':
        variantes.append({
            'institutionCode': 'ANSP',
            'catalogNumber': numero,
        })
    elif catalogo == 'FMNH':
        variantes.append({
            'institutionCode': 'FMNH',
            'catalogNumber': numero,
        })
    elif catalogo == 'CAS':
        variantes.append({
            'institutionCode': 'CAS',
            'catalogNumber': numero,
        })
    else:
        # Genérico: probar tal cual
        variantes.append({
            'institutionCode': catalogo,
            'catalogNumber': numero,
        })

    return variantes


def parse_event_date(event_date: str) -> str | None:
    """Parsea eventDate de GBIF a formato YYYY-MM-DD."""
    if not event_date:
        return None
    partes = event_date.split('-')
    if len(partes) >= 3:
        return f"{partes[0]}-{partes[1]}-{partes[2][:2]}"
    elif len(partes) == 2:
        return f"{partes[0]}-{partes[1]}-01"
    elif len(partes) == 1 and partes[0].isdigit() and len(partes[0]) == 4:
        return f"{partes[0]}-01-01"
    return None


# ─── GBIF búsqueda individual (misma lógica que la mapoteca) ──────────────────

def buscar_fecha_gbif(client: httpx.Client, catalogo: str, numero: str) -> str | None:
    """
    Busca la eventDate en GBIF para un espécimen.
    Prueba múltiples variantes de catalogNumber según el catálogo.
    """
    variantes = get_gbif_params(catalogo, numero)

    for params_dict in variantes:
        search_params = {
            **params_dict,
            'classKey': '131',  # Amphibia
            'limit': '1',
        }

        for intento in range(3):
            try:
                resp = client.get(GBIF_BASE, params=search_params, timeout=30.0)

                if resp.status_code == 429:
                    wait = 60
                    log.warning(f'GBIF 429 Rate Limited — esperando {wait}s')
                    time.sleep(wait)
                    continue

                if resp.status_code == 503:
                    wait = 2 ** intento * 10
                    log.warning(f'GBIF 503 — esperando {wait}s (intento {intento+1})')
                    time.sleep(wait)
                    continue

                if resp.status_code != 200:
                    break

                data = resp.json()
                results = data.get('results', [])
                if results:
                    event_date = results[0].get('eventDate', '')
                    fecha = parse_event_date(event_date)
                    if fecha:
                        return fecha

                break  # Sin resultados, probar siguiente variante

            except (httpx.TimeoutException, httpx.NetworkError, httpx.RemoteProtocolError) as e:
                wait = 2 ** intento * 5
                log.warning(f'Error red: {type(e).__name__} — esperando {wait}s')
                time.sleep(wait)

    return None


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description='Actualizar fechas de coleccion_externa desde GBIF')
    parser.add_argument('--dry-run', action='store_true', help='No actualiza la BD')
    parser.add_argument('--batch-size', type=int, default=50, help='Registros por lote antes de reportar progreso')
    parser.add_argument('--catalogo', type=str, default=None, help='Procesar solo este catálogo')
    parser.add_argument('--limit', type=int, default=None, help='Límite total de registros')
    parser.add_argument('--delay', type=float, default=0.35, help='Segundos entre requests GBIF (default: 0.35)')
    args = parser.parse_args()

    url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    if not url or not key:
        log.error('Variables NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY requeridas')
        sys.exit(1)

    supabase: Client = create_client(url, key)

    # Obtener registros sin fecha — paginar para superar límite de 1000
    log.info('Obteniendo registros sin fecha...')
    all_registros = []
    page_size = 1000
    offset = 0

    while True:
        query = supabase.table('coleccion_externa') \
            .select('id, catalogo_museo, numero_museo') \
            .is_('fecha', 'null') \
            .not_.is_('catalogo_museo', 'null') \
            .not_.is_('numero_museo', 'null') \
            .range(offset, offset + page_size - 1)

        if args.catalogo:
            query = query.eq('catalogo_museo', args.catalogo)

        resp = query.execute()
        batch = resp.data
        if not batch:
            break

        all_registros.extend(batch)
        offset += len(batch)

        if len(batch) < page_size:
            break

        if args.limit and len(all_registros) >= args.limit:
            all_registros = all_registros[:args.limit]
            break

    if args.limit:
        all_registros = all_registros[:args.limit]

    total = len(all_registros)
    log.info(f'Total registros a procesar: {total}')

    if total == 0:
        log.info('No hay registros para procesar.')
        return

    encontrados = 0
    no_encontrados = 0
    actualizados = 0
    errores = 0
    inicio = datetime.now()

    with httpx.Client(
        headers={'User-Agent': 'amphibians-wiki-jambatu/1.0 (https://anfibiosecuador.ec)'}
    ) as client:

        for i, rec in enumerate(all_registros):
            rid = rec['id']
            catalogo = rec['catalogo_museo']
            numero = str(rec['numero_museo']).strip()

            fecha = buscar_fecha_gbif(client, catalogo, numero)

            if fecha:
                encontrados += 1
                if not args.dry_run:
                    try:
                        supabase.table('coleccion_externa') \
                            .update({'fecha': fecha}) \
                            .eq('id', rid) \
                            .execute()
                        actualizados += 1
                    except Exception as e:
                        log.error(f'Error actualizando id={rid}: {e}')
                        errores += 1

                if (encontrados % 10 == 0) or encontrados == 1:
                    log.info(f'  ✓ {catalogo} {numero} → {fecha} (total encontrados: {encontrados})')
            else:
                no_encontrados += 1

            # Pausa respetuosa para GBIF
            time.sleep(args.delay)

            # Progreso cada batch_size registros
            if (i + 1) % args.batch_size == 0 or (i + 1) == total:
                elapsed = (datetime.now() - inicio).total_seconds()
                pct = (i + 1) / total * 100
                rps = (i + 1) / max(elapsed, 1)
                eta = int((total - i - 1) / max(rps, 0.01))
                log.info(
                    f'[{pct:.1f}%] {i+1}/{total} | '
                    f'Encontrados: {encontrados} | Sin fecha: {no_encontrados} | '
                    f'ETA: {eta//60}m{eta%60}s'
                )

    # Resumen
    elapsed_total = datetime.now() - inicio
    print('\n' + '=' * 60)
    print('RESUMEN FINAL')
    print(f'  Total procesados:     {total}')
    print(f'  Fecha encontrada:     {encontrados} ({encontrados/max(total,1)*100:.1f}%)')
    print(f'  Sin fecha en GBIF:    {no_encontrados} ({no_encontrados/max(total,1)*100:.1f}%)')
    if not args.dry_run:
        print(f'  Actualizados en BD:   {actualizados}')
        print(f'  Errores:              {errores}')
    else:
        print('  [DRY RUN] No se realizaron cambios')
    print(f'  Tiempo total:         {elapsed_total}')
    print('=' * 60)


if __name__ == '__main__':
    main()
