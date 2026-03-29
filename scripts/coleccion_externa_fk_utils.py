"""Helpers para mapear FK de coleccion_externa desde Prov_ALL y validar contra tablas referenciadas."""
from __future__ import annotations

import math
import pandas as pd


def excel_opt_int(
    row: pd.Series,
    col: str,
    valid: set[int] | None = None,
) -> int | None:
    v = row.get(col)
    if v is None:
        return None
    try:
        if pd.isna(v):
            return None
    except (ValueError, TypeError):
        return None
    try:
        i = int(float(v))
    except (ValueError, TypeError, OverflowError):
        return None
    if valid is not None and i not in valid:
        return None
    return i


def map_fk_from_row(
    row: pd.Series,
    valid_taxon: set[int],
    valid_geo: set[int],
    valid_pub: set[int],
) -> tuple[int | None, int | None, int | None]:
    """especie_taxon_id -> taxon_id; provincia_id -> geopolitica; publicacion_id -> publicacion."""
    taxon_id = excel_opt_int(row, "especie_taxon_id", valid_taxon)
    provincia_id = excel_opt_int(row, "provincia_id", valid_geo)
    publicacion_id = excel_opt_int(row, "publicacion_id", valid_pub)
    return taxon_id, provincia_id, publicacion_id
