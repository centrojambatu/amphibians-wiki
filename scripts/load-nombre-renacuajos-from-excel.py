#!/usr/bin/env python3
"""
Carga la tabla nombre_renacuajos desde el Excel 'nombre_renacuajos.xlsx'.
- Lee Name y Language.
- Mapea Language al catálogo de idiomas (catalogo_awe).
- Como no hay taxon_id en el Excel, se deja como NULL (los nombres son genéricos para renacuajos).
"""
import os
import sys
from pathlib import Path

import pandas as pd
from dotenv import load_dotenv
from supabase import create_client, Client

ROOT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(ROOT_DIR / ".env.local")

# Mapeo Language (Excel) -> id_catalogo_awe
# 13 = Desconocido (para idiomas no encontrados)
LANGUAGE_TO_IDIOMA_ID = {
    "a'ingae (= cofán)": 18,  # Cofán
    "a'ingae (= cofán)": 18,  # Variante con mayúscula
    "awap'it": 13,  # Desconocido (no existe en catálogo)
    "kichwa amazónico": 552,
    "kichwa amazónico (quijos)": 553,
    "kichwa sierra": 554,
    "palta": 555,
    "shuar chicham or swiwiar chicham": 542,  # Swiwiar chicham
    "spanish": 1,  # Español
    "tsáfiki": 543,  # Tsáfiqui
    "tsáfiqui": 543,  # Variante
}


def normalizar_texto(s: str) -> str:
    if s is None or (isinstance(s, float) and pd.isna(s)):
        return ""
    return str(s).strip()


def obtener_idioma_id(language: str) -> int:
    """Mapea el valor de Language del Excel a catalogo_awe_idioma_id."""
    key = normalizar_texto(language).lower()
    # Manejar casos especiales con caracteres especiales
    if "a'ingae" in key or "cofán" in key:
        return 18  # Cofán
    if "awap" in key:
        return 13  # Desconocido (no existe en catálogo)
    return LANGUAGE_TO_IDIOMA_ID.get(key, 13)  # 13 = Desconocido


def main() -> None:
    excel_path = ROOT_DIR / "nombre_renacuajos.xlsx"
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

    # Verificar columnas
    name_col = "Name"
    lang_col = "Language"

    if name_col not in df.columns or lang_col not in df.columns:
        print(f"❌ Columnas requeridas no encontradas. Esperadas: {name_col}, {lang_col}")
        sys.exit(1)

    registros: list[dict] = []
    omitidos_idioma = 0

    for idx, row in df.iterrows():
        nombre = normalizar_texto(row.get(name_col))
        if not nombre:
            continue

        language = normalizar_texto(row.get(lang_col))
        idioma_id = obtener_idioma_id(language)

        # Si hay múltiples nombres separados por coma, crear un registro por cada uno
        nombres = [normalizar_texto(n) for n in nombre.split(",")]

        for nombre_individual in nombres:
            if not nombre_individual:
                continue

            registros.append({
                "nombre": nombre_individual,
                "catalogo_awe_idioma_id": idioma_id,
                "taxon_id": None,  # No hay taxon_id en el Excel (nombres genéricos)
                "publicacion_id": None,
            })

    print(f"📋 Registros a insertar: {len(registros)}")
    print(f"   Omitidos por idioma: {omitidos_idioma}")

    if not registros:
        print("⚠️ No hay registros para insertar.")
        return

    # Insertar en lotes
    BATCH = 100
    insertados = 0
    for i in range(0, len(registros), BATCH):
        lote = registros[i : i + BATCH]
        try:
            supabase.table("nombre_renacuajos").insert(lote).execute()
            insertados += len(lote)
            print(f"   Insertados {insertados}/{len(registros)}")
        except Exception as e:
            print(f"❌ Error insertando lote {i // BATCH + 1}: {e}")
            raise

    print(f"✅ Listo. Insertados {insertados} registros en nombre_renacuajos.")


if __name__ == "__main__":
    main()
