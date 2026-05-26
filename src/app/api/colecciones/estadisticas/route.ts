import {NextResponse} from "next/server";

import {createServiceClient} from "@/utils/supabase/server";

export async function GET() {
  const supabase = createServiceClient();

  try {
    const [
      {count: totalRegistros},
      {data: registrosBase},
    ] = await Promise.all([
      supabase
        .from("coleccion")
        .select("id_coleccion", {count: "exact", head: true})
        .eq("publicar", true),
      supabase
        .from("coleccion")
        .select(
          "taxon_id, colectores, personal_id, provincia_id, localidad, fecha_col",
        )
        .eq("publicar", true)
        .limit(200000),
    ]);

    const taxonSet = new Set<number>();
    const colectorSet = new Set<string>();
    const personalIds = new Set<number>();
    const localidadSet = new Set<string>();
    const provinciaIds = new Set<number>();
    let yearMin: number | null = null;
    let yearMax: number | null = null;

    (registrosBase || []).forEach((r: any) => {
      if (r.taxon_id != null) taxonSet.add(r.taxon_id as number);
      if (r.colectores) colectorSet.add(String(r.colectores).trim());
      if (r.personal_id != null) personalIds.add(r.personal_id as number);
      if (r.localidad) localidadSet.add(String(r.localidad).trim());
      if (r.provincia_id != null) provinciaIds.add(r.provincia_id as number);
      if (r.fecha_col) {
        const y = Number((r.fecha_col as string).slice(0, 4));
        if (Number.isFinite(y)) {
          if (yearMin == null || y < yearMin) yearMin = y;
          if (yearMax == null || y > yearMax) yearMax = y;
        }
      }
    });

    // Sumar nombres de personal a colectores únicos
    if (personalIds.size > 0) {
      const {data: pers} = await supabase
        .from("personal")
        .select("nombre")
        .in("id_personal", Array.from(personalIds))
        .limit(100000);
      (pers || []).forEach((p: any) => {
        if (p.nombre) colectorSet.add(String(p.nombre).trim());
      });
    }

    // Sumar nombres de provincia a localidades únicas
    if (provinciaIds.size > 0) {
      const {data: provs} = await supabase
        .from("geopolitica")
        .select("nombre")
        .in("id_geopolitica", Array.from(provinciaIds))
        .limit(100000);
      (provs || []).forEach((p: any) => {
        if (p.nombre) localidadSet.add(String(p.nombre).trim());
      });
    }

    return NextResponse.json({
      total_registros: totalRegistros ?? 0,
      total_especies: taxonSet.size,
      total_colectores: colectorSet.size,
      total_localidades: localidadSet.size,
      anio_min: yearMin,
      anio_max: yearMax,
    });
  } catch (error) {
    console.error("Error en estadisticas colecciones:", error);
    return NextResponse.json({error: "Error al obtener estadísticas"}, {status: 500});
  }
}
