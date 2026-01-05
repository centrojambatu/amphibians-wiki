import { createServiceClient } from "@/utils/supabase/server";

/**
 * Obtiene una colección específica por su ID con todos los campos disponibles
 */
export default async function getColeccionById(
  coleccionId: number,
): Promise<any | null> {
  const supabaseClient = createServiceClient();

  const { data, error } = await supabaseClient
    .from("vw_coleccion_completa")
    .select("*")
    .eq("id_coleccion", coleccionId)
    .single();

  if (error) {
    console.error("Error al obtener colección:", error);
    return null;
  }

  if (!data) {
    return null;
  }

  // Mapear todos los campos disponibles
  return data as any;
}
