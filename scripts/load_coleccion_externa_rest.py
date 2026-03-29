#!/usr/bin/env python3
"""
Carga coleccion_externa desde consolidacion.xlsx (hoja Prov_ALL) vía API REST de Supabase.
Incluye taxon_id (especie_taxon_id), provincia_id y publicacion_id si existen en las tablas FK.
Requiere SUPABASE_SERVICE_ROLE_KEY y NEXT_PUBLIC_SUPABASE_URL en el entorno o en .env del repo.
"""
from __future__ import annotations

import json
import math
import os
import sys
import time
from datetime import date, datetime
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

import numpy as np
import pandas as pd

_SCRIPT_DIR = Path(__file__).resolve().parent
if str(_SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(_SCRIPT_DIR))

from coleccion_externa_fk_utils import map_fk_from_row

ROOT = _SCRIPT_DIR.parent
EXCEL = ROOT / "consolidacion.xlsx"
SHEET = "Prov_ALL"
BATCH = 1000


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


def parse_fecha(val) -> date | None:
    if val is None:
        return None
    try:
        if pd.isna(val):
            return None
    except (ValueError, TypeError):
        return None
    if isinstance(val, pd.Timestamp):
        if pd.isna(val):
            return None
        return val.date()
    if isinstance(val, datetime):
        return val.date()
    if isinstance(val, date):
        return val
    if isinstance(val, int):
        if val == 0:
            return None
        try:
            ts = pd.Timestamp("1899-12-30") + pd.Timedelta(days=int(val))
            return ts.date()
        except (ValueError, OSError):
            return None
    if isinstance(val, float):
        if val == 0 or math.isnan(val):
            return None
        try:
            ts = pd.Timestamp("1899-12-30") + pd.Timedelta(days=int(round(val)))
            return ts.date()
        except (ValueError, OSError):
            return None
    if isinstance(val, str):
        s = val.strip()
        if not s or s.lower() in ("varias fechas", "nan", "nat"):
            return None
        try:
            ts = pd.to_datetime(s, dayfirst=False, errors="coerce")
            if pd.isna(ts):
                return None
            return ts.date()
        except Exception:
            return None
    return None


def fetch_id_set(url: str, key: str, table: str, col: str, page: int = 1000) -> set[int]:
    out: set[int] = set()
    offset = 0
    base = url.rstrip("/")
    while True:
        path = f"{base}/rest/v1/{table}?select={col}&limit={page}&offset={offset}"
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
            v = row.get(col)
            if v is not None:
                out.add(int(v))
        if len(rows) < page:
            break
        offset += page
    return out


def row_to_payload(
    row: pd.Series,
    valid_taxon: set[int],
    valid_geo: set[int],
    valid_pub: set[int],
) -> dict:
    loc = row.get("Localidad")
    if pd.isna(loc):
        loc = None
    else:
        loc = str(loc).strip() or None

    cat = row.get("Museo_acronimo")
    if pd.isna(cat):
        cat = None
    else:
        cat = str(cat).strip() or None

    num = row.get("Museo_numero")
    if pd.isna(num):
        num_s = None
    elif isinstance(num, float) and num == int(num):
        num_s = str(int(num))
    else:
        num_s = str(num).strip() or None

    lat = row.get("Latitud")
    lat = None if pd.isna(lat) else float(lat)

    lon = row.get("Longitud")
    lon = None if pd.isna(lon) else float(lon)

    elev = row.get("Elevation")
    if pd.isna(elev):
        elev = None
    else:
        try:
            elev = int(round(float(elev)))
        except (ValueError, TypeError):
            elev = None

    fd = parse_fecha(row.get("Fecha"))
    fecha_json = fd.isoformat() if isinstance(fd, date) else None
    if fecha_json in ("NaT", "nat"):
        fecha_json = None
    taxon_id, provincia_id, publicacion_id = map_fk_from_row(
        row, valid_taxon, valid_geo, valid_pub
    )
    return {
        "localidad": loc,
        "catalogo_museo": cat,
        "numero_museo": num_s,
        "latitud": lat,
        "longitud": lon,
        "elevacion": elev,
        "fecha": fecha_json,
        "taxon_id": taxon_id,
        "provincia_id": provincia_id,
        "publicacion_id": publicacion_id,
    }


def post_batch(url: str, key: str, rows: list[dict]) -> None:
    data = json.dumps(rows).encode("utf-8")
    req = Request(
        f"{url.rstrip('/')}/rest/v1/coleccion_externa",
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
        with urlopen(req, timeout=120) as resp:
            if resp.status not in (200, 201):
                raise RuntimeError(f"HTTP {resp.status}")
    except HTTPError as e:
        err = e.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"HTTP {e.code}: {err}") from e


def main() -> None:
    load_env()
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "").strip()
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    if not url or not key:
        print("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY", file=sys.stderr)
        sys.exit(1)

    df = pd.read_excel(EXCEL, sheet_name=SHEET)
    for col in ("especie_taxon_id", "provincia_id", "publicacion_id"):
        if col not in df.columns:
            print(f"Falta columna en Excel: {col}", file=sys.stderr)
            sys.exit(1)

    print("Descargando ids válidos (taxon, geopolitica, publicacion)...", file=sys.stderr)
    valid_taxon = fetch_id_set(url, key, "taxon", "id_taxon")
    valid_geo = fetch_id_set(url, key, "geopolitica", "id_geopolitica")
    valid_pub = fetch_id_set(url, key, "publicacion", "id_publicacion")

    n = len(df)
    payloads = [
        row_to_payload(df.iloc[i], valid_taxon, valid_geo, valid_pub) for i in range(n)
    ]

    for i in range(0, n, BATCH):
        chunk = payloads[i : i + BATCH]
        post_batch(url, key, chunk)
        done = min(i + BATCH, n)
        print(f"{done}/{n}", flush=True)
        time.sleep(0.05)

    print("OK", n, "filas", file=sys.stderr)


if __name__ == "__main__":
    main()
