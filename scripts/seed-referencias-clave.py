#!/usr/bin/env python3
"""
Marca las referencias clave de cada especie a partir de la sección
"Referencias clave.—" de los sumarios (~/Documents/1 Sumarios especies, un .docx por género).

Formato de origen:
    Referencias clave.—(Boulenger, 1883) (descripción); (Arteaga et al., 2013) (sumario).
    Referencias clave.—(Raffaëlli, 2007; Stuart et al., 2008; Raffaëlli, 2013, 2022) (sumarios).

Cada cita se resuelve contra `publicacion` por primer autor + año + número de autores:
  1. entre las publicaciones ya vinculadas al taxón en `taxon_publicacion`;
  2. si no hay ninguna, en toda la tabla, solo si la coincidencia es única.
Los sumarios no tienen bibliografía, así que la letra del año (2004j) no se puede resolver:
lo ambiguo no se escribe y queda en el reporte.

Por defecto corre en DRY-RUN. Con --apply:
  - vínculo existente  -> UPDATE referencia_clave = true, tema (si estaba vacío)
  - sin vínculo        -> INSERT en taxon_publicacion con referencia_clave = true

Uso:
    python3 scripts/seed-referencias-clave.py            # dry-run
    python3 scripts/seed-referencias-clave.py --apply
"""
import argparse
import collections
import difflib
import glob
import json
import os
import re
import sys
import unicodedata

import docx
from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv(".env.local")

CARPETA = os.path.expanduser("~/Documents/1 Sumarios especies")
# El corpus usa Noblella donde la base usa Phyllonastes.
SINONIMOS_GENERO = {"noblella": "phyllonastes"}

PAT_SECCION = re.compile(r"^\s*Referencias? clave\.?\s*[—–-]+\s*", re.I)
# "(citas con año) (tema opcional)"
PAT_GRUPO = re.compile(r"\(([^()]*?\d{4}[a-z]?[^()]*)\)\s*(?:\(([^()]*)\))?")
PAT_ANO = re.compile(r"^(\d{4})([a-z]?)$")


def norm(s: str) -> str:
    """Minúsculas, sin acentos, NFC (macOS guarda en NFD)."""
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"\s+", " ", s).strip().lower()


def paginar(sb: Client, tabla: str, columnas: str, orden: str) -> list[dict]:
    """PostgREST corta en 1.000 filas sin avisar: paginar por una columna única."""
    filas, desde = [], 0
    while True:
        pagina = (
            sb.table(tabla).select(columnas).order(orden).range(desde, desde + 999).execute().data
        )
        filas.extend(pagina)
        if len(pagina) < 1000:
            return filas
        desde += 1000


def autores_de_cita(texto: str) -> tuple[str, int, str | None] | None:
    """
    (primer apellido, nº de autores, segundo apellido):
    'Taylor y Peters' -> ('taylor', 2, 'peters'); 'Arteaga et al.' -> ('arteaga', 3, None).
    Las iniciales ("Lynch, J. D.") no cuentan como autor.
    """
    t = texto.strip().strip(",")
    if not t:
        return None
    if re.search(r"\bet al\.?", t):
        primero = re.split(r"\s+et al", t)[0]
        return norm(primero), 3, None
    partes = [
        p.strip()
        for p in re.split(r",\s*|\s+y\s+|\s+&\s+|\s+and\s+", t)
        if p.strip() and not re.fullmatch(r"([A-ZÁÉÍÓÚ]\.\s*-?)+|Jr\.?|-", p.strip())
    ]
    if not partes:
        return None
    return norm(partes[0]), len(partes), norm(partes[1]) if len(partes) > 1 else None


def autores_de_publicacion(cita_corta: str) -> tuple[str, int] | None:
    """'Lynch, Coloma y Ron (2004)' / '(Coloma et al. 2004)' / 'Flores, G. (1987)'."""
    t = re.sub(r"[()]", " ", cita_corta or "")
    t = re.sub(r"\b\d{4}[a-z]?\b.*$", "", t).strip().strip(",")
    return autores_de_cita(t)


def compatible(cita: tuple, pub: tuple) -> bool:
    if cita[0] != pub[0]:
        return False
    if cita[1] >= 3:
        return pub[1] >= 3
    if cita[1] == 2:
        return pub[1] == 2 and cita[2] == pub[2]
    return pub[1] == 1


def mismo_titulo(a: str, b: str) -> bool:
    """Títulos de la misma obra duplicada: iguales, uno truncado del otro o casi idénticos."""
    if not a or not b:
        return False
    if a.startswith(b[:40]) or b.startswith(a[:40]):
        return True
    return difflib.SequenceMatcher(None, a, b).ratio() >= 0.85


