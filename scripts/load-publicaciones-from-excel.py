#!/usr/bin/env python3
"""
Carga publicaciones desde 'Publicaciones_Combinadas_Final.xlsx'.
- Llena tabla: publicacion
- Llena tabla: publicacion_autor  (crea/actualiza autores en tabla autor si no existen)
- Llena tabla: publicacion_ano
- Llena tabla: publicacion_catalogo_awe  (tipo de publicación)
"""

import os
import re
import sys
from pathlib import Path

import pandas as pd
from dotenv import load_dotenv
from supabase import create_client, Client

ROOT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(ROOT_DIR / ".env.local")

# Mapeo "Tipo Publicación Catálogo" (Excel) -> id_catalogo_awe (tipo 9)
TIPO_CATALOGO_MAP = {
    "anals": 141,
    "artículo": 142,
    "catalogo": 143,
    "catálogo": 143,
    "directorio": 144,
    "guía de campo": 145,
    "informe": 146,
    "journal": 147,
    "lámina": 148,
    "libro divulgación": 149,
    "libro divulgacion": 149,
    "libro científico": 150,
    "libro cientifico": 150,
    "memorias": 151,
    "monografía": 152,
    "monografia": 152,
    "otro": 153,
    "publicación en congreso": 154,
    "publicacion en congreso": 154,
    "publicación técnica": 155,
    "publicacion tecnica": 155,
    "reportaje": 156,
    "reporte": 157,
    "reporte anual": 158,
    "reporte mensual": 159,
    "resumen": 160,
    "revista": 161,
    "sección de libro": 162,
    "seccion de libro": 162,
    "serie": 163,
    "sitio web": 164,
    "suplemento": 165,
    "tesis": 166,
    "video reportaje": 167,
}


def normalizar(s):
    if s is None or (isinstance(s, float) and pd.isna(s)):
        return ""
    return str(s).strip()


def normalizar_bool(s):
    """Convierte 'Sí'/'No'/NaN a True/False."""
    v = normalizar(s).lower()
    if v in ("sí", "si", "yes", "true", "1"):
        return True
    if v in ("no", "false", "0"):
        return False
    return None


def limpiar_str(s):
    """Devuelve None si vacío/nan."""
    v = normalizar(s)
    return v if v and v.lower() not in ("nan", "none") else None


def parsear_autores(autor_str: str) -> list[dict]:
    """
    Parsea la celda de autores en una lista de dicts {apellidos, nombres}.
    Formatos: 'Apellido, I. N.' o 'Apellido, I. N., and Apellido2, I. N.' o 'Apellido, I. N.; ...'
    """
    if not autor_str:
        return []

    # Separar por ', and ', ' and ', '; ', ','
    # Estrategia: primero quitar el último ' and ' antes de dividir
    texto = re.sub(r",?\s+and\s+", "|||", autor_str, flags=re.IGNORECASE)
    texto = texto.replace(";", "|||")
    partes = [p.strip() for p in texto.split("|||") if p.strip()]

    autores = []
    for parte in partes:
        # Cada parte: 'Apellido, I. N.' o 'Apellido, I.' o 'Apellido'
        parte = parte.strip().rstrip(",").strip()
        if not parte:
            continue
        idx = parte.find(",")
        if idx != -1:
            apellidos = parte[:idx].strip()
            nombres = parte[idx + 1:].strip()
        else:
            apellidos = parte.strip()
            nombres = ""
        if apellidos:
            autores.append({"apellidos": apellidos, "nombres": nombres or None})
    return autores


def crear_cliente(supabase_url: str, supabase_key: str) -> Client:
    return create_client(supabase_url, supabase_key)


def con_reintento(fn, supabase_url: str, supabase_key: str, supabase_ref: list, intentos: int = 3):
    """Ejecuta fn(), reconectando si hay error de conexión."""
    for i in range(intentos):
        try:
            return fn(supabase_ref[0])
        except Exception as e:
            msg = str(e)
            if "RemoteProtocolError" in msg or "ConnectionTerminated" in msg or "RemoteDisconnected" in msg:
                print(f"  🔄 Reconectando a Supabase (intento {i+1})...")
                supabase_ref[0] = crear_cliente(supabase_url, supabase_key)
                import time; time.sleep(2)
            else:
                raise
    raise RuntimeError("No se pudo reconectar a Supabase después de varios intentos")


