#!/usr/bin/env python3
"""
Asigna a las publicaciones 'Sin asignar' (Ecuador, sin fila en publicacion_catalogo_awe)
un ítem concreto de catalogo_publicaciones (Journal, Artículo, Tesis, Informe, Reporte, etc.),
clasificando por título, resumen, editorial y opcionalmente la página del primer enlace.

Uso:
  python scripts/assign-sin-asignar-publicaciones.py           # solo reglas
  python scripts/assign-sin-asignar-publicaciones.py --web     # también analiza la URL del enlace
  python scripts/assign-sin-asignar-publicaciones.py --dry-run # no escribe en BD
"""

import os
import re
import sys
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client

ROOT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(ROOT_DIR / ".env")
load_dotenv(ROOT_DIR / ".env.local")

# id en catalogo_publicaciones para cada ítem concreto (nombre → id)
# Orden de las reglas: más específico primero.
CATALOGO_IDS = {
    "Anals": 1,
    "Artículo": 2,
    "Catálogo": 3,
    "Directorio": 4,
    "Guía de campo": 5,
    "Informe": 6,
    "Journal": 7,
    "Lámina": 8,
    "Libro divulgación": 9,
    "Libro científico": 10,
    "Memorias": 11,
    "Monografía": 12,
    "Otro": 13,
    "Publicación en congreso": 14,
    "Publicación técnica": 15,
    "Reportaje": 16,
    "Reporte": 17,
    "Reporte anual": 18,
    "Reporte mensual": 19,
    "Resumen": 20,
    "Revista": 21,
    "Sección de libro": 22,
    "Serie": 23,
    "Sitio WEB": 24,
    "Suplemento": 25,
    "Tesis": 26,
}


def normalizar(s):
    if s is None:
        return ""
    try:
        if isinstance(s, float):
            import math
            if math.isnan(s):
                return ""
    except Exception:
        pass
    return str(s).strip().lower() if s else ""


def clasificar_tipo_especifico(titulo: str, resumen: str, editorial: str) -> int:
    """
    Devuelve el id de catalogo_publicaciones para el tipo concreto: Journal, Artículo,
    Tesis, Informe, Reporte, Guía de campo, etc. (no solo la categoría amplia).
    """
    titulo_n = normalizar(titulo)
    resumen_n = normalizar(resumen)
    editorial_n = normalizar(editorial)
    texto = f"{titulo_n} {resumen_n} {editorial_n}"

    # --- TESIS ---
    if re.search(r"\b(tesis|thesis|dissertation|maestr[ií]a|doctorado|phd\b|msc\b|magister)\b", texto):
        return CATALOGO_IDS["Tesis"]

    # --- Tipos OTRO (específicos) ---
    if re.search(r"\breporte\s+anual\b|\banual\s+report\b", texto):
        return CATALOGO_IDS["Reporte anual"]
    if re.search(r"\breporte\s+mensual\b|\bmonthly\s+report\b", texto):
        return CATALOGO_IDS["Reporte mensual"]
    if re.search(r"\binforme\b", texto):
        return CATALOGO_IDS["Informe"]
    if re.search(r"\breporte\b|\breport\b", texto):
        return CATALOGO_IDS["Reporte"]
    if re.search(r"\bmemorias\b|proceeding|actas\s+de\s+congreso", texto):
        return CATALOGO_IDS["Memorias"]
    if re.search(r"\bcongreso\b|conference\b|symposium|simposio\b", texto):
        return CATALOGO_IDS["Publicación en congreso"]
    if re.search(r"\bcat[aá]logo\b|catalog\b", texto):
        return CATALOGO_IDS["Catálogo"]
    if re.search(r"\bdirectorio\b|directory\b", texto):
        return CATALOGO_IDS["Directorio"]
    if re.search(r"\bpublicaci[oó]n\s+t[eé]cnica\b|technical\s+publication\b", texto):
        return CATALOGO_IDS["Publicación técnica"]
    if re.search(r"\bsuplemento\b|supplement\b", texto):
        return CATALOGO_IDS["Suplemento"]
    if re.search(r"\bresumen\b|abstract\s+only\b", texto) and len(titulo_n) < 80:
        return CATALOGO_IDS["Resumen"]

    # --- Divulgación (específicos) ---
    if re.search(r"\bgu[ií]a\s+de\s+campo\b|field\s+guide\b|gu[ií]a\s+did[aá]ctica\b", texto):
        return CATALOGO_IDS["Guía de campo"]
    if re.search(r"\breportaje\b|news\s+article\b|noticia\b", texto):
        return CATALOGO_IDS["Reportaje"]
    if re.search(r"\bsitio\s+web\b|website\b|web\s+page\b|\.org\b|\.com\b", editorial_n + " " + texto):
        return CATALOGO_IDS["Sitio WEB"]
    if re.search(r"\bl[aá]mina\b|poster\s+session\b", texto):
        return CATALOGO_IDS["Lámina"]
    if re.search(r"\blibro\s+divulgaci[oó]n\b|popular\s+science\s+book\b", texto):
        return CATALOGO_IDS["Libro divulgación"]

    # --- Científica (específicos): Journal vs Artículo vs Monografía vs Libro vs Sección ---
    if re.search(r"\bjournal\b|vol\.\s*\d|issue\s*\d|doi\.org\b", texto):
        return CATALOGO_IDS["Journal"]
    if editorial_n and any(x in editorial_n for x in ("springer", "elsevier", "wiley", "taylor", "oxford university press", "cambridge university press", "plos", "biomed central", "frontiers", "mdpi", "society", "academic press")):
        return CATALOGO_IDS["Journal"]
    if re.search(r"\bmonograf[ií]a\b|monograph\b", texto):
        return CATALOGO_IDS["Monografía"]
    if re.search(r"\bsecci[oó]n\s+de\s+libro\b|book\s+chapter\b|chapter\s+in\b|en\s+libro\b", texto):
        return CATALOGO_IDS["Sección de libro"]
    if re.search(r"\bserie\b|series\b", texto) and re.search(r"\b(zoological|scientific|bulletin)\b", texto):
        return CATALOGO_IDS["Serie"]
    if re.search(r"\blibro\s+cient[ií]fico\b|edited\s+volume\b", texto):
        return CATALOGO_IDS["Libro científico"]
    if re.search(r"\brevista\b", texto) and not re.search(r"\bcient[ií]fica\b|indexada\b", texto):
        return CATALOGO_IDS["Revista"]
    if re.search(r"\bart[ií]culo\b|article\b|peer\s*review\b|indexada\b|scopus\b|wos\b|jcr\b", texto):
        return CATALOGO_IDS["Artículo"]
    if re.search(r"\b(study|estudio|research|investigaci[oó]n|species|new\s+species|description|describ|amphibia|anura)\b", texto):
        return CATALOGO_IDS["Artículo"]

    return CATALOGO_IDS["Otro"]


