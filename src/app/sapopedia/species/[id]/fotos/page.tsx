import {notFound} from "next/navigation";
import {ArrowLeft, Eye} from "lucide-react";
import Link from "next/link";

import {FotoData} from "@/app/fototeca/fotos-data";

import getFichaEspecie from "../get-ficha-especie";

import SpeciesFotosClient from "./SpeciesFotosClient";

interface PageProps {
  params: Promise<{id: string}>;
  searchParams: Promise<{[key: string]: string | string[] | undefined}>;
}

// Fotos de muestra (reemplazar con datos reales)
const fotosExternasMuestra: FotoData[] = [
  {
    id: "ext-1",
    title: "Ejemplar en hábitat natural",
    source: "iNaturalist",
    url: "https://via.placeholder.com/800x600?text=Foto+Externa+1",
    thumbnailUrl: "https://via.placeholder.com/280x280?text=Foto+Externa+1",
    species: "Especie ejemplo",
    location: "Ecuador",
    date: "2024",
  },
];

const fotosPropiasMuestra: FotoData[] = [
  {
    id: "propia-1",
    title: "Ejemplar en colección",
    source: "Centro Jambatu",
    url: "https://via.placeholder.com/800x600?text=Foto+Centro+Jambatu+1",
    thumbnailUrl: "https://via.placeholder.com/280x280?text=Foto+Centro+Jambatu+1",
    species: "Especie ejemplo",
    location: "Ecuador",
    date: "2024",
    photographer: "Centro Jambatu",
  },
];

export default async function SpeciesFotosPage({params, searchParams}: PageProps) {
  const {id} = await params;
  const searchParamsResolved = await searchParams;
  const fromFototeca = searchParamsResolved.from === "fototeca";
  const search = searchParamsResolved.search as string | undefined;

  // Decodificar el id de la URL
  const decodedId = decodeURIComponent(id);

  // Si es un número (id_ficha_especie), usarlo directamente
  // Si no es un número (nombre científico con guiones), reemplazar guiones por espacios
  const sanitizedId = /^\d+$/.test(decodedId) ? decodedId : decodedId.replaceAll("-", " ");

  // Obtener datos de la especie
  const fichaEspecie = await getFichaEspecie(sanitizedId);

  if (!fichaEspecie) {
    notFound();
  }

  const nombreCientifico = fichaEspecie.taxones?.[0]?.taxon
    ? `${fichaEspecie.taxones[0].taxonPadre?.taxon || ""} ${fichaEspecie.taxones[0].taxon}`.trim()
    : "";

  // Usar el id original de la URL para mantener la consistencia
  const especieUrl = `/sapopedia/species/${id}`;

  // Construir URL de regreso a fototeca con el estado de búsqueda
  const fototecaUrl = search ? `/fototeca?search=${encodeURIComponent(search)}` : "/fototeca";

  // Filtrar fotos por especie (en producción, esto vendría de la base de datos)
  const fotosExternos = fotosExternasMuestra;
  const fotosPropios = fotosPropiasMuestra;

  return (
    <SpeciesFotosClient
      especieUrl={especieUrl}
      fotosExternos={fotosExternos}
      fotosPropios={fotosPropios}
      fototecaUrl={fototecaUrl}
      fromFototeca={fromFototeca}
      nombreCientifico={nombreCientifico}
    />
  );
}
