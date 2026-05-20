import {NextResponse} from "next/server";

import {createClient} from "@/utils/supabase/server";

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";

  const supabase = await createClient();

  try {
    const {data: videos, error} = await supabase
      .from("video")
      .select(
        `coleccion:coleccion_id(localidad),
         coleccion_externa:coleccion_externa_id(localidad)`,
      )
      .eq("publicar", true)
      .limit(100000);

    if (error) throw error;

    const set = new Set<string>();
    const needle = q.toLowerCase();

    (videos || []).forEach((v: any) => {
      [v.coleccion?.localidad, v.coleccion_externa?.localidad]
        .filter(Boolean)
        .forEach((loc: string) => {
          if (!q || loc.toLowerCase().includes(needle)) set.add(loc);
        });
    });

    const result = Array.from(set)
      .sort((a, b) => a.localeCompare(b))
      .slice(0, 200);

    return NextResponse.json(result, {
      headers: {"Cache-Control": "public, s-maxage=300, stale-while-revalidate=600"},
    });
  } catch (error) {
    console.error("Error en localidades videoteca:", error);

    return NextResponse.json({error: "Error al obtener localidades"}, {status: 500});
  }
}
