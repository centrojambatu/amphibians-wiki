"""
Upsert taxon_catalogo_awe para Bosques Protegidos (tipo_catalogo_awe_id = 23)
desde CONSOLIDADO_PForest_COMP.xlsx.
Solo inserta pares nuevos; los existentes se dejan intactos.
"""
import unicodedata
import os
import pandas as pd
from dotenv import load_dotenv

load_dotenv("/Users/xavieraguas/Documents/GitHub/Centro Jambatu/amphibians-wiki/.env.local")
from supabase import create_client

sb = create_client(os.environ["NEXT_PUBLIC_SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"])

def fold(s):
    s = unicodedata.normalize("NFD", str(s).strip())
    return "".join(c for c in s if unicodedata.category(c) != "Mn").lower()

# ── 1. Catálogo tipo 23 ──────────────────────────────────────────────────────
r = sb.table("catalogo_awe").select("id_catalogo_awe, nombre") \
      .eq("tipo_catalogo_awe_id", 23).execute()
cat_by_fold = {fold(row["nombre"]): row["id_catalogo_awe"] for row in r.data}

# Alias explícitos para variantes conocidas
ALIASES = {
    # Sabalito: renombrado de "Centro Chachi Sabalito"
    fold("Centro Chachi Sabalito"): fold("Sabalito"),
    # Typo: "Cuencua" → "Cuenca"
    fold("Cuencua del río Malacatos en Loja"): fold("Cuenca del Rio Malacatos en Loja"),
    # Casacay en tipo 23 fue eliminado; no existe en este catálogo → se ignora
}

def resolve(nombre):
    f = fold(nombre)
    f = ALIASES.get(f, f)
    return cat_by_fold.get(f)

# ── 2. Leer Excel ────────────────────────────────────────────────────────────
path = "/Users/xavieraguas/Documents/Transfer/CONSOLIDADOS/PForest_COMP_/CONSOLIDADO_PForest_COMP.xlsx"
df = pd.read_excel(path, sheet_name="PForest_COMP")
df = df.dropna(subset=["taxon_id", "Protected Forest"])
df["taxon_id"] = df["taxon_id"].astype(int)

# ── 3. Resolver y construir pares ────────────────────────────────────────────
sin_mapeo = {}
pairs = []
seen = set()

for _, row in df.iterrows():
    tid = int(row["taxon_id"])
    nombre = row["Protected Forest"]
    cat_id = resolve(nombre)
    if not cat_id:
        sin_mapeo[nombre] = sin_mapeo.get(nombre, 0) + 1
        continue
    if (tid, cat_id) not in seen:
        seen.add((tid, cat_id))
        pairs.append({"taxon_id": tid, "catalogo_awe_id": cat_id})

if sin_mapeo:
    print(f"⚠️  Nombres sin mapeo ({len(sin_mapeo)} únicos):")
    for k, v in sorted(sin_mapeo.items()):
        print(f"   [{v:3d}x] {k!r}")
else:
    print("✅ Todos los bosques mapeados")

print(f"\nPares únicos del Excel: {len(pairs)}")

# ── 4. Filtrar existentes ────────────────────────────────────────────────────
cat_ids = list({p["catalogo_awe_id"] for p in pairs})
existing_raw = sb.table("taxon_catalogo_awe").select("taxon_id, catalogo_awe_id") \
                 .in_("catalogo_awe_id", cat_ids).execute()
existing_set = {(row["taxon_id"], row["catalogo_awe_id"]) for row in existing_raw.data}
print(f"Ya existentes en BD: {len(existing_set)}")

to_insert = [p for p in pairs if (p["taxon_id"], p["catalogo_awe_id"]) not in existing_set]
print(f"Nuevos a insertar:   {len(to_insert)}")

# ── 5. Validar taxon_ids ──────────────────────────────────────────────────────
valid_taxa = {row["id_taxon"] for row in sb.table("taxon").select("id_taxon").execute().data}
invalidos = sorted({p["taxon_id"] for p in to_insert if p["taxon_id"] not in valid_taxa})
if invalidos:
    print(f"⚠️  taxon_ids inválidos (omitidos): {invalidos}")
    to_insert = [p for p in to_insert if p["taxon_id"] in valid_taxa]

# ── 6. Insertar ───────────────────────────────────────────────────────────────
if not to_insert:
    print("\nNada nuevo que insertar.")
else:
    print(f"\nInsertando {len(to_insert)} registros nuevos...")
    CHUNK = 400
    inserted = 0
    for i in range(0, len(to_insert), CHUNK):
        chunk = to_insert[i:i+CHUNK]
        resp = sb.table("taxon_catalogo_awe").insert(chunk).execute()
        inserted += len(resp.data)
        print(f"  chunk {i//CHUNK+1}: {len(resp.data)} insertados")
    print(f"\nTotal insertados: {inserted}")

print("\n✅ Proceso completado")
