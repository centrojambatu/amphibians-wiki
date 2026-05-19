import {NextResponse} from "next/server";

import {createClient} from "@/utils/supabase/server";

interface CantoCard {
  enlace: string | null;
  colector: string | null;
  fecha?: string | null;
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

  // Card 1: total cantos publicados
  const {count: totalCantos} = await supabase
    .from("canto")
    .select("*", {count: "exact", head: true})
    .eq("publicar", true);

  // Card 2: primer canto (más antiguo por fecha)
  let primerCanto: CantoCard | null = null;
  {
    const {data} = await supabase
      .from("canto")
      .select("id_canto, enlace, colector, fecha, taxon_id")
      .eq("publicar", true)
      .not("fecha", "is", null)
      .order("fecha", {ascending: true})
      .limit(1)
      .maybeSingle();

    if (data) {
      const especie = await resolverEspecie(supabase, data.taxon_id);

      primerCanto = {
        enlace: data.enlace,
        colector: data.colector ?? null,
        fecha: data.fecha,
        nombre_cientifico: especie.nombre_cientifico,
        fotografia_url: especie.fotografia_url,
      };
    }
  }

  // Card 3: canto destacado más reciente (ficha_especie.canto_destacado_id ordenado por created_at)
  let cantoDestacadoReciente: CantoCard | null = null;
  {
    const {data: fichas} = await supabase
      .from("ficha_especie")
      .select("canto_destacado_id")
      .not("canto_destacado_id", "is", null);

    const ids = (fichas || [])
      .map((r: any) => r.canto_destacado_id)
      .filter((id: any) => id != null);

    if (ids.length > 0) {
      const {data} = await supabase
        .from("canto")
        .select("id_canto, enlace, colector, fecha, created_at, taxon_id")
        .in("id_canto", ids)
        .order("created_at", {ascending: false, nullsFirst: false})
        .limit(1)
        .maybeSingle();

      if (data) {
        const especie = await resolverEspecie(supabase, data.taxon_id);

        cantoDestacadoReciente = {
          enlace: data.enlace,
          colector: data.colector ?? null,
          fecha: data.fecha ?? null,
          nombre_cientifico: especie.nombre_cientifico,
          fotografia_url: especie.fotografia_url,
        };
      }
    }
  }

  // Card 4: canto destacado editorial — el primero según id_canto entre los `canto_destacado_id` de ficha_especie
  let cantoDestacado: CantoCard | null = null;
  {
    const {data: fichas} = await supabase
      .from("ficha_especie")
      .select("canto_destacado_id")
      .not("canto_destacado_id", "is", null);

    const ids = (fichas || [])
      .map((r: any) => r.canto_destacado_id)
      .filter((id: any) => id != null);

    if (ids.length > 0) {
      const {data} = await supabase
        .from("canto")
        .select("id_canto, enlace, colector, fecha, taxon_id")
        .in("id_canto", ids)
        .order("id_canto", {ascending: false})
        .limit(1)
        .maybeSingle();

      if (data) {
        const especie = await resolverEspecie(supabase, data.taxon_id);

        cantoDestacado = {
          enlace: data.enlace,
          colector: data.colector ?? null,
          fecha: data.fecha ?? null,
          nombre_cientifico: especie.nombre_cientifico,
          fotografia_url: especie.fotografia_url,
        };
      }
    }
  }

  // Card 5: canto destacado de una especie posiblemente extinta (catalogo_awe_id = 175)
  let cantoExtinta: CantoCard | null = null;
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
        .select("canto_destacado_id, taxon_id")
        .in("taxon_id", taxonIds)
        .not("canto_destacado_id", "is", null)
        .limit(1)
        .maybeSingle();

      if (ficha?.canto_destacado_id) {
        const {data} = await supabase
          .from("canto")
          .select("id_canto, enlace, colector, fecha, taxon_id")
          .eq("id_canto", ficha.canto_destacado_id)
          .maybeSingle();

        if (data) {
          const especie = await resolverEspecie(supabase, ficha.taxon_id);

          cantoExtinta = {
            enlace: data.enlace,
            colector: data.colector ?? null,
            fecha: data.fecha ?? null,
            nombre_cientifico: especie.nombre_cientifico,
            fotografia_url: especie.fotografia_url,
          };
        }
      }
    }
  }

  return NextResponse.json({
    total_cantos: totalCantos ?? 0,
    primer_canto: primerCanto,
    canto_destacado_reciente: cantoDestacadoReciente,
    canto_destacado: cantoDestacado,
    canto_posiblemente_extinta: cantoExtinta,
  });
}
