#!/usr/bin/env python3
"""
Script para actualizar la tabla nombre_comun con los nombres comunes del Excel
Basado en la segunda palabra de la columna species (nombre de la especie)
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
    taxon_response = supabase.table('taxon').select('id_taxon, taxon, rank_id, taxon_id').in_('id_taxon', taxon_ids).execute()

    # Crear mapas: nombre_especie -> id_taxon y taxon_id -> nombre_especie
    especies_map = {}  # nombre_especie -> id_taxon (puede haber duplicados, pero usamos el primero)
    taxon_id_to_nombre = {}  # taxon_id -> nombre_especie
    especies_ficha = set()  # IDs de especies que tienen ficha

    # Mapear especies: nombre_especie -> id_taxon y taxon_id -> nombre_especie
    for taxon in taxon_response.data:
        if taxon['rank_id'] == 7:  # Especie
            nombre_especie = taxon['taxon'].strip().lower()
            taxon_id = taxon['id_taxon']
            # Solo agregar al mapa si no existe (para evitar sobrescribir)
            if nombre_especie not in especies_map:
                especies_map[nombre_especie] = taxon_id
            taxon_id_to_nombre[taxon_id] = nombre_especie
            especies_ficha.add(taxon_id)

    print(f"✅ Especies en ficha_especie: {len(especies_ficha)}")

    # Obtener nombres comunes existentes solo para especies en ficha_especie
    print("\n🔍 Obteniendo nombres comunes existentes...")
    nombres_comunes_response = supabase.table('nombre_comun').select('id_nombre_comun, taxon_id, catalogo_awe_idioma_id, nombre').in_('taxon_id', list(especies_ficha)).execute()

    # Crear mapa: (taxon_id, idioma_id) -> lista de id_nombre_comun (puede haber duplicados)
    nombres_comunes_por_especie = {}
    for nc in nombres_comunes_response.data:
        if nc['taxon_id'] in especies_ficha and nc['catalogo_awe_idioma_id'] in [1, 8]:
            key = (nc['taxon_id'], nc['catalogo_awe_idioma_id'])
            if key not in nombres_comunes_por_especie:
                nombres_comunes_por_especie[key] = []
            nombres_comunes_por_especie[key].append({
                'id': nc['id_nombre_comun'],
                'nombre': nc['nombre']
            })

    # Eliminar duplicados: mantener solo el primero y eliminar los demás
    print("\n🧹 Eliminando nombres comunes duplicados...")
    duplicados_eliminados = 0
    nombres_comunes_existentes = {}

    for key, lista_nombres in nombres_comunes_por_especie.items():
        if len(lista_nombres) > 1:
            # Mantener el primero, eliminar los demás
            nombres_comunes_existentes[key] = lista_nombres[0]['id']
            for duplicado in lista_nombres[1:]:
                supabase.table('nombre_comun').delete().eq('id_nombre_comun', duplicado['id']).execute()
                duplicados_eliminados += 1
        elif len(lista_nombres) == 1:
            nombres_comunes_existentes[key] = lista_nombres[0]['id']

    print(f"✅ Nombres comunes únicos: {len(nombres_comunes_existentes)}")
    print(f"🗑️  Duplicados eliminados: {duplicados_eliminados}")

    # Crear mapa de Excel: nombre_especie -> {es: nombre_es, en: nombre_en}
    print("\n📋 Creando mapa de nombres comunes del Excel...")
    excel_map = {}
    for idx, row in df_clean.iterrows():
        try:
            nombre_cientifico = str(row[species_col]).strip()
            partes = nombre_cientifico.split()
            if len(partes) >= 2:
                nombre_especie = partes[1].strip().lower()
                if nombre_especie in especies_map:
                    excel_map[nombre_especie] = {
                        'es': str(row[nombre_comun_es_col]).strip() if nombre_comun_es_col and pd.notna(row[nombre_comun_es_col]) else None,
                        'en': str(row[nombre_comun_en_col]).strip() if nombre_comun_en_col and pd.notna(row[nombre_comun_en_col]) else None
                    }
        except:
            pass

    print(f"✅ Nombres comunes en Excel: {len(excel_map)}")

    # Procesar especies
    actualizados = 0
    creados = 0
    no_encontradas = []
    errores = []
    especies_procesadas = set()

    print(f"\n🔄 Procesando {len(especies_ficha)} especies de ficha_especie...")

    # Procesar cada especie de ficha_especie
    for taxon_id in especies_ficha:
        try:
            # Obtener el nombre de la especie directamente del mapa
            nombre_especie = taxon_id_to_nombre.get(taxon_id)

            if not nombre_especie:
                no_encontradas.append(f"taxon_id {taxon_id}: No se encontró nombre de especie")
                continue

            # Obtener nombres comunes del Excel si están disponibles
            nombre_es = None
            nombre_en = None

            if nombre_especie in excel_map:
                nombre_es = excel_map[nombre_especie]['es']
                nombre_en = excel_map[nombre_especie]['en']
                # Limpiar valores
                if nombre_es and (nombre_es.lower() == 'nan' or nombre_es.strip() == ''):
                    nombre_es = None
                if nombre_en and (nombre_en.lower() == 'nan' or nombre_en.strip() == ''):
                    nombre_en = None

            # Procesar nombre común en español
            key_es = (taxon_id, 1)  # 1 = español

            if key_es in nombres_comunes_existentes:
                # Existe, actualizar si hay nuevo nombre del Excel
                if nombre_es:
                    id_nombre_comun = nombres_comunes_existentes[key_es]
                    supabase.table('nombre_comun').update({
                        'nombre': nombre_es
                    }).eq('id_nombre_comun', id_nombre_comun).execute()
                    actualizados += 1
            else:
                # No existe, crear si hay nombre del Excel
                if nombre_es:
                    response = supabase.table('nombre_comun').insert({
                        'nombre': nombre_es,
                        'taxon_id': taxon_id,
                        'catalogo_awe_idioma_id': 1,  # Español
                        'principal': False
                    }).execute()
                    creados += 1
                    if response.data and len(response.data) > 0:
                        nombres_comunes_existentes[key_es] = response.data[0]['id_nombre_comun']
                else:
                    no_encontradas.append(f"{nombre_especie}: Sin nombre común en español en Excel")

            # Procesar nombre común en inglés
            key_en = (taxon_id, 8)  # 8 = inglés

            if key_en in nombres_comunes_existentes:
                # Existe, actualizar si hay nuevo nombre del Excel
                if nombre_en:
                    id_nombre_comun = nombres_comunes_existentes[key_en]
                    supabase.table('nombre_comun').update({
                        'nombre': nombre_en
                    }).eq('id_nombre_comun', id_nombre_comun).execute()
                    actualizados += 1
            else:
                # No existe, crear si hay nombre del Excel
                if nombre_en:
                    response = supabase.table('nombre_comun').insert({
                        'nombre': nombre_en,
                        'taxon_id': taxon_id,
                        'catalogo_awe_idioma_id': 8,  # Inglés
                        'principal': False
                    }).execute()
                    creados += 1
                    if response.data and len(response.data) > 0:
                        nombres_comunes_existentes[key_en] = response.data[0]['id_nombre_comun']
                else:
                    no_encontradas.append(f"{nombre_especie}: Sin nombre común en inglés en Excel")

            especies_procesadas.add(taxon_id)

            if len(especies_procesadas) % 50 == 0:
                print(f"  📊 Progreso: {len(especies_procesadas)}/{len(especies_ficha)} especies procesadas...")

        except Exception as e:
            errores.append(f"taxon_id {taxon_id}: {str(e)}")
            print(f"  ❌ Error procesando taxon_id {taxon_id}: {str(e)}")

    # Eliminar duplicados finales usando SQL directo: mantener solo el primer registro (menor id) para cada (taxon_id, idioma_id)
    print("\n🧹 Eliminando duplicados finales...")
    delete_query = """
    DELETE FROM nombre_comun
    WHERE id_nombre_comun IN (
        SELECT nc2.id_nombre_comun
        FROM nombre_comun nc2
        WHERE nc2.taxon_id IN (SELECT taxon_id FROM ficha_especie)
          AND nc2.catalogo_awe_idioma_id IN (1, 8)
          AND nc2.id_nombre_comun NOT IN (
              SELECT MIN(nc3.id_nombre_comun)
              FROM nombre_comun nc3
              WHERE nc3.taxon_id = nc2.taxon_id
                AND nc3.catalogo_awe_idioma_id = nc2.catalogo_awe_idioma_id
              GROUP BY nc3.taxon_id, nc3.catalogo_awe_idioma_id
          )
    )
    """
    # Ejecutar usando execute_sql a través de Supabase (si está disponible) o usar rpc
    # Como no tenemos acceso directo a execute_sql desde el cliente Python, usamos una aproximación diferente
    # Obtenemos todos los duplicados y los eliminamos
    nombres_finales = supabase.table('nombre_comun').select('id_nombre_comun, taxon_id, catalogo_awe_idioma_id').in_('taxon_id', list(especies_ficha)).in_('catalogo_awe_idioma_id', [1, 8]).execute()

    # Agrupar por (taxon_id, idioma_id) y mantener solo el primero (menor id)
    duplicados_finales_eliminados = 0
    nombres_por_especie_idioma = {}

    for nc in nombres_finales.data:
        key = (nc['taxon_id'], nc['catalogo_awe_idioma_id'])
        if key not in nombres_por_especie_idioma:
            nombres_por_especie_idioma[key] = []
        nombres_por_especie_idioma[key].append(nc['id_nombre_comun'])

    # Eliminar duplicados (mantener el menor id, eliminar los demás)
    ids_a_eliminar = []
    for key, lista_ids in nombres_por_especie_idioma.items():
        if len(lista_ids) > 1:
            lista_ids.sort()  # Ordenar para mantener el menor
            ids_a_eliminar.extend(lista_ids[1:])  # Todos excepto el primero

    # Eliminar en lotes
    if ids_a_eliminar:
        # Eliminar en grupos de 100 para evitar problemas de tamaño
        for i in range(0, len(ids_a_eliminar), 100):
            lote = ids_a_eliminar[i:i+100]
            for id_eliminar in lote:
                try:
                    supabase.table('nombre_comun').delete().eq('id_nombre_comun', id_eliminar).execute()
                    duplicados_finales_eliminados += 1
                except:
                    pass

    print(f"🗑️  Duplicados finales eliminados: {duplicados_finales_eliminados}")

    # Verificar resultado final
    print("\n🔍 Verificando resultado final...")
    verif_final = supabase.table('nombre_comun').select('taxon_id, catalogo_awe_idioma_id').in_('taxon_id', list(especies_ficha)).in_('catalogo_awe_idioma_id', [1, 8]).execute()

    especies_con_es = set()
    especies_con_en = set()
    for nc in verif_final.data:
        if nc['catalogo_awe_idioma_id'] == 1:
            especies_con_es.add(nc['taxon_id'])
        elif nc['catalogo_awe_idioma_id'] == 8:
            especies_con_en.add(nc['taxon_id'])

    # Resumen
    print(f"\n📊 Resumen:")
    print(f"  ➕ Nombres comunes creados: {creados}")
    print(f"  ✅ Nombres comunes actualizados: {actualizados}")
    print(f"  🗑️  Duplicados eliminados (inicial): {duplicados_eliminados}")
    print(f"  🗑️  Duplicados eliminados (final): {duplicados_finales_eliminados}")
    print(f"  📝 Especies con nombre en español: {len(especies_con_es)}/690")
    print(f"  📝 Especies con nombre en inglés: {len(especies_con_en)}/690")
    print(f"  ⚠️  Especies sin datos en Excel: {len(no_encontradas)}")
    print(f"  ❌ Errores: {len(errores)}")

    if no_encontradas:
        print(f"\n⚠️  Especies no encontradas (primeras 10):")
        for especie in no_encontradas[:10]:
            print(f"    - {especie}")

    if errores:
        print(f"\n❌ Errores (primeros 10):")
        for error in errores[:10]:
            print(f"    - {error}")

if __name__ == "__main__":
    main()
