export interface SpeciesVideoItem {
  id: string;
  nombre: string | null;
  enlace: string | null;
  thumbnail: string | null;
  descripcion: string | null;
  autor: string | null;
  fecha: string | null;
  fuente: "coleccion" | "coleccion_externa" | "taxon";
  coleccion_id: number | null;
  coleccion_externa_id: number | null;
  catalogo_museo: string | null;
  museo_numero: string | null;
}
