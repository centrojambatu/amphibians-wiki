import {NextResponse} from "next/server";

import {createServiceClient} from "@/utils/supabase/server";

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";

  if (q.length < 2) return NextResponse.json([]);

  const supabase = createServiceClient();

  try {
    const sanitized = q.replace(/[%,()*]/g, "");
    const {data, error} = await supabase
      .from("coleccion")
      .select("catalogo_museo, numero_museo")
      .eq("publicar", true)
      .or(
        `catalogo_museo.ilike.%${sanitized}%,numero_museo.ilike.%${sanitized}%`,
      )
      .limit(200);

    if (error) throw error;

    const seen = new Set<string>();
    const resultado: string[] = [];
    (data || []).forEach((r: any) => {
      if (!r.catalogo_museo) return;
      const key = r.numero_museo
        ? `${String(r.catalogo_museo)}::${String(r.numero_museo)}`
        : (r.catalogo_museo as string);
      if (!seen.has(key)) {
        seen.add(key);
        resultado.push(key);
      }
    });

    resultado.sort((a, b) => a.localeCompare(b));

    return NextResponse.json(resultado, {
      headers: {"Cache-Control": "public, s-maxage=300, stale-while-revalidate=600"},
    });
  } catch (error) {
    console.error("Error en catalogos colecciones:", error);
    return NextResponse.json({error: "Error al obtener catalogos"}, {status: 500});
  }
}
