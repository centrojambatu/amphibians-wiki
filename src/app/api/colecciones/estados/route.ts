import {NextResponse} from "next/server";

import {createServiceClient} from "@/utils/supabase/server";

export async function GET() {
  const supabase = createServiceClient();

  try {
    const {data, error} = await supabase
      .from("coleccion")
      .select("estado")
      .eq("publicar", true)
      .not("estado", "is", null)
      .limit(200000);

    if (error) throw error;

    const estados = Array.from(
      new Set((data || []).map((r: any) => r.estado as string).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b));

    return NextResponse.json(estados, {
      headers: {"Cache-Control": "public, s-maxage=300, stale-while-revalidate=600"},
    });
  } catch (error) {
    console.error("Error en estados colecciones:", error);
    return NextResponse.json({error: "Error al obtener estados"}, {status: 500});
  }
}
