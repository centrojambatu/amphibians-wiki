#!/usr/bin/env python3
"""
Carga nombres comunes en múltiples idiomas desde 'nombres_anfibios_idiomas.xlsx' a la tabla nombre_comun.
- El ID del Excel corresponde a id_nombre_comun del nombre en inglés (ya existente).
- Para cada idioma, crea un nuevo registro en nombre_comun con el mismo taxon_id.
- Idiomas: Alemán, Francés, Portugués, Chino Mandarín, Italiano, Hindú, Árabe, Ruso, Japonés, Holandés.
"""
import os
import sys
from pathlib import Path

import pandas as pd
from dotenv import load_dotenv
from supabase import create_client, Client

ROOT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(ROOT_DIR / ".env.local")

# Mapeo columna Excel -> catalogo_awe_idioma_id
COLUMNA_TO_IDIOMA_ID = {
    "Alemán 🇩🇪": 9,
    "Francés 🇫🇷": 10,
    "Portugués 🇧🇷": 11,
    "Chino Mandarín 🇨🇳": 545,
    "Italiano 🇮🇹": 546,
    "Hindú 🇮🇳": 547,
    "Árabe 🇸🇦": 548,
    "Ruso 🇷🇺": 549,
    "Japonés 🇯🇵": 550,
    "Holandés 🇳🇱": 551,
}


def normalizar_texto(valor) -> str | None:
    """Normaliza texto del Excel."""
    if pd.isna(valor):
        return None
    s = str(valor).strip()
    if not s or s.lower() in ("nan", "none", ""):
        return None
    return s


def main() -> None:
    excel_path = ROOT_DIR / "nombres_anfibios_idiomas.xlsx"
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
    id_col = "ID"
    if id_col not in df.columns:
        print(f"❌ Columna '{id_col}' no encontrada")
        sys.exit(1)

    # Obtener todos los IDs del Excel y buscar sus taxon_id
    ids_excel = df[id_col].dropna().astype(int).unique().tolist()
    print(f"🔍 Obteniendo taxon_id para {len(ids_excel)} nombres en inglés...")

    # Obtener taxon_id desde nombre_comun (inglés, idioma_id=8)
    response = (
        supabase.table("nombre_comun")
        .select("id_nombre_comun, taxon_id")
        .eq("catalogo_awe_idioma_id", 8)
        .in_("id_nombre_comun", ids_excel)
        .execute()
    )

    # Mapa: id_nombre_comun -> taxon_id
    id_to_taxon: dict[int, int] = {}
    for row in response.data:
        taxon_id = row.get("taxon_id")
        if taxon_id:
            id_to_taxon[row["id_nombre_comun"]] = taxon_id

    print(f"✅ Encontrados {len(id_to_taxon)} taxon_id válidos")

    # Preparar registros a insertar
    registros: list[dict] = []
    omitidos_sin_taxon = 0
    omitidos_sin_nombre = 0

    for idx, row in df.iterrows():
        id_nombre_comun = row.get(id_col)
        if pd.isna(id_nombre_comun):
            continue

        id_nombre_comun = int(id_nombre_comun)
        taxon_id = id_to_taxon.get(id_nombre_comun)

        if not taxon_id:
            omitidos_sin_taxon += 1
            continue

        # Procesar cada idioma
        for col_excel, idioma_id in COLUMNA_TO_IDIOMA_ID.items():
            if col_excel not in df.columns:
                continue

            nombre = normalizar_texto(row.get(col_excel))
            if not nombre:
                omitidos_sin_nombre += 1
                continue

            registros.append({
                "nombre": nombre,
                "catalogo_awe_idioma_id": idioma_id,
                "taxon_id": taxon_id,
                "principal": True,  # Los nombres en cada idioma son principales
            })

    print(f"📋 Registros a insertar: {len(registros)}")
    print(f"   Omitidos (sin taxon_id): {omitidos_sin_taxon}")
    print(f"   Omitidos (sin nombre): {omitidos_sin_nombre}")

    if not registros:
        print("⚠️ No hay registros para insertar.")
        return

    # Insertar en lotes
    BATCH = 100
    insertados = 0
    for i in range(0, len(registros), BATCH):
        lote = registros[i : i + BATCH]
        try:
            supabase.table("nombre_comun").insert(lote).execute()
            insertados += len(lote)
            print(f"   Insertados {insertados}/{len(registros)}")
        except Exception as e:
            print(f"❌ Error insertando lote {i // BATCH + 1}: {e}")
            raise

    print(f"✅ Listo. Insertados {insertados} registros en nombre_comun.")


if __name__ == "__main__":
    main()
