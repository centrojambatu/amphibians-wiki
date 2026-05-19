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
    const {data: cantos, error: cantoError} = await supabase
      .from("canto")
      .select(
        `taxon_id, coleccion_id, coleccion_externa_id, localidad, colector, fecha,
         coleccion:coleccion_id(taxon_id, localidad, catalogo_museo, numero_museo),
         coleccion_externa:coleccion_externa_id(taxon_id, localidad, catalogo_museo, numero_museo, fecha)`,
      )
      .eq("publicar", true)
      .limit(100000);

    if (cantoError) {
      console.error("Error al obtener cantos:", cantoError);

      return NextResponse.json({error: "Error al obtener cantos"}, {status: 500});
    }

    const matchesLocalidad = (c: any): boolean => {
      if (localidades.length === 0) return true;
      const cands = [
        c.localidad,
        c.coleccion?.localidad,
        c.coleccion_externa?.localidad,
      ].filter(Boolean);

      return cands.some((loc: string) => localidades.includes(loc));
    };

    const matchesAutor = (c: any): boolean => {
      if (autores.length === 0) return true;

      return !!c.colector && autores.includes(c.colector);
    };

    const matchesAnio = (c: any): boolean => {
      if (!tieneFiltroAnio) return true;
      const fechaStr = c.fecha || c.coleccion_externa?.fecha || null;

      if (!fechaStr) return false;
      const year = new Date(String(fechaStr)).getUTCFullYear();

      if (!Number.isFinite(year)) return false;
      if (Number.isFinite(anioEspecifico)) return year === anioEspecifico;
      if (Number.isFinite(anioDesde) && year < anioDesde) return false;
      if (Number.isFinite(anioHasta) && year > anioHasta) return false;

      return true;
    };

    const matchesCatalogo = (c: any): boolean => {
      if (catalogos.length === 0) return true;
      const sources = [c.coleccion, c.coleccion_externa].filter(Boolean);

      return sources.some((src: any) => {
        if (!src?.catalogo_museo) return false;
        const key = src.numero_museo
          ? `${String(src.catalogo_museo)}::${String(src.numero_museo)}`
          : (src.catalogo_museo as string);

        return catalogos.includes(key);
      });
    };

    const taxonIds = new Set<number>();

    (cantos || []).forEach((c: any) => {
      if (!matchesLocalidad(c) || !matchesAutor(c) || !matchesCatalogo(c) || !matchesAnio(c))
        return;
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
    const cantoMap = new Map<
      number,
      {enlace: string | null; nombre: string | null}
    >();

    if (idsFichaEspecie.length > 0) {
      const {data: fichas} = await supabase
        .from("ficha_especie")
        .select(
          `id_ficha_especie,
           fotografia_destacada:fotografia_destacada_id(enlace),
           canto_destacado:canto_destacado_id(enlace, nombre)`,
        )
        .in("id_ficha_especie", idsFichaEspecie);

      if (fichas) {
        for (const ficha of fichas as any[]) {
          fotografiaMap.set(
            ficha.id_ficha_especie,
            ficha.fotografia_destacada?.enlace ?? null,
          );
          cantoMap.set(ficha.id_ficha_especie, {
            enlace: ficha.canto_destacado?.enlace ?? null,
            nombre: ficha.canto_destacado?.nombre ?? null,
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
          ? cantoMap.get(especie.id_ficha_especie)
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
          canto_url: destacado?.enlace ?? null,
          canto_nombre: destacado?.nombre ?? null,
        };
      });

    return NextResponse.json(especiesFormateadas);
  } catch (error) {
    console.error("Error en API de especies audioteca:", error);

    return NextResponse.json({error: "Error interno del servidor"}, {status: 500});
  }
}
