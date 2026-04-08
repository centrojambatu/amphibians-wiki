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
}

export interface MapotecaResponse {
  data: UbicacionEspecie[];
  total: number;
}

const SELECT_FIELDS =
  "origen, id_coleccion, taxon_id, rank_id, nombre_especie, latitud, longitud, localidad, elevacion, catalogo_museo, numero_museo, provincia, cita_corta, fecha_coleccion";

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
  };
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
  const pageSize = 1000;
  let allData: any[] = [];
  let fetched = 0;

  while (fetched < limit) {
    const batchSize = Math.min(pageSize, limit - fetched);
    let query = supabase
      .from("vw_colecciones")
      .select(SELECT_FIELDS)
      .eq("origen", origen)
      .range(offset + fetched, offset + fetched + batchSize - 1)
      .order("taxon_id", { ascending: true });

    if (fichaFilterIds && fichaFilterIds.length > 0) {
      query = query.in("taxon_id", fichaFilterIds);
    }
    if (provincias && provincias.length > 0) {
      query = query.in("provincia", provincias);
    }
    if (especies && especies.length > 0) {
      query = query.or(especies.map((e) => `nombre_especie.ilike.%${e}%`).join(","));
    }
    if (localidades && localidades.length > 0) {
      query = query.in("localidad", localidades);
    }
    if (catalogos && catalogos.length > 0) {
      const orParts = catalogos.map((c) => {
        const spaceIdx = c.indexOf(" ");
        if (spaceIdx > 0) {
          const cat = c.substring(0, spaceIdx);
          const num = c.substring(spaceIdx + 1);
          return `and(catalogo_museo.eq.${cat},numero_museo.eq.${num})`;
        }
        return `catalogo_museo.eq.${c}`;
      });
      query = query.or(orParts.join(","));
    }
    if (elevacionMin !== null) {
      query = query.gte("elevacion", elevacionMin);
    }
    if (elevacionMax !== null) {
      query = query.lte("elevacion", elevacionMax);
    }

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
    ? localidadesParam.split(",").map((l) => l.trim()).filter(Boolean)
    : null;
  const catalogosParam = searchParams.get("catalogos");
  const catalogos = catalogosParam
    ? catalogosParam.split("||").map((c) => c.trim()).filter(Boolean)
    : null;
  const elevacionMinParam = searchParams.get("elevacion_min");
  const elevacionMin = elevacionMinParam !== null ? parseFloat(elevacionMinParam) : null;
  const elevacionMaxParam = searchParams.get("elevacion_max");
  const elevacionMax = elevacionMaxParam !== null ? parseFloat(elevacionMaxParam) : null;
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

    // Conteo total y por origen en paralelo
    const buildCountQuery = (origen?: string) => {
      let q = supabase
        .from("vw_colecciones")
        .select("taxon_id", { count: "exact", head: true });
      if (origen) q = q.eq("origen", origen);
      if (fichaFilterIds && fichaFilterIds.length > 0) q = q.in("taxon_id", fichaFilterIds);
      if (provincias && provincias.length > 0) q = q.in("provincia", provincias);
      if (especies && especies.length > 0) q = q.or(especies.map((e) => `nombre_especie.ilike.%${e}%`).join(","));
      if (localidades && localidades.length > 0) q = q.in("localidad", localidades);
      if (catalogos && catalogos.length > 0) {
        const orParts = catalogos.map((c) => {
          const spaceIdx = c.indexOf(" ");
          if (spaceIdx > 0) {
            const cat = c.substring(0, spaceIdx);
            const num = c.substring(spaceIdx + 1);
            return `and(catalogo_museo.eq.${cat},numero_museo.eq.${num})`;
          }
          return `catalogo_museo.eq.${c}`;
        });
        q = q.or(orParts.join(","));
      }
      if (elevacionMin !== null) q = q.gte("elevacion", elevacionMin);
      if (elevacionMax !== null) q = q.lte("elevacion", elevacionMax);
      return q;
    };

    const [totalRes, cjCountRes, extCountRes] = await Promise.all([
      buildCountQuery(),
      buildCountQuery("coleccion"),
      buildCountQuery("coleccion_externa"),
    ]);

    if (totalRes.error) throw totalRes.error;

    const totalCount = totalRes.count ?? 0;
    const cjTotal = cjCountRes.count ?? 0;
    const extTotal = extCountRes.count ?? 0;

    // Repartir el limit 50/50, usando offsets independientes por origen
    const halfLimit = Math.floor(limit / 2);
    let cjLimit = Math.min(halfLimit, cjTotal - cjOffset);
    let extLimit = Math.min(halfLimit, extTotal - extOffset);

    // Si un origen tiene menos registros disponibles, dar el sobrante al otro
    if (cjLimit < halfLimit) {
      extLimit = Math.min(limit - Math.max(cjLimit, 0), extTotal - extOffset);
    } else if (extLimit < halfLimit) {
      cjLimit = Math.min(limit - Math.max(extLimit, 0), cjTotal - cjOffset);
    }

    cjLimit = Math.max(cjLimit, 0);
    extLimit = Math.max(extLimit, 0);

    // Fetch en paralelo de ambos orígenes
    const [cjData, extData] = await Promise.all([
      cjLimit > 0 ? fetchByOrigen(supabase, "coleccion", cjLimit, cjOffset, provincias, especies, localidades, catalogos, elevacionMin, elevacionMax, fichaFilterIds) : [],
      extLimit > 0 ? fetchByOrigen(supabase, "coleccion_externa", extLimit, extOffset, provincias, especies, localidades, catalogos, elevacionMin, elevacionMax, fichaFilterIds) : [],
    ]);

    // Mezclar intercalando ambos orígenes
    const merged: any[] = [];
    let i = 0;
    let j = 0;
    while (i < cjData.length || j < extData.length) {
      if (i < cjData.length) merged.push(cjData[i++]);
      if (j < extData.length) merged.push(extData[j++]);
    }

    const resultado: UbicacionEspecie[] = merged.map(mapRow);

    const response: MapotecaResponse = {
      data: resultado,
      total: totalCount,
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
