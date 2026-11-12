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

  // Card 2: video destacado de la especie descrita más recientemente
  // (mayor taxon.fecha_descripcion; desempata el id_taxon más alto, porque muchas
  // especies solo tienen el año y comparten fecha AAAA-01-01).
  let videoDestacadoReciente: VideoCard | null = null;
  {
    const {data: fichas} = await supabase
      .from("ficha_especie")
      .select("taxon_id, video_destacado_id, taxon!inner(id_taxon, fecha_descripcion)")
      .not("video_destacado_id", "is", null)
      .not("taxon.fecha_descripcion", "is", null);

    const candidatas = (fichas || []).sort((a: any, b: any) => {
      const porFecha = b.taxon.fecha_descripcion.localeCompare(a.taxon.fecha_descripcion);

      return porFecha !== 0 ? porFecha : b.taxon.id_taxon - a.taxon.id_taxon;
    });

    if (candidatas.length > 0) {
      // Solo videos que existen y tienen enlace, para no caer en una card vacía.
      const {data: videos} = await supabase
        .from("video")
        .select("id_video, enlace, thumbnail, autor, nombre")
        .in(
          "id_video",
          candidatas.map((f: any) => f.video_destacado_id),
        )
        .not("enlace", "is", null)
        .neq("enlace", "");

      const videoPorId = new Map((videos || []).map((v: any) => [v.id_video, v]));
      const elegida = candidatas.find((f: any) => videoPorId.has(f.video_destacado_id));
      const data = elegida ? videoPorId.get(elegida.video_destacado_id) : null;

      if (elegida && data) {
        const especie = await resolverEspecie(supabase, elegida.taxon_id);

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

  // Card 4: video destacado (columna video.destacado = true)
  let videoDestacado: VideoCard | null = null;
  {
    const {data} = await supabase
      .from("video")
      .select("id_video, enlace, thumbnail, autor, nombre, taxon_id")
      .eq("publicar", true)
      .eq("destacado", true)
      .order("id_video", {ascending: false})
      .limit(1)
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

  // Card 4b: video premiado (columna video.premiado = true)
  let videoPremiado: VideoCard | null = null;
  {
    const {data} = await supabase
      .from("video")
      .select("id_video, enlace, thumbnail, autor, nombre, taxon_id")
      .eq("publicar", true)
      .eq("premiado", true)
      .order("id_video", {ascending: false})
      .limit(1)
      .maybeSingle();

    if (data) {
      const especie = await resolverEspecie(supabase, data.taxon_id);

      videoPremiado = {
        enlace: data.enlace,
        thumbnail: data.thumbnail ?? null,
        autor: data.autor ?? null,
        nombre: data.nombre ?? null,
        nombre_cientifico: especie.nombre_cientifico,
        fotografia_url: especie.fotografia_url,
      };
    }
  }

  // Card 5: video destacado de una especie posiblemente extinta (catalogo_awe_id = 175).
  // Se elige una especie al azar en cada petición, así el video rota al refrescar.
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
      const {data: fichas} = await supabase
        .from("ficha_especie")
        .select("video_destacado_id, taxon_id")
        .in("taxon_id", taxonIds)
        .not("video_destacado_id", "is", null);

      // Solo cuentan las fichas cuyo video destacado existe y tiene enlace;
      // así el sorteo nunca cae en una especie sin video.
      const taxonPorVideo = new Map<number, number>(
        (fichas || []).map((f: any) => [f.video_destacado_id, f.taxon_id]),
      );

      if (taxonPorVideo.size > 0) {
        const {data: videos} = await supabase
          .from("video")
          .select("id_video, enlace, thumbnail, autor, nombre")
          .in("id_video", [...taxonPorVideo.keys()])
          .not("enlace", "is", null)
          .neq("enlace", "");

        const data = videos?.length ? videos[Math.floor(Math.random() * videos.length)] : null;

        if (data) {
          const especie = await resolverEspecie(supabase, taxonPorVideo.get(data.id_video));

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
    video_premiado: videoPremiado,
    video_posiblemente_extinta: videoExtinta,
  });
}
