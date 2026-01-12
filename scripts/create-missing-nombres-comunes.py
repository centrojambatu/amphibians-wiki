#!/usr/bin/env python3
"""
Script para crear los registros faltantes de nombres comunes
Debe haber exactamente 690 registros en español y 690 en inglés (uno por cada especie)
"""
import pandas as pd
import os
import sys
import traceback
from supabase import create_client, Client
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv('.env.local')

def main():
    try:
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
        try:
            df = pd.read_excel(excel_path, engine='openpyxl')
        except Exception as e:
            print(f"❌ Error leyendo Excel: {e}")
            print("Intentando con engine por defecto...")
            df = pd.read_excel(excel_path)
        
        # Identificar columnas
        species_col = None
        nombre_comun_es_col = None
        nombre_comun_en_col = None
        
        for col in df.columns:
            col_lower = str(col).lower().strip()
            if 'species' in col_lower and not species_col:
                species_col = col
            if 'nombre común español' in col_lower or 'nombre comun español' in col_lower:
                nombre_comun_es_col = col
            if 'english common name' in col_lower or 'nombre común inglés' in col_lower:
                nombre_comun_en_col = col
        
        print(f"\n🔍 Columnas identificadas:")
        print(f"  Species: {species_col}")
        print(f"  Nombre común Español: {nombre_comun_es_col}")
        print(f"  English common name: {nombre_comun_en_col}")
        
        if not species_col:
            print("❌ Error: No se encontró la columna Species")
            sys.exit(1)
        
        # Limpiar datos
        columnas_necesarias = [species_col]
        if nombre_comun_es_col:
            columnas_necesarias.append(nombre_comun_es_col)
        if nombre_comun_en_col:
            columnas_necesarias.append(nombre_comun_en_col)
        
        df_clean = df[columnas_necesarias].copy()
        df_clean = df_clean.dropna(subset=[species_col])
        
        print(f"\n📊 Total de filas en Excel: {len(df_clean)}")
        
        # Obtener todas las especies de ficha_especie (deben ser 690)
        print("\n🔍 Obteniendo especies de ficha_especie...")
        ficha_response = supabase.table('ficha_especie').select('taxon_id').execute()
        taxon_ids = [f['taxon_id'] for f in ficha_response.data]
        print(f"  - Taxones en ficha_especie: {len(taxon_ids)}")
        
        if len(taxon_ids) != 690:
            print(f"⚠️  Advertencia: Se esperaban 690 especies, se encontraron {len(taxon_ids)}")
        
        # Obtener TODOS los géneros primero (rank_id = 6)
        print("🔍 Obteniendo todos los géneros...")
        generos_response = supabase.table('taxon').select('id_taxon, taxon').eq('rank_id', 6).execute()
        generos_map = {row['id_taxon']: row['taxon'] for row in generos_response.data}
        print(f"  - Géneros encontrados: {len(generos_map)}")
        
        # Obtener información de especies (rank_id = 7) que están en ficha_especie
        print("🔍 Obteniendo especies de ficha_especie...")
        especies_response = supabase.table('taxon').select('id_taxon, taxon, taxon_id').eq('rank_id', 7).in_('id_taxon', taxon_ids).execute()
        print(f"  - Especies encontradas: {len(especies_response.data)}")
        
        # Crear mapa: nombre_cientifico_completo -> {taxon_id, nombre_es, nombre_en}
        especies_map = {}  # nombre_cientifico_completo (lowercase) -> {taxon_id, nombre_es, nombre_en}
        
        # Primero, crear mapa del Excel
        excel_map = {}  # nombre_cientifico_completo -> {nombre_es, nombre_en}
        for idx, row in df_clean.iterrows():
            nombre_cientifico = str(row[species_col]).strip()
            nombre_cientifico_lower = nombre_cientifico.lower()
            
            nombre_es = None
            nombre_en = None
            
            if nombre_comun_es_col:
                nombre_es = str(row[nombre_comun_es_col]).strip() if pd.notna(row[nombre_comun_es_col]) else None
                if nombre_es and nombre_es.lower() in ['nan', 'none', '']:
                    nombre_es = None
            
            if nombre_comun_en_col:
                nombre_en = str(row[nombre_comun_en_col]).strip() if pd.notna(row[nombre_comun_en_col]) else None
                if nombre_en and nombre_en.lower() in ['nan', 'none', '']:
                    nombre_en = None
            
            # Siempre agregar al mapa, incluso si no tiene nombre común
            excel_map[nombre_cientifico_lower] = {
                'nombre_es': nombre_es,
                'nombre_en': nombre_en
            }
        
        print(f"✅ Nombres comunes en Excel: {len(excel_map)}")
        print(f"  - Con nombre en español: {len([x for x in excel_map.values() if x.get('nombre_es')])}")
        print(f"  - Con nombre en inglés: {len([x for x in excel_map.values() if x.get('nombre_en')])}")
        
        # Construir nombres completos de especies y mapear con Excel
        especies_no_encontradas = []
        for especie in especies_response.data:
            especie_id = especie['id_taxon']
            nombre_especie = especie['taxon']
            genero_id = especie.get('taxon_id')
            
            if genero_id and genero_id in generos_map:
                genero_nombre = generos_map[genero_id]
                nombre_completo = f"{genero_nombre} {nombre_especie}".lower()
                
                # Obtener nombres del Excel si existen
                nombres_excel = excel_map.get(nombre_completo, {})
                
                if not nombres_excel:
                    especies_no_encontradas.append(f"{genero_nombre} {nombre_especie}")
                
                especies_map[nombre_completo] = {
                    'taxon_id': especie_id,
                    'nombre_es': nombres_excel.get('nombre_es'),
                    'nombre_en': nombres_excel.get('nombre_en')
                }
            else:
                especies_no_encontradas.append(f"taxon_id {especie_id}: {nombre_especie} (sin género)")
        
        print(f"✅ Especies mapeadas: {len(especies_map)}")
        if especies_no_encontradas:
            print(f"⚠️  Especies no encontradas en Excel: {len(especies_no_encontradas)}")
            print(f"   Primeras 5: {especies_no_encontradas[:5]}")
        
        # Obtener nombres comunes existentes
        print("\n🔍 Obteniendo nombres comunes existentes...")
        nombres_comunes_response = supabase.table('nombre_comun').select(
            'id_nombre_comun, taxon_id, catalogo_awe_idioma_id, nombre'
        ).in_('taxon_id', list(taxon_ids)).execute()
        
        # Crear mapa: (taxon_id, idioma_id) -> existe
        nombres_comunes_existentes = set()
        for nc in nombres_comunes_response.data:
            if nc['taxon_id'] in taxon_ids and nc['catalogo_awe_idioma_id'] in [1, 8]:
                key = (nc['taxon_id'], nc['catalogo_awe_idioma_id'])
                nombres_comunes_existentes.add(key)
        
        print(f"✅ Nombres comunes existentes: {len(nombres_comunes_existentes)}")
        
        # Contar cuántos faltan
        especies_con_es = set()
        especies_con_en = set()
        for key in nombres_comunes_existentes:
            taxon_id, idioma_id = key
            if idioma_id == 1:  # Español
                especies_con_es.add(taxon_id)
            elif idioma_id == 8:  # Inglés
                especies_con_en.add(taxon_id)
        
        faltantes_es = 690 - len(especies_con_es)
        faltantes_en = 690 - len(especies_con_en)
        
        print(f"\n📊 Estado actual:")
        print(f"  Español: {len(especies_con_es)}/690 registros ({faltantes_es} faltantes)")
        print(f"  Inglés: {len(especies_con_en)}/690 registros ({faltantes_en} faltantes)")
        
        # Crear registros faltantes
        print("\n📋 Creando registros faltantes...")
        
        creados_es = 0
        creados_en = 0
        sin_nombre_es = []
        sin_nombre_en = []
        errores = []
        
        for nombre_completo, especie_info in especies_map.items():
            taxon_id = especie_info['taxon_id']
            nombre_es = especie_info.get('nombre_es')
            nombre_en = especie_info.get('nombre_en')
            
            # Crear registro en español si falta
            key_es = (taxon_id, 1)
            if key_es not in nombres_comunes_existentes:
                if nombre_es:
                    try:
                        supabase.table('nombre_comun').insert({
                            'taxon_id': taxon_id,
                            'nombre': nombre_es,
                            'catalogo_awe_idioma_id': 1,  # Español
                            'principal': False
                        }).execute()
                        creados_es += 1
                        if creados_es % 50 == 0:
                            print(f"  📊 Progreso ES: {creados_es} creados...")
                    except Exception as e:
                        errores.append(f"{nombre_completo} (ES): {str(e)}")
                        print(f"  ❌ Error creando ES para {nombre_completo}: {e}")
                else:
                    sin_nombre_es.append(nombre_completo)
            
            # Crear registro en inglés si falta
            key_en = (taxon_id, 8)
            if key_en not in nombres_comunes_existentes:
                if nombre_en:
                    try:
                        supabase.table('nombre_comun').insert({
                            'taxon_id': taxon_id,
                            'nombre': nombre_en,
                            'catalogo_awe_idioma_id': 8,  # Inglés
                            'principal': False
                        }).execute()
                        creados_en += 1
                        if creados_en % 50 == 0:
                            print(f"  📊 Progreso EN: {creados_en} creados...")
                    except Exception as e:
                        errores.append(f"{nombre_completo} (EN): {str(e)}")
                        print(f"  ❌ Error creando EN para {nombre_completo}: {e}")
                else:
                    sin_nombre_en.append(nombre_completo)
        
        # Verificación final
        print("\n🔍 Verificando resultado final...")
        nombres_finales = supabase.table('nombre_comun').select(
            'taxon_id, catalogo_awe_idioma_id'
        ).in_('taxon_id', list(taxon_ids)).in_('catalogo_awe_idioma_id', [1, 8]).execute()
        
        # Contar por taxon_id e idioma, manteniendo solo uno por especie-idioma
        especies_final_es = set()
        especies_final_en = set()
        for nc in nombres_finales.data:
            taxon_id = nc['taxon_id']
            idioma_id = nc['catalogo_awe_idioma_id']
            if idioma_id == 1:
                especies_final_es.add(taxon_id)
            elif idioma_id == 8:
                especies_final_en.add(taxon_id)
        
        # Verificar si hay duplicados
        total_registros_es = len([nc for nc in nombres_finales.data if nc['catalogo_awe_idioma_id'] == 1])
        total_registros_en = len([nc for nc in nombres_finales.data if nc['catalogo_awe_idioma_id'] == 8])
        
        if total_registros_es > len(especies_final_es):
            print(f"  ⚠️  Hay {total_registros_es - len(especies_final_es)} registros duplicados en español")
        if total_registros_en > len(especies_final_en):
            print(f"  ⚠️  Hay {total_registros_en - len(especies_final_en)} registros duplicados en inglés")
        
        # Resumen
        print(f"\n📊 Resumen:")
        print(f"  ✅ Registros creados en español: {creados_es}")
        print(f"  ✅ Registros creados en inglés: {creados_en}")
        print(f"  ⚠️  Especies sin nombre en Excel (ES): {len(sin_nombre_es)}")
        print(f"  ⚠️  Especies sin nombre en Excel (EN): {len(sin_nombre_en)}")
        print(f"  ❌ Errores: {len(errores)}")
        
        print(f"\n📊 Estado final:")
        print(f"  Español: {len(especies_final_es)}/690 registros")
        print(f"  Inglés: {len(especies_final_en)}/690 registros")
        
        if len(especies_final_es) == 690 and len(especies_final_en) == 690:
            print(f"\n✅ ¡Perfecto! Se alcanzaron los 690 registros en ambos idiomas")
        else:
            print(f"\n⚠️  Aún faltan algunos registros:")
            if len(especies_final_es) < 690:
                print(f"   - Español: faltan {690 - len(especies_final_es)} registros")
            if len(especies_final_en) < 690:
                print(f"   - Inglés: faltan {690 - len(especies_final_en)} registros")
        
        if sin_nombre_es:
            print(f"\n⚠️  Primeras 10 especies sin nombre en español en Excel:")
            for especie in sin_nombre_es[:10]:
                print(f"    - {especie}")
            if len(sin_nombre_es) > 10:
                print(f"    ... y {len(sin_nombre_es) - 10} más")
        
        if sin_nombre_en:
            print(f"\n⚠️  Primeras 10 especies sin nombre en inglés en Excel:")
            for especie in sin_nombre_en[:10]:
                print(f"    - {especie}")
            if len(sin_nombre_en) > 10:
                print(f"    ... y {len(sin_nombre_en) - 10} más")
        
        if errores:
            print(f"\n❌ Primeros 10 errores:")
            for error in errores[:10]:
                print(f"    - {error}")
            if len(errores) > 10:
                print(f"    ... y {len(errores) - 10} más")
    
    except Exception as e:
        print(f"\n❌ Error fatal: {str(e)}")
        print(f"\n📋 Traceback completo:")
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
