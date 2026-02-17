#!/usr/bin/env python3
"""
Carga la tabla nombre_comun_vernaculo desde el Excel 'Nombres vernáculos.xlsx'.
- Lee Vernacular Name, Language, Taxon, Source.
- Resuelve taxon: primero a nivel especie; si no existe, a nivel género.
- Si hay varios taxones en una celda (separados por coma), crea un registro por cada uno.
- Mapea Language al catálogo de idiomas (catalogo_awe).
"""
import os
import re
import sys
from pathlib import Path

import pandas as pd
from dotenv import load_dotenv
from supabase import create_client, Client

# Cargar variables de entorno desde la raíz del proyecto
ROOT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(ROOT_DIR / ".env.local")

# Mapeo Language (Excel) -> id_catalogo_awe (catalogo_awe)
# 13 = Desconocido (para idiomas no listados)
LANGUAGE_TO_IDIOMA_ID = {
    "—": 13,
    "–": 13,
    "": 13,
    "african language": 13,
    "kichwa": 2,
    "quichuañol": 3,
    "quechua": 3,
    "swiwiar": 542,
    "shuar": 5,
    "shuar chicham": 542,  # Swiwiar chicham
    "shuar chicham or swiwiar chicham": 542,
    "tsáfiqui": 543,
    "wao terero": 544,
    "español": 1,
    "inglés": 8,
    "english": 8,
}


def normalizar_texto(s: str) -> str:
    if s is None or (isinstance(s, float) and pd.isna(s)):
        return ""
    return str(s).strip()


def normalizar_taxon(s: str) -> str:
    """Quita espacios extra y normaliza para búsqueda."""
    s = normalizar_texto(s)
    # Un solo espacio entre palabras
    s = re.sub(r"\s+", " ", s)
    return s


def obtener_idioma_id(language: str) -> int | None:
    """Mapea el valor de Language del Excel a catalogo_awe_idioma_id."""
    key = normalizar_texto(language).lower()
    return LANGUAGE_TO_IDIOMA_ID.get(key, 13)


def cargar_mapas_taxon(supabase: Client) -> tuple[dict[str, int], dict[str, int]]:
    """Carga mapa especie (nombre_cientifico -> id_taxon) y género (nombre -> id_taxon)."""
    # Especies desde vw_lista_especies
    r = supabase.table("vw_lista_especies").select("nombre_cientifico, id_taxon").execute()
    especies = {}
    for row in r.data:
        nc = row.get("nombre_cientifico")
        if nc:
            especies[normalizar_taxon(nc).lower()] = row["id_taxon"]

    # Géneros desde taxon (rank_id = 6)
    r = supabase.table("taxon").select("id_taxon, taxon").eq("rank_id", 6).execute()
    generos = {}
    for row in r.data:
        g = normalizar_texto(row.get("taxon") or "").lower()
        if g:
            generos[g] = row["id_taxon"]

    return especies, generos


def resolver_taxon(
    taxon_str: str,
    especies: dict[str, int],
    generos: dict[str, int],
) -> int | None:
    """
    Resuelve un nombre de taxon (ej. 'Rhaebo blombergi' o 'Pristimantis') a id_taxon.
    Primero intenta como especie; si no hay coincidencia, como género.
    """
    taxon_str = normalizar_taxon(taxon_str)
    if not taxon_str or taxon_str in ("–", "—", "nan"):
        return None
    key = taxon_str.lower()
    if key in especies:
        return especies[key]
    if key in generos:
        return generos[key]
    if key == "pritimantis" and "pristimantis" in generos:
        return generos["pristimantis"]
    return None


TAXONES_IGNORAR = {"anura", "gymnophiona", "caudata"}


def procesar_fila(
    row: pd.Series,
    name_col: str,
    lang_col: str,
    taxon_col: str,
    source_col: str,
    especies: dict[str, int],
    generos: dict[str, int],
) -> tuple[list[dict], int, int]:
    """Procesa una fila del Excel; devuelve (lista de registros, omitidos_taxon, omitidos_idioma)."""
    registros = []
    omitidos_taxon = 0
    omitidos_idioma = 0

    nombre = normalizar_texto(row.get(name_col))
    if not nombre:
        return [], 0, 0

    language = normalizar_texto(row.get(lang_col))
    idioma_id = obtener_idioma_id(language)
    if idioma_id is None:
        omitidos_idioma = 1
        return [], 0, omitidos_idioma

    fuente = normalizar_texto(row.get(source_col))
    if pd.isna(fuente) or fuente == "nan":
        fuente = None

    taxon_celda = normalizar_texto(row.get(taxon_col))
    if not taxon_celda or taxon_celda in ("–", "—", "nan"):
        return [], 1, 0

    partes = [normalizar_taxon(p) for p in taxon_celda.split(",")]
    for parte in partes:
        if not parte or parte.lower() in TAXONES_IGNORAR:
            continue
        taxon_id = resolver_taxon(parte, especies, generos)
        if taxon_id is None:
            omitidos_taxon += 1
            continue
        registros.append({
            "nombre": nombre,
            "catalogo_awe_idioma_id": idioma_id,
            "taxon_id": taxon_id,
            "fuente": fuente,
        })

    return registros, omitidos_taxon, omitidos_idioma


def main() -> None:
    excel_path = ROOT_DIR / "Nombres vernáculos.xlsx"
    if not excel_path.exists():
        print(f"❌ No se encontró el archivo: {excel_path}")
        sys.exit(1)

    supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not supabase_url or not supabase_key:
        print("❌ Variables de entorno NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY requeridas")
        sys.exit(1)

    supabase: Client = create_client(supabase_url, supabase_key)

    print("📖 Leyendo Excel...")
    df = pd.read_excel(excel_path, sheet_name=0, engine="openpyxl")
    # Asegurar nombres de columnas
    cols = {c.strip(): c for c in df.columns}
    name_col = cols.get("Vernacular Name") or "Vernacular Name"
    lang_col = cols.get("Language") or "Language"
    taxon_col = cols.get("Taxon") or "Taxon"
    source_col = cols.get("Source") or "Source"

    print("🔍 Cargando mapas de taxón (especies y géneros)...")
    especies, generos = cargar_mapas_taxon(supabase)
    print(f"   Especies: {len(especies)}, Géneros: {len(generos)}")

    registros: list[dict] = []
    omitidos_taxon = 0
    omitidos_idioma = 0

    for idx, row in df.iterrows():
        lote, ot, oi = procesar_fila(
            row, name_col, lang_col, taxon_col, source_col, especies, generos
        )
        registros.extend(lote)
        omitidos_taxon += ot
        omitidos_idioma += oi

    print(f"📋 Registros a insertar: {len(registros)} (omitidos por taxón/idioma: {omitidos_taxon}/{omitidos_idioma})")

    if not registros:
        print("⚠️ No hay registros para insertar.")
        return

    # Insertar en lotes (Supabase suele aceptar hasta ~1000 por request)
    BATCH = 100
    insertados = 0
    for i in range(0, len(registros), BATCH):
        lote = registros[i : i + BATCH]
        try:
            supabase.table("nombre_comun_vernaculo").insert(lote).execute()
            insertados += len(lote)
            print(f"   Insertados {insertados}/{len(registros)}")
        except Exception as e:
            print(f"❌ Error insertando lote {i // BATCH + 1}: {e}")
            raise

    print(f"✅ Listo. Insertados {insertados} registros en nombre_comun_vernaculo.")


if __name__ == "__main__":
    main()
