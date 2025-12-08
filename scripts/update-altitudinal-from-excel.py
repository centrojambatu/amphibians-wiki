#!/usr/bin/env python3
"""
Script para actualizar rangos altitudinales en ficha_especie desde Excel
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
    alt_min_col = None
    alt_max_col = None
    
    for col in df.columns:
        col_lower = str(col).lower().strip()
        if 'species' in col_lower:
            species_col = col
        if 'minim altitude' in col_lower or 'min altitude' in col_lower:
            alt_min_col = col
        if 'max altitude' in col_lower:
            alt_max_col = col
    
    if not species_col or not alt_min_col or not alt_max_col:
        print("❌ Error: No se encontraron las columnas necesarias")
        sys.exit(1)
    
    print(f"✅ Columnas identificadas: Species={species_col}, Alt Min={alt_min_col}, Alt Max={alt_max_col}")
    
    # Limpiar datos
    df_clean = df[[species_col, alt_min_col, alt_max_col]].copy()
    df_clean = df_clean.dropna(subset=[species_col])
    
    # Limpiar valores de altitud
    df_clean[alt_min_col] = pd.to_numeric(df_clean[alt_min_col], errors='coerce')
    df_clean[alt_max_col] = pd.to_numeric(df_clean[alt_max_col], errors='coerce')
    
    print(f"\n📊 Total de registros a procesar: {len(df_clean)}")
    
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
    
    # Procesar actualizaciones
    actualizados = 0
    no_encontrados = []
    sin_altitud = []
    errores = []
    
    print("\n🔄 Procesando actualizaciones...")
    
    for idx, row in df_clean.iterrows():
        try:
            nombre_cientifico = str(row[species_col]).strip()
            alt_min = row[alt_min_col] if pd.notna(row[alt_min_col]) else None
            alt_max = row[alt_max_col] if pd.notna(row[alt_max_col]) else None
            
            # Si no hay valores de altitud, saltar
            if alt_min is None and alt_max is None:
                sin_altitud.append(nombre_cientifico)
                continue
            
            # Buscar especie en BD
            if nombre_cientifico not in especies_map:
                no_encontrados.append(nombre_cientifico)
                continue
            
            taxon_id = especies_map[nombre_cientifico]
            
            # Preparar datos de actualización
            update_data = {}
            if alt_min is not None:
                update_data['rango_altitudinal_min'] = int(alt_min)
            if alt_max is not None:
                update_data['rango_altitudinal_max'] = int(alt_max)
            
            # Actualizar ficha_especie
            update_response = supabase.table('ficha_especie').update(update_data).eq('taxon_id', taxon_id).execute()
            
            if update_response.data:
                actualizados += 1
                if actualizados % 50 == 0:
                    print(f"  📊 Progreso: {actualizados} actualizados...")
            else:
                errores.append(nombre_cientifico)
                
        except Exception as e:
            errores.append(f"{nombre_cientifico}: {str(e)}")
    
    # Resumen
    print(f"\n📊 Resumen:")
    print(f"  ✅ Actualizados: {actualizados}")
    print(f"  ⚠️  No encontrados: {len(no_encontrados)}")
    print(f"  ⚠️  Sin valores de altitud: {len(sin_altitud)}")
    print(f"  ❌ Errores: {len(errores)}")
    
    if no_encontrados:
        print(f"\n⚠️  Especies no encontradas (primeras 10):")
        for nombre in no_encontrados[:10]:
            print(f"    - {nombre}")
    
    if errores:
        print(f"\n❌ Errores (primeros 10):")
        for error in errores[:10]:
            print(f"    - {error}")

if __name__ == "__main__":
    main()


