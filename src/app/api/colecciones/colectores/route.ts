import {NextResponse} from "next/server";

import {createServiceClient} from "@/utils/supabase/server";

/**
 * Devuelve la unión de:
 * - Valores distintos de `coleccion.colectores` (texto libre).
 * - Nombres de `personal` que aparecen referenciados en `coleccion.personal_id`.
 */
export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";
  const supabase = createServiceClient();

  try {
    // 1) Texto libre en coleccion.colectores
    let textoQuery = supabase
      .from("coleccion")
      .select("colectores, personal_id")
      .eq("publicar", true)
      .limit(200000);
    if (q.length >= 2) textoQuery = textoQuery.ilike("colectores", `%${q}%`);
    const {data: rows, error: rowsErr} = await textoQuery;
    if (rowsErr) throw rowsErr;

    const setColectores = new Set<string>();
    const personalIds = new Set<number>();
    (rows || []).forEach((r: any) => {
      if (r.colectores) setColectores.add(String(r.colectores).trim());
      if (r.personal_id != null) personalIds.add(r.personal_id as number);
    });

    // 2) Nombres en personal asociados a colecciones
    if (personalIds.size > 0) {
      let persQuery = supabase
        .from("personal")
        .select("nombre")
        .in("id_personal", Array.from(personalIds))
        .limit(100000);
      if (q.length >= 2) persQuery = persQuery.ilike("nombre", `%${q}%`);
      const {data: pers, error: persErr} = await persQuery;
      if (persErr) throw persErr;
      (pers || []).forEach((p: any) => {
        if (p.nombre) setColectores.add(String(p.nombre).trim());
      });
    }

    const colectores = Array.from(setColectores)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    return NextResponse.json(colectores, {
      headers: {"Cache-Control": "public, s-maxage=300, stale-while-revalidate=600"},
    });
  } catch (error) {
    console.error("Error en colectores colecciones:", error);
    return NextResponse.json({error: "Error al obtener colectores"}, {status: 500});
  }
}
