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
  const tipos = parseList(searchParams.get("tipos"));
  const categorias = parseList(searchParams.get("categorias"));
  const anioEspecifico = parseInt(searchParams.get("anio") || "", 10);
  const anioDesde = parseInt(searchParams.get("anio_desde") || "", 10);
  const anioHasta = parseInt(searchParams.get("anio_hasta") || "", 10);
  const tieneFiltroAnio =
    Number.isFinite(anioEspecifico) ||
    Number.isFinite(anioDesde) ||
    Number.isFinite(anioHasta);

  const supabase = await createClient();

  try {
    // Resolver nombres -> ids de catalogo_awe si hay filtros de tipos/categorias
    let catalogoAweIdsFiltro: number[] | null = null;
    if (tipos.length > 0 || categorias.length > 0) {
      const nombresBuscados = [...tipos, ...categorias];
      const {data: catData, error: catErr} = await (supabase as any)
        .from("catalogo_awe")
        .select("id_catalogo_awe, nombre")
        .in("nombre", nombresBuscados)
        .in("tipo_catalogo_awe_id", [13, 14]);
      if (catErr) {
        console.error("Error resolviendo catalogo_awe:", catErr);
        return NextResponse.json({error: "Error al resolver tipos"}, {status: 500});
      }
      const ids = (catData ?? [])
        .map((r: any) => r.id_catalogo_awe as number)
        .filter((id: number | null) => id != null) as number[];
      if (ids.length === 0) {
        return NextResponse.json([]);
      }
      catalogoAweIdsFiltro = ids;
    }

    let fotosQuery = supabase
      .from("fotografia")
      .select(
        `taxon_id, coleccion_id, coleccion_externa_id, localidad, autor, fecha, catalogo_awe_id,
         coleccion:coleccion_id(taxon_id, localidad, catalogo_museo, numero_museo),
         coleccion_externa:coleccion_externa_id(taxon_id, localidad, catalogo_museo, numero_museo, fecha)`,
      )
      .eq("publicar", true)
      .limit(100000);

    if (catalogoAweIdsFiltro) {
      fotosQuery = fotosQuery.in("catalogo_awe_id", catalogoAweIdsFiltro);
    }

    const {data: fotos, error: fotoError} = await fotosQuery;

    if (fotoError) {
      console.error("Error al obtener fotografías:", fotoError);

      return NextResponse.json({error: "Error al obtener fotografías"}, {status: 500});
    }

    const matchesLocalidad = (f: any): boolean => {
      if (localidades.length === 0) return true;
      const cands = [
        f.localidad,
        f.coleccion?.localidad,
        f.coleccion_externa?.localidad,
      ].filter(Boolean);

      return cands.some((loc: string) => localidades.includes(loc));
    };

    const matchesAutor = (f: any): boolean => {
      if (autores.length === 0) return true;

      return !!f.autor && autores.includes(f.autor);
    };

    const matchesAnio = (f: any): boolean => {
      if (!tieneFiltroAnio) return true;
      const fechaStr = f.fecha || f.coleccion_externa?.fecha || null;

      if (!fechaStr) return false;
      const year = new Date(String(fechaStr)).getUTCFullYear();

      if (!Number.isFinite(year)) return false;
      if (Number.isFinite(anioEspecifico)) return year === anioEspecifico;
      if (Number.isFinite(anioDesde) && year < anioDesde) return false;
      if (Number.isFinite(anioHasta) && year > anioHasta) return false;

      return true;
    };

    const matchesCatalogo = (f: any): boolean => {
      if (catalogos.length === 0) return true;
      const sources = [f.coleccion, f.coleccion_externa].filter(Boolean);

      return sources.some((c: any) => {
        if (!c?.catalogo_museo) return false;
        const key = c.numero_museo
          ? `${String(c.catalogo_museo)}::${String(c.numero_museo)}`
          : (c.catalogo_museo as string);

        return catalogos.includes(key);
      });
    };

    const taxonIds = new Set<number>();

    (fotos || []).forEach((f: any) => {
      if (!matchesLocalidad(f) || !matchesAutor(f) || !matchesCatalogo(f) || !matchesAnio(f))
        return;
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
      .filter((id: any) => id !== null);

    let fotosMap: Record<number, string | null> = {};

    if (idsFichaEspecie.length > 0) {
      const {data: fichas} = await supabase
        .from("ficha_especie")
        .select("id_ficha_especie, fotografia_destacada:fotografia_destacada_id(enlace)")
        .in("id_ficha_especie", idsFichaEspecie);

      if (fichas) {
        fichas.forEach((ficha: any) => {
          fotosMap[ficha.id_ficha_especie] = ficha.fotografia_destacada?.enlace ?? null;
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
        fotografia_url: especie.id_ficha_especie
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
