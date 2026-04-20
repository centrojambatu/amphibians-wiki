import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

export interface UbicacionEspecie {
  taxon_id: number;
  id_coleccion: number | null;
  rank_id: number | null;
  nombre_cientifico: string;
  genero: string;
  origen: string;
  provincia: string | null;
  localidad: string | null;
  catalogo_museo: string | null;
  numero_museo: string | null;
  cita_corta: string | null;
  latitud: number | null;
  longitud: number | null;
  elevacion: number | null;
  fecha_coleccion: string | null;
  colectores: string | null;
}

export interface MapotecaResponse {
  data: UbicacionEspecie[];
  total: number;
}

const SELECT_FIELDS =
  "origen, id_coleccion, taxon_id, rank_id, nombre_especie, latitud, longitud, localidad, elevacion, catalogo_museo, numero_museo, provincia, cita_corta, fecha_coleccion, colectores";

function mapRow(row: any): UbicacionEspecie {
  const nombreEspecie = row.nombre_especie || "";
  const partes = nombreEspecie.split(" ");

  return {
    taxon_id: row.taxon_id,
    id_coleccion: row.id_coleccion ?? null,
    rank_id: row.rank_id ?? null,
    nombre_cientifico: nombreEspecie,
    genero: partes[0] || "",
    origen: row.origen,
    provincia: row.provincia,
    localidad: row.localidad,
    catalogo_museo: row.catalogo_museo,
    numero_museo: row.numero_museo,
    cita_corta: row.cita_corta,
    latitud: row.latitud,
    longitud: row.longitud,
    elevacion: row.elevacion,
    fecha_coleccion: row.fecha_coleccion ?? null,
    colectores: row.colectores ?? null,
  };
}

function parseCatalogos(catalogos: string[]): { cat: string; num: string | null }[] {
  return catalogos.map((c) => {
    const sepIdx = c.indexOf("::");
    return sepIdx > 0
      ? { cat: c.substring(0, sepIdx), num: c.substring(sepIdx + 2) }
      : { cat: c, num: null };
  });
}

function buildBaseQuery(
  supabase: any,
  origen: string | null,
  fichaFilterIds: number[] | null,
  provincias: string[] | null,
  especies: string[] | null,
  localidades: string[] | null,
  elevacionMin: number | null,
  elevacionMax: number | null,
  fechaDesde: string | null = null,
  fechaHasta: string | null = null,
) {
  let q = supabase.from("mv_colecciones_mapa").select(SELECT_FIELDS);
  if (origen) q = q.eq("origen", origen);
  if (fichaFilterIds && fichaFilterIds.length > 0) q = q.in("taxon_id", fichaFilterIds);
  if (provincias && provincias.length > 0) q = q.in("provincia", provincias);
  if (especies && especies.length > 0) q = q.or(especies.map((e: string) => `nombre_especie.ilike.%${e}%`).join(","));
  if (localidades && localidades.length > 0) q = q.in("localidad", localidades);
  if (elevacionMin !== null) q = q.gte("elevacion", elevacionMin);
  if (elevacionMax !== null) q = q.lte("elevacion", elevacionMax);
  if (fechaDesde) q = q.gte("fecha_coleccion", fechaDesde);
  if (fechaHasta) q = q.lte("fecha_coleccion", fechaHasta);
  return q;
}

