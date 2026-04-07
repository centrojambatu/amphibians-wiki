import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

const MAX_RESULTS = 200;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  const supabase = await createClient();

  try {
    const pageSize = 1000;
    let allData: any[] = [];
    let page = 0;
    let hasMore = true;

    while (hasMore) {
      let query = supabase
        .from("vw_colecciones")
        .select("localidad")
        .not("localidad", "is", null)
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (q) {
        query = query.ilike("localidad", `%${q}%`);
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

    // Extract distinct localidad values
    const localidadesSet = new Set<string>();
    for (const row of allData) {
      if (row.localidad) {
        localidadesSet.add(row.localidad);
      }
    }

    // Sort and limit
    const resultado = Array.from(localidadesSet)
      .sort((a, b) => a.localeCompare(b))
      .slice(0, MAX_RESULTS);

    return NextResponse.json(resultado);
  } catch (error) {
    console.error("Error en API de localidades:", error);
    return NextResponse.json(
      { error: "Error al obtener localidades" },
      { status: 500 }
    );
  }
}
