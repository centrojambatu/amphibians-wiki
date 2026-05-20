import {NextResponse} from "next/server";

import {createClient} from "@/utils/supabase/server";

function parseList(raw: string | null): string[] {
  if (!raw) return [];

  return raw
    .split("||")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const search = searchParams.get("search") || "";
  const localidades = parseList(searchParams.get("localidades"));
  const autores = parseList(searchParams.get("autores"));
  const catalogos = parseList(searchParams.get("catalogos"));
  const familias = parseList(searchParams.get("familias"));
  const generos = parseList(searchParams.get("generos"));
  const anioEspecifico = parseInt(searchParams.get("anio") || "", 10);
  const anioDesde = parseInt(searchParams.get("anio_desde") || "", 10);
  const anioHasta = parseInt(searchParams.get("anio_hasta") || "", 10);
  const tieneFiltroAnio =
    Number.isFinite(anioEspecifico) ||
    Number.isFinite(anioDesde) ||
    Number.isFinite(anioHasta);

  const supabase = await createClient();

  try {
    const {data: videos, error: videoError} = await supabase
      .from("video")
      .select(
        `taxon_id, coleccion_id, coleccion_externa_id, autor, fecha,
         coleccion:coleccion_id(taxon_id, localidad, catalogo_museo, numero_museo),
         coleccion_externa:coleccion_externa_id(taxon_id, localidad, catalogo_museo, numero_museo, fecha)`,
      )
      .eq("publicar", true)
      .limit(100000);

    if (videoError) {
      console.error("Error al obtener videos:", videoError);

      return NextResponse.json({error: "Error al obtener videos"}, {status: 500});
    }

    const matchesLocalidad = (v: any): boolean => {
      if (localidades.length === 0) return true;
      const cands = [v.coleccion?.localidad, v.coleccion_externa?.localidad].filter(Boolean);

      return cands.some((loc: string) => localidades.includes(loc));
    };

    const matchesAutor = (v: any): boolean => {
      if (autores.length === 0) return true;

      return !!v.autor && autores.includes(v.autor);
    };

    const matchesCatalogo = (v: any): boolean => {
      if (catalogos.length === 0) return true;
      const sources = [v.coleccion, v.coleccion_externa].filter(Boolean);

      return sources.some((src: any) => {
        if (!src?.catalogo_museo) return false;
        const key = src.numero_museo
          ? `${String(src.catalogo_museo)}::${String(src.numero_museo)}`
          : (src.catalogo_museo as string);

        return catalogos.includes(key);
      });
    };

    const matchesAnio = (v: any): boolean => {
      if (!tieneFiltroAnio) return true;
      const fechaStr = v.fecha || v.coleccion_externa?.fecha || null;

      if (!fechaStr) return false;
      const year = new Date(String(fechaStr)).getUTCFullYear();

      if (!Number.isFinite(year)) return false;
      if (Number.isFinite(anioEspecifico)) return year === anioEspecifico;
      if (Number.isFinite(anioDesde) && year < anioDesde) return false;
      if (Number.isFinite(anioHasta) && year > anioHasta) return false;

      return true;
    };

    const taxonIds = new Set<number>();

    (videos || []).forEach((v: any) => {
      if (
        !matchesLocalidad(v) ||
        !matchesAutor(v) ||
        !matchesCatalogo(v) ||
        !matchesAnio(v)
      )
        return;
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

    if (familias.length > 0) {
      query = query.in("familia", familias);
    }

    if (generos.length > 0) {
      query = query.in("genero", generos);
    }

    const {data: especies, error} = await query;

    if (error) {
      console.error("Error al obtener especies:", error);

      return NextResponse.json({error: "Error al obtener especies"}, {status: 500});
    }

    const idsFichaEspecie = (especies || [])
      .map((e: any) => e.id_ficha_especie)
      .filter((id: any) => id != null);

    const fotografiaMap = new Map<number, string | null>();
    const videoMap = new Map<
      number,
      {enlace: string | null; thumbnail: string | null; nombre: string | null}
    >();

    if (idsFichaEspecie.length > 0) {
      const {data: fichas} = await supabase
        .from("ficha_especie")
        .select(
          `id_ficha_especie,
           fotografia_destacada:fotografia_destacada_id(enlace),
           video_destacado:video_destacado_id(enlace, thumbnail, nombre)`,
        )
        .in("id_ficha_especie", idsFichaEspecie);

      if (fichas) {
        for (const ficha of fichas as any[]) {
          fotografiaMap.set(
            ficha.id_ficha_especie,
            ficha.fotografia_destacada?.enlace ?? null,
          );
          videoMap.set(ficha.id_ficha_especie, {
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
        const fotografia_url = especie.id_ficha_especie
          ? (fotografiaMap.get(especie.id_ficha_especie) ?? null)
          : null;
        const destacado = especie.id_ficha_especie
          ? videoMap.get(especie.id_ficha_especie)
          : null;

        return {
          id: especie.especie_taxon_id,
          nombre_cientifico: especie.nombre_cientifico,
          nombre_comun: especie.nombre_comun,
          slug: especie.nombre_cientifico?.replace(/\s+/g, "-") || "",
          orden: especie.orden || null,
          familia: especie.familia || null,
          genero: especie.genero || null,
          fotografia_url,
          video_url: destacado?.enlace ?? null,
          video_thumbnail: destacado?.thumbnail ?? null,
          video_nombre: destacado?.nombre ?? null,
        };
      });

    return NextResponse.json(especiesFormateadas);
  } catch (error) {
    console.error("Error en API de especies videoteca:", error);

    return NextResponse.json({error: "Error interno del servidor"}, {status: 500});
  }
}
