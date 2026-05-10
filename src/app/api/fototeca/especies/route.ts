import {NextResponse} from "next/server";

import {createClient} from "@/utils/supabase/server";

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const search = searchParams.get("search") || "";

  const supabase = await createClient();

  try {
    const {data: fotos, error: fotoError} = await supabase
      .from("fotografia")
      .select(
        `taxon_id, coleccion_id, coleccion_externa_id, coleccion:coleccion_id(taxon_id), coleccion_externa:coleccion_externa_id(taxon_id)`,
      )
      .eq("publicar", true)
      .limit(100000);

    if (fotoError) {
      console.error("Error al obtener fotografías:", fotoError);

      return NextResponse.json({error: "Error al obtener fotografías"}, {status: 500});
    }

    const taxonIds = new Set<number>();

    (fotos || []).forEach((f: any) => {
      const t =
        f.coleccion_id != null
          ? f.coleccion?.taxon_id
          : f.coleccion_externa_id != null
            ? f.coleccion_externa?.taxon_id
            : f.taxon_id;

      if (t != null) taxonIds.add(Number(t));
    });

    if (taxonIds.size === 0) {
      return NextResponse.json([]);
    }

    let query = supabase
      .from("vw_ficha_especie_completa")
      .select(
        "especie_taxon_id, nombre_cientifico, nombre_comun, id_ficha_especie, orden, familia, genero",
      )
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

    const idsFichaEspecie = (especies || [])
      .map((e: any) => e.id_ficha_especie)
      .filter((id: any) => id !== null);

    let fotosMap: Record<number, string | null> = {};

    if (idsFichaEspecie.length > 0) {
      const {data: fichas} = await supabase
        .from("ficha_especie")
        .select("id_ficha_especie, fotografia_ficha")
        .in("id_ficha_especie", idsFichaEspecie);

      if (fichas) {
        fichas.forEach((ficha: any) => {
          fotosMap[ficha.id_ficha_especie] = ficha.fotografia_ficha || null;
        });
      }
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
        fotografia_ficha: especie.id_ficha_especie
          ? fotosMap[especie.id_ficha_especie] || null
          : null,
        orden: especie.orden || null,
        familia: especie.familia || null,
        genero: especie.genero || null,
      }));

    return NextResponse.json(especiesFormateadas);
  } catch (error) {
    console.error("Error en API de especies:", error);

    return NextResponse.json({error: "Error interno del servidor"}, {status: 500});
  }
}
