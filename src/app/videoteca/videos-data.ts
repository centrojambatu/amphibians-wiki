// Datos de videos organizados manualmente
// Puedes agregar o editar los videos aquí

export interface VideoData {
  id: string; // ID del video de YouTube (de la URL: watch?v=ID)
  title: string;
  channelTitle: string;
  thumbnail?: string; // URL del thumbnail (opcional, se genera automáticamente si no se proporciona)
  duration?: string; // Duración en formato "MM:SS" o "HH:MM:SS"
  viewCount?: number; // Número de visualizaciones
  publishedAt?: string; // Fecha de publicación (formato ISO o texto)
}

export const videosEcuador: VideoData[] = [
  {
    id: "RItLaaBXezE",
    title: "Ecuador Sapodiverso",
    channelTitle: "Luis Coloma",
    thumbnail: "https://img.youtube.com/vi/RItLaaBXezE/maxresdefault.jpg",
  },
  {
    id: "kgtKCaB3zQc",
    title: "World's First 3D Animal Scanner!",
    channelTitle: "The Biodiversity Group",
    thumbnail: "https://img.youtube.com/vi/kgtKCaB3zQc/maxresdefault.jpg",
  },
  {
    id: "-ztTTLmO-G0",
    title: "World's First 3D Animal Scans - Nymphargus balionotus",
    channelTitle: "The Biodiversity Group",
    thumbnail: "https://img.youtube.com/vi/-ztTTLmO-G0/maxresdefault.jpg",
  },
  {
    id: "yC1QVRhnnl0",
    title: "World's First 3D Animal Scans - Horned Marsupial Frog",
    channelTitle: "The Biodiversity Group",
    thumbnail: "https://img.youtube.com/vi/yC1QVRhnnl0/maxresdefault.jpg",
  },
  {
    id: "z01JHh5Y_Ds",
    title: "Searching for the world’s lost frogs",
    channelTitle: "Planet Wild",
    thumbnail: "https://img.youtube.com/vi/z01JHh5Y_Ds/maxresdefault.jpg",
  },
  {
    id: "o6yefgZ8jmI",
    title: "Ecuador es el país más diverso en especies de anfibios",
    channelTitle: "Teleamazonas Ecuador",
    thumbnail: "https://img.youtube.com/vi/o6yefgZ8jmI/maxresdefault.jpg",
  },
  {
    id: "272E18j8zgw",
    title: "Una universidad del país descubrió 4 especies nuevas de anfibios en Ecuador",
    channelTitle: "Teleamazonas Ecuador",
    thumbnail: "https://img.youtube.com/vi/272E18j8zgw/maxresdefault.jpg",
  },
  {
    id: "F2ZV6SJd0zU",
    title: "Finding frogs in the forest",
    channelTitle: "Centro Jambatu de Fundación Jambatu",
    thumbnail: "https://img.youtube.com/vi/F2ZV6SJd0zU/maxresdefault.jpg",
  },
  {
    id: "j56Fy-8AH0Y",
    title: "“Una Alianza por el Jambato: Bitácora de actividades”",
    channelTitle: "Alianza Jambato",
    thumbnail: "https://img.youtube.com/vi/j56Fy-8AH0Y/maxresdefault.jpg",
  },
  {
    id: "U8yXu_4nl10",
    title: "Rana de cristal. Increíble transparencia",
    channelTitle: "Wikiri Sapoparque",
    thumbnail: "https://img.youtube.com/vi/U8yXu_4nl10/maxresdefault.jpg",
  },
  {
    id: "Qk8r86wlyMc",
    title: "Un enfoque integral de ciencia y conservación",
    channelTitle: "Centro Jambatu de Fundación Jambatu",
    thumbnail: "https://img.youtube.com/vi/Qk8r86wlyMc/maxresdefault.jpg",
  },
  {
    id: "FsZnZAx3gPY",
    title: "Bichitos a la carta",
    channelTitle: "Centro Jambatu de Fundación Jambatu",
    thumbnail: "https://img.youtube.com/vi/FsZnZAx3gPY/maxresdefault.jpg",
  },
];

export const videosMundo: VideoData[] = [
  {
    id: "kgtKCaB3zQc",
    title: "World's First 3D Animal Scanner!",
    channelTitle: "The Biodiversity Group",
    thumbnail: "https://img.youtube.com/vi/kgtKCaB3zQc/maxresdefault.jpg",
  },
  {
    id: "F2ZV6SJd0zU",
    title: "Finding frogs in the forest",
    channelTitle: "Centro Jambatu de Fundación Jambatu",
    thumbnail: "https://img.youtube.com/vi/F2ZV6SJd0zU/maxresdefault.jpg",
  },
  {
    id: "j56Fy-8AH0Y",
    title: "“Una Alianza por el Jambato: Bitácora de actividades”",
    channelTitle: "Alianza Jambato",
    thumbnail: "https://img.youtube.com/vi/j56Fy-8AH0Y/maxresdefault.jpg",
  },
  {
    id: "EUjl8bTFLnM",
    title: "NACEN LAS PRIMERAS CRIAS DE LA RANA ARLEQUIN HOCICUDA EN LABORATORIO",
    channelTitle: "Centro Jambatu de Fundación Jambatu",
    thumbnail: "https://img.youtube.com/vi/EUjl8bTFLnM/maxresdefault.jpg",
  },
  {
    id: "OvE0beoMMY0",
    title: "El biocomercio de ranas tiene su referente en Ecuador",
    channelTitle: "HispanoPost",
    thumbnail: "https://img.youtube.com/vi/OvE0beoMMY0/maxresdefault.jpg",
  },
  {
    id: "7C4VuNAt2lU",
    title: "Jewels of the Neotropics",
    channelTitle: "Poison Dart Frogs, The Documentary",
    thumbnail: "https://img.youtube.com/vi/7C4VuNAt2lU/maxresdefault.jpg",
  },
  {
    id: "qNCqow0IDI8",
    title: "Sylvia Tree Frog",
    channelTitle: "Matthew Bone",
    thumbnail: "https://img.youtube.com/vi/qNCqow0IDI8/maxresdefault.jpg",
  },
  {
    id: "yKpJElwama8",
    title: "Frog Jumps Caught in Slow-Motion | National Geographic",
    channelTitle: "National Geographic",
    thumbnail: "https://img.youtube.com/vi/yKpJElwama8/maxresdefault.jpg",
  },
  {
    id: "IDxGNGY-Xvg",
    title: "Master Class: Filogenética y fenotipos complejos de las ranas venenosas",
    channelTitle: "Universidad Regional Amazónica Ikiam",
    thumbnail: "https://img.youtube.com/vi/IDxGNGY-Xvg/maxresdefault.jpg",
  },
  {
    id: "wwoOX0bf6fk",
    title: "Anfibios considerados extintos se reproducen en Ecuador",
    channelTitle: "PNUD ECUADOR",
    thumbnail: "https://img.youtube.com/vi/wwoOX0bf6fk/maxresdefault.jpg",
  },
  {
    id: "_YIK6rKLWto",
    title: "Womack PhD Defense - Livestream",
    channelTitle: "MCW",
    thumbnail: "https://img.youtube.com/vi/_YIK6rKLWto/maxresdefault.jpg",
  },
];
