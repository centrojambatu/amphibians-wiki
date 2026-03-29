"""
Sincroniza taxon_catalogo_awe (tipo_catalogo_awe_id=6) con CONSOLIDADO_BiogReg_COMP.xlsx.
- Elimina registros actuales de tipo 6 para los taxon_ids del Excel.
- Inserta los nuevos registros según las "X" del Excel.
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

# ── 1. Cargar catálogo tipo 6 de la BD ──────────────────────────────────────
r = sb.table("catalogo_awe").select("id_catalogo_awe, nombre").eq("tipo_catalogo_awe_id", 6).execute()
cat_by_fold = {fold(row["nombre"]): row["id_catalogo_awe"] for row in r.data}
print(f"Regiones en BD (tipo 6): {len(cat_by_fold)}")
for k, v in sorted(cat_by_fold.items()):
    print(f"  [{v}] {k}")

# ── 2. Leer Excel ────────────────────────────────────────────────────────────
path = "/Users/xavieraguas/Documents/Transfer/CONSOLIDADOS/BiogReg_COMP/CONSOLIDADO_BiogReg_COMP.xlsx"
df = pd.read_excel(path, sheet_name="BiogReg_COMP")

# Fila 0 es abreviaciones → la saltamos
df = df.iloc[1:].reset_index(drop=True)
df = df.dropna(subset=["taxon_id"])
df["taxon_id"] = df["taxon_id"].astype(int)

# Columnas de regiones = todo excepto metadatos
META_COLS = {"Order", "Family", "Species name", "TOTAL", "taxon_id"}
region_cols = [c for c in df.columns if c not in META_COLS]
print(f"\nColumnas de región en Excel: {len(region_cols)}")

# Verificar que todas las regiones del Excel existen en la BD
missing = [c for c in region_cols if fold(c) not in cat_by_fold]
if missing:
    print(f"⚠️  Regiones no encontradas en BD: {missing}")
else:
    print("✅ Todas las regiones del Excel están en la BD")

# ── 3. Construir pares (taxon_id, catalogo_awe_id) ──────────────────────────
pairs = []
for _, row in df.iterrows():
    tid = int(row["taxon_id"])
    for col in region_cols:
        val = row[col]
        if pd.notna(val) and str(val).strip().upper() == "X":
            gid = cat_by_fold.get(fold(col))
            if gid:
                pairs.append((tid, gid))

taxa_ids = sorted({tid for tid, _ in pairs})
print(f"\nPares (taxon_id, región): {len(pairs)} | Taxones: {len(taxa_ids)}")

# ── 4. Obtener catalogo_awe_ids tipo 6 para el DELETE ───────────────────────
cat_ids_tipo6 = [row["id_catalogo_awe"] for row in r.data]

# ── 5. Borrar registros actuales tipo 6 para los taxon_ids del Excel ─────────
print("\nBorrando registros existentes tipo 6 para los taxones del Excel...")
CHUNK = 100
deleted = 0
for i in range(0, len(taxa_ids), CHUNK):
    chunk = taxa_ids[i:i+CHUNK]
    resp = (sb.table("taxon_catalogo_awe")
              .delete()
              .in_("taxon_id", chunk)
              .in_("catalogo_awe_id", cat_ids_tipo6)
              .execute())
    deleted += len(resp.data)
    print(f"  chunk {i//CHUNK+1}: {len(resp.data)} eliminados")

print(f"Total eliminados: {deleted}")

# ── 6. Insertar nuevos registros ─────────────────────────────────────────────
print("\nInsertando nuevas filas...")
rows_ins = [{"taxon_id": tid, "catalogo_awe_id": gid} for tid, gid in pairs]

INS = 400
inserted = 0
for i in range(0, len(rows_ins), INS):
    chunk = rows_ins[i:i+INS]
    resp = sb.table("taxon_catalogo_awe").insert(chunk).execute()
    inserted += len(resp.data)
    print(f"  chunk {i//INS+1}: {len(resp.data)} insertados")

print(f"\nTotal insertados: {inserted}")
print("✅ Sincronización completada")
