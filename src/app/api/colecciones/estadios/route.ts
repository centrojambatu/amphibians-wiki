import {NextResponse} from "next/server";

import {createServiceClient} from "@/utils/supabase/server";

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";
  const supabase = createServiceClient();

  try {
    let query = supabase
      .from("coleccion")
      .select("estadio")
      .eq("publicar", true)
      .not("estadio", "is", null)
      .limit(200000);
    if (q.length >= 2) query = query.ilike("estadio", `%${q}%`);

    const {data, error} = await query;
    if (error) throw error;

    const ORDEN_ESTADIOS = [
      "Adulto",
      "Subadulto",
      "Metamorfo",
      "Renacuajo",
      "Puesta",
      "Huevo",
    ];

    const unicos = Array.from(
      new Set((data || []).map((r: any) => r.estadio as string).filter(Boolean)),
    );

    const estadios = unicos.sort((a, b) => {
      const ia = ORDEN_ESTADIOS.indexOf(a);
      const ib = ORDEN_ESTADIOS.indexOf(b);

      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;

      return a.localeCompare(b);
    });

    return NextResponse.json(estadios, {
      headers: {"Cache-Control": "public, s-maxage=300, stale-while-revalidate=600"},
    });
  } catch (error) {
    console.error("Error en estadios colecciones:", error);
    return NextResponse.json({error: "Error al obtener estadios"}, {status: 500});
  }
}
