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

/** Tipos de catalogo_publicaciones que cuentan como "científicas" */
const TIPOS_CIENTIFICAS = new Set(["CIENTIFICA", "TESIS"]);

/** Tipo que cuenta como "divulgación" */
const TIPO_DIVULGACION = "DIVULGACIÓN";

/**
 * Obtiene las estadísticas de la biblioteca (solo publicaciones Ecuador).
 * Científicas/divulgación se basan en catalogo_publicaciones.tipo.
 */
export default async function getEstadisticasSapoteca(): Promise<EstadisticasSapoteca> {
  const supabase = createServiceClient();
  const añoActual = new Date().getFullYear();
  const hace10 = añoActual - 9;

  // Conteos por tipo de publicación (catalogo_publicaciones.tipo). PostgREST limita ~1000 filas; paginamos para traer todas.
  interface PcaRow {
    publicacion_id: number;
    catalogo_publicaciones: { tipo: string | null } | null;
    publicacion: { anfibios_ecuador: boolean | null } | null;
  }
  const idsCientificas = new Set<number>();
  const idsDivulgacion = new Set<number>();
  const pageSize = 1000;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data: pcaPage } = await supabase
      .from("publicacion_catalogo_awe")
      .select("publicacion_id, catalogo_publicaciones(tipo), publicacion(anfibios_ecuador)")
      .not("catalogo_publicaciones_id", "is", null)
      .range(offset, offset + pageSize - 1);

    const rows = (pcaPage ?? []) as unknown as PcaRow[];
    for (const r of rows) {
      if (r.publicacion?.anfibios_ecuador !== true) continue;

      const tipo = r.catalogo_publicaciones?.tipo ?? "";
      if (TIPOS_CIENTIFICAS.has(tipo)) idsCientificas.add(r.publicacion_id);
      if (tipo === TIPO_DIVULGACION) idsDivulgacion.add(r.publicacion_id);
    }
    hasMore = rows.length === pageSize;
    offset += pageSize;
  }

  const countCientificas = idsCientificas.size;
  const countDivulgacion = idsDivulgacion.size;

  // Estadísticas de las cards: solo publicaciones tipo CIENTÍFICA (usa vistas)
  const [
    { count: countIndexadas },
    { count: countNoIndexadas },
    { count: countUltimaDecada },
    { count: countAnioActual },
    { count: countTaxonomia },
    { count: countEvolucion },
    { count: countEcologia },
    { count: countConservacion },
    masCitadaResult,
    masRecienteResult,
  ] = await Promise.all([
    supabase
      .from("vw_publicacion_cientifica_ecuador" as any)
      .select("*", { count: "exact", head: true })
      .eq("indexada", true),
    supabase
      .from("vw_publicacion_cientifica_ecuador" as any)
      .select("*", { count: "exact", head: true })
      .or("indexada.eq.false,indexada.is.null"),
    supabase
      .from("vw_publicacion_cientifica_ecuador" as any)
      .select("*", { count: "exact", head: true })
      .gte("numero_publicacion_ano", hace10)
      .lte("numero_publicacion_ano", añoActual),
    supabase
      .from("vw_publicacion_cientifica_ecuador" as any)
      .select("*", { count: "exact", head: true })
      .eq("numero_publicacion_ano", añoActual),
    supabase
      .from("vw_publicacion_cientifica_ecuador" as any)
      .select("*", { count: "exact", head: true })
      .eq("rel_taxonomia", true),
    supabase
      .from("vw_publicacion_cientifica_ecuador" as any)
      .select("*", { count: "exact", head: true })
      .eq("rel_evolucion", true),
    supabase
      .from("vw_publicacion_cientifica_ecuador" as any)
      .select("*", { count: "exact", head: true })
      .eq("rel_ecologia", true),
    supabase
      .from("vw_publicacion_cientifica_ecuador" as any)
      .select("*", { count: "exact", head: true })
      .eq("rel_conservacion", true),
    supabase
      .from("vw_publicacion_cientifica_ecuador" as any)
      .select("id_publicacion, titulo, contador_citas")
      .gt("contador_citas", 0)
      .order("contador_citas", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("vw_publicacion_cientifica_ecuador" as any)
      .select("id_publicacion, titulo, numero_publicacion_ano, fecha")
      .order("numero_publicacion_ano", { ascending: false, nullsFirst: false })
      .limit(1)
      .single(),
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

  const masReciente = masRecienteResult.data as {
    id_publicacion: number;
    titulo: string | null;
  } | null;

  let publicacionCientificaMasReciente: PublicacionCientificaMasReciente | null = null;
  if (masReciente?.id_publicacion && masReciente?.titulo) {
    const { data: enlaceMasReciente } = await supabase
      .from("publicacion_enlace")
      .select("enlace")
      .eq("publicacion_id", masReciente.id_publicacion)
      .neq("enlace", "")
      .neq("enlace", "http://")
      .not("enlace", "is", null)
      .order("id_publicacion_enlace", { ascending: true })
      .limit(1)
      .single();

    publicacionCientificaMasReciente = {
      idPublicacion: masReciente.id_publicacion,
      titulo: masReciente.titulo,
      enlace: enlaceMasReciente?.enlace ?? null,
    };
  }

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
    publicacionCientificaMasReciente,
  };
}
