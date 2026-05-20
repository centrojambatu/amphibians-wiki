import {NextResponse} from "next/server";

import {createClient} from "@/utils/supabase/server";

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";

  const supabase = await createClient();

  try {
    const {data: agregados, error: errAgg} = await (supabase as any)
      .from("vw_moleculoteca_taxon")
      .select("taxon_id");

    if (errAgg) throw errAgg;

    const taxonIds = (agregados || [])
      .map((r: any) => r.taxon_id)
      .filter((id: any) => id != null);

    if (taxonIds.length === 0) return NextResponse.json([]);

    let query = supabase
      .from("vw_ficha_especie_completa")
      .select("genero")
      .in("especie_taxon_id", taxonIds)
      .not("genero", "is", null);

    if (q.length >= 2) {
      query = query.ilike("genero", `%${q}%`);
    }

    const {data, error} = await query;

    if (error) throw error;

    const generos = Array.from(
      new Set((data || []).map((r: any) => r.genero as string).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b));

    return NextResponse.json(generos, {
      headers: {"Cache-Control": "public, s-maxage=300, stale-while-revalidate=600"},
    });
  } catch (error) {
    console.error("Error en generos moleculoteca:", error);

    return NextResponse.json({error: "Error al obtener generos"}, {status: 500});
  }
}
