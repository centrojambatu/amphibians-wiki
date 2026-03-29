"""
Crea/actualiza combinaciones en coleccion_externa_catalogo_awe desde consolidacion.xlsx.
Estrategia de matching (en orden de prioridad):
  1. Alias explícito
  2. Match exacto por nombre normalizado (fold)
  3. Fuzzy match con rapidfuzz (fallback, threshold configurable)

Columnas:
  PAreas_nam     → tipo_catalogo_awe_id 3 y 4   (áreas protegidas estado/privado)
  PForest_nombre → tipo_catalogo_awe_id 23 (+4)  (bosques protegidos)
  ComAreas_nombre→ tipo_catalogo_awe_id 23        (áreas comunitarias)
  Bios_nombre    → tipo_catalogo_awe_id 22        (reservas biósfera)
"""
import unicodedata, re, os, json
import pandas as pd
from dotenv import load_dotenv
from rapidfuzz import process as rf_process, fuzz

load_dotenv("/Users/xavieraguas/Documents/GitHub/Centro Jambatu/amphibians-wiki/.env.local")
from supabase import create_client

sb = create_client(os.environ["NEXT_PUBLIC_SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"])

# ── Thresholds de confianza ────────────────────────────────────────────────────
THRESHOLD_PAREAS  = 82   # nombres cortos/abreviados: un poco más estricto
THRESHOLD_TIPO23  = 84   # bosques y áreas comunitarias
THRESHOLD_BIOS    = 90   # solo 6 reservas → alta confianza requerida

# ── Normalización ─────────────────────────────────────────────────────────────
def fold(s):
    s = unicodedata.normalize("NFD", str(s).strip())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = re.sub(r"[\u2018\u2019\u201a\u201b\u2032\u2035'`\"']", "", s)
    s = re.sub(r'\s+', ' ', s)
    s = re.sub(r'\s*-\s*', '-', s)
    return s.lower()

# ── Aliases explícitos PAreas_nam → id_catalogo_awe ───────────────────────────
PAREAS_ALIASES = {
    "antisana":                          58,
    "arenillas":                         59,
    "bellavista":                        560,
    "cajas":                             33,
    "candelaria":                        561,
    "cayambe coca":                      60,
    "cerro plateado":                    219,
    "chimborazo":                        53,
    "cofan bermejo":                     62,
    "colonso chalupas":                  533,
    "coordillera oriental del carchi":   536,
    "cordillera oriental del carchi":    536,
    "cotacachi cayapas":                 63,
    "cotopaxi":                          34,
    "cuyabeno":                          54,
    "el angel":                          64,
    "el condor":                         32,
    "el quimi":                          50,
    "el zarza":                          42,
    "la bonita":                         534,
    "la chiquita":                       44,
    "la zarza":                          42,
    "limoncocha":                        51,
    "llanganates":                       36,
    "los ilinizas":                      65,
    "machalilla":                        37,
    "mache chindul":                     66,
    "manglares cayapas mataje":          61,
    "manglares churute":                 67,
    "manglares estuario del rio muisne": 47,
    "marcos perez de castilla":          538,
    "mazan":                             537,
    "neblina norte":                     539,
    "pacoche":                           48,
    "parque lago":                       31,
    "pasochoa":                          49,
    "podocarpus":                        38,
    "pululahua":                         68,
    "rio negro sopladora":               531,
    "samama mumbes":                     532,
    "sangay":                            39,
    "siete iglesias":                    535,
    "sumaco napo-galeras":               40,
    "sumaco napo galeras":               40,
    "yacuri":                            217,
    "yasuni":                            41,
    "zunag":                             562,
    "zuaag":                             562,
}

BIOS_ALIASES = {
    "rb bosque seco":          437,
    "rb choco andino":         432,
    "rb macizo del cajas":     433,
    "rb podocarpus el condor": 434,
    "rb sumaco":               435,
    "rb yasuni":               436,
}

PFOREST_ALIASES = {
    "casacay": 318,
}

# ── Cargar catálogo ───────────────────────────────────────────────────────────
print("Cargando catalogo_awe...")
ca_rows = sb.table("catalogo_awe") \
            .select("id_catalogo_awe, nombre, tipo_catalogo_awe_id") \
            .in_("tipo_catalogo_awe_id", [3, 4, 22, 23]) \
            .execute().data

catalog_by_tipo = {}      # tipo → {fold_name → id}
candidates_by_tipo = {}   # tipo → [(fold_name, id), ...] para fuzzy

