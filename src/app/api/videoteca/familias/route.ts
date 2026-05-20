import {NextResponse} from "next/server";

import {createClient} from "@/utils/supabase/server";

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";

  const supabase = await createClient();

  try {
    const {data: videos, error: videoError} = await supabase
      .from("video")
      .select(
        `taxon_id, coleccion_id, coleccion_externa_id,
         coleccion:coleccion_id(taxon_id),
         coleccion_externa:coleccion_externa_id(taxon_id)`,
      )
      .eq("publicar", true)
      .limit(100000);

    if (videoError) throw videoError;

    const taxonIds = new Set<number>();

    (videos || []).forEach((v: any) => {
      const t =
        v.coleccion_id != null
          ? v.coleccion?.taxon_id
          : v.coleccion_externa_id != null
            ? v.coleccion_externa?.taxon_id
            : v.taxon_id;

      if (t != null) taxonIds.add(Number(t));
    });

    if (taxonIds.size === 0) return NextResponse.json([]);

    let query = supabase
      .from("vw_ficha_especie_completa")
      .select("familia")
      .in("especie_taxon_id", Array.from(taxonIds))
      .not("familia", "is", null);

    if (q.length >= 2) {
      query = query.ilike("familia", `%${q}%`);
    }

    const {data, error} = await query;

    if (error) throw error;

    const familias = Array.from(
      new Set((data || []).map((r: any) => r.familia as string).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b));

    return NextResponse.json(familias, {
      headers: {"Cache-Control": "public, s-maxage=300, stale-while-revalidate=600"},
    });
  } catch (error) {
    console.error("Error en familias videoteca:", error);

    return NextResponse.json({error: "Error al obtener familias"}, {status: 500});
  }
}
