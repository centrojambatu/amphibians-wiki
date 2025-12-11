#!/usr/bin/env python3
"""
Script para agregar todas las especies del Excel a la base de datos
Incluye: taxon (género y especie), ficha_especie, Red List, rango altitudinal y endemismo
"""
import pandas as pd
import os
import sys
from supabase import create_client, Client
from dotenv import load_dotenv
from collections import defaultdict

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
    familia_col = None
    orden_col = None
    red_list_col = None
    endemism_col = None
    alt_min_col = None
    alt_max_col = None

    for col in df.columns:
        col_lower = str(col).lower().strip()
        if 'species' in col_lower and not species_col:
            species_col = col
        if 'familly' in col_lower or 'familia' in col_lower:
            familia_col = col
        if 'order' in col_lower and 'catalog' not in col_lower:
            orden_col = col
        if 'red list' in col_lower:
            red_list_col = col
        if 'endemism' in col_lower or 'endemica' in col_lower:
            endemism_col = col
        if 'minim altitude' in col_lower or 'min altitude' in col_lower:
            alt_min_col = col
        if 'max altitude' in col_lower:
            alt_max_col = col

    print(f"\n🔍 Columnas identificadas:")
    print(f"  Species: {species_col}")
    print(f"  Familia: {familia_col}")
    print(f"  Orden: {orden_col}")
    print(f"  Red List: {red_list_col}")
    print(f"  Endemism: {endemism_col}")
    print(f"  Alt Min: {alt_min_col}")
    print(f"  Alt Max: {alt_max_col}")

    if not species_col:
        print("❌ Error: No se encontró la columna Species")
        sys.exit(1)

    # Limpiar datos
    columnas_necesarias = [species_col]
    if familia_col:
        columnas_necesarias.append(familia_col)
    if orden_col:
        columnas_necesarias.append(orden_col)
    if red_list_col:
        columnas_necesarias.append(red_list_col)
    if endemism_col:
        columnas_necesarias.append(endemism_col)
    if alt_min_col:
        columnas_necesarias.append(alt_min_col)
    if alt_max_col:
        columnas_necesarias.append(alt_max_col)

    df_clean = df[columnas_necesarias].copy()
    df_clean = df_clean.dropna(subset=[species_col])

    # Obtener taxones existentes
    print("\n🔍 Obteniendo taxones existentes de la base de datos...")
    taxon_response = supabase.table('taxon').select('id_taxon, taxon, rank_id, taxon_id').execute()

    familias_existentes = {}  # nombre -> id_taxon
    generos_existentes = {}  # nombre -> id_taxon
    especies_existentes = {}  # nombre completo (género + especie) -> id_taxon

    # Obtener géneros y especies para construir nombres completos
    generos_map = {}  # id_taxon -> nombre
    especies_map = {}  # id_taxon -> {nombre_especie, genero_id}

    for taxon in taxon_response.data:
        if taxon['rank_id'] == 5:  # Familia
            familias_existentes[taxon['taxon']] = taxon['id_taxon']
        elif taxon['rank_id'] == 6:  # Género
            generos_existentes[taxon['taxon']] = taxon['id_taxon']
            generos_map[taxon['id_taxon']] = taxon['taxon']
        elif taxon['rank_id'] == 7:  # Especie
            especies_map[taxon['id_taxon']] = {
                'nombre': taxon['taxon'],
                'genero_id': taxon['taxon_id']
            }

    # Construir nombres completos de especies
    for especie_id, especie_data in especies_map.items():
        genero_id = especie_data['genero_id']
        if genero_id and genero_id in generos_map:
            genero_nombre = generos_map[genero_id]
            nombre_completo = f"{genero_nombre} {especie_data['nombre']}"
            especies_existentes[nombre_completo] = especie_id

    print(f"✅ Familias existentes: {len(familias_existentes)}")
    print(f"✅ Géneros existentes: {len(generos_existentes)}")
    print(f"✅ Especies existentes: {len(especies_existentes)}")

    # Obtener catálogos de Red List
    print("\n🔍 Obteniendo catálogos de Lista Roja UICN...")
    catalogo_response = supabase.table('catalogo_awe').select('id_catalogo_awe, nombre, sigla').eq('tipo_catalogo_awe_id', 10).execute()

    catalogo_map = {}
    for cat in catalogo_response.data:
        sigla = str(cat['sigla']).strip().upper() if cat['sigla'] else None
        nombre = str(cat['nombre']).strip().upper()
        if sigla:
            catalogo_map[sigla] = cat['id_catalogo_awe']
        catalogo_map[nombre] = cat['id_catalogo_awe']

    print(f"✅ Catálogos de Red List: {len(catalogo_map)}")

    # Función para obtener id_catalogo_awe
    def obtener_id_catalogo(valor):
        if pd.isna(valor) or valor == '' or str(valor).lower() == 'nan':
            return None
        valor_str = str(valor).strip().upper()
        if 'CR' in valor_str and ('PE' in valor_str or '(PE)' in valor_str):
            return catalogo_map.get('CR(PE)')
        valor_normalizado = valor_str.replace(' ', '').replace('(', '').replace(')', '')
        return catalogo_map.get(valor_str) or catalogo_map.get(valor_normalizado)

    # Función para determinar endemismo
    def es_endemica(valor):
        if pd.isna(valor) or valor == '' or str(valor).lower() == 'nan':
            return None
        valor_str = str(valor).strip().upper()
        if valor_str == 'E':
            return True
        if valor_str == 'NE':
            return False
        return None

    # Procesar especies
    generos_creados = 0
    especies_creadas = 0
    fichas_creadas = 0
    red_list_asignadas = 0
    altitudinal_actualizado = 0
    endemismo_actualizado = 0
    errores = []

    print(f"\n🔄 Procesando {len(df_clean)} especies del Excel...")

    for idx, row in df_clean.iterrows():
        try:
            nombre_cientifico = str(row[species_col]).strip()

            # Verificar si ya existe usando nombre completo
            if nombre_cientifico in especies_existentes:
                # Ya existe, verificar si tiene Red List
                especie_id_existente = especies_existentes[nombre_cientifico]
                # Verificar Red List (consulta simple sin join)
                red_list_check = supabase.table('taxon_catalogo_awe').select('id_taxon_catalogo_awe, catalogo_awe_id').eq('taxon_id', especie_id_existente).execute()

                # Verificar si alguno de los catálogos es de tipo Red List (tipo_catalogo_awe_id = 10)
                tiene_red_list = False
                if red_list_check.data:
                    # Obtener los IDs de catálogo y verificar si alguno es de Red List
                    catalogo_ids = [r['catalogo_awe_id'] for r in red_list_check.data]
                    if catalogo_ids:
                        catalogo_verificacion = supabase.table('catalogo_awe').select('id_catalogo_awe, tipo_catalogo_awe_id').in_('id_catalogo_awe', catalogo_ids).execute()
                        if catalogo_verificacion.data:
                            tiene_red_list = any(c['tipo_catalogo_awe_id'] == 10 for c in catalogo_verificacion.data)

                if not tiene_red_list:
                    # Existe pero no tiene Red List, asignarla
                    id_catalogo = obtener_id_catalogo(row[red_list_col] if red_list_col else None)
                    if id_catalogo:
                        supabase.table('taxon_catalogo_awe').insert({
                            'taxon_id': especie_id_existente,
                            'catalogo_awe_id': id_catalogo
                        }).execute()
                        red_list_asignadas += 1
                continue  # Ya existe, saltar creación

            # Extraer género y especie
            partes = nombre_cientifico.split()
            if len(partes) < 2:
                errores.append(f"{nombre_cientifico}: Nombre inválido")
                continue

            genero_nombre = partes[0]
            especie_nombre = ' '.join(partes[1:])  # Solo el nombre de la especie (segunda palabra en adelante)

            # Para buscar si existe, usar nombre completo
            nombre_completo_busqueda = nombre_cientifico

            # Obtener o crear familia
            familia_nombre = str(row[familia_col]).strip() if familia_col and pd.notna(row[familia_col]) else None

            if familia_nombre and familia_nombre not in familias_existentes:
                # Crear familia (sin orden por ahora, taxon_id = null)
                familia_response = supabase.table('taxon').insert({
                    'taxon': familia_nombre,
                    'rank_id': 5,
                    'taxon_id': None
                }).execute()

                if familia_response.data:
                    familia_id = familia_response.data[0]['id_taxon']
                    familias_existentes[familia_nombre] = familia_id
                    print(f"  ➕ Familia creada: {familia_nombre} (ID: {familia_id})")
                else:
                    familia_id = None
            elif familia_nombre:
                familia_id = familias_existentes[familia_nombre]
            else:
                familia_id = None

            # Crear o obtener género
            if genero_nombre not in generos_existentes:
                # Crear género apuntando a la familia
                genero_response = supabase.table('taxon').insert({
                    'taxon': genero_nombre,
                    'rank_id': 6,
                    'taxon_id': familia_id
                }).execute()

                if genero_response.data:
                    genero_id = genero_response.data[0]['id_taxon']
                    generos_existentes[genero_nombre] = genero_id
                    generos_creados += 1
                    print(f"  ➕ Género creado: {genero_nombre} (ID: {genero_id}, Familia: {familia_nombre or 'N/A'})")
                else:
                    errores.append(f"{nombre_cientifico}: Error creando género {genero_nombre}")
                    continue
            else:
                genero_id = generos_existentes[genero_nombre]

            # Crear especie
            especie_response = supabase.table('taxon').insert({
                'taxon': especie_nombre,
                'rank_id': 7,
                'taxon_id': genero_id
            }).execute()

            if not especie_response.data:
                errores.append(f"{nombre_cientifico}: Error creando especie")
                continue

            especie_id = especie_response.data[0]['id_taxon']
            especies_existentes[especie_nombre] = especie_id
            especies_creadas += 1

            # Crear ficha_especie
            ficha_response = supabase.table('ficha_especie').insert({
                'taxon_id': especie_id,
                'publicar': False
            }).execute()

            if ficha_response.data:
                fichas_creadas += 1

            # Actualizar rango altitudinal
            alt_min = row[alt_min_col] if alt_min_col and pd.notna(row[alt_min_col]) else None
            alt_max = row[alt_max_col] if alt_max_col and pd.notna(row[alt_max_col]) else None

            if alt_min is not None or alt_max is not None:
                update_data = {}
                if alt_min is not None:
                    update_data['rango_altitudinal_min'] = int(float(alt_min))
                if alt_max is not None:
                    update_data['rango_altitudinal_max'] = int(float(alt_max))

                if update_data and ficha_response.data:
                    supabase.table('ficha_especie').update(update_data).eq('taxon_id', especie_id).execute()
                    altitudinal_actualizado += 1

            # Actualizar endemismo
            endemica = es_endemica(row[endemism_col] if endemism_col else None)
            if endemica is not None:
                supabase.table('taxon').update({'endemica': endemica}).eq('id_taxon', especie_id).execute()
                endemismo_actualizado += 1

            # Asignar Red List
            id_catalogo = obtener_id_catalogo(row[red_list_col] if red_list_col else None)
            if id_catalogo:
                # Verificar que no exista ya
                existing = supabase.table('taxon_catalogo_awe').select('id_taxon_catalogo_awe').eq('taxon_id', especie_id).eq('catalogo_awe_id', id_catalogo).execute()

                if not existing.data:
                    supabase.table('taxon_catalogo_awe').insert({
                        'taxon_id': especie_id,
                        'catalogo_awe_id': id_catalogo
                    }).execute()
                    red_list_asignadas += 1

            if especies_creadas % 50 == 0:
                print(f"  📊 Progreso: {especies_creadas} especies creadas...")

        except Exception as e:
            errores.append(f"{nombre_cientifico}: {str(e)}")
            print(f"  ❌ Error procesando {nombre_cientifico}: {str(e)}")

    # Resumen
    print(f"\n📊 Resumen:")
    print(f"  ➕ Géneros creados: {generos_creados}")
    print(f"  ➕ Especies creadas: {especies_creadas}")
    print(f"  ➕ Fichas creadas: {fichas_creadas}")
    print(f"  ✅ Red List asignadas: {red_list_asignadas}")
    print(f"  ✅ Rangos altitudinales actualizados: {altitudinal_actualizado}")
    print(f"  ✅ Endemismo actualizado: {endemismo_actualizado}")
    print(f"  ❌ Errores: {len(errores)}")

    if errores:
        print(f"\n❌ Errores (primeros 10):")
        for error in errores[:10]:
            print(f"    - {error}")

if __name__ == "__main__":
    main()

