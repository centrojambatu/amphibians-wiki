#!/usr/bin/env python3
"""
Añade la columna registro_id a la hoja Prov_ALL de consolidacion.xlsx con el id de coleccion_externa.
Orden: mismas filas que al cargar (BD ORDER BY id asc = orden de filas del Excel).
Conserva el resto de hojas del libro sin modificarlas.
"""
from __future__ import annotations

import json
import os
import shutil
import sys
from datetime import datetime
from pathlib import Path
from urllib.request import Request, urlopen

import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
EXCEL = ROOT / "consolidacion.xlsx"
SHEET = "Prov_ALL"
PAGE = 1000


def load_env() -> None:
    env_path = ROOT / ".env"
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, _, v = line.partition("=")
        k, v = k.strip(), v.strip().strip('"').strip("'")
        if k and k not in os.environ:
            os.environ[k] = v


def fetch_ce_ids_ordered(base: str, key: str) -> list[int]:
    ids: list[int] = []
    offset = 0
    base = base.rstrip("/")
    while True:
        path = (
            f"{base}/rest/v1/coleccion_externa?select=id&order=id.asc&limit={PAGE}&offset={offset}"
        )
        req = Request(
            path,
            headers={
                "apikey": key,
                "Authorization": f"Bearer {key}",
                "Accept": "application/json",
            },
            method="GET",
        )
        with urlopen(req, timeout=120) as resp:
            rows = json.loads(resp.read().decode("utf-8"))
        if not rows:
            break
        ids.extend(int(r["id"]) for r in rows)
        if len(rows) < PAGE:
            break
        offset += PAGE
    return ids


def main() -> None:
    load_env()
    base = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "").strip()
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    if not base or not key:
        print("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY", file=sys.stderr)
        sys.exit(1)

    if not EXCEL.exists():
        print(f"No existe {EXCEL}", file=sys.stderr)
        sys.exit(1)

    print("Descargando ids desde coleccion_externa...", file=sys.stderr)
    ids = fetch_ce_ids_ordered(base, key)
    n_db = len(ids)

    xl = pd.ExcelFile(EXCEL)
    if SHEET not in xl.sheet_names:
        print(f"No hay hoja {SHEET!r}. Hojas: {xl.sheet_names}", file=sys.stderr)
        sys.exit(1)

    sheets: dict[str, pd.DataFrame] = {}
    for name in xl.sheet_names:
        sheets[name] = pd.read_excel(EXCEL, sheet_name=name)

    df = sheets[SHEET]
    n_ex = len(df)
    if n_ex != n_db:
        print(
            f"Error: filas en {SHEET} ({n_ex}) != registros en BD ({n_db}). No se modifica el archivo.",
            file=sys.stderr,
        )
        sys.exit(1)

    if "registro_id" in df.columns:
        df = df.drop(columns=["registro_id"])
    df.insert(len(df.columns), "registro_id", ids)
    sheets[SHEET] = df

    backup = EXCEL.with_suffix(
        f".backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    )
    shutil.copy2(EXCEL, backup)
    print(f"Copia de seguridad: {backup}", file=sys.stderr)

    with pd.ExcelWriter(EXCEL, engine="openpyxl") as writer:
        for name, sheet_df in sheets.items():
            sheet_df.to_excel(writer, sheet_name=name, index=False)

    print(f"OK: columna registro_id añadida a {SHEET} ({n_ex} filas).", file=sys.stderr)


if __name__ == "__main__":
    main()
