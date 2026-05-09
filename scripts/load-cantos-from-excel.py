#!/usr/bin/env python3
"""
Carga cantos desde '2_Catalogo Cantos-marzo2023 (1).xlsx' a la tabla `canto`.

- Resuelve taxon_id por jerarquía (especie → género → familia).
- Resuelve coleccion_id (interna 'CJ ...') o coleccion_externa_id (e.g. QCAZ44870, BMNH 1987.1888).
- Si no encuentra el número de museo, deja ambas FKs en NULL y registra el caso en observacion_carga.
- Convierte "-" → NULL en todas las celdas.
- Parsea coordenadas tipo "S 0.315042 W 78.516715".

Uso:
  python scripts/load-cantos-from-excel.py            # dry-run (default), solo muestra stats
  python scripts/load-cantos-from-excel.py --commit   # inserta de verdad
"""

import argparse
import os
import re
import sys
from pathlib import Path
from collections import defaultdict, Counter
from datetime import date, time, datetime

import openpyxl
from dotenv import load_dotenv
from supabase import create_client, Client

ROOT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(ROOT_DIR / ".env.local")

EXCEL_PATH = "/Users/xavieraguas/Downloads/2_Catalogo Cantos-marzo2023 (1).xlsx"
SHEET_NAME = "Catalogo Cantos.csv"
BATCH_SIZE = 200  # filas por INSERT


def get_client() -> Client:
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "").strip()
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    if not url or not key:
        sys.exit("Faltan NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en .env.local")
    return create_client(url, key)


# --- Parsers ----------------------------------------------------------------

DASH_VALUES = {"-", "--", "n/a", "na", "n.a.", ""}

def clean(v):
    """'-' / '' / espacios → None. Strings se trimean."""
    if v is None:
        return None
    if isinstance(v, str):
        s = v.strip().replace("\xa0", " ")
        if s.lower() in DASH_VALUES:
            return None
        return s
    return v


COORD_RE = re.compile(
    r"^\s*([NS])\s*([\d.]+)\s+([EW])\s*([\d.]+)\s*$",
    re.IGNORECASE,
)

def parse_coords(s):
    """'S 0.315042 W 78.516715' → (lat, lon) decimales con signo."""
    if not s:
        return (None, None)
    m = COORD_RE.match(str(s))
    if not m:
        return (None, None)
    ns, lat_v, ew, lon_v = m.groups()
    try:
        lat = float(lat_v) * (-1 if ns.upper() == "S" else 1)
        lon = float(lon_v) * (-1 if ew.upper() == "W" else 1)
        return (lat, lon)
    except ValueError:
        return (None, None)


MUSEO_RE = re.compile(r"^\s*([A-Za-z]+)\s*(.+?)\s*$")
NOT_COLLECTED_RE = re.compile(r"^\s*not\s+collected\s*$", re.IGNORECASE)

def parse_museo(s):
    """
    'CJ 12588' / 'QCAZ44870' / 'BMNH 1987.1888' → (acronimo_upper, numero_canonico).
    Limpia anotaciones entre paréntesis y rangos: '26725 (note)' → '26725', '22874-22875' → '22874'.
    None si no parsea.
    """
    if not s:
        return None
    if NOT_COLLECTED_RE.match(str(s)):
        return ("__NOT_COLLECTED__", "")
    m = MUSEO_RE.match(str(s))
    if not m:
        return None
    acron, numero = m.groups()
    numero = numero.strip()
    # Quitar anotaciones entre paréntesis
    numero = re.sub(r"\s*\(.*?\)\s*$", "", numero).strip()
    # Listas con coma: tomar el primer token
    if "," in numero:
        numero = numero.split(",")[0].strip()
    # Rangos con guion: tomar el primer número
    if "-" in numero:
        first = numero.split("-")[0].strip()
        if first and first.replace(".", "").isdigit():
            numero = first
    # Múltiples números o anotaciones separadas por espacio: quedarse con el primer token
    # que parezca número (solo dígitos, opcionalmente con punto)
    if " " in numero:
        for tok in numero.split():
            if tok.replace(".", "").isdigit():
                numero = tok
                break
    return (acron.upper(), numero)


