#!/usr/bin/env python3
"""
Script para crear los registros faltantes que tienen nombre en el Excel
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
    print("📖 Leyendo Excel...")
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
    print("🔍 Obteniendo especies de BD...")
    ficha_response = supabase.table('ficha_especie').select('taxon_id').execute()
    taxon_ids = [f['taxon_id'] for f in ficha_response.data]
    
    generos_response = supabase.table('taxon').select('id_taxon, taxon').eq('rank_id', 6).execute()
    generos_map = {row['id_taxon']: row['taxon'] for row in generos_response.data}
    
    especies_response = supabase.table('taxon').select('id_taxon, taxon, taxon_id').eq('rank_id', 7).in_('id_taxon', taxon_ids).execute()
    
    # Mapear especies BD: nombre_completo -> taxon_id
    especies_bd = {}
    for especie in especies_response.data:
        genero_id = especie.get('taxon_id')
        if genero_id and genero_id in generos_map:
            nombre_completo = f"{generos_map[genero_id]} {especie['taxon']}".lower()
            especies_bd[nombre_completo] = especie['id_taxon']
    
    print(f"✅ Especies en BD: {len(especies_bd)}")
    
    # Mapear Excel: nombre_completo -> {es, en}
    print("🔍 Mapeando Excel...")
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
    
    print(f"✅ Nombres en Excel: {len(excel_map)}")
    
    # Obtener nombres comunes existentes
    print("🔍 Obteniendo nombres comunes existentes...")
    nombres_response = supabase.table('nombre_comun').select('taxon_id, catalogo_awe_idioma_id').in_('taxon_id', taxon_ids).in_('catalogo_awe_idioma_id', [1, 8]).execute()
    
    especies_con_es = set()
    especies_con_en = set()
    for nc in nombres_response.data:
        if nc['catalogo_awe_idioma_id'] == 1:
            especies_con_es.add(nc['taxon_id'])
        elif nc['catalogo_awe_idioma_id'] == 8:
            especies_con_en.add(nc['taxon_id'])
    
    print(f"✅ Especies con nombre ES: {len(especies_con_es)}")
    print(f"✅ Especies con nombre EN: {len(especies_con_en)}")
    
    # Crear registros faltantes
    print("\n📋 Creando registros faltantes...")
    creados_es = 0
    creados_en = 0
    errores = []
    
    for nombre_completo, taxon_id in especies_bd.items():
        nombres_excel = excel_map.get(nombre_completo, {})
        
        # Crear ES si falta y tiene nombre en Excel
        if taxon_id not in especies_con_es:
            nombre_es = nombres_excel.get('es')
            if nombre_es:
                try:
                    supabase.table('nombre_comun').insert({
                        'taxon_id': taxon_id,
                        'nombre': nombre_es,
                        'catalogo_awe_idioma_id': 1,
                        'principal': False
                    }).execute()
                    creados_es += 1
                    if creados_es % 50 == 0:
                        print(f"  📊 ES: {creados_es} creados...")
                except Exception as e:
                    errores.append(f"{nombre_completo} (ES): {e}")
        
        # Crear EN si falta y tiene nombre en Excel
        if taxon_id not in especies_con_en:
            nombre_en = nombres_excel.get('en')
            if nombre_en:
                try:
                    supabase.table('nombre_comun').insert({
                        'taxon_id': taxon_id,
                        'nombre': nombre_en,
                        'catalogo_awe_idioma_id': 8,
                        'principal': False
                    }).execute()
                    creados_en += 1
                    if creados_en % 50 == 0:
                        print(f"  📊 EN: {creados_en} creados...")
                except Exception as e:
                    errores.append(f"{nombre_completo} (EN): {e}")
    
    # Verificación final
    print("\n🔍 Verificando resultado final...")
    nombres_finales = supabase.table('nombre_comun').select('taxon_id, catalogo_awe_idioma_id').in_('taxon_id', taxon_ids).in_('catalogo_awe_idioma_id', [1, 8]).execute()
    
    especies_final_es = set()
    especies_final_en = set()
    for nc in nombres_finales.data:
        if nc['catalogo_awe_idioma_id'] == 1:
            especies_final_es.add(nc['taxon_id'])
        elif nc['catalogo_awe_idioma_id'] == 8:
            especies_final_en.add(nc['taxon_id'])
    
    print(f"\n📊 Resumen:")
    print(f"  ✅ Creados en español: {creados_es}")
    print(f"  ✅ Creados en inglés: {creados_en}")
    print(f"  ❌ Errores: {len(errores)}")
    print(f"\n📊 Estado final:")
    print(f"  Español: {len(especies_final_es)}/690")
    print(f"  Inglés: {len(especies_final_en)}/690")
    
    if len(especies_final_es) == 690 and len(especies_final_en) == 690:
        print("\n✅ ¡Perfecto! Se alcanzaron los 690 registros en ambos idiomas")
    else:
        faltantes_es = 690 - len(especies_final_es)
        faltantes_en = 690 - len(especies_final_en)
        print(f"\n⚠️  Aún faltan:")
        print(f"   - Español: {faltantes_es} registros")
        print(f"   - Inglés: {faltantes_en} registros")
    
    if errores:
        print(f"\n❌ Errores (primeros 10):")
        for error in errores[:10]:
            print(f"    - {error}")

if __name__ == "__main__":
    main()
