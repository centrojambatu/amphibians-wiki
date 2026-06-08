import {createServiceClient} from "@/utils/supabase/server";

/**
 * Obtiene una colección específica por su ID con todos los campos disponibles.
 * Antes consultaba la vista `vw_coleccion_completa` (inexistente). Ahora hace
 * la consulta directa a `coleccion` con los joins necesarios y aplana el
 * resultado al esquema esperado por el cliente.
 */
export default async function getColeccionById(coleccionId: number): Promise<any | null> {
  const supabaseClient = createServiceClient();

  const {data, error} = await supabaseClient
    .from("coleccion")
    .select(
      `id_coleccion, taxon_id, num_colector, sc, gui, numero_museo, catalogo_museo,
       sc_acronimo, sc_numero, sc_sufijo, estatus_identificacion, identificado_por,
       fecha_identifica, estadio, numero_individuos, sexo, estado, svl, peso,
       estatus_tipo, fecha_col, hora, hora_aprox, colectores, metodo_fijacion,
       fecha_fijacion, metodo_preservacion, tejido_count, extrato_piel_count,
       localidad, latitud, longitud, elevacion, fuente_coord, habitat,
       temperatura, humedad, ph, nombre_comun, idioma_nc, fuente_nombrecomun,
       foto_insitu, autor_foto_is, foto_exsitu, autor_foto_es, nota_foto,
       observacion, gbif, coordenadas, numero_cuadernocampo, responsable_ingreso,
       rango, verificado, publicar, esqueleto_transparentacion, microfotografia,
       condicion_reproductiva, datos_ambientales, identificacion_posible,
       identificacion_sp, identificacion_cuestionable,
       geopolitica!coleccion_provincia_id_fkey(nombre),
       campobase!coleccion_campobase_id_fkey(nombre, localidad),
       personal!coleccion_personal_id_fkey(nombre, siglas),
       taxon!coleccion_taxon_id_fkey(taxon)`,
    )
    .eq("id_coleccion", coleccionId)
    .maybeSingle();

  if (error) {
    console.error("Error al obtener colección:", error);

    return null;
  }
  if (!data) return null;

  const c: any = data;

  return {
    ...c,
    num_museo: c.numero_museo,
    fecha_coleccion: c.fecha_col ?? null,
    detalle_localidad: c.localidad,
    altitud: c.elevacion,
    provincia: c.geopolitica?.nombre ?? null,
    campobase_nombre: c.campobase?.nombre ?? null,
    campobase_localidad: c.campobase?.localidad ?? null,
    campobase_provincia: null,
    personal_nombre: c.personal?.nombre ?? null,
    personal_siglas: c.personal?.siglas ?? null,
    personal_adicional_nombres: null,
    taxon_nombre: c.taxon?.taxon ?? null,
  };
}
