#!/usr/bin/env python3
"""
Actualiza la columna genero de la tabla autor según el archivo
'Autores descripciones Sexo.xlsx'.
- Columna Autor: apellidos o "apellidos, iniciales" o "apellidos_nombre"
- Columna Sex: Male -> M, Female -> F
"""

import os
import re
from pathlib import Path

import pandas as pd
from dotenv import load_dotenv
from supabase import create_client, Client

ROOT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(ROOT_DIR / ".env.local")


def normalizar(s):
    if s is None or (isinstance(s, float) and pd.isna(s)):
        return ""
    return str(s).strip()


def parsear_autor_excel(autor_str: str) -> tuple[str, str | None]:
    """
    Parsea la celda Autor del Excel.
    Devuelve (apellidos, nombres_o_iniciales o None).
    Ejemplos:
      "Lynch" -> ("Lynch", None)
      "Duellman †" -> ("Duellman", None)
      "Reyes-Puig, J.P." -> ("Reyes-Puig", "J.P.")
      "Reyes-Puig, C." -> ("Reyes-Puig", "C.")
      "Zimmermann_Elke" -> ("Zimmermann", "Elke")
      "Ortega, J." -> ("Ortega", "J.")
    """
    s = normalizar(autor_str)
    s = re.sub(r"\s*†\s*$", "", s)
    if not s:
        return ("", None)
    if "_" in s:
        parts = s.split("_", 1)
        return (normalizar(parts[0]), normalizar(parts[1]) if len(parts) > 1 else None)
    if "," in s:
        idx = s.index(",")
        apellidos = normalizar(s[:idx])
        nombres = normalizar(s[idx + 1 :])
        return (apellidos, nombres if nombres else None)
    return (s, None)


def sex_to_genero(sex: str) -> str | None:
    v = normalizar(sex).lower()
    if v == "male":
        return "M"
    if v == "female":
        return "F"
    return None


def main():
    supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    if not supabase_url or not supabase_key:
        print("Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local")
        return 1

    excel_path = ROOT_DIR / "Autores descripciones Sexo.xlsx"
    if not excel_path.exists():
        print(f"No se encontró {excel_path}")
        return 1

    df = pd.read_excel(excel_path, sheet_name="Hoja1", header=1)
    if "Autor" not in df.columns or "Sex" not in df.columns:
        print("El Excel debe tener columnas 'Autor' y 'Sex'")
        return 1

    supabase: Client = create_client(supabase_url, supabase_key)
    updated = 0
    not_found = []
    multi_updated = 0

    for _, row in df.iterrows():
        autor_str = row.get("Autor")
        sex = row.get("Sex")
        if pd.isna(autor_str) or pd.isna(sex):
            continue
        genero = sex_to_genero(str(sex))
        if not genero:
            continue

        apellidos, nombres_hint = parsear_autor_excel(str(autor_str))
        if not apellidos:
            continue

        # Buscar en la tabla autor
        query = supabase.table("autor").select("id_autor, apellidos, nombres")
        query = query.ilike("apellidos", apellidos)

        if nombres_hint:
            # Filtrar por nombres: que coincidan iniciales o contengan el nombre
            # Ej: J.P. -> Juan P. / Juan Pablo; C. -> Carolina; Elke -> Elke
            hint_clean = re.sub(r"[.\s]+", "", nombres_hint).lower()
            res = query.execute()
            if res.data:
                matching = []
                for a in res.data:
                    nom = (a.get("nombres") or "")
                    nom_clean = re.sub(r"[.\s]+", "", nom).lower()
                    if hint_clean in nom_clean or nom_clean.startswith(hint_clean) or (len(hint_clean) <= 2 and nom_clean.startswith(hint_clean[:1])):
                        matching.append(a)
                    elif nombres_hint.lower() in (nom or "").lower():
                        matching.append(a)
                if not matching:
                    not_found.append((autor_str, apellidos, nombres_hint))
                    continue
                ids = [m["id_autor"] for m in matching]
            else:
                not_found.append((autor_str, apellidos, nombres_hint))
                continue
        else:
            res = query.execute()
            if not res.data:
                not_found.append((autor_str, apellidos, None))
                continue
            ids = [a["id_autor"] for a in res.data]

        for id_autor in ids:
            r = supabase.table("autor").update({"genero": genero}).eq("id_autor", id_autor).execute()
            if r.data:
                updated += 1
                if len(ids) > 1 and not nombres_hint:
                    multi_updated += 1

    print(f"Actualizados: {updated} autor(es)")
    if multi_updated:
        print(f"(De ellos, {multi_updated} por coincidencia solo por apellidos)")
    if not_found:
        print(f"No encontrados en tabla autor: {len(not_found)}")
        for t in not_found[:20]:
            print(f"  - {t[0]!r} (apellidos={t[1]!r}, hint={t[2]!r})")
        if len(not_found) > 20:
            print(f"  ... y {len(not_found) - 20} más")
    return 0


if __name__ == "__main__":
    exit(main())
