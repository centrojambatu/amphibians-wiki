import {NextResponse} from "next/server";

import {createClient} from "@/utils/supabase/server";

const TIPOS_ALLOWED = ["Holotipo", "Neotipo", "Sintipo", "Paratipo"] as const;

/**
 * Devuelve solo los tipos relevantes del catálogo donde
 * tipo_catalogo_awe_id = 14: Holotipo, Neotipo, Sintipo, Paratipo.
 */
export async function GET() {
  const supabase = await createClient();

  try {
    const {data, error} = await (supabase as any)
      .from("catalogo_awe")
      .select("nombre")
      .eq("tipo_catalogo_awe_id", 14)
      .in("nombre", TIPOS_ALLOWED)
      .order("nombre", {ascending: true});

    if (error) throw error;

    const tipos = (data ?? [])
      .map((r: any) => r.nombre as string)
      .filter(Boolean);

    return NextResponse.json(tipos, {
      headers: {"Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200"},
    });
  } catch (error) {
    console.error("Error en tipos fototeca:", error);
    return NextResponse.json({error: "Error al obtener tipos"}, {status: 500});
  }
}
