#!/usr/bin/env python3
"""
Genera líneas JSON con INSERTs por lotes para coleccion_externa desde Prov_ALL.
Incluye taxon_id <- especie_taxon_id, provincia_id, publicacion_id (sin validar FK en SQL).
"""
from __future__ import annotations

import json
import math
import sys
from datetime import date, datetime

# datetime es subclase de date; orden de comprobación importa
from pathlib import Path

import numpy as np
import pandas as pd

EXCEL = Path(__file__).resolve().parent.parent / "consolidacion.xlsx"
SHEET = "Prov_ALL"
BATCH_SIZE = 800
OUT = Path(__file__).resolve().parent.parent / "scripts" / "coleccion_externa_batches.jsonl"


def sql_literal(val) -> str:
    if val is None:
        return "NULL"
    try:
        if pd.isna(val):
            return "NULL"
    except (ValueError, TypeError):
        pass
    if isinstance(val, datetime):
        return "'" + val.date().isoformat() + "'"
    if isinstance(val, date):
        return "'" + val.isoformat() + "'"
    if isinstance(val, float) and (math.isnan(val) or np.isnan(val)):
        return "NULL"
    if isinstance(val, str):
        if val.strip().upper() == "NAT" or val.lower() == "nan":
            return "NULL"
        return "'" + val.replace("'", "''") + "'"
    if isinstance(val, bool):
        return "TRUE" if val else "FALSE"
    if isinstance(val, (np.integer,)):
        return str(int(val))
    if isinstance(val, (np.floating,)):
        if math.isnan(float(val)):
            return "NULL"
        return repr(float(val))
    if isinstance(val, (int, float)):
        if isinstance(val, float) and (math.isnan(val) or np.isnan(val)):
            return "NULL"
        return repr(float(val)) if isinstance(val, float) else str(int(val))
    return "'" + str(val).replace("'", "''") + "'"


def sql_opt_bigint(val) -> str:
    if val is None:
        return "NULL"
    try:
        if pd.isna(val):
            return "NULL"
    except (ValueError, TypeError):
        pass
    try:
        return str(int(float(val)))
    except (ValueError, TypeError, OverflowError):
        return "NULL"


def parse_fecha(val) -> date | None:
    if val is None:
        return None
    try:
        if pd.isna(val):
            return None
    except (ValueError, TypeError):
        return None
    if isinstance(val, (pd.Timestamp, datetime)):
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
            return pd.to_datetime(s, dayfirst=False, errors="coerce").date()
        except Exception:
            return None
    return None


def row_tuple(row: pd.Series) -> str:
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
    if pd.isna(lat):
        lat = None
    else:
        lat = float(lat)

    lon = row.get("Longitud")
    if pd.isna(lon):
        lon = None
    else:
        lon = float(lon)

    elev = row.get("Elevation")
    if pd.isna(elev):
        elev = None
    else:
        try:
            elev = int(round(float(elev)))
        except (ValueError, TypeError):
            elev = None

    f = parse_fecha(row.get("Fecha"))

    parts = [
        sql_literal(loc),
        sql_literal(cat),
        sql_literal(num_s),
        sql_literal(lat),
        sql_literal(lon),
        sql_literal(elev),
        sql_literal(f),
        sql_opt_bigint(row.get("especie_taxon_id")),
        sql_opt_bigint(row.get("provincia_id")),
        sql_opt_bigint(row.get("publicacion_id")),
    ]
    return "(" + ", ".join(parts) + ")"


def main() -> None:
    df = pd.read_excel(EXCEL, sheet_name=SHEET)
    required = [
        "Localidad",
        "Museo_acronimo",
        "Museo_numero",
        "Latitud",
        "Longitud",
        "Elevation",
        "Fecha",
        "especie_taxon_id",
        "provincia_id",
        "publicacion_id",
    ]
    missing = [c for c in required if c not in df.columns]
    if missing:
        print("Faltan columnas:", missing, file=sys.stderr)
        sys.exit(1)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    n = len(df)
    batches = 0
    with OUT.open("w", encoding="utf-8") as fp:
        for start in range(0, n, BATCH_SIZE):
            chunk = df.iloc[start : start + BATCH_SIZE]
            values = ",\n".join(row_tuple(chunk.iloc[i]) for i in range(len(chunk)))
            sql = (
                "INSERT INTO public.coleccion_externa "
                "(localidad, catalogo_museo, numero_museo, latitud, longitud, elevacion, fecha, "
                "taxon_id, provincia_id, publicacion_id) "
                f"VALUES\n{values};"
            )
            fp.write(json.dumps({"sql": sql, "rows": len(chunk)}, ensure_ascii=False) + "\n")
            batches += 1
    print(f"Filas: {n}, lotes: {batches}, salida: {OUT}", file=sys.stderr)


if __name__ == "__main__":
    main()
