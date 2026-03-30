"""
Sincroniza taxon_catalogo_awe para ecosistemas (tipo_catalogo_awe_id = 21)
desde CONSOLIDADO_Ecos_COMP_CORREGIDO.xlsx.
- Match exacto → fuzzy (85%) → crear nuevo en catálogo
"""
import unicodedata, re, os
import pandas as pd
from dotenv import load_dotenv
from rapidfuzz import process as rf_process, fuzz

load_dotenv("/Users/xavieraguas/Documents/GitHub/Centro Jambatu/amphibians-wiki/.env.local")
from supabase import create_client

sb = create_client(os.environ["NEXT_PUBLIC_SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"])

FUZZY_THRESHOLD = 85   # % mínimo para aceptar un match fuzzy

def fold(s):
    s = unicodedata.normalize("NFD", str(s).strip())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"\s+", " ", s).lower()

# ── 1. Leer Excel ─────────────────────────────────────────────────────────────
EXCEL = "/Users/xavieraguas/Documents/Transfer/CONSOLIDADOS/Ecos_COMP_FALTA/CONSOLIDADO_Ecos_COMP_CORREGIDO.xlsx"
raw2 = pd.read_excel(EXCEL, sheet_name=0, header=0)
traducciones = raw2.iloc[1].to_dict()   # col_english → nombre_español

NON_ECO = {"Order", "Family", "Species name", "TOTAL", "taxon_id"}
eco_col_to_spanish = {}
for col, trad in traducciones.items():
    if col not in NON_ECO and isinstance(trad, str) and trad.strip():
        eco_col_to_spanish[col] = trad.strip()

print(f"Ecosistemas en Excel: {len(eco_col_to_spanish)}")

# ── 2. Cargar catálogo tipo 21 ─────────────────────────────────────────────────
ca_rows = sb.table("catalogo_awe") \
            .select("id_catalogo_awe, nombre") \
            .eq("tipo_catalogo_awe_id", 21).execute().data

catalog_fold  = {fold(r["nombre"]): r["id_catalogo_awe"] for r in ca_rows}
catalog_list  = [(fold(r["nombre"]), r["id_catalogo_awe"], r["nombre"]) for r in ca_rows]
print(f"Ecosistemas en catálogo: {len(ca_rows)}")

# ── 3. Mapeo: exacto → fuzzy → nuevo ──────────────────────────────────────────
eco_map   = {}      # col_english → id_catalogo_awe  (final)
new_ecos  = []      # [(col_english, nombre_español)] → crear en catálogo
fuzzy_log = []      # [(col_english, spa_excel, cat_name, score, cat_id)]
exact_log = []      # [(col_english, spa_excel, cat_id)]

for col_eng, nombre_spa in eco_col_to_spanish.items():
    fn = fold(nombre_spa)
    # 3a. Match exacto
    if fn in catalog_fold:
        cid = catalog_fold[fn]
        eco_map[col_eng] = cid
        exact_log.append((col_eng, nombre_spa, cid))
        continue
    # 3b. Fuzzy match
    names_only = [c[0] for c in catalog_list]
    result = rf_process.extractOne(fn, names_only, scorer=fuzz.token_sort_ratio,
                                   score_cutoff=FUZZY_THRESHOLD)
    if result:
        matched_fn, score, idx = result
        cid = catalog_list[idx][1]
        cat_name = catalog_list[idx][2]
        eco_map[col_eng] = cid
        fuzzy_log.append((col_eng, nombre_spa, cat_name, score, cid))
    else:
        new_ecos.append((col_eng, nombre_spa))

print(f"\n── Matches exactos: {len(exact_log)}")
print(f"── Matches fuzzy:   {len(fuzzy_log)}")
print(f"── Ecosistemas NUEVOS a crear: {len(new_ecos)}")

if fuzzy_log:
    print("\nMatches fuzzy (revisa que sean correctos):")
    for _, spa, cat, score, cid in sorted(fuzzy_log, key=lambda x: x[3]):
        print(f"  [{score:3.0f}%] Excel: {spa!r}")
        print(f"         Catálogo (id={cid}): {cat!r}")

