import {notFound} from "next/navigation";
import getFichaEspecie from "../get-ficha-especie";
import {AudioData} from "@/app/fonoteca/audios-data";
import SpeciesAudiosClient from "./SpeciesAudiosClient";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    from?: string;
    search?: string;
  }>;
}

// Audios de muestra para todas las especies
const audiosExternosMuestra: AudioData[] = [
  {
    id: "audio-externo-1",
    title: "Canto de Rana - Ejemplo 1",
    source: "Macaulay Library",
    url: "https://example.com/audio1.mp3",
    duration: "0:45",
    species: "Rhaebo caeruleostictus",
    location: "Ecuador, Pichincha",
    date: "2024-01-15",
  },
  {
    id: "audio-externo-2",
    title: "Canto de Sapo - Ejemplo 2",
    source: "Xeno-canto",
    url: "https://example.com/audio2.mp3",
    duration: "1:20",
    species: "Rhaebo caeruleostictus",
    location: "Ecuador, Napo",
    date: "2023-06-10",
  },
  {
    id: "audio-externo-3",
    title: "Llamado de Anfibio - Ejemplo 3",
    source: "iNaturalist",
    url: "https://example.com/audio3.mp3",
    duration: "0:30",
    species: "Rhaebo caeruleostictus",
    location: "Ecuador, Pastaza",
    date: "2024-03-20",
  },
];

const audiosPropiosMuestra: AudioData[] = [
  {
    id: "audio-propio-1",
    title: "Canto de Rana - Centro Jambatu",
    source: "Centro Jambatu",
    url: "https://example.com/audio-propio1.mp3",
    duration: "0:55",
    species: "Rhaebo caeruleostictus",
    location: "Ecuador, Pichincha",
    date: "2024-02-01",
  },
  {
    id: "audio-propio-2",
    title: "Grabación de Campo - Centro Jambatu",
    source: "Centro Jambatu",
    url: "https://example.com/audio-propio2.mp3",
    duration: "1:15",
    species: "Rhaebo caeruleostictus",
    location: "Ecuador, Napo",
    date: "2024-01-20",
  },
  {
    id: "audio-propio-3",
    title: "Canto Nocturno - Centro Jambatu",
    source: "Centro Jambatu",
    url: "https://example.com/audio-propio3.mp3",
    duration: "0:40",
    species: "Rhaebo caeruleostictus",
    location: "Ecuador, Pastaza",
    date: "2024-03-15",
  },
];

export default async function SpeciesAudiosPage({params, searchParams}: PageProps) {
  const {id} = await params;
  const paramsSearch = await searchParams;

  // Decodificar el id de la URL
  const decodedId = decodeURIComponent(id);

  // Si es un número (id_ficha_especie), usarlo directamente
  // Si no es un número (nombre científico con guiones), reemplazar guiones por espacios
  const sanitizedId = /^\d+$/.test(decodedId) ? decodedId : decodedId.replaceAll("-", " ");

  const fichaEspecie = await getFichaEspecie(sanitizedId);

  if (!fichaEspecie) {
    notFound();
  }

  const nombreCientifico = fichaEspecie.taxones?.[0]?.taxon
    ? `${fichaEspecie.taxones[0].taxonPadre?.taxon || ""} ${fichaEspecie.taxones[0].taxon}`.trim()
    : "";

  const especieUrl = `/sapopedia/species/${id}`;
  const fromFonoteca = paramsSearch.from === "fonoteca";
  const searchQuery = paramsSearch.search || "";

  // Construir URL de regreso a fonoteca con el estado de búsqueda
  const fonotecaUrl = searchQuery
    ? `/fonoteca?search=${encodeURIComponent(searchQuery)}`
    : "/fonoteca";

  return (
    <SpeciesAudiosClient
      audiosExternos={audiosExternosMuestra}
      audiosPropios={audiosPropiosMuestra}
      especieUrl={especieUrl}
      fonotecaUrl={fonotecaUrl}
      fromFonoteca={fromFonoteca}
      nombreCientifico={nombreCientifico}
    />
  );
}
