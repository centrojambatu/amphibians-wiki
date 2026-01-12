#!/usr/bin/env python3
"""
Script para cargar nombres comunes desde Excel usando la vista vw_lista_especies
para mapear correctamente el nombre científico con el taxon_id
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
        
        # Limpiar datos del Excel
        columnas_necesarias = [species_col]
        if nombre_comun_es_col:
            columnas_necesarias.append(nombre_comun_es_col)
        if nombre_comun_en_col:
            columnas_necesarias.append(nombre_comun_en_col)
        
        df_clean = df[columnas_necesarias].copy()
        df_clean = df_clean.dropna(subset=[species_col])
        
        print(f"\n📊 Total de filas en Excel: {len(df_clean)}")
        
        # Obtener todas las especies de la vista vw_lista_especies
        print("\n🔍 Obteniendo especies de la vista vw_lista_especies...")
        vista_response = supabase.table('vw_lista_especies').select('nombre_cientifico, id_taxon').execute()
        
        # Crear mapa: nombre_cientifico (lowercase) -> id_taxon
        especies_vista = {}
        for especie in vista_response.data:
            nombre_cientifico = especie['nombre_cientifico']
            if nombre_cientifico:
                nombre_cientifico_lower = str(nombre_cientifico).strip().lower()
                id_taxon = especie['id_taxon']
                especies_vista[nombre_cientifico_lower] = id_taxon
        
        print(f"✅ Especies en vista: {len(especies_vista)}")
        
        # Crear mapa del Excel: nombre_cientifico -> {nombre_es, nombre_en}
        print("\n📋 Mapeando nombres comunes del Excel...")
        excel_map = {}
        for idx, row in df_clean.iterrows():
            nombre_cientifico_excel = str(row[species_col]).strip()
            nombre_cientifico_excel_lower = nombre_cientifico_excel.lower()
            
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
            
            excel_map[nombre_cientifico_excel_lower] = {
                'nombre_es': nombre_es,
                'nombre_en': nombre_en
            }
        
        print(f"✅ Nombres comunes en Excel: {len(excel_map)}")
        
        # Crear registros de nombres comunes
        print("\n📋 Creando registros de nombres comunes...")
        
        creados_es = 0
        creados_en = 0
        no_encontrados = []
        sin_nombre_es = []
        sin_nombre_en = []
        errores = []
        
        for nombre_cientifico_excel_lower, nombres in excel_map.items():
            # Buscar en la vista
            if nombre_cientifico_excel_lower not in especies_vista:
                no_encontrados.append(nombre_cientifico_excel_lower)
                continue
            
            taxon_id = especies_vista[nombre_cientifico_excel_lower]
            nombre_es = nombres.get('nombre_es')
            nombre_en = nombres.get('nombre_en')
            
            # Crear registro en español
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
                    errores.append(f"{nombre_cientifico_excel_lower} (ES): {str(e)}")
                    print(f"  ❌ Error creando ES para {nombre_cientifico_excel_lower}: {e}")
            else:
                sin_nombre_es.append(nombre_cientifico_excel_lower)
            
            # Crear registro en inglés
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
                    errores.append(f"{nombre_cientifico_excel_lower} (EN): {str(e)}")
                    print(f"  ❌ Error creando EN para {nombre_cientifico_excel_lower}: {e}")
            else:
                sin_nombre_en.append(nombre_cientifico_excel_lower)
        
        # Verificación final
        print("\n🔍 Verificando resultado final...")
        nombres_finales = supabase.table('nombre_comun').select(
            'taxon_id, catalogo_awe_idioma_id'
        ).in_('taxon_id', list(especies_vista.values())).in_('catalogo_awe_idioma_id', [1, 8]).execute()
        
        especies_final_es = set()
        especies_final_en = set()
        for nc in nombres_finales.data:
            if nc['catalogo_awe_idioma_id'] == 1:
                especies_final_es.add(nc['taxon_id'])
            elif nc['catalogo_awe_idioma_id'] == 8:
                especies_final_en.add(nc['taxon_id'])
        
        # Resumen
        print(f"\n📊 Resumen:")
        print(f"  ✅ Registros creados en español: {creados_es}")
        print(f"  ✅ Registros creados en inglés: {creados_en}")
        print(f"  ⚠️  Especies no encontradas en vista: {len(no_encontrados)}")
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
        
        if no_encontrados:
            print(f"\n⚠️  Primeras 10 especies no encontradas en vista:")
            for especie in no_encontrados[:10]:
                print(f"    - {especie}")
            if len(no_encontrados) > 10:
                print(f"    ... y {len(no_encontrados) - 10} más")
        
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
