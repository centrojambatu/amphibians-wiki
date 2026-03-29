"""
Carga taxon_catalogo_awe para Reservas de la Biósfera (tipo_catalogo_awe_id = 22)
desde CONSOLIDADO_Bios_COMP.xlsx.
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

# 1. Catálogo tipo 22 de la BD
r = sb.table("catalogo_awe").select("id_catalogo_awe, nombre").eq("tipo_catalogo_awe_id", 22).execute()
cat_by_fold = {fold(row["nombre"]): row["id_catalogo_awe"] for row in r.data}
print("Reservas en BD (tipo 22):")
for k, v in sorted(cat_by_fold.items()):
    print(f"  [{v}] {k}")

# 2. Leer Excel
path = "/Users/xavieraguas/Documents/Transfer/CONSOLIDADOS/Bios_COMP_/CONSOLIDADO_Bios_COMP.xlsx"
df = pd.read_excel(path, sheet_name="Bios_COMP")
df = df.dropna(subset=["taxon_id", "Reserva de la Biósfera"])
df["taxon_id"] = df["taxon_id"].astype(int)
print(f"\nExcel: {len(df)} filas | {df['taxon_id'].nunique()} taxones únicos")

# 3. Mapear nombres a catalogo_awe_id
sin_mapeo = []
pairs = []
seen = set()
for _, row in df.iterrows():
    tid = int(row["taxon_id"])
    nombre = row["Reserva de la Biósfera"]
    cat_id = cat_by_fold.get(fold(nombre))
    if not cat_id:
        sin_mapeo.append(nombre)
        continue
    if (tid, cat_id) not in seen:
        seen.add((tid, cat_id))
        pairs.append({"taxon_id": tid, "catalogo_awe_id": cat_id})

if sin_mapeo:
    print(f"⚠️  Sin mapeo: {set(sin_mapeo)}")
else:
    print("✅ Todas las reservas mapeadas correctamente")

print(f"Pares únicos a insertar: {len(pairs)}")

# 4. Verificar taxon_ids válidos
all_taxa = {row["id_taxon"] for row in sb.table("taxon").select("id_taxon").execute().data}
invalidos = [p["taxon_id"] for p in pairs if p["taxon_id"] not in all_taxa]
if invalidos:
    print(f"⚠️  taxon_ids no encontrados (se omitirán): {sorted(set(invalidos))}")
    pairs = [p for p in pairs if p["taxon_id"] in all_taxa]

# 5. Insertar
print(f"\nInsertando {len(pairs)} registros...")
CHUNK = 400
inserted = 0
for i in range(0, len(pairs), CHUNK):
    chunk = pairs[i:i+CHUNK]
    resp = sb.table("taxon_catalogo_awe").insert(chunk).execute()
    inserted += len(resp.data)
    print(f"  chunk {i//CHUNK+1}: {len(resp.data)} insertados")

print(f"\nTotal insertados: {inserted}")
print("✅ Carga completada")