# Acrónimos del Excel que tienen un equivalente real en BD
ACRON_FALLBACKS = {
    "QCAZ": ["QCAZ", "QCAZA"],   # números QCAZ pueden estar como QCAZ o QCAZA
    "QCAS": ["QCAZA"],            # 'QCAS' es typo conocido de 'QCAZA'
}


def to_date(v):
    if v is None or v == "":
        return None
    if isinstance(v, datetime):
        return v.date()
    if isinstance(v, date):
        return v
    return None  # cualquier otra cosa la ignoramos


def to_time(v):
    if v is None or v == "":
        return None
    if isinstance(v, time):
        return v.isoformat()
    if isinstance(v, datetime):
        return v.time().isoformat()
    return None


def to_num(v):
    if v is None:
        return None
    try:
        if isinstance(v, str):
            v = v.replace(",", ".").strip()
            if not v:
                return None
        return float(v)
    except (TypeError, ValueError):
        return None


# --- Lookups ----------------------------------------------------------------

def build_taxon_lookup(sb: Client):
    """
    Devuelve:
      - by_family[familia_lower] = id_taxon
      - by_genus[(familia_lower, genero_lower)] = id_taxon
      - by_species[(familia_lower, genero_lower, especie_lower)] = id_taxon
    """
    rows = []
    page = 0
    while True:
        chunk = sb.table("taxon").select("id_taxon,taxon,taxon_id,rank_id").range(page * 1000, page * 1000 + 999).execute().data
        rows.extend(chunk)
        if len(chunk) < 1000:
            break
        page += 1

    by_id = {r["id_taxon"]: r for r in rows}
    by_family = {}
    by_genus = {}
    by_species = {}

    def parent_chain(t):
        """Sube de un taxon hasta encontrar su familia y genero (si aplica)."""
        fam = gen = None
        cur = t
        for _ in range(10):
            if cur is None:
                break
            if cur["rank_id"] == 5:
                fam = cur["taxon"]
            elif cur["rank_id"] == 6:
                gen = cur["taxon"]
            cur = by_id.get(cur.get("taxon_id"))
        return fam, gen

    for r in rows:
        rank = r["rank_id"]
        name = (r["taxon"] or "").strip()
        if not name:
            continue
        if rank == 5:
            by_family[name.lower()] = r["id_taxon"]
        elif rank == 6:
            fam, _ = parent_chain(by_id.get(r.get("taxon_id")))
            if fam:
                by_genus[(fam.lower(), name.lower())] = r["id_taxon"]
        elif rank == 7:
            fam, gen = parent_chain(by_id.get(r.get("taxon_id")))
            if fam and gen:
                by_species[(fam.lower(), gen.lower(), name.lower())] = r["id_taxon"]

    return by_family, by_genus, by_species


def build_coleccion_lookup(sb: Client, numeros_cj):
    """Para 'CJ ...': lookup por numero_museo (toda la tabla coleccion es CJ)."""
    if not numeros_cj:
        return {}
    out = {}
    nums = list(numeros_cj)
    for i in range(0, len(nums), 50):
        batch = nums[i:i+50]
        rows = (sb.table("coleccion")
                .select("id_coleccion,numero_museo")
                .in_("numero_museo", batch)
                .execute().data)
        for r in rows:
            n = r.get("numero_museo")
            if n and n not in out:
                out[n] = r["id_coleccion"]
    return out


