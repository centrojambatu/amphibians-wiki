import {NextResponse} from "next/server";

import {createClient} from "@/utils/supabase/server";

const CATEGORIAS_ORDEN = ["Renacuajos", "Ontogenia", "Osteología"] as const;

/**
 * Devuelve las categorías permitidas en el orden definido:
 * Renacuajos, Ontogenia, Osteología (de tipo_catalogo_awe_id = 13).
 */
export async function GET() {
  const supabase = await createClient();

  try {
    const {data, error} = await (supabase as any)
      .from("catalogo_awe")
      .select("nombre")
      .eq("tipo_catalogo_awe_id", 13)
      .in("nombre", CATEGORIAS_ORDEN);

    if (error) throw error;

    const disponibles = new Set<string>(
      (data ?? []).map((r: any) => r.nombre as string).filter(Boolean),
    );
    const categorias = CATEGORIAS_ORDEN.filter((n) => disponibles.has(n));

    return NextResponse.json(categorias, {
      headers: {"Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200"},
    });
  } catch (error) {
    console.error("Error en categorias fototeca:", error);
    return NextResponse.json({error: "Error al obtener categorías"}, {status: 500});
  }
}