def get_or_create_autor(supabase: Client, apellidos: str, nombres: str | None, autor_cache: dict) -> int | None:
    """
    Busca el autor por apellidos (case-insensitive). Si no existe lo crea.
    Usa caché para evitar consultas repetidas.
    """
    apellidos = apellidos[:100]
    key = apellidos.lower().strip()
    if key in autor_cache:
        return autor_cache[key]

    # Buscar en BD
    resp = supabase.table("autor").select("id_autor").ilike("apellidos", apellidos).execute()
    if resp.data:
        id_autor = resp.data[0]["id_autor"]
        autor_cache[key] = id_autor
        return id_autor

    # Crear (truncar a 100 chars por límite de la columna)
    insert_data = {"apellidos": apellidos[:100]}
    if nombres:
        insert_data["nombres"] = nombres[:100]
    resp = supabase.table("autor").insert(insert_data).execute()
    if resp.data:
        id_autor = resp.data[0]["id_autor"]
        autor_cache[key] = id_autor
        return id_autor

    print(f"  ⚠️  No se pudo crear autor: {apellidos}, {nombres}")
    return None


def main():
    excel_path = Path("/Users/xavieraguas/Downloads/Publicaciones_Combinadas_Final.xlsx")
    if not excel_path.exists():
        print(f"❌ No se encontró: {excel_path}")
        sys.exit(1)

    supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not supabase_url or not supabase_key:
        print("❌ Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY")
        sys.exit(1)

    supabase: Client = create_client(supabase_url, supabase_key)
    # Referencia mutable para permitir reconexión
    sb = [supabase]

    print(f"📖 Leyendo Excel: {excel_path.name}...")
    df = pd.read_excel(excel_path, sheet_name=0, engine="openpyxl")
    print(f"   Filas: {len(df)}")

    # Cargar autores existentes en caché
    print("🔍 Cargando caché de autores existentes...")
    resp_autores = sb[0].table("autor").select("id_autor, apellidos").execute()
    autor_cache: dict[str, int] = {}
    for row in resp_autores.data or []:
        k = (row.get("apellidos") or "").lower().strip()
        if k:
            autor_cache[k] = row["id_autor"]
    print(f"   Autores en BD: {len(autor_cache)}")

    # Cargar IDs de publicaciones ya existentes para saltar duplicados
    print("🔍 Cargando IDs de publicaciones existentes...")
    existing_ids: set[int] = set()
    page = 0
    page_size = 1000
    while True:
        resp_ids = (
            sb[0].table("publicacion")
            .select("id_publicacion")
            .range(page * page_size, (page + 1) * page_size - 1)
            .execute()
        )
        batch = resp_ids.data or []
        for r in batch:
            existing_ids.add(r["id_publicacion"])
        if len(batch) < page_size:
            break
        page += 1
    print(f"   Publicaciones ya en BD: {len(existing_ids)}")

    # Cargar IDs de publicacion_ano ya existentes para no duplicar
    existing_anos: set[int] = set()
    resp_anos = sb[0].table("publicacion_ano").select("publicacion_id").execute()
    for r in resp_anos.data or []:
        existing_anos.add(r["publicacion_id"])

    # Cargar IDs de publicacion_catalogo_awe ya existentes
    existing_cat: set[int] = set()
    resp_cat = sb[0].table("publicacion_catalogo_awe").select("publicacion_id").execute()
    for r in resp_cat.data or []:
        existing_cat.add(r["publicacion_id"])

    # Cargar IDs de publicacion_autor ya existentes
    existing_aut: set[int] = set()
    resp_aut = sb[0].table("publicacion_autor").select("publicacion_id").execute()
    for r in resp_aut.data or []:
        existing_aut.add(r["publicacion_id"])

    # Cargar títulos existentes para deduplicar filas sin IdPublicacion
    print("🔍 Cargando títulos existentes para deduplicación...")
    existing_titulos: set[str] = set()
    page = 0
    while True:
        resp_tit = (
            sb[0].table("publicacion")
            .select("titulo")
            .range(page * page_size, (page + 1) * page_size - 1)
            .execute()
        )
        batch = resp_tit.data or []
        for r in batch:
            t = (r.get("titulo") or "").strip().lower()
            if t:
                existing_titulos.add(t)
        if len(batch) < page_size:
            break
        page += 1
    print(f"   Títulos en BD: {len(existing_titulos)}")

    insertadas_pub = 0
    omitidas_pub = 0
    errores_pub = 0
    autores_creados = 0
    autores_autores_rel = 0
    anos_insertados = 0
    catalogo_insertados = 0

    for idx, row in df.iterrows():
        id_pub_excel_raw = row.get("IdPublicacion")
        tiene_id = not (id_pub_excel_raw is None or (isinstance(id_pub_excel_raw, float) and pd.isna(id_pub_excel_raw)))
        id_pub_excel = int(id_pub_excel_raw) if tiene_id else None

        titulo = limpiar_str(row.get("Título"))
        if not titulo:
            continue  # sin título no se puede insertar

        # Si tiene ID y ya está en BD, saltar (ya fue procesado)
        if tiene_id and id_pub_excel in existing_ids:
            omitidas_pub += 1
            continue

        # Si NO tiene ID, deduplicar por título para evitar duplicados en re-ejecuciones
        titulo_key = titulo.strip().lower()
        if not tiene_id and titulo_key in existing_titulos:
            omitidas_pub += 1
            continue

        # --- 1. Preparar datos de publicacion ---
        fecha = None
        fecha_raw = row.get("Fecha")
        if fecha_raw and not (isinstance(fecha_raw, float) and pd.isna(fecha_raw)):
            try:
                fecha = pd.to_datetime(fecha_raw).strftime("%Y-%m-%d")
            except Exception:
                año_val = row.get("Año")
                if año_val and not pd.isna(año_val):
                    fecha = f"{int(año_val)}-01-01"
                else:
                    fecha = "1900-01-01"
        else:
            año_val = row.get("Año")
            if año_val and not pd.isna(año_val):
                fecha = f"{int(año_val)}-01-01"
            else:
                fecha = "1900-01-01"

        cientifica_div = limpiar_str(row.get("Científica / Divulgación"))
        es_cientifica = None
        if cientifica_div:
            es_cientifica = cientifica_div.lower() in ("científica", "cientifica", "sí", "si", "yes")

        pub_data = {
            "titulo": titulo,
            "titulo_secundario": limpiar_str(row.get("Título Secundario")),
            "editor": False,
            "numero_publicacion_ano": int(row["Año"]) if row.get("Año") and not pd.isna(row.get("Año")) else None,
            "editorial": limpiar_str(row.get("Editorial / Revista")),
            "volumen": limpiar_str(row.get("Volumen")),
            "numero": limpiar_str(row.get("Número")),
            "pagina": limpiar_str(row.get("Páginas")),
            "palabras_clave": limpiar_str(row.get("Palabras Clave")),
            "resumen": limpiar_str(row.get("Resumen")),
            "fecha": fecha,
            "publicacion_cj": True,
            "publica_en_web": True,
            "cita": limpiar_str(row.get("Cita")),
            "cita_corta": limpiar_str(row.get("Cita Corta")),
            "cita_larga": limpiar_str(row.get("Cita Larga")),
            "categoria": False,
            "noticia": False,
            "cientifica": es_cientifica,
            "indexada": normalizar_bool(row.get("Indexada")),
            "anfibios_ecuador": normalizar_bool(row.get("Anfibios Ecuador")),
            "justificacion": limpiar_str(row.get("Justificación")),
            "observaciones": limpiar_str(row.get("Fuente")),
        }

        # Solo forzar el ID si viene del Excel
        if tiene_id:
            pub_data["id_publicacion"] = id_pub_excel

        try:
            resp_pub = con_reintento(lambda s: s.table("publicacion").insert(pub_data).execute(),
                                     supabase_url, supabase_key, sb)
            if not resp_pub.data:
                print(f"  ❌ Error insertando publicación (excel_idx={idx}): sin datos en respuesta")
                errores_pub += 1
                continue
            insertadas_pub += 1
            if tiene_id:
                existing_ids.add(id_pub_excel)
            else:
                existing_titulos.add(titulo_key)
        except Exception as e:
            print(f"  ❌ Error insertando publicación (excel_idx={idx}): {e}")
            errores_pub += 1
            continue

        nuevo_id = resp_pub.data[0]["id_publicacion"]

        # --- 2. publicacion_ano ---
        if nuevo_id not in existing_anos:
            año_val = row.get("Año")
            if año_val and not pd.isna(año_val):
                try:
                    con_reintento(lambda s: s.table("publicacion_ano").insert({
                        "ano": int(año_val),
                        "publicacion_id": nuevo_id,
                    }).execute(), supabase_url, supabase_key, sb)
                    anos_insertados += 1
                    existing_anos.add(nuevo_id)
                except Exception as e:
                    print(f"  ⚠️  Error en publicacion_ano para id {nuevo_id}: {e}")

        # --- 3. publicacion_catalogo_awe (tipo de publicación) ---
        if nuevo_id not in existing_cat:
            tipo_cat_str = limpiar_str(row.get("Tipo Publicación Catálogo"))
            if tipo_cat_str:
                cat_id = TIPO_CATALOGO_MAP.get(tipo_cat_str.lower().strip())
                if cat_id:
                    try:
                        con_reintento(lambda s: s.table("publicacion_catalogo_awe").insert({
                            "publicacion_id": nuevo_id,
                            "catalogo_awe_id": cat_id,
                        }).execute(), supabase_url, supabase_key, sb)
                        catalogo_insertados += 1
                        existing_cat.add(nuevo_id)
                    except Exception as e:
                        print(f"  ⚠️  Error en publicacion_catalogo_awe para id {nuevo_id}: {e}")
                else:
                    print(f"  ⚠️  Tipo catálogo no encontrado: '{tipo_cat_str}' (pub id={nuevo_id})")

        # --- 4. Autores ---
        if nuevo_id not in existing_aut:
            autor_str = limpiar_str(row.get("Autor(es)"))
            if autor_str:
                autores = parsear_autores(autor_str)
                for orden, autor_info in enumerate(autores, start=1):
                    apellidos = autor_info["apellidos"]
                    nombres = autor_info["nombres"]
                    prev_cache_size = len(autor_cache)
                    autor_id = get_or_create_autor(sb[0], apellidos, nombres, autor_cache)
                    if len(autor_cache) > prev_cache_size:
                        autores_creados += 1
                    if autor_id:
                        try:
                            con_reintento(lambda s: s.table("publicacion_autor").insert({
                                "publicacion_id": nuevo_id,
                                "autor_id": autor_id,
                                "orden_autor": orden,
                            }).execute(), supabase_url, supabase_key, sb)
                            autores_autores_rel += 1
                        except Exception as e:
                            print(f"  ⚠️  Error en publicacion_autor pub {nuevo_id}, autor {autor_id}: {e}")

        if insertadas_pub % 100 == 0 and insertadas_pub > 0:
            print(f"   ... {insertadas_pub} publicaciones insertadas")

    # Ajustar la secuencia al valor máximo insertado para que los próximos inserts no colisionen
    print()
    print("🔧 Ajustando secuencia publicacion_idpublicacion_seq...")
    try:
        max_id_resp = sb[0].table("publicacion").select("id_publicacion").order("id_publicacion", desc=True).limit(1).execute()
        if max_id_resp.data:
            max_id = max_id_resp.data[0]["id_publicacion"]
            print(f"   ID máximo insertado: {max_id}. La secuencia se debe actualizar manualmente si es necesario.")
            print(f"   SQL: SELECT setval('publicacion_idpublicacion_seq', {max_id});")
    except Exception as e:
        print(f"  ⚠️  No se pudo leer el ID máximo: {e}")
        max_id = None

    print()
    print("✅ Carga completada:")
    print(f"   Publicaciones insertadas: {insertadas_pub}")
    print(f"   Publicaciones omitidas (ya existían): {omitidas_pub}")
    print(f"   Publicaciones con error:  {errores_pub}")
    print(f"   Autores nuevos creados:   {autores_creados}")
    print(f"   Relaciones autor-pub:     {autores_autores_rel}")
    print(f"   Años insertados:          {anos_insertados}")
    print(f"   Catálogos insertados:     {catalogo_insertados}")


if __name__ == "__main__":
    main()
