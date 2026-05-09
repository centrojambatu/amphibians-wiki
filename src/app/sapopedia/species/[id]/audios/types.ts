export interface SpeciesAudioItem {
  id: string;
  nombre: string | null;
  enlace: string | null;
  cita_corta: string | null;
  fecha: string | null;
  hora: string | null;
  colector: string | null;
  localidad: string | null;
  provincia: string | null;
  estado: string | null;
  pais: string | null;
  latitud: number | null;
  longitud: number | null;
  elevacion: number | null;
  temp_aire: number | null;
  temp_agua: number | null;
  humedad: number | null;
  nubosidad: number | null;
  observacion: string | null;
  especies_fondo: string | null;
  serie_campo: string | null;
  fuente: "coleccion" | "coleccion_externa" | "taxon";
  coleccion_id: number | null;
  coleccion_externa_id: number | null;
  catalogo_museo: string | null;
  numero_museo: string | null;
}
