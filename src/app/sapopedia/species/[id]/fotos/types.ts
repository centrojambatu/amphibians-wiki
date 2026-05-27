export interface SpeciesFotoItem {
  id: string;
  nombre: string | null;
  enlace: string | null;
  descripcion: string | null;
  cita_corta: string | null;
  fecha: string | null;
  autor: string | null;
  localidad: string | null;
  latitud: number | null;
  longitud: number | null;
  tipo_licencia: string | null;
  observaciones: string | null;
  fuente: "coleccion" | "coleccion_externa" | "taxon";
  coleccion_id: number | null;
  coleccion_externa_id: number | null;
  catalogo_museo: string | null;
  numero_museo: string | null;
  categoria_id: number | null;
  categoria: string | null;
  in_situ: boolean | null;
}
