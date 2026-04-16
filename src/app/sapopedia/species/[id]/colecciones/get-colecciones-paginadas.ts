import type {ColeccionCompleta} from "../get-colecciones-especie";

import {createServiceClient} from "@/utils/supabase/server";

const ITEMS_POR_PAGINA = 40;

export interface ColeccionesPaginadas {
  colecciones: ColeccionCompleta[];
  total: number;
  totalPaginas: number;
  paginaActual: number;
}

export default async function getColeccionesPaginadas(
  taxonId: number,
  pagina: number = 1,
): Promise<ColeccionesPaginadas> {
  const supabaseClient = createServiceClient();

  const inicio = (pagina - 1) * ITEMS_POR_PAGINA;
  const fin = inicio + ITEMS_POR_PAGINA - 1;

  const SELECT_FIELDS = `id_coleccion, taxon_id, num_colector, sc, gui, numero_museo, catalogo_museo,
    sc_acronimo, sc_numero, sc_sufijo, estatus_identificacion, taxon_nombre, identificado_por,
    fecha_identifica, estadio, numero_individuos, sexo, estado, svl, peso, estatus_tipo,
    fecha_col, hora, colectores, localidad, latitud, longitud, elevacion, habitat, observacion, publicar,
    geopolitica!coleccion_provincia_id_fkey(nombre),
    campobase!coleccion_campobase_id_fkey(nombre, localidad),
    personal!coleccion_personal_id_fkey(nombre, siglas),
    taxon!coleccion_taxon_id_fkey(taxon)`;

  const [countResult, dataResult] = await Promise.all([
    supabaseClient
      .from("coleccion")
      .select("id_coleccion", {count: "exact", head: true})
      .eq("taxon_id", taxonId)
      .eq("publicar", true),
    supabaseClient
      .from("coleccion")
      .select(SELECT_FIELDS)
      .eq("taxon_id", taxonId)
      .eq("publicar", true)
      .order("fecha_col", {ascending: false, nullsFirst: false})
      .order("id_coleccion", {ascending: false})
      .range(inicio, fin),
  ]);

  if (countResult.error) console.error("Error conteo colecciones:", countResult.error);
  if (dataResult.error) console.error("Error fetch colecciones:", dataResult.error);

  const total = countResult.count ?? 0;
  const totalPaginas = Math.ceil(total / ITEMS_POR_PAGINA);

  const colecciones: ColeccionCompleta[] = (dataResult.data ?? []).map((c: any) => ({
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
    taxon_nombre: c.taxon_nombre,
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

  return {colecciones, total, totalPaginas, paginaActual: pagina};
}
