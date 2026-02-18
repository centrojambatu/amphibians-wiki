import {createServiceClient} from "@/utils/supabase/server";
import {TaxonNombre} from "../nombres/get-taxon-nombres";

export interface NombreRenacuajo {
  id: number;
  nombre: string;
  catalogo_awe_idioma_id: number;
  publicacion_id: number | null;
}

/**
 * Obtiene los nombres de renacuajos como lista plana
 */
export default async function getNombresRenacuajos(
  idiomaId?: number,
): Promise<TaxonNombre[]> {
  const supabaseClient = createServiceClient();

  // Construir query base
  let query = supabaseClient
    .from("nombre_renacuajos")
    .select("id, nombre, catalogo_awe_idioma_id, publicacion_id");

  // Filtrar por idioma si se proporciona
  if (idiomaId) {
    query = query.eq("catalogo_awe_idioma_id", idiomaId);
  }

  const {data: nombresData, error: errorNombres} = await query;

  if (errorNombres) {
    console.error("Error al obtener nombres de renacuajos:", errorNombres);
    return [];
  }

  if (!nombresData || nombresData.length === 0) {
    return [];
  }

  console.log(`✅ Encontrados ${nombresData.length} nombres de renacuajos${idiomaId ? ` para idioma ${idiomaId}` : ""}`);

  // Convertir a TaxonNombre (los renacuajos no tienen taxon_id, son nombres genéricos)
  const nombres: TaxonNombre[] = nombresData.map((n: any) => ({
    id_taxon: 0, // Los renacuajos no están asociados a taxones específicos
    taxon: "",
    nombre_comun: n.nombre,
    nombre_comun_completo: n.nombre,
    nombre_cientifico: null, // Los renacuajos no tienen nombre científico asociado directamente
    orden: undefined,
    familia: undefined,
    genero: undefined,
    catalogo_awe_idioma_id: n.catalogo_awe_idioma_id,
  }));

  // Ordenar por nombre
  nombres.sort((a, b) => (a.nombre_comun || "").localeCompare(b.nombre_comun || ""));

  return nombres;
}
