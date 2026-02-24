#!/usr/bin/env python3
"""
Carga la tabla nombre_comun_vernaculo desde el Excel 'vernaculos.xlsx' (o 'Nombres vernáculos.xlsx').
- Lee Vernacular Name, Language, Taxon, Source.
- Resuelve taxon en todos los niveles: especie, género, familia y orden.
- Si hay varios taxones en una celda (separados por coma), crea un registro por cada uno.
- Incluye nombres sin taxón: si Taxon está vacío o no se resuelve, se inserta con taxon_id NULL.
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
    "shuar chicham | swiwiar chicham": 542,  # variante con pipe (Excel)
    "swiwiar chicham | shuar chicham": 542,
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
    s = re.sub(r"\s+", " ", s)
    return s


def obtener_idioma_id(language: str) -> int:
    """Mapea el valor de Language del Excel a catalogo_awe_idioma_id. Siempre devuelve un id (13 si no está)."""
    key = normalizar_texto(language).lower()
    return LANGUAGE_TO_IDIOMA_ID.get(key, 13)


def cargar_mapa_taxon_completo(supabase: Client) -> dict[str, int]:
    """
    Carga un único mapa nombre_normalizado -> id_taxon para todos los niveles:
    orden (rank_id=4), familia (5), género (6), especie (7).
    Para especies se usa nombre completo desde vw_lista_especies; para el resto, el campo taxon.
    """
    mapa: dict[str, int] = {}

    # Especies: nombre científico completo (género + especie)
    r = supabase.table("vw_lista_especies").select("nombre_cientifico, id_taxon").execute()
    for row in r.data or []:
        nc = row.get("nombre_cientifico")
        if nc:
            key = normalizar_taxon(nc).lower()
            if key:
                mapa[key] = row["id_taxon"]

    # Órdenes (rank_id = 4)
    r = supabase.table("taxon").select("id_taxon, taxon").eq("rank_id", 4).execute()
    for row in r.data or []:
        t = normalizar_texto(row.get("taxon") or "").lower()
        if t:
            mapa[t] = row["id_taxon"]

    # Familias (rank_id = 5)
    r = supabase.table("taxon").select("id_taxon, taxon").eq("rank_id", 5).execute()
    for row in r.data or []:
        t = normalizar_texto(row.get("taxon") or "").lower()
        if t:
            mapa[t] = row["id_taxon"]

    # Géneros (rank_id = 6)
    r = supabase.table("taxon").select("id_taxon, taxon").eq("rank_id", 6).execute()
    for row in r.data or []:
        t = normalizar_texto(row.get("taxon") or "").lower()
        if t:
            mapa[t] = row["id_taxon"]

    # Corrección typo común
    if "pritimantis" not in mapa and "pristimantis" in mapa:
        mapa["pritimantis"] = mapa["pristimantis"]

    return mapa


def resolver_taxon(taxon_str: str, mapa: dict[str, int]) -> int | None:
    """
    Resuelve un nombre de taxon a id_taxon (cualquier nivel: orden, familia, género, especie).
    """
    taxon_str = normalizar_taxon(taxon_str)
    if not taxon_str or taxon_str in ("–", "—", "nan"):
        return None
    key = taxon_str.lower()
    return mapa.get(key)


# Nombres de órdenes que no son taxones útiles (evitar duplicados con nombres comunes)
TAXONES_IGNORAR = {"anura", "gymnophiona", "caudata"}


def procesar_fila(
    row: pd.Series,
    name_col: str,
    lang_col: str,
    taxon_col: str,
    mapa_taxon: dict[str, int],
) -> list[dict]:
    """
    Procesa una fila del Excel. Devuelve lista de registros a insertar.
    - Si no hay taxón o no se resuelve: se incluye un registro con taxon_id None.
    - Si hay varios taxones (separados por coma): un registro por cada uno resuelto y uno con null si alguno no resuelve.
    """
    registros: list[dict] = []

    nombre = normalizar_texto(row.get(name_col))
    if not nombre:
        return []

    language = normalizar_texto(row.get(lang_col))
    idioma_id = obtener_idioma_id(language)

    taxon_celda = normalizar_texto(row.get(taxon_col))

    # Sin taxón en la celda: un registro con taxon_id NULL
    if not taxon_celda or taxon_celda in ("–", "—", "nan"):
        registros.append({
            "nombre": nombre,
            "catalogo_awe_idioma_id": idioma_id,
            "taxon_id": None,
        })
        return registros

    partes = [normalizar_taxon(p) for p in taxon_celda.split(",")]
    alguno_sin_resolver = False

    for parte in partes:
        if not parte or parte.lower() in TAXONES_IGNORAR:
            continue
        taxon_id = resolver_taxon(parte, mapa_taxon)
        if taxon_id is not None:
            registros.append({
                "nombre": nombre,
                "catalogo_awe_idioma_id": idioma_id,
                "taxon_id": taxon_id,
            })
        else:
            alguno_sin_resolver = True

    # Si hubo algún taxón no resuelto (o solo había ignorados), subir igual el nombre con taxon_id NULL
    if alguno_sin_resolver or not registros:
        registros.append({
            "nombre": nombre,
            "catalogo_awe_idioma_id": idioma_id,
            "taxon_id": None,
        })

    return registros


def main() -> None:
    # Probar primero vernaculos.xlsx, luego Nombres vernáculos.xlsx
    for nombre_archivo in ("vernaculos.xlsx", "Nombres vernáculos.xlsx"):
        excel_path = ROOT_DIR / nombre_archivo
        if excel_path.exists():
            break
    else:
        print("❌ No se encontró ninguno de: vernaculos.xlsx, Nombres vernáculos.xlsx")
        sys.exit(1)

    supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not supabase_url or not supabase_key:
        print("❌ Variables de entorno NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY requeridas")
        sys.exit(1)

    supabase: Client = create_client(supabase_url, supabase_key)

    print(f"📖 Leyendo Excel: {excel_path.name}...")
    df = pd.read_excel(excel_path, sheet_name=0, engine="openpyxl")
    cols = {c.strip(): c for c in df.columns}
    name_col = cols.get("Vernacular Name") or "Vernacular Name"
    lang_col = cols.get("Language") or "Language"
    taxon_col = cols.get("Taxon") or "Taxon"

    print("🔍 Cargando mapa de taxones (orden, familia, género, especie)...")
    mapa_taxon = cargar_mapa_taxon_completo(supabase)
    print(f"   Total de taxones cargados: {len(mapa_taxon)}")

    registros: list[dict] = []
    for idx, row in df.iterrows():
        registros.extend(
            procesar_fila(row, name_col, lang_col, taxon_col, mapa_taxon)
        )

    con_taxon = sum(1 for r in registros if r.get("taxon_id") is not None)
    sin_taxon = len(registros) - con_taxon
    print(f"📋 Registros a insertar: {len(registros)} (con taxón: {con_taxon}, sin taxón: {sin_taxon})")

    if not registros:
        print("⚠️ No hay registros para insertar.")
        return

    # Vaciar tabla antes de volver a cargar (recarga completa)
    print("🗑️ Vaciendo tabla nombre_comun_vernaculo...")
    try:
        # Supabase/PostgREST: eliminar en lotes o todo (según políticas RLS)
        del_res = supabase.table("nombre_comun_vernaculo").delete().neq("id", 0).execute()
        print("   Tabla vaciada.")
    except Exception as e:
        print(f"⚠️ No se pudo vaciar la tabla (¿RLS?): {e}")
        print("   Continuando con la inserción (pueden quedar duplicados si ya había datos).")

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
