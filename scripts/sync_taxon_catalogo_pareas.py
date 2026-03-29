"""
Upsert taxon_catalogo_awe para Áreas Protegidas del Estado (tipo 3) y Privadas (tipo 4)
desde CONSOLIDADO_PAreas_COMP.xlsx.
Inserta pares nuevos; los existentes se dejan intactos.
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

# ── 1. Catálogo tipos 3 y 4 ──────────────────────────────────────────────────
r = sb.table("catalogo_awe").select("id_catalogo_awe, tipo_catalogo_awe_id, nombre") \
      .in_("tipo_catalogo_awe_id", [3, 4]).execute()
cat_by_fold = {fold(row["nombre"]): row["id_catalogo_awe"] for row in r.data}

# Alias explícitos para variantes conocidas Excel → BD
ALIASES = {
    # Áreas de Estado mal nombradas en Excel (Parque Nacional vs Reserva Ecológica)
    fold("Parque Nacional Antisana"):           fold("Reserva Ecológica Antisana"),
    fold("Parque Nacional Cayambe Coca"):       fold("Reserva Ecológica Cayambe Coca"),
    fold("Parque Nacional Cotacachi Cayapas"):  fold("Reserva Ecológica Cotacachi - Cayapas"),
    # Nombre incorrecto / parcial
    fold("Refugio de Vida Silvestre El Zarza"):          fold("Refugio de Vida Silvestre La Zarza"),
    fold("Refugio de Vida Silvestre Pacoche"):            fold("Refugio de Vida Silvestre Marino Costero Pacoche"),
    fold("Refugio de Vida Silvestre Manglares Estuario del Rio Muisne"):
                                               fold("Refugio de Vida Silvestre Manglares Estuario Río Muisne"),
    # Faunística mal escrito como "de Fauna"
    fold("Reserva de Producción de Fauna Chimborazo"): fold("Reserva de Producción Faunística Chimborazo"),
    fold("Reserva de Producción de Fauna Cuyabeno"):   fold("Reserva de Producción Faunística Cuyabeno"),
    # Encoding roto (variantes con bytes corruptos antes de "rea")
    "a\u00e2rea ecologica de conservacion municipal siete iglesias":
                                               fold("Área Ecológica de Conservación Municipal Siete Iglesias"),
    "a\u00e2\x81rea ecologica de conservacion municipal siete iglesias":
                                               fold("Área Ecológica de Conservación Municipal Siete Iglesias"),
    "aa\x81rea ecologica de conservacion municipal siete iglesias":
                                               fold("Área Ecológica de Conservación Municipal Siete Iglesias"),
    # Guion vs espacio en Sumaco
    fold("Parque Nacional Sumaco Napo-Galeras"): fold("Parque Nacional Sumaco Napo Galeras"),
    # Manglares Cayapas Mataje (orden diferente)
    fold("Reserva Ecológica Manglares Cayapas Mataje"): fold("Reserva Ecológica Cayapas - Mataje"),
    # Área Protegida Autónoma: "Desentralizada"+"Coordillera" → "Descentralizada"+"Cordillera"
    "area protegida autonoma desentralizada coordillera oriental del carchi":
                                               fold("Área Protegida Autónoma Descentralizada Cordillera Oriental del Carchi"),
    "area protegida autonoma desentralizada mazan":
                                               fold("Área Protegida Autónoma Descentralizada Mazán"),
    # Tildes / mayúsculas / errores tipográficos menores resueltos por fold()
    # (Yacuri/Yacurí, Condór/Cóndor, Ilinizas/Ilinízas, Cofan/Cofán, etc.)
}

def resolve(nombre):
    f = fold(nombre)
    # Reemplazar primero por alias si existe
    f = ALIASES.get(f, f)
    return cat_by_fold.get(f)

# ── 2. Leer Excel ────────────────────────────────────────────────────────────
path = "/Users/xavieraguas/Documents/Transfer/CONSOLIDADOS/PAreas_COMP_estado/CONSOLIDADO_PAreas_COMP.xlsx"
df = pd.read_excel(path, sheet_name="PAreas_COMP")
df = df.dropna(subset=["taxon_id", "Protected Área"])
df["taxon_id"] = df["taxon_id"].astype(int)

# ── 3. Resolver y construir pares ────────────────────────────────────────────
sin_mapeo = {}
pairs = []
seen = set()

for _, row in df.iterrows():
    tid = int(row["taxon_id"])
    nombre = row["Protected Área"]
    cat_id = resolve(nombre)
    if not cat_id:
        sin_mapeo[nombre] = sin_mapeo.get(nombre, 0) + 1
        continue
    if (tid, cat_id) not in seen:
        seen.add((tid, cat_id))
        pairs.append({"taxon_id": tid, "catalogo_awe_id": cat_id})

if sin_mapeo:
    print("⚠️  Áreas sin mapeo:")
    for k, v in sorted(sin_mapeo.items()):
        print(f"   [{v}x] {k!r}")
else:
    print("✅ Todas las áreas mapeadas")

print(f"\nPares únicos del Excel: {len(pairs)}")

# ── 4. Filtrar los que ya existen en BD ──────────────────────────────────────
cat_ids = list({p["catalogo_awe_id"] for p in pairs})
existing_raw = sb.table("taxon_catalogo_awe").select("taxon_id, catalogo_awe_id") \
                 .in_("catalogo_awe_id", cat_ids).execute()
existing_set = {(row["taxon_id"], row["catalogo_awe_id"]) for row in existing_raw.data}
print(f"Ya existentes en BD: {len(existing_set)}")

to_insert = [p for p in pairs if (p["taxon_id"], p["catalogo_awe_id"]) not in existing_set]
print(f"Nuevos a insertar:   {len(to_insert)}")

# ── 5. Validar taxon_ids ──────────────────────────────────────────────────────
valid_taxa = {row["id_taxon"] for row in sb.table("taxon").select("id_taxon").execute().data}
invalidos = [p["taxon_id"] for p in to_insert if p["taxon_id"] not in valid_taxa]
if invalidos:
    print(f"⚠️  taxon_ids inválidos (omitidos): {sorted(set(invalidos))}")
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
