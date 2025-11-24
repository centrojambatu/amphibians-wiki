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
}

export default async function getAllEspecies(familia?: string): Promise<SpeciesListItem[]> {
  const supabaseClient = createServiceClient();

  // Obtener todas las especies publicadas desde la vista completa
  // vw_ficha_especie_completa no está en los tipos generados aún
  let query = (supabaseClient as any)
    .from("vw_ficha_especie_completa")
    .select("*")
    .eq("publicar", true)
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

  // Mapear los datos de la vista a nuestro tipo SpeciesListItem
  const especiesFormateadas: SpeciesListItem[] = especies.map((especie: any) => ({
    id_taxon: especie.id_taxon,
    nombre_cientifico: especie.nombre_cientifico,
    nombre_comun: especie.nombre_comun,
    descubridor: especie.descubridor,
    orden: especie.orden,
    familia: especie.familia,
    genero: especie.genero,
    fotografia_ficha: especie.fotografia_ficha,
    en_ecuador: especie.en_ecuador,
    endemica: especie.endemica,
    rango_altitudinal_min: especie.rango_altitudinal_min,
    rango_altitudinal_max: especie.rango_altitudinal_max,
    lista_roja_iucn: especie.lista_roja_iucn,
  }));

  return especiesFormateadas;
}
