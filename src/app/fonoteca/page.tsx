"use client";

import {useEffect, useRef, useState} from "react";
import {ChevronLeft, ChevronRight, Search, Volume2} from "lucide-react";
import {audiosEcuador, audiosMundo, AudioData} from "./audios-data";
import AudioSpectrogram from "@/components/AudioSpectrogram";

interface EspecieItem {
  id: number;
  nombre_cientifico: string;
  nombre_comun: string | null;
  slug: string;
}

export default function FonotecaPage() {
  // Audios obtenidos manualmente desde audios-data.ts
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
    const newScroll = direction === "left" ? currentScroll - scrollAmount : currentScroll + scrollAmount;
    ref.current.scrollTo({left: newScroll, behavior: "smooth"});
  };

  const [showEcuadorLeft, setShowEcuadorLeft] = useState(false);
  const [showEcuadorRight, setShowEcuadorRight] = useState(true);
  const [showMundoLeft, setShowMundoLeft] = useState(false);
  const [showMundoRight, setShowMundoRight] = useState(true);

  const checkScrollButtons = (ref: React.RefObject<HTMLDivElement>, setLeft: (v: boolean) => void, setRight: (v: boolean) => void) => {
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
  }, [audiosEcuador.length, audiosMundo.length]);

  // Obtener especies cuando cambia el input de búsqueda (sin debounce para búsqueda dinámica)
  useEffect(() => {
    const fetchEspecies = async () => {
      setLoadingEspecies(true);
      try {
        const params = new URLSearchParams();
        if (searchInput.trim()) {
          params.set("search", searchInput.trim());
        }

        const response = await fetch(`/api/fonoteca/especies?${params.toString()}`);

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
            <h1 className="text-4xl font-bold text-gray-900">Fonoteca</h1>
          <p className="mt-2 text-gray-600">
            Audios destacados sobre anfibios de Ecuador y del mundo
          </p>
        </div>

        {/* Sección Audios Externos */}
        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Audios externos</h2>
              <p className="mt-1 text-sm text-gray-600">Audios destacados de fuentes externas</p>
            </div>
          </div>

          {audiosMundo.length > 0 ? (
            <div className="relative">
              {/* Botón izquierda */}
              {showMundoLeft && (
                <button
                  className="group absolute left-2 top-[calc(50%-24px)] z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/70 p-0 text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-black/90 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => scroll(mundoScrollRef, "left")}
                  type="button"
                >
                  <ChevronLeft className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
                </button>
              )}
              {/* Botón derecha */}
              {showMundoRight && (
                <button
                  className="group absolute right-2 top-[calc(50%-24px)] z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/70 p-0 text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-black/90 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => scroll(mundoScrollRef, "right")}
                  type="button"
                >
                  <ChevronRight className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
                </button>
              )}
              <div
                className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                onScroll={() => checkScrollButtons(mundoScrollRef, setShowMundoLeft, setShowMundoRight)}
                ref={mundoScrollRef}
              >
                {audiosMundo.map((audio) => (
                  <AudioCard key={audio.id} audio={audio} />
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
              <p className="text-gray-600">
                No hay audios configurados. Agrega audios en{" "}
                <code className="rounded bg-gray-200 px-2 py-1 text-sm">src/app/fonoteca/audios-data.ts</code>
              </p>
            </div>
          )}
        </section>

        {/* Sección Audios Centro Jambatu */}
        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Audios Centro Jambatu</h2>
              <p className="mt-1 text-sm text-gray-600">
                Audios producidos por el Centro Jambatu
              </p>
            </div>
          </div>

          {audiosEcuador.length > 0 ? (
            <div className="relative">
              {/* Botón izquierda */}
              {showEcuadorLeft && (
                <button
                  className="group absolute left-2 top-[calc(50%-24px)] z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/70 p-0 text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-black/90 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => scroll(ecuadorScrollRef, "left")}
                  type="button"
                >
                  <ChevronLeft className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
                </button>
              )}
              {/* Botón derecha */}
              {showEcuadorRight && (
                <button
                  className="group absolute right-2 top-[calc(50%-24px)] z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/70 p-0 text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-black/90 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => scroll(ecuadorScrollRef, "right")}
                  type="button"
                >
                  <ChevronRight className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
                </button>
              )}
              <div
                className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                onScroll={() => checkScrollButtons(ecuadorScrollRef, setShowEcuadorLeft, setShowEcuadorRight)}
                ref={ecuadorScrollRef}
              >
                {audiosEcuador.map((audio) => (
                  <AudioCard key={audio.id} audio={audio} />
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
              <p className="text-gray-600">
                No hay audios configurados. Agrega audios en{" "}
                <code className="rounded bg-gray-200 px-2 py-1 text-sm">src/app/fonoteca/audios-data.ts</code>
              </p>
            </div>
          )}
        </section>

        {/* Sección Búsqueda de Especies */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Audios por Especie</h2>
            <p className="mt-1 text-sm text-gray-600">Busca una especie para ver sus audios</p>
          </div>

          {/* Filtro de búsqueda */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Buscar por nombre científico o común..."
                type="text"
                value={searchInput}
              />
            </div>
          </div>

          {/* Lista de especies */}
          {loadingEspecies ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
              <p className="text-gray-600">Cargando especies...</p>
            </div>
          ) : especies.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {especies.map((especie) => (
                <a
                  key={especie.id}
                  className="fonoteca-species-link group flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-primary hover:shadow-md no-underline"
                  href={`/sapopedia/species/${especie.slug}/audios?from=fonoteca${searchInput.trim() ? `&search=${encodeURIComponent(searchInput.trim())}` : ""}`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                    <Volume2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-medium text-gray-900 group-hover:text-primary">
                      {especie.nombre_cientifico}
                    </h3>
                    {especie.nombre_comun && (
                      <p className="truncate text-sm text-gray-600">{especie.nombre_comun}</p>
                    )}
                  </div>
                </a>
              ))}
            </div>
          ) : searchInput.trim() ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
              <p className="text-gray-600">No se encontraron especies con ese criterio de búsqueda.</p>
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

// Componente para mostrar una tarjeta de audio
function AudioCard({audio}: {audio: AudioData}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (audioEl) {
      // Esperar a que el audio esté listo
      const handleCanPlay = () => {
        setAudioElement(audioEl);
      };
      
      if (audioEl.readyState >= 2) {
        // Si ya está cargado, establecer inmediatamente
        setAudioElement(audioEl);
      } else {
        audioEl.addEventListener("canplay", handleCanPlay);
      }

      return () => {
        audioEl.removeEventListener("canplay", handleCanPlay);
      };
    }
  }, []);

  return (
    <div className="flex-shrink-0" style={{width: "320px"}}>
      <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-primary hover:shadow-md">
        {/* Reproductor de audio */}
        <div className="mb-3">
          <audio
            ref={audioRef}
            className="w-full"
            controls
            crossOrigin="anonymous"
            onError={(e) => {
              console.error("Error cargando audio:", e);
            }}
            onLoadedMetadata={() => {
              console.log("Audio metadata cargada:", audio.url);
            }}
            preload="metadata"
            src={audio.url}
          >
            Tu navegador no soporta el elemento de audio.
          </audio>
        </div>

        {/* Espectrograma */}
        <div className="mb-3">
          <AudioSpectrogram audioElement={audioElement} height={150} width={288} />
        </div>

        {/* Información del audio */}
        <div>
          <h3 className="line-clamp-2 text-sm font-medium text-gray-900 group-hover:text-primary">
            {audio.title}
          </h3>
          <p className="mt-1 text-xs text-gray-600">{audio.source}</p>
          {audio.species && (
            <p className="mt-1 text-xs text-gray-500 italic">{audio.species}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
            {audio.duration && (
              <span>Duración: {audio.duration}</span>
            )}
            {audio.location && (
              <span>• {audio.location}</span>
            )}
            {audio.date && (
              <span>• {audio.date}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
