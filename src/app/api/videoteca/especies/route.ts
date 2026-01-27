import {NextResponse} from "next/server";
import {createClient} from "@/utils/supabase/server";

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const search = searchParams.get("search") || "";

  const supabase = await createClient();

  try {
    // Obtener todas las especies desde la vista
    let query = supabase
      .from("vw_ficha_especie_completa")
      .select("especie_taxon_id, nombre_cientifico, nombre_comun, orden, familia, genero")
      .not("especie_taxon_id", "is", null)
      .order("nombre_cientifico", {ascending: true});

    // Filtrar por búsqueda si se proporciona
    if (search) {
      query = query.or(`nombre_cientifico.ilike.%${search}%,nombre_comun.ilike.%${search}%`);
    }

    const {data: especies, error} = await query;

    if (error) {
      console.error("Error al obtener especies:", error);
      return NextResponse.json({error: "Error al obtener especies"}, {status: 500});
    }

    // Formatear los datos
    const especiesFormateadas = (especies || []).map((especie: any) => ({
      id: especie.especie_taxon_id,
      nombre_cientifico: especie.nombre_cientifico,
      nombre_comun: especie.nombre_comun,
      slug: especie.nombre_cientifico?.replace(/\s+/g, "-") || "",
      orden: especie.orden || null,
      familia: especie.familia || null,
      genero: especie.genero || null,
    }));

    return NextResponse.json(especiesFormateadas);
  } catch (error) {
    console.error("Error inesperado:", error);
    return NextResponse.json({error: "Error inesperado"}, {status: 500});
  }
}
