import { createServiceClient } from "@/utils/supabase/server";

export interface PuntoHistograma {
  año: number;
  cantidad: number;
}

export interface DatosHistograma {
  puntos: PuntoHistograma[];
  totalPublicaciones: number;
}

const AÑO_INICIO = 1849;

/**
 * Obtiene el número de publicaciones por año (solo Ecuador) desde 1849 hasta el año actual.
 * Devuelve también el conteo de publicaciones únicas (no la suma de pares año-publicación).
 */
export default async function getHistogramaPublicaciones(): Promise<DatosHistograma> {
  const supabase = createServiceClient();
  const añoActual = new Date().getFullYear();

  // Conteo real de publicaciones únicas de Ecuador
  const { count: totalPublicaciones } = await supabase
    .from("publicacion")
    .select("*", { count: "exact", head: true })
    .eq("anfibios_ecuador", true);

  // Intentar primero la vista (más eficiente)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- vista puede no estar en tipos
  const { data: viewData, error: viewError } = await supabase
    .from("vw_publicaciones_ecuador_por_ano" as any)
    .select("ano, cantidad");

  if (!viewError && viewData && viewData.length > 0) {
    const countsByYear = new Map<number, number>();
    for (const row of viewData as { ano: number; cantidad: number }[]) {
      const año = Number(row.ano);
      if (año >= AÑO_INICIO && año <= añoActual) {
        countsByYear.set(año, row.cantidad ?? 0);
      }
    }
    return {
      puntos: rellenarRango(AÑO_INICIO, añoActual, countsByYear),
      totalPublicaciones: totalPublicaciones ?? 0,
    };
  }

  // Fallback: obtener IDs de publicaciones Ecuador y luego publicacion_ano por lotes
  const idsEcuador: number[] = [];
  const pageSize = 500;
  let page = 0;
  while (true) {
    const { data: idsData } = await supabase
      .from("publicacion")
      .select("id_publicacion")
      .eq("anfibios_ecuador", true)
      .range(page * pageSize, (page + 1) * pageSize - 1);
    const batch = idsData ?? [];
    batch.forEach((r: { id_publicacion: number }) => idsEcuador.push(r.id_publicacion));
    if (batch.length < pageSize) break;
    page++;
  }

  const countsByYear = new Map<number, number>();
  for (let i = 0; i < idsEcuador.length; i += pageSize) {
    const chunk = idsEcuador.slice(i, i + pageSize);
    const { data: anosData } = await supabase
      .from("publicacion_ano")
      .select("ano")
      .in("publicacion_id", chunk)
      .gte("ano", AÑO_INICIO)
      .lte("ano", añoActual);
    const rows = anosData ?? [];
    for (const r of rows as { ano: number }[]) {
      const año = Number(r.ano);
      countsByYear.set(año, (countsByYear.get(año) ?? 0) + 1);
    }
  }

  return {
    puntos: rellenarRango(AÑO_INICIO, añoActual, countsByYear),
    totalPublicaciones: totalPublicaciones ?? idsEcuador.length,
  };
}

function rellenarRango(
  desde: number,
  hasta: number,
  countsByYear: Map<number, number>,
): PuntoHistograma[] {
  const puntos: PuntoHistograma[] = [];
  for (let año = desde; año <= hasta; año++) {
    puntos.push({
      año,
      cantidad: countsByYear.get(año) ?? 0,
    });
  }
  return puntos;
}
