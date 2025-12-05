#!/usr/bin/env python3
"""
Script para actualizar Lista Roja UICN en taxon_catalogo_awe desde Excel
Usa MCP de Supabase para las operaciones
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
        print("❌ Error: Variables de entorno no encontradas")
        sys.exit(1)

    supabase: Client = create_client(supabase_url, supabase_key)

    # Leer Excel
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
        if 'species' in col_lower:
            species_col = col
        if 'red list' in col_lower:
            red_list_col = col

    if not species_col or not red_list_col:
        print("❌ Error: No se encontraron las columnas necesarias")
        sys.exit(1)

    print(f"✅ Columnas identificadas: Species={species_col}, Red List={red_list_col}")

    # Limpiar datos
    df_clean = df[[species_col, red_list_col]].copy()
    df_clean = df_clean.dropna(subset=[species_col])
    df_clean[red_list_col] = df_clean[red_list_col].astype(str).str.strip()

    print(f"\n📊 Total de registros a procesar: {len(df_clean)}")

    # Obtener catálogos de Lista Roja UICN
    print("\n🔍 Obteniendo catálogos de Lista Roja UICN...")
    catalogo_response = supabase.table('catalogo_awe').select('id_catalogo_awe, nombre, sigla').eq('tipo_catalogo_awe_id', 10).execute()

    if not catalogo_response.data:
        print("❌ Error: No se pudieron obtener los catálogos de Red List")
        sys.exit(1)

    # Crear mapa de sigla -> id_catalogo_awe
    catalogo_map = {}
    print("\n📋 Catálogos disponibles:")
    for cat in catalogo_response.data:
        sigla = str(cat['sigla']).strip() if cat['sigla'] else None  # Mantener formato original
        sigla_upper = sigla.upper() if sigla else None
        sigla_sin_espacios = sigla.replace(' ', '').replace('(', '').replace(')', '') if sigla else None
        nombre = str(cat['nombre']).strip()
        id_cat = cat['id_catalogo_awe']

        # Mapear por sigla original (con espacios si los tiene)
        if sigla:
            catalogo_map[sigla] = id_cat
            catalogo_map[sigla_upper] = id_cat
            if sigla_sin_espacios:
                catalogo_map[sigla_sin_espacios] = id_cat
        catalogo_map[nombre.upper()] = id_cat

        print(f"  '{sigla or 'N/A'}': {nombre} (ID: {id_cat})")

    # Función para obtener id_catalogo_awe
    def obtener_id_catalogo(valor):
        if pd.isna(valor) or valor == '' or str(valor).lower() == 'nan':
            return None

        valor_str = str(valor).strip()
        valor_upper = valor_str.upper()

        # Primero buscar coincidencia exacta (respetando espacios)
        if valor_str in catalogo_map:
            return catalogo_map[valor_str]

        # Buscar en mayúsculas
        if valor_upper in catalogo_map:
            return catalogo_map[valor_upper]

        # Normalizar espacios y paréntesis para búsqueda
        valor_normalizado = valor_upper.replace(' ', '').replace('(', '').replace(')', '')

        # Buscar por sigla normalizada
        if valor_normalizado in catalogo_map:
            return catalogo_map[valor_normalizado]

        # Manejar casos especiales - "CR (PE)" o "CR(PE)"
        if 'CR' in valor_upper and ('PE' in valor_upper or '(PE)' in valor_upper):
            # Intentar diferentes variaciones
            for key in ['CR (PE)', 'CR(PE)', 'CR(PE)', 'CR PE']:
                if key in catalogo_map:
                    return catalogo_map[key]
            # Buscar por nombre
            for key in catalogo_map.keys():
                if 'POSIBLEMENTE EXTINTA' in key:
                    return catalogo_map[key]

        return None

    # Obtener todas las especies de la BD con sus géneros
    print("\n🔍 Obteniendo especies de la base de datos...")
    especies_response = supabase.table('taxon').select('id_taxon, taxon, taxon_id').eq('rank_id', 7).execute()

    if not especies_response.data:
        print("❌ Error: No se pudieron obtener las especies")
        sys.exit(1)

    # Obtener géneros
    generos_response = supabase.table('taxon').select('id_taxon, taxon').eq('rank_id', 6).execute()
    generos_map = {}
    if generos_response.data:
        for gen in generos_response.data:
            generos_map[gen['id_taxon']] = gen['taxon']

    # Construir mapa: nombre_completo (género + especie) -> taxon_id
    especies_map = {}
    for especie in especies_response.data:
        genero_id = especie['taxon_id']
        nombre_especie = especie['taxon']
        if genero_id and genero_id in generos_map:
            genero_nombre = generos_map[genero_id]
            nombre_completo = f"{genero_nombre} {nombre_especie}"
            especies_map[nombre_completo] = especie['id_taxon']

    print(f"✅ Especies en BD: {len(especies_map)}")

    # Obtener registros existentes de Red List
    print("\n🔍 Obteniendo registros existentes de Red List...")
    red_list_existente = supabase.table('taxon_catalogo_awe').select('taxon_id, catalogo_awe_id, catalogo_awe!inner(tipo_catalogo_awe_id)').eq('catalogo_awe.tipo_catalogo_awe_id', 10).execute()

    red_list_map = {}  # taxon_id -> catalogo_awe_id
    if red_list_existente.data:
        for record in red_list_existente.data:
            taxon_id = record['taxon_id']
            catalogo_id = record['catalogo_awe_id']
            red_list_map[taxon_id] = catalogo_id

    print(f"✅ Especies con Red List existente: {len(red_list_map)}")

    # Procesar actualizaciones
    creados = 0
    actualizados = 0
    no_encontrados = []
    sin_catalogo = []
    errores = []

    print("\n🔄 Procesando actualizaciones...")

    for idx, row in df_clean.iterrows():
        try:
            nombre_cientifico = str(row[species_col]).strip()
            valor_red_list = str(row[red_list_col]).strip()

            # Obtener id_catalogo_awe
            id_catalogo_awe = obtener_id_catalogo(valor_red_list)

            if id_catalogo_awe is None:
                if valor_red_list and valor_red_list.lower() != 'nan':
                    sin_catalogo.append(f"{nombre_cientifico}: '{valor_red_list}'")
                continue

            # Buscar especie en BD
            if nombre_cientifico not in especies_map:
                no_encontrados.append(nombre_cientifico)
                continue

            taxon_id = especies_map[nombre_cientifico]

            # Verificar si ya existe un registro
            if taxon_id in red_list_map:
                # Ya existe, verificar si es el mismo catálogo
                if red_list_map[taxon_id] == id_catalogo_awe:
                    # Ya está correcto, no hacer nada
                    continue
                else:
                    # Actualizar: eliminar el anterior y crear el nuevo
                    try:
                        # Eliminar registro anterior
                        supabase.table('taxon_catalogo_awe').delete().eq('taxon_id', taxon_id).eq('catalogo_awe_id', red_list_map[taxon_id]).execute()

                        # Crear nuevo registro
                        supabase.table('taxon_catalogo_awe').insert({
                            'taxon_id': taxon_id,
                            'catalogo_awe_id': id_catalogo_awe
                        }).execute()

                        actualizados += 1
                        if actualizados % 50 == 0:
                            print(f"  📊 Progreso: {actualizados} actualizados, {creados} creados...")
                    except Exception as e:
                        errores.append(f"{nombre_cientifico}: {str(e)}")
            else:
                # No existe, crear nuevo registro
                try:
                    supabase.table('taxon_catalogo_awe').insert({
                        'taxon_id': taxon_id,
                        'catalogo_awe_id': id_catalogo_awe
                    }).execute()

                    creados += 1
                    if creados % 50 == 0:
                        print(f"  📊 Progreso: {actualizados} actualizados, {creados} creados...")
                except Exception as e:
                    errores.append(f"{nombre_cientifico}: {str(e)}")

        except Exception as e:
            errores.append(f"{nombre_cientifico}: {str(e)}")

    # Resumen
    print(f"\n📊 Resumen:")
    print(f"  ➕ Registros creados: {creados}")
    print(f"  🔄 Registros actualizados: {actualizados}")
    print(f"  ⚠️  No encontrados: {len(no_encontrados)}")
    print(f"  ❓ Sin catálogo correspondiente: {len(sin_catalogo)}")
    print(f"  ❌ Errores: {len(errores)}")

    if sin_catalogo:
        print(f"\n❓ Valores de Red List sin catálogo (primeros 10):")
        for item in sin_catalogo[:10]:
            print(f"    - {item}")

    if no_encontrados:
        print(f"\n⚠️  Especies no encontradas (primeras 10):")
        for nombre in no_encontrados[:10]:
            print(f"    - {nombre}")

    if errores:
        print(f"\n❌ Errores (primeros 10):")
        for error in errores[:10]:
            print(f"    - {error}")

    # Verificación final
    print(f"\n🔍 Verificación final...")
    red_list_final = supabase.table('taxon_catalogo_awe').select('taxon_id, catalogo_awe!inner(tipo_catalogo_awe_id)').eq('catalogo_awe.tipo_catalogo_awe_id', 10).execute()
    total_red_list = len(red_list_final.data) if red_list_final.data else 0

    print(f"  📊 Total especies con Red List: {total_red_list}")
    print(f"  📋 Total especies esperadas: {len(especies_map)}")

    if total_red_list == len(especies_map):
        print(f"\n✅ ¡Perfecto! Todas las especies tienen Red List asignada")
    else:
        diferencia = len(especies_map) - total_red_list
        print(f"\n⚠️  Faltan {diferencia} especies con Red List")

if __name__ == "__main__":
    main()

