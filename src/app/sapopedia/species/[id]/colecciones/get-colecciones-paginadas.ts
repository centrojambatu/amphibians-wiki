import type {ColeccionCompleta} from "../get-colecciones-especie";

import {createServiceClient} from "@/utils/supabase/server";

const ITEMS_POR_PAGINA = 40;

export type FuenteColeccion = "coleccion" | "coleccion_externa";

export interface ColeccionItem extends ColeccionCompleta {
  fuente: FuenteColeccion;
  publicacion_id: number | null;
  cita_corta: string | null;
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
    geopolitica!coleccion_provincia_id_fkey(nombre),
    campobase!coleccion_campobase_id_fkey(nombre, localidad),
    personal!coleccion_personal_id_fkey(nombre, siglas),
    taxon!coleccion_taxon_id_fkey(taxon)`;

  const EXTERNA_SELECT = `id, taxon_id, provincia_id, localidad, catalogo_museo, numero_museo,
    latitud, longitud, elevacion, fecha, colectores, tipo, publicar, publicacion_id,
    geopolitica:provincia_id(nombre),
    publicacion:publicacion_id(id_publicacion, cita_corta)`;

  const [internas, externas] = await Promise.all([
    supabaseClient
      .from("coleccion")
      .select(SELECT_FIELDS)
      .eq("taxon_id", taxonId)
      .eq("publicar", true)
      .order("fecha_col", {ascending: false, nullsFirst: false})
      .order("id_coleccion", {ascending: false})
      .limit(50000),
    supabaseClient
      .from("coleccion_externa")
      .select(EXTERNA_SELECT)
      .eq("taxon_id", taxonId)
      .eq("publicar", true)
      .order("fecha", {ascending: false, nullsFirst: false})
      .order("id", {ascending: false})
      .limit(50000),
  ]);

  if (internas.error) console.error("Error fetch colecciones:", internas.error);
  if (externas.error) console.error("Error fetch colecciones_externa:", externas.error);

  const internasMapped: ColeccionItem[] = (internas.data ?? []).map((c: any) => ({
    fuente: "coleccion" as const,
    publicacion_id: null,
    cita_corta: null,
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

  const externasMapped: ColeccionItem[] = (externas.data ?? []).map((c: any) => ({
    fuente: "coleccion_externa" as const,
    publicacion_id: c.publicacion?.id_publicacion ?? c.publicacion_id ?? null,
    cita_corta: c.publicacion?.cita_corta ?? null,
    id_coleccion: c.id,
    taxon_id: c.taxon_id,
    num_colector: null,
    sc: null,
    gui: null,
    num_museo: c.numero_museo,
    catalogo_museo: c.catalogo_museo ?? null,
    sc_acronimo: null,
    sc_numero: null,
    sc_sufijo: null,
    estatus_identificacion: null,
    taxon_nombre: null,
    identificado_por: null,
    fecha_identifica: null,
    estadio: null,
    numero_individuos: null,
    sexo: null,
    estado: null,
    svl: null,
    peso: null,
    estatus_tipo: c.tipo ?? null,
    fecha_coleccion: c.fecha ?? null,
    hora: null,
    colectores: c.colectores,
    provincia: c.geopolitica?.nombre ?? null,
    detalle_localidad: c.localidad,
    latitud: c.latitud,
    longitud: c.longitud,
    altitud: c.elevacion,
    habitat: null,
    observacion: null,
    campobase_nombre: null,
    campobase_localidad: null,
    personal_nombre: null,
    personal_siglas: null,
    taxon_nombre_cientifico: null,
  }));

  // Merge + sort por fecha desc (con null al final) y id desc como tiebreaker
  const combined = [...internasMapped, ...externasMapped].sort((a, b) => {
    const af = a.fecha_coleccion ? new Date(a.fecha_coleccion).getTime() : 0;
    const bf = b.fecha_coleccion ? new Date(b.fecha_coleccion).getTime() : 0;

    if (af !== bf) return bf - af;
    // Mismo fecha → coleccion antes que externa
    if (a.fuente !== b.fuente) return a.fuente === "coleccion" ? -1 : 1;

    return b.id_coleccion - a.id_coleccion;
  });

  const total = combined.length;
  const totalPaginas = Math.max(1, Math.ceil(total / ITEMS_POR_PAGINA));
  const inicio = (pagina - 1) * ITEMS_POR_PAGINA;
  const colecciones = combined.slice(inicio, inicio + ITEMS_POR_PAGINA);

  return {colecciones, total, totalPaginas, paginaActual: pagina};
}
