import { createServiceClient } from "@/utils/supabase/server";

export interface FichaEspecieEditor {
  id_ficha_especie: number;
  taxon_id: number;
  etimologia: string | null;
  taxonomia: string | null;
  habitat_biologia: string | null;
  dieta: string | null;
  reproduccion: string | null;
  informacion_adicional: string | null;
  comentario_estatus_poblacional: string | null;
  distribucion_global: string | null;
  identificacion: string | null;
  color_en_vida: string | null;
  svl_macho: string | null;
  svl_hembra: string | null;
  peso: string | null;
  fecha_actualizacion: string | null;
  agradecimiento: string | null;
  wikipedia: string | null;
  asw: string | null;
  aw: string | null;
  uicn: string | null;
  inaturalist: string | null;
  genbank: string | null;
  herpnet: string | null;
  publicar: boolean;
  primeros_colectores: string | null;
  historial: string | null;
  fuente_lista_roja: string | null;
  traducciones: any | null;
  rango_altitudinal_max: number | null;
  rango_altitudinal_min: number | null;
  area_distribucion: number | null;
  pluviocidad_min: number | null;
  pluviocidad_max: number | null;
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

  return data as unknown as FichaEspecieEditor | null;
}
