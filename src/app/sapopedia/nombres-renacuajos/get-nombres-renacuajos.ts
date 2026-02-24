import {createServiceClient} from "@/utils/supabase/server";
import {TaxonNombre} from "../nombres/get-taxon-nombres";

export interface NombreRenacuajo {
  id: number;
  nombre: string;
  catalogo_awe_idioma_id: number;
  publicacion_id: number | null;
}

export interface IdiomaRenacuajo {
  id: number;
  nombre: string;
  codigo: string;
}

/**
 * Obtiene los idiomas disponibles dinámicamente desde la tabla nombre_renacuajos
 * y los completa con información desde catalogo_awe. "Desconocido" (id=13) siempre al final.
 */
export async function getIdiomasRenacuajos(): Promise<IdiomaRenacuajo[]> {
  const supabaseClient = createServiceClient();

  const {data: nombresData, error: errorNombres} = await supabaseClient
    .from("nombre_renacuajos")
    .select("catalogo_awe_idioma_id")
    .not("catalogo_awe_idioma_id", "is", null);

  if (errorNombres) {
    console.error("Error al obtener idiomas de nombres de renacuajos:", errorNombres);
    return [];
  }

  if (!nombresData || nombresData.length === 0) {
    return [];
  }

  const idiomaIds = [...new Set(nombresData.map((n: any) => n.catalogo_awe_idioma_id))];

  const {data: idiomasData, error: errorIdiomas} = await supabaseClient
    .from("catalogo_awe")
    .select("id_catalogo_awe, nombre, sigla")
    .in("id_catalogo_awe", idiomaIds)
    .order("nombre", {ascending: true});

  if (errorIdiomas) {
    console.error("Error al obtener información de idiomas (renacuajos):", errorIdiomas);
    return [];
  }

  const idiomas: IdiomaRenacuajo[] = (idiomasData || []).map((item) => ({
    id: item.id_catalogo_awe,
    nombre: item.nombre,
    codigo: item.sigla || "UN",
  }));

  const desconocido = idiomas.find((i) => i.id === 13);
  const otrosIdiomas = idiomas.filter((i) => i.id !== 13);

  return desconocido ? [...otrosIdiomas, desconocido] : otrosIdiomas;
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


  // Convertir a TaxonNombre (los renacuajos no tienen taxon_id, son nombres genéricos)
  const nombres: TaxonNombre[] = nombresData.map((n: any) => ({
    id_taxon: 0, // Los renacuajos no están asociados a taxones específicos
    taxon: "",
    nombre_comun: n.nombre,
    nombre_comun_completo: n.nombre,
    nombre_cientifico: undefined, // Los renacuajos no tienen nombre científico asociado directamente
    orden: undefined,
    familia: undefined,
    genero: undefined,
    catalogo_awe_idioma_id: n.catalogo_awe_idioma_id,
  }));

  // Ordenar por nombre
  nombres.sort((a, b) => (a.nombre_comun || "").localeCompare(b.nombre_comun || ""));

  return nombres;
}
