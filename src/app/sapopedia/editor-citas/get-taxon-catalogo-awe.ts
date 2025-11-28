import {createServiceClient} from "@/utils/supabase/server";

export interface TaxonCatalogoAwe {
  id_taxon_catalogo_awe: number;
  taxon_id: number;
  catalogo_awe_id: number;
  catalogo_awe: {
    id_catalogo_awe: number;
    nombre: string;
    sigla: string | null;
    tipo_catalogo_awe_id: number | null;
  };
}

// Función para obtener los valores actuales de catálogo AWE para un taxon
export async function getTaxonCatalogoAwe(
  taxonId: number,
  tipoCatalogoId: number,
): Promise<TaxonCatalogoAwe[]> {
  const supabaseClient = createServiceClient();

  const {data, error} = await supabaseClient
    .from("taxon_catalogo_awe")
    .select(
      `
      id_taxon_catalogo_awe,
      taxon_id,
      catalogo_awe_id,
      catalogo_awe (
        id_catalogo_awe,
        nombre,
        sigla,
        tipo_catalogo_awe_id
      )
    `,
    )
    .eq("taxon_id", taxonId)
    .eq("catalogo_awe.tipo_catalogo_awe_id", tipoCatalogoId);

  if (error) {
    console.error(
      `Error al obtener taxon_catalogo_awe para taxon ${taxonId} y tipo ${tipoCatalogoId}:`,
      error,
    );
    return [];
  }

  return (data || []) as TaxonCatalogoAwe[];
}

// Función para obtener todos los catálogos AWE de un taxon organizados por tipo
export async function getAllTaxonCatalogoAwe(
  taxonId: number,
): Promise<Record<number, number[]>> {
  const tiposCatalogo = [3, 4, 5, 6, 10, 12, 21, 22, 23];

  const resultados = await Promise.all(
    tiposCatalogo.map(async (tipoId) => {
      const taxonCatalogos = await getTaxonCatalogoAwe(taxonId, tipoId);
      const ids = taxonCatalogos.map((tc) => tc.catalogo_awe_id);
      return {tipoId, ids};
    }),
  );

  const catalogosPorTipo: Record<number, number[]> = {};

  resultados.forEach(({tipoId, ids}) => {
    catalogosPorTipo[tipoId] = ids;
  });

  return catalogosPorTipo;
}

