#!/usr/bin/env python3
"""
Script para verificar el conteo real de nombres comunes
y ver cuántos registros únicos hay por idioma
"""
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
    
    # Obtener todas las especies de ficha_especie
    print("🔍 Obteniendo especies de ficha_especie...")
    ficha_response = supabase.table('ficha_especie').select('taxon_id').execute()
    taxon_ids = [f['taxon_id'] for f in ficha_response.data]
    print(f"  - Total especies: {len(taxon_ids)}")
    
    # Obtener todos los nombres comunes para estas especies
    print("\n🔍 Obteniendo nombres comunes...")
    nombres_response = supabase.table('nombre_comun').select(
        'id_nombre_comun, taxon_id, catalogo_awe_idioma_id, nombre'
    ).in_('taxon_id', taxon_ids).in_('catalogo_awe_idioma_id', [1, 8]).execute()
    
    print(f"  - Total registros: {len(nombres_response.data)}")
    
    # Contar por idioma
    registros_por_especie_idioma = defaultdict(list)
    for nc in nombres_response.data:
        key = (nc['taxon_id'], nc['catalogo_awe_idioma_id'])
        registros_por_especie_idioma[key].append(nc)
    
    # Contar especies únicas por idioma
    especies_es = set()
    especies_en = set()
    duplicados_es = []
    duplicados_en = []
    
    for key, registros in registros_por_especie_idioma.items():
        taxon_id, idioma_id = key
        if len(registros) > 1:
            # Hay duplicados
            if idioma_id == 1:
                duplicados_es.append({
                    'taxon_id': taxon_id,
                    'cantidad': len(registros),
                    'ids': [r['id_nombre_comun'] for r in registros]
                })
            elif idioma_id == 8:
                duplicados_en.append({
                    'taxon_id': taxon_id,
                    'cantidad': len(registros),
                    'ids': [r['id_nombre_comun'] for r in registros]
                })
        else:
            # Registro único
            if idioma_id == 1:
                especies_es.add(taxon_id)
            elif idioma_id == 8:
                especies_en.add(taxon_id)
    
    # Agregar especies con duplicados (contamos como 1)
    for dup in duplicados_es:
        especies_es.add(dup['taxon_id'])
    for dup in duplicados_en:
        especies_en.add(dup['taxon_id'])
    
    print(f"\n📊 Resumen:")
    print(f"  Español: {len(especies_es)}/690 especies únicas")
    print(f"  Inglés: {len(especies_en)}/690 especies únicas")
    print(f"  Duplicados en español: {len(duplicados_es)} especies")
    print(f"  Duplicados en inglés: {len(duplicados_en)} especies")
    
    if duplicados_es:
        print(f"\n⚠️  Especies con duplicados en español (primeras 10):")
        for dup in duplicados_es[:10]:
            print(f"    - taxon_id {dup['taxon_id']}: {dup['cantidad']} registros (IDs: {dup['ids']})")
    
    if duplicados_en:
        print(f"\n⚠️  Especies con duplicados en inglés (primeras 10):")
        for dup in duplicados_en[:10]:
            print(f"    - taxon_id {dup['taxon_id']}: {dup['cantidad']} registros (IDs: {dup['ids']})")
    
    faltantes_es = 690 - len(especies_es)
    faltantes_en = 690 - len(especies_en)
    
    print(f"\n📊 Estado:")
    print(f"  Español: faltan {faltantes_es} registros")
    print(f"  Inglés: faltan {faltantes_en} registros")
    
    if faltantes_es == 0 and faltantes_en == 0:
        print("\n✅ ¡Perfecto! Hay exactamente 690 registros en cada idioma")
    else:
        print("\n⚠️  Aún faltan algunos registros")

if __name__ == "__main__":
    main()
