import { createServiceClient } from "@/utils/supabase/server";

/**
 * Obtiene sugerencias de títulos de publicaciones
 */
export async function getSugerenciasTitulos(query: string, limit: number = 10): Promise<string[]> {
  if (!query || query.length < 2) {
    return [];
  }

  const supabaseClient = createServiceClient();

  const { data, error } = await supabaseClient
    .from("vw_publicacion_completa")
    .select("titulo")
    .ilike("titulo", `%${query}%`)
    .limit(limit);

  if (error || !data) {
    return [];
  }

  // Eliminar duplicados y retornar solo los títulos
  const titulosUnicos = Array.from(new Set(data.map((p) => p.titulo).filter(Boolean)));
  return titulosUnicos;
}

/**
 * Obtiene sugerencias de autores
 */
export async function getSugerenciasAutores(query: string, limit: number = 10): Promise<string[]> {
  if (!query || query.length < 2) {
    return [];
  }

  const supabaseClient = createServiceClient();

  const { data, error } = await supabaseClient
    .from("vw_publicacion_completa")
    .select("autores_nombres")
    .ilike("autores_nombres", `%${query}%`)
    .limit(limit * 2); // Obtener más para poder procesar

  if (error || !data) {
    return [];
  }

  // Extraer nombres de autores individuales de la cadena separada por punto y coma
  const autoresSet = new Set<string>();
  data.forEach((pub) => {
    if (pub.autores_nombres) {
      const autores = pub.autores_nombres.split(";").map((a) => a.trim());
      autores.forEach((autor) => {
        if (autor.toLowerCase().includes(query.toLowerCase())) {
          autoresSet.add(autor);
        }
      });
    }
  });

  return Array.from(autoresSet).slice(0, limit);
}
