import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

export interface EspecieTabla {
  taxon_id: number;
  nombre_cientifico: string;
  orden: string | null;
  familia: string | null;
  genero: string | null;
  especie: string | null;
  nombre_comun: string | null;
  lista_roja: string | null;
}

// Recibe los taxon_ids de especie que el mapa ya obtuvo con los filtros activos, para que
// la tabla liste exactamente las especies con registros publicados en el mapa.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const supabase = await createClient();

  const filters = body?.filters ?? {};
  const strings = (value: unknown): string[] | null =>
    Array.isArray(value) && value.every((item) => typeof item === "string") && value.length
      ? value
      : null;
  const number = (value: unknown): number | null =>
    typeof value === "number" && Number.isFinite(value) ? value : null;

  try {
    let taxonIds: number[] | null = null;
    if (filters.pisoFilter?.length || filters.snapFilter?.length) {
      const { data, error } = await (supabase as any).rpc("get_tabla_taxon_ids", {
        p_pisos: strings(filters.pisoFilter),
        p_snaps: strings(filters.snapFilter),
        p_provincias: null,
        p_especies: null,
        p_localidades: null,
        p_catalogos: null,
        p_elevacion_min: null,
        p_elevacion_max: null,
      });
      if (error) throw error;
      taxonIds = (data ?? []).map((row: { taxon_id: number }) => Number(row.taxon_id));
      if (!taxonIds.length) return NextResponse.json({ data: [], total: 0 });
    }

    const { data: idsData, error: idsError } = await (supabase as any).rpc("get_mapoteca_taxon_ids", {
      p_provincias: strings(filters.provinciaFilter),
      p_especies: strings(filters.especieFilter),
      p_localidades: strings(filters.localidadesFilter),
      p_catalogos: strings(filters.catalogoFilter),
      p_elevacion_min: number(filters.elevacionMin),
      p_elevacion_max: number(filters.elevacionMax),
      p_fecha_desde: typeof filters.fechaDesde === "string" ? filters.fechaDesde : null,
      p_fecha_hasta: typeof filters.fechaHasta === "string" ? filters.fechaHasta : null,
      p_taxon_ids: taxonIds,
    });
    if (idsError) throw idsError;
    const matchingIds: number[] = (idsData ?? []).map((row: { taxon_id: number }) => Number(row.taxon_id));
    if (!matchingIds.length) return NextResponse.json({ data: [], total: 0 });

    // Obtener datos taxonómicos desde vw_ficha_especie_completa
    const { data: fichasData, error: fichasError } = await supabase
      .from("vw_ficha_especie_completa")
      .select("especie_taxon_id, nombre_cientifico, orden, familia, genero, especie, nombre_comun, awe_lista_roja_uicn")
      .in("especie_taxon_id", matchingIds)
      .order("orden", { ascending: true, nullsFirst: false })
      .order("familia", { ascending: true, nullsFirst: false })
      .order("genero", { ascending: true, nullsFirst: false })
      .order("especie", { ascending: true, nullsFirst: false });

    if (fichasError) throw fichasError;

    const result: EspecieTabla[] = (fichasData ?? [])
      .filter((r) => r.especie_taxon_id != null && r.nombre_cientifico != null)
      .map((r) => ({
        taxon_id: r.especie_taxon_id as number,
        nombre_cientifico: r.nombre_cientifico as string,
        orden: r.orden,
        familia: r.familia,
        genero: r.genero,
        especie: r.especie,
        nombre_comun: r.nombre_comun,
        lista_roja: r.awe_lista_roja_uicn,
      }));

    return NextResponse.json({ data: result, total: result.length });
  } catch (error) {
    console.error("Error al obtener especies de la mapoteca:", error);
    return NextResponse.json({ error: "Error al obtener fichas" }, { status: 500 });
  }
}
