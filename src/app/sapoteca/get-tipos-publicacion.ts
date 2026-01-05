import { createServiceClient } from "@/utils/supabase/server";

export interface TipoPublicacion {
  id_catalogo_awe: number;
  nombre: string;
  sigla: string | null;
  orden: number | null;
}

/**
 * Obtiene los tipos de publicación desde catalogo_awe donde tipo_catalogo_awe_id = 9
 */
export default async function getTiposPublicacion(): Promise<TipoPublicacion[]> {
  const supabaseClient = createServiceClient();

  const { data, error } = await supabaseClient
    .from("catalogo_awe")
    .select("id_catalogo_awe, nombre, sigla, orden")
    .eq("tipo_catalogo_awe_id", 9)
    .order("orden", { ascending: true, nullsFirst: false });

  if (error) {
    console.error("Error al obtener tipos de publicación:", error);
    return [];
  }

  if (!data) {
    return [];
  }

  return data.map((item) => ({
    id_catalogo_awe: item.id_catalogo_awe,
    nombre: item.nombre,
    sigla: item.sigla,
    orden: item.orden,
  }));
}