def parsear_referencias(parrafo: str) -> list[dict]:
    """Devuelve [{autores, ano, letra, tema, texto}] de un párrafo 'Referencias clave.—…'."""
    cuerpo = PAT_SECCION.sub("", parrafo)
    salida = []
    for grupo, tema in PAT_GRUPO.findall(cuerpo):
        tema = (tema or "").strip() or None
        for cita in grupo.split(";"):
            # "Raffaëlli, 2013, 2022": un autor con varios años.
            trozos = [x.strip() for x in cita.split(",")]
            anos = []
            while trozos and PAT_ANO.match(trozos[-1]):
                anos.insert(0, trozos.pop())
            if not anos or not trozos:
                continue
            autores = autores_de_cita(", ".join(trozos))
            if not autores:
                continue
            for a in anos:
                m = PAT_ANO.match(a)
                salida.append(
                    {
                        "autores": autores,
                        "ano": int(m.group(1)),
                        "letra": m.group(2) or None,
                        "tema": tema,
                        "texto": f"{', '.join(trozos)}, {a}",
                    }
                )
    return salida


def encabezado_de_especie(texto: str, binomios: dict[str, int]) -> int | None:
    """
    Encabezado = primera línea en MAYÚSCULAS que empieza por un binomio ("ATELOPUS BALIOS (RANA…)").
    12 fichas lo usan en formato normal ("Hyloscirtus conscientia (Rana de…) Autor, 2020"): se
    aceptan si la línea es breve, no lleva raya de sección ni termina en punto. Así no cuentan
    los pies de figura ni las frases que empiezan nombrando otra especie.
    """
    primera = texto.split("\n")[0].strip()
    palabras = norm(primera).split(" ")
    if len(palabras) < 2:
        return None
    genero = SINONIMOS_GENERO.get(palabras[0], palabras[0])
    tid = binomios.get(f"{genero} {palabras[1].strip('.,')}")
    if tid is None:
        return None
    letras = re.sub(r"[^A-Za-zÁÉÍÓÚÑáéíóúñ]", "", primera.split(" (")[0])
    if letras and letras == letras.upper():
        return tid
    if "—" not in primera and len(primera) < 250 and not primera.endswith(".") and ":" not in primera:
        return tid
    return None


