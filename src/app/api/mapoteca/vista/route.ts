import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";
import type { MapotecaFilters } from "@/hooks/use-mapoteca-data";
import type { UbicacionEspecie } from "@/app/api/mapoteca/route";

interface Viewport {
  south: number;
  north: number;
  west: number;
  east: number;
}

function cleanStrings(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const result = value.filter((item): item is string => typeof item === "string" && item.length > 0);
  return result.length ? result : null;
}

function cleanNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function mapRow(row: any): UbicacionEspecie {
  const nombre = row.nombre_especie || "";
  return {
    taxon_id: row.taxon_id,
    id_coleccion: row.id_coleccion ?? null,
    rank_id: row.rank_id ?? null,
    nombre_cientifico: nombre,
    genero: nombre.split(" ")[0] || "",
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

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || !["clusters", "points"].includes(body.mode)) {
    return NextResponse.json({ error: "Modo de mapa inválido" }, { status: 400 });
  }

  const rawFilters = (body.filters ?? {}) as MapotecaFilters & { snapFilter?: string[] };
  const filtros = {
    p_provincias: cleanStrings(rawFilters.provinciaFilter),
    p_especies: cleanStrings(rawFilters.especieFilter),
    p_localidades: cleanStrings(rawFilters.localidadesFilter),
    p_catalogos: cleanStrings(rawFilters.catalogoFilter),
    p_elevacion_min: cleanNumber(rawFilters.elevacionMin),
    p_elevacion_max: cleanNumber(rawFilters.elevacionMax),
    p_fecha_desde: typeof rawFilters.fechaDesde === "string" ? rawFilters.fechaDesde : null,
    p_fecha_hasta: typeof rawFilters.fechaHasta === "string" ? rawFilters.fechaHasta : null,
  };

  let viewport: Viewport | null = null;
  if (body.viewport && typeof body.viewport === "object") {
    const { south, north, west, east } = body.viewport;
    if ([south, north, west, east].every((n) => typeof n === "number" && Number.isFinite(n))) {
      viewport = { south, north, west, east };
    }
  }

  if (body.mode === "points" && !viewport) {
    return NextResponse.json({ error: "Se requiere el área visible del mapa" }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    let taxonIds: number[] | null = null;
    if (rawFilters.pisoFilter?.length || rawFilters.snapFilter?.length) {
      const { data, error } = await (supabase as any).rpc("get_tabla_taxon_ids", {
        p_pisos: cleanStrings(rawFilters.pisoFilter),
        p_snaps: cleanStrings(rawFilters.snapFilter),
        p_provincias: null,
        p_especies: null,
        p_localidades: null,
        p_catalogos: null,
        p_elevacion_min: null,
        p_elevacion_max: null,
      });
      if (error) throw error;
      taxonIds = (data ?? []).map((row: { taxon_id: number }) => Number(row.taxon_id));
      if (!taxonIds.length) {
        return NextResponse.json({ mode: body.mode, data: [], total: 0 });
      }
    }

    const args = {
      ...filtros,
      p_taxon_ids: taxonIds,
      p_south: viewport?.south ?? null,
      p_north: viewport?.north ?? null,
      p_west: viewport?.west ?? null,
      p_east: viewport?.east ?? null,
    };

    if (body.mode === "clusters") {
      const zoom = cleanNumber(body.zoom) ?? 7;
      const cellSize = zoom <= 7 ? 0.2 : zoom <= 8 ? 0.12 : 0.07;
      const { data, error } = await (supabase as any).rpc("get_mapoteca_clusters", {
        ...args,
        p_cell_size: cellSize,
      });
      if (error) throw error;
      return NextResponse.json({ mode: "clusters", data: data ?? [], total: (data ?? []).reduce((sum: number, row: any) => sum + Number(row.registros ?? 0), 0) });
    }

    const pageSize = 1000;
    const maxRows = 15000;
    const allRows: any[] = [];
    for (let offset = 0; offset < maxRows; offset += pageSize) {
      const { data, error } = await (supabase as any)
        .rpc("get_mapoteca_filtered_rows", args)
        .order("taxon_id", { ascending: true })
        .order("row_id", { ascending: true })
        .range(offset, offset + pageSize - 1);
      if (error) throw error;
      if (!data?.length) break;
      allRows.push(...data);
      if (data.length < pageSize) break;
    }
    const total = allRows.length;
    return NextResponse.json({ mode: "points", data: allRows.map(mapRow), total, truncated: total === maxRows });
  } catch (error) {
    console.error("Error cargando vista de mapoteca:", error);
    return NextResponse.json({ error: "Error cargando el mapa" }, { status: 500 });
  }
}
