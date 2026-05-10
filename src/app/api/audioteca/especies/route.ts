import {NextResponse} from "next/server";
import {createClient} from "@/utils/supabase/server";

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const search = searchParams.get("search") || "";

  const supabase = await createClient();

  try {
    const {data: cantos, error: cantoError} = await supabase
      .from("canto")
      .select(
        `taxon_id, coleccion_id, coleccion_externa_id, coleccion:coleccion_id(taxon_id), coleccion_externa:coleccion_externa_id(taxon_id)`,
      )
      .eq("publicar", true)
      .limit(100000);

    if (cantoError) {
      console.error("Error al obtener cantos:", cantoError);

      return NextResponse.json({error: "Error al obtener cantos"}, {status: 500});
    }

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

    if (taxonIds.size === 0) {
      return NextResponse.json([]);
    }

    let query = supabase
      .from("vw_ficha_especie_completa")
      .select("especie_taxon_id, nombre_cientifico, nombre_comun, orden, familia, genero")
      .in("especie_taxon_id", Array.from(taxonIds))
      .order("nombre_cientifico", {ascending: true});

    if (search) {
      query = query.or(`nombre_cientifico.ilike.%${search}%,nombre_comun.ilike.%${search}%`);
    }

    const {data: especies, error} = await query;

    if (error) {
      console.error("Error al obtener especies:", error);

      return NextResponse.json({error: "Error al obtener especies"}, {status: 500});
    }

    const seen = new Set<number>();
    const especiesFormateadas = (especies || [])
      .filter((e: any) => {
        if (e.especie_taxon_id == null || seen.has(e.especie_taxon_id)) return false;
        seen.add(e.especie_taxon_id);

        return true;
      })
      .map((especie: any) => ({
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
