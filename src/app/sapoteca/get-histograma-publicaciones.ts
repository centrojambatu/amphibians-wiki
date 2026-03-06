import { createServiceClient } from "@/utils/supabase/server";

export interface PuntoHistograma {
  año: number;
  cantidad: number;
}

export interface DatosHistograma {
  puntos: PuntoHistograma[];
  totalPublicaciones: number;
}

/** Límite inferior razonable para años (evita datos erróneos). */
const AÑO_MIN_SANE = 1000;

/**
 * Obtiene el número de publicaciones científicas por año (solo Ecuador, tipo CIENTIFICA/TESIS).
 * Coincide con la tarjeta "Publicaciones científicas" (944 total).
 */
export default async function getHistogramaPublicaciones(): Promise<DatosHistograma> {
  const supabase = createServiceClient();
  const añoActual = new Date().getFullYear();

  // Total de publicaciones científicas (mismo número que la tarjeta "Publicaciones científicas")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- vista puede no estar en tipos
  const { count: totalPublicaciones } = await supabase
    .from("vw_publicacion_cientifica_ecuador" as any)
    .select("*", { count: "exact", head: true });

  // Años por publicación para armar el histograma (solo con año válido)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- vista puede no estar en tipos
  const { data: rows, error } = await supabase
    .from("vw_publicacion_cientifica_ecuador" as any)
    .select("numero_publicacion_ano")
    .not("numero_publicacion_ano", "is", null)
    .gte("numero_publicacion_ano", AÑO_MIN_SANE)
    .lte("numero_publicacion_ano", añoActual)
    .range(0, 1999);

  if (error) {
    const añoInicio = 1849;
    return {
      puntos: rellenarRango(añoInicio, añoActual, new Map()),
      totalPublicaciones: totalPublicaciones ?? 0,
    };
  }

  const countsByYear = new Map<number, number>();
  if (rows?.length) {
    for (const row of rows as { numero_publicacion_ano: number }[]) {
      const año = Number(row.numero_publicacion_ano);
      if (año >= AÑO_MIN_SANE && año <= añoActual) {
        countsByYear.set(año, (countsByYear.get(año) ?? 0) + 1);
      }
    }
  }

  const añoInicio =
    countsByYear.size > 0 ? Math.min(...countsByYear.keys()) : añoActual;
  return {
    puntos: rellenarRango(añoInicio, añoActual, countsByYear),
    totalPublicaciones: totalPublicaciones ?? 0,
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
