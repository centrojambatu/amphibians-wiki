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
}

export interface MapotecaResponse {
  data: UbicacionEspecie[];
  total: number;
}

const SELECT_FIELDS =
  "origen, id_coleccion, taxon_id, rank_id, nombre_especie, latitud, longitud, localidad, elevacion, catalogo_museo, numero_museo, provincia, cita_corta";

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
  };
}

async function fetchByOrigen(
  supabase: any,
  origen: string,
  limit: number,
  offset: number,
  provincia: string | null,
  especie: string | null,
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

    if (provincia) {
      query = query.ilike("provincia", `%${provincia}%`);
    }
    if (especie) {
      query = query.ilike("nombre_especie", `%${especie}%`);
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
  const provincia = searchParams.get("provincia");
  const especie = searchParams.get("especie");
  const limit = Math.min(parseInt(searchParams.get("limit") || "1000", 10), 5000);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  const supabase = await createClient();

  try {
    // Conteo total y por origen en paralelo
    const buildCountQuery = (origen?: string) => {
      let q = supabase
        .from("vw_colecciones")
        .select("taxon_id", { count: "exact", head: true });
      if (origen) q = q.eq("origen", origen);
      if (provincia) q = q.ilike("provincia", `%${provincia}%`);
      if (especie) q = q.ilike("nombre_especie", `%${especie}%`);
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

    // Repartir el limit 50/50, ajustando si un origen tiene menos
    const halfLimit = Math.floor(limit / 2);
    let cjLimit = Math.min(halfLimit, cjTotal - offset);
    let extLimit = Math.min(halfLimit, extTotal - offset);

    // Si un origen tiene menos registros disponibles, dar el sobrante al otro
    if (cjLimit < halfLimit) {
      extLimit = Math.min(limit - Math.max(cjLimit, 0), extTotal - offset);
    } else if (extLimit < halfLimit) {
      cjLimit = Math.min(limit - Math.max(extLimit, 0), cjTotal - offset);
    }

    cjLimit = Math.max(cjLimit, 0);
    extLimit = Math.max(extLimit, 0);

    // Fetch en paralelo de ambos orígenes
    const [cjData, extData] = await Promise.all([
      cjLimit > 0 ? fetchByOrigen(supabase, "coleccion", cjLimit, offset, provincia, especie) : [],
      extLimit > 0 ? fetchByOrigen(supabase, "coleccion_externa", extLimit, offset, provincia, especie) : [],
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
