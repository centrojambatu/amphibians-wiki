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

/** PostgREST recorta a ~1000 filas por request; hay que paginar. */
const PAGE_SIZE = 1000;

/**
 * Obtiene el número de publicaciones científicas por año (solo Ecuador, tipo CIENTIFICA/TESIS).
 * Coincide con la tarjeta "Publicaciones científicas".
 */
export default async function getHistogramaPublicaciones(): Promise<DatosHistograma> {
  const supabase = createServiceClient();
  const añoActual = new Date().getFullYear();

  // La vista incluye CIENTIFICA y TESIS; las tesis se excluyen para que el
  // histograma y su total cuadren con la card "Publicaciones científicas".
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- vista puede no estar en tipos
  const { data: tesisRows } = await supabase
    .from("vw_publicacion_anfibios_ecuador" as any)
    .select("id_publicacion")
    .eq("tipo", "TESIS");
  const idsTesis = ((tesisRows ?? []) as unknown as { id_publicacion: number }[]).map(
    (r) => r.id_publicacion,
  );
  const listaTesis = idsTesis.length > 0 ? `(${idsTesis.join(",")})` : null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- el builder no está tipado para la vista
  const sinTesis = (q: any) =>
    listaTesis ? q.not("id_publicacion", "in", listaTesis) : q;

  const { count: totalPublicaciones } = await sinTesis(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- vista puede no estar en tipos
    supabase
      .from("vw_publicacion_cientifica_ecuador" as any)
      .select("*", { count: "exact", head: true }),
  );

  const countsByYear = new Map<number, number>();
  let offset = 0;

  while (true) {
    const { data: rows, error } = await sinTesis(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- vista puede no estar en tipos
      supabase
        .from("vw_publicacion_cientifica_ecuador" as any)
        .select("id_publicacion, numero_publicacion_ano"),
    )
      .not("numero_publicacion_ano", "is", null)
      .gte("numero_publicacion_ano", AÑO_MIN_SANE)
      .lte("numero_publicacion_ano", añoActual)
      .order("id_publicacion", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      const añoInicio = 1849;
      return {
        puntos: rellenarRango(añoInicio, añoActual, new Map()),
        totalPublicaciones: totalPublicaciones ?? 0,
      };
    }

    if (!rows?.length) break;

    for (const row of rows as unknown as { numero_publicacion_ano: number }[]) {
      const año = Number(row.numero_publicacion_ano);
      if (año >= AÑO_MIN_SANE && año <= añoActual) {
        countsByYear.set(año, (countsByYear.get(año) ?? 0) + 1);
      }
    }

    if (rows.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
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