for row in ca_rows:
    t = row["tipo_catalogo_awe_id"]
    fn = fold(row["nombre"])
    cid = row["id_catalogo_awe"]
    if t not in catalog_by_tipo:
        catalog_by_tipo[t] = {}
        candidates_by_tipo[t] = []
    if fn not in catalog_by_tipo[t]:
        catalog_by_tipo[t][fn] = cid
        candidates_by_tipo[t].append((fn, cid))

# Lookup + candidatos tipos 3+4 juntos para PAreas_nam
catalog_34 = {}
candidates_34 = []
for row in ca_rows:
    if row["tipo_catalogo_awe_id"] in (3, 4):
        fn = fold(row["nombre"])
        cid = row["id_catalogo_awe"]
        if fn not in catalog_34:
            catalog_34[fn] = cid
            candidates_34.append((fn, cid))

# Versiones "sin prefijo" para fuzzy PAreas (nombre corto del área)
PREFIXES_3_4 = [
    "parque nacional", "reserva ecologica", "reserva de produccion faunistica",
    "reserva biologica", "refugio de vida silvestre", "reserva geobotanica",
    "area nacional de recreacion", "area de conservacion y uso sustentable",
    "area ecologica de conservacion municipal",
    "area protegida autonoma descentralizada",
    "area protegida comunitaria", "area protegida privada",
    "reserva de vida silvestre", "bosque protector",
]
short_to_id_34 = {}
for fn, cid in candidates_34:
    short = fn
    for pref in PREFIXES_3_4:
        if short.startswith(pref + " "):
            short = short[len(pref):].strip()
            break
    if short and short not in short_to_id_34:
        short_to_id_34[short] = cid

candidates_34_short = list(short_to_id_34.items())   # [(short_name, id), ...]

# ── Helpers de fuzzy ─────────────────────────────────────────────────────────
def fuzzy_match(query_fold, candidates, threshold):
    """Devuelve (id, score, matched_name) o (None, 0, None)."""
    if not candidates:
        return None, 0, None
    names = [c[0] for c in candidates]
    result = rf_process.extractOne(
        query_fold, names,
        scorer=fuzz.token_sort_ratio,
        score_cutoff=threshold
    )
    if result is None:
        return None, 0, None
    matched_name, score, idx = result
    return candidates[idx][1], score, matched_name

# ── Funciones de búsqueda con fallback fuzzy ──────────────────────────────────
fuzzy_log = []   # [(col, excel_val, matched_name, score, cid)]

def find_pareas(raw):
    fn = fold(raw)
    if fn in PAREAS_ALIASES:
        return PAREAS_ALIASES[fn], "alias", None
    if fn in catalog_34:
        return catalog_34[fn], "exact", None
    for f_cat, cid in catalog_34.items():
        short = f_cat
        for pref in PREFIXES_3_4:
            if short.startswith(pref + " "):
                short = short[len(pref):].strip()
                break
        if short == fn or fn in f_cat:
            return cid, "partial", None
    # Fuzzy: buscar sobre nombres cortos (sin prefijo) primero
    cid, score, mname = fuzzy_match(fn, candidates_34_short, THRESHOLD_PAREAS)
    if cid:
        return cid, "fuzzy", (score, mname)
    # Fuzzy sobre nombre completo
    cid, score, mname = fuzzy_match(fn, candidates_34, THRESHOLD_PAREAS)
    return cid, "fuzzy", (score, mname) if cid else (None, "none", None)

def find_tipo23(raw):
    fn = fold(raw)
    if fn in PFOREST_ALIASES:
        return PFOREST_ALIASES[fn], "alias", None
    t23 = catalog_by_tipo.get(23, {})
    if fn in t23:
        return t23[fn], "exact", None
    t4 = catalog_by_tipo.get(4, {})
    if fn in t4:
        return t4[fn], "exact-t4", None
    for f_cat, cid in t23.items():
        if len(fn) > 5 and (fn in f_cat or f_cat in fn):
            return cid, "partial", None
    # Fuzzy tipo 23
    cid, score, mname = fuzzy_match(fn, candidates_by_tipo.get(23, []), THRESHOLD_TIPO23)
    return (cid, "fuzzy", (score, mname)) if cid else (None, "none", None)

def find_bios(raw):
    fn = fold(raw)
    if fn in BIOS_ALIASES:
        return BIOS_ALIASES[fn], "alias", None
    t22 = catalog_by_tipo.get(22, {})
    if fn in t22:
        return t22[fn], "exact", None
    cid, score, mname = fuzzy_match(fn, candidates_by_tipo.get(22, []), THRESHOLD_BIOS)
    return (cid, "fuzzy", (score, mname)) if cid else (None, "none", None)

