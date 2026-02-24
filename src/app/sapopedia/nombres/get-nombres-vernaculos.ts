import {createServiceClient} from "@/utils/supabase/server";
import {TaxonNombre} from "./get-taxon-nombres";

export interface NombreVernaculo {
  id: number;
  nombre: string;
  catalogo_awe_idioma_id: number;
  taxon_id: number;
  publicacion_id: number | null;
  nombre_cientifico?: string;
  orden?: string;
  familia?: string;
  genero?: string;
}

export interface IdiomaVernaculo {
  id: number;
  nombre: string;
  codigo: string;
}

/**
 * Obtiene los idiomas disponibles dinámicamente desde la tabla nombre_comun_vernaculo
 * y los completa con información desde catalogo_awe
 */
export async function getIdiomasVernaculos(): Promise<IdiomaVernaculo[]> {
  const supabaseClient = createServiceClient();

  // Obtener los IDs únicos de idiomas que aparecen en nombre_comun_vernaculo
  const {data: nombresData, error: errorNombres} = await supabaseClient
    .from("nombre_comun_vernaculo")
    .select("catalogo_awe_idioma_id")
    .not("catalogo_awe_idioma_id", "is", null);

  if (errorNombres) {
    console.error("Error al obtener idiomas de nombres vernáculos:", errorNombres);
    return [];
  }

  if (!nombresData || nombresData.length === 0) {
    return [];
  }

  // Obtener IDs únicos
  const idiomaIds = [...new Set(nombresData.map((n: any) => n.catalogo_awe_idioma_id))];

  // Obtener información de los idiomas desde catalogo_awe
  const {data: idiomasData, error: errorIdiomas} = await supabaseClient
    .from("catalogo_awe")
    .select("id_catalogo_awe, nombre, sigla")
    .in("id_catalogo_awe", idiomaIds)
    .order("nombre", {ascending: true});

  if (errorIdiomas) {
    console.error("Error al obtener información de idiomas:", errorIdiomas);
    return [];
  }

  // Convertir a formato IdiomaVernaculo
  const idiomas: IdiomaVernaculo[] = (idiomasData || []).map((item) => ({
    id: item.id_catalogo_awe,
    nombre: item.nombre,
    codigo: item.sigla || "UN", // Usar sigla o "UN" (Unknown) como fallback
  }));

  // Separar "Desconocido" (id=13) y ponerlo al final
  const desconocido = idiomas.find((i) => i.id === 13);
  const otrosIdiomas = idiomas.filter((i) => i.id !== 13);

  // Retornar otros idiomas primero, luego "Desconocido" si existe
  return desconocido ? [...otrosIdiomas, desconocido] : otrosIdiomas;
}

/**
 * Obtiene los nombres vernáculos como lista plana (sin agrupación taxonómica)
 */
