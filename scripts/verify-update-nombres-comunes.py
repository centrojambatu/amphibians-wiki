#!/usr/bin/env python3
"""
Script para verificar y actualizar nombres comunes desde Excel
SOLO actualiza registros existentes, NO crea nuevos registros
Compara correctamente la columna species del Excel con el nombre científico en la BD
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
        
        # Mostrar columnas para verificar
        print(f"\n📋 Columnas encontradas en el Excel:")
        for i, col in enumerate(df.columns):
            print(f"  {i+1}. {col}")
        
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
        
        if not nombre_comun_es_col and not nombre_comun_en_col:
            print("❌ Error: No se encontraron columnas de nombres comunes")
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
        
        # Obtener todas las especies de ficha_especie
        print("\n🔍 Obteniendo especies de ficha_especie...")
        ficha_response = supabase.table('ficha_especie').select('taxon_id').execute()
        
        # Obtener taxon_ids de especies
        taxon_ids = [f['taxon_id'] for f in ficha_response.data]
        print(f"  - Taxones en ficha_especie: {len(taxon_ids)}")
        
        # Obtener TODOS los géneros primero (rank_id = 6)
        print("🔍 Obteniendo todos los géneros...")
        generos_response = supabase.table('taxon').select('id_taxon, taxon').eq('rank_id', 6).execute()
        generos_map = {row['id_taxon']: row['taxon'] for row in generos_response.data}
        print(f"  - Géneros encontrados: {len(generos_map)}")
        
        # Obtener información de especies (rank_id = 7) que están en ficha_especie
        print("🔍 Obteniendo especies de ficha_especie...")
        especies_response = supabase.table('taxon').select('id_taxon, taxon, taxon_id').eq('rank_id', 7).in_('id_taxon', taxon_ids).execute()
        print(f"  - Especies encontradas: {len(especies_response.data)}")
        
        # Crear mapa: nombre_cientifico_completo -> id_taxon
        especies_map = {}  # nombre_cientifico_completo (lowercase) -> id_taxon
        taxon_id_to_nombre_completo = {}  # id_taxon -> nombre_cientifico_completo
        
        # Construir nombres completos de especies
        for especie in especies_response.data:
            especie_id = especie['id_taxon']
            nombre_especie = especie['taxon']
            genero_id = especie.get('taxon_id')
            
            if genero_id and genero_id in generos_map:
                genero_nombre = generos_map[genero_id]
                nombre_completo = f"{genero_nombre} {nombre_especie}".lower()
                especies_map[nombre_completo] = especie_id
                taxon_id_to_nombre_completo[especie_id] = nombre_completo
        
        print(f"✅ Especies mapeadas: {len(especies_map)}")
        
        # Obtener nombres comunes existentes
        print("\n🔍 Obteniendo nombres comunes existentes...")
        nombres_comunes_response = supabase.table('nombre_comun').select(
            'id_nombre_comun, taxon_id, catalogo_awe_idioma_id, nombre'
        ).in_('taxon_id', list(taxon_id_to_nombre_completo.keys())).execute()
        
        # Crear mapa: (taxon_id, idioma_id) -> {id, nombre}
        nombres_comunes_existentes = {}
        for nc in nombres_comunes_response.data:
            if nc['taxon_id'] in taxon_id_to_nombre_completo and nc['catalogo_awe_idioma_id'] in [1, 8]:
                key = (nc['taxon_id'], nc['catalogo_awe_idioma_id'])
                # Si hay múltiples, mantener el primero (o el principal)
                if key not in nombres_comunes_existentes:
                    nombres_comunes_existentes[key] = {
                        'id': nc['id_nombre_comun'],
                        'nombre': nc['nombre']
                    }
        
        print(f"✅ Nombres comunes existentes: {len(nombres_comunes_existentes)}")
        
        # Procesar especies del Excel
        print("\n📋 Comparando y actualizando nombres comunes del Excel...")
        
        actualizados_es = 0
        actualizados_en = 0
        sin_cambios_es = 0
        sin_cambios_en = 0
        no_encontrados = []
        sin_registro_es = []
        sin_registro_en = []
        errores = []
        registros_malos = []  # Para guardar los registros que estaban mal
        
        for idx, row in df_clean.iterrows():
            try:
                nombre_cientifico_excel = str(row[species_col]).strip()
                nombre_cientifico_excel_lower = nombre_cientifico_excel.lower()
                
                # Buscar el taxon_id usando el nombre científico completo
                if nombre_cientifico_excel_lower not in especies_map:
                    no_encontrados.append(nombre_cientifico_excel)
                    continue
                
                taxon_id = especies_map[nombre_cientifico_excel_lower]
                
                # Procesar nombre común en español
                if nombre_comun_es_col:
                    nombre_comun_es_excel = str(row[nombre_comun_es_col]).strip() if pd.notna(row[nombre_comun_es_col]) else None
                    
                    if nombre_comun_es_excel and nombre_comun_es_excel.lower() not in ['nan', 'none', '']:
                        key_es = (taxon_id, 1)  # catalogo_awe_idioma_id = 1 (español)
                        
                        if key_es in nombres_comunes_existentes:
                            # Existe registro, verificar si necesita actualización
                            registro_existente = nombres_comunes_existentes[key_es]
                            nombre_existente = registro_existente['nombre'].strip()
                            
                            if nombre_existente != nombre_comun_es_excel:
                                # Guardar información del registro malo
                                registros_malos.append({
                                    'especie': nombre_cientifico_excel,
                                    'idioma': 'Español',
                                    'nombre_anterior': nombre_existente,
                                    'nombre_correcto': nombre_comun_es_excel
                                })
                                # Actualizar solo si es diferente
                                try:
                                    supabase.table('nombre_comun').update({
                                        'nombre': nombre_comun_es_excel
                                    }).eq('id_nombre_comun', registro_existente['id']).execute()
                                    actualizados_es += 1
                                    print(f"  ✅ Actualizado ES: {nombre_cientifico_excel}")
                                    print(f"     Anterior: '{nombre_existente}' -> Correcto: '{nombre_comun_es_excel}'")
                                except Exception as e:
                                    errores.append(f"{nombre_cientifico_excel} (ES): {str(e)}")
                                    print(f"  ❌ Error actualizando ES para {nombre_cientifico_excel}: {e}")
                            else:
                                sin_cambios_es += 1
                        else:
                            # No existe registro, NO crear (según instrucciones)
                            # Pero guardamos la información para reporte
                            sin_registro_es.append({
                                'especie': nombre_cientifico_excel,
                                'nombre_excel': nombre_comun_es_excel
                            })
                            print(f"  ⚠️  Sin registro ES para {nombre_cientifico_excel} (Excel tiene: '{nombre_comun_es_excel}')")
                
                # Procesar nombre común en inglés
                if nombre_comun_en_col:
                    nombre_comun_en_excel = str(row[nombre_comun_en_col]).strip() if pd.notna(row[nombre_comun_en_col]) else None
                    
                    if nombre_comun_en_excel and nombre_comun_en_excel.lower() not in ['nan', 'none', '']:
                        key_en = (taxon_id, 8)  # catalogo_awe_idioma_id = 8 (inglés)
                        
                        if key_en in nombres_comunes_existentes:
                            # Existe registro, verificar si necesita actualización
                            registro_existente = nombres_comunes_existentes[key_en]
                            nombre_existente = registro_existente['nombre'].strip()
                            
                            if nombre_existente != nombre_comun_en_excel:
                                # Guardar información del registro malo
                                registros_malos.append({
                                    'especie': nombre_cientifico_excel,
                                    'idioma': 'Inglés',
                                    'nombre_anterior': nombre_existente,
                                    'nombre_correcto': nombre_comun_en_excel
                                })
                                # Actualizar solo si es diferente
                                try:
                                    supabase.table('nombre_comun').update({
                                        'nombre': nombre_comun_en_excel
                                    }).eq('id_nombre_comun', registro_existente['id']).execute()
                                    actualizados_en += 1
                                    print(f"  ✅ Actualizado EN: {nombre_cientifico_excel}")
                                    print(f"     Anterior: '{nombre_existente}' -> Correcto: '{nombre_comun_en_excel}'")
                                except Exception as e:
                                    errores.append(f"{nombre_cientifico_excel} (EN): {str(e)}")
                                    print(f"  ❌ Error actualizando EN para {nombre_cientifico_excel}: {e}")
                            else:
                                sin_cambios_en += 1
                    else:
                        # No existe registro, NO crear (según instrucciones)
                        # Pero guardamos la información para reporte
                        sin_registro_en.append({
                            'especie': nombre_cientifico_excel,
                            'nombre_excel': nombre_comun_en_excel
                        })
                        print(f"  ⚠️  Sin registro EN para {nombre_cientifico_excel} (Excel tiene: '{nombre_comun_en_excel}')")
            
            except Exception as e:
                errores.append(f"Fila {idx}: {str(e)}")
                print(f"  ❌ Error procesando fila {idx}: {e}")
        
        # Resumen
        print(f"\n📊 Resumen de verificación y actualización:")
        print(f"  ✅ Nombres comunes en español:")
        print(f"     - Actualizados: {actualizados_es}")
        print(f"     - Sin cambios: {sin_cambios_es}")
        print(f"     - Sin registro en BD: {len(sin_registro_es)}")
        print(f"  ✅ Nombres comunes en inglés:")
        print(f"     - Actualizados: {actualizados_en}")
        print(f"     - Sin cambios: {sin_cambios_en}")
        print(f"     - Sin registro en BD: {len(sin_registro_en)}")
        print(f"  ⚠️  Especies no encontradas en BD: {len(no_encontrados)}")
        print(f"  ❌ Errores: {len(errores)}")
        
        # Mostrar registros que estaban mal
        if registros_malos:
            print(f"\n📋 Registros que estaban incorrectos y fueron corregidos ({len(registros_malos)}):")
            for registro in registros_malos:
                print(f"  • {registro['especie']} ({registro['idioma']}):")
                print(f"    ❌ Anterior: '{registro['nombre_anterior']}'")
                print(f"    ✅ Correcto: '{registro['nombre_correcto']}'")
            
            # Guardar en archivo también
            output_file = "registros-nombres-comunes-corregidos.txt"
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(f"Registros de nombres comunes corregidos\n")
                f.write(f"Total: {len(registros_malos)}\n")
                f.write(f"=" * 80 + "\n\n")
                for registro in registros_malos:
                    f.write(f"Especie: {registro['especie']}\n")
                    f.write(f"Idioma: {registro['idioma']}\n")
                    f.write(f"Nombre anterior: {registro['nombre_anterior']}\n")
                    f.write(f"Nombre correcto: {registro['nombre_correcto']}\n")
                    f.write("-" * 80 + "\n")
            print(f"\n💾 Lista completa guardada en: {output_file}")
        
        if no_encontrados:
            print(f"\n⚠️  Primeras 10 especies no encontradas:")
            for especie in no_encontrados[:10]:
                print(f"    - {especie}")
            if len(no_encontrados) > 10:
                print(f"    ... y {len(no_encontrados) - 10} más")
        
    if sin_registro_es:
        print(f"\n⚠️  Primeras 10 especies sin registro en español (pero tienen nombre en Excel):")
        for item in sin_registro_es[:10]:
            if isinstance(item, dict):
                print(f"    - {item['especie']}: '{item['nombre_excel']}'")
            else:
                print(f"    - {item}")
        if len(sin_registro_es) > 10:
            print(f"    ... y {len(sin_registro_es) - 10} más")
        print(f"\n💡 Nota: Estas {len(sin_registro_es)} especies tienen nombre común en español en el Excel")
        print(f"   pero NO tienen registro en la BD. El script NO las creó (solo actualiza existentes).")
    
    if sin_registro_en:
        print(f"\n⚠️  Primeras 10 especies sin registro en inglés (pero tienen nombre en Excel):")
        for item in sin_registro_en[:10]:
            if isinstance(item, dict):
                print(f"    - {item['especie']}: '{item['nombre_excel']}'")
            else:
                print(f"    - {item}")
        if len(sin_registro_en) > 10:
            print(f"    ... y {len(sin_registro_en) - 10} más")
        print(f"\n💡 Nota: Estas {len(sin_registro_en)} especies tienen nombre común en inglés en el Excel")
        print(f"   pero NO tienen registro en la BD. El script NO las creó (solo actualiza existentes).")
        
        if errores:
            print(f"\n❌ Primeros 10 errores:")
            for error in errores[:10]:
                print(f"    - {error}")
            if len(errores) > 10:
                print(f"    ... y {len(errores) - 10} más")
        
        total_actualizados = actualizados_es + actualizados_en
        print(f"\n🎯 Total actualizado: {total_actualizados} registros")
        print(f"   (Español: {actualizados_es}, Inglés: {actualizados_en})")
    
    except Exception as e:
        print(f"\n❌ Error fatal: {str(e)}")
        print(f"\n📋 Traceback completo:")
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
