import type {ColeccionCompleta} from "../get-colecciones-especie";

import {createServiceClient} from "@/utils/supabase/server";

const ITEMS_POR_PAGINA = 100;

export interface ColeccionItem extends ColeccionCompleta {
  fuente: "coleccion";
  publicacion_id: number | null;
  cita_corta: string | null;
  tiene_muestras: boolean;
  tiene_multimedia: boolean;
  tiene_adn: boolean;
}

export interface ColeccionesPaginadas {
  colecciones: ColeccionItem[];
  total: number;
  totalPaginas: number;
  paginaActual: number;
}

export default async function getColeccionesPaginadas(
  taxonId: number,
  pagina: number = 1,
): Promise<ColeccionesPaginadas> {
  const supabaseClient = createServiceClient();

  const SELECT_FIELDS = `id_coleccion, taxon_id, num_colector, sc, gui, numero_museo, catalogo_museo,
    sc_acronimo, sc_numero, sc_sufijo, estatus_identificacion, identificado_por,
    fecha_identifica, estadio, numero_individuos, sexo, estado, svl, peso, estatus_tipo,
    fecha_col, hora, colectores, localidad, latitud, longitud, elevacion, habitat, observacion, publicar,
    esqueleto_transparentacion, microfotografia, genbank,
    geopolitica!coleccion_provincia_id_fkey(nombre),
    campobase!coleccion_campobase_id_fkey(nombre, localidad),
    personal!coleccion_personal_id_fkey(nombre, siglas),
    taxon!coleccion_taxon_id_fkey(taxon)`;

  const from = (pagina - 1) * ITEMS_POR_PAGINA;
  const to = from + ITEMS_POR_PAGINA - 1;

  const {data, error, count} = await supabaseClient
    .from("coleccion")
    .select(SELECT_FIELDS, {count: "exact"})
    .eq("taxon_id", taxonId)
    .eq("publicar", true)
    .order("fecha_col", {ascending: false, nullsFirst: false})
    .order("id_coleccion", {ascending: false})
    .range(from, to);

  if (error) console.error("Error fetch colecciones:", error);

  const colecciones: ColeccionItem[] = (data ?? []).map((c: any) => ({
    fuente: "coleccion" as const,
    publicacion_id: null,
    cita_corta: null,
    tiene_muestras: Boolean(c.esqueleto_transparentacion || c.microfotografia),
    tiene_multimedia: false,
    tiene_adn: Boolean(c.genbank),
    id_coleccion: c.id_coleccion,
    taxon_id: c.taxon_id,
    num_colector: c.num_colector,
    sc: c.sc,
    gui: c.gui,
    num_museo: c.numero_museo,
    catalogo_museo: c.catalogo_museo ?? null,
    sc_acronimo: c.sc_acronimo,
    sc_numero: c.sc_numero,
    sc_sufijo: c.sc_sufijo,
    estatus_identificacion: c.estatus_identificacion,
    taxon_nombre: null,
    identificado_por: c.identificado_por,
    fecha_identifica: c.fecha_identifica,
    estadio: c.estadio,
    numero_individuos: c.numero_individuos,
    sexo: c.sexo,
    estado: c.estado,
    svl: c.svl,
    peso: c.peso,
    estatus_tipo: c.estatus_tipo,
    fecha_coleccion: c.fecha_col ?? null,
    hora: c.hora,
    colectores: c.colectores,
    provincia: c.geopolitica?.nombre ?? null,
    detalle_localidad: c.localidad,
    latitud: c.latitud,
    longitud: c.longitud,
    altitud: c.elevacion,
    habitat: c.habitat,
    observacion: c.observacion,
    campobase_nombre: c.campobase?.nombre ?? null,
    campobase_localidad: c.campobase?.localidad ?? null,
    personal_nombre: c.personal?.nombre ?? null,
    personal_siglas: c.personal?.siglas ?? null,
    taxon_nombre_cientifico: c.taxon?.taxon ?? null,
  }));

  const total = count ?? colecciones.length;
  const totalPaginas = Math.max(1, Math.ceil(total / ITEMS_POR_PAGINA));

  const coleccionIds = colecciones.map((c) => c.id_coleccion);

  if (coleccionIds.length > 0) {
    const [
      {data: vids},
      {data: fotos},
      {data: cantos},
      {data: tejs},
      {data: esps},
      {data: hecs},
      {data: epls},
    ] = await Promise.all([
      supabaseClient.from("video").select("coleccion_id").in("coleccion_id", coleccionIds).limit(100000),
      supabaseClient.from("fotografia").select("coleccion_id").in("coleccion_id", coleccionIds).limit(100000),
      supabaseClient.from("canto").select("coleccion_id").in("coleccion_id", coleccionIds).limit(100000),
      supabaseClient.from("tejido").select("coleccion_id").in("coleccion_id", coleccionIds).limit(100000),
      supabaseClient.from("esperma").select("coleccion_id").in("coleccion_id", coleccionIds).limit(100000),
      supabaseClient.from("heces").select("coleccion_id").in("coleccion_id", coleccionIds).limit(100000),
      supabaseClient.from("extracto_piel").select("coleccion_id").in("coleccion_id", coleccionIds).limit(100000),
    ]);

    const multimediaSet = new Set<number>();
    const muestrasSet = new Set<number>();
    [vids, fotos, cantos].forEach((arr) =>
      (arr || []).forEach((r: any) => {
        if (r.coleccion_id != null) multimediaSet.add(r.coleccion_id as number);
      }),
    );
    [tejs, esps, hecs, epls].forEach((arr) =>
      (arr || []).forEach((r: any) => {
        if (r.coleccion_id != null) muestrasSet.add(r.coleccion_id as number);
      }),
    );

    colecciones.forEach((c) => {
      c.tiene_multimedia = multimediaSet.has(c.id_coleccion);
      c.tiene_muestras = c.tiene_muestras || muestrasSet.has(c.id_coleccion);
    });
  }

  return {colecciones, total, totalPaginas, paginaActual: pagina};
}
