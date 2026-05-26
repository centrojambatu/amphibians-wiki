import {NextResponse} from "next/server";

import {createServiceClient} from "@/utils/supabase/server";

/**
 * Devuelve sugerencias de localidad:
 * - Provincias (geopolitica.nombre) referenciadas en coleccion.provincia_id.
 * - Detalles libres en coleccion.localidad.
 */
export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";
  const supabase = createServiceClient();

  try {
    let detalleQuery = supabase
      .from("coleccion")
      .select("localidad, provincia_id")
      .eq("publicar", true)
      .limit(200000);
    if (q.length >= 2) detalleQuery = detalleQuery.ilike("localidad", `%${q}%`);
    const {data: rows, error: rowsErr} = await detalleQuery;
    if (rowsErr) throw rowsErr;

    const setLoc = new Set<string>();
    const provIds = new Set<number>();
    (rows || []).forEach((r: any) => {
      if (r.localidad) setLoc.add(String(r.localidad).trim());
      if (r.provincia_id != null) provIds.add(r.provincia_id as number);
    });

    if (provIds.size > 0) {
      let provQuery = supabase
        .from("geopolitica")
        .select("nombre")
        .in("id_geopolitica", Array.from(provIds))
        .limit(100000);
      if (q.length >= 2) provQuery = provQuery.ilike("nombre", `%${q}%`);
      const {data: provs, error: provsErr} = await provQuery;
      if (provsErr) throw provsErr;
      (provs || []).forEach((p: any) => {
        if (p.nombre) setLoc.add(String(p.nombre).trim());
      });
    }

    const localidades = Array.from(setLoc)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    return NextResponse.json(localidades, {
      headers: {"Cache-Control": "public, s-maxage=300, stale-while-revalidate=600"},
    });
  } catch (error) {
    console.error("Error en localidades colecciones:", error);
    return NextResponse.json({error: "Error al obtener localidades"}, {status: 500});
  }
}
