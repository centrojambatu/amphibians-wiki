// Datos de fotos organizados manualmente
// Puedes agregar o editar las fotos aquí

export interface FotoData {
  id: string; // ID único de la foto
  title: string;
  source: string; // Fuente de la foto (ej: "Centro Jambatu", "iNaturalist", etc.)
  url: string; // URL de la imagen
  thumbnailUrl?: string; // URL de la miniatura (opcional)
  species?: string; // Nombre científico de la especie (opcional)
  location?: string; // Ubicación donde se tomó la foto (opcional)
  date?: string; // Fecha de la foto (opcional)
  photographer?: string; // Fotógrafo (opcional)
  description?: string; // Descripción adicional (opcional)
}

export const fotosExternas: FotoData[] = [
  // Agrega aquí las fotos de fuentes externas
  // Ejemplo:
  // {
  //   id: "foto-1",
  //   title: "Rana arborícola",
  //   source: "iNaturalist",
  //   url: "https://example.com/foto1.jpg",
  //   thumbnailUrl: "https://example.com/foto1-thumb.jpg",
  //   species: "Hyloscirtus alytolylax",
  //   location: "Ecuador, Pichincha",
  //   date: "2024-01-15",
  //   photographer: "Juan Pérez",
  //   description: "Ejemplar adulto en su hábitat natural",
  // },
];

export const fotosCentroJambatu: FotoData[] = [
  // Agrega aquí las fotos del Centro Jambatu
  // Ejemplo:
  // {
  //   id: "foto-2",
  //   title: "Sapo en colección",
  //   source: "Centro Jambatu",
  //   url: "https://example.com/foto2.jpg",
  //   thumbnailUrl: "https://example.com/foto2-thumb.jpg",
  //   species: "Rhaebo caeruleostictus",
  //   location: "Ecuador",
  //   date: "2024-01-20",
  //   photographer: "Centro Jambatu",
  //   description: "Ejemplar en colección científica",
  // },
];