def leer_sumarios(binomios: dict[str, int]) -> tuple[dict[int, list[dict]], list[str]]:
    """{taxon_id: [referencias]} recorriendo los .docx; la especie vigente es el último encabezado."""
    por_taxon: dict[int, list[dict]] = collections.defaultdict(list)
    huerfanas: list[str] = []
    for ruta in sorted(glob.glob(os.path.join(CARPETA, "*.docx"))):
        actual = None
        for p in docx.Document(ruta).paragraphs:
            texto = p.text.strip()
            if not texto:
                continue
            if PAT_SECCION.match(texto):
                if actual is None:
                    huerfanas.append(f"{os.path.basename(ruta)}: {texto[:80]}")
                else:
                    por_taxon[actual].extend(parsear_referencias(texto))
                continue
            tid = encabezado_de_especie(texto, binomios)
            if tid is not None:
                actual = tid
    return por_taxon, huerfanas


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true", help="escribe en taxon_publicacion")
    ap.add_argument("--reporte", default="scripts/output/referencias-clave-seed.json")
    args = ap.parse_args()

    url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        print("❌ Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en .env.local")
        return 1
    sb: Client = create_client(url, key)

    taxa = paginar(sb, "taxon", "id_taxon, taxon, rank_id, taxon_id", "id_taxon")
    por_id = {t["id_taxon"]: t for t in taxa}
    binomios: dict[str, int] = {}
    for t in taxa:
        genero = por_id.get(t["taxon_id"])
        if t["rank_id"] == 7 and genero:
            binomios[norm(f"{genero['taxon']} {t['taxon']}")] = t["id_taxon"]

    pubs = paginar(
        sb, "publicacion", "id_publicacion, cita_corta, titulo, numero_publicacion_ano", "id_publicacion"
    )
    por_ano: dict[int, list[dict]] = collections.defaultdict(list)
    for p in pubs:
        a = autores_de_publicacion(p["cita_corta"] or "")
        if a and p["numero_publicacion_ano"]:
            p["_autores"] = a
            por_ano[int(p["numero_publicacion_ano"])].append(p)

    vinculos = paginar(
        sb,
        "taxon_publicacion",
        "id_taxon_publicacion, taxon_id, publicacion_id, referencia_clave, tema",
        "id_taxon_publicacion",
    )
    vinculo_de = {(v["taxon_id"], v["publicacion_id"]): v for v in vinculos}
    pubs_de_taxon: dict[int, set[int]] = collections.defaultdict(set)
    usos: collections.Counter[int] = collections.Counter()
    for v in vinculos:
        pubs_de_taxon[v["taxon_id"]].add(v["publicacion_id"])
        usos[v["publicacion_id"]] += 1

    def unica(cands: list[dict]) -> dict | None:
        """
        Una sola candidata, o varias que son la misma obra duplicada en `publicacion` (mismo
        título; cita_corta no es única). En ese caso, la más vinculada y, a igualdad, la de menor id.
        """
        if len(cands) == 1:
            return cands[0]
        titulos = [norm(re.sub(r"[^\w\s]", " ", c.get("titulo") or "")) for c in cands]
        if not all(mismo_titulo(titulos[0], t) for t in titulos[1:]):
            return None
        return sorted(cands, key=lambda c: (-usos[c["id_publicacion"]], c["id_publicacion"]))[0]
    print(f"📖 {len(binomios)} especies · {len(pubs)} publicaciones · {len(vinculos)} vínculos")

    por_taxon, huerfanas = leer_sumarios(binomios)
    total = sum(len(v) for v in por_taxon.values())
    print(f"📄 {total} citas en 'Referencias clave' de {len(por_taxon)} especies")

    updates, inserts, ambiguas, sin_match = [], [], [], []
    for tid, refs in por_taxon.items():
        vistos: set[int] = set()
        for r in refs:
            candidatas = [p for p in por_ano.get(r["ano"], []) if compatible(r["autores"], p["_autores"])]
            vinculadas = [p for p in candidatas if p["id_publicacion"] in pubs_de_taxon[tid]]
            if vinculadas and unica(vinculadas):
                elegida = unica(vinculadas)
            elif vinculadas:
                ambiguas.append({"taxon_id": tid, **r, "candidatas": [p["cita_corta"] for p in vinculadas], "ambito": "vinculadas"})
                continue
            elif candidatas and unica(candidatas):
                elegida = unica(candidatas)
            else:
                destino = ambiguas if candidatas else sin_match
                destino.append({"taxon_id": tid, **r, "candidatas": [f'{p["cita_corta"]} — {(p.get("titulo") or "")[:60]}' for p in candidatas][:10], "ambito": "global"})
                continue

            pid = elegida["id_publicacion"]
            if pid in vistos:
                continue
            vistos.add(pid)
            v = vinculo_de.get((tid, pid))
            fila = {"taxon_id": tid, "publicacion_id": pid, "tema": r["tema"], "cita": r["texto"], "match": elegida["cita_corta"]}
            if v is None:
                inserts.append(fila)
            elif not v["referencia_clave"] or (r["tema"] and not v["tema"]):
                updates.append({**fila, "id_taxon_publicacion": v["id_taxon_publicacion"], "tema_actual": v["tema"]})

    resueltas = len(updates) + len(inserts)
    print(f"\n✅ {resueltas} referencias resueltas: {len(updates)} vínculos existentes · {len(inserts)} vínculos nuevos")
    print(f"⚠️  {len(ambiguas)} ambiguas · ❌ {len(sin_match)} sin publicación en la base · {len(huerfanas)} secciones sin especie")
    especies = {f["taxon_id"] for f in updates + inserts}
    print(f"🐸 {len(especies)} especies tendrían referencias clave")

    os.makedirs(os.path.dirname(args.reporte), exist_ok=True)
    with open(args.reporte, "w", encoding="utf-8") as fh:
        json.dump(
            {"updates": updates, "inserts": inserts, "ambiguas": ambiguas, "sin_match": sin_match, "huerfanas": huerfanas},
            fh,
            ensure_ascii=False,
            indent=2,
        )
    print(f"📝 Reporte en {args.reporte}")

    if not args.apply:
        print("\n🔍 DRY-RUN: no se escribió nada. Revisa el reporte y vuelve con --apply.")
        return 0

    # Estado previo para poder revertir: ids insertados y valores anteriores de lo actualizado.
    reversion = {
        "insertados": [],
        "actualizados": [
            {"id_taxon_publicacion": u["id_taxon_publicacion"], "referencia_clave": False, "tema": u["tema_actual"]}
            for u in updates
        ],
    }
    ruta_reversion = args.reporte.replace(".json", "-reversion.json")

    def guardar_reversion() -> None:
        with open(ruta_reversion, "w", encoding="utf-8") as fh:
            json.dump(reversion, fh, ensure_ascii=False, indent=2)

    guardar_reversion()

    for u in updates:
        cambios = {"referencia_clave": True}
        if u["tema"] and not u["tema_actual"]:
            cambios["tema"] = u["tema"]
        sb.table("taxon_publicacion").update(cambios).eq("id_taxon_publicacion", u["id_taxon_publicacion"]).execute()
    print(f"   ✅ {len(updates)} vínculos actualizados")

    nuevos = [
        {"taxon_id": i["taxon_id"], "publicacion_id": i["publicacion_id"], "referencia_clave": True, "tema": i["tema"], "principal": False}
        for i in inserts
    ]
    for i in range(0, len(nuevos), 200):
        creadas = sb.table("taxon_publicacion").insert(nuevos[i : i + 200]).execute().data
        reversion["insertados"].extend(c["id_taxon_publicacion"] for c in creadas)
        guardar_reversion()
    print(f"   ✅ {len(nuevos)} vínculos insertados")
    print(f"   ↩️  Reversión en {ruta_reversion}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