def analizar_enlace_web(url: str, use_web: bool) -> str:
    """
    Opcionalmente obtiene contenido de la URL para ayudar a clasificar.
    Devuelve texto extra (título/meta) o vacío.
    """
    if not use_web or not url or not url.startswith("http"):
        return ""
    try:
        import urllib.request
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; Bot)"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode("utf-8", errors="ignore")
        # Extraer <title> y meta description
        title_match = re.search(r"<title[^>]*>([^<]+)</title>", html, re.I)
        meta_match = re.search(r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']+)["\']', html, re.I)
        if not meta_match:
            meta_match = re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+name=["\']description["\']', html, re.I)
        parts = []
        if title_match:
            parts.append(title_match.group(1).strip())
        if meta_match:
            parts.append(meta_match.group(1).strip())
        return " ".join(parts)
    except Exception as e:
        print(f"      [web] Error al obtener {url[:50]}...: {e}")
        return ""


def main():
    use_web = "--web" in sys.argv
    dry_run = "--dry-run" in sys.argv

    supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_ANON_KEY")
    if not supabase_url or not supabase_key:
        print("❌ Configura NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY (o SUPABASE_ANON_KEY) en .env.local")
        sys.exit(1)

    sb = create_client(supabase_url, supabase_key)

    # Publicaciones Ecuador sin ninguna fila en publicacion_catalogo_awe
    print("🔍 Buscando publicaciones Sin asignar (Ecuador, sin tipo en catalogo_publicaciones)...")
    resp_pubs = (
        sb.table("publicacion")
        .select("id_publicacion, titulo, resumen, editorial")
        .eq("anfibios_ecuador", True)
        .execute()
    )
    all_ecuador = {r["id_publicacion"]: r for r in (resp_pubs.data or [])}

    resp_pca = sb.table("publicacion_catalogo_awe").select("publicacion_id").execute()
    con_tipo = {r["publicacion_id"] for r in (resp_pca.data or [])}

    sin_asignar_ids = [pid for pid in all_ecuador if pid not in con_tipo]
    print(f"   Total Ecuador: {len(all_ecuador)} | Con tipo: {len(con_tipo)} | Sin asignar: {len(sin_asignar_ids)}")

    if not sin_asignar_ids:
        print("✅ No hay publicaciones Sin asignar. Nada que hacer.")
        return

    # Primer enlace por publicación (opcional, para análisis web)
    enlaces: dict[int, str] = {}
    if sin_asignar_ids:
        resp_en = (
            sb.table("publicacion_enlace")
            .select("publicacion_id, enlace")
            .in_("publicacion_id", sin_asignar_ids)
            .execute()
        )
        seen = set()
        for r in resp_en.data or []:
            pid = r["publicacion_id"]
            url = (r.get("enlace") or "").strip()
            if pid not in seen and url and url != "http://":
                seen.add(pid)
                enlaces[pid] = url

    insertados = 0
    errores = 0

    for i, pid in enumerate(sin_asignar_ids):
        pub = all_ecuador.get(pid) or {}
        titulo = (pub.get("titulo") or "").strip()
        resumen = (pub.get("resumen") or "")[:2000]
        editorial = (pub.get("editorial") or "").strip()

        texto_web = analizar_enlace_web(enlaces.get(pid, ""), use_web)
        if texto_web:
            resumen = f"{resumen} {texto_web}"

        cat_id = clasificar_tipo_especifico(titulo, resumen, editorial)
        nombre_tipo = next((n for n, i in CATALOGO_IDS.items() if i == cat_id), "Otro")

        if dry_run:
            print(f"   [dry-run] id={pid} → {nombre_tipo} (id={cat_id}) | {titulo[:55]}...")
            insertados += 1
            continue

        try:
            sb.table("publicacion_catalogo_awe").insert({
                "publicacion_id": pid,
                "catalogo_publicaciones_id": cat_id,
            }).execute()
            insertados += 1
            if (insertados % 50) == 0:
                print(f"   ... {insertados} asignaciones insertadas")
        except Exception as e:
            errores += 1
            print(f"   ⚠️  Error id_publicacion={pid}: {e}")

    print()
    print("✅ Asignación terminada:")
    print(f"   Asignaciones insertadas: {insertados}")
    if errores:
        print(f"   Errores: {errores}")


if __name__ == "__main__":
    main()
