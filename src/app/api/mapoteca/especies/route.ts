import {NextResponse} from "next/server";

import {createClient} from "@/utils/supabase/server";

export interface EspecieMapoteca {
  id_taxon: number;
  nombre_cientifico: string;
  endemica: boolean | null;
  lista_roja_iucn: string | null;
  familia: string | null;
  genero: string | null;
}

let siglaCache: Map<string, string> | null = null;
let siglaCacheTime = 0;
const SIGLA_CACHE_TTL = 60 * 60 * 1000;

async function getSiglaMap(supabase: any): Promise<Map<string, string>> {
  if (siglaCache && Date.now() - siglaCacheTime < SIGLA_CACHE_TTL) return siglaCache;
  const {data} = await supabase
    .from("catalogo_awe")
    .select("nombre, sigla")
    .eq("tipo_catalogo_awe_id", 10);
  const map = new Map<string, string>();

  (data || []).forEach((c: any) => {
    if (c.nombre && c.sigla) map.set(c.nombre, c.sigla);
  });
  siglaCache = map;
  siglaCacheTime = Date.now();

  return map;
}

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const especie = searchParams.get("especie")?.trim() || "";

  const supabase = await createClient();

  try {
    let query = (supabase as any)
      .from("mv_mapoteca_especies_busqueda")
      .select("taxon_id, nombre_especie, nombre_comun, endemica, familia, genero, lista_roja_nombre")
      .order("nombre_especie", {ascending: true})
      .limit(50);

    if (especie.length > 0) {
      query = query.or(`nombre_especie.ilike.%${especie}%,nombre_comun.ilike.%${especie}%`);
    }

    const {data, error} = await query;

    if (error) throw error;

    const siglaMap = await getSiglaMap(supabase);

    const result: EspecieMapoteca[] = (data || []).map((e: any) => ({
      id_taxon: e.taxon_id,
      nombre_cientifico: e.nombre_especie,
      endemica: e.endemica ?? null,
      lista_roja_iucn: e.lista_roja_nombre ? siglaMap.get(e.lista_roja_nombre) ?? null : null,
      familia: e.familia ?? null,
      genero: e.genero ?? null,
    }));

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error en API de especies:", error);

    return NextResponse.json({error: "Error al obtener especies"}, {status: 500});
  }
}
