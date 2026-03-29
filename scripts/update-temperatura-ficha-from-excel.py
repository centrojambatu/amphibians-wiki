#!/usr/bin/env python3
"""
Actualiza temperatura_min, temperatura_max y temperatura_prom en ficha_especie
desde CONSOLIDADO_Temp_COMP.xlsx (columna taxon_id).

Omite la fila errónea Epipedobates darwinwallacei con taxon_id 252 (duplicado;
en BD 252 es Epipedobates espinosai).

Por defecto solo genera archivos SQL por lotes (un UPDATE por archivo). Ejecuta
cada uno con Supabase SQL Editor o MCP execute_sql (una sentencia por llamada).

Uso:
  python3 scripts/update-temperatura-ficha-from-excel.py [ruta.xlsx]
  python3 scripts/update-temperatura-ficha-from-excel.py --write-chunks /ruta/salida
"""
import argparse
import os
import sys
from pathlib import Path
from typing import List, Tuple

import pandas as pd

DEFAULT_EXCEL = (
    "/Users/xavieraguas/Documents/Transfer/CONSOLIDADOS/TEMP_COMP/"
    "CONSOLIDADO_Temp_COMP.xlsx"
)
ROWS_PER_CHUNK = 40


def build_update_sql(rows: List[Tuple[int, float, float, float]]) -> str:
    vals = ",\n".join(
        f"({tid}::bigint, {tmin}::double precision, {tmax}::double precision, "
        f"{tprom}::double precision)"
        for tid, tmin, tmax, tprom in rows
    )
    return f"""UPDATE public.ficha_especie fe SET
  temperatura_min = v.tmin,
  temperatura_max = v.tmax,
  temperatura_prom = v.tprom
FROM (VALUES
{vals}
) AS v(taxon_id, tmin, tmax, tprom)
WHERE fe.taxon_id = v.taxon_id;"""


def load_rows(excel_path: str) -> List[Tuple[int, float, float, float]]:
    df = pd.read_excel(excel_path, sheet_name="Temp_COMP")
    col_min = "Temperature MIN (ºC)"
    col_max = "Temperature MAX (ºC)"
    col_avg = "Temperature AVERAGE (ºC)"
    for c in (col_min, col_max, col_avg, "taxon_id", "Species name"):
        if c not in df.columns:
            print(f"❌ Falta columna: {c}")
            sys.exit(1)

    mask_bad = (df["taxon_id"] == 252) & df["Species name"].astype(str).str.contains(
        "darwinwallace", case=False, na=False
    )
    if mask_bad.any():
        print(f"⚠️  Omitiendo {int(mask_bad.sum())} fila(s) errónea(s) (darwinwallacei / taxon_id 252)")
    df = df[~mask_bad].copy()

    df[col_min] = pd.to_numeric(df[col_min], errors="coerce")
    df[col_max] = pd.to_numeric(df[col_max], errors="coerce")
    df[col_avg] = pd.to_numeric(df[col_avg], errors="coerce")
    if df[col_min].isna().any() or df[col_max].isna().any() or df[col_avg].isna().any():
        print("❌ Hay valores no numéricos en temperaturas")
        sys.exit(1)

    rows = []
    for _, r in df.iterrows():
        rows.append(
            (int(r["taxon_id"]), float(r[col_min]), float(r[col_max]), float(r[col_avg]))
        )
    return rows


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("excel_path", nargs="?", default=DEFAULT_EXCEL)
    parser.add_argument(
        "--write-chunks",
        metavar="DIR",
        help="Escribe chunk_01.sql, chunk_02.sql, ... en DIR (cada uno es un UPDATE)",
    )
    args = parser.parse_args()

    if not os.path.isfile(args.excel_path):
        print(f"❌ No existe: {args.excel_path}")
        sys.exit(1)

    rows = load_rows(args.excel_path)
    print(f"Filas (tras limpieza): {len(rows)}")

    if args.write_chunks:
        out = Path(args.write_chunks)
        out.mkdir(parents=True, exist_ok=True)
        n = 0
        for i in range(0, len(rows), ROWS_PER_CHUNK):
            chunk = rows[i : i + ROWS_PER_CHUNK]
            n += 1
            sql = build_update_sql(chunk)
            fp = out / f"chunk_{n:02d}.sql"
            fp.write_text(sql, encoding="utf-8")
            print(f"  {fp} ({len(chunk)} taxones)")
        print(f"✅ {n} archivos SQL en {out}")
        print("Ejecuta cada .sql con una sola llamada a execute_sql (una sentencia por archivo).")
        return

    # Sin --write-chunks: solo validar y resumir
    n_chunks = (len(rows) + ROWS_PER_CHUNK - 1) // ROWS_PER_CHUNK
    print(f"Listo para generar {n_chunks} lotes de hasta {ROWS_PER_CHUNK} taxones.")
    print("Pasa --write-chunks DIR para escribir los .sql.")


if __name__ == "__main__":
    main()
