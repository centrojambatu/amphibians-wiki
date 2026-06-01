import {NextResponse} from "next/server";

import {createServiceClient} from "@/utils/supabase/server";

export async function GET() {
  const supabase = createServiceClient();

  try {
    const {data, error} = await supabase
      .from("coleccion")
      .select("sexo")
      .eq("publicar", true)
      .not("sexo", "is", null)
      .limit(200000);

    if (error) throw error;

    const sexos = Array.from(
      new Set((data || []).map((r: any) => r.sexo as string).filter(Boolean)),
    ).sort((a, b) => {
      if (a === "Indeterminado") return 1;
      if (b === "Indeterminado") return -1;

      return a.localeCompare(b);
    });

    return NextResponse.json(sexos, {
      headers: {"Cache-Control": "public, s-maxage=300, stale-while-revalidate=600"},
    });
  } catch (error) {
    console.error("Error en sexos colecciones:", error);
    return NextResponse.json({error: "Error al obtener sexos"}, {status: 500});
  }
}
