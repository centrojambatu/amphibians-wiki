#!/usr/bin/env python3
"""
Actualiza pluviocidad_min, pluviocidad_max y pluviocidad_prom en ficha_especie
desde CONSOLIDADO_Prec_COMP.xlsx (columna taxon_id).

Omite la fila errónea Epipedobates darwinwallacei con taxon_id 252 (duplicado).

Con --write-chunks DIR genera un .sql por lote (un UPDATE cada archivo) para
ejecutar en Supabase SQL Editor o MCP execute_sql (una sentencia por llamada).

Uso:
  python3 scripts/update-pluviocidad-ficha-from-excel.py
  python3 scripts/update-pluviocidad-ficha-from-excel.py /ruta/al.xlsx --write-chunks ./tmp_prec
"""
import argparse
import os
import sys
from pathlib import Path
from typing import List, Tuple

import pandas as pd

DEFAULT_EXCEL = (
    "/Users/xavieraguas/Documents/Transfer/CONSOLIDADOS/Prec_COMP/"
    "CONSOLIDADO_Prec_COMP.xlsx"
)
ROWS_PER_CHUNK = 40

# El Excel trae dos espacios antes de "(mm)" en el encabezado del promedio
COL_AVG = "Precipitation AVERAGE  (mm)"


def build_update_sql(rows: List[Tuple[int, float, float, float]]) -> str:
    vals = ",\n".join(
        f"({tid}::bigint, {pmin}::double precision, {pmax}::double precision, "
        f"{pprom}::double precision)"
        for tid, pmin, pmax, pprom in rows
    )
    return f"""UPDATE public.ficha_especie fe SET
  pluviocidad_min = v.pmin,
  pluviocidad_max = v.pmax,
  pluviocidad_prom = v.pprom
FROM (VALUES
{vals}
) AS v(taxon_id, pmin, pmax, pprom)
WHERE fe.taxon_id = v.taxon_id;"""


def load_rows(excel_path: str) -> List[Tuple[int, float, float, float]]:
    df = pd.read_excel(excel_path, sheet_name="Prec_COMP")
    cmin = "Precipitation MIN (mm)"
    cmax = "Precipitation MAX (mm)"
    for c in (cmin, cmax, COL_AVG, "taxon_id", "Species name"):
        if c not in df.columns:
            print(f"❌ Falta columna: {c!r}")
            sys.exit(1)

    mask_bad = (df["taxon_id"] == 252) & df["Species name"].astype(str).str.contains(
        "darwinwallace", case=False, na=False
    )
    if mask_bad.any():
        print(f"⚠️  Omitiendo {int(mask_bad.sum())} fila(s) errónea(s) (darwinwallacei / taxon_id 252)")
    df = df[~mask_bad].copy()

    df[cmin] = pd.to_numeric(df[cmin], errors="coerce")
    df[cmax] = pd.to_numeric(df[cmax], errors="coerce")
    df[COL_AVG] = pd.to_numeric(df[COL_AVG], errors="coerce")
    if df[cmin].isna().any() or df[cmax].isna().any() or df[COL_AVG].isna().any():
        print("❌ Hay valores no numéricos en precipitación")
        sys.exit(1)

    rows = []
    for _, r in df.iterrows():
        rows.append(
            (int(r["taxon_id"]), float(r[cmin]), float(r[cmax]), float(r[COL_AVG]))
        )
    return rows


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("excel_path", nargs="?", default=DEFAULT_EXCEL)
    parser.add_argument(
        "--write-chunks",
        metavar="DIR",
        help="Escribe chunk_01.sql, chunk_02.sql, ... en DIR",
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
        return

    n_chunks = (len(rows) + ROWS_PER_CHUNK - 1) // ROWS_PER_CHUNK
    print(f"Listo para generar {n_chunks} lotes de hasta {ROWS_PER_CHUNK} taxones.")
    print("Pasa --write-chunks DIR para escribir los .sql.")


if __name__ == "__main__":
    main()
