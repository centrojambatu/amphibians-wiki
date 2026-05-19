import {NextResponse} from "next/server";

import {createClient} from "@/utils/supabase/server";

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";

  const supabase = await createClient();

  try {
    const {data: cantos, error: cantoError} = await supabase
      .from("canto")
      .select(
        `taxon_id, coleccion_id, coleccion_externa_id,
         coleccion:coleccion_id(taxon_id),
         coleccion_externa:coleccion_externa_id(taxon_id)`,
      )
      .eq("publicar", true)
      .limit(100000);

    if (cantoError) throw cantoError;

    const taxonIds = new Set<number>();

    (cantos || []).forEach((c: any) => {
      const t =
        c.coleccion_id != null
          ? c.coleccion?.taxon_id
          : c.coleccion_externa_id != null
            ? c.coleccion_externa?.taxon_id
            : c.taxon_id;

      if (t != null) taxonIds.add(Number(t));
    });

    if (taxonIds.size === 0) return NextResponse.json([]);

    let query = supabase
      .from("vw_ficha_especie_completa")
      .select("genero")
      .in("especie_taxon_id", Array.from(taxonIds))
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
    console.error("Error en generos audioteca:", error);

    return NextResponse.json({error: "Error al obtener generos"}, {status: 500});
  }
}
