import { createServiceClient } from "@/utils/supabase/server";

export interface EspecieNavegacion {
  id_taxon: number;
  taxon: string;
  nombre_comun: string | null;
}

// Obtener todas las especies con ficha para navegación
export default async function getEspeciesNavegacion(): Promise<
  EspecieNavegacion[]
> {
  const supabaseClient = createServiceClient();

  const { data, error } = await supabaseClient
    .from("taxon")
    .select("id_taxon, taxon, nombre_comun")
    .eq("en_ecuador", true)
    .not("taxon", "is", null)
    .order("taxon", { ascending: true });

  if (error) {
    console.error("Error al obtener especies:", error);

    return [];
  }

  return data || [];
}

// Función helper para convertir nombre científico a slug
export function toSlug(nombre: string): string {
  return nombre.replace(/ /g, "-");
}

// Función helper para convertir slug a nombre científico
export function fromSlug(slug: string): string {
  return slug.replace(/-/g, " ");
}

// Obtener la siguiente especie
export async function getSiguienteEspecie(
  taxonId: number,
): Promise<EspecieNavegacion | null> {
  const especies = await getEspeciesNavegacion();
  const currentIndex = especies.findIndex((e) => e.id_taxon === taxonId);

  if (currentIndex === -1 || currentIndex === especies.length - 1) {
    return null;
  }

  return especies[currentIndex + 1];
}

// Obtener la especie anterior
export async function getAnteriorEspecie(
  taxonId: number,
): Promise<EspecieNavegacion | null> {
  const especies = await getEspeciesNavegacion();
  const currentIndex = especies.findIndex((e) => e.id_taxon === taxonId);

  if (currentIndex === -1 || currentIndex === 0) {
    return null;
  }

  return especies[currentIndex - 1];
}
