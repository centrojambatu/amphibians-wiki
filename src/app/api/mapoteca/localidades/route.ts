import {NextResponse} from "next/server";

import {createClient} from "@/utils/supabase/server";

const MAX_RESULTS = 100;

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";

  const supabase = await createClient();

  try {
    let query = (supabase as any)
      .from("mv_mapoteca_localidades_busqueda")
      .select("localidad")
      .order("localidad", {ascending: true})
      .limit(MAX_RESULTS);

    if (q.length > 0) {
      query = query.ilike("localidad", `%${q}%`);
    }

    const {data, error} = await query;

    if (error) throw error;

    const resultado = (data || []).map((r: any) => r.localidad as string);

    return NextResponse.json(resultado, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error en API de localidades:", error);

    return NextResponse.json({error: "Error al obtener localidades"}, {status: 500});
  }
}
