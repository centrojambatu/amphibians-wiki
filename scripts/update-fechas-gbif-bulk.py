#!/usr/bin/env python3
"""
Script BULK para actualizar fechas en coleccion_externa desde GBIF.
Descarga TODOS los anfibios de Ecuador de GBIF de una sola vez (paginando de 300 en 300)
y cruza en memoria con nuestros registros.

Mucho más rápido que el script individual porque:
- 1 descarga masiva vs 54K requests individuales
- Cruce en memoria O(1) por registro

Uso:
    python3 scripts/update-fechas-gbif-bulk.py [--dry-run]
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

load_dotenv('.env.local')

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s',
    datefmt='%H:%M:%S'
)
log = logging.getLogger(__name__)

GBIF_BASE = 'https://api.gbif.org/v1/occurrence/search'


def parse_event_date(event_date: str) -> str | None:
    if not event_date:
        return None
    # Handle ISO dates like "2015-03-21T00:00:00"
    if 'T' in event_date:
        event_date = event_date.split('T')[0]
    partes = event_date.split('-')
    if len(partes) >= 3:
        return f"{partes[0]}-{partes[1]}-{partes[2][:2]}"
    elif len(partes) == 2:
        return f"{partes[0]}-{partes[1]}-01"
    elif len(partes) == 1 and partes[0].isdigit() and len(partes[0]) == 4:
        return f"{partes[0]}-01-01"
    return None


def download_gbif_amphibia_ecuador(client: httpx.Client) -> dict[str, dict]:
    """
    Descarga TODOS los registros de anfibios de Ecuador desde GBIF.
    Retorna un dict: (institutionCode, catalogNumber) → {eventDate, ...}
    """
    log.info('=== Descargando todos los anfibios de Ecuador desde GBIF ===')

    # GBIF max offset es 100,000. Usamos filtros para segmentar si es necesario
    all_records: dict[tuple[str, str], str] = {}
    offset = 0
    page_size = 300
    total_gbif = None
    errors_consecutivos = 0
    max_errors = 10

    while True:
        try:
            resp = client.get(GBIF_BASE, params={
                'country': 'EC',
                'classKey': '131',  # Amphibia
                'basisOfRecord': 'PRESERVED_SPECIMEN',
                'limit': str(page_size),
                'offset': str(offset),
            }, timeout=60.0)

            if resp.status_code == 429:
                log.warning('GBIF 429 Rate Limited — esperando 60s...')
                time.sleep(60)
                continue

            if resp.status_code == 503:
                log.warning('GBIF 503 — esperando 30s...')
                time.sleep(30)
                errors_consecutivos += 1
                if errors_consecutivos >= max_errors:
                    log.error('Demasiados errores consecutivos, abortando descarga')
                    break
                continue

            if resp.status_code != 200:
                log.warning(f'GBIF HTTP {resp.status_code}')
                errors_consecutivos += 1
                if errors_consecutivos >= max_errors:
                    break
                time.sleep(5)
                continue

            errors_consecutivos = 0
            data = resp.json()

            if total_gbif is None:
                total_gbif = data.get('count', 0)
                log.info(f'Total registros en GBIF (Amphibia Ecuador): {total_gbif}')

            results = data.get('results', [])
            if not results:
                break

            for rec in results:
                inst_code = (rec.get('institutionCode') or '').strip()
                cat_num = (rec.get('catalogNumber') or '').strip()
                event_date = rec.get('eventDate', '')

                if inst_code and cat_num and event_date:
                    fecha = parse_event_date(event_date)
                    if fecha:
                        key = (inst_code.upper(), cat_num)
                        if key not in all_records:
                            all_records[key] = fecha

            offset += len(results)

            if offset % 3000 == 0 or offset >= (total_gbif or 0):
                pct = (offset / max(total_gbif or 1, 1)) * 100
                log.info(f'  Descargados: {offset}/{total_gbif} ({pct:.1f}%) — Fechas únicas: {len(all_records)}')

            if offset >= (total_gbif or 0) or len(results) < page_size:
                break

            # Pausa entre páginas
            time.sleep(0.3)

        except (httpx.TimeoutException, httpx.NetworkError, httpx.RemoteProtocolError) as e:
            log.warning(f'Error red: {type(e).__name__} — esperando 10s...')
            time.sleep(10)
            errors_consecutivos += 1
            if errors_consecutivos >= max_errors:
                break

    log.info(f'=== Descarga completa: {len(all_records)} registros con fecha ===')
    return all_records


def build_lookup_keys(catalogo: str, numero: str) -> list[tuple[str, str]]:
    """
    Genera las variantes de (institutionCode, catalogNumber) para buscar en el índice GBIF.
    Misma lógica que GbifLink de la mapoteca.
    """
    keys = []
    num = numero.strip()
    cat = catalogo.strip().upper()

    if cat in ('QCAZA', 'QCAZ'):
        keys.append(('QCAZ', f'QCAZA{num}'))
        keys.append(('QCAZ', num))
        keys.append(('QCAZA', num))
        keys.append(('QCAZA', f'QCAZA{num}'))
    elif cat == 'KU':
        keys.append(('KU', num))
        keys.append(('KUBI', num))
    elif cat == 'AMNH':
        keys.append(('AMNH', f'A-{num}'))
        keys.append(('AMNH', num))
    elif cat == 'USNM':
        keys.append(('USNM', f'USNM {num}'))
        keys.append(('USNM', num))
    elif cat == 'DHMECN':
        keys.append(('DHMECN', f'DHMECN {num}'))
        keys.append(('DHMECN', num))
        keys.append(('MECN', num))
    elif cat == 'MCZ':
        keys.append(('MCZ', f'MCZ:Herp:A-{num}'))
        keys.append(('MCZ', num))
    else:
        keys.append((cat, num))

    return keys


def main():
    parser = argparse.ArgumentParser(description='Bulk update fechas desde GBIF')
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()

    url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    if not url or not key:
        log.error('Variables NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY requeridas')
        sys.exit(1)

    supabase: Client = create_client(url, key)
    inicio = datetime.now()

    # Paso 1: Descargar índice GBIF
    with httpx.Client(
        headers={'User-Agent': 'amphibians-wiki-jambatu/1.0 (https://anfibiosecuador.ec)'},
        timeout=60.0,
    ) as client:
        gbif_index = download_gbif_amphibia_ecuador(client)

    if not gbif_index:
        log.error('No se pudieron descargar datos de GBIF')
        return

    # Paso 2: Obtener registros sin fecha de nuestra BD
    log.info('Obteniendo registros sin fecha de coleccion_externa...')
    all_registros = []
    page_size = 1000
    offset = 0

    while True:
        resp = supabase.table('coleccion_externa') \
            .select('id, catalogo_museo, numero_museo') \
            .is_('fecha', 'null') \
            .not_.is_('catalogo_museo', 'null') \
            .not_.is_('numero_museo', 'null') \
            .range(offset, offset + page_size - 1) \
            .execute()

        batch = resp.data
        if not batch:
            break
        all_registros.extend(batch)
        offset += len(batch)
        if len(batch) < page_size:
            break

    total = len(all_registros)
    log.info(f'Total registros sin fecha: {total}')

    if total == 0:
        log.info('No hay registros para procesar.')
        return

    # Paso 3: Cruzar en memoria
    log.info('Cruzando registros con índice GBIF...')
    actualizaciones = []
    no_encontrados = 0

    for rec in all_registros:
        catalogo = rec['catalogo_museo']
        numero = str(rec['numero_museo']).strip()

        keys = build_lookup_keys(catalogo, numero)
        fecha = None
        for k in keys:
            fecha = gbif_index.get(k)
            if fecha:
                break

        if fecha:
            actualizaciones.append({'id': rec['id'], 'fecha': fecha})
        else:
            no_encontrados += 1

    encontrados = len(actualizaciones)
    log.info(f'Matches: {encontrados} de {total} ({encontrados/max(total,1)*100:.1f}%)')
    log.info(f'Sin fecha en GBIF: {no_encontrados}')

    # Paso 4: Actualizar BD
    if actualizaciones and not args.dry_run:
        log.info(f'Actualizando {encontrados} registros en la BD...')
        errores = 0
        actualizados = 0

        for i, upd in enumerate(actualizaciones):
            try:
                supabase.table('coleccion_externa') \
                    .update({'fecha': upd['fecha']}) \
                    .eq('id', upd['id']) \
                    .execute()
                actualizados += 1
            except Exception as e:
                log.error(f'Error actualizando id={upd["id"]}: {e}')
                errores += 1

            if (i + 1) % 500 == 0:
                log.info(f'  Actualizados: {actualizados}/{encontrados}')

        log.info(f'Actualizados: {actualizados}, Errores: {errores}')
    elif actualizaciones and args.dry_run:
        log.info(f'[DRY RUN] Se actualizarían {encontrados} registros')
        # Mostrar primeros 10
        for upd in actualizaciones[:10]:
            log.info(f'  id={upd["id"]} → {upd["fecha"]}')

    elapsed = datetime.now() - inicio
    print('\n' + '=' * 60)
    print('RESUMEN FINAL (BULK)')
    print(f'  Registros GBIF descargados:  {len(gbif_index)}')
    print(f'  Registros sin fecha en BD:   {total}')
    print(f'  Fechas encontradas:          {encontrados} ({encontrados/max(total,1)*100:.1f}%)')
    print(f'  Sin match en GBIF:           {no_encontrados}')
    if not args.dry_run:
        print(f'  Actualizados en BD:          {actualizados}')
    else:
        print('  [DRY RUN] No se realizaron cambios')
    print(f'  Tiempo total:                {elapsed}')
    print('=' * 60)


if __name__ == '__main__':
    main()
