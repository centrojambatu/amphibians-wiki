#!/usr/bin/env python3
"""
Script para verificar si todas las especies del Excel tienen Lista Roja asignada
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
    
    if not species_col or not red_list_col:
        print("❌ Error: No se encontraron las columnas necesarias")
        sys.exit(1)
    
    print(f"✅ Columnas identificadas: Species={species_col}, Red List={red_list_col}")
    
    # Limpiar datos
    df_clean = df[[species_col, red_list_col]].copy()
    df_clean = df_clean.dropna(subset=[species_col])  # Eliminar filas sin especie
    
    # Filtrar solo especies con valor de Red List
    df_clean[red_list_col] = df_clean[red_list_col].astype(str).str.strip()
    df_with_red_list = df_clean[df_clean[red_list_col].notna() & (df_clean[red_list_col] != '') & (df_clean[red_list_col].str.lower() != 'nan')]
    
    print(f"\n📊 Estadísticas del Excel:")
    print(f"  Total de filas: {len(df_clean)}")
    print(f"  Especies con valor de Red List: {len(df_with_red_list)}")
    print(f"  Especies sin valor de Red List: {len(df_clean) - len(df_with_red_list)}")
    
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
    
    # Obtener todas las especies con Lista Roja en la base de datos
    print("\n🔍 Obteniendo especies con Lista Roja en la base de datos...")
    red_list_response = supabase.table('taxon_catalogo_awe').select('taxon_id, catalogo_awe!inner(tipo_catalogo_awe_id)').eq('catalogo_awe.tipo_catalogo_awe_id', 10).execute()
    
    taxon_ids_with_red_list = set()
    if red_list_response.data:
        for record in red_list_response.data:
            taxon_ids_with_red_list.add(record['taxon_id'])
    
    print(f"✅ Se encontraron {len(taxon_ids_with_red_list)} especies con Lista Roja en la base de datos")
    
    # Procesar especies del Excel
    especies_en_bd = []
    especies_con_red_list = []
    especies_sin_red_list = []
    especies_no_en_bd = []
    
    for idx, row in df_with_red_list.iterrows():
        nombre_cientifico = str(row[species_col]).strip()
        valor_red_list = str(row[red_list_col]).strip()
        
        if nombre_cientifico in taxon_map:
            taxon_id = taxon_map[nombre_cientifico]
            especies_en_bd.append(nombre_cientifico)
            
            if taxon_id in taxon_ids_with_red_list:
                especies_con_red_list.append(nombre_cientifico)
            else:
                especies_sin_red_list.append({
                    'especie': nombre_cientifico,
                    'taxon_id': taxon_id,
                    'valor_excel': valor_red_list
                })
        else:
            especies_no_en_bd.append({
                'especie': nombre_cientifico,
                'valor_excel': valor_red_list
            })
    
    # Resumen
    print(f"\n📊 Resumen de verificación:")
    print(f"  📋 Especies en Excel con Red List: {len(df_with_red_list)}")
    print(f"  ✅ Especies en BD: {len(especies_en_bd)}")
    print(f"  ✅ Especies en BD con Red List asignada: {len(especies_con_red_list)}")
    print(f"  ⚠️  Especies en BD sin Red List asignada: {len(especies_sin_red_list)}")
    print(f"  ❌ Especies no encontradas en BD: {len(especies_no_en_bd)}")
    
    # Mostrar especies sin Red List
    if especies_sin_red_list:
        print(f"\n⚠️  Especies en BD sin Red List asignada ({len(especies_sin_red_list)}):")
        for item in especies_sin_red_list[:20]:
            print(f"    - {item['especie']} (taxon_id: {item['taxon_id']}, Excel: '{item['valor_excel']}')")
        if len(especies_sin_red_list) > 20:
            print(f"    ... y {len(especies_sin_red_list) - 20} más")
    
    # Mostrar especies no encontradas
    if especies_no_en_bd:
        print(f"\n❌ Especies del Excel no encontradas en BD ({len(especies_no_en_bd)}):")
        for item in especies_no_en_bd[:20]:
            print(f"    - {item['especie']} (Excel Red List: '{item['valor_excel']}')")
        if len(especies_no_en_bd) > 20:
            print(f"    ... y {len(especies_no_en_bd) - 20} más")
    
    # Porcentaje de cobertura
    if len(especies_en_bd) > 0:
        porcentaje = (len(especies_con_red_list) / len(especies_en_bd)) * 100
        print(f"\n📈 Cobertura de Red List:")
        print(f"  {len(especies_con_red_list)}/{len(especies_en_bd)} especies ({porcentaje:.1f}%)")
    
    # Verificar si todas las 690 especies tienen Red List
    total_especies_excel = len(df_clean)
    print(f"\n🎯 Verificación final:")
    print(f"  Total especies en Excel: {total_especies_excel}")
    print(f"  Especies con Red List en Excel: {len(df_with_red_list)}")
    print(f"  Especies con Red List en BD: {len(especies_con_red_list)}")
    
    if len(especies_con_red_list) == len(df_with_red_list) and len(especies_sin_red_list) == 0:
        print(f"\n✅ ¡Perfecto! Todas las especies del Excel que están en BD tienen Red List asignada")
    else:
        print(f"\n⚠️  Faltan {len(especies_sin_red_list)} especies con Red List en la base de datos")

if __name__ == "__main__":
    main()


