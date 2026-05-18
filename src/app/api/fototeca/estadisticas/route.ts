import {NextResponse} from "next/server";

import {createClient} from "@/utils/supabase/server";

interface FotoCard {
  enlace: string;
  autor: string | null;
  fecha?: string | null;
  nombre_cientifico?: string | null;
}

const CATALOGO_POSIBLEMENTE_EXTINTA = 175;

async function resolverNombreCientifico(
  supabase: Awaited<ReturnType<typeof createClient>>,
  taxonId: number | null | undefined,
): Promise<string | null> {
  if (taxonId == null) return null;
  const {data} = await supabase
    .from("vw_ficha_especie_completa")
    .select("nombre_cientifico")
    .eq("especie_taxon_id", taxonId)
    .limit(1)
    .maybeSingle();

  return (data as any)?.nombre_cientifico ?? null;
}

export async function GET() {
  const supabase = await createClient();

  // Card 1: total fotos
  const {count: totalFotos} = await supabase
    .from("fotografia")
    .select("*", {count: "exact", head: true});

  // Card 2: primera foto tomada (más antigua por fecha)
  let primeraFoto: FotoCard | null = null;
  {
    const {data} = await supabase
      .from("fotografia")
      .select("id_fotografia, enlace, autor, fecha, taxon_id")
      .not("fecha", "is", null)
      .order("fecha", {ascending: true})
      .limit(1)
      .maybeSingle();

    if (data) {
      primeraFoto = {
        enlace: data.enlace,
        autor: data.autor ?? null,
        fecha: data.fecha,
        nombre_cientifico: await resolverNombreCientifico(supabase, data.taxon_id),
      };
    }
  }

  // Card 3: foto destacada más reciente (mayor created_at entre las destacadas)
  let fotoDestacadaReciente: FotoCard | null = null;
  {
    const {data: fichas} = await supabase
      .from("ficha_especie")
      .select("fotografia_destacada_id")
      .not("fotografia_destacada_id", "is", null);

    const ids = (fichas || [])
      .map((r: any) => r.fotografia_destacada_id)
      .filter((id: any) => id != null);

    if (ids.length > 0) {
      const {data} = await supabase
        .from("fotografia")
        .select("id_fotografia, enlace, autor, created_at, taxon_id")
        .in("id_fotografia", ids)
        .order("created_at", {ascending: false, nullsFirst: false})
        .limit(1)
        .maybeSingle();

      if (data) {
        fotoDestacadaReciente = {
          enlace: data.enlace,
          autor: data.autor ?? null,
          nombre_cientifico: await resolverNombreCientifico(supabase, data.taxon_id),
        };
      }
    }
  }

  // Card 4: foto destacada editorial (fotografia.destacada = true)
  let fotoDestacada: FotoCard | null = null;
  {
    const {data} = await supabase
      .from("fotografia")
      .select("id_fotografia, enlace, autor, taxon_id")
      .eq("destacada", true)
      .order("id_fotografia", {ascending: false})
      .limit(1)
      .maybeSingle();

    if (data) {
      fotoDestacada = {
        enlace: data.enlace,
        autor: data.autor ?? null,
        nombre_cientifico: await resolverNombreCientifico(supabase, data.taxon_id),
      };
    }
  }

  // Card 5: foto destacada de especie posiblemente extinta (catalogo_awe_id = 175)
  let fotoExtinta: FotoCard | null = null;
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
        .select("fotografia_destacada_id, taxon_id")
        .in("taxon_id", taxonIds)
        .not("fotografia_destacada_id", "is", null)
        .limit(1)
        .maybeSingle();

      if (ficha?.fotografia_destacada_id) {
        const {data} = await supabase
          .from("fotografia")
          .select("id_fotografia, enlace, autor, taxon_id")
          .eq("id_fotografia", ficha.fotografia_destacada_id)
          .maybeSingle();

        if (data) {
          fotoExtinta = {
            enlace: data.enlace,
            autor: data.autor ?? null,
            nombre_cientifico: await resolverNombreCientifico(supabase, ficha.taxon_id),
          };
        }
      }
    }
  }

  return NextResponse.json({
    total_fotos: totalFotos ?? 0,
    primera_foto: primeraFoto,
    foto_destacada_reciente: fotoDestacadaReciente,
    foto_destacada: fotoDestacada,
    foto_posiblemente_extinta: fotoExtinta,
  });
}
