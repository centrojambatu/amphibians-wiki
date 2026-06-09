import {createServiceClient} from "@/utils/supabase/server";

export interface Canto {
  id_canto: number;
  coleccion_id: number;
  gui_aud: string | null;
  temp: number | null;
  humedad: number | null;
  nubosidad: number | null;
  distancia_micro: number | null;
  autor: string | null;
  hora: string | null;
  fecha: string | null;
  equipo: string | null;
  localidad: string | null;
  observacion: string | null;
  created_at: string | null;
  updated_at: string | null;
  enlace: string | null;
  nombre: string | null;
  colector: string | null;
}

export interface VideoColeccion {
  id_video: number;
  coleccion_id: number | null;
  nombre: string | null;
  enlace: string | null;
  thumbnail: string | null;
  autor: string | null;
  descripcion: string | null;
  fecha: string | null;
}

export interface Tejido {
  id_tejido: number;
  coleccion_id: number;
  permisocontrato_id: number | null;
  codtejido: string | null;
  tipo_tejido_id: number | null;
  catalogo_awe: {nombre: string} | null;
  preservacion: string | null;
  fecha: string | null;
  ubicacion: string | null;
  piso: string | null;
  rack: string | null;
  caja: string | null;
  coordenada: string | null;
  estatus: string | null;
  observacion: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface MuestraBase {
  coleccion_id: number;
  permisocontrato_id: number | null;
  preservacion: string | null;
  fecha: string | null;
  ubicacion: string | null;
  piso: string | null;
  rack: string | null;
  caja: string | null;
  coordenada: string | null;
  estatus: string | null;
  observacion: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Esperma extends MuestraBase {
  id_esperma: number;
  codesperma: string | null;
}

export interface Heces extends MuestraBase {
  id_heces: number;
  codheces: string | null;
}

export interface ExtractoPiel extends MuestraBase {
  id_extracto_piel: number;
  codextracto_piel: string | null;
  tipo_extracto_piel_id: number | null;
  catalogo_awe: {nombre: string} | null;
}

export interface Identificacion {
  id_identificacion: number;
  coleccion_id: number;
  taxon_nombre: string | null;
  responsable: string | null;
  fecha: string | null;
  comentario: string | null;
}

export interface PrestamoColeccion {
  id_prestamocoleccion: number;
  prestamo_id: number;
  coleccion_id: number;
  permisocontrato_id: number | null;
  estado: boolean | null;
  observacion: string | null;
  prestamo?: {
    id_prestamo: number;
    personal_id: number | null;
    numero_prestamo: string | null;
    beneficiario: string | null;
    cargo: string | null;
    institucion: string | null;
    telefono: string | null;
    email: string | null;
    web: string | null;
    fecha_prestamo: string | null;
    fecha_devolucion: string | null;
    estado: string | null;
    material: string | null;
    observacion: string | null;
  };
}

export interface PrestamoTejido {
  id_prestamotejido: number;
  prestamo_id: number;
  tejido_id: number;
  permisocontrato_id: number | null;
  observacion: string | null;
  prestamo?: {
    id_prestamo: number;
    personal_id: number | null;
    numero_prestamo: string | null;
    beneficiario: string | null;
    cargo: string | null;
    institucion: string | null;
    telefono: string | null;
    email: string | null;
    web: string | null;
    fecha_prestamo: string | null;
    fecha_devolucion: string | null;
    estado: string | null;
    material: string | null;
    observacion: string | null;
  };
  tejido?: {
    id_tejido: number;
    codtejido: string | null;
  };
}

export interface ColeccionPersonal {
  id_coleccionpersonal: number;
  coleccion_id: number;
  personal_id: number;
  principal: boolean | null;
  personal?: {
    id_personal: number;
    nombre: string | null;
    siglas: string | null;
    cargo: string | null;
    institucion: string | null;
  };
}

export interface FotografiaColeccion {
  id_fotografia: number;
  coleccion_id: number | null;
  nombre: string | null;
  enlace: string | null;
  autor: string | null;
  fecha: string | null;
  localidad: string | null;
  descripcion: string | null;
  observaciones: string | null;
  catalogo_museo: string | null;
  tipo_licencia: string | null;
  orden: number | null;
  tipo: string | null;
}

export interface CuerpoAgua {
  id_cuerpoagua: number;
  campobase_id: number | null;
  nombre: string | null;
  tipo_microhabitat_id: number | null;
  catalogo_awe: {nombre: string} | null;
  temperatura_ambiente: number | null;
  oxigeno_disuelto: number | null;
  mv_ph: number | null;
  ph: number | null;
  mvorp: number | null;
  ustm: number | null;
  ustma: number | null;
  mocm: number | null;
  ppmtd: number | null;
  psu: number | null;
  ot: number | null;
  fnu: number | null;
  temp: number | null;
  psi: number | null;
  lat: number | null;
  lon: number | null;
  datum: string | null;
  equipo: string | null;
  cod_lote_datos: string | null;
  nota: string | null;
}

/**
 * Obtiene los cantos relacionados con una colección
 */
export async function getCantosByColeccion(coleccionId: number): Promise<Canto[]> {
  const supabaseClient = createServiceClient();

  const {data, error} = await supabaseClient
    .from("canto")
    .select("*")
    .eq("coleccion_id", coleccionId)
    .order("fecha", {ascending: false});

  if (error) {
    console.error("Error al obtener cantos:", error);

    return [];
  }

  return (data || []) as unknown as Canto[];
}

/**
 * Obtiene los tejidos relacionados con una colección
 * Implementa paginación para obtener todos los registros (Supabase limita a 1000 por defecto)
 */
export async function getTejidosByColeccion(coleccionId: number): Promise<Tejido[]> {
  const supabaseClient = createServiceClient();

  const PAGE_SIZE = 1000;
  let allTejidos: Tejido[] = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const {data, error} = await supabaseClient
      .from("tejido")
      .select("*, catalogo_awe:tipo_tejido_id(nombre)")
      .eq("coleccion_id", coleccionId)
      .order("fecha", {ascending: false, nullsFirst: false})
      .order("id_tejido", {ascending: true})
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      console.error("Error al obtener tejidos:", error);
      break;
    }

    if (data && data.length > 0) {
      allTejidos = allTejidos.concat(data as Tejido[]);
      offset += PAGE_SIZE;

      // Si obtenemos menos registros que el tamaño de página, no hay más
      if (data.length < PAGE_SIZE) {
        hasMore = false;
      }
    } else {
      hasMore = false;
    }
  }