export default async function getNombresVernaculos(
  idiomaId?: number,
): Promise<TaxonNombre[]> {
  const supabaseClient = createServiceClient();

  // Construir query base
  let query = supabaseClient
    .from("nombre_comun_vernaculo")
    .select("id, nombre, catalogo_awe_idioma_id, taxon_id, publicacion_id");

  // Filtrar por idioma si se proporciona
  if (idiomaId) {
    query = query.eq("catalogo_awe_idioma_id", idiomaId);
  }

  const {data: nombresData, error: errorNombres} = await query.not("taxon_id", "is", null);

  if (errorNombres) {
    console.error("Error al obtener nombres vernáculos:", errorNombres);
    return [];
  }

  if (!nombresData || nombresData.length === 0) {
    return [];
  }

  // Obtener información de taxones
  const taxonIds = [...new Set(nombresData.map((n: any) => n.taxon_id))];

  const {data: taxonesData, error: errorTaxones} = await supabaseClient
    .from("taxon")
    .select("id_taxon, taxon, taxon_id, rank_id")
    .in("id_taxon", taxonIds);

  // Crear mapa de taxon_id -> rank_id para acceso rápido
  const taxonIdToRankId = new Map<number, number>();
  if (taxonesData) {
    taxonesData.forEach((t: any) => {
      taxonIdToRankId.set(t.id_taxon, t.rank_id);
    });
  }

  if (errorTaxones) {
    console.error("Error al obtener taxones:", errorTaxones);
    return [];
  }

  // Obtener nombres científicos desde vw_lista_especies
  const {data: vwData, error: errorVw} = await supabaseClient
    .from("vw_lista_especies")
    .select("id_taxon, nombre_cientifico")
    .in("id_taxon", taxonIds);

  const taxonIdToNombreCientifico = new Map<number, string>();
  if (!errorVw && vwData) {
    vwData.forEach((t: any) => {
      if (t.nombre_cientifico) {
        taxonIdToNombreCientifico.set(t.id_taxon, t.nombre_cientifico);
      }
    });
  }

  // Obtener información taxonómica usando una consulta SQL optimizada con JOINs
  const taxonInfoMap = await getTaxonInfoOptimizado(supabaseClient, taxonIds);

  // Combinar datos
  const nombresVernaculos: NombreVernaculo[] = nombresData
    .map((n: any) => {
      const taxonInfo = taxonInfoMap.get(n.taxon_id);
      
      // Si no hay información taxonómica, usar valores por defecto en lugar de excluir
      if (!taxonInfo) {
        // Incluir el nombre aunque no tenga información taxonómica completa
        const especie = taxonesData?.find((t: any) => t.id_taxon === n.taxon_id)?.taxon || "";
        const nombreCientifico = taxonIdToNombreCientifico.get(n.taxon_id);

        return {
          id: n.id,
          nombre: n.nombre,
          catalogo_awe_idioma_id: n.catalogo_awe_idioma_id,
          taxon_id: n.taxon_id,
          publicacion_id: n.publicacion_id,
          nombre_cientifico: nombreCientifico,
          orden: undefined,
          familia: undefined,
          genero: undefined,
        } as NombreVernaculo;
      }

      const especie = taxonesData?.find((t: any) => t.id_taxon === n.taxon_id)?.taxon || "";
      const nombreCientifico = taxonIdToNombreCientifico.get(n.taxon_id);

      return {
        id: n.id,
        nombre: n.nombre,
        catalogo_awe_idioma_id: n.catalogo_awe_idioma_id,
        taxon_id: n.taxon_id,
        publicacion_id: n.publicacion_id,
        nombre_cientifico: nombreCientifico,
        orden: taxonInfo.orden,
        familia: taxonInfo.familia,
        genero: taxonInfo.genero,
      } as NombreVernaculo;
    })
    .filter((n): n is NombreVernaculo => n !== null);
  
  // Retornar lista plana de nombres vernáculos (sin agrupación taxonómica)
  // Convertir NombreVernaculo a TaxonNombre (incluir nombre del taxon para orden/familia/género)
  const nombres: TaxonNombre[] = nombresVernaculos.map((nv) => ({
    id_taxon: nv.taxon_id,
    taxon: taxonesData?.find((t: any) => t.id_taxon === nv.taxon_id)?.taxon ?? "",
    nombre_comun: nv.nombre,
    nombre_comun_completo: nv.nombre,
    nombre_cientifico: nv.nombre_cientifico,
    orden: nv.orden,
    familia: nv.familia,
    genero: nv.genero,
    catalogo_awe_idioma_id: nv.catalogo_awe_idioma_id, // Incluir idioma para filtrar en cliente
    rank_id: taxonIdToRankId.get(nv.taxon_id), // Incluir rank_id para determinar tipo de taxon
  }));

  // Ordenar por nombre vernáculo
  nombres.sort((a, b) => (a.nombre_comun || "").localeCompare(b.nombre_comun || ""));

  return nombres;
}

/**
 * Obtiene la información taxonómica usando una consulta SQL optimizada con JOINs
 * Mucho más rápido que múltiples consultas anidadas
 */