if new_ecos:
    print("\nEcosistemas nuevos a insertar en catálogo:")
    for _, spa in new_ecos:
        print(f"  {spa!r}")

# ── 4. Crear ecosistemas faltantes en catalogo_awe ───────────────────────────
if new_ecos:
    print(f"\nInsertando {len(new_ecos)} nuevos ecosistemas en catalogo_awe...")
    new_rows = [{"nombre": spa, "tipo_catalogo_awe_id": 21} for _, spa in new_ecos]
    resp = sb.table("catalogo_awe").insert(new_rows).execute()
    created = resp.data
    for i, row in enumerate(created):
        col_eng = new_ecos[i][0]
        eco_map[col_eng] = row["id_catalogo_awe"]
        print(f"  Creado: {row['nombre']!r} → id={row['id_catalogo_awe']}")

print(f"\nTotal ecosistemas mapeados: {len(eco_map)} / {len(eco_col_to_spanish)}")

# ── 5. Leer datos (taxon_id × ecosistemas) ────────────────────────────────────
print("\nLeyendo combinaciones del Excel...")
df_data = raw2.iloc[2:].copy()  # filas de datos (skip filas 0 y 1 que son headers)
df_data = df_data.dropna(subset=["taxon_id"])
df_data["taxon_id"] = df_data["taxon_id"].astype(int)

# Columnas de ecosistema presentes en el Excel (que hayamos mapeado)
eco_cols = [c for c in eco_col_to_spanish.keys() if c in eco_map and c in df_data.columns]

combos = set()
for _, row in df_data.iterrows():
    tid = row["taxon_id"]
    for col in eco_cols:
        val = row.get(col)
        if isinstance(val, str) and val.strip().upper() == "X":
            combos.add((int(tid), int(eco_map[col])))

print(f"Combinaciones únicas en Excel: {len(combos)}")

# ── 6. Cargar combinaciones existentes ────────────────────────────────────────
print("Cargando combinaciones existentes en taxon_catalogo_awe (tipo 21)...")
# Obtener todos los catalogo_awe_id de tipo 21
all_eco_ids = list({v for v in eco_map.values()})
existing = set()
PAGE = 1000
offset = 0
while True:
    batch = sb.table("taxon_catalogo_awe") \
              .select("taxon_id, catalogo_awe_id") \
              .in_("catalogo_awe_id", all_eco_ids) \
              .range(offset, offset + PAGE - 1).execute().data
    for r in batch:
        existing.add((r["taxon_id"], r["catalogo_awe_id"]))
    if len(batch) < PAGE:
        break
    offset += PAGE
print(f"  {len(existing)} ya existentes")

new_combos = sorted(combos - existing)
print(f"  {len(new_combos)} combinaciones nuevas a insertar")

# ── 7. Insertar combinaciones ─────────────────────────────────────────────────
if new_combos:
    CHUNK = 500
    ok, errors = 0, []
    for i in range(0, len(new_combos), CHUNK):
        chunk = new_combos[i:i+CHUNK]
        rows = [{"taxon_id": tid, "catalogo_awe_id": caid} for tid, caid in chunk]
        try:
            sb.table("taxon_catalogo_awe").insert(rows).execute()
            ok += len(chunk)
            print(f"  Chunk {i//CHUNK+1}: {len(chunk)} insertados (acumulado {ok})")
        except Exception as e:
            errors.append((i, str(e)))
            print(f"  Chunk {i//CHUNK+1}: ERROR → {e}")
    if errors:
        for e in errors:
            print(f"  ERROR: {e}")

# ── 8. Verificación final ──────────────────────────────────────────────────────
total = sb.table("taxon_catalogo_awe") \
          .select("id_taxon_catalogo_awe", count="exact") \
          .in_("catalogo_awe_id", all_eco_ids).execute()
print(f"\n✅ taxon_catalogo_awe (ecosistemas): {total.count} registros en total")
