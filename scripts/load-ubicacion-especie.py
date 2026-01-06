#!/usr/bin/env python3
"""
Script para cargar datos de ubicación de especies desde Excel a Supabase.
Lee el archivo location_species.xlsx y carga los datos a la tabla ubicacion_especie.
"""

import pandas as pd
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Configuración de Supabase
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Faltan las variables de entorno NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY")

# Crear cliente de Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_taxon_map():
    """Obtiene un mapa de nombre completo de especie -> taxon_id para especies (rank_id = 7)"""
    print("Obteniendo taxones de nivel especie con su género...")
    
    taxon_map = {}
    
    # Obtener todos los géneros (rank_id = 6)
    generos_response = supabase.table("taxon").select("id_taxon, taxon").eq("rank_id", 6).execute()
    generos_map = {row["id_taxon"]: row["taxon"] for row in generos_response.data}
    print(f"  - Géneros encontrados: {len(generos_response.data)}")
    
    # Obtener todas las especies (rank_id = 7)
    especies_response = supabase.table("taxon").select("id_taxon, taxon, taxon_id").eq("rank_id", 7).execute()
    print(f"  - Especies encontradas: {len(especies_response.data)}")
    
    for row in especies_response.data:
        genero_id = row.get("taxon_id")
        epiteto = row["taxon"].strip()
        taxon_id = row["id_taxon"]
        
        if genero_id and genero_id in generos_map:
            genero = generos_map[genero_id]
            nombre_completo = f"{genero} {epiteto}"
            
            # Guardar con diferentes variantes para facilitar búsqueda
            taxon_map[nombre_completo] = taxon_id
            taxon_map[nombre_completo.lower()] = taxon_id
        
        # También guardar solo el epíteto por si acaso
        taxon_map[epiteto.lower()] = taxon_id
    
    print(f"Mapa de nombres contiene {len(taxon_map)} entradas")
    return taxon_map


# Mapeo de correcciones para nombres con problemas de codificación
SPECIES_NAME_CORRECTIONS = {
    # Correcciones de codificación "Río" -> "rio", "Peña" -> "e", etc.
    "Allobates exasPeñatus": "Allobates exasperatus",
    "Dendropsophus Ríodopeplus": "Dendropsophus rhodopeplus",
    "Dendropsophus maRíoratus": "Dendropsophus marmoratus",
    "EpicRíonops bicolor": "Epicrionops bicolor",
    "EpicRíonops petersi": "Epicrionops petersi",
    "Gastrotheca Ríobambae": "Gastrotheca riobambae",
    "Hyalinobatrachium auRíoguttatum": "Hyalinobatrachium aureoguttatum",
    "Hyloxalus Yasuní": "Hyloxalus yasuni",
    "Hyloxalus maRíoRíoventris": "Hyloxalus marioventris",
    "Leptodactylus Ríodomerus": "Leptodactylus rhodomerus",
    "Leptodactylus Ríodomystax": "Leptodactylus rhodomystax",
    "Niceforonia Peñaccai": "Niceforonia peraccai",
    "Niceforonia elassodisca": "Niceforonia elassodiscus",
    "Noblella peRíonina": "Noblella peronina",
    "Nymphargus megista": "Nymphargus megistus",
    "ORíobates quixensis": "Oreobates quixensis",
    "Oedipina villamizaRíorum": "Oedipina villamizariorum",
    "Osteocephalus Yasuní": "Osteocephalus yasuni",
    "Pristimantis Limóncochensis": "Pristimantis limoncochensis",
    "Pristimantis Ríodoplichus": "Pristimantis rhodoplichus",
    "Pristimantis Ríodostichus": "Pristimantis rhodostichus",
    "Pristimantis buRíoniorum": "Pristimantis burioniorum",
    "Pristimantis cRíophilius": "Pristimantis cryophilius",
    "Pristimantis caRíosceroni": "Pristimantis carlosceroni",
    "Pristimantis gagliaRíoi": "Pristimantis gagliardoi",
    "Pristimantis maRíoreyesi": "Pristimantis mayoreyesi",
    "Pristimantis miltongallaRíoi": "Pristimantis miltongallardoi",
    "Pristimantis peruvía nus": "Pristimantis peruvianus",
    "Pristimantis pyrRíomerus": "Pristimantis pyrrhomerus",
    "Pristimantis steRíothylax": "Pristimantis sternothylax",
    "Pristimantis suPeñatis": "Pristimantis superates",
    "Pristimantis tenebRíonis": "Pristimantis tenebrionis",
    "Pristimantis ventrimaRíoratus": "Pristimantis ventrimarmoratus",
    "VitRíorana ritae": "Vitreorana ritae",
}


def normalize_species_name(name: str) -> str:
    """Normaliza el nombre de especie corrigiendo problemas de codificación"""
    if not name:
        return name
    
    name = name.strip()
    
    # Primero verificar si hay una corrección exacta
    if name in SPECIES_NAME_CORRECTIONS:
        return SPECIES_NAME_CORRECTIONS[name]
    
    return name

def get_ficha_especie_map():
    """Obtiene un mapa de taxon_id -> id_ficha_especie"""
    print("Obteniendo fichas de especie...")
    
    response = supabase.table("ficha_especie").select("id_ficha_especie, taxon_id").execute()
    
    ficha_map = {}
    for row in response.data:
        ficha_map[row["taxon_id"]] = row["id_ficha_especie"]
    
    print(f"Se encontraron {len(response.data)} fichas de especie")
    return ficha_map

