#!/usr/bin/env python3
"""
Carga ultimo_avistamiento en ficha_especie desde Excel "Posiblemente extintas.xlsx".
Empareja por nombre científico (columna Species del Excel = nombre_cientifico en vw_ficha_especie_completa).
"""
import os
import re
import sys
from datetime import datetime

import pandas as pd
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv(".env.local")


def normalizar_nombre_excel(s: str) -> str:
    """Quita sufijo (E) y espacios extra para emparejar con nombre_cientifico en BD."""
    if pd.isna(s):
        return ""
    s = str(s).strip()
    s = re.sub(r"\s*\(E\)\s*$", "", s, flags=re.IGNORECASE)
    return " ".join(s.split())


def parsear_fecha(val) -> str | None:
    """Convierte 'Last Sighting in Ecuador' a fecha ISO (YYYY-MM-DD)."""
    if pd.isna(val):
        return None
    if isinstance(val, datetime):
        return val.strftime("%Y-%m-%d")
    s = str(val).strip()
    if not s:
        return None
    # Ya es datetime string
    if re.match(r"^\d{4}-\d{2}-\d{2}", s):
        return s[:10]
    # Solo año
    m = re.match(r"^(\d{4})$", s)
    if m:
        return f"{m.group(1)}-07-01"
    # "Early 1991", "Late 1989"
    m = re.match(r"^(?:early|late)\s+(\d{4})$", s, re.IGNORECASE)
    if m:
        return f"{m.group(1)}-01-01"
    # "January-May 1999" -> usar último mes (May)
    m = re.search(r"(?:January|February|March|April|May|June|July|August|September|October|November|December)\s*-\s*([A-Za-z]+)\s+(\d{4})", s, re.IGNORECASE)
    if m:
        month_name = m.group(1).lower()
        year = int(m.group(2))
        months = {"january": 1, "february": 2, "march": 3, "april": 4, "may": 5, "june": 6, "july": 7, "august": 8, "september": 9, "october": 10, "november": 11, "december": 12}
        month = months.get(month_name, 6)
        return f"{year}-{month:02d}-01"
    # Mes y año "July 1984", "September 1985"
    months = {
        "january": 1, "february": 2, "march": 3, "april": 4, "may": 5, "june": 6,
        "july": 7, "august": 8, "september": 9, "october": 10, "november": 11, "december": 12,
    }
    for name, month in months.items():
        if name in s.lower():
            m = re.search(r"(\d{4})", s)
            if m:
                year = int(m.group(1))
                return f"{year}-{month:02d}-01"
            return None
    # "4 March 1984", "21 April 1990", "1 September 1988"
    m = re.match(r"(\d{1,2})\s+(\w+)\s+(\d{4})", s, re.IGNORECASE)
    if m:
        day, month_name, year = int(m.group(1)), m.group(2).lower(), int(m.group(3))
        month = months.get(month_name)
        if month:
            try:
                from calendar import monthrange
                _, maxday = monthrange(year, month)
                return datetime(year, month, min(day, maxday)).strftime("%Y-%m-%d")
            except Exception:
                return f"{year}-{month:02d}-01"
    return None


def main():
    supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not supabase_url or not supabase_key:
        print("❌ Variables de entorno NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY requeridas")
        sys.exit(1)

    supabase: Client = create_client(supabase_url, supabase_key)
    excel_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "Posiblemente extintas.xlsx")
    if not os.path.exists(excel_path):
        print(f"❌ No se encontró {excel_path}")
        sys.exit(1)

    print(f"📖 Leyendo {excel_path}")
    df = pd.read_excel(excel_path)
    if "Species" not in df.columns or "Last Sighting in Ecuador" not in df.columns:
        print("❌ Se esperan columnas 'Species' y 'Last Sighting in Ecuador'")
        sys.exit(1)

    print("🔍 Obteniendo id_ficha_especie por nombre_cientifico...")
    r = supabase.table("vw_ficha_especie_completa").select("id_ficha_especie, nombre_cientifico").execute()
    if not r.data:
        print("❌ No se pudo leer vw_ficha_especie_completa")
        sys.exit(1)
    nombre_to_id = {row["nombre_cientifico"].strip(): row["id_ficha_especie"] for row in r.data}

    actualizados = 0
    sin_match = []
    sin_fecha = []

    for _, row in df.iterrows():
        species_raw = row["Species"]
        nombre_norm = normalizar_nombre_excel(species_raw)
        if not nombre_norm:
            continue
        fecha = parsear_fecha(row["Last Sighting in Ecuador"])
        if not fecha:
            sin_fecha.append((nombre_norm, str(row["Last Sighting in Ecuador"])))
            continue
        id_ficha = nombre_to_id.get(nombre_norm)
        if id_ficha is None:
            sin_match.append(nombre_norm)
            continue
        supabase.table("ficha_especie").update({"ultimo_avistamiento": fecha}).eq("id_ficha_especie", id_ficha).execute()
        actualizados += 1
        print(f"  ✓ {nombre_norm} -> {fecha} (id_ficha_especie={id_ficha})")

    print(f"\n✅ Actualizados: {actualizados}")
    if sin_match:
        print(f"\n⚠️ Sin coincidencia en BD ({len(sin_match)}):")
        for n in sin_match:
            print(f"   - {n}")
    if sin_fecha:
        print(f"\n⚠️ Fecha no parseada ({len(sin_fecha)}):")
        for n, v in sin_fecha:
            print(f"   - {n}: {v}")


if __name__ == "__main__":
    main()