async function getTaxonInfoOptimizado(
  supabaseClient: any,
  taxonIds: number[],
): Promise<Map<number, {id_taxon: number; orden: string; familia: string; genero: string}>> {
  const taxonInfoMap = new Map();

  if (taxonIds.length === 0) {
    return taxonInfoMap;
  }

  // Consulta optimizada: obtener especies con sus relaciones en una sola consulta usando JOINs anidados
  const batchSize = 500; // Aumentar tamaño de lote para menos round-trips

  for (let i = 0; i < taxonIds.length; i += batchSize) {
    const batch = taxonIds.slice(i, i + batchSize);
    
    try {
      // Consulta con JOINs anidados de Supabase (más eficiente que múltiples consultas)
      const {data: especies, error: errorEspecies} = await supabaseClient
        .from("taxon")
        .select(`
          id_taxon,
          taxon_id,
          genero:taxon_id!inner(
            id_taxon,
            taxon,
            taxon_id,
            familia:taxon_id!inner(
              id_taxon,
              taxon,
              taxon_id,
              orden:taxon_id!inner(
                id_taxon,
                taxon
              )
            )
          )
        `)
        .in("id_taxon", batch)
        .eq("rank_id", 7);

      if (errorEspecies) {
        console.error("Error en consulta optimizada, usando método alternativo:", errorEspecies);
        // Fallback: usar método anterior pero con lotes más grandes
        await getTaxonInfoFallback(supabaseClient, batch, taxonInfoMap);
        continue;
      }

      if (especies) {
        especies.forEach((especie: any) => {
          const genero = especie.genero;
          const familia = genero?.familia;
          const orden = familia?.orden;

          if (orden?.taxon && familia?.taxon && genero?.taxon) {
            taxonInfoMap.set(especie.id_taxon, {
              id_taxon: especie.id_taxon,
              orden: orden.taxon,
              familia: familia.taxon,
              genero: genero.taxon,
            });
          }
        });
      }
    } catch (err) {
      console.error("Error en consulta optimizada:", err);
      // Fallback
      await getTaxonInfoFallback(supabaseClient, batch, taxonInfoMap);
    }
  }

  return taxonInfoMap;
}

/**
 * Método fallback si la consulta optimizada falla
 */
async function getTaxonInfoFallback(
  supabaseClient: any,
  taxonIds: number[],
  taxonInfoMap: Map<number, {id_taxon: number; orden: string; familia: string; genero: string}>,
) {
  const {data: especies} = await supabaseClient
    .from("taxon")
    .select("id_taxon, taxon_id")
    .in("id_taxon", taxonIds)
    .eq("rank_id", 7);

  if (!especies || especies.length === 0) return;

  const generoIds = [...new Set(especies.map((e: any) => e.taxon_id).filter((id: any) => id !== null))];
  if (generoIds.length === 0) return;

  const {data: generos} = await supabaseClient
    .from("taxon")
    .select("id_taxon, taxon, taxon_id")
    .in("id_taxon", generoIds)
    .eq("rank_id", 6);

  if (!generos) return;

  const familiaIds = [...new Set(generos.map((g: any) => g.taxon_id).filter((id: any) => id !== null))];
  if (familiaIds.length === 0) return;

  const {data: familias} = await supabaseClient
    .from("taxon")
    .select("id_taxon, taxon, taxon_id")
    .in("id_taxon", familiaIds);

  if (!familias) return;

  const ordenIds = [...new Set(familias.map((f: any) => f.taxon_id).filter((id: any) => id !== null))];
  if (ordenIds.length === 0) return;

  const {data: ordenes} = await supabaseClient
    .from("taxon")
    .select("id_taxon, taxon")
    .in("id_taxon", ordenIds);

  if (!ordenes) return;

  const generoMap = new Map();
  generos.forEach((g: any) => {
    generoMap.set(g.id_taxon, {taxon: g.taxon, taxon_id: g.taxon_id});
  });

  const familiaMap = new Map();
  familias.forEach((f: any) => {
    familiaMap.set(f.id_taxon, {taxon: f.taxon, taxon_id: f.taxon_id});
  });

  const ordenMap = new Map();
  ordenes.forEach((o: any) => {
    ordenMap.set(o.id_taxon, o.taxon);
  });

  especies.forEach((especie: any) => {
    const genero = generoMap.get(especie.taxon_id);
    if (!genero) return;

    const familia = familiaMap.get(genero.taxon_id);
    if (!familia) return;

    const orden = ordenMap.get(familia.taxon_id);
    if (!orden) return;

    taxonInfoMap.set(especie.id_taxon, {
      id_taxon: especie.id_taxon,
      orden,
      familia: familia.taxon,
      genero: genero.taxon,
    });
  });
}
