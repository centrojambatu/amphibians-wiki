import {createServiceClient} from "@/utils/supabase/server";

export interface CatalogoAweOpcion {
  id_catalogo_awe: number;
  nombre: string;
  sigla: string | null;
  tipo_catalogo_awe_id: number | null;
}

// Función para obtener opciones de catálogo AWE filtradas por tipo
export async function getCatalogoAweOpciones(
  tipoCatalogoId: number,
): Promise<CatalogoAweOpcion[]> {
  const supabaseClient = createServiceClient();

  const {data, error} = await supabaseClient
    .from("catalogo_awe")
    .select("id_catalogo_awe, nombre, sigla, tipo_catalogo_awe_id")
    .eq("tipo_catalogo_awe_id", tipoCatalogoId)
    .order("nombre", {ascending: true});

  if (error) {
    console.error(`Error al obtener catálogo AWE tipo ${tipoCatalogoId}:`, {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return [];
  }

  return data || [];
}

// Función para obtener todos los catálogos AWE necesarios
export async function getAllCatalogoAweOpciones(): Promise<
  Record<number, CatalogoAweOpcion[]>
> {
  const tiposCatalogo = [3, 4, 5, 6, 10, 12, 21, 22, 23];

  const resultados = await Promise.all(
    tiposCatalogo.map(async (tipoId) => {
      const opciones = await getCatalogoAweOpciones(tipoId);
      return {tipoId, opciones};
    }),
  );

  const opcionesPorTipo: Record<number, CatalogoAweOpcion[]> = {};

  resultados.forEach(({tipoId, opciones}) => {
    opcionesPorTipo[tipoId] = opciones;
  });

  return opcionesPorTipo;
}

