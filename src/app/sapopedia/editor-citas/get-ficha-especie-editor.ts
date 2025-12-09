import { createServiceClient } from "@/utils/supabase/server";

export interface FichaEspecieEditor {
  id_ficha_especie: number;
  taxon_id: number;
  colector: string | null;
  etimologia: string | null;
  taxonomia: string | null;
  habitat_biologia: string | null;
  dieta: string | null;
  reproduccion: string | null;
  informacion_adicional: string | null;
  comentario_estatus_poblacional: string | null;
  distribucion: string | null;
  distribucion_global: string | null;
  observacion_zona_altitudinal: string | null;
  rango_altitudinal: string | null;
  referencia_area_protegida: string | null;
  sinonimia: string | null;
  identificacion: string | null;
  descripcion: string | null;
  color_en_vida: string | null;
  color_en_preservacion: string | null;
  diagnosis: string | null;
  morfometria: string | null;
  larva: string | null;
  svl_macho: string | null;
  svl_hembra: string | null;
  canto: string | null;
  usos: string | null;
  compilador: string | null;
  autoria_compilador: string | null;
  fecha_compilacion: string | null;
  editor: string | null;
  autoria_editor: string | null;
  fecha_edicion: string | null;
  fecha_actualizacion: string | null;
  agradecimiento: string | null;
  blog: string | null;
  wikipedia: string | null;
  asw: string | null;
  aw: string | null;
  uicn: string | null;
  inaturalist: string | null;
  genbank: string | null;
  herpnet: string | null;
  fotografia_ficha: string | null;
  autor_foto_ficha: string | null;
  publicar: boolean;
  descubridor: string | null;
  historial: string | null;
  fuente_lista_roja: string | null;
  traducciones: any | null;
  rango_altitudinal_max: number | null;
  rango_altitudinal_min: number | null;
  area_distribucion: number | null;
  pluviocidad: number | null;
  pluviocidad_min: number | null;
  pluviocidad_max: number | null;
  temperatura: number | null;
  temperatura_min: number | null;
  temperatura_max: number | null;
}

// Función para obtener la ficha de especie por taxon_id
// Si se proporciona idFichaEspecie, se usa para validación adicional
export default async function getFichaEspecieEditor(
  taxonId: number,
  idFichaEspecie?: number | null,
): Promise<FichaEspecieEditor | null> {
  const supabaseClient = createServiceClient();

  // Si se proporciona id_ficha_especie, usar ambos campos para asegurar que sea el registro correcto
  let query = supabaseClient
    .from("ficha_especie")
    .select("*")
    .eq("taxon_id", taxonId);

  if (idFichaEspecie) {
    query = query.eq("id_ficha_especie", idFichaEspecie);
  }

  const { data, error } = await query.single();

  if (error) {
    console.error("Error al obtener ficha de especie:", error);
    console.error("taxon_id:", taxonId, "id_ficha_especie:", idFichaEspecie);

    return null;
  }

  // Validar que el taxon_id coincida
  if (data && data.taxon_id !== taxonId) {
    console.error(
      "⚠️ ADVERTENCIA: El taxon_id de ficha_especie no coincide con el esperado:",
      "Esperado:",
      taxonId,
      "Obtenido:",
      data.taxon_id,
    );
  } else if (data) {
    console.log("✅ Validación exitosa: taxon_id coincide en ficha_especie");
  }

  return data as FichaEspecieEditor | null;
}
