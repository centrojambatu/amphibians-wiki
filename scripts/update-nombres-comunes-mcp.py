#!/usr/bin/env python3
"""
Script para actualizar nombres comunes desde Excel usando MCP
Actualiza o crea registros en nombre_comun para las 690 especies:
- catalogo_awe_idioma_id = 1 (español)
- catalogo_awe_idioma_id = 8 (inglés)
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
    
    # Obtener todas las especies de ficha_especie (las 690 especies)
    print("\n🔍 Obteniendo especies de ficha_especie...")
    ficha_response = supabase.table('ficha_especie').select('taxon_id').execute()
    
    # Obtener información de taxones
    taxon_ids = [f['taxon_id'] for f in ficha_response.data]
    taxon_response = supabase.table('taxon').select('id_taxon, taxon, rank_id').in_('id_taxon', taxon_ids).execute()
    
    # Crear mapa: nombre_especie -> id_taxon
    especies_map = {}  # nombre_especie (lowercase) -> id_taxon
    especies_ficha = set()  # IDs de especies que tienen ficha
    
    # Mapear especies: nombre_especie -> id_taxon
    # En la BD, taxon solo contiene el epíteto específico (segunda palabra)
    for taxon in taxon_response.data:
        if taxon['rank_id'] == 7:  # Especie
            nombre_especie = taxon['taxon'].strip().lower()
            taxon_id = taxon['id_taxon']
            # Solo agregar al mapa si no existe (para evitar sobrescribir)
            if nombre_especie not in especies_map:
                especies_map[nombre_especie] = taxon_id
            especies_ficha.add(taxon_id)
    
    print(f"✅ Especies en ficha_especie: {len(especies_ficha)}")
    
    # Obtener nombres comunes existentes solo para especies en ficha_especie
    print("\n🔍 Obteniendo nombres comunes existentes...")
    nombres_comunes_response = supabase.table('nombre_comun').select(
        'id_nombre_comun, taxon_id, catalogo_awe_idioma_id, nombre'
    ).in_('taxon_id', list(especies_ficha)).execute()
    
    # Crear mapa: (taxon_id, idioma_id) -> id_nombre_comun
    nombres_comunes_existentes = {}
    for nc in nombres_comunes_response.data:
        if nc['taxon_id'] in especies_ficha and nc['catalogo_awe_idioma_id'] in [1, 8]:
            key = (nc['taxon_id'], nc['catalogo_awe_idioma_id'])
            # Si ya existe, mantener el primero (o el que tenga principal=True)
            if key not in nombres_comunes_existentes:
                nombres_comunes_existentes[key] = nc['id_nombre_comun']
    
    print(f"✅ Nombres comunes existentes: {len(nombres_comunes_existentes)}")
    
    # Procesar especies del Excel
    print("\n📋 Procesando especies del Excel...")
    
    creados_es = 0
    actualizados_es = 0
    creados_en = 0
    actualizados_en = 0
    no_encontrados = []
    sin_nombre_es = []
    sin_nombre_en = []
    
    for idx, row in df_clean.iterrows():
        nombre_cientifico = str(row[species_col]).strip()
        nombre_cientifico_lower = nombre_cientifico.lower()
        
        # Extraer el epíteto específico (segunda palabra) del nombre científico
        # En la BD, taxon solo contiene el epíteto específico
        partes = nombre_cientifico_lower.split()
        if len(partes) < 2:
            no_encontrados.append(nombre_cientifico)
            continue
        
        epiteto_especifico = partes[1]  # Segunda palabra (epíteto específico)
        
        # Buscar taxon_id usando el epíteto específico
        if epiteto_especifico not in especies_map:
            no_encontrados.append(nombre_cientifico)
            continue
        
        taxon_id = especies_map[epiteto_especifico]
        
        # Procesar nombre común en español
        if nombre_comun_es_col:
            nombre_comun_es = str(row[nombre_comun_es_col]).strip() if pd.notna(row[nombre_comun_es_col]) else None
            
            if nombre_comun_es and nombre_comun_es.lower() not in ['nan', 'none', '']:
                key_es = (taxon_id, 1)  # catalogo_awe_idioma_id = 1 (español)
                
                if key_es in nombres_comunes_existentes:
                    # Actualizar registro existente
                    id_nombre_comun = nombres_comunes_existentes[key_es]
                    try:
                        supabase.table('nombre_comun').update({
                            'nombre': nombre_comun_es,
                            'principal': True
                        }).eq('id_nombre_comun', id_nombre_comun).execute()
                        actualizados_es += 1
                    except Exception as e:
                        print(f"  ⚠️  Error actualizando español para {nombre_cientifico}: {e}")
                else:
                    # Crear nuevo registro
                    try:
                        supabase.table('nombre_comun').insert({
                            'taxon_id': taxon_id,
                            'nombre': nombre_comun_es,
                            'catalogo_awe_idioma_id': 1,  # Español
                            'principal': True
                        }).execute()
                        creados_es += 1
                    except Exception as e:
                        print(f"  ⚠️  Error creando español para {nombre_cientifico}: {e}")
            else:
                sin_nombre_es.append(nombre_cientifico)
        
        # Procesar nombre común en inglés
        if nombre_comun_en_col:
            nombre_comun_en = str(row[nombre_comun_en_col]).strip() if pd.notna(row[nombre_comun_en_col]) else None
            
            if nombre_comun_en and nombre_comun_en.lower() not in ['nan', 'none', '']:
                key_en = (taxon_id, 8)  # catalogo_awe_idioma_id = 8 (inglés)
                
                if key_en in nombres_comunes_existentes:
                    # Actualizar registro existente
                    id_nombre_comun = nombres_comunes_existentes[key_en]
                    try:
                        supabase.table('nombre_comun').update({
                            'nombre': nombre_comun_en,
                            'principal': True
                        }).eq('id_nombre_comun', id_nombre_comun).execute()
                        actualizados_en += 1
                    except Exception as e:
                        print(f"  ⚠️  Error actualizando inglés para {nombre_cientifico}: {e}")
                else:
                    # Crear nuevo registro
                    try:
                        supabase.table('nombre_comun').insert({
                            'taxon_id': taxon_id,
                            'nombre': nombre_comun_en,
                            'catalogo_awe_idioma_id': 8,  # Inglés
                            'principal': True
                        }).execute()
                        creados_en += 1
                    except Exception as e:
                        print(f"  ⚠️  Error creando inglés para {nombre_cientifico}: {e}")
            else:
                sin_nombre_en.append(nombre_cientifico)
    
    # Resumen
    print(f"\n📊 Resumen de actualización:")
    print(f"  ✅ Nombres comunes en español:")
    print(f"     - Creados: {creados_es}")
    print(f"     - Actualizados: {actualizados_es}")
    print(f"     - Sin nombre en Excel: {len(sin_nombre_es)}")
    print(f"  ✅ Nombres comunes en inglés:")
    print(f"     - Creados: {creados_en}")
    print(f"     - Actualizados: {actualizados_en}")
    print(f"     - Sin nombre en Excel: {len(sin_nombre_en)}")
    print(f"  ⚠️  Especies no encontradas en BD: {len(no_encontrados)}")
    
    if no_encontrados:
        print(f"\n⚠️  Primeras 10 especies no encontradas:")
        for especie in no_encontrados[:10]:
            print(f"    - {especie}")
        if len(no_encontrados) > 10:
            print(f"    ... y {len(no_encontrados) - 10} más")
    
    total_es = creados_es + actualizados_es
    total_en = creados_en + actualizados_en
    
    print(f"\n🎯 Total procesado:")
    print(f"  Español: {total_es} registros")
    print(f"  Inglés: {total_en} registros")
    print(f"  Total: {total_es + total_en} registros")
    
    if total_es == 690 and total_en == 690:
        print(f"\n✅ ¡Perfecto! Se procesaron las 690 especies en ambos idiomas")
    else:
        print(f"\n⚠️  Faltan algunos registros. Verificar las especies no encontradas o sin nombre común.")

if __name__ == "__main__":
    main()