def load_excel_data(file_path: str):
    """Carga los datos del archivo Excel"""
    print(f"Leyendo archivo Excel: {file_path}")
    
    df = pd.read_excel(file_path)
    
    # Mostrar columnas disponibles
    print(f"Columnas encontradas: {list(df.columns)}")
    print(f"Total de filas: {len(df)}")
    
    return df

def process_and_insert_data(df: pd.DataFrame, taxon_map: dict, ficha_map: dict):
    """Procesa los datos del DataFrame y los inserta en la tabla ubicacion_especie"""
    
    records_to_insert = []
    species_not_found = set()
    ficha_not_found = set()
    
    # Mapeo de columnas del Excel a campos de la tabla
    # Basado en la estructura real del archivo:
    # ['Order', 'Family', 'Species', 'Province', 'Locality', 'Voucher', 'Latitud', 'Longitud', 'Elev. (m)']
    column_mapping = {
        'species': ['Species', 'species'],
        'provincia': ['Province', 'Provincia', 'province'],
        'localidad': ['Locality', 'Localidad', 'locality'], 
        'voucher': ['Voucher', 'voucher'],
        'latitud': ['Latitud', 'latitud', 'Latitude', 'lat'],
        'longitud': ['Longitud', 'longitud', 'Longitude', 'lon', 'long'],
        'elevacion': ['Elev. (m)', 'Elevation', 'elevacion', 'Elevacion', 'Elev']
    }
    
    # Detectar nombres de columnas reales
    actual_columns = {}
    for field, possible_names in column_mapping.items():
        for col in df.columns:
            if col in possible_names or col.lower() in [n.lower() for n in possible_names]:
                actual_columns[field] = col
                break
    
    print(f"Columnas mapeadas: {actual_columns}")
    
    for idx, row in df.iterrows():
        # Obtener nombre de especie
        species_col = actual_columns.get('species')
        if not species_col or pd.isna(row.get(species_col)):
            continue
            
        species_name_original = str(row[species_col]).strip()
        
        # Normalizar el nombre (corregir problemas de codificación)
        species_name = normalize_species_name(species_name_original)
        
        # Buscar taxon_id
        taxon_id = taxon_map.get(species_name) or taxon_map.get(species_name.lower())
        
        if not taxon_id:
            # Mostrar tanto el nombre original como el normalizado si son diferentes
            if species_name != species_name_original:
                species_not_found.add(f"{species_name_original} -> {species_name}")
            else:
                species_not_found.add(species_name)
            continue
        
        # Buscar ficha_especie
        ficha_id = ficha_map.get(taxon_id)
        
        if not ficha_id:
            ficha_not_found.add(species_name)
            continue
        
        # Construir registro
        record = {
            "id_ficha_especie": ficha_id,
            "id_taxon": taxon_id,
        }
        
        # Agregar campos opcionales
        for field in ['provincia', 'localidad', 'voucher', 'latitud', 'longitud', 'elevacion']:
            col = actual_columns.get(field)
            if col and not pd.isna(row.get(col)):
                value = row[col]
                # Convertir a tipos apropiados
                if field in ['latitud', 'longitud', 'elevacion']:
                    try:
                        record[field] = float(value)
                    except (ValueError, TypeError):
                        record[field] = None
                else:
                    record[field] = str(value).strip() if value else None
            else:
                record[field] = None
        
        records_to_insert.append(record)
    
    # Mostrar estadísticas
    print(f"\n=== Estadísticas ===")
    print(f"Registros a insertar: {len(records_to_insert)}")
    print(f"Especies no encontradas en taxon: {len(species_not_found)}")
    print(f"Especies sin ficha_especie: {len(ficha_not_found)}")
    
    if species_not_found:
        print(f"\nEspecies no encontradas (primeras 20):")
        for sp in list(species_not_found)[:20]:
            print(f"  - {sp}")
    
    if ficha_not_found:
        print(f"\nEspecies sin ficha (primeras 20):")
        for sp in list(ficha_not_found)[:20]:
            print(f"  - {sp}")
    
    # Insertar en lotes
    if records_to_insert:
        print(f"\nInsertando {len(records_to_insert)} registros...")
        batch_size = 500
        total_inserted = 0
        
        for i in range(0, len(records_to_insert), batch_size):
            batch = records_to_insert[i:i + batch_size]
            try:
                response = supabase.table("ubicacion_especie").insert(batch).execute()
                total_inserted += len(batch)
                print(f"  Insertados {total_inserted}/{len(records_to_insert)} registros")
            except Exception as e:
                print(f"  Error insertando lote {i//batch_size + 1}: {e}")
        
        print(f"\n✓ Inserción completada: {total_inserted} registros")
    else:
        print("\nNo hay registros para insertar")
    
    return records_to_insert

def main():
    # Ruta al archivo Excel
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.dirname(script_dir)
    excel_path = os.path.join(project_dir, "location_species.xlsx")
    
    if not os.path.exists(excel_path):
        print(f"Error: No se encontró el archivo {excel_path}")
        return
    
    # Cargar mapas de referencia
    taxon_map = get_taxon_map()
    ficha_map = get_ficha_especie_map()
    
    # Cargar datos del Excel
    df = load_excel_data(excel_path)
    
    # Procesar e insertar datos
    process_and_insert_data(df, taxon_map, ficha_map)

if __name__ == "__main__":
    main()
