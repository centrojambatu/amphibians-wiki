import {createServiceClient} from "@/utils/supabase/server";

export interface SpeciesListItem {
  id_taxon: number;
  nombre_cientifico: string;
  nombre_comun: string | null;
  descubridor: string | null;
  orden: string | null;
  familia: string | null;
  genero: string | null;
  fotografia_ficha: string | null;
  en_ecuador: boolean | null;
  endemica: boolean | null;
  rango_altitudinal_min: number | null;
  rango_altitudinal_max: number | null;
  lista_roja_iucn: string | null;
  has_distribucion_occidental: boolean;
  has_distribucion_oriental: boolean;
}

export default async function getAllEspecies(familia?: string): Promise<SpeciesListItem[]> {
  const supabaseClient = createServiceClient();

  // Obtener todas las especies publicadas desde la vista completa
  // vw_ficha_especie_completa no está en los tipos generados aún
  let query = (supabaseClient as any)
    .from("vw_ficha_especie_completa")
    .select("*")
    // .eq("publicar", true) // ⚠️ Filtro comentado temporalmente para ver todas las especies
    .order("nombre_cientifico", {ascending: true});

  // Filtrar por familia si se proporciona
  if (familia) {
    query = query.eq("familia", familia);
  }

  const {data: especies, error: errorEspecies} = await query;

  if (errorEspecies) {
    console.error("Error al obtener especies:", errorEspecies);

    return [];
  }

  if (!especies || especies.length === 0) {
    return [];
  }

  // Obtener las siglas de Lista Roja IUCN para todas las especies
  // Similar a como lo hace get-ficha-especie.ts
  const taxonIds: number[] = especies.map((e: any) => e.especie_taxon_id as number);

  // Obtener las siglas de Lista Roja IUCN
  const {data: listaRojaData, error: errorListaRoja} = await supabaseClient
    .from("taxon_catalogo_awe")
    .select("taxon_id, catalogo_awe(sigla, tipo_catalogo_awe_id)")
    .in("taxon_id", taxonIds)
    .eq("catalogo_awe.tipo_catalogo_awe_id", 10); // 10 = Lista Roja UICN

  if (errorListaRoja) {
    console.error("Error al obtener lista roja:", errorListaRoja);
  }

  // Crear un mapa de taxon_id -> sigla de lista roja
  const listaRojaMap = new Map<number, string>();

  if (listaRojaData) {
    for (const item of listaRojaData as any[]) {
      if (
        item.catalogo_awe?.sigla &&
        typeof item.taxon_id === "number" &&
        typeof item.catalogo_awe.sigla === "string"
      ) {
        listaRojaMap.set(item.taxon_id as number, item.catalogo_awe.sigla as string);
      }
    }
  }

  // Mapear los datos de la vista a nuestro tipo SpeciesListItem
  const especiesFormateadas: SpeciesListItem[] = especies.map((especie: any) => {
    // Usar el campo awe_distribucion_altitudinal de la vista para determinar occidental/oriental
    const distribucionAltitudinal = (especie.awe_distribucion_altitudinal || "").toLowerCase();
    const hasOccidental = distribucionAltitudinal.includes("occidental");
    const hasOriental = distribucionAltitudinal.includes("oriental");

    return {
      id_taxon: especie.especie_taxon_id,
      nombre_cientifico: especie.nombre_cientifico,
      nombre_comun: especie.nombre_comun,
      descubridor: especie.especie_autor,
      orden: especie.orden,
      familia: especie.familia,
      genero: especie.genero,
      fotografia_ficha: especie.fotografia_ficha,
      en_ecuador: especie.en_ecuador,
      endemica: especie.endemica,
      rango_altitudinal_min: especie.rango_altitudinal_min,
      rango_altitudinal_max: especie.rango_altitudinal_max,
      lista_roja_iucn: listaRojaMap.get(especie.especie_taxon_id as number) || null,
      has_distribucion_occidental: hasOccidental,
      has_distribucion_oriental: hasOriental,
    };
  });

  return especiesFormateadas;
}
