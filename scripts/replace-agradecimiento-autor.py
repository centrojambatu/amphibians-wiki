#!/usr/bin/env python3
"""
Reemplaza "Xavier Aguas" por "Allient" en ficha_especie.agradecimiento.

Por defecto corre en DRY-RUN: no escribe nada, genera un reporte JSON con el
antes/después. Con --apply actualiza la base y guarda una copia de seguridad de
los valores originales en scripts/output/.

Ojo: en `agradecimiento` los <br> SÍ hacen falta (a diferencia de `historial`,
la ficha no convierte \r en salto para este campo), así que aquí no se tocan.

Uso:
    python3 scripts/replace-agradecimiento-autor.py            # dry-run
    python3 scripts/replace-agradecimiento-autor.py --apply
"""
import argparse
import json
import os
import sys
from datetime import datetime

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv(".env.local")

BUSCAR = "Xavier Aguas"
REEMPLAZO = "Allient"
SALIDA = "scripts/output"


def conectar() -> Client:
    url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not url or not key:
        print("❌ Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local")
        sys.exit(1)

    return create_client(url, key)


def leer_fichas(sb: Client) -> list[dict]:
    """PostgREST corta en 1.000 filas sin avisar: paginar por taxon_id (único)."""
    filas: list[dict] = []
    inicio = 0

    while True:
        pagina = (
            sb.table("ficha_especie")
            .select("taxon_id,agradecimiento")
            .order("taxon_id")
            .range(inicio, inicio + 999)
            .execute()
            .data
        )
        filas += pagina

        if len(pagina) < 1000:
            break

        inicio += 1000

    return filas


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="escribe los cambios en la base")
    args = parser.parse_args()

    sb = conectar()
    filas = leer_fichas(sb)
    print(f"📖 {len(filas)} filas leídas de ficha_especie")

    cambios = []

    for fila in filas:
        original = fila["agradecimiento"]

        if not original or BUSCAR not in original:
            continue

        cambios.append(
            {
                "taxon_id": fila["taxon_id"],
                "ocurrencias": original.count(BUSCAR),
                "antes": original,
                "despues": original.replace(BUSCAR, REEMPLAZO),
            }
        )

    total = sum(c["ocurrencias"] for c in cambios)
    print(f'🔎 {len(cambios)} fichas con "{BUSCAR}" ({total} ocurrencias)')

    if not cambios:
        print("✅ Nada que hacer")
        return

    os.makedirs(SALIDA, exist_ok=True)
    reporte = f"{SALIDA}/agradecimiento-autor-reporte.json"

    with open(reporte, "w", encoding="utf-8") as f:
        json.dump(cambios, f, ensure_ascii=False, indent=2)

    print(f"📝 Reporte antes/después: {reporte}")

    if not args.apply:
        print("\n--- Vista previa (2 primeras) ---")

        for c in cambios[:2]:
            print(f"\ntaxon_id={c['taxon_id']}")
            print(f"  antes  : {c['antes'][-200:]!r}")
            print(f"  después: {c['despues'][-200:]!r}")

        print("\n🚫 DRY-RUN: no se escribió nada. Repetir con --apply")
        return

    sello = datetime.now().strftime("%Y%m%d-%H%M%S")
    respaldo = f"{SALIDA}/agradecimiento-autor-backup-{sello}.json"

    with open(respaldo, "w", encoding="utf-8") as f:
        json.dump(
            [{"taxon_id": c["taxon_id"], "agradecimiento": c["antes"]} for c in cambios],
            f,
            ensure_ascii=False,
            indent=2,
        )

    print(f"💾 Respaldo de los valores originales: {respaldo}")

    ok = 0
    errores = []

    for c in cambios:
        try:
            sb.table("ficha_especie").update({"agradecimiento": c["despues"]}).eq(
                "taxon_id", c["taxon_id"]
            ).execute()
            ok += 1
        except Exception as err:  # noqa: BLE001
            errores.append((c["taxon_id"], str(err)))

    print(f"\n✅ {ok} fichas actualizadas")

    if errores:
        print(f"❌ {len(errores)} con error:")

        for taxon_id, err in errores:
            print(f"   taxon_id={taxon_id}: {err}")

    restantes = [r for r in leer_fichas(sb) if r["agradecimiento"] and BUSCAR in r["agradecimiento"]]
    print(f'🔁 Verificación: quedan {len(restantes)} fichas con "{BUSCAR}"')


if __name__ == "__main__":
    main()
