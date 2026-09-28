#!/usr/bin/env python3
"""
Elimina las etiquetas <br> literales de ficha_especie.historial.

El campo guarda los saltos como `\r<br>`: la ficha ya convierte `\r` en `<br />`
al renderizar (card-species-content.tsx), así que la etiqueta guardada duplica
el salto. Quitarla deja el `\r`, que es el formato que usan las filas correctas.

Por defecto corre en DRY-RUN: no escribe nada, genera un reporte JSON con el
antes/después de cada fila. Con --apply actualiza la base y guarda una copia de
seguridad de los valores originales en scripts/output/.

Uso:
    python3 scripts/clean-historial-br.py            # dry-run
    python3 scripts/clean-historial-br.py --apply
"""
import argparse
import json
import os
import re
import sys
from datetime import datetime

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv(".env.local")

# Cualquier variante de la etiqueta: <br>, <br/>, <br />, <BR>...
PAT_BR = re.compile(r"<\s*br\s*/?\s*>", re.I)

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
            .select("taxon_id,historial")
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
        original = fila["historial"]

        if not original or not PAT_BR.search(original):
            continue

        limpio = PAT_BR.sub("", original)
        cambios.append(
            {
                "taxon_id": fila["taxon_id"],
                "etiquetas": len(PAT_BR.findall(original)),
                "antes": original,
                "despues": limpio,
            }
        )

    total_etiquetas = sum(c["etiquetas"] for c in cambios)
    print(f"🔎 {len(cambios)} fichas con <br> ({total_etiquetas} etiquetas en total)")

    if not cambios:
        print("✅ Nada que hacer")
        return

    os.makedirs(SALIDA, exist_ok=True)
    reporte = f"{SALIDA}/historial-br-reporte.json"

    with open(reporte, "w", encoding="utf-8") as f:
        json.dump(cambios, f, ensure_ascii=False, indent=2)

    print(f"📝 Reporte antes/después: {reporte}")

    if not args.apply:
        print("\n--- Vista previa (3 primeras) ---")

        for c in cambios[:3]:
            print(f"\ntaxon_id={c['taxon_id']}")
            print(f"  antes  : {c['antes'][:160]!r}")
            print(f"  después: {c['despues'][:160]!r}")

        print("\n🚫 DRY-RUN: no se escribió nada. Repetir con --apply")
        return

    sello = datetime.now().strftime("%Y%m%d-%H%M%S")
    respaldo = f"{SALIDA}/historial-br-backup-{sello}.json"

    with open(respaldo, "w", encoding="utf-8") as f:
        json.dump(
            [{"taxon_id": c["taxon_id"], "historial": c["antes"]} for c in cambios],
            f,
            ensure_ascii=False,
            indent=2,
        )

    print(f"💾 Respaldo de los valores originales: {respaldo}")

    ok = 0
    errores = []

    for c in cambios:
        try:
            sb.table("ficha_especie").update({"historial": c["despues"]}).eq(
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

    restantes = [r for r in leer_fichas(sb) if r["historial"] and PAT_BR.search(r["historial"])]
    print(f"🔁 Verificación: quedan {len(restantes)} fichas con <br>")


if __name__ == "__main__":
    main()
