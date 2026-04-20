import { createServiceClient } from "@/utils/supabase/server";

export interface PublicacionMasCitada {
  idPublicacion: number;
  titulo: string;
  contadorCitas: number;
  enlace: string | null;
}

export interface PublicacionCientificaMasReciente {
  idPublicacion: number;
  titulo: string;
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
  publicacionCientificaMasReciente: PublicacionCientificaMasReciente | null;
}

/**
 * Obtiene las estadísticas de la biblioteca usando la vista materializada.
 * Una sola query para todos los conteos + 2 queries para más citada y más reciente.
 */
export default async function getEstadisticasSapoteca(): Promise<EstadisticasSapoteca> {
  const supabase = createServiceClient();

  // 3 queries en paralelo en vez de 12+ secuenciales
  const [statsResult, masCitadaResult, masRecienteResult] = await Promise.all([
    // 1. Todos los conteos desde la vista materializada (1 query)
    (supabase as any)
      .from("mv_sapoteca_stats")
      .select("*")
      .single(),
    // 2. Publicación más citada
    (supabase as any)
      .from("vw_publicacion_cientifica_ecuador")
      .select("id_publicacion, titulo, contador_citas")
      .gt("contador_citas", 0)
      .order("contador_citas", { ascending: false })
      .limit(1)
      .single(),
    // 3. Publicación más reciente
    (supabase as any)
      .from("vw_publicacion_cientifica_ecuador")
      .select("id_publicacion, titulo, numero_publicacion_ano, fecha")
      .order("numero_publicacion_ano", { ascending: false, nullsFirst: false })
      .limit(1)
      .single(),
  ]);

  const stats = statsResult.data as any;

  const totalUltimaDecada = stats?.total_ultima_decada ?? 0;
  const promedioUltimaDecada = totalUltimaDecada > 0 ? Math.round(totalUltimaDecada / 10) : 0;

  // Obtener enlaces para más citada y más reciente en paralelo
  const masCitada = masCitadaResult.data as { id_publicacion: number; titulo: string; contador_citas: number } | null;
  const masReciente = masRecienteResult.data as { id_publicacion: number; titulo: string } | null;

  const enlaceIds = [masCitada?.id_publicacion, masReciente?.id_publicacion].filter(Boolean) as number[];

  let enlacesMap = new Map<number, string>();
  if (enlaceIds.length > 0) {
    const { data: enlacesData } = await supabase
      .from("publicacion_enlace")
      .select("publicacion_id, enlace")
      .in("publicacion_id", enlaceIds)
      .neq("enlace", "")
      .neq("enlace", "http://")
      .not("enlace", "is", null)
      .order("id_publicacion_enlace", { ascending: true });

    for (const e of (enlacesData ?? []) as { publicacion_id: number; enlace: string }[]) {
      if (!enlacesMap.has(e.publicacion_id)) enlacesMap.set(e.publicacion_id, e.enlace);
    }
  }

  let publicacionMasCitada: PublicacionMasCitada | null = null;
  if (masCitada?.titulo && masCitada?.contador_citas) {
    publicacionMasCitada = {
      idPublicacion: masCitada.id_publicacion,
      titulo: masCitada.titulo,
      contadorCitas: masCitada.contador_citas,
      enlace: enlacesMap.get(masCitada.id_publicacion) ?? null,
    };
  }

  let publicacionCientificaMasReciente: PublicacionCientificaMasReciente | null = null;
  if (masReciente?.id_publicacion && masReciente?.titulo) {
    publicacionCientificaMasReciente = {
      idPublicacion: masReciente.id_publicacion,
      titulo: masReciente.titulo,
      enlace: enlacesMap.get(masReciente.id_publicacion) ?? null,
    };
  }

  return {
    totalCientificas: stats?.total_cientificas ?? 0,
    totalDivulgacion: stats?.total_divulgacion ?? 0,
    totalIndexadas: stats?.total_indexadas ?? 0,
    totalNoIndexadas: stats?.total_no_indexadas ?? 0,
    promedioUltimaDecada,
    publicacionesAnioActual: stats?.publicaciones_anio_actual ?? 0,
    totalTaxonomia: stats?.total_taxonomia ?? 0,
    totalEvolucion: stats?.total_evolucion ?? 0,
    totalEcologia: stats?.total_ecologia ?? 0,
    totalConservacion: stats?.total_conservacion ?? 0,
    publicacionMasCitada,
    publicacionCientificaMasReciente,
  };
}
