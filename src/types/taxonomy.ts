// Interfaces para datos de taxonomía desde Supabase
export interface SpeciesData {
  id_taxon: number;
  nombre_cientifico: string;
  nombre_comun: string | null;
  /** Nombre común en inglés (desde vw_nombres_comunes) */
  nombre_comun_ingles?: string | null;
  descubridor: string | null;
  endemica: boolean | null;
  en_ecuador: boolean | null;
  fotografia_ficha: string | null;
  orden: string | null;
  familia: string | null;
  genero: string | null;
  rango_altitudinal_min: number | null;
  rango_altitudinal_max: number | null;
  lista_roja_iucn?: string | null;
  has_distribucion_occidental?: boolean;
  has_distribucion_oriental?: boolean;
}

export interface GenusGroup {
  id: string;
  name: string;
  nombre_comun: string | null;
  species: SpeciesData[];
  summary: {
    totalSpecies: number;
    endemicSpecies: number;
    redListSpecies: number;
  };
}

export interface FamilyGroup {
  id: string;
  name: string;
  /** Nombre común representativo (extracción de nombre base, como en la vista de nombres) */
  nombre_comun: string | null;
  genera: GenusGroup[];
  summary: {
    totalSpecies: number;
    totalGenera: number;
    endemicSpecies: number;
    redListSpecies: number;
  };
}

export interface OrderGroup {
  id: string;
  name: string;
  families: FamilyGroup[];
  summary: {
    totalSpecies: number;
    totalFamilies: number;
    endemicSpecies: number;
    redListSpecies: number;
  };
}
