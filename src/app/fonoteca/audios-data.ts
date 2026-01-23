// Datos de audios organizados manualmente
// Puedes agregar o editar los audios aquí

export interface AudioData {
  id: string; // ID único del audio
  title: string;
  source: string; // Fuente del audio (ej: "Centro Jambatu", "Macaulay Library", etc.)
  url: string; // URL del audio
  duration?: string; // Duración en formato "MM:SS" o "HH:MM:SS"
  species?: string; // Nombre científico de la especie (opcional)
  location?: string; // Ubicación donde se grabó (opcional)
  date?: string; // Fecha de grabación (opcional)
}

export const audiosEcuador: AudioData[] = [
  {
    id: "audio-test-1",
    title: "Canto de Abalios",
    source: "Centro Jambatu",
    url: "https://multimedia20stg.blob.core.windows.net/especiesaudio/cc080B-Abalios_1.mp3",
    duration: "0:30",
    species: "Ablabes abalios",
    location: "Ecuador",
    date: "2024",
  },
];

export const audiosMundo: AudioData[] = [
  // Agrega aquí los audios de anfibios del mundo
  // Ejemplo:
  // {
  //   id: "audio-2",
  //   title: "Canto de Sapo",
  //   source: "Macaulay Library",
  //   url: "https://example.com/audio2.mp3",
  //   duration: "1:20",
  //   species: "Bufo bufo",
  //   location: "Europa",
  //   date: "2023-06-10",
  // },
];
