import { createServiceClient } from "@/utils/supabase/server";

export interface PublicacionMasCitada {
  idPublicacion: number;
  titulo: string;
  contadorCitas: number;
  enlace: string | null;
}

export interface EstadisticasSapoteca {
  totalCientificas: number;
  totalDivulgacion: number;
  totalIndexadas: number;
  totalNoIndexadas: number;
  promedioUltimaDecada: number;
  publicacionesAnioActual: number;
  totalTaxonomia: number;
  totalEvolucion: number;
  totalEcologia: number;
  totalConservacion: number;
  publicacionMasCitada: PublicacionMasCitada | null;
  totalAutoresEcuador: number;
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
    { count: countTaxonomia },
    { count: countEvolucion },
    { count: countEcologia },
    { count: countConservacion },
    masCitadaResult,
    totalAutoresEcuadorResult,
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
    supabase
      .from("publicacion")
      .select("*", { count: "exact", head: true })
      .eq("anfibios_ecuador", true)
      .eq("rel_taxonomia", true),
    supabase
      .from("publicacion")
      .select("*", { count: "exact", head: true })
      .eq("anfibios_ecuador", true)
      .eq("rel_evolucion", true),
    supabase
      .from("publicacion")
      .select("*", { count: "exact", head: true })
      .eq("anfibios_ecuador", true)
      .eq("rel_ecologia", true),
    supabase
      .from("publicacion")
      .select("*", { count: "exact", head: true })
      .eq("anfibios_ecuador", true)
      .eq("rel_conservacion", true),
    supabase
      .from("publicacion")
      .select("id_publicacion, titulo, contador_citas")
      .gt("contador_citas", 0)
      .order("contador_citas", { ascending: false })
      .limit(1)
      .single(),
    supabase.from("vw_total_autores_ecuador" as any).select("total").single(),
  ]);

  const totalUltimaDecada = countUltimaDecada ?? 0;
  const promedioUltimaDecada = totalUltimaDecada > 0 ? Math.round(totalUltimaDecada / 10) : 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- contador_citas no está en tipos generados
  const masCitada = masCitadaResult.data as {
    id_publicacion: number; titulo: string; contador_citas: number;
  } | null;

  let publicacionMasCitada: PublicacionMasCitada | null = null;
  if (masCitada?.titulo && masCitada?.contador_citas) {
    const { data: enlaceData } = await supabase
      .from("publicacion_enlace")
      .select("enlace")
      .eq("publicacion_id", masCitada.id_publicacion)
      .neq("enlace", "")
      .neq("enlace", "http://")
      .not("enlace", "is", null)
      .order("id_publicacion_enlace", { ascending: true })
      .limit(1)
      .single();

    publicacionMasCitada = {
      idPublicacion: masCitada.id_publicacion,
      titulo: masCitada.titulo,
      contadorCitas: masCitada.contador_citas,
      enlace: enlaceData?.enlace ?? null,
    };
  }

  const totalAutoresEcuador =
    (totalAutoresEcuadorResult.data as { total: number } | null)?.total ?? 0;

  return {
    totalCientificas: countCientificas ?? 0,
    totalDivulgacion: countDivulgacion ?? 0,
    totalIndexadas: countIndexadas ?? 0,
    totalNoIndexadas: countNoIndexadas ?? 0,
    promedioUltimaDecada,
    publicacionesAnioActual: countAnioActual ?? 0,
    totalTaxonomia: countTaxonomia ?? 0,
    totalEvolucion: countEvolucion ?? 0,
    totalEcologia: countEcologia ?? 0,
    totalConservacion: countConservacion ?? 0,
    publicacionMasCitada,
    totalAutoresEcuador,
  };
}
