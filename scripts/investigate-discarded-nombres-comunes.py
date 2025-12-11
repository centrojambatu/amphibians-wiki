#!/usr/bin/env python3
"""
Script para investigar qué registros de vw_nombres_comunes se están descartando
en la función get-taxon-nombres.ts
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
        print("❌ Error: Variables de entorno NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY no encontradas")
        sys.exit(1)
    
    supabase: Client = create_client(supabase_url, supabase_key)
    
    print("🔍 Obteniendo todos los registros de vw_nombres_comunes...")
    
    # Obtener TODOS los registros de la vista (no solo los con nombre_comun_especie)
    response = supabase.table('vw_nombres_comunes').select(
        'id_taxon, orden, familia, genero, especie, nombre_comun_especie, nombre_cientifico'
    ).execute()
    
    if not response.data:
        print("❌ Error: No se pudieron obtener los registros")
        sys.exit(1)
    
    total_registros_vista = len(response.data)
    print(f"✅ Total de registros en la vista: {total_registros_vista}")
    
    # Filtrar solo los que tienen nombre_comun_especie (igual que en get-taxon-nombres.ts)
    registros_con_nombre_comun_especie = [r for r in response.data if r.get('nombre_comun_especie') is not None and r.get('nombre_comun_especie') != '']
    total_registros = len(registros_con_nombre_comun_especie)
    print(f"✅ Total de registros con nombre_comun_especie: {total_registros}")
    print(f"⚠️  Registros sin nombre_comun_especie: {total_registros_vista - total_registros}")
    
    # Usar solo los registros con nombre_comun_especie para el análisis
    response.data = registros_con_nombre_comun_especie
    
    # Analizar qué registros se descartan
    registros_validos = []
    registros_descartados = []
    
    # Categorías de descarte
    sin_orden = []
    sin_familia = []
    sin_genero = []
    sin_orden_familia = []
    sin_orden_genero = []
    sin_familia_genero = []
    sin_todos = []
    
    for registro in response.data:
        tiene_orden = registro.get('orden') is not None and registro.get('orden') != ''
        tiene_familia = registro.get('familia') is not None and registro.get('familia') != ''
        tiene_genero = registro.get('genero') is not None and registro.get('genero') != ''
        tiene_nombre_comun = registro.get('nombre_comun_especie') is not None and registro.get('nombre_comun_especie') != ''
        
        # Aplicar el mismo filtro que en get-taxon-nombres.ts
        if tiene_orden and tiene_familia and tiene_genero and tiene_nombre_comun:
            registros_validos.append(registro)
        else:
            registro_info = {
                'id_taxon': registro.get('id_taxon'),
                'nombre_cientifico': registro.get('nombre_cientifico'),
                'especie': registro.get('especie'),
                'nombre_comun': registro.get('nombre_comun_especie'),
                'orden': registro.get('orden'),
                'familia': registro.get('familia'),
                'genero': registro.get('genero'),
                'problemas': []
            }
            
            if not tiene_orden:
                registro_info['problemas'].append('sin_orden')
            if not tiene_familia:
                registro_info['problemas'].append('sin_familia')
            if not tiene_genero:
                registro_info['problemas'].append('sin_genero')
            
            registros_descartados.append(registro_info)
            
            # Categorizar
            if not tiene_orden and not tiene_familia and not tiene_genero:
                sin_todos.append(registro_info)
            elif not tiene_orden and not tiene_familia:
                sin_orden_familia.append(registro_info)
            elif not tiene_orden and not tiene_genero:
                sin_orden_genero.append(registro_info)
            elif not tiene_familia and not tiene_genero:
                sin_familia_genero.append(registro_info)
            elif not tiene_orden:
                sin_orden.append(registro_info)
            elif not tiene_familia:
                sin_familia.append(registro_info)
            elif not tiene_genero:
                sin_genero.append(registro_info)
    
    # Mostrar estadísticas
    print(f"\n📊 Análisis de registros:")
    print(f"  ✅ Registros válidos (se incluyen): {len(registros_validos)}")
    print(f"  ❌ Registros descartados: {len(registros_descartados)}")
    print(f"  📈 Total: {total_registros}")
    
    if len(registros_descartados) > 0:
        print(f"\n🔍 Desglose de registros descartados:")
        print(f"  - Sin orden: {len(sin_orden)}")
        print(f"  - Sin familia: {len(sin_familia)}")
        print(f"  - Sin género: {len(sin_genero)}")
        print(f"  - Sin orden y familia: {len(sin_orden_familia)}")
        print(f"  - Sin orden y género: {len(sin_orden_genero)}")
        print(f"  - Sin familia y género: {len(sin_familia_genero)}")
        print(f"  - Sin orden, familia y género: {len(sin_todos)}")
        
        # Mostrar ejemplos de cada categoría
        print(f"\n📋 Ejemplos de registros descartados:")
        
        if sin_orden:
            print(f"\n  ⚠️  Sin orden ({len(sin_orden)} registros):")
            for r in sin_orden[:5]:
                print(f"    - ID: {r['id_taxon']}, Nombre: {r['nombre_cientifico'] or r['especie']}, Nombre común: {r['nombre_comun']}")
                print(f"      Orden: {r['orden']}, Familia: {r['familia']}, Género: {r['genero']}")
            if len(sin_orden) > 5:
                print(f"    ... y {len(sin_orden) - 5} más")
        
        if sin_familia:
            print(f"\n  ⚠️  Sin familia ({len(sin_familia)} registros):")
            for r in sin_familia[:5]:
                print(f"    - ID: {r['id_taxon']}, Nombre: {r['nombre_cientifico'] or r['especie']}, Nombre común: {r['nombre_comun']}")
                print(f"      Orden: {r['orden']}, Familia: {r['familia']}, Género: {r['genero']}")
            if len(sin_familia) > 5:
                print(f"    ... y {len(sin_familia) - 5} más")
        
        if sin_genero:
            print(f"\n  ⚠️  Sin género ({len(sin_genero)} registros):")
            for r in sin_genero[:5]:
                print(f"    - ID: {r['id_taxon']}, Nombre: {r['nombre_cientifico'] or r['especie']}, Nombre común: {r['nombre_comun']}")
                print(f"      Orden: {r['orden']}, Familia: {r['familia']}, Género: {r['genero']}")
            if len(sin_genero) > 5:
                print(f"    ... y {len(sin_genero) - 5} más")
        
        if sin_orden_familia:
            print(f"\n  ⚠️  Sin orden y familia ({len(sin_orden_familia)} registros):")
            for r in sin_orden_familia[:5]:
                print(f"    - ID: {r['id_taxon']}, Nombre: {r['nombre_cientifico'] or r['especie']}, Nombre común: {r['nombre_comun']}")
                print(f"      Orden: {r['orden']}, Familia: {r['familia']}, Género: {r['genero']}")
            if len(sin_orden_familia) > 5:
                print(f"    ... y {len(sin_orden_familia) - 5} más")
        
        if sin_orden_genero:
            print(f"\n  ⚠️  Sin orden y género ({len(sin_orden_genero)} registros):")
            for r in sin_orden_genero[:5]:
                print(f"    - ID: {r['id_taxon']}, Nombre: {r['nombre_cientifico'] or r['especie']}, Nombre común: {r['nombre_comun']}")
                print(f"      Orden: {r['orden']}, Familia: {r['familia']}, Género: {r['genero']}")
            if len(sin_orden_genero) > 5:
                print(f"    ... y {len(sin_orden_genero) - 5} más")
        
        if sin_familia_genero:
            print(f"\n  ⚠️  Sin familia y género ({len(sin_familia_genero)} registros):")
            for r in sin_familia_genero[:5]:
                print(f"    - ID: {r['id_taxon']}, Nombre: {r['nombre_cientifico'] or r['especie']}, Nombre común: {r['nombre_comun']}")
                print(f"      Orden: {r['orden']}, Familia: {r['familia']}, Género: {r['genero']}")
            if len(sin_familia_genero) > 5:
                print(f"    ... y {len(sin_familia_genero) - 5} más")
        
        if sin_todos:
            print(f"\n  ⚠️  Sin orden, familia y género ({len(sin_todos)} registros):")
            for r in sin_todos[:5]:
                print(f"    - ID: {r['id_taxon']}, Nombre: {r['nombre_cientifico'] or r['especie']}, Nombre común: {r['nombre_comun']}")
                print(f"      Orden: {r['orden']}, Familia: {r['familia']}, Género: {r['genero']}")
            if len(sin_todos) > 5:
                print(f"    ... y {len(sin_todos) - 5} más")
        
        # Exportar lista completa a archivo
        print(f"\n💾 Exportando lista completa de registros descartados...")
        with open('registros_descartados_nombres_comunes.txt', 'w', encoding='utf-8') as f:
            f.write("Registros descartados de vw_nombres_comunes\n")
            f.write("=" * 80 + "\n\n")
            for r in registros_descartados:
                f.write(f"ID Taxon: {r['id_taxon']}\n")
                f.write(f"Nombre científico: {r['nombre_cientifico'] or r['especie'] or 'N/A'}\n")
                f.write(f"Nombre común: {r['nombre_comun'] or 'N/A'}\n")
                f.write(f"Orden: {r['orden'] or 'NULL'}\n")
                f.write(f"Familia: {r['familia'] or 'NULL'}\n")
                f.write(f"Género: {r['genero'] or 'NULL'}\n")
                f.write(f"Problemas: {', '.join(r['problemas'])}\n")
                f.write("-" * 80 + "\n")
        
        print(f"✅ Lista completa guardada en: registros_descartados_nombres_comunes.txt")
    else:
        print(f"\n✅ ¡Perfecto! Todos los registros son válidos y se incluyen correctamente")
    
    # Investigar los 54 registros sin nombre_comun_especie
    print(f"\n🔍 Investigando los {total_registros_vista - total_registros} registros sin nombre_comun_especie...")
    
    # Obtener todos los registros de nuevo para analizar los que no tienen nombre_comun_especie
    response_completo = supabase.table('vw_nombres_comunes').select(
        'id_taxon, orden, familia, genero, especie, nombre_comun_especie, nombre_comun_familia, nombre_comun_genero, nombre_comun_orden, nombre_cientifico'
    ).execute()
    
    registros_sin_nombre_especie = [r for r in response_completo.data if r.get('nombre_comun_especie') is None or r.get('nombre_comun_especie') == '']
    
    if registros_sin_nombre_especie:
        print(f"\n📋 Análisis de registros sin nombre_comun_especie:")
        
        con_nombre_familia = [r for r in registros_sin_nombre_especie if r.get('nombre_comun_familia')]
        con_nombre_genero = [r for r in registros_sin_nombre_especie if r.get('nombre_comun_genero')]
        con_nombre_orden = [r for r in registros_sin_nombre_especie if r.get('nombre_comun_orden')]
        sin_nombre_ninguno = [r for r in registros_sin_nombre_especie if not r.get('nombre_comun_familia') and not r.get('nombre_comun_genero') and not r.get('nombre_comun_orden')]
        
        print(f"  - Con nombre_comun_familia: {len(con_nombre_familia)}")
        print(f"  - Con nombre_comun_genero: {len(con_nombre_genero)}")
        print(f"  - Con nombre_comun_orden: {len(con_nombre_orden)}")
        print(f"  - Sin ningún nombre común: {len(sin_nombre_ninguno)}")
        
        print(f"\n📋 Ejemplos de registros sin nombre_comun_especie:")
        for r in registros_sin_nombre_especie[:10]:
            print(f"    - ID: {r.get('id_taxon')}, Nombre científico: {r.get('nombre_cientifico') or r.get('especie')}")
            print(f"      Orden: {r.get('orden')}, Familia: {r.get('familia')}, Género: {r.get('genero')}")
            print(f"      Nombre común especie: {r.get('nombre_comun_especie') or 'NULL'}")
            print(f"      Nombre común familia: {r.get('nombre_comun_familia') or 'NULL'}")
            print(f"      Nombre común género: {r.get('nombre_comun_genero') or 'NULL'}")
            print(f"      Nombre común orden: {r.get('nombre_comun_orden') or 'NULL'}")
            print()
        if len(registros_sin_nombre_especie) > 10:
            print(f"    ... y {len(registros_sin_nombre_especie) - 10} más")
    
    # Verificar si hay duplicados por id_taxon
    print(f"\n🔍 Verificando duplicados por id_taxon...")
    id_taxon_counts = defaultdict(int)
    for registro in response_completo.data:
        id_taxon_counts[registro.get('id_taxon')] += 1
    
    duplicados = {k: v for k, v in id_taxon_counts.items() if v > 1}
    if duplicados:
        print(f"  ⚠️  Se encontraron {len(duplicados)} taxones con múltiples registros:")
        for taxon_id, count in list(duplicados.items())[:10]:
            print(f"    - ID {taxon_id}: {count} registros")
        if len(duplicados) > 10:
            print(f"    ... y {len(duplicados) - 10} más")
    else:
        print(f"  ✅ No hay duplicados por id_taxon")

if __name__ == "__main__":
    main()

