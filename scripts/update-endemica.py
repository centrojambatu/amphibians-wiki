#!/usr/bin/env python3
"""
Script para actualizar el campo endemica en la tabla taxon desde un archivo Excel
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
    endemism_col = None

    for col in df.columns:
        col_lower = str(col).lower().strip()
        if 'species' in col_lower and not species_col:
            species_col = col
        if 'endemism' in col_lower or 'endemica' in col_lower or 'endemic' in col_lower:
            endemism_col = col

    print(f"\n🔍 Columnas identificadas:")
    print(f"  Species: {species_col}")
    print(f"  Endemism: {endemism_col}")

    if not species_col:
        print("❌ Error: No se encontró la columna 'Species'")
        sys.exit(1)

    if not endemism_col:
        print("❌ Error: No se encontró la columna de endemismo")
        sys.exit(1)

    # Limpiar datos
    df_clean = df[[species_col, endemism_col]].copy()
    df_clean = df_clean.dropna(subset=[species_col])  # Eliminar filas sin especie

    # Limpiar valores de endemismo
    df_clean[endemism_col] = df_clean[endemism_col].astype(str).str.strip()

    print(f"\n📊 Total de registros a procesar: {len(df_clean)}")

    # Mostrar valores únicos de endemismo para entender el formato
    valores_endemismo = df_clean[endemism_col].unique()
    print(f"\n📋 Valores únicos de endemismo encontrados:")
    for val in valores_endemismo[:10]:
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

    # Función para determinar si es endémica basándose en el valor del Excel
    def es_endemica(valor):
        if pd.isna(valor) or valor == '' or str(valor).lower() == 'nan':
            return None
        valor_str = str(valor).strip().upper()
        # "E" = Endémica (Endemic)
        if valor_str == 'E':
            return True
        # "NE" = No Endémica (Not Endemic)
        if valor_str == 'NE':
            return False
        # Valores que indican endemismo
        if 'endemic' in valor_str.lower() or 'endémic' in valor_str.lower() or 'endemica' in valor_str.lower():
            return True
        # Valores que indican NO endemismo
        if 'no' in valor_str.lower() or 'false' in valor_str.lower() or valor_str == '0':
            return False
        # Por defecto, si tiene algún valor, asumir que es endémica
        return True

    # Procesar cada fila del Excel
    actualizados = 0
    no_encontrados = []
    errores = []
    valores_unicos_procesados = {}

    print("\n🔄 Procesando actualizaciones...")

    for idx, row in df_clean.iterrows():
        nombre_cientifico = str(row[species_col]).strip()
        valor_endemismo = row[endemism_col]

        # Determinar si es endémica
        endemica = es_endemica(valor_endemismo)

        if endemica is None:
            continue  # Saltar si no hay valor

        # Guardar valores únicos para referencia
        if valor_endemismo not in valores_unicos_procesados:
            valores_unicos_procesados[valor_endemismo] = endemica

        # Buscar en el mapa
        if nombre_cientifico not in taxon_map:
            no_encontrados.append(nombre_cientifico)
            continue

        taxon_id = taxon_map[nombre_cientifico]

        # Actualizar en taxon
        try:
            update_response = supabase.table('taxon').update({'endemica': endemica}).eq('id_taxon', taxon_id).execute()

            if update_response.data:
                actualizados += 1
                estado = "Endémica" if endemica else "No endémica"
                print(f"  ✅ {nombre_cientifico}: {estado} (valor Excel: '{valor_endemismo}')")
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

    print(f"\n📋 Mapeo de valores de endemismo:")
    for valor, es_end in valores_unicos_procesados.items():
        estado = "Endémica" if es_end else "No endémica"
        print(f"  '{valor}' -> {estado}")

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

