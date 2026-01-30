#!/usr/bin/env python3
"""
Script para eliminar registros duplicados de Lista Roja UICN
Cada especie solo debe tener una categoría de Lista Roja
"""
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

    print("🔍 Buscando especies con múltiples registros de Lista Roja UICN...")

    # Obtener todos los registros de Lista Roja
    print("📊 Obteniendo lista de registros de Lista Roja...")
    all_red_list = supabase.table('taxon_catalogo_awe').select('id_taxon_catalogo_awe, taxon_id, catalogo_awe_id, catalogo_awe!inner(tipo_catalogo_awe_id, sigla, nombre)').eq('catalogo_awe.tipo_catalogo_awe_id', 10).execute()

    if not all_red_list.data:
        print("✅ No se encontraron registros de Lista Roja")
        return

    # Agrupar por taxon_id
    from collections import defaultdict
    taxon_records = defaultdict(list)

    for record in all_red_list.data:
        taxon_id = record['taxon_id']
        taxon_records[taxon_id].append(record)

    # Encontrar duplicados
    duplicates = {}
    for taxon_id, records in taxon_records.items():
        if len(records) > 1:
            duplicates[taxon_id] = records

    if not duplicates:
        print("✅ No se encontraron especies con registros duplicados de Lista Roja")
        return

    print(f"\n⚠️  Se encontraron {len(duplicates)} especies con registros duplicados")

    # Obtener nombres de especies
    taxon_ids = list(duplicates.keys())
    taxon_names = {}

    # Obtener nombres en lotes
    for i in range(0, len(taxon_ids), 100):
        batch = taxon_ids[i:i+100]
        taxon_response = supabase.table('taxon').select('id_taxon, taxon').in_('id_taxon', batch).execute()
        if taxon_response.data:
            for taxon in taxon_response.data:
                taxon_names[taxon['id_taxon']] = taxon['taxon']

    # Procesar duplicados
    eliminados = 0
    mantenidos = 0

    print("\n🔄 Eliminando duplicados (manteniendo el registro con ID más bajo)...")

    for taxon_id, records in duplicates.items():
        especie_nombre = taxon_names.get(taxon_id, f"ID {taxon_id}")

        # Ordenar por id_taxon_catalogo_awe (mantener el más antiguo/primer registro)
        records_sorted = sorted(records, key=lambda x: x['id_taxon_catalogo_awe'])

        # Mantener el primero, eliminar los demás
        mantener = records_sorted[0]
        eliminar = records_sorted[1:]

        # Verificar que todos tienen la misma categoría
        categorias = [r['catalogo_awe']['sigla'] for r in records_sorted]
        categoria_unica = len(set(categorias)) == 1

        if categoria_unica:
            print(f"  ⚠️  {especie_nombre}: {len(eliminar)} duplicados (misma categoría: {categorias[0]})")
        else:
            print(f"  ⚠️  {especie_nombre}: {len(eliminar)} duplicados (categorías diferentes: {', '.join(set(categorias))})")
            print(f"      → Manteniendo: {mantener['catalogo_awe']['sigla']} (ID: {mantener['id_taxon_catalogo_awe']})")

        # Eliminar duplicados
        for record in eliminar:
            try:
                delete_response = supabase.table('taxon_catalogo_awe').delete().eq('id_taxon_catalogo_awe', record['id_taxon_catalogo_awe']).execute()
                eliminados += 1
            except Exception as e:
                print(f"      ❌ Error eliminando registro {record['id_taxon_catalogo_awe']}: {str(e)}")

        mantenidos += 1

    print(f"\n📊 Resumen:")
    print(f"  ✅ Especies procesadas: {len(duplicates)}")
    print(f"  ➖ Registros eliminados: {eliminados}")
    print(f"  ✓ Registros mantenidos: {mantenidos}")

    # Verificar que no queden duplicados
    print("\n🔍 Verificando que no queden duplicados...")
    all_red_list_after = supabase.table('taxon_catalogo_awe').select('taxon_id, catalogo_awe!inner(tipo_catalogo_awe_id)').eq('catalogo_awe.tipo_catalogo_awe_id', 10).execute()

    if all_red_list_after.data:
        taxon_records_after = defaultdict(list)
        for record in all_red_list_after.data:
            taxon_id = record['taxon_id']
            taxon_records_after[taxon_id].append(record)

        duplicates_after = {tid: recs for tid, recs in taxon_records_after.items() if len(recs) > 1}

        if duplicates_after:
            print(f"  ⚠️  Aún quedan {len(duplicates_after)} especies con duplicados")
        else:
            print(f"  ✅ No quedan duplicados")

if __name__ == "__main__":
    main()

