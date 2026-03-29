"""
Rellena ficha_especie.publicacion_id usando Call References del Excel de anfibios.
Estrategia:
  - Para cada especie del Excel, toma el PRIMER Call Reference.
  - Parsea autor + año(s) y busca en la tabla publicacion.
  - Actualiza ficha_especie.publicacion_id donde haya match.
"""
import re
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

def parse_first_ref(raw):
    """Devuelve (first_author_fold, [years]) del primer item antes de ';'."""
    if not isinstance(raw, str):
        return None, []
    first = raw.split(";")[0].strip()
    skip = {"non-described", "brief notes in account", "see remarks in account"}
    if fold(first) in skip or "this publication" in first.lower():
        return None, []
    years_raw = re.findall(r'\b(\d{4}[a-z]?)\b', first)
    years = []
    for y in years_raw:
        try:
            years.append(int(y[:4]))
        except ValueError:
            pass
    author_part = re.split(r'\(|\d{4}', first)[0].strip()
    # Tomar solo el primer apellido (primer token) como clave del autor
    first_word = re.split(r'[\s,]', author_part)[0].strip().strip('.')
    if not first_word:
        return None, []
    return fold(first_word), years

# ── 1. Publicaciones: lookup (fold_author, year) → id_publicacion ─────────
print("Cargando publicaciones...")
pub_rows = []
PAGE = 1000
offset = 0
while True:
    batch = sb.table("publicacion").select("id_publicacion, cita, cita_corta") \
              .range(offset, offset + PAGE - 1).execute().data
    pub_rows.extend(batch)
    if len(batch) < PAGE:
        break
    offset += PAGE
print(f"  {len(pub_rows)} publicaciones")

pub_lookup = {}
for row in pub_rows:
    pub_id = row["id_publicacion"]
    # Intentar cita_corta primero (más estándar: "(Autor et al. YYYY)" o "Autor, Autor2 (YYYY)")
    for cita_src in [row.get("cita_corta") or "", row.get("cita") or ""]:
        cita_src = cita_src.strip().lstrip("(")
        if not cita_src:
            continue
        # Extraer todos los años de 4 dígitos
        years_in = [int(y) for y in re.findall(r'\b(\d{4})\b', cita_src)]
        if not years_in:
            continue
        # Primer token (antes de espacio o coma) = primer autor
        first_token = re.split(r'[\s,]', cita_src)[0].strip()
        if not first_token:
            continue
        author_key = fold(first_token)
        for yr in years_in:
            key = (author_key, yr)
            if key not in pub_lookup:
                pub_lookup[key] = pub_id
        break  # con la primera fuente que funcione es suficiente

print(f"  Lookup: {len(pub_lookup)} claves (autor, año)")

# ── 2. Nombres de especie → taxon_id ──────────────────────────────────────
print("\nCargando especies...")
view_rows = sb.table("vw_ficha_especie_completa").select("especie_taxon_id, nombre_cientifico").execute().data
species_to_tid = {fold(r["nombre_cientifico"]): r["especie_taxon_id"]
                  for r in view_rows if r.get("nombre_cientifico")}
print(f"  {len(species_to_tid)} especies en BD")

# ── 3. Leer Excel ─────────────────────────────────────────────────────────────
path = "/Users/xavieraguas/Documents/GitHub/Centro Jambatu/amphibians-wiki/AnfibiosEcuador a 26 Noviembre 2025. Actualizado de Coloma Duellman 2025.xlsx"
df = pd.read_excel(path, sheet_name="Appendix II Suppl 1")
df = df.dropna(subset=["Species"])

# ── 4. Cruzar ─────────────────────────────────────────────────────────────────
updates     = []   # (taxon_id, publicacion_id)
sin_especie = []
skip_ref    = []
sin_pub     = {}

for _, row in df.iterrows():
    species_raw = str(row.get("Species", "")).strip()
    ref_raw     = row.get("Call References", "")

    tid = species_to_tid.get(fold(species_raw))
    if not tid:
        sin_especie.append(species_raw)
        continue

    author, years = parse_first_ref(ref_raw)
    if not author:
        skip_ref.append((species_raw, str(ref_raw)))
        continue

    pub_id = None
    for yr in years:
        pub_id = pub_lookup.get((author, yr))
        if pub_id:
            break
    # Fallback: si el autor tiene guion (ej. "Arteaga-Navarro"), probar con la primera parte
    if not pub_id and '-' in author:
        short_author = author.split('-')[0]
        for yr in years:
            pub_id = pub_lookup.get((short_author, yr))
            if pub_id:
                break

    if not pub_id:
        sin_pub[str(ref_raw)] = sin_pub.get(str(ref_raw), 0) + 1
    else:
        updates.append((tid, pub_id))

print(f"\nResultados análisis:")
print(f"  Especies no encontradas:          {len(sin_especie)}")
if sin_especie:
    for s in sin_especie[:5]:
        print(f"    - {s!r}")
print(f"  Refs omitidas (non-described…):   {len(skip_ref)}")
print(f"  Refs sin match en publicaciones:  {len(sin_pub)}")
if sin_pub:
    print("  Sin match (top 20):")
    for k, v in sorted(sin_pub.items(), key=lambda x: -x[1])[:20]:
        print(f"    [{v:3d}x] {k!r}")
print(f"  Updates a aplicar:                {len(updates)}")

# ── 5. Aplicar updates ───────────────────────────────────────────────────────
if updates:
    print(f"\nActualizando {len(updates)} fichas...")
    ok, errors = 0, []
    for tid, pub_id in updates:
        try:
            resp = sb.table("ficha_especie") \
                     .update({"publicacion_id": pub_id}) \
                     .eq("taxon_id", tid) \
                     .execute()
            ok += 1
        except Exception as e:
            errors.append((tid, pub_id, str(e)))
    print(f"  Actualizadas: {ok}")
    if errors:
        print(f"  Errores: {len(errors)}")
        for e in errors[:5]:
            print(f"    {e}")
    print("\n✅ Completado")

# ── 6. Verificación final ────────────────────────────────────────────────────
result = sb.table("ficha_especie").select("publicacion_id", count="exact") \
           .not_.is_("publicacion_id", "null").execute()
print(f"\nfichas_especie con publicacion_id: {result.count}")
