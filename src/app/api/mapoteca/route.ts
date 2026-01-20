import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

export interface UbicacionEspecie {
  id_ubicacion_especie: number;
  id_ficha_especie: number;
  id_taxon: number;
  provincia: string | null;
  localidad: string | null;
  voucher: string | null;
  latitud: number | null;
  longitud: number | null;
  elevacion: number | null;
  nombre_cientifico: string;
  genero: string;
  epiteto: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const provincia = searchParams.get("provincia");
  const especie = searchParams.get("especie");

  const supabase = await createClient();

  // Función para obtener todas las ubicaciones con paginación
  async function fetchAllUbicaciones() {
    const pageSize = 1000;
    let allData: any[] = [];
    let page = 0;
    let hasMore = true;

    while (hasMore) {
      let query = supabase
        .from("ubicacion_especie")
        .select(
          `
          id_ubicacion_especie,
          id_ficha_especie,
          id_taxon,
          provincia,
          localidad,
          voucher,
          latitud,
          longitud,
          elevacion
        `
        )
        .not("latitud", "is", null)
        .not("longitud", "is", null)
        .range(page * pageSize, (page + 1) * pageSize - 1)
        .order("id_ubicacion_especie");

      // Filtrar por provincia si se especifica (usando el campo provincia de ubicacion_especie)
      if (provincia) {
        query = query.ilike("provincia", `%${provincia}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        allData = [...allData, ...data];
        hasMore = data.length === pageSize;
        page++;
      } else {
        hasMore = false;
      }
    }

    return allData;
  }

  let ubicaciones;
  try {
    ubicaciones = await fetchAllUbicaciones();
  } catch (ubicacionesError) {
    console.error("Error fetching ubicaciones:", ubicacionesError);
    return NextResponse.json(
      { error: "Error fetching ubicaciones" },
      { status: 500 }
    );
  }

  if (!ubicaciones || ubicaciones.length === 0) {
    return NextResponse.json([]);
  }

  // Obtener los taxon_ids únicos
  const taxonIds = [...new Set(ubicaciones.map((u) => u.id_taxon))];

  // Obtener nombres de especies (epítetos)
  const { data: especies, error: especiesError } = await supabase
    .from("taxon")
    .select("id_taxon, taxon, taxon_id")
    .in("id_taxon", taxonIds);

  if (especiesError) {
    console.error("Error fetching especies:", especiesError);
    return NextResponse.json(
      { error: "Error fetching especies" },
      { status: 500 }
    );
  }

  // Obtener géneros (padres de las especies)
  const generoIds = [
    ...new Set(especies?.map((e) => e.taxon_id).filter(Boolean)),
  ];

  const { data: generos, error: generosError } = await supabase
    .from("taxon")
    .select("id_taxon, taxon")
    .in("id_taxon", generoIds);

  if (generosError) {
    console.error("Error fetching generos:", generosError);
    return NextResponse.json(
      { error: "Error fetching generos" },
      { status: 500 }
    );
  }

  // Crear mapas para lookup rápido
  const generoMap = new Map(generos?.map((g) => [g.id_taxon, g.taxon]) || []);
  const especieMap = new Map(
    especies?.map((e) => [
      e.id_taxon,
      {
        epiteto: e.taxon,
        genero: generoMap.get(e.taxon_id) || "",
      },
    ]) || []
  );

  // Combinar datos
  let resultado: UbicacionEspecie[] = ubicaciones.map((u) => {
    const especieInfo = especieMap.get(u.id_taxon) || {
      epiteto: "",
      genero: "",
    };
    return {
      ...u,
      genero: especieInfo.genero,
      epiteto: especieInfo.epiteto,
      nombre_cientifico: `${especieInfo.genero} ${especieInfo.epiteto}`.trim(),
    };
  });

  // Filtrar por especie si se especifica
  if (especie) {
    resultado = resultado.filter((r) =>
      r.nombre_cientifico.toLowerCase().includes(especie.toLowerCase())
    );
  }

  return NextResponse.json(resultado);
}
