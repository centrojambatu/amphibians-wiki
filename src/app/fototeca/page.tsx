"use client";

import React, {useEffect, useRef, useState} from "react";
import {ChevronLeft, ChevronRight, Search, Image as ImageIcon, X} from "lucide-react";
import {fotosExternas, fotosCentroJambatu, FotoData} from "./fotos-data";
import Image from "next/image";

interface EspecieItem {
  id: number;
  nombre_cientifico: string;
  nombre_comun: string | null;
  slug: string;
  fotografia_ficha: string | null;
}

export default function FototecaPage() {
  const externasScrollRef = useRef<HTMLDivElement>(null);
  const centroJambatuScrollRef = useRef<HTMLDivElement>(null);

  // Estados para búsqueda de especies
  const [searchInput, setSearchInput] = useState("");
  const [especies, setEspecies] = useState<EspecieItem[]>([]);
  const [loadingEspecies, setLoadingEspecies] = useState(false);

  // Estado para el modal de imagen
  const [selectedImage, setSelectedImage] = useState<FotoData | null>(null);

  const scroll = (ref: React.RefObject<HTMLDivElement>, direction: "left" | "right") => {
    if (!ref.current) return;
    const scrollAmount = 400;
    const currentScroll = ref.current.scrollLeft;
    const newScroll = direction === "left" ? currentScroll - scrollAmount : currentScroll + scrollAmount;
    ref.current.scrollTo({left: newScroll, behavior: "smooth"});
  };

  const [showExternasLeft, setShowExternasLeft] = useState(false);
  const [showExternasRight, setShowExternasRight] = useState(true);
  const [showCentroJambatuLeft, setShowCentroJambatuLeft] = useState(false);
  const [showCentroJambatuRight, setShowCentroJambatuRight] = useState(true);

  const checkScrollButtons = (ref: React.RefObject<HTMLDivElement>, setLeft: (v: boolean) => void, setRight: (v: boolean) => void) => {
    if (!ref.current) return;
    const {scrollLeft, scrollWidth, clientWidth} = ref.current;
    setLeft(scrollLeft > 0);
    setRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const checkButtons = () => {
      checkScrollButtons(externasScrollRef, setShowExternasLeft, setShowExternasRight);
      checkScrollButtons(centroJambatuScrollRef, setShowCentroJambatuLeft, setShowCentroJambatuRight);
    };

    checkButtons();
    window.addEventListener("resize", checkButtons);

    return () => {
      window.removeEventListener("resize", checkButtons);
    };
  }, [fotosExternas.length, fotosCentroJambatu.length]);

  // Obtener especies cuando cambia el input de búsqueda
  useEffect(() => {
    const fetchEspecies = async () => {
      setLoadingEspecies(true);
      try {
        const params = new URLSearchParams();
        if (searchInput.trim()) {
          params.set("search", searchInput.trim());
        }

        const response = await fetch(`/api/fototeca/especies?${params.toString()}`);

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
          <h1 className="text-4xl font-bold text-gray-900">Fototeca</h1>
          <p className="mt-2 text-gray-600">Galería de fotografías de anfibios de Ecuador y del mundo</p>
        </div>

        {/* Sección Fotos Externas */}
        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Fotos externas</h2>
              <p className="mt-1 text-sm text-gray-600">Fotografías de fuentes externas</p>
            </div>
          </div>

          {fotosExternas.length > 0 ? (
            <div className="relative">
              {showExternasLeft && (
                <button
                  className="group absolute left-2 top-[calc(50%-24px)] z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/70 p-0 text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-black/90 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => scroll(externasScrollRef, "left")}
                  type="button"
                >
                  <ChevronLeft className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
                </button>
              )}
              {showExternasRight && (
                <button
                  className="group absolute right-2 top-[calc(50%-24px)] z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/70 p-0 text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-black/90 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => scroll(externasScrollRef, "right")}
                  type="button"
                >
                  <ChevronRight className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
                </button>
              )}
              <div
                className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                onScroll={() => checkScrollButtons(externasScrollRef, setShowExternasLeft, setShowExternasRight)}
                ref={externasScrollRef}
              >
                {fotosExternas.map((foto) => (
                  <FotoCard key={foto.id} foto={foto} onImageClick={() => setSelectedImage(foto)} />
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
              <p className="text-gray-600">
                No hay fotos configuradas. Agrega fotos en{" "}
                <code className="rounded bg-gray-200 px-2 py-1 text-sm">src/app/fototeca/fotos-data.ts</code>
              </p>
            </div>
          )}
        </section>

        {/* Sección Fotos Centro Jambatu */}
        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Fotos Centro Jambatu</h2>
              <p className="mt-1 text-sm text-gray-600">Fotografías producidas por el Centro Jambatu</p>
            </div>
          </div>

          {fotosCentroJambatu.length > 0 ? (
            <div className="relative">
              {showCentroJambatuLeft && (
                <button
                  className="group absolute left-2 top-[calc(50%-24px)] z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/70 p-0 text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-black/90 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => scroll(centroJambatuScrollRef, "left")}
                  type="button"
                >
                  <ChevronLeft className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
                </button>
              )}
              {showCentroJambatuRight && (
                <button
                  className="group absolute right-2 top-[calc(50%-24px)] z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/70 p-0 text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-black/90 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => scroll(centroJambatuScrollRef, "right")}
                  type="button"
                >
                  <ChevronRight className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
                </button>
              )}
              <div
                className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                onScroll={() => checkScrollButtons(centroJambatuScrollRef, setShowCentroJambatuLeft, setShowCentroJambatuRight)}
                ref={centroJambatuScrollRef}
              >
                {fotosCentroJambatu.map((foto) => (
                  <FotoCard key={foto.id} foto={foto} onImageClick={() => setSelectedImage(foto)} />
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
              <p className="text-gray-600">
                No hay fotos configuradas. Agrega fotos en{" "}
                <code className="rounded bg-gray-200 px-2 py-1 text-sm">src/app/fototeca/fotos-data.ts</code>
              </p>
            </div>
          )}
        </section>

        {/* Sección Búsqueda de Especies */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Fotos por Especie</h2>
            <p className="mt-1 text-sm text-gray-600">Busca una especie para ver sus fotos</p>
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
                  className="fototeca-species-link group flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-primary hover:shadow-md no-underline"
                  href={`/sapopedia/species/${especie.slug}/fotos?from=fototeca${searchInput.trim() ? `&search=${encodeURIComponent(searchInput.trim())}` : ""}`}
                >
                  {especie.fotografia_ficha ? (
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                      <img
                        alt={especie.nombre_cientifico}
                        className="h-full w-full object-cover grayscale transition-all duration-[800ms] ease-in-out group-hover:scale-105 group-hover:grayscale-0"
                        src={especie.fotografia_ficha}
                      />
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-primary/10 transition-colors group-hover:bg-primary/20">
                      <ImageIcon className="h-6 w-6 text-primary" />
                    </div>
                  )}
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

      {/* Modal de imagen */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <button
              className="absolute right-2 top-2 z-10 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-6 w-6" />
            </button>
            <div className="relative">
              <Image
                alt={selectedImage.title}
                className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
                height={800}
                src={selectedImage.url}
                width={1200}
              />
              <div className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-black/70 p-4 text-white">
                <h3 className="text-lg font-semibold">{selectedImage.title}</h3>
                {selectedImage.source && <p className="text-sm opacity-90">Fuente: {selectedImage.source}</p>}
                {selectedImage.photographer && <p className="text-sm opacity-90">Fotógrafo: {selectedImage.photographer}</p>}
                {selectedImage.description && <p className="mt-2 text-sm opacity-80">{selectedImage.description}</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente para mostrar una tarjeta de foto
function FotoCard({foto, onImageClick}: {foto: FotoData; onImageClick: () => void}) {
  return (
    <div className="flex-shrink-0" style={{width: "280px"}}>
      <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:border-primary hover:shadow-md">
        <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
          <Image
            alt={foto.title}
            className="h-full w-full cursor-pointer object-cover transition-transform duration-300 group-hover:scale-105"
            height={280}
            onClick={onImageClick}
            src={foto.thumbnailUrl || foto.url}
            width={280}
          />
        </div>
        <div className="p-3">
          <h3 className="line-clamp-2 text-sm font-medium text-gray-900 group-hover:text-primary">
            {foto.title}
          </h3>
          <p className="mt-1 text-xs text-gray-600">{foto.source}</p>
          {foto.species && (
            <p className="mt-1 text-xs text-gray-500 italic">{foto.species}</p>
          )}
        </div>
      </div>
    </div>
  );
}
