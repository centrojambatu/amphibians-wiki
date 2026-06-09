import {NextResponse} from "next/server";

import {createServiceClient} from "@/utils/supabase/server";

const ITEMS_POR_PAGINA = 50;

function parseList(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split("||")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseNumber(raw: string | null): number | null {
  if (!raw) return null;
  const n = Number(raw);

  return Number.isFinite(n) ? n : null;
}

const COUNT_KEY_BY_MUESTRA: Record<string, string> = {
  tejido_higado: "count_tejido_higado",
  tejido_musculo: "count_tejido_musculo",
  piel_exudado: "count_piel_exudado",
  piel_liofilizado: "count_piel_liofilizado",
  sangre: "count_sangre",
  esperma: "count_esperma",
  heces: "count_heces",
  otros: "count_otros",
  esqueleto_transparentacion: "count_esqueleto_transparentacion",
};

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);

  const busqueda = searchParams.get("busqueda")?.trim() || "";
  const familias = parseList(searchParams.get("familias"));
  const generos = parseList(searchParams.get("generos"));
  const tiposMuestra = parseList(searchParams.get("tipos_muestra"));
  const pagina = Math.max(1, parseNumber(searchParams.get("pagina")) || 1);

  const supabase = createServiceClient();

  try {
    const {data: agregados, error: errAgg} = await (supabase as any)
      .from("vw_moleculoteca_taxon")
      .select("*");

    if (errAgg) throw errAgg;
    if (!agregados || agregados.length === 0) {
      return NextResponse.json({taxa: [], total: 0, totalPaginas: 0, paginaActual: 1});
    }

    const taxonIds = (agregados as any[])
      .map((a) => a.taxon_id as number | null)
      .filter((id): id is number => id != null);

    let query = supabase
      .from("vw_ficha_especie_completa")
      .select("especie_taxon_id, nombre_cientifico, nombre_comun, orden, familia, genero")
      .in("especie_taxon_id", taxonIds);

    if (busqueda) {
      query = query.or(
        `nombre_cientifico.ilike.%${busqueda}%,nombre_comun.ilike.%${busqueda}%`,
      );
    }

    const {data: especies, error: errEsp} = await query.limit(100000);

    if (errEsp) throw errEsp;

    const especieMap = new Map<number, any>();

    (especies || []).forEach((e: any) => {
      if (e.especie_taxon_id != null && !especieMap.has(e.especie_taxon_id)) {
        especieMap.set(e.especie_taxon_id, e);
      }
    });

    let combinados = (agregados as any[])
      .filter((a) => especieMap.has(a.taxon_id))
      .map((a) => {
        const e = especieMap.get(a.taxon_id);

        return {
          ...a,
          nombre_cientifico: e?.nombre_cientifico ?? null,
          nombre_comun: e?.nombre_comun ?? null,
          orden: e?.orden ?? null,
          familia: e?.familia ?? null,
          genero: e?.genero ?? null,
        };
      });

    if (familias.length > 0) {
      const set = new Set(familias);

      combinados = combinados.filter((t) => t.familia && set.has(t.familia));
    }
    if (generos.length > 0) {
      const set = new Set(generos);

      combinados = combinados.filter((t) => t.genero && set.has(t.genero));
    }
    if (tiposMuestra.length > 0) {
      const countKeys = tiposMuestra
        .map((k) => COUNT_KEY_BY_MUESTRA[k])
        .filter(Boolean);

      combinados = combinados.filter((t) => countKeys.every((k) => (t[k] || 0) > 0));
    }

    combinados.sort((a, b) =>
      (a.nombre_cientifico || "").localeCompare(b.nombre_cientifico || ""),
    );

    const total = combinados.length;
    const totalPaginas = Math.max(1, Math.ceil(total / ITEMS_POR_PAGINA));
    const inicio = (pagina - 1) * ITEMS_POR_PAGINA;
    const taxa = combinados.slice(inicio, inicio + ITEMS_POR_PAGINA);

    return NextResponse.json({taxa, total, totalPaginas, paginaActual: pagina});
  } catch (error) {
    console.error("Error en moleculoteca:", error);

    return NextResponse.json({error: "Error al obtener moleculoteca"}, {status: 500});
  }
}
