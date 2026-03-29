#!/usr/bin/env python3
"""
Actualiza area_distribucion (km²) en ficha_especie desde CONSOLIDADO_AreaDist.xlsx.

No existe tabla area_distribucion: el dato vive en ficha_especie.area_distribucion (bigint).

Limpieza del Excel:
- Filas sin taxon_id o sin área: se omiten.
- taxon_id duplicado: se usa el máximo de «Área (Km2)» (p. ej. 628 tenía 5540 y 5).
- Valores decimales: se redondean al entero más cercano para bigint.

Con --write-chunks DIR genera chunk_01.sql … para ejecutar con execute_sql (una sentencia por archivo).

Uso:
  python3 scripts/update-area-distribucion-ficha-from-excel.py --write-chunks ./tmp_area
"""
import argparse
import os
import sys
from pathlib import Path
from typing import List, Tuple

import pandas as pd

DEFAULT_EXCEL = (
    "/Users/xavieraguas/Documents/Transfer/CONSOLIDADOS/AreaDist/CONSOLIDADO_AreaDist.xlsx"
)
ROWS_PER_CHUNK = 40
COL_AREA = "Área (Km2)"


def build_update_sql(rows: List[Tuple[int, int]]) -> str:
    vals = ",\n".join(f"({tid}::bigint, {a}::bigint)" for tid, a in rows)
    return f"""UPDATE public.ficha_especie fe SET
  area_distribucion = v.area_km2
FROM (VALUES
{vals}
) AS v(taxon_id, area_km2)
WHERE fe.taxon_id = v.taxon_id;"""


def load_rows(excel_path: str) -> List[Tuple[int, int]]:
    df = pd.read_excel(excel_path, sheet_name="AreaDist")
    for c in (COL_AREA, "taxon_id"):
        if c not in df.columns:
            print(f"❌ Falta columna: {c!r}")
            sys.exit(1)

    df = df.dropna(subset=["taxon_id", COL_AREA])
    df["taxon_id"] = df["taxon_id"].astype(int)
    df[COL_AREA] = pd.to_numeric(df[COL_AREA], errors="coerce")
    df = df.dropna(subset=[COL_AREA])

    agg = df.groupby("taxon_id", as_index=False)[COL_AREA].max()
    rows = []
    for _, r in agg.iterrows():
        area = int(round(float(r[COL_AREA])))
        rows.append((int(r["taxon_id"]), area))
    return rows


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("excel_path", nargs="?", default=DEFAULT_EXCEL)
    parser.add_argument("--write-chunks", metavar="DIR")
    args = parser.parse_args()

    if not os.path.isfile(args.excel_path):
        print(f"❌ No existe: {args.excel_path}")
        sys.exit(1)

    rows = load_rows(args.excel_path)
    print(f"Taxones únicos (tras limpieza y max por duplicado): {len(rows)}")

    if args.write_chunks:
        out = Path(args.write_chunks)
        out.mkdir(parents=True, exist_ok=True)
        n = 0
        for i in range(0, len(rows), ROWS_PER_CHUNK):
            chunk = rows[i : i + ROWS_PER_CHUNK]
            n += 1
            (out / f"chunk_{n:02d}.sql").write_text(build_update_sql(chunk), encoding="utf-8")
            print(f"  {out / f'chunk_{n:02d}.sql'} ({len(chunk)} taxones)")
        print(f"✅ {n} archivos SQL")
        return

    n_chunks = (len(rows) + ROWS_PER_CHUNK - 1) // ROWS_PER_CHUNK
    print(f"Puedes generar {n_chunks} lotes con --write-chunks DIR.")


if __name__ == "__main__":
    main()
