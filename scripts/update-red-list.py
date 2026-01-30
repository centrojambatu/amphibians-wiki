#!/usr/bin/env python3
"""
Script para actualizar la Lista Roja UICN en taxon_catalogo_awe desde un archivo Excel
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

    # Identificar columnas
    species_col = None
    red_list_col = None

    for col in df.columns:
        col_lower = str(col).lower().strip()
        if 'species' in col_lower and not species_col:
            species_col = col
        if 'red list' in col_lower or 'redlist' in col_lower or 'lista roja' in col_lower:
            red_list_col = col

    print(f"\n🔍 Columnas identificadas:")
    print(f"  Species: {species_col}")
    print(f"  Red List: {red_list_col}")

    if not species_col:
        print("❌ Error: No se encontró la columna 'Species'")
        sys.exit(1)

    if not red_list_col:
        print("❌ Error: No se encontró la columna de Red List")
        sys.exit(1)

    # Obtener catálogos de Lista Roja UICN
    print("\n🔍 Obteniendo catálogos de Lista Roja UICN...")
    catalogo_response = supabase.table('catalogo_awe').select('id_catalogo_awe, nombre, sigla').eq('tipo_catalogo_awe_id', 10).execute()

    if not catalogo_response.data:
        print("❌ Error: No se pudieron obtener los catálogos de Lista Roja UICN")
        sys.exit(1)

    # Crear mapa de sigla/nombre -> id_catalogo_awe
    catalogo_map = {}
    print("\n📋 Catálogos disponibles:")
    for cat in catalogo_response.data:
        sigla = str(cat['sigla']).strip().upper() if cat['sigla'] else None
        nombre = str(cat['nombre']).strip()
        id_cat = cat['id_catalogo_awe']

        # Mapear por sigla
        if sigla:
            catalogo_map[sigla] = id_cat
        # También mapear por nombre (normalizado)
        nombre_upper = nombre.upper()
        catalogo_map[nombre_upper] = id_cat

        print(f"  {sigla or 'N/A'}: {nombre} (ID: {id_cat})")

    # Limpiar datos del Excel
    df_clean = df[[species_col, red_list_col]].copy()
    df_clean = df_clean.dropna(subset=[species_col])  # Eliminar filas sin especie

    # Limpiar valores de Red List
    df_clean[red_list_col] = df_clean[red_list_col].astype(str).str.strip()

    print(f"\n📊 Total de registros a procesar: {len(df_clean)}")

    # Mostrar valores únicos de Red List para entender el formato
    valores_red_list = df_clean[red_list_col].unique()
    print(f"\n📋 Valores únicos de Red List encontrados (primeros 20):")
    for val in valores_red_list[:20]:
        if val and str(val).lower() != 'nan':
            print(f"  - '{val}'")

    # Obtener todas las especies de la base de datos
    print("\n🔍 Obteniendo especies de la base de datos...")
    response = supabase.table('taxon').select('id_taxon, taxon').eq('rank_id', 7).execute()

    if not response.data:
        print("❌ Error: No se pudieron obtener las especies de la base de datos")
        sys.exit(1)

    # Crear mapa de nombre científico completo -> id_taxon
    taxon_map = {}
    for taxon in response.data:
        nombre = str(taxon['taxon']).strip()
        taxon_map[nombre] = taxon['id_taxon']

    print(f"✅ Se encontraron {len(taxon_map)} especies en la base de datos")

    # Función para mapear valor del Excel a id_catalogo_awe
    def obtener_id_catalogo(valor):
        if pd.isna(valor) or valor == '' or str(valor).lower() == 'nan':
            return None

        valor_str = str(valor).strip().upper()

        # Manejar casos especiales primero
        # "CR (PE)" o "CR(PE)" -> Posiblemente extinta
        if 'CR' in valor_str and ('PE' in valor_str or '(PE)' in valor_str):
            return catalogo_map.get('CR(PE)') or catalogo_map.get('POSIBLEMENTE EXTINTA')

        # Buscar por sigla exacta
        if valor_str in catalogo_map:
            return catalogo_map[valor_str]

        # Normalizar espacios y paréntesis para búsqueda
        valor_normalizado = valor_str.replace(' ', '').replace('(', '').replace(')', '')
        if valor_normalizado in catalogo_map:
            return catalogo_map[valor_normalizado]

        # Buscar por coincidencia parcial en el nombre
        for key, id_cat in catalogo_map.items():
            key_normalizado = key.replace(' ', '').replace('(', '').replace(')', '')
            if valor_normalizado in key_normalizado or key_normalizado in valor_normalizado:
                return id_cat

        return None

    # Procesar cada fila del Excel
    actualizados = 0
    creados = 0
    no_encontrados = []
    sin_catalogo = []
    errores = []

    print("\n🔄 Procesando actualizaciones...")

    for idx, row in df_clean.iterrows():
        nombre_cientifico = str(row[species_col]).strip()
        valor_red_list = row[red_list_col]

        # Obtener id_catalogo_awe
        id_catalogo_awe = obtener_id_catalogo(valor_red_list)

        if id_catalogo_awe is None:
            if valor_red_list and str(valor_red_list).lower() != 'nan':
                sin_catalogo.append(f"{nombre_cientifico}: '{valor_red_list}'")
            continue

        # Buscar en el mapa
        if nombre_cientifico not in taxon_map:
            no_encontrados.append(nombre_cientifico)
            continue

        taxon_id = taxon_map[nombre_cientifico]

        # Verificar si ya existe un registro para este taxon y tipo de catálogo
        try:
            # Buscar registros existentes
            existing_response = supabase.table('taxon_catalogo_awe').select('id_taxon_catalogo_awe').eq('taxon_id', taxon_id).eq('catalogo_awe_id', id_catalogo_awe).execute()

            if existing_response.data and len(existing_response.data) > 0:
                # Ya existe, no hacer nada (o actualizar si es necesario)
                actualizados += 1
                print(f"  ✓ {nombre_cientifico}: Ya tiene Red List asignada (ID catálogo: {id_catalogo_awe})")
            else:
                # Crear nuevo registro
                insert_response = supabase.table('taxon_catalogo_awe').insert({
                    'taxon_id': taxon_id,
                    'catalogo_awe_id': id_catalogo_awe
                }).execute()

                if insert_response.data:
                    creados += 1
                    # Obtener nombre del catálogo para mostrar
                    cat_nombre = next((c['nombre'] for c in catalogo_response.data if c['id_catalogo_awe'] == id_catalogo_awe), 'N/A')
                    print(f"  ✅ {nombre_cientifico}: {cat_nombre} (valor Excel: '{valor_red_list}')")
                else:
                    errores.append(nombre_cientifico)

        except Exception as e:
            errores.append(f"{nombre_cientifico}: {str(e)}")
            print(f"  ❌ Error procesando {nombre_cientifico}: {str(e)}")

    # Resumen
    print(f"\n📊 Resumen:")
    print(f"  ✅ Actualizados (ya existían): {actualizados}")
    print(f"  ➕ Creados: {creados}")
    print(f"  ⚠️  No encontrados: {len(no_encontrados)}")
    print(f"  ❓ Sin catálogo correspondiente: {len(sin_catalogo)}")
    print(f"  ❌ Errores: {len(errores)}")

    if sin_catalogo:
        print(f"\n❓ Valores de Red List sin catálogo correspondiente (primeros 10):")
        for item in sin_catalogo[:10]:
            print(f"    - {item}")

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

