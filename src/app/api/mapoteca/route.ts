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

// ── Server-side in-memory cache ──
interface ServerCacheEntry {
  data: UbicacionEspecie[];
  timestamp: number;
}
const serverCache = new Map<string, ServerCacheEntry>();
const SERVER_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos

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

  // Build cache key from all params
  const cacheKey = JSON.stringify({ provincias, pisos, snaps, especies, localidades, catalogos, elevacionMin, elevacionMax, fechaDesde, fechaHasta });

  // Check server cache
  const cached = serverCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < SERVER_CACHE_TTL_MS) {
    const res = NextResponse.json({ data: cached.data, total: cached.data.length } as MapotecaResponse);
    res.headers.set("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
    return res;
  }

  const supabase = await createClient();

  try {
    // Si hay filtro de piso o SNAP, obtener taxon_ids via RPC
    let fichaFilterIds: number[] | null = null;
    if ((pisos && pisos.length > 0) || (snaps && snaps.length > 0)) {
      const { data: fichaData } = await (supabase as any).rpc("get_tabla_taxon_ids", {
        p_pisos: pisos ?? null,
        p_snaps: snaps ?? null,
        p_provincias: null,
        p_especies: null,
        p_localidades: null,
        p_catalogos: null,
        p_elevacion_min: null,
        p_elevacion_max: null,
      });
      fichaFilterIds = ((fichaData as any[]) ?? []).map((r: { taxon_id: number }) => Number(r.taxon_id));
      if (!fichaFilterIds || fichaFilterIds.length === 0) {
        return NextResponse.json({ data: [], total: 0 });
      }
    }

    const PAGE_SIZE = 1000;
    const rpcParams = {
      p_provincias: provincias ?? undefined,
      p_especies: especies ?? undefined,
      p_localidades: localidades ?? undefined,
      p_catalogo_museo: undefined as string | undefined,
      p_numero_museo: undefined as string | undefined,
      p_elevacion_min: elevacionMin ?? undefined,
      p_elevacion_max: elevacionMax ?? undefined,
      p_fecha_desde: fechaDesde ?? undefined,
      p_fecha_hasta: fechaHasta ?? undefined,
      p_taxon_ids: fichaFilterIds ?? undefined,
    };

    let allData: any[];

    if (catalogos && catalogos.length > 0) {
      const pairs = parseCatalogos(catalogos);
      allData = [];
      for (const { cat, num } of pairs) {
        const { data, error } = await supabase.rpc("get_colecciones_mapa", {
          ...rpcParams,
          p_catalogo_museo: cat,
          p_numero_museo: num ?? undefined,
        });
        if (error) throw error;
        if (data) allData.push(...data);
      }
    } else {
      // Primer batch para ver el total
      const { data: first, error: firstErr } = await supabase
        .rpc("get_colecciones_mapa", rpcParams)
        .range(0, PAGE_SIZE - 1);
      if (firstErr) throw firstErr;
      allData = first ?? [];

      if (allData.length === PAGE_SIZE) {
        // Lanzar batches en paralelo (grupos de 20)
        let offset = PAGE_SIZE;
        let hasMore = true;
        while (hasMore) {
          const batch = [];
          for (let i = 0; i < 20 && hasMore; i++) {
            batch.push(
              supabase
                .rpc("get_colecciones_mapa", rpcParams)
                .range(offset, offset + PAGE_SIZE - 1)
            );
            offset += PAGE_SIZE;
          }
          const results = await Promise.all(batch);
          for (const { data, error: bErr } of results) {
            if (bErr) throw bErr;
            if (!data || data.length === 0) { hasMore = false; break; }
            allData.push(...data);
            if (data.length < PAGE_SIZE) { hasMore = false; break; }
          }
        }
      }
    }

    const resultado: UbicacionEspecie[] = allData.map(mapRow);

    // Save to server cache
    serverCache.set(cacheKey, { data: resultado, timestamp: Date.now() });

    const response: MapotecaResponse = {
      data: resultado,
      total: resultado.length,
    };

    const res = NextResponse.json(response);
    res.headers.set("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
    return res;
  } catch (err) {
    console.error("Error fetching colecciones:", err);
    return NextResponse.json(
      { error: "Error fetching colecciones" },
      { status: 500 }
    );
  }
}