# ── Leer Excel ────────────────────────────────────────────────────────────────
print("Leyendo consolidacion.xlsx...")
df = pd.read_excel(
    "/Users/xavieraguas/Documents/GitHub/Centro Jambatu/amphibians-wiki/consolidacion.xlsx",
    sheet_name=0,
    usecols=["registro_id", "PAreas_nam", "PForest_nombre", "ComAreas_nombre", "Bios_nombre"]
)
df = df.dropna(subset=["registro_id"])
df["registro_id"] = df["registro_id"].astype(int)
print(f"  {len(df)} filas con registro_id")

# ── Construir pares únicos ────────────────────────────────────────────────────
combos      = set()
combos_meta = {}   # (ceid, caid) → method
sin_match   = {"PAreas_nam": {}, "PForest_nombre": {}, "ComAreas_nombre": {}, "Bios_nombre": {}}

COL_FUNCS = [
    ("PAreas_nam",      find_pareas),
    ("PForest_nombre",  find_tipo23),
    ("ComAreas_nombre", find_tipo23),
    ("Bios_nombre",     find_bios),
]

for _, row in df.iterrows():
    reg_id = row["registro_id"]
    for col, fn_search in COL_FUNCS:
        val = row.get(col)
        if not isinstance(val, str) or not val.strip():
            continue
        val = val.strip()
        cid, method, extra = fn_search(val)
        if cid:
            key = (int(reg_id), int(cid))
            combos.add(key)
            if method == "fuzzy" and key not in combos_meta:
                score, mname = extra if extra else (0, "?")
                fuzzy_log.append((col, val, mname, score, cid))
            if key not in combos_meta:
                combos_meta[key] = method
        else:
            sin_match[col][val] = sin_match[col].get(val, 0) + 1

# ── Reporte ───────────────────────────────────────────────────────────────────
by_method = {}
for m in combos_meta.values():
    by_method[m] = by_method.get(m, 0) + 1

print(f"\n{'='*55}")
print(f"  Total combinaciones únicas:  {len(combos)}")
print(f"  Por método:")
for m, n in sorted(by_method.items()):
    print(f"    {m:15s} {n:6d}")

if fuzzy_log:
    # Deduplicar por (val, mname) para el reporte
    seen_fuzzy = set()
    print(f"\n── Matches via fuzzy ({len(set((f[1],f[2]) for f in fuzzy_log))} pares únicos) ──")
    for col, val, mname, score, cid in sorted(fuzzy_log, key=lambda x: -x[3]):
        key = (val, mname)
        if key in seen_fuzzy:
            continue
        seen_fuzzy.add(key)
        print(f"  [{score:3.0f}%] {col}: {val!r}\n         → {mname!r} (id={cid})")

print(f"\n── Sin match ──")
has_miss = False
for col, miss in sin_match.items():
    if miss:
        has_miss = True
        print(f"\n  {col}:")
        for k, v in sorted(miss.items(), key=lambda x: -x[1]):
            print(f"    [{v:5d}] {k!r}")
if not has_miss:
    print("  (ninguno)")

# ── Cargar combos existentes y calcular nuevas ────────────────────────────────
print("\nCargando combinaciones existentes en BD...")
existing = set()
PAGE = 1000
offset = 0
while True:
    batch = sb.table("coleccion_externa_catalogo_awe") \
              .select("coleccion_externa_id, catalogo_awe_id") \
              .range(offset, offset + PAGE - 1).execute().data
    for r in batch:
        existing.add((r["coleccion_externa_id"], r["catalogo_awe_id"]))
    if len(batch) < PAGE:
        break
    offset += PAGE
print(f"  {len(existing)} combinaciones ya existentes")

new_combos = sorted(combos - existing)
print(f"  {len(new_combos)} combinaciones nuevas a insertar")

# ── Insertar nuevas combinaciones ─────────────────────────────────────────────
if new_combos:
    CHUNK = 500
    ok, errors = 0, []
    for i in range(0, len(new_combos), CHUNK):
        chunk = new_combos[i:i+CHUNK]
        rows = [{"coleccion_externa_id": ceid, "catalogo_awe_id": caid} for ceid, caid in chunk]
        try:
            sb.table("coleccion_externa_catalogo_awe").insert(rows).execute()
            ok += len(chunk)
            print(f"  Chunk {i//CHUNK+1}: {len(chunk)} insertados (acumulado {ok})")
        except Exception as e:
            errors.append((i, str(e)))
            print(f"  Chunk {i//CHUNK+1}: ERROR → {e}")
    print(f"\nInsertados: {ok}")
    if errors:
        for e in errors:
            print(f"  ERROR: {e}")
else:
    print("  No hay registros nuevos que insertar.")

final = sb.table("coleccion_externa_catalogo_awe").select("id", count="exact").execute()
print(f"\n✅ coleccion_externa_catalogo_awe total: {final.count} registros")
