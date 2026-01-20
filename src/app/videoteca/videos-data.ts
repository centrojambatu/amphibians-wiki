// Datos de videos organizados manualmente
// Puedes agregar o editar los videos aquí

export interface VideoData {
  id: string; // ID del video de YouTube (de la URL: watch?v=ID)
  title: string;
  channelTitle: string;
  thumbnail: string; // URL del thumbnail
  duration?: string; // Duración en formato "MM:SS" o "HH:MM:SS"
  viewCount?: number; // Número de visualizaciones
  publishedAt?: string; // Fecha de publicación (formato ISO o texto)
}

export const videosEcuador: VideoData[] = [
  // Agrega aquí los videos de la playlist "Anfibios Ecuador"
  // Ejemplo:
  // {
  //   id: "VIDEO_ID_AQUI",
  //   title: "Título del video",
  //   channelTitle: "Canal de YouTube",
  //   thumbnail: "https://img.youtube.com/vi/VIDEO_ID_AQUI/maxresdefault.jpg",
  //   duration: "3:07",
  //   viewCount: 859,
  //   publishedAt: "hace 9 años",
  // },
];

export const videosMundo: VideoData[] = [
  // Agrega aquí los videos de la playlist "Anfibios Mundo"
  // Ejemplo:
  // {
  //   id: "VIDEO_ID_AQUI",
  //   title: "Título del video",
  //   channelTitle: "Canal de YouTube",
  //   thumbnail: "https://img.youtube.com/vi/VIDEO_ID_AQUI/maxresdefault.jpg",
  //   duration: "2:24",
  //   viewCount: 471,
  //   publishedAt: "hace 2 años",
  // },
];
