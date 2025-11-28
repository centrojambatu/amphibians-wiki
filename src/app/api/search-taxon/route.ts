import {NextRequest, NextResponse} from "next/server";

import {createServiceClient} from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json([]);
    }

    const supabaseClient = createServiceClient();

    // Buscar por nombre científico o ID
    const isNumeric = /^\d+$/.test(query);
    let dataQuery;

    if (isNumeric) {
      // Búsqueda por ID
      dataQuery = supabaseClient
        .from("taxon")
        .select("id_taxon, taxon")
        .eq("id_taxon", Number(query))
        .limit(10);
    } else {
      // Búsqueda por nombre científico (parcial)
      dataQuery = supabaseClient
        .from("taxon")
        .select("id_taxon, taxon")
        .ilike("taxon", `%${query}%`)
        .limit(10);
    }

    const {data, error} = await dataQuery;

    if (error) {
      console.error("Error al buscar taxón:", error);

      return NextResponse.json({error: error.message}, {status: 500});
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Error en la API:", error);

    return NextResponse.json({error: "Error interno del servidor"}, {status: 500});
  }
}

