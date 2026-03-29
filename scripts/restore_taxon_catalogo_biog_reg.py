"""
Restaura los 834 registros del CSV de respaldo en taxon_catalogo_awe,
mapeando Categoria → observación. Solo inserta los que no existan ya.
"""
import os
import pandas as pd
from dotenv import load_dotenv

load_dotenv("/Users/xavieraguas/Documents/GitHub/Centro Jambatu/amphibians-wiki/.env.local")
from supabase import create_client

sb = create_client(os.environ["NEXT_PUBLIC_SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"])

# 1. Leer CSV
df = pd.read_csv("/Users/xavieraguas/Desktop/TaxonCatalogoaweRegionBiogeografica_202603281938.csv")
df = df.rename(columns={
    "Taxon_IdTaxon": "taxon_id",
    "Catalogoawe_IdCatalogoawe": "catalogo_awe_id",
    "Categoria": "observacion"
})
df["taxon_id"] = df["taxon_id"].astype(int)
df["catalogo_awe_id"] = df["catalogo_awe_id"].astype(int)
print(f"CSV: {len(df)} registros | categorías: {df['observacion'].value_counts().to_dict()}")

# 2. Obtener registros ya existentes en taxon_catalogo_awe para esos catalogo_awe_ids
cat_ids = sorted(df["catalogo_awe_id"].unique().tolist())
print(f"Catálogos a restaurar: {cat_ids}")

existing = sb.table("taxon_catalogo_awe").select("taxon_id, catalogo_awe_id") \
    .in_("catalogo_awe_id", cat_ids).execute()

existing_set = {(row["taxon_id"], row["catalogo_awe_id"]) for row in existing.data}
print(f"Ya existentes en BD: {len(existing_set)}")

# 2b. Obtener taxon_ids válidos en la BD
all_taxa = sb.table("taxon").select("id_taxon").execute()
valid_taxa = {row["id_taxon"] for row in all_taxa.data}
invalid = [tid for tid in df["taxon_id"].unique() if tid not in valid_taxa]
if invalid:
    print(f"⚠️  taxon_ids del CSV no encontrados en BD (se omitirán): {sorted(invalid)}")
    df = df[df["taxon_id"].isin(valid_taxa)]
    print(f"Registros válidos tras filtro: {len(df)}")

# 3. Filtrar solo los que faltan
to_insert = [
    {"taxon_id": int(row.taxon_id), "catalogo_awe_id": int(row.catalogo_awe_id), "observación": row.observacion}
    for row in df.itertuples()
    if (int(row.taxon_id), int(row.catalogo_awe_id)) not in existing_set
]
print(f"A insertar: {len(to_insert)}")

if not to_insert:
    print("Nada que insertar, los datos ya están en la BD.")
else:
    # 4. Insertar en chunks
    CHUNK = 400
    inserted = 0
    for i in range(0, len(to_insert), CHUNK):
        chunk = to_insert[i:i+CHUNK]
        resp = sb.table("taxon_catalogo_awe").insert(chunk).execute()
        inserted += len(resp.data)
        print(f"  chunk {i//CHUNK+1}: {len(resp.data)} insertados")
    print(f"\nTotal restaurados: {inserted}")
    print("✅ Restauración completada")
