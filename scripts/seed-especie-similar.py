#!/usr/bin/env python3
"""
Seed de la tabla `especie_similar` a partir del fragmento "Especies similares:"
embebido hoy en ficha_especie.identificacion (183 fichas, con enlaces muertos a
anfibioswebecuador.ec).

Por defecto corre en DRY-RUN: no escribe nada, genera un reporte JSON para
revisión. Con --apply inserta en `especie_similar`. Con --limpiar-identificacion
además elimina el fragmento ya migrado del campo identificacion.

Uso:
    python3 scripts/seed-especie-similar.py                        # dry-run
    python3 scripts/seed-especie-similar.py --apply
    python3 scripts/seed-especie-similar.py --apply --limpiar-identificacion
"""
import argparse
import json
import os
import re
import sys

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv(".env.local")

# Marcador del fragmento dentro de identificacion.
PAT_INICIO = re.compile(r"[Ee]species?\s+similar(?:es)?\s*:?", re.I)
# El listado termina en salto de línea (\r o \n); lo que sigue es prosa aparte.
PAT_FIN = re.compile(r"[\r\n]")
# Nombres científicos: van siempre en cursiva dentro del fragmento.
# El cierre es opcional porque hay cursivas sin </i> (ej. "<i>Hyloscirtus pacha ").
PAT_CURSIVA = re.compile(r"<i>(.*?)(?:</i>|$)", re.I | re.S)
# Basura de captura: XXX, ####, RRRRRRRRR, etc.
PAT_BASURA = re.compile(r"^[^a-z]*$|(.)\1{3,}", re.I)


def limpiar_nombre(bruto: str) -> str:
    """Quita tags residuales, puntuación de lista y espacios sobrantes."""
    s = re.sub(r"<[^>]*>", "", bruto)
    s = s.replace("&nbsp;", " ")
    s = re.sub(r"\s+", " ", s).strip()
    return s.strip(" ,.;:()")


def expandir_genero(nombre: str, genero_previo: str | None) -> str:
    """'C. bassleri' -> 'Chiasmocleis bassleri' usando el género del nombre anterior."""
    m = re.match(r"^([A-Z])\.\s+([a-z\-]+)$", nombre)
    if m and genero_previo:
        return f"{genero_previo} {m.group(2)}"
    return nombre


def extraer_fragmento(identificacion: str):
    """Devuelve (fragmento, resto) o (None, identificacion) si no hay marcador."""
    m = PAT_INICIO.search(identificacion)
    if not m:
        return None, identificacion
    fin = PAT_FIN.search(identificacion, m.end())
    corte = fin.start() if fin else len(identificacion)
    fragmento = identificacion[m.start():corte]
    resto = identificacion[:m.start()] + identificacion[corte:]
    return fragmento, resto.strip()


def nombres_del_fragmento(fragmento: str) -> list[str]:
    nombres, genero_previo = [], None
    for bruto in PAT_CURSIVA.findall(fragmento):
        # Una misma cursiva puede envolver varios nombres:
        # "<i>Gastrotheca cornuta, Gastrotheca dendronastes.</i>"
        for parte in re.split(r"[,;]", limpiar_nombre(bruto)):
            nombre = limpiar_nombre(parte)
            if not nombre or PAT_BASURA.search(nombre):
                continue
            nombre = expandir_genero(nombre, genero_previo)
            if not re.match(r"^[A-Z][a-z]+ [a-z\-]+$", nombre):
                continue
            genero_previo = nombre.split()[0]
            if nombre not in nombres:
                nombres.append(nombre)
    return nombres


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true", help="escribe en especie_similar")
    ap.add_argument(
        "--limpiar-identificacion",
        action="store_true",
        help="además borra el fragmento migrado de ficha_especie.identificacion",
    )
    ap.add_argument("--reporte", default="scripts/output/especie-similar-seed.json")
    args = ap.parse_args()

    url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        print("❌ Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en .env.local")
        return 1
    sb: Client = create_client(url, key)

    # Índice de binomios -> id_taxon (rank_id 7 = especie; el género es el padre).
    taxa = sb.table("taxon").select("id_taxon, taxon, rank_id, taxon_id").execute().data
    por_id = {t["id_taxon"]: t for t in taxa}
    binomios: dict[str, int] = {}
    for t in taxa:
        if t["rank_id"] != 7:
            continue
        genero = por_id.get(t["taxon_id"])
        if genero:
            binomios[f"{genero['taxon']} {t['taxon']}".lower()] = t["id_taxon"]
    print(f"📖 {len(binomios)} binomios indexados desde `taxon`")

    fichas = (
        sb.table("ficha_especie")
        .select("id_ficha_especie, taxon_id, identificacion")
        .execute()
        .data
    )

    filas, limpiezas, sin_match = [], [], []
    for f in fichas:
        ident = f.get("identificacion")
        if not isinstance(ident, str) or not ident.strip():
            continue
        fragmento, resto = extraer_fragmento(ident)
        if fragmento is None:
            continue
        nombres = nombres_del_fragmento(fragmento)
        if not nombres:
            continue
        for orden, nombre in enumerate(nombres, start=1):
            tid = binomios.get(nombre.lower())
            if tid == f["taxon_id"]:
                continue  # auto-referencia: la check constraint la rechazaría
            if tid is None:
                sin_match.append({"taxon_id": f["taxon_id"], "nombre": nombre})
            filas.append(
                {
                    "taxon_id": f["taxon_id"],
                    "taxon_similar_id": tid,
                    "nombre_similar": nombre,
                    "orden": orden,
                    "origen": "identificacion_legacy",
                }
            )
        limpiezas.append({"id_ficha_especie": f["id_ficha_especie"], "identificacion": resto})

    con_fk = sum(1 for r in filas if r["taxon_similar_id"] is not None)
    print(f"\n🔗 {len(filas)} relaciones desde {len(limpiezas)} fichas")
    print(f"   {con_fk} con FK a taxon | {len(filas) - con_fk} solo por nombre (especie externa)")
    print(f"   {len({s['nombre'] for s in sin_match})} nombres distintos fuera de la BD")

    os.makedirs(os.path.dirname(args.reporte), exist_ok=True)
    with open(args.reporte, "w", encoding="utf-8") as fh:
        json.dump(
            {"relaciones": filas, "sin_match": sin_match, "limpiezas": limpiezas},
            fh,
            ensure_ascii=False,
            indent=2,
        )
    print(f"📝 Reporte en {args.reporte}")

    if not args.apply:
        print("\n🔍 DRY-RUN: no se escribió nada. Revisa el reporte y vuelve con --apply.")
        return 0

    for i in range(0, len(filas), 200):
        lote = filas[i : i + 200]
        sb.table("especie_similar").insert(lote).execute()
        print(f"   ✅ insertadas {i + len(lote)}/{len(filas)}")

    if args.limpiar_identificacion:
        for c in limpiezas:
            sb.table("ficha_especie").update({"identificacion": c["identificacion"] or None}).eq(
                "id_ficha_especie", c["id_ficha_especie"]
            ).execute()
        print(f"   🧹 identificacion limpiada en {len(limpiezas)} fichas")

    return 0


if __name__ == "__main__":
    sys.exit(main())
