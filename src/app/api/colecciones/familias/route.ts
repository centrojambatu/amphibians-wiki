import {NextResponse} from "next/server";

import {createServiceClient} from "@/utils/supabase/server";

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";
  const supabase = createServiceClient();

  try {
    // taxon_ids con colecciones publicadas
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
      .select("familia")
      .in("id_especie", taxonIds)
      .not("familia", "is", null);
    if (q.length >= 2) query = query.ilike("familia", `%${q}%`);

    const {data, error} = await query.limit(100000);
    if (error) throw error;

    const familias = Array.from(
      new Set((data || []).map((r: any) => r.familia as string).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b));

    return NextResponse.json(familias, {
      headers: {"Cache-Control": "public, s-maxage=300, stale-while-revalidate=600"},
    });
  } catch (error) {
    console.error("Error en familias colecciones:", error);
    return NextResponse.json({error: "Error al obtener familias"}, {status: 500});
  }
}
