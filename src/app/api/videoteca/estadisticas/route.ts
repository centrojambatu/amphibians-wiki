import {NextResponse} from "next/server";

import {createClient} from "@/utils/supabase/server";

interface VideoCard {
  enlace: string | null;
  thumbnail: string | null;
  autor: string | null;
  nombre: string | null;
  nombre_cientifico?: string | null;
  fotografia_url?: string | null;
}

const CATALOGO_POSIBLEMENTE_EXTINTA = 175;

async function resolverEspecie(
  supabase: Awaited<ReturnType<typeof createClient>>,
  taxonId: number | null | undefined,
): Promise<{nombre_cientifico: string | null; fotografia_url: string | null}> {
  if (taxonId == null) return {nombre_cientifico: null, fotografia_url: null};

  const {data: vista} = await supabase
    .from("vw_ficha_especie_completa")
    .select("nombre_cientifico, id_ficha_especie")
    .eq("especie_taxon_id", taxonId)
    .limit(1)
    .maybeSingle();

  const nombre = (vista as any)?.nombre_cientifico ?? null;
  const idFicha = (vista as any)?.id_ficha_especie ?? null;
  let fotografia_url: string | null = null;

  if (idFicha) {
    const {data: ficha} = await supabase
      .from("ficha_especie")
      .select("fotografia_destacada:fotografia_destacada_id(enlace)")
      .eq("id_ficha_especie", idFicha)
      .maybeSingle();

    fotografia_url = (ficha as any)?.fotografia_destacada?.enlace ?? null;
  }

  return {nombre_cientifico: nombre, fotografia_url};
}

export async function GET() {
  const supabase = await createClient();

  // Card 1: total videos publicados
  const {count: totalVideos} = await supabase
    .from("video")
    .select("*", {count: "exact", head: true})
    .eq("publicar", true);

  // Card 2: video destacado más reciente (mayor id_video entre los destacados)
  let videoDestacadoReciente: VideoCard | null = null;
  {
    const {data: fichas} = await supabase
      .from("ficha_especie")
      .select("video_destacado_id")
      .not("video_destacado_id", "is", null);

    const ids = (fichas || [])
      .map((r: any) => r.video_destacado_id)
      .filter((id: any) => id != null);

    if (ids.length > 0) {
      const {data} = await supabase
        .from("video")
        .select("id_video, enlace, thumbnail, autor, nombre, taxon_id")
        .in("id_video", ids)
        .order("id_video", {ascending: false})
        .limit(1)
        .maybeSingle();

      if (data) {
        const especie = await resolverEspecie(supabase, data.taxon_id);

        videoDestacadoReciente = {
          enlace: data.enlace,
          thumbnail: data.thumbnail ?? null,
          autor: data.autor ?? null,
          nombre: data.nombre ?? null,
          nombre_cientifico: especie.nombre_cientifico,
          fotografia_url: especie.fotografia_url,
        };
      }
    }
  }

  // Card 3: video con id_video menor entre destacados (primer video registrado)
  let primerVideo: VideoCard | null = null;
  {
    const {data: fichas} = await supabase
      .from("ficha_especie")
      .select("video_destacado_id")
      .not("video_destacado_id", "is", null);

    const ids = (fichas || [])
      .map((r: any) => r.video_destacado_id)
      .filter((id: any) => id != null);

    if (ids.length > 0) {
      const {data} = await supabase
        .from("video")
        .select("id_video, enlace, thumbnail, autor, nombre, taxon_id")
        .in("id_video", ids)
        .order("id_video", {ascending: true})
        .limit(1)
        .maybeSingle();

      if (data) {
        const especie = await resolverEspecie(supabase, data.taxon_id);

        primerVideo = {
          enlace: data.enlace,
          thumbnail: data.thumbnail ?? null,
          autor: data.autor ?? null,
          nombre: data.nombre ?? null,
          nombre_cientifico: especie.nombre_cientifico,
          fotografia_url: especie.fotografia_url,
        };
      }
    }
  }

  // Card 4: video destacado editorial (más reciente por id de ficha)
  let videoDestacado: VideoCard | null = null;
  {
    const {data: ficha} = await supabase
      .from("ficha_especie")
      .select("video_destacado_id")
      .not("video_destacado_id", "is", null)
      .order("id_ficha_especie", {ascending: false})
      .limit(1)
      .maybeSingle();

    if (ficha?.video_destacado_id) {
      const {data} = await supabase
        .from("video")
        .select("id_video, enlace, thumbnail, autor, nombre, taxon_id")
        .eq("id_video", ficha.video_destacado_id)
        .maybeSingle();

      if (data) {
        const especie = await resolverEspecie(supabase, data.taxon_id);

        videoDestacado = {
          enlace: data.enlace,
          thumbnail: data.thumbnail ?? null,
          autor: data.autor ?? null,
          nombre: data.nombre ?? null,
          nombre_cientifico: especie.nombre_cientifico,
          fotografia_url: especie.fotografia_url,
        };
      }
    }
  }

  // Card 5: video destacado de una especie posiblemente extinta (catalogo_awe_id = 175)
  let videoExtinta: VideoCard | null = null;
  {
    const {data: taxones} = await supabase
      .from("taxon_catalogo_awe")
      .select("taxon_id")
      .eq("catalogo_awe_id", CATALOGO_POSIBLEMENTE_EXTINTA);

    const taxonIds = (taxones || [])
      .map((r: any) => r.taxon_id)
      .filter((id: any) => id != null);

    if (taxonIds.length > 0) {
      const {data: ficha} = await supabase
        .from("ficha_especie")
        .select("video_destacado_id, taxon_id")
        .in("taxon_id", taxonIds)
        .not("video_destacado_id", "is", null)
        .limit(1)
        .maybeSingle();

      if (ficha?.video_destacado_id) {
        const {data} = await supabase
          .from("video")
          .select("id_video, enlace, thumbnail, autor, nombre, taxon_id")
          .eq("id_video", ficha.video_destacado_id)
          .maybeSingle();

        if (data) {
          const especie = await resolverEspecie(supabase, ficha.taxon_id);

          videoExtinta = {
            enlace: data.enlace,
            thumbnail: data.thumbnail ?? null,
            autor: data.autor ?? null,
            nombre: data.nombre ?? null,
            nombre_cientifico: especie.nombre_cientifico,
            fotografia_url: especie.fotografia_url,
          };
        }
      }
    }
  }

  return NextResponse.json({
    total_videos: totalVideos ?? 0,
    primer_video: primerVideo,
    video_destacado_reciente: videoDestacadoReciente,
    video_destacado: videoDestacado,
    video_posiblemente_extinta: videoExtinta,
  });
}
