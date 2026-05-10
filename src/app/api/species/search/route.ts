import {NextResponse} from "next/server";

import {createClient} from "@/utils/supabase/server";

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const search = searchParams.get("search")?.trim() || "";

  if (search.length < 2) {
    return NextResponse.json([]);
  }

  const supabase = await createClient();

  try {
    const {data, error} = await (supabase as any)
      .from("vw_ficha_especie_completa")
      .select("especie_taxon_id, nombre_cientifico, nombre_comun")
      .or(`nombre_cientifico.ilike.%${search}%,nombre_comun.ilike.%${search}%`)
      .not("especie_taxon_id", "is", null)
      .order("nombre_cientifico", {ascending: true})
      .limit(50);

    if (error) throw error;

    const seen = new Set<number>();
    const result = (data || [])
      .filter((e: any) => {
        if (e.especie_taxon_id == null || seen.has(e.especie_taxon_id)) return false;
        seen.add(e.especie_taxon_id);

        return true;
      })
      .map((e: any) => ({
        id: e.especie_taxon_id,
        nombre_cientifico: e.nombre_cientifico,
        nombre_comun: e.nombre_comun,
      }));

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error en búsqueda de especies:", error);

    return NextResponse.json({error: "Error interno"}, {status: 500});
  }
}
