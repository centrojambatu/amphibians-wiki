import {NextResponse} from "next/server";

import {createServiceClient} from "@/utils/supabase/server";

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";
  const supabase = createServiceClient();

  try {
    const {data: cols, error: colsErr} = await supabase
      .from("coleccion")
      .select("taxon_id")
      .eq("publicar", true)
      .not("taxon_id", "is", null)
      .limit(200000);

    if (colsErr) throw colsErr;
    const taxonIds = Array.from(
      new Set((cols || []).map((c: any) => c.taxon_id as number)),
    );
    if (taxonIds.length === 0) return NextResponse.json([]);

    let query = supabase
      .from("vw_lista_spp")
      .select("genero")
      .in("id_especie", taxonIds)
      .not("genero", "is", null);
    if (q.length >= 2) query = query.ilike("genero", `%${q}%`);

    const {data, error} = await query.limit(100000);
    if (error) throw error;

    const generos = Array.from(
      new Set((data || []).map((r: any) => r.genero as string).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b));

    return NextResponse.json(generos, {
      headers: {"Cache-Control": "public, s-maxage=300, stale-while-revalidate=600"},
    });
  } catch (error) {
    console.error("Error en generos colecciones:", error);
    return NextResponse.json({error: "Error al obtener géneros"}, {status: 500});
  }
}
