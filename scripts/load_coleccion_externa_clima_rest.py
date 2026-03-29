#!/usr/bin/env python3
"""
Carga coleccion_externa_precipitacion y coleccion_externa_temperatura desde Prov_ALL.

Mapeo precipitación (Excel -> BD):
  Rain_Jan..Rain_Dec -> ene_prec..dic_prec
  prom_anual_prec se deja siempre NULL (no se usa Average Annual Precipitation).

Mapeo temperatura:
  Temp_Jan..Temp_Dec -> ene_temp..dic_temp
  prom_anual_temp se deja siempre NULL (no se usa Average Annual Temperature).

coleccion_externa_id <- registro_id (debe existir en coleccion_externa.id).
"""
from __future__ import annotations

import json
import os
import sys
import time
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen

import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
EXCEL = ROOT / "consolidacion.xlsx"
SHEET = "Prov_ALL"
BATCH = 800
PAGE = 1000

PRECIP_MAP: list[tuple[str, str]] = [
    ("Rain_Jan", "ene_prec"),
    ("Rain_Feb", "feb_prec"),
    ("Rain_Mar", "mar_prec"),
    ("Rain_Apr", "abr_prec"),
    ("Rain_May", "may_prec"),
    ("Rain_Jun", "jun_prec"),
    ("Rain_Jul", "jul_prec"),
    ("Rain_Aug", "ago_prec"),
    ("Rain_Sep", "sep_prec"),
    ("Rain_Oct", "oct_prec"),
    ("Rain_Nov", "nov_prec"),
    ("Rain_Dec", "dic_prec"),
]

TEMP_MAP: list[tuple[str, str]] = [
    ("Temp_Jan", "ene_temp"),
    ("Temp_Feb", "feb_temp"),
    ("Temp_Mar", "mar_temp"),
    ("Temp_Apr", "abr_temp"),
    ("Temp_May", "may_temp"),
    ("Temp_Jun", "jun_temp"),
    ("Temp_Jul", "jul_temp"),
    ("Temp_Aug", "ago_temp"),
    ("Temp_Sep", "sep_temp"),
    ("Temp_Oct", "oct_temp"),
    ("Temp_Nov", "nov_temp"),
    ("Temp_Dec", "dic_temp"),
]


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


def opt_float(val) -> float | None:
    if val is None:
        return None
    try:
        if pd.isna(val):
            return None
    except (ValueError, TypeError):
        return None
    try:
        return float(val)
    except (ValueError, TypeError):
        return None


def fetch_ce_ids(url: str, key: str) -> set[int]:
    out: set[int] = set()
    base = url.rstrip("/")
    offset = 0
    while True:
        path = f"{base}/rest/v1/coleccion_externa?select=id&limit={PAGE}&offset={offset}"
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
        for row in rows:
            out.add(int(row["id"]))
        if len(rows) < PAGE:
            break
        offset += PAGE
    return out


def post_batch(url: str, key: str, table: str, rows: list[dict]) -> None:
    path = f"{url.rstrip('/')}/rest/v1/{table}"
    data = json.dumps(rows).encode("utf-8")
    req = Request(
        path,
        data=data,
        headers={
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
        },
        method="POST",
    )
    try:
        with urlopen(req, timeout=180) as resp:
            if resp.status not in (200, 201):
                raise RuntimeError(f"HTTP {resp.status}")
    except HTTPError as e:
        err = e.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"{table} HTTP {e.code}: {err}") from e


def row_precip_payload(row: pd.Series, valid_ce: set[int]) -> dict:
    rid = row.get("registro_id")
    if rid is None or (isinstance(rid, float) and pd.isna(rid)):
        raise ValueError("registro_id vacío")
    ce_id = int(float(rid))
    if ce_id not in valid_ce:
        raise ValueError(f"registro_id {ce_id} no existe en coleccion_externa")
    out: dict = {"coleccion_externa_id": ce_id}
    for excel_col, db_col in PRECIP_MAP:
        out[db_col] = opt_float(row.get(excel_col))
    return out


def row_temp_payload(row: pd.Series, valid_ce: set[int]) -> dict:
    rid = row.get("registro_id")
    if rid is None or (isinstance(rid, float) and pd.isna(rid)):
        raise ValueError("registro_id vacío")
    ce_id = int(float(rid))
    if ce_id not in valid_ce:
        raise ValueError(f"registro_id {ce_id} no existe en coleccion_externa")
    out: dict = {"coleccion_externa_id": ce_id}
    for excel_col, db_col in TEMP_MAP:
        out[db_col] = opt_float(row.get(excel_col))
    return out


def main() -> None:
    load_env()
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "").strip()
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    if not url or not key:
        print("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY", file=sys.stderr)
        sys.exit(1)

    df = pd.read_excel(EXCEL, sheet_name=SHEET)
    if "registro_id" not in df.columns:
        print("Falta columna registro_id en el Excel.", file=sys.stderr)
        sys.exit(1)

    need = [c for c, _ in PRECIP_MAP] + [c for c, _ in TEMP_MAP]
    missing = [c for c in need if c not in df.columns]
    if missing:
        print("Faltan columnas en Excel:", missing, file=sys.stderr)
        sys.exit(1)

    print("Descargando ids de coleccion_externa...", file=sys.stderr)
    valid_ce = fetch_ce_ids(url, key)
    print(f"  {len(valid_ce)} ids", file=sys.stderr)

    precip_rows: list[dict] = []
    temp_rows: list[dict] = []
    for i in range(len(df)):
        row = df.iloc[i]
        try:
            precip_rows.append(row_precip_payload(row, valid_ce))
            temp_rows.append(row_temp_payload(row, valid_ce))
        except ValueError as e:
            print(f"Fila Excel {i}: {e}", file=sys.stderr)
            sys.exit(1)

    for name, rows in (
        ("coleccion_externa_precipitacion", precip_rows),
        ("coleccion_externa_temperatura", temp_rows),
    ):
        print(f"Insertando {len(rows)} en {name}...", file=sys.stderr)
        for j in range(0, len(rows), BATCH):
            post_batch(url, key, name, rows[j : j + BATCH])
            print(f"  {min(j + BATCH, len(rows))}/{len(rows)}", flush=True)
            time.sleep(0.04)

    print("OK", file=sys.stderr)


if __name__ == "__main__":
    main()
