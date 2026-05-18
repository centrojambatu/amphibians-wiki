import {NextResponse} from "next/server";

import {createClient} from "@/utils/supabase/server";

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const search = searchParams.get("search") || "";
  const catalogos = searchParams.get("catalogos") || "";
  const catalogosList = catalogos
    ? catalogos
        .split("||")
        .map((c) => c.trim())
        .filter(Boolean)
    : [];

  const supabase = await createClient();

  try {
    const {data: cantos, error: cantoError} = await supabase
      .from("canto")
      .select(
        `taxon_id, coleccion_id, coleccion_externa_id,
         coleccion:coleccion_id(taxon_id, catalogo_museo, numero_museo),
         coleccion_externa:coleccion_externa_id(taxon_id, catalogo_museo, numero_museo)`,
      )
      .eq("publicar", true)
      .limit(100000);

    if (cantoError) {
      console.error("Error al obtener cantos:", cantoError);

      return NextResponse.json({error: "Error al obtener cantos"}, {status: 500});
    }

    const matchesCatalog = (c: any): boolean => {
      if (catalogosList.length === 0) return true;
      const cat =
        c.coleccion ?? c.coleccion_externa ?? null;

      if (!cat?.catalogo_museo) return false;
      const key = cat.numero_museo
        ? `${String(cat.catalogo_museo)}::${String(cat.numero_museo)}`
        : (cat.catalogo_museo as string);

      return catalogosList.includes(key);
    };

    const taxonIds = new Set<number>();

    (cantos || []).forEach((c: any) => {
      if (!matchesCatalog(c)) return;
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

    const {data: especies, error} = await query;

    if (error) {
      console.error("Error al obtener especies:", error);

      return NextResponse.json({error: "Error al obtener especies"}, {status: 500});
    }

    // Resolver canto destacado por ficha
    const idsFichaEspecie = (especies || [])
      .map((e: any) => e.id_ficha_especie)
      .filter((id: any) => id != null);

    const cantoDestacadoMap = new Map<number, {enlace: string | null; nombre: string | null}>();

    if (idsFichaEspecie.length > 0) {
      const {data: fichas} = await supabase
        .from("ficha_especie")
        .select(
          "id_ficha_especie, canto_destacado:canto_destacado_id(enlace, nombre)",
        )
        .in("id_ficha_especie", idsFichaEspecie);

      if (fichas) {
        for (const ficha of fichas as any[]) {
          cantoDestacadoMap.set(ficha.id_ficha_especie, {
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
        const destacado = especie.id_ficha_especie
          ? cantoDestacadoMap.get(especie.id_ficha_especie)
          : null;

        return {
          id: especie.especie_taxon_id,
          nombre_cientifico: especie.nombre_cientifico,
          nombre_comun: especie.nombre_comun,
          slug: especie.nombre_cientifico?.replace(/\s+/g, "-") || "",
          orden: especie.orden || null,
          familia: especie.familia || null,
          genero: especie.genero || null,
          canto_url: destacado?.enlace ?? null,
          canto_nombre: destacado?.nombre ?? null,
        };
      });

    return NextResponse.json(especiesFormateadas);
  } catch (error) {
    console.error("Error inesperado:", error);

    return NextResponse.json({error: "Error inesperado"}, {status: 500});
  }
}
