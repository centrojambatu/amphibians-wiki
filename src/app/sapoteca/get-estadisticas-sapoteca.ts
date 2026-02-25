import { createServiceClient } from "@/utils/supabase/server";

export interface EstadisticasSapoteca {
  totalCientificas: number;
  totalDivulgacion: number;
  totalIndexadas: number;
  totalNoIndexadas: number;
  promedioUltimaDecada: number;
  publicacionesAnioActual: number;
}

/**
 * Obtiene las estadísticas de la biblioteca (solo publicaciones Ecuador).
 */
export default async function getEstadisticasSapoteca(): Promise<EstadisticasSapoteca> {
  const supabase = createServiceClient();
  const añoActual = new Date().getFullYear();
  const hace10 = añoActual - 9;

  const [
    { count: countCientificas },
    { count: countDivulgacion },
    { count: countIndexadas },
    { count: countNoIndexadas },
    { count: countUltimaDecada },
    { count: countAnioActual },
  ] = await Promise.all([
    supabase
      .from("publicacion")
      .select("*", { count: "exact", head: true })
      .eq("anfibios_ecuador", true)
      .eq("cientifica", true),
    supabase
      .from("publicacion")
      .select("*", { count: "exact", head: true })
      .eq("anfibios_ecuador", true)
      .or("cientifica.eq.false,cientifica.is.null"),
    supabase
      .from("publicacion")
      .select("*", { count: "exact", head: true })
      .eq("anfibios_ecuador", true)
      .eq("indexada", true),
    supabase
      .from("publicacion")
      .select("*", { count: "exact", head: true })
      .eq("anfibios_ecuador", true)
      .or("indexada.eq.false,indexada.is.null"),
    supabase
      .from("publicacion")
      .select("*", { count: "exact", head: true })
      .eq("anfibios_ecuador", true)
      .gte("numero_publicacion_ano", hace10)
      .lte("numero_publicacion_ano", añoActual),
    supabase
      .from("publicacion")
      .select("*", { count: "exact", head: true })
      .eq("anfibios_ecuador", true)
      .eq("numero_publicacion_ano", añoActual),
  ]);

  const totalUltimaDecada = countUltimaDecada ?? 0;
  const promedioUltimaDecada = totalUltimaDecada > 0 ? Math.round(totalUltimaDecada / 10) : 0;

  return {
    totalCientificas: countCientificas ?? 0,
    totalDivulgacion: countDivulgacion ?? 0,
    totalIndexadas: countIndexadas ?? 0,
    totalNoIndexadas: countNoIndexadas ?? 0,
    promedioUltimaDecada,
    publicacionesAnioActual: countAnioActual ?? 0,
  };
}
