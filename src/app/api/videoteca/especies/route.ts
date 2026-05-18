import {NextResponse} from "next/server";

import {createClient} from "@/utils/supabase/server";

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const search = searchParams.get("search") || "";

  const supabase = await createClient();

  try {
    const {data: videos, error: videoError} = await supabase
      .from("video")
      .select(
        `taxon_id, coleccion_id, coleccion_externa_id, coleccion:coleccion_id(taxon_id), coleccion_externa:coleccion_externa_id(taxon_id)`,
      )
      .eq("publicar", true)
      .limit(100000);

    if (videoError) {
      console.error("Error al obtener videos:", videoError);

      return NextResponse.json({error: "Error al obtener videos"}, {status: 500});
    }

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

    if (taxonIds.size === 0) {
      return NextResponse.json([]);
    }

    let query = supabase
      .from("vw_ficha_especie_completa")
      .select(
        "especie_taxon_id, id_ficha_especie, nombre_cientifico, nombre_comun, orden, familia, genero",
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

    // Resolver video destacado por ficha
    const idsFichaEspecie = (especies || [])
      .map((e: any) => e.id_ficha_especie)
      .filter((id: any) => id != null);

    const videoDestacadoMap = new Map<
      number,
      {enlace: string | null; thumbnail: string | null; nombre: string | null}
    >();

    if (idsFichaEspecie.length > 0) {
      const {data: fichas} = await supabase
        .from("ficha_especie")
        .select(
          "id_ficha_especie, video_destacado:video_destacado_id(enlace, thumbnail, nombre)",
        )
        .in("id_ficha_especie", idsFichaEspecie);

      if (fichas) {
        for (const ficha of fichas as any[]) {
          videoDestacadoMap.set(ficha.id_ficha_especie, {
            enlace: ficha.video_destacado?.enlace ?? null,
            thumbnail: ficha.video_destacado?.thumbnail ?? null,
            nombre: ficha.video_destacado?.nombre ?? null,
          });
        }
      }
    }

    const seen = new Set<number>();
    const especiesFormateadas = (especies || [])
      .filter((e: any) => {
        if (e.especie_taxon_id == null || seen.has(e.especie_taxon_id)) return false;
        seen.add(e.especie_taxon_id);

        return true;
      })
      .map((especie: any) => {
        const destacado = especie.id_ficha_especie
          ? videoDestacadoMap.get(especie.id_ficha_especie)
          : null;

        return {
          id: especie.especie_taxon_id,
          nombre_cientifico: especie.nombre_cientifico,
          nombre_comun: especie.nombre_comun,
          slug: especie.nombre_cientifico?.replace(/\s+/g, "-") || "",
          orden: especie.orden || null,
          familia: especie.familia || null,
          genero: especie.genero || null,
          video_url: destacado?.enlace ?? null,
          video_thumbnail: destacado?.thumbnail ?? null,
          video_nombre: destacado?.nombre ?? null,
        };
      });

    return NextResponse.json(especiesFormateadas);
  } catch (error) {
    console.error("Error inesperado:", error);

    return NextResponse.json({error: "Error inesperado"}, {status: 500});
  }
}