  return allTejidos;
}

/**
 * Obtiene los préstamos de colección
 */
export async function getPrestamosColeccion(coleccionId: number): Promise<PrestamoColeccion[]> {
  const supabaseClient = createServiceClient();

  const {data, error} = await supabaseClient
    .from("prestamocoleccion")
    .select("*, prestamo(*)")
    .eq("coleccion_id", coleccionId);

  if (error) {
    console.error("Error al obtener préstamos de colección:", error);

    return [];
  }

  return (data || []) as PrestamoColeccion[];
}

/**
 * Obtiene los préstamos de tejido relacionados con una colección
 */
export async function getPrestamosTejidoByColeccion(
  coleccionId: number,
): Promise<PrestamoTejido[]> {
  const supabaseClient = createServiceClient();

  // Primero obtener los tejidos de la colección
  const {data: tejidos, error: errorTejidos} = await supabaseClient
    .from("tejido")
    .select("id_tejido")
    .eq("coleccion_id", coleccionId);

  if (errorTejidos || !tejidos || tejidos.length === 0) {
    return [];
  }

  const tejidoIds = tejidos.map((t: any) => t.id_tejido);

  const {data, error} = await supabaseClient
    .from("prestamotejido")
    .select("*, prestamo(*), tejido(id_tejido, codtejido)")
    .in("tejido_id", tejidoIds);

  if (error) {
    console.error("Error al obtener préstamos de tejido:", error);

    return [];
  }

  return (data || []) as PrestamoTejido[];
}

/**
 * Obtiene el personal relacionado con una colección (colectores secundarios)
 */
export async function getColeccionPersonal(coleccionId: number): Promise<ColeccionPersonal[]> {
  const supabaseClient = createServiceClient();

  const {data, error} = await supabaseClient
    .from("coleccionpersonal")
    .select("*, personal(*)")
    .eq("coleccion_id", coleccionId)
    .order("principal", {ascending: false});

  if (error) {
    console.error("Error al obtener personal de colección:", error);

    return [];
  }

  return (data || []) as ColeccionPersonal[];
}

/**
 * Obtiene el histórico de identificaciones de una colección
 */
export async function getIdentificacionesByColeccion(
  coleccionId: number,
): Promise<Identificacion[]> {
  const supabaseClient = createServiceClient();

  const {data, error} = await supabaseClient
    .from("identificacion")
    .select("*")
    .eq("coleccion_id", coleccionId)
    .order("fecha", {ascending: false});

  if (error) {
    console.error("Error al obtener identificaciones:", error);

    return [];
  }

  return (data || []) as Identificacion[];
}

