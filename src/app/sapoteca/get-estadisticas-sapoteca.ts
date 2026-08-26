import {createServiceClient} from "@/utils/supabase/server";

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
 * Conteos en vivo de las cards de Biblioteca.
 * Científicas = Ecuador + tipo CIENTIFICA, sin tesis (la vista incluye ambos).
 */
export default async function getEstadisticasSapoteca(): Promise<EstadisticasSapoteca> {
  const supabase = createServiceClient();
  const añoActual = new Date().getFullYear();
  const añoInicioDecada = añoActual - 9;

  const {data: catDivulgacion} = await supabase
    .from("catalogo_publicaciones" as never)
    .select("id")
    .eq("tipo", "DIVULGACIÓN");
  const idsCatDivulgacion = ((catDivulgacion ?? []) as {id: number}[]).map((r) => r.id);

  // La vista incluye CIENTIFICA y TESIS. Las tesis se excluyen de estas cards
  // para que el número cuadre con la sección "Científica" del panel de filtros
  // (ninguna publicación tiene ambos tipos, así que restarlas es exacto).
  const {data: tesisRows} = await supabase
    .from("vw_publicacion_anfibios_ecuador" as never)
    .select("id_publicacion")
    .eq("tipo", "TESIS");
  const idsTesis = ((tesisRows ?? []) as unknown as {id_publicacion: number}[]).map(
    (r) => r.id_publicacion,
  );
  const listaTesis = idsTesis.length > 0 ? `(${idsTesis.join(",")})` : null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- el builder no está tipado para la vista
  const sinTesis = (q: any) =>
    listaTesis ? q.not("id_publicacion", "in", listaTesis) : q;

  const cientifica = () =>
    sinTesis(
      supabase
        .from("vw_publicacion_cientifica_ecuador" as never)
        .select("*", {count: "exact", head: true}),
    );

  const [
    cientificasRes,
    divulgacionRes,
    indexadasRes,
    noIndexadasRes,
    decadaRes,
    anioActualRes,
    taxonomiaRes,
    evolucionRes,
    ecologiaRes,
    conservacionRes,
    masCitadaResult,
    masRecienteResult,
  ] = await Promise.all([
    cientifica(),
    idsCatDivulgacion.length === 0
      ? Promise.resolve({count: 0})
      : supabase
          .from("publicacion")
          .select("id_publicacion, publicacion_catalogo_awe!inner(catalogo_publicaciones_id)", {
            count: "exact",
            head: true,
          })
          .eq("anfibios_ecuador", true)
          .in("publicacion_catalogo_awe.catalogo_publicaciones_id", idsCatDivulgacion),
    cientifica().eq("indexada", true),
    cientifica().or("indexada.eq.false,indexada.is.null"),
    cientifica()
      .gte("numero_publicacion_ano", añoInicioDecada)
      .lte("numero_publicacion_ano", añoActual),
    cientifica().eq("numero_publicacion_ano", añoActual),
    cientifica().eq("rel_taxonomia", true),
    cientifica().eq("rel_evolucion", true),
    cientifica().eq("rel_ecologia", true),
    cientifica().eq("rel_conservacion", true),
    sinTesis(
      supabase
        .from("vw_publicacion_cientifica_ecuador" as never)
        .select("id_publicacion, titulo, contador_citas"),
    )
      .gt("contador_citas", 0)
      .order("contador_citas", {ascending: false})
      .limit(1)
      .maybeSingle(),
    sinTesis(
      supabase
        .from("vw_publicacion_cientifica_ecuador" as never)
        .select("id_publicacion, titulo, numero_publicacion_ano, fecha"),
    )
      .order("numero_publicacion_ano", {ascending: false, nullsFirst: false})
      .order("fecha", {ascending: false, nullsFirst: false})
      .order("id_publicacion", {ascending: false})
      .limit(1)
      .maybeSingle(),
  ]);

  const totalUltimaDecada = decadaRes.count ?? 0;
  const promedioUltimaDecada =
    totalUltimaDecada > 0 ? Math.round(totalUltimaDecada / 10) : 0;

  const masCitada = masCitadaResult.data as {
    id_publicacion: number;
    titulo: string;
    contador_citas: number;
  } | null;
  const masReciente = masRecienteResult.data as {
    id_publicacion: number;
    titulo: string;
  } | null;

  const enlaceIds = [masCitada?.id_publicacion, masReciente?.id_publicacion].filter(
    Boolean,
  ) as number[];

  const enlacesMap = new Map<number, string>();

  if (enlaceIds.length > 0) {
    const {data: enlacesData} = await supabase
      .from("publicacion_enlace")
      .select("publicacion_id, enlace")
      .in("publicacion_id", enlaceIds)
      .neq("enlace", "")
      .neq("enlace", "http://")
      .not("enlace", "is", null)
      .order("id_publicacion_enlace", {ascending: true});

    for (const e of (enlacesData ?? []) as {publicacion_id: number; enlace: string}[]) {
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
    totalCientificas: cientificasRes.count ?? 0,
    totalDivulgacion: divulgacionRes.count ?? 0,
    totalIndexadas: indexadasRes.count ?? 0,
    totalNoIndexadas: noIndexadasRes.count ?? 0,
    promedioUltimaDecada,
    publicacionesAnioActual: anioActualRes.count ?? 0,
    totalTaxonomia: taxonomiaRes.count ?? 0,
    totalEvolucion: evolucionRes.count ?? 0,
    totalEcologia: ecologiaRes.count ?? 0,
    totalConservacion: conservacionRes.count ?? 0,
    publicacionMasCitada,
    publicacionCientificaMasReciente,
  };
}
