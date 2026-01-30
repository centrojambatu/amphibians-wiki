#!/usr/bin/env python3
"""
Script para actualizar rangos altitudinales en ficha_especie desde un archivo Excel
"""
import pandas as pd
import os
import sys
from supabase import create_client, Client
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv('.env.local')

def main():
    # Configurar cliente de Supabase
    supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

    if not supabase_url or not supabase_key:
        print("❌ Error: Variables de entorno NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY no encontradas")
        sys.exit(1)

    supabase: Client = create_client(supabase_url, supabase_key)

    # Leer el archivo Excel
    excel_path = "AnfibiosEcuador a 26 Noviembre 2025. Actualizado de Coloma Duellman 2025.xlsx"

    if not os.path.exists(excel_path):
        print(f"❌ Error: No se encontró el archivo {excel_path}")
        sys.exit(1)

    print(f"📖 Leyendo archivo Excel: {excel_path}")
    df = pd.read_excel(excel_path)

    # Mostrar columnas disponibles para identificar las correctas
    print("\n📋 Columnas disponibles en el Excel:")
    for i, col in enumerate(df.columns):
        print(f"  {i}: {col}")

    # Buscar columnas relevantes (pueden tener diferentes nombres)
    nombre_col = None
    alt_min_col = None
    alt_max_col = None

    # Buscar columna de nombre científico
    posibles_nombres = ['species', 'nombre científico', 'nombre_cientifico', 'taxon', 'especie', 'Nombre científico', 'Especie']
    for col in df.columns:
        col_lower = str(col).lower().strip()
        if any(nombre.lower() in col_lower for nombre in posibles_nombres):
            nombre_col = col
            break

    # Buscar columnas de altitud (incluyendo "Minim altitude" con typo)
    posibles_alt_min = ['minim altitude', 'min altitude', 'altitud min', 'altitud_min', 'rango_altitudinal_min', 'alt min', 'min altitud', 'min_altitud']
    posibles_alt_max = ['max altitude', 'altitud max', 'altitud_max', 'rango_altitudinal_max', 'alt max', 'max altitud', 'max_altitud']

    for col in df.columns:
        col_lower = str(col).lower().strip()
        if not alt_min_col and any(alt in col_lower for alt in posibles_alt_min):
            alt_min_col = col
        if not alt_max_col and any(alt in col_lower for alt in posibles_alt_max):
            alt_max_col = col

    print(f"\n🔍 Columnas identificadas:")
    print(f"  Nombre científico: {nombre_col}")
    print(f"  Altitud mínima: {alt_min_col}")
    print(f"  Altitud máxima: {alt_max_col}")

    if not nombre_col:
        print("\n❌ Error: No se pudo identificar la columna de nombre científico")
        print("Por favor, verifica las columnas del Excel")
        sys.exit(1)

    if not alt_min_col or not alt_max_col:
        print("\n⚠️  Advertencia: No se encontraron columnas de altitud")
        print("Mostrando primeras filas para revisión:")
        print(df.head())
        sys.exit(1)

    # Limpiar datos y procesar
    df_clean = df[[nombre_col, alt_min_col, alt_max_col]].copy()
    df_clean = df_clean.dropna(subset=[nombre_col])  # Eliminar filas sin nombre

    # Limpiar valores de altitud (convertir a numérico, manejar NaN)
    df_clean[alt_min_col] = pd.to_numeric(df_clean[alt_min_col], errors='coerce')
    df_clean[alt_max_col] = pd.to_numeric(df_clean[alt_max_col], errors='coerce')

    # Eliminar filas donde ambas altitudes sean NaN
    df_clean = df_clean.dropna(subset=[alt_min_col, alt_max_col], how='all')

    print(f"\n📊 Total de registros a procesar: {len(df_clean)}")

    # Obtener todas las especies de la base de datos
    print("\n🔍 Obteniendo especies de la base de datos...")
    response = supabase.table('taxon').select('id_taxon, taxon').eq('rank_id', 7).execute()

    if not response.data:
        print("❌ Error: No se pudieron obtener las especies de la base de datos")
        sys.exit(1)

    # Crear mapa de nombre científico -> id_taxon
    taxon_map = {}
    for taxon in response.data:
        nombre = str(taxon['taxon']).strip()
        taxon_map[nombre] = taxon['id_taxon']

    print(f"✅ Se encontraron {len(taxon_map)} especies en la base de datos")

    # Procesar cada fila del Excel
    actualizados = 0
    no_encontrados = []
    errores = []

    print("\n🔄 Procesando actualizaciones...")

    for idx, row in df_clean.iterrows():
        nombre_cientifico = str(row[nombre_col]).strip()
        alt_min = row[alt_min_col] if pd.notna(row[alt_min_col]) else None
        alt_max = row[alt_max_col] if pd.notna(row[alt_max_col]) else None

        # Buscar en el mapa
        if nombre_cientifico not in taxon_map:
            no_encontrados.append(nombre_cientifico)
            continue

        taxon_id = taxon_map[nombre_cientifico]

        # Actualizar en ficha_especie
        try:
            # Primero obtener el id_ficha_especie
            ficha_response = supabase.table('ficha_especie').select('id_ficha_especie').eq('taxon_id', taxon_id).execute()

            if not ficha_response.data or len(ficha_response.data) == 0:
                no_encontrados.append(f"{nombre_cientifico} (sin ficha_especie)")
                continue

            id_ficha_especie = ficha_response.data[0]['id_ficha_especie']

            # Preparar datos de actualización
            update_data = {}
            if alt_min is not None:
                update_data['rango_altitudinal_min'] = int(alt_min)
            if alt_max is not None:
                update_data['rango_altitudinal_max'] = int(alt_max)

            if not update_data:
                continue

            # Actualizar
            update_response = supabase.table('ficha_especie').update(update_data).eq('id_ficha_especie', id_ficha_especie).execute()

            if update_response.data:
                actualizados += 1
                print(f"  ✅ {nombre_cientifico}: min={alt_min}, max={alt_max}")
            else:
                errores.append(nombre_cientifico)

        except Exception as e:
            errores.append(f"{nombre_cientifico}: {str(e)}")
            print(f"  ❌ Error actualizando {nombre_cientifico}: {str(e)}")

    # Resumen
    print(f"\n📊 Resumen:")
    print(f"  ✅ Actualizados: {actualizados}")
    print(f"  ⚠️  No encontrados: {len(no_encontrados)}")
    print(f"  ❌ Errores: {len(errores)}")

    if no_encontrados:
        print(f"\n⚠️  Especies no encontradas (primeras 10):")
        for nombre in no_encontrados[:10]:
            print(f"    - {nombre}")

    if errores:
        print(f"\n❌ Errores:")
        for error in errores[:10]:
            print(f"    - {error}")

if __name__ == "__main__":
    main()