/**
 * Obtiene los cuerpos de agua relacionados con una colección (a través del campobase)
 */
export async function getCuerposAguaByColeccion(coleccionId: number): Promise<CuerpoAgua[]> {
  const supabaseClient = createServiceClient();

  // Primero obtener el campobase_id de la colección
  const {data: coleccion, error: errorColeccion} = await supabaseClient
    .from("coleccion")
    .select("campobase_id")
    .eq("id_coleccion", coleccionId)
    .single();

  if (errorColeccion || !coleccion?.campobase_id) {
    return [];
  }

  // Obtener todos los cuerpos de agua del campobase
  const {data, error} = await supabaseClient
    .from("cuerpoagua")
    .select("*, catalogo_awe:tipo_microhabitat_id(nombre)")
    .eq("campobase_id", coleccion.campobase_id)
    .order("id_cuerpoagua", {ascending: true});

  if (error) {
    console.error("Error al obtener cuerpos de agua:", error);

    return [];
  }

  return (data || []) as CuerpoAgua[];
}

/**
 * Obtiene los videos relacionados con una colección
 */
export async function getVideosByColeccion(coleccionId: number): Promise<VideoColeccion[]> {
  const supabaseClient = createServiceClient();

  const {data, error} = await supabaseClient
    .from("video")
    .select("id_video, coleccion_id, nombre, enlace, thumbnail, autor, descripcion, fecha")
    .eq("coleccion_id", coleccionId)
    .eq("publicar", true)
    .order("fecha", {ascending: false, nullsFirst: false});

  if (error) {
    console.error("Error al obtener videos:", error);

    return [];
  }

  return (data || []) as unknown as VideoColeccion[];
}

/**
 * Helper genérico: obtiene todas las muestras de una tabla relacionada con la colección,
 * paginando para superar el límite de 1000 de Supabase.
 */
type MuestraTabla = "esperma" | "heces" | "extracto_piel";

async function fetchMuestrasByColeccion<T>(
  tabla: MuestraTabla,
  pkColumn: string,
  coleccionId: number,
  tipoColumn?: string,
): Promise<T[]> {
  const supabaseClient = createServiceClient();
  const PAGE_SIZE = 1000;
  const selectExpr = tipoColumn ? `*, catalogo_awe:${tipoColumn}(nombre)` : "*";
  let all: T[] = [];
  let offset = 0;

  while (true) {
    const {data, error} = await supabaseClient
      .from(tabla)
      .select(selectExpr)
      .eq("coleccion_id", coleccionId)
      .order("fecha", {ascending: false, nullsFirst: false})
      .order(pkColumn, {ascending: true})
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      console.error(`Error al obtener ${tabla}:`, error);
      break;
    }

    if (!data || data.length === 0) break;

    all = all.concat(data as unknown as T[]);
    if (data.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return all;
}

export async function getEspermasByColeccion(coleccionId: number): Promise<Esperma[]> {
  return fetchMuestrasByColeccion<Esperma>("esperma", "id_esperma", coleccionId);
}

export async function getHecesByColeccion(coleccionId: number): Promise<Heces[]> {
  return fetchMuestrasByColeccion<Heces>("heces", "id_heces", coleccionId);
}

export async function getExtractosPielByColeccion(coleccionId: number): Promise<ExtractoPiel[]> {
  return fetchMuestrasByColeccion<ExtractoPiel>(
    "extracto_piel",
    "id_extracto_piel",
    coleccionId,
    "tipo_extracto_piel_id",
  );
}

/**
 * Obtiene las fotografías vinculadas a una colección
 */
export async function getFotografiasByColeccion(coleccionId: number): Promise<FotografiaColeccion[]> {
  const supabaseClient = createServiceClient();

  const {data, error} = await supabaseClient
    .from("fotografia")
    .select("*, catalogo_awe:catalogo_awe_id(nombre)")
    .eq("coleccion_id", coleccionId)
    .order("orden", {ascending: true});

  if (error) {
    console.error("Error al obtener fotografías de colección:", error);
    return [];
  }

  return (data || []).map((f: any) => ({
    ...f,
    descripcion: f["descripción"] ?? null,
    tipo: f.catalogo_awe?.nombre ?? null,
  })) as FotografiaColeccion[];
}
