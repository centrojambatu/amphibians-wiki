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
  fecha_col: string | null;
  hora: string | null;
  colectores: string | null;
  provincia: string | null;
  detalle_localidad: string | null;
  latitud: number | null;
  longitud: number | null;
  altitud: number | null;
  habitat: string | null;
  observacion: string | null;
  campobase_nombre: string | null;
  campobase_localidad: string | null;
  personal_nombre: string | null;
  personal_siglas: string | null;
  taxon_nombre_cientifico: string | null;
}

/**
 * Obtiene todas las colecciones de una especie basado en el taxon_id y/o nombre científico
 */
export default async function getColeccionesEspecie(
  taxonId: number,
  nombreCientifico?: string,
): Promise<ColeccionCompleta[]> {
  const supabaseClient = createServiceClient();

  // Función helper para obtener todos los registros con paginación
  const fetchAllRecords = async (
    queryBuilder: any,
    pageSize: number = 1000,
  ): Promise<any[]> => {
    const allData: any[] = [];
    let offset = 0;
    let hasMore = true;
    let totalFetched = 0;

    while (hasMore) {
      const { data, error } = await queryBuilder.range(offset, offset + pageSize - 1);

      if (error) {
        console.error("Error al obtener colecciones (paginación):", error);
        break;
      }

      if (data && data.length > 0) {
        allData.push(...data);
        totalFetched += data.length;
        offset += pageSize;
        
        // Si obtenemos menos registros que el tamaño de página, no hay más
        if (data.length < pageSize) {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    }

    if (totalFetched > 0) {
    }

    return allData;
  };

  // Construir las queries base
  // Nota: Como todas las colecciones tienen taxon_id NULL, la query por taxon_id no devolverá resultados
  // Por lo tanto, priorizamos la búsqueda por taxon_nombre
  const queries: Promise<any[]>[] = [];

  // Query 1: buscar por taxon_id (aunque probablemente no devuelva resultados porque taxon_id está NULL)
  const query1 = supabaseClient
    .from("vw_coleccion_completa")
    .select(
      "id_coleccion, taxon_id, num_colector, sc, gui, num_museo, sc_acronimo, sc_numero, sc_sufijo, estatus_identificacion, taxon_nombre, identificado_por, fecha_identifica, estadio, numero_individuos, sexo, estado, svl, peso, estatus_tipo, fecha_col, hora, colectores, provincia, detalle_localidad, latitud, longitud, altitud, habitat, observacion, campobase_nombre, campobase_localidad, personal_nombre, personal_siglas, taxon_nombre_cientifico",
    )
    .eq("taxon_id", taxonId)
    .order("fecha_col", { ascending: false, nullsFirst: false })
    .order("id_coleccion", { ascending: false });

  queries.push(fetchAllRecords(query1));

  // Query 2: buscar por taxon_nombre (esta es la que realmente funciona)
  // Esta query es esencial porque taxon_id está NULL en todas las colecciones
  if (nombreCientifico) {
    const query2 = supabaseClient
      .from("vw_coleccion_completa")
      .select(
        "id_coleccion, taxon_id, num_colector, sc, gui, num_museo, sc_acronimo, sc_numero, sc_sufijo, estatus_identificacion, taxon_nombre, identificado_por, fecha_identifica, estadio, numero_individuos, sexo, estado, svl, peso, estatus_tipo, fecha_col, hora, colectores, provincia, detalle_localidad, latitud, longitud, altitud, habitat, observacion, campobase_nombre, campobase_localidad, personal_nombre, personal_siglas, taxon_nombre_cientifico",
      )
      .ilike("taxon_nombre", `%${nombreCientifico}%`)
      .order("fecha_col", { ascending: false, nullsFirst: false })
      .order("id_coleccion", { ascending: false });

    queries.push(fetchAllRecords(query2));
  }

  // Ejecutar ambas queries en paralelo
  const results = await Promise.all(queries);

  // Combinar resultados y eliminar duplicados basándose en id_coleccion
  const allData: any[] = [];
  const seenIds = new Set<number>();

  for (const resultData of results) {
    // resultData ya es un array de datos (no un objeto con .data)
    if (Array.isArray(resultData)) {
      for (const item of resultData) {
        if (!seenIds.has(item.id_coleccion)) {
          seenIds.add(item.id_coleccion);
          allData.push(item);
        }
      }
    }
  }


  // Ordenar por fecha_col e id_coleccion (ya vienen ordenados, pero por si acaso)
  allData.sort((a, b) => {
    if (a.fecha_col && b.fecha_col) {
      const dateA = new Date(a.fecha_col).getTime();
      const dateB = new Date(b.fecha_col).getTime();
      if (dateB !== dateA) return dateB - dateA;
    } else if (a.fecha_col) return -1;
    else if (b.fecha_col) return 1;
    return (b.id_coleccion || 0) - (a.id_coleccion || 0);
  });

  if (allData.length === 0) {
    return [];
  }

  return allData.map((coleccion: any) => ({
    id_coleccion: coleccion.id_coleccion,
    taxon_id: coleccion.taxon_id,
    num_colector: coleccion.num_colector,
    sc: coleccion.sc,
    gui: coleccion.gui,
    num_museo: coleccion.num_museo,
    sc_acronimo: coleccion.sc_acronimo,
    sc_numero: coleccion.sc_numero,
    sc_sufijo: coleccion.sc_sufijo,
    estatus_identificacion: coleccion.estatus_identificacion,
    taxon_nombre: coleccion.taxon_nombre,
    identificado_por: coleccion.identificado_por,
    fecha_identifica: coleccion.fecha_identifica,
    estadio: coleccion.estadio,
    numero_individuos: coleccion.numero_individuos,
    sexo: coleccion.sexo,
    estado: coleccion.estado,
    svl: coleccion.svl,
    peso: coleccion.peso,
    estatus_tipo: coleccion.estatus_tipo,
    fecha_col: coleccion.fecha_col,
    hora: coleccion.hora,
    colectores: coleccion.colectores,
    provincia: coleccion.provincia,
    detalle_localidad: coleccion.detalle_localidad,
    latitud: coleccion.latitud,
    longitud: coleccion.longitud,
    altitud: coleccion.altitud,
    habitat: coleccion.habitat,
    observacion: coleccion.observacion,
    campobase_nombre: coleccion.campobase_nombre,
    campobase_localidad: coleccion.campobase_localidad,
    personal_nombre: coleccion.personal_nombre,
    personal_siglas: coleccion.personal_siglas,
    taxon_nombre_cientifico: coleccion.taxon_nombre_cientifico,
  }));
}
