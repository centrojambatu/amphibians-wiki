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
  const taxonIds: number[] = Array.isArray(body?.taxon_ids)
    ? body.taxon_ids.map(Number).filter((n: number) => Number.isInteger(n))
    : [];

  if (taxonIds.length === 0) {
    return NextResponse.json({ data: [], total: 0 });
  }

  const supabase = await createClient();

  // Obtener datos taxonómicos desde vw_ficha_especie_completa
  const { data: fichasData, error: fichasError } = await supabase
    .from("vw_ficha_especie_completa")
    .select("especie_taxon_id, nombre_cientifico, orden, familia, genero, especie, nombre_comun, awe_lista_roja_uicn")
    .in("especie_taxon_id", taxonIds)
    .order("orden", { ascending: true, nullsFirst: false })
    .order("familia", { ascending: true, nullsFirst: false })
    .order("genero", { ascending: true, nullsFirst: false })
    .order("especie", { ascending: true, nullsFirst: false });

  if (fichasError) {
    return NextResponse.json({ error: "Error al obtener fichas" }, { status: 500 });
  }

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
}
