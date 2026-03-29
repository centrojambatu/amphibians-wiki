#!/usr/bin/env python3
"""
Actualiza taxon_id, provincia_id y publicacion_id en coleccion_externa según Prov_ALL.
Alineación por orden: filas de la tabla ordenadas por id asc = orden de filas del Excel (misma carga previa).

Mapeo Excel -> BD:
  especie_taxon_id -> taxon_id (tabla taxon.id_taxon)
  provincia_id     -> provincia_id (geopolitica.id_geopolitica)
  publicacion_id   -> publicacion_id (publicacion.id_publicacion)

Si un id no existe en la tabla referenciada, se deja NULL (evita violación de FK).
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

_SCRIPT_DIR = Path(__file__).resolve().parent
if str(_SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(_SCRIPT_DIR))

from coleccion_externa_fk_utils import map_fk_from_row

ROOT = _SCRIPT_DIR.parent
EXCEL = ROOT / "consolidacion.xlsx"
SHEET = "Prov_ALL"
PAGE = 1000
UPSERT_BATCH = 500


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


def _headers(key: str) -> dict[str, str]:
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }


def get_json(url: str, path: str, key: str) -> list:
    req = Request(
        f"{url.rstrip('/')}{path}",
        headers={**_headers(key), "Accept": "application/json"},
        method="GET",
    )
    with urlopen(req, timeout=120) as resp:
        return json.loads(resp.read().decode("utf-8"))


def fetch_id_set(url: str, key: str, table: str, col: str) -> set[int]:
    out: set[int] = set()
    offset = 0
    while True:
        path = f"/rest/v1/{table}?select={col}&limit={PAGE}&offset={offset}"
        rows = get_json(url, path, key)
        if not rows:
            break
        for row in rows:
            v = row.get(col)
            if v is not None:
                out.add(int(v))
        if len(rows) < PAGE:
            break
        offset += PAGE
    return out


def fetch_ce_ids_ordered(url: str, key: str) -> list[int]:
    ids: list[int] = []
    offset = 0
    while True:
        path = (
            f"/rest/v1/coleccion_externa?select=id&order=id.asc&limit={PAGE}&offset={offset}"
        )
        rows = get_json(url, path, key)
        if not rows:
            break
        ids.extend(int(r["id"]) for r in rows)
        if len(rows) < PAGE:
            break
        offset += PAGE
    return ids


def upsert_fk_batch(url: str, key: str, rows: list[dict]) -> None:
    path = f"{url.rstrip('/')}/rest/v1/coleccion_externa?on_conflict=id"
    data = json.dumps(rows).encode("utf-8")
    req = Request(
        path,
        data=data,
        headers={
            **_headers(key),
            "Prefer": "resolution=merge-duplicates,return=minimal",
        },
        method="POST",
    )
    try:
        with urlopen(req, timeout=180) as resp:
            if resp.status not in (200, 201):
                raise RuntimeError(f"HTTP {resp.status}")
    except HTTPError as e:
        err = e.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"HTTP {e.code}: {err}") from e


def main() -> None:
    load_env()
    base = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "").strip().rstrip("/")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    if not base or not key:
        print("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY", file=sys.stderr)
        sys.exit(1)

    df = pd.read_excel(EXCEL, sheet_name=SHEET)
    for col in ("especie_taxon_id", "provincia_id", "publicacion_id"):
        if col not in df.columns:
            print(f"Falta columna en Excel: {col}", file=sys.stderr)
            sys.exit(1)

    print("Descargando ids válidos (taxon, geopolitica, publicacion)...", file=sys.stderr)
    valid_taxon = fetch_id_set(base, key, "taxon", "id_taxon")
    valid_geo = fetch_id_set(base, key, "geopolitica", "id_geopolitica")
    valid_pub = fetch_id_set(base, key, "publicacion", "id_publicacion")
    print(
        f"  taxon={len(valid_taxon)} geopolitica={len(valid_geo)} publicacion={len(valid_pub)}",
        file=sys.stderr,
    )

    print("Descargando ids de coleccion_externa...", file=sys.stderr)
    ce_ids = fetch_ce_ids_ordered(base, key)
    n_excel = len(df)
    n_db = len(ce_ids)
    if n_excel != n_db:
        print(
            f"Error: filas Excel ({n_excel}) != filas en BD ({n_db}). "
            "No se actualiza para no desalinear.",
            file=sys.stderr,
        )
        sys.exit(1)

    payloads: list[dict] = []
    skipped_taxon = skipped_geo = skipped_pub = 0
    for i in range(n_excel):
        row = df.iloc[i]
        raw_t = row.get("especie_taxon_id")
        raw_g = row.get("provincia_id")
        raw_p = row.get("publicacion_id")
        t, g, p = map_fk_from_row(row, valid_taxon, valid_geo, valid_pub)
        if not pd.isna(raw_t) and t is None:
            skipped_taxon += 1
        if not pd.isna(raw_g) and g is None:
            skipped_geo += 1
        if not pd.isna(raw_p) and p is None:
            skipped_pub += 1
        payloads.append(
            {
                "id": ce_ids[i],
                "taxon_id": t,
                "provincia_id": g,
                "publicacion_id": p,
            }
        )

    print(
        f"Valores Excel sin FK válida (se puso NULL): "
        f"taxon={skipped_taxon} provincia={skipped_geo} publicacion={skipped_pub}",
        file=sys.stderr,
    )

    for i in range(0, len(payloads), UPSERT_BATCH):
        upsert_fk_batch(base, key, payloads[i : i + UPSERT_BATCH])
        print(f"{min(i + UPSERT_BATCH, len(payloads))}/{len(payloads)}", flush=True)
        time.sleep(0.03)

    print("OK", file=sys.stderr)


if __name__ == "__main__":
    main()
