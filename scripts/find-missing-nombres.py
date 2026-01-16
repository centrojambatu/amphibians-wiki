#!/usr/bin/env python3
"""
Script para encontrar exactamente qué especies faltan nombres comunes
"""
import pandas as pd
import os
import sys
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv('.env.local')

def main():
    supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    supabase: Client = create_client(supabase_url, supabase_key)
    
    # Leer Excel
    df = pd.read_excel("AnfibiosEcuador a 26 Noviembre 2025. Actualizado de Coloma Duellman 2025.xlsx", engine='openpyxl')
    
    species_col = None
    nombre_comun_es_col = None
    nombre_comun_en_col = None
    
    for col in df.columns:
        col_lower = str(col).lower().strip()
        if 'species' in col_lower and not species_col:
            species_col = col
        if 'nombre común español' in col_lower:
            nombre_comun_es_col = col
        if 'english common name' in col_lower:
            nombre_comun_en_col = col
    
    # Obtener especies de BD
    ficha_response = supabase.table('ficha_especie').select('taxon_id').execute()
    taxon_ids = [f['taxon_id'] for f in ficha_response.data]
    
    generos_response = supabase.table('taxon').select('id_taxon, taxon').eq('rank_id', 6).execute()
    generos_map = {row['id_taxon']: row['taxon'] for row in generos_response.data}
    
    especies_response = supabase.table('taxon').select('id_taxon, taxon, taxon_id').eq('rank_id', 7).in_('id_taxon', taxon_ids).execute()
    
    # Mapear especies BD
    especies_bd = {}
    for especie in especies_response.data:
        genero_id = especie.get('taxon_id')
        if genero_id and genero_id in generos_map:
            nombre_completo = f"{generos_map[genero_id]} {especie['taxon']}".lower()
            especies_bd[nombre_completo] = especie['id_taxon']
    
    # Mapear Excel
    excel_map = {}
    for idx, row in df.iterrows():
        nombre_cientifico = str(row[species_col]).strip().lower()
        nombre_es = str(row[nombre_comun_es_col]).strip() if pd.notna(row[nombre_comun_es_col]) else None
        nombre_en = str(row[nombre_comun_en_col]).strip() if pd.notna(row[nombre_comun_en_col]) else None
        if nombre_es and nombre_es.lower() in ['nan', 'none', '']:
            nombre_es = None
        if nombre_en and nombre_en.lower() in ['nan', 'none', '']:
            nombre_en = None
        excel_map[nombre_cientifico] = {'es': nombre_es, 'en': nombre_en}
    
    # Obtener nombres comunes existentes
    nombres_response = supabase.table('nombre_comun').select('taxon_id, catalogo_awe_idioma_id').in_('taxon_id', taxon_ids).in_('catalogo_awe_idioma_id', [1, 8]).execute()
    
    especies_con_es = set()
    especies_con_en = set()
    for nc in nombres_response.data:
        if nc['catalogo_awe_idioma_id'] == 1:
            especies_con_es.add(nc['taxon_id'])
        elif nc['catalogo_awe_idioma_id'] == 8:
            especies_con_en.add(nc['taxon_id'])
    
    # Encontrar faltantes
    faltantes_es = []
    faltantes_en = []
    
    for nombre_completo, taxon_id in especies_bd.items():
        if taxon_id not in especies_con_es:
            nombres_excel = excel_map.get(nombre_completo, {})
            if nombres_excel.get('es'):
                faltantes_es.append((nombre_completo, nombres_excel['es']))
            else:
                faltantes_es.append((nombre_completo, 'SIN NOMBRE EN EXCEL'))
        
        if taxon_id not in especies_con_en:
            nombres_excel = excel_map.get(nombre_completo, {})
            if nombres_excel.get('en'):
                faltantes_en.append((nombre_completo, nombres_excel['en']))
            else:
                faltantes_en.append((nombre_completo, 'SIN NOMBRE EN EXCEL'))
    
    print(f"Faltantes en español: {len(faltantes_es)}")
    print(f"Faltantes en inglés: {len(faltantes_en)}")
    print(f"\nPrimeras 10 faltantes ES:")
    for nombre, nom_comun in faltantes_es[:10]:
        print(f"  - {nombre}: {nom_comun}")
    print(f"\nPrimeras 10 faltantes EN:")
    for nombre, nom_comun in faltantes_en[:10]:
        print(f"  - {nombre}: {nom_comun}")

if __name__ == "__main__":
    main()
