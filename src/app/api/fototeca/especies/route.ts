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

  const supabase = await createClient();

  try {
    const {data: fotos, error: fotoError} = await supabase
      .from("fotografia")
      .select(
        `taxon_id, coleccion_id, coleccion_externa_id, localidad, autor,
         coleccion:coleccion_id(taxon_id, localidad, catalogo_museo, numero_museo),
         coleccion_externa:coleccion_externa_id(taxon_id, localidad, catalogo_museo, numero_museo)`,
      )
      .eq("publicar", true)
      .limit(100000);

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
      if (!matchesLocalidad(f) || !matchesAutor(f) || !matchesCatalogo(f)) return;
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