def build_externa_lookup(sb: Client, pares):
    """
    pares: set de tuplas (acronimo_excel, numero).
    Para cada acronimo del Excel se prueban todos los acrónimos equivalentes en BD
    (ver ACRON_FALLBACKS). Devuelve dict[(acronimo_excel, numero)] = id.
    """
    if not pares:
        return {}
    out = {}
    by_acron = defaultdict(set)
    for a, n in pares:
        by_acron[a].add(n)
    for acron, numeros in by_acron.items():
        candidatos = ACRON_FALLBACKS.get(acron, [acron])
        nums = list(numeros)
        for cand in candidatos:
            # Filtrar números aún no resueltos
            pendientes = [n for n in nums if (acron, n) not in out]
            if not pendientes:
                break
            for i in range(0, len(pendientes), 50):
                batch = pendientes[i:i+50]
                rows = (sb.table("coleccion_externa")
                        .select("id,numero_museo")
                        .eq("catalogo_museo", cand)
                        .in_("numero_museo", batch)
                        .execute().data)
                for r in rows:
                    out[(acron, r["numero_museo"])] = r["id"]
    return out


# --- Main -------------------------------------------------------------------

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--commit", action="store_true", help="ejecuta los INSERT (default: dry-run)")
    args = ap.parse_args()

    print(f"📂 Leyendo {EXCEL_PATH}")
    wb = openpyxl.load_workbook(EXCEL_PATH, read_only=True, data_only=True)
    ws = wb[SHEET_NAME]
    rows_iter = ws.iter_rows(min_row=2, values_only=True)

    raw_rows = []
    for r in rows_iter:
        if r is None or all(v is None for v in r):
            continue
        raw_rows.append(r)
    print(f"  → {len(raw_rows)} filas de datos")

    sb = get_client()

    # 1) Recolectar claves para los lookups
    cj_numeros = set()
    externa_pairs = set()
    museo_unparseable = []
    for r in raw_rows:
        m = clean(r[12])
        if not m:
            continue
        parsed = parse_museo(m)
        if parsed is None:
            museo_unparseable.append(m)
            continue
        acron, numero = parsed
        if acron == "__NOT_COLLECTED__":
            continue
        if acron == "CJ":
            cj_numeros.add(numero)
        else:
            externa_pairs.add((acron, numero))

    print("\n🔍 Pre-fetch de lookups…")
    by_family, by_genus, by_species = build_taxon_lookup(sb)
    print(f"  taxon: {len(by_family)} familias / {len(by_genus)} géneros / {len(by_species)} especies")

    cj_lookup = build_coleccion_lookup(sb, cj_numeros)
    print(f"  coleccion (CJ): {len(cj_lookup)}/{len(cj_numeros)} encontrados")

    ext_lookup = build_externa_lookup(sb, externa_pairs)
    print(f"  coleccion_externa: {len(ext_lookup)}/{len(externa_pairs)} encontrados")

    # 2) Preparar registros finales
    records = []
    stats = Counter()

    for r in raw_rows:
        gui_aud         = clean(r[0])
        nombre_archivo  = clean(r[1])
        copyright_      = clean(r[2])
        localidad       = clean(r[3])
        provincia       = clean(r[4])
        pais            = clean(r[5])
        # col 6 "Sitio" se ignora por decisión del usuario
        familia         = clean(r[7])
        genero          = clean(r[8])
        especie         = clean(r[9])
        especies_fondo  = clean(r[10])
        colector        = clean(r[11])
        museo_raw       = clean(r[12])
        serie_campo     = clean(r[13])
        cc              = clean(r[14])
        fecha           = to_date(r[15])
        hora            = to_time(r[16])
        temp_agua       = to_num(r[17])
        temp_aire       = to_num(r[18])
        coord_raw       = clean(r[19])
        elevacion       = to_num(r[20])
        observacion     = clean(r[21])

        latitud, longitud = parse_coords(coord_raw) if coord_raw else (None, None)

        # taxon_id por jerarquía
        taxon_id = None
        if familia and genero and especie:
            taxon_id = by_species.get((familia.lower(), genero.lower(), especie.lower()))
            if taxon_id:
                stats["taxon_especie"] += 1
        if taxon_id is None and familia and genero:
            taxon_id = by_genus.get((familia.lower(), genero.lower()))
            if taxon_id:
                stats["taxon_genero"] += 1
        if taxon_id is None and familia:
            taxon_id = by_family.get(familia.lower())
            if taxon_id:
                stats["taxon_familia"] += 1
        taxon_no_resuelto_msg = None
        if taxon_id is None and (familia or genero or especie):
            stats["taxon_no_resuelto"] += 1
            partes = [p for p in (familia, genero, especie) if p]
            taxon_no_resuelto_msg = f"Taxon '{' '.join(partes)}' no se encontró en taxon"
        if taxon_id is None and not (familia or genero or especie):
            stats["taxon_sin_dato"] += 1

        # museo lookup
        coleccion_id = None
        coleccion_externa_id = None
        observacion_carga = None
        if museo_raw:
            parsed = parse_museo(museo_raw)
            if parsed is None:
                observacion_carga = f"Numero museo '{museo_raw}' no se pudo parsear"
                stats["museo_no_parseable"] += 1
            else:
                acron, numero = parsed
                if acron == "__NOT_COLLECTED__":
                    observacion_carga = "Ejemplar no colectado"
                    stats["museo_no_colectado"] += 1
                elif acron == "CJ":
                    coleccion_id = cj_lookup.get(numero)
                    if coleccion_id:
                        stats["museo_match_coleccion"] += 1
                    else:
                        observacion_carga = f"Numero museo '{museo_raw}' no se encontró en coleccion"
                        stats["museo_no_encontrado"] += 1
                else:
                    coleccion_externa_id = ext_lookup.get((acron, numero))
                    if coleccion_externa_id:
                        stats["museo_match_externa"] += 1
                    else:
                        observacion_carga = f"Numero museo '{museo_raw}' no se encontró en coleccion_externa"
                        stats["museo_no_encontrado"] += 1
        else:
            stats["museo_sin_dato"] += 1

        # Concatenar el mensaje de taxon a observacion_carga si aplica
        if taxon_no_resuelto_msg:
            observacion_carga = (
                f"{observacion_carga}; {taxon_no_resuelto_msg}"
                if observacion_carga else taxon_no_resuelto_msg
            )

        records.append({
            "gui_aud": gui_aud,
            "nombre_archivo": nombre_archivo,
            "copyright": copyright_,
            "localidad": localidad,
            "provincia": provincia,
            "pais": pais,
            "especies_fondo": especies_fondo,
            "colector": colector,
            "serie_campo": serie_campo,
            "cc": cc,
            "fecha": fecha.isoformat() if fecha else None,
            "hora": hora,
            "temp_agua": temp_agua,
            "temp_aire": temp_aire,
            "latitud": latitud,
            "longitud": longitud,
            "elevacion": elevacion,
            "observacion": observacion,
            "taxon_id": taxon_id,
            "coleccion_id": coleccion_id,
            "coleccion_externa_id": coleccion_externa_id,
            "observacion_carga": observacion_carga,
        })

    # 3) Reporte
    print("\n📊 Stats")
    for k in sorted(stats):
        print(f"  {k}: {stats[k]}")
    print(f"  TOTAL filas a insertar: {len(records)}")
    if museo_unparseable:
        print(f"  Museo unparseable (primeros 5): {museo_unparseable[:5]}")

    if not args.commit:
        print("\n✋ Dry-run. Re-ejecutar con --commit para insertar.")
        return

    # 4) Inserción en batches
    print(f"\n🚀 Insertando en lotes de {BATCH_SIZE}…")
    inserted = 0
    for i in range(0, len(records), BATCH_SIZE):
        batch = records[i:i+BATCH_SIZE]
        sb.table("canto").insert(batch).execute()
        inserted += len(batch)
        print(f"  {inserted}/{len(records)}")
    print(f"✅ Insertadas {inserted} filas en canto")


if __name__ == "__main__":
    main()
