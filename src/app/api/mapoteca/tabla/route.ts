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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const provinciasParam = searchParams.get("provincias");
  const provincias = provinciasParam ? provinciasParam.split(",").map((p) => p.trim()).filter(Boolean) : null;
  const pisosParam = searchParams.get("pisos");
  const pisos = pisosParam ? pisosParam.split(",").map((p) => p.trim()).filter(Boolean) : null;
  const snapsParam = searchParams.get("snaps");
  const snaps = snapsParam ? snapsParam.split(",").map((s) => s.trim()).filter(Boolean) : null;
  const especiesParam = searchParams.get("especies");
  const especies = especiesParam ? especiesParam.split("||").map((e) => e.trim()).filter(Boolean) : null;
  const localidadesParam = searchParams.get("localidades");
  const localidades = localidadesParam ? localidadesParam.split(",").map((l) => l.trim()).filter(Boolean) : null;
  const catalogosParam = searchParams.get("catalogos");
  const catalogos = catalogosParam ? catalogosParam.split("||").map((c) => c.trim()).filter(Boolean) : null;
  const elevacionMin = searchParams.get("elevacion_min") !== null ? parseFloat(searchParams.get("elevacion_min")!) : null;
  const elevacionMax = searchParams.get("elevacion_max") !== null ? parseFloat(searchParams.get("elevacion_max")!) : null;

  const supabase = await createClient();

  // Paso 1: obtener taxon_ids distintos via RPC (evita el límite de filas de PostgREST)
  const { data: idData, error: idError } = await supabase.rpc("get_tabla_taxon_ids", {
    p_provincias: provincias,
    p_pisos: pisos,
    p_snaps: snaps,
    p_especies: especies,
    p_localidades: localidades,
    p_catalogos: catalogos,
    p_elevacion_min: elevacionMin,
    p_elevacion_max: elevacionMax,
  });

  if (idError) {
    return NextResponse.json({ error: "Error al obtener colecciones" }, { status: 500 });
  }

  const taxonIds = (idData ?? []).map((r: { taxon_id: number | string }) => Number(r.taxon_id));

  if (taxonIds.length === 0) {
    return NextResponse.json({ data: [], total: 0 });
  }

  // Paso 2: obtener datos taxonómicos desde vw_ficha_especie_completa
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

  const result: EspecieTabla[] = (fichasData ?? []).map((r) => ({
    taxon_id: r.especie_taxon_id,
    nombre_cientifico: r.nombre_cientifico,
    orden: r.orden,
    familia: r.familia,
    genero: r.genero,
    especie: r.especie,
    nombre_comun: r.nombre_comun,
    lista_roja: r.awe_lista_roja_uicn,
  }));

  return NextResponse.json({ data: result, total: result.length });
}
