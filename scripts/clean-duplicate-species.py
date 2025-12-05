#!/usr/bin/env python3
"""
Script para limpiar especies duplicadas y asegurar que solo haya 690 especies del Excel
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

    # Identificar columna Species
    species_col = None
    for col in df.columns:
        if 'species' in str(col).lower():
            species_col = col
            break

    if not species_col:
        print("❌ Error: No se encontró la columna Species")
        sys.exit(1)

    # Limpiar datos del Excel
    df_clean = df[[species_col]].copy()
    df_clean = df_clean.dropna(subset=[species_col])

    # Crear lista de especies del Excel (género + segunda palabra)
    especies_excel = set()
    especies_excel_detalle = {}  # nombre_completo -> {genero, especie}

    for idx, row in df_clean.iterrows():
        nombre_completo = str(row[species_col]).strip()
        partes = nombre_completo.split()
        if len(partes) >= 2:
            genero = partes[0]
            especie = ' '.join(partes[1:])  # Segunda palabra en adelante
            especies_excel.add(nombre_completo)
            especies_excel_detalle[nombre_completo] = {
                'genero': genero,
                'especie': especie
            }

    print(f"✅ Especies en Excel: {len(especies_excel)}")

    # Obtener todas las especies de la BD
    print("\n🔍 Obteniendo especies de la base de datos...")
    taxon_response = supabase.table('taxon').select('id_taxon, taxon, rank_id, taxon_id').eq('rank_id', 7).execute()

    if not taxon_response.data:
        print("❌ Error: No se pudieron obtener las especies")
        sys.exit(1)

    # Obtener géneros
    generos_map = {}  # id_taxon -> nombre
    generos_response = supabase.table('taxon').select('id_taxon, taxon').eq('rank_id', 6).execute()
    if generos_response.data:
        for gen in generos_response.data:
            generos_map[gen['id_taxon']] = gen['taxon']

    # Construir mapa de especies en BD: nombre_completo -> lista de ids
    especies_bd = defaultdict(list)  # nombre_completo -> [id_taxon1, id_taxon2, ...]

    for especie_taxon in taxon_response.data:
        especie_id = especie_taxon['id_taxon']
        nombre_especie = especie_taxon['taxon']
        genero_id = especie_taxon['taxon_id']

        if genero_id and genero_id in generos_map:
            genero_nombre = generos_map[genero_id]
            nombre_completo = f"{genero_nombre} {nombre_especie}"
            especies_bd[nombre_completo].append({
                'id_taxon': especie_id,
                'nombre_especie': nombre_especie,
                'genero': genero_nombre
            })

    print(f"✅ Especies en BD: {len(taxon_response.data)}")
    print(f"✅ Especies únicas en BD: {len(especies_bd)}")

    # Identificar duplicados
    duplicados = {}
    especies_sin_duplicados = {}

    for nombre_completo, registros in especies_bd.items():
        if len(registros) > 1:
            # Ordenar por id_taxon (los más recientes tienen IDs mayores)
            registros_ordenados = sorted(registros, key=lambda x: x['id_taxon'], reverse=True)
            duplicados[nombre_completo] = registros_ordenados[1:]  # Todos excepto el primero (más antiguo)
            especies_sin_duplicados[nombre_completo] = registros_ordenados[0]  # Mantener el más antiguo
        else:
            especies_sin_duplicados[nombre_completo] = registros[0]

    print(f"\n📊 Análisis de duplicados:")
    print(f"  ⚠️  Especies con duplicados: {len(duplicados)}")

    total_duplicados = sum(len(regs) for regs in duplicados.values())
    print(f"  ➖ Total registros duplicados a eliminar: {total_duplicados}")

    # Identificar especies que no están en el Excel
    especies_no_en_excel = set(especies_bd.keys()) - especies_excel

    print(f"\n📊 Especies fuera del Excel:")
    print(f"  ❌ Especies en BD que NO están en Excel: {len(especies_no_en_excel)}")

    # Obtener IDs de especies que no están en Excel para eliminarlas
    especies_eliminar_no_excel = []
    for nombre_completo in especies_no_en_excel:
        if nombre_completo in especies_bd:
            for registro in especies_bd[nombre_completo]:
                especies_eliminar_no_excel.append(registro['id_taxon'])

    # Eliminar duplicados y especies no en Excel
    eliminados = 0
    eliminados_no_excel = 0
    errores = []

    # Primero eliminar duplicados
    if duplicados:
        print(f"\n🔄 Eliminando {total_duplicados} registros duplicados...")

        for nombre_completo, registros in duplicados.items():
            for registro in registros:
                try:
                    # Eliminar de taxon_catalogo_awe primero (si existe)
                    supabase.table('taxon_catalogo_awe').delete().eq('taxon_id', registro['id_taxon']).execute()

                    # Eliminar de ficha_especie (si existe)
                    supabase.table('ficha_especie').delete().eq('taxon_id', registro['id_taxon']).execute()

                    # Eliminar de taxon
                    supabase.table('taxon').delete().eq('id_taxon', registro['id_taxon']).execute()

                    eliminados += 1
                    if eliminados % 50 == 0:
                        print(f"  📊 Progreso: {eliminados} duplicados eliminados...")

                except Exception as e:
                    errores.append(f"{nombre_completo} (ID: {registro['id_taxon']}): {str(e)}")

    # Luego eliminar especies que no están en Excel
    if especies_eliminar_no_excel:
        print(f"\n🔄 Eliminando {len(especies_eliminar_no_excel)} especies que NO están en Excel...")

        for especie_id in especies_eliminar_no_excel:
            try:
                # Eliminar de taxon_catalogo_awe primero (si existe)
                supabase.table('taxon_catalogo_awe').delete().eq('taxon_id', especie_id).execute()

                # Eliminar de ficha_especie (si existe)
                supabase.table('ficha_especie').delete().eq('taxon_id', especie_id).execute()

                # Eliminar de taxon
                supabase.table('taxon').delete().eq('id_taxon', especie_id).execute()

                eliminados_no_excel += 1
                if eliminados_no_excel % 50 == 0:
                    print(f"  📊 Progreso: {eliminados_no_excel} especies eliminadas...")

            except Exception as e:
                errores.append(f"Especie ID {especie_id}: {str(e)}")

    # Resumen
    print(f"\n📊 Resumen de limpieza:")
    print(f"  ➖ Registros duplicados eliminados: {eliminados}")
    print(f"  ➖ Especies no en Excel eliminadas: {eliminados_no_excel}")
    print(f"  ➖ Total eliminados: {eliminados + eliminados_no_excel}")
    print(f"  ❌ Errores: {len(errores)}")

    if errores:
        print(f"\n❌ Errores (primeros 10):")
        for error in errores[:10]:
            print(f"    - {error}")

    # Verificación final
    print(f"\n🔍 Verificación final...")
    taxon_final = supabase.table('taxon').select('id_taxon').eq('rank_id', 7).execute()
    total_final = len(taxon_final.data) if taxon_final.data else 0

    print(f"  📊 Total especies después de limpieza: {total_final}")
    print(f"  📋 Total especies esperadas (Excel): {len(especies_excel)}")

    if total_final == len(especies_excel):
        print(f"\n✅ ¡Perfecto! Hay exactamente {len(especies_excel)} especies en la BD")
    else:
        diferencia = total_final - len(especies_excel)
        print(f"\n⚠️  Diferencia: {abs(diferencia)} especies {'más' if diferencia > 0 else 'menos'} de lo esperado")

if __name__ == "__main__":
    main()