async function fetchByOrigen(
  supabase: any,
  origen: string,
  limit: number,
  offset: number,
  provincias: string[] | null,
  especies: string[] | null,
  localidades: string[] | null,
  catalogos: string[] | null,
  elevacionMin: number | null,
  elevacionMax: number | null,
  fichaFilterIds: number[] | null,
): Promise<any[]> {
  // Cuando hay filtro de catálogo, hacer una query por cada entrada usando .eq()
  // (evita problemas de PostgREST con unicode/espacios en valores)
  if (catalogos && catalogos.length > 0) {
    const pairs = parseCatalogos(catalogos);
    const results: any[] = [];
    for (const { cat, num } of pairs) {
      let q = buildBaseQuery(supabase, origen, fichaFilterIds, provincias, especies, localidades, elevacionMin, elevacionMax, fechaDesde, fechaHasta);
      q = q.eq("catalogo_museo", cat);
      if (num) q = q.eq("numero_museo", num);
      const { data, error } = await q;
      if (error) throw error;
      if (data) results.push(...data);
    }
    return results;
  }

  // Sin filtro de catálogo: paginación normal
  const pageSize = 1000;
  let allData: any[] = [];
  let fetched = 0;

  while (fetched < limit) {
    const batchSize = Math.min(pageSize, limit - fetched);
    let query = buildBaseQuery(supabase, origen, fichaFilterIds, provincias, especies, localidades, elevacionMin, elevacionMax, fechaDesde, fechaHasta)
      .range(offset + fetched, offset + fetched + batchSize - 1)
      .order("taxon_id", { ascending: true });

    const { data, error } = await query;
    if (error) throw error;

    if (data && data.length > 0) {
      allData = [...allData, ...data];
      fetched += data.length;
      if (data.length < batchSize) break;
    } else {
      break;
    }
  }

  return allData;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const provinciasParam = searchParams.get("provincias");
  const provincias = provinciasParam
    ? provinciasParam.split(",").map((p) => p.trim()).filter(Boolean)
    : null;
  const pisosParam = searchParams.get("pisos");
  const pisos = pisosParam
    ? pisosParam.split(",").map((p) => p.trim()).filter(Boolean)
    : null;
  const snapsParam = searchParams.get("snaps");
  const snaps = snapsParam
    ? snapsParam.split(",").map((s) => s.trim()).filter(Boolean)
    : null;
  const especiesParam = searchParams.get("especies");
  const especies = especiesParam
    ? especiesParam.split("||").map((e) => e.trim()).filter(Boolean)
    : null;
  const localidadesParam = searchParams.get("localidades");
  const localidades = localidadesParam
    ? localidadesParam.split("||").map((l) => l.trim()).filter(Boolean)
    : null;
  const catalogosParam = searchParams.get("catalogos");
  const catalogos = catalogosParam
    ? catalogosParam.split("||").map((c) => c.trim()).filter(Boolean)
    : null;
  const elevacionMinParam = searchParams.get("elevacion_min");
  const elevacionMin = elevacionMinParam !== null ? parseFloat(elevacionMinParam) : null;
  const elevacionMaxParam = searchParams.get("elevacion_max");
  const elevacionMax = elevacionMaxParam !== null ? parseFloat(elevacionMaxParam) : null;
  const fechaDesde = searchParams.get("fecha_desde");
  const fechaHasta = searchParams.get("fecha_hasta");
  const limit = Math.min(parseInt(searchParams.get("limit") || "1000", 10), 60000);
  const cjOffset = parseInt(searchParams.get("cj_offset") || "0", 10);
  const extOffset = parseInt(searchParams.get("ext_offset") || "0", 10);

  const supabase = await createClient();

  try {
    // Si hay filtro de piso o SNAP, obtener taxon_ids desde vw_ficha_especie_completa via RPC
    let fichaFilterIds: number[] | null = null;
    if ((pisos && pisos.length > 0) || (snaps && snaps.length > 0)) {
      const { data: fichaData } = await supabase.rpc("get_tabla_taxon_ids", {
        p_pisos: pisos ?? null,
        p_snaps: snaps ?? null,
        p_provincias: null,
        p_especies: null,
        p_localidades: null,
        p_catalogos: null,
        p_elevacion_min: null,
        p_elevacion_max: null,
      });
      fichaFilterIds = (fichaData ?? []).map((r: { taxon_id: number }) => Number(r.taxon_id));
      if (fichaFilterIds.length === 0) {
        return NextResponse.json({ data: [], total: 0 });
      }
    }

    // Conteo rápido del total (para barra de progreso en el frontend)
    let countQ = supabase.from("mv_colecciones_mapa").select("taxon_id", { count: "exact", head: true });
    if (fichaFilterIds && fichaFilterIds.length > 0) countQ = countQ.in("taxon_id", fichaFilterIds);
    if (provincias && provincias.length > 0) countQ = countQ.in("provincia", provincias);
    if (especies && especies.length > 0) countQ = countQ.or(especies.map((e: string) => `nombre_especie.ilike.%${e}%`).join(","));
    if (localidades && localidades.length > 0) countQ = countQ.in("localidad", localidades);
    if (elevacionMin !== null) countQ = countQ.gte("elevacion", elevacionMin);
    if (elevacionMax !== null) countQ = countQ.lte("elevacion", elevacionMax);
    if (fechaDesde) countQ = countQ.gte("fecha_coleccion", fechaDesde);
    if (fechaHasta) countQ = countQ.lte("fecha_coleccion", fechaHasta);
    const { count: totalCount, error: countError } = await countQ;
    if (countError) throw countError;
    const grandTotal = totalCount ?? 0;

    // Query contra la vista materializada
    let allData: any[] = [];

    if (catalogos && catalogos.length > 0) {
      // Filtro de catálogo: queries individuales por par cat::num
      const pairs = parseCatalogos(catalogos);
      for (const { cat, num } of pairs) {
        let q = buildBaseQuery(supabase, null, fichaFilterIds, provincias, especies, localidades, elevacionMin, elevacionMax, fechaDesde, fechaHasta);
        q = q.eq("catalogo_museo", cat);
        if (num) q = q.eq("numero_museo", num);
        q = q.limit(limit);
        const { data, error } = await q;
        if (error) throw error;
        if (data) allData.push(...data);
      }
    } else {
      // Sin catálogo: traer en batches de 1000 (límite Supabase) desde el offset indicado
      const pageSize = 1000;
      let offset = cjOffset;
      let fetched = 0;
      let hasMore = true;
      while (hasMore && fetched < limit) {
        const batchSize = Math.min(pageSize, limit - fetched);
        const q = buildBaseQuery(supabase, null, fichaFilterIds, provincias, especies, localidades, elevacionMin, elevacionMax, fechaDesde, fechaHasta)
          .range(offset, offset + batchSize - 1)
          .order("taxon_id", { ascending: true });
        const { data, error } = await q;
        if (error) throw error;
        if (data && data.length > 0) {
          allData.push(...data);
          offset += data.length;
          fetched += data.length;
          if (data.length < batchSize) hasMore = false;
        } else {
          hasMore = false;
        }
      }
    }

    const resultado: UbicacionEspecie[] = allData.map(mapRow);

    const response: MapotecaResponse = {
      data: resultado,
      total: grandTotal,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("Error fetching vw_colecciones:", err);
    return NextResponse.json(
      { error: "Error fetching colecciones" },
      { status: 500 }
    );
  }
}
