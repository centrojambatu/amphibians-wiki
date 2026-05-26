import {NextResponse} from "next/server";

import {createServiceClient} from "@/utils/supabase/server";

export interface EspecieColecciones {
  id_taxon: number;
  nombre_cientifico: string;
  nombre_comun: string | null;
  familia: string | null;
  genero: string | null;
}

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";
  const supabase = createServiceClient();

  try {
    const {data: cols, error: colsErr} = await supabase
      .from("coleccion")
      .select("taxon_id")
      .eq("publicar", true)
      .not("taxon_id", "is", null)
      .limit(200000);

    if (colsErr) throw colsErr;
    const taxonIds = Array.from(
      new Set((cols || []).map((c: any) => c.taxon_id as number)),
    );
    if (taxonIds.length === 0) return NextResponse.json([]);

    let query = supabase
      .from("vw_lista_spp")
      .select("id_especie, nombre_cientifico, nombre_comun, familia, genero")
      .in("id_especie", taxonIds)
      .not("nombre_cientifico", "is", null)
      .order("nombre_cientifico", {ascending: true})
      .limit(50);

    if (q.length >= 2) {
      const esc = q.replace(/[%,()*]/g, "");
      query = query.or(`nombre_cientifico.ilike.%${esc}%,nombre_comun.ilike.%${esc}%`);
    }

    const {data, error} = await query;
    if (error) throw error;

    const seen = new Set<string>();
    const result: EspecieColecciones[] = [];
    (data || []).forEach((e: any) => {
      const nombre = e.nombre_cientifico as string;
      if (!nombre || seen.has(nombre)) return;
      seen.add(nombre);
      result.push({
        id_taxon: e.id_especie,
        nombre_cientifico: nombre,
        nombre_comun: e.nombre_comun ?? null,
        familia: e.familia ?? null,
        genero: e.genero ?? null,
      });
    });

    return NextResponse.json(result, {
      headers: {"Cache-Control": "public, s-maxage=300, stale-while-revalidate=600"},
    });
  } catch (error) {
    console.error("Error en especies colecciones:", error);
    return NextResponse.json({error: "Error al obtener especies"}, {status: 500});
  }
}
