import {NextResponse} from "next/server";

import {createServiceClient} from "@/utils/supabase/server";

export interface PuntoHistogramaAutorFoto {
  autor: string;
  cantidad: number;
}

export interface HistogramaFotos {
  puntos: PuntoHistogramaAutorFoto[];
  totalFotos: number;
  totalSinAutor: number;
}

/**
 * Devuelve la distribución de fotografías por autor (a partir de `fotografia.autor`).
 * Filtra por `publicar = true`.
 */
export async function GET() {
  const supabase = createServiceClient();

  try {
    const allRows: {autor: string | null}[] = [];
    const PAGE_SIZE = 1000;
    let offset = 0;

    while (true) {
      const {data, error} = await supabase
        .from("fotografia")
        .select("autor")
        .eq("publicar", true)
        .range(offset, offset + PAGE_SIZE - 1);
      if (error) throw error;
      if (!data || data.length === 0) break;
      allRows.push(...(data as {autor: string | null}[]));
      if (data.length < PAGE_SIZE) break;
      offset += PAGE_SIZE;
    }

    const counts = new Map<string, number>();
    let totalSinAutor = 0;
    for (const r of allRows) {
      const v = (r.autor ?? "").trim();
      if (!v) {
        totalSinAutor++;
        continue;
      }
      counts.set(v, (counts.get(v) ?? 0) + 1);
    }

    const puntos: PuntoHistogramaAutorFoto[] = Array.from(counts.entries())
      .map(([autor, cantidad]) => ({autor, cantidad}))
      .sort((a, b) => b.cantidad - a.cantidad);

    return NextResponse.json(
      {
        puntos,
        totalFotos: allRows.length,
        totalSinAutor,
      } satisfies HistogramaFotos,
      {
        headers: {"Cache-Control": "public, s-maxage=300, stale-while-revalidate=600"},
      },
    );
  } catch (error) {
    console.error("Error en histograma fototeca:", error);
    return NextResponse.json({error: "Error al obtener histograma"}, {status: 500});
  }
}
