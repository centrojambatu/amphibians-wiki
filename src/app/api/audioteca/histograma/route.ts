import {NextResponse} from "next/server";

import {createServiceClient} from "@/utils/supabase/server";

export interface PuntoHistogramaColector {
  colector: string;
  cantidad: number;
}

export interface HistogramaCantos {
  puntos: PuntoHistogramaColector[];
  totalCantos: number;
  totalSinColector: number;
}

/**
 * Devuelve la distribución de cantos por colector (a partir de `canto.colector`).
 * Filtra por `publicar = true`.
 */
export async function GET() {
  const supabase = createServiceClient();

  try {
    const allRows: {colector: string | null}[] = [];
    const PAGE_SIZE = 1000;
    let offset = 0;

    while (true) {
      const {data, error} = await supabase
        .from("canto")
        .select("colector")
        .eq("publicar", true)
        .range(offset, offset + PAGE_SIZE - 1);
      if (error) throw error;
      if (!data || data.length === 0) break;
      allRows.push(...(data as {colector: string | null}[]));
      if (data.length < PAGE_SIZE) break;
      offset += PAGE_SIZE;
    }

    const counts = new Map<string, number>();
    let totalSinColector = 0;
    for (const r of allRows) {
      const v = (r.colector ?? "").trim();
      if (!v) {
        totalSinColector++;
        continue;
      }
      counts.set(v, (counts.get(v) ?? 0) + 1);
    }

    const puntos: PuntoHistogramaColector[] = Array.from(counts.entries())
      .map(([colector, cantidad]) => ({colector, cantidad}))
      .sort((a, b) => b.cantidad - a.cantidad);

    return NextResponse.json(
      {
        puntos,
        totalCantos: allRows.length,
        totalSinColector,
      } satisfies HistogramaCantos,
      {
        headers: {"Cache-Control": "public, s-maxage=300, stale-while-revalidate=600"},
      },
    );
  } catch (error) {
    console.error("Error en histograma audioteca:", error);
    return NextResponse.json({error: "Error al obtener histograma"}, {status: 500});
  }
}
