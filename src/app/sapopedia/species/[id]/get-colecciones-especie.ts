import { createServiceClient } from "@/utils/supabase/server";

export interface ColeccionCompleta {
  id_coleccion: number;
  taxon_id: number;
  num_colector: string | null;
  sc: string | null;
  gui: string | null;
  num_museo: string | null;
  sc_acronimo: string | null;
  sc_numero: number | null;
  sc_sufijo: string | null;
  estatus_identificacion: string | null;
  taxon_nombre: string | null;
  identificado_por: string | null;
  fecha_identifica: string | null;
  estadio: string | null;
  numero_individuos: number | null;
  sexo: string | null;
  estado: string | null;
  svl: number | null;
  peso: number | null;
  estatus_tipo: string | null;
  fecha_coleccion: string | null;
  hora: string | null;
  colectores: string | null;
  provincia: string | null;
  detalle_localidad: string | null;
  latitud: number | null;
  longitud: number | null;
  altitud: number | null;
  habitat: string | null;
  observacion: string | null;
  catalogo_museo: string | null;
  campobase_nombre: string | null;
  campobase_localidad: string | null;
  personal_nombre: string | null;
  personal_siglas: string | null;
  taxon_nombre_cientifico: string | null;
}

/**
 * Obtiene todas las colecciones de una especie desde la tabla coleccion filtrando por taxon_id
 */
export default async function getColeccionesEspecie(
  taxonId: number,
): Promise<ColeccionCompleta[]> {
  const supabaseClient = createServiceClient();

  const allData: any[] = [];
  let offset = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabaseClient
      .from("coleccion")
      .select(
        `id_coleccion, taxon_id, num_colector, sc, gui, numero_museo, catalogo_museo, sc_acronimo, sc_numero, sc_sufijo,
        estatus_identificacion, taxon_nombre, identificado_por, fecha_identifica, estadio,
        numero_individuos, sexo, estado, svl, peso, estatus_tipo, fecha_col, hora, colectores,
        localidad, latitud, longitud, elevacion, habitat, observacion, publicar,
        geopolitica!coleccion_provincia_id_fkey(nombre),
        campobase!coleccion_campobase_id_fkey(nombre, localidad),
        personal!coleccion_personal_id_fkey(nombre, siglas),
        taxon!coleccion_taxon_id_fkey(taxon)`,
      )
      .eq("taxon_id", taxonId)
      .eq("publicar", true)
      .order("fecha_col", { ascending: false, nullsFirst: false })
      .order("id_coleccion", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error("Error al obtener colecciones:", error);
      break;
    }

    if (!data || data.length === 0) break;

    allData.push(...data);
    if (data.length < pageSize) break;
    offset += pageSize;
  }

  if (allData.length === 0) {
    return [];
  }

  return allData.map((c: any) => ({
    id_coleccion: c.id_coleccion,
    taxon_id: c.taxon_id,
    num_colector: c.num_colector,
    sc: c.sc,
    gui: c.gui,
    num_museo: c.numero_museo,
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
    catalogo_museo: c.catalogo_museo ?? null,
    campobase_nombre: c.campobase?.nombre ?? null,
    campobase_localidad: c.campobase?.localidad ?? null,
    personal_nombre: c.personal?.nombre ?? null,
    personal_siglas: c.personal?.siglas ?? null,
    taxon_nombre_cientifico: c.taxon?.taxon ?? null,
  }));
}
