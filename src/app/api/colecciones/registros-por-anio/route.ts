import {NextResponse} from "next/server";

import {createServiceClient} from "@/utils/supabase/server";

export interface RegistrosPorAnioResponse {
  puntos: {anio: number; count: number}[];
  totalConFecha: number;
  totalSinFecha: number;
}

export async function GET() {
  const supabase = createServiceClient();

  try {
    const PAGE_SIZE = 1000;
    const allRows: {fecha_col: string}[] = [];
    let offset = 0;

    while (true) {
      const {data, error} = await supabase
        .from("coleccion")
        .select("fecha_col")
        .eq("publicar", true)
        .not("fecha_col", "is", null)
        .range(offset, offset + PAGE_SIZE - 1);

      if (error) throw error;
      if (!data || data.length === 0) break;
      allRows.push(...(data as {fecha_col: string}[]));
      if (data.length < PAGE_SIZE) break;
      offset += PAGE_SIZE;
    }

    const {count: totalPublicados} = await supabase
      .from("coleccion")
      .select("id_coleccion", {count: "exact", head: true})
      .eq("publicar", true);

    const counts = new Map<number, number>();
    let totalConFecha = 0;

    for (const r of allRows) {
      const y = Number(String(r.fecha_col).slice(0, 4));
      if (!Number.isFinite(y)) continue;
      counts.set(y, (counts.get(y) ?? 0) + 1);
      totalConFecha++;
    }

    const totalSinFecha = Math.max(0, (totalPublicados ?? 0) - totalConFecha);

    const years = Array.from(counts.keys()).sort((a, b) => a - b);
    const puntos: {anio: number; count: number}[] = [];

    if (years.length > 0) {
      const minYear = years[0];
      const maxYear = years[years.length - 1];

      for (let y = minYear; y <= maxYear; y++) {
        puntos.push({anio: y, count: counts.get(y) ?? 0});
      }
    }

    return NextResponse.json(
      {puntos, totalConFecha, totalSinFecha} satisfies RegistrosPorAnioResponse,
      {headers: {"Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200"}},
    );
  } catch (error) {
    console.error("Error en registros-por-anio:", error);
    return NextResponse.json(
      {puntos: [], totalConFecha: 0, totalSinFecha: 0},
      {status: 500},
    );
  }
}
