import {createClient} from "@/utils/supabase/server";
import {NextResponse} from "next/server";

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const search = searchParams.get("search") || "";

  const supabase = await createClient();

  try {
    // Primero obtener las especies de la vista
    let query = supabase
      .from("vw_ficha_especie_completa")
      .select("especie_taxon_id, nombre_cientifico, nombre_comun, id_ficha_especie")
      .not("especie_taxon_id", "is", null)
      .order("nombre_cientifico", {ascending: true});

    if (search) {
      query = query.or(`nombre_cientifico.ilike.%${search}%,nombre_comun.ilike.%${search}%`);
    }

    const {data: especies, error} = await query;

    if (error) {
      console.error("Error al obtener especies:", error);
      return NextResponse.json({error: "Error al obtener especies"}, {status: 500});
    }

    // Obtener las fotos de ficha_especie para las especies encontradas
    const idsFichaEspecie = (especies || [])
      .map((e: any) => e.id_ficha_especie)
      .filter((id: any) => id !== null);

    let fotosMap: Record<number, string | null> = {};

    if (idsFichaEspecie.length > 0) {
      const {data: fichas, error: errorFichas} = await supabase
        .from("ficha_especie")
        .select("id_ficha_especie, fotografia_ficha")
        .in("id_ficha_especie", idsFichaEspecie);

      if (!errorFichas && fichas) {
        fichas.forEach((ficha: any) => {
          fotosMap[ficha.id_ficha_especie] = ficha.fotografia_ficha || null;
        });
      }
    }

    const especiesFormateadas = (especies || []).map((especie: any) => ({
      id: especie.especie_taxon_id,
      nombre_cientifico: especie.nombre_cientifico,
      nombre_comun: especie.nombre_comun,
      slug: especie.nombre_cientifico?.replace(/\s+/g, "-") || "",
      fotografia_ficha: especie.id_ficha_especie ? fotosMap[especie.id_ficha_especie] || null : null,
    }));

    return NextResponse.json(especiesFormateadas);
  } catch (error) {
    console.error("Error en API de especies:", error);
    return NextResponse.json({error: "Error interno del servidor"}, {status: 500});
  }
}
