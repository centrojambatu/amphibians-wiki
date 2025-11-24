// Interfaces para datos de taxonomía desde Supabase
export interface SpeciesData {
  id_taxon: number;
  nombre_cientifico: string;
  nombre_comun: string | null;
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
