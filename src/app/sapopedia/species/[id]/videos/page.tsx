import {notFound} from "next/navigation";
import Link from "next/link";
import {ArrowLeft, Eye} from "lucide-react";
import getFichaEspecie from "../get-ficha-especie";
import {VideoData} from "@/app/videoteca/videos-data";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    from?: string;
    search?: string;
  }>;
}

// Videos de muestra para todas las especies
const videosExternosMuestra: VideoData[] = [
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
    id: "F2ZV6SJd0zU",
    title: "Finding frogs in the forest",
    channelTitle: "Centro Jambatu de Fundación Jambatu",
    thumbnail: "https://img.youtube.com/vi/F2ZV6SJd0zU/maxresdefault.jpg",
  },
];

const videosPropiosMuestra: VideoData[] = [
  {
    id: "j56Fy-8AH0Y",
    title: '"Una Alianza por el Jambato: Bitácora de actividades"',
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
    id: "Qk8r86wlyMc",
    title: "Un enfoque integral de ciencia y conservación",
    channelTitle: "Centro Jambatu de Fundación Jambatu",
    thumbnail: "https://img.youtube.com/vi/Qk8r86wlyMc/maxresdefault.jpg",
  },
];

function VideoCard({video}: {video: VideoData}) {
  return (
    <div className="flex-shrink-0" style={{width: "320px"}}>
      <a
        className="videoteca-video-link block no-underline"
        href={`https://www.youtube.com/watch?v=${video.id}`}
        rel="noopener noreferrer"
        target="_blank"
      >
        <div className="group relative cursor-pointer overflow-hidden rounded-lg">
          {/* Thumbnail */}
          <div className="relative aspect-video w-full overflow-hidden bg-gray-200">
            <img
              alt={video.title}
              className="h-full w-full object-cover grayscale transition-all duration-[800ms] ease-in-out group-hover:scale-105 group-hover:grayscale-0"
              src={video.thumbnail || `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
            />
          </div>

          {/* Información del video */}
          <div className="mt-2">
            <h3 className="line-clamp-2 text-sm font-medium text-gray-900 group-hover:text-primary">
              {video.title}
            </h3>
            <p className="mt-1 text-xs text-gray-600">{video.channelTitle}</p>
          </div>
        </div>
      </a>
    </div>
  );
}

export default async function SpeciesVideosPage({params, searchParams}: PageProps) {
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
  const fromVideoteca = paramsSearch.from === "videoteca";
  const searchQuery = paramsSearch.search || "";

  // Construir URL de regreso a videoteca con el estado de búsqueda
  const videotecaUrl = searchQuery
    ? `/videoteca?search=${encodeURIComponent(searchQuery)}`
    : "/videoteca";

  return (
    <div className="bg-background min-h-screen">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {fromVideoteca ? (
                <Link
                  className="videoteca-back-link inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-primary no-underline"
                  href={videotecaUrl}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver a Videoteca
                </Link>
              ) : (
                <Link
                  className="videoteca-back-link inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-primary no-underline"
                  href={especieUrl}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver a la ficha de la especie
                </Link>
              )}
            </div>
            <Link
              className="videoteca-view-species-link inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-primary no-underline"
              href={especieUrl}
            >
              <Eye className="h-4 w-4" />
              Ver ficha
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Videos de <span className="italic">{nombreCientifico}</span>
          </h1>
        </div>

        {/* Sección Videos Externos */}
        <section className="mb-12">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Videos externos</h2>
            <p className="mt-1 text-sm text-gray-600">Videos de fuentes externas relacionadas con esta especie</p>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {videosExternosMuestra.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </section>

        {/* Sección Videos Propios */}
        <section className="mb-12">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Videos propios</h2>
            <p className="mt-1 text-sm text-gray-600">Videos producidos por el Centro Jambatu</p>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {videosPropiosMuestra.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
