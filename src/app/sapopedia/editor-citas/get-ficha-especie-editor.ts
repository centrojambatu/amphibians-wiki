import {createServiceClient} from "@/utils/supabase/server";

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
  temperatura: number | null;
}

// Función para obtener la ficha de especie por taxon_id
export default async function getFichaEspecieEditor(taxonId: number): Promise<FichaEspecieEditor | null> {
  const supabaseClient = createServiceClient();

  const {data, error} = await supabaseClient
    .from("ficha_especie")
    .select("*")
    .eq("taxon_id", taxonId)
    .single();

  if (error) {
    console.error("Error al obtener ficha de especie:", error);

    return null;
  }

  return data;
}

