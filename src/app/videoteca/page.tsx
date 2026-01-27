"use client";

import {useEffect, useRef, useState} from "react";
import {ChevronLeft, ChevronRight, Search, Video} from "lucide-react";

import {videosEcuador, videosMundo, VideoData} from "./videos-data";
import {CompactSpeciesCard} from "@/components/compact-species-card";

interface EspecieItem {
  id: number;
  nombre_cientifico: string;
  nombre_comun: string | null;
  slug: string;
  orden?: string | null;
  familia?: string | null;
  genero?: string | null;
}

export default function VideotecaPage() {
  // Videos obtenidos manualmente desde videos-data.ts
  const ecuadorScrollRef = useRef<HTMLDivElement>(null);
  const mundoScrollRef = useRef<HTMLDivElement>(null);

  // Estados para búsqueda de especies
  const [searchInput, setSearchInput] = useState("");
  const [especies, setEspecies] = useState<EspecieItem[]>([]);
  const [loadingEspecies, setLoadingEspecies] = useState(false);

  const scroll = (ref: React.RefObject<HTMLDivElement>, direction: "left" | "right") => {
    if (!ref.current) return;
    const scrollAmount = 400; // Pixels a desplazar
    const currentScroll = ref.current.scrollLeft;
    const newScroll =
      direction === "left" ? currentScroll - scrollAmount : currentScroll + scrollAmount;

    ref.current.scrollTo({left: newScroll, behavior: "smooth"});
  };

  const [showEcuadorLeft, setShowEcuadorLeft] = useState(false);
  const [showEcuadorRight, setShowEcuadorRight] = useState(true);
  const [showMundoLeft, setShowMundoLeft] = useState(false);
  const [showMundoRight, setShowMundoRight] = useState(true);

  const checkScrollButtons = (
    ref: React.RefObject<HTMLDivElement>,
    setLeft: (v: boolean) => void,
    setRight: (v: boolean) => void,
  ) => {
    if (!ref.current) return;
    const {scrollLeft, scrollWidth, clientWidth} = ref.current;

    setLeft(scrollLeft > 0);
    setRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  // Verificar botones al cargar y al cambiar el tamaño de la ventana
  useEffect(() => {
    const checkButtons = () => {
      checkScrollButtons(ecuadorScrollRef, setShowEcuadorLeft, setShowEcuadorRight);
      checkScrollButtons(mundoScrollRef, setShowMundoLeft, setShowMundoRight);
    };

    checkButtons();
    window.addEventListener("resize", checkButtons);

    return () => {
      window.removeEventListener("resize", checkButtons);
    };
  }, [videosEcuador.length, videosMundo.length]);

  // Obtener especies cuando cambia el input de búsqueda (sin debounce para búsqueda dinámica)
  useEffect(() => {
    const fetchEspecies = async () => {
      setLoadingEspecies(true);
      try {
        const params = new URLSearchParams();

        if (searchInput.trim()) {
          params.set("search", searchInput.trim());
        }

        const response = await fetch(`/api/videoteca/especies?${params.toString()}`);

        if (!response.ok) throw new Error("Error al cargar especies");

        const data = await response.json();

        setEspecies(data);
      } catch (err) {
        console.error("Error al obtener especies:", err);
        setEspecies([]);
      } finally {
        setLoadingEspecies(false);
      }
    };

    fetchEspecies();
  }, [searchInput]);

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Videoteca</h1>
          <p className="mt-2 text-gray-600">
            Videos destacados sobre anfibios de Ecuador y del mundo del canal{" "}
            <a
              className="text-gray-700 transition-colors hover:text-gray-900 hover:underline"
              href="https://www.youtube.com/@ArcaDeLosSapos"
              rel="noopener noreferrer"
              target="_blank"
            >
              Arca de los Sapos
            </a>
          </p>
        </div>

        {/* Sección Anfibios Mundo */}
        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Anfibios mundo</h2>
              <p className="mt-1 text-sm text-gray-600">
                Videos destacados sobre Anfibios del mundo
              </p>
            </div>
            {videosMundo.length > 0 && (
              <a
                className="videoteca-play-button group flex items-center gap-2 rounded-lg bg-gray-200 px-4 py-2 no-underline shadow-md transition-all duration-200 hover:bg-gray-300 hover:shadow-lg"
                href="https://www.youtube.com/watch?v=kgtKCaB3zQc&list=PLWUDkVqYfUaqa0w8IHj9P33YJ6Ioc6Osr"
                rel="noopener noreferrer"
                target="_blank"
              >
                <svg
                  className="h-5 w-5 transition-transform duration-200 group-hover:scale-110"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                Reproducir todo
              </a>
            )}
          </div>

          {videosMundo.length > 0 ? (
            <div className="relative">
              {/* Botón izquierda */}
              {showMundoLeft && (
                <button
                  className="group focus-visible:ring-ring absolute top-[calc(50%-24px)] left-2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/70 p-0 text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-black/90 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                  type="button"
                  onClick={() => scroll(mundoScrollRef, "left")}
                >
                  <ChevronLeft className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
                </button>
              )}
              {/* Botón derecha */}
              {showMundoRight && (
                <button
                  className="group focus-visible:ring-ring absolute top-[calc(50%-24px)] right-2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/70 p-0 text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-black/90 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                  type="button"
                  onClick={() => scroll(mundoScrollRef, "right")}
                >
                  <ChevronRight className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
                </button>
              )}
              <div
                ref={mundoScrollRef}
                className="flex gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                onScroll={() =>
                  checkScrollButtons(mundoScrollRef, setShowMundoLeft, setShowMundoRight)
                }
              >
                {videosMundo.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
              <p className="text-gray-600">
                No hay videos configurados. Agrega videos en{" "}
                <code className="rounded bg-gray-200 px-2 py-1 text-sm">
                  src/app/videoteca/videos-data.ts
                </code>
              </p>
            </div>
          )}
        </section>

        {/* Sección Anfibios Ecuador */}
        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Anfibios Ecuador</h2>
              <p className="mt-1 text-sm text-gray-600">
                Videos destacados de SapoPediaEcuador (Enciclopedia Electrónica de los Anfibios de
                Ecuador)
              </p>
            </div>
            {videosEcuador.length > 0 && (
              <a
                className="videoteca-play-button group flex items-center gap-2 rounded-lg bg-gray-200 px-4 py-2 no-underline shadow-md transition-all duration-200 hover:bg-gray-300 hover:shadow-lg"
                href="https://www.youtube.com/watch?v=RItLaaBXezE&list=PL924D25DF138308ED"
                rel="noopener noreferrer"
                target="_blank"
              >
                <svg
                  className="h-5 w-5 transition-transform duration-200 group-hover:scale-110"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                Reproducir todo
              </a>
            )}
          </div>

          {videosEcuador.length > 0 ? (
            <div className="relative">
              {/* Botón izquierda */}
              {showEcuadorLeft && (
                <button
                  className="group focus-visible:ring-ring absolute top-[calc(50%-24px)] left-2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/70 p-0 text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-black/90 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                  type="button"
                  onClick={() => scroll(ecuadorScrollRef, "left")}
                >
                  <ChevronLeft className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
                </button>
              )}
              {/* Botón derecha */}
              {showEcuadorRight && (
                <button
                  className="group focus-visible:ring-ring absolute top-[calc(50%-24px)] right-2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/70 p-0 text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-black/90 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                  type="button"
                  onClick={() => scroll(ecuadorScrollRef, "right")}
                >
                  <ChevronRight className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
                </button>
              )}
              <div
                ref={ecuadorScrollRef}
                className="flex gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                onScroll={() =>
                  checkScrollButtons(ecuadorScrollRef, setShowEcuadorLeft, setShowEcuadorRight)
                }
              >
                {videosEcuador.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
              <p className="text-gray-600">
                No hay videos configurados. Agrega videos en{" "}
                <code className="rounded bg-gray-200 px-2 py-1 text-sm">
                  src/app/videoteca/videos-data.ts
                </code>
              </p>
            </div>
          )}
        </section>

        {/* Sección Búsqueda de Especies */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Videos por Especie</h2>
            <p className="mt-1 text-sm text-gray-600">Busca una especie para ver sus videos</p>
          </div>

          {/* Filtro de búsqueda */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                className="focus:border-primary focus:ring-primary/20 w-full rounded-lg border border-gray-300 bg-white py-2 pr-4 pl-10 text-sm focus:ring-2 focus:outline-none"
                placeholder="Buscar por nombre científico o común..."
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
          </div>

          {/* Lista de especies */}
          {loadingEspecies ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
              <p className="text-gray-600">Cargando especies...</p>
            </div>
          ) : especies.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {especies.map((especie) => (
                <CompactSpeciesCard
                  key={especie.id}
                  especie={especie}
                  href={`/sapopedia/species/${especie.slug}/videos?from=videoteca${searchInput.trim() ? `&search=${encodeURIComponent(searchInput.trim())}` : ""}`}
                  iconPosition="top-right"
                  icon={
                    <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-primary/20">
                      <Video className="h-4 w-4" />
                    </div>
                  }
                />
              ))}
            </div>
          ) : searchInput.trim() ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
              <p className="text-gray-600">
                No se encontraron especies con ese criterio de búsqueda.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
              <p className="text-gray-600">Escribe en el buscador para encontrar especies.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// Componente para mostrar una tarjeta de video
function VideoCard({video}: {video: VideoData}) {
  const formatViews = (views?: number) => {
    if (!views) return "";
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)} M`;
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)} K`;
    }

    return views.toString();
  };

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
            {/* Duración */}
            {video.duration && (
              <div className="absolute right-2 bottom-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-semibold text-white">
                {video.duration}
              </div>
            )}
          </div>

          {/* Información del video */}
          <div className="mt-2">
            <h3 className="group-hover:text-primary line-clamp-2 text-sm font-medium text-gray-900">
              {video.title}
            </h3>
            <p className="mt-1 text-xs text-gray-600">{video.channelTitle}</p>
            {(video.viewCount || video.publishedAt) && (
              <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                {video.viewCount && (
                  <>
                    <span>{formatViews(video.viewCount)} visualizaciones</span>
                    {video.publishedAt && <span>·</span>}
                  </>
                )}
                {video.publishedAt && <span>{video.publishedAt}</span>}
              </div>
            )}
          </div>
        </div>
      </a>
    </div>
  );
}
