"use client";

import {ArrowLeft, ExternalLink, Eye} from "lucide-react";
import Link from "next/link";
import {useEffect, useMemo, useState} from "react";
import {ColumnsPhotoAlbum, type Photo} from "react-photo-album";
import "react-photo-album/columns.css";
import Lightbox, {type Slide} from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import "yet-another-react-lightbox/plugins/counter.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

import {useGbifOccurrence} from "@/lib/gbif";

import {SpeciesFotoItem} from "./types";

interface SpeciesFotosClientProps {
  nombreCientifico: string;
  especieUrl: string;
  fromFototeca: boolean;
  fototecaUrl: string;
  fotos: SpeciesFotoItem[];
  speciesUrlId: string;
}

type AlbumPhoto = Photo & {item: SpeciesFotoItem};

function buildCaption(foto: SpeciesFotoItem): string {
  const lines: string[] = [];

  if (foto.descripcion) lines.push(foto.descripcion);
  if (foto.autor) lines.push(`Autor: ${foto.autor}`);
  if (foto.localidad) lines.push(`Localidad: ${foto.localidad}`);
  if (foto.latitud != null) lines.push(`Latitud: ${String(foto.latitud)}`);
  if (foto.longitud != null) lines.push(`Longitud: ${String(foto.longitud)}`);

  return lines.join("\n");
}

export default function SpeciesFotosClient({
  nombreCientifico,
  especieUrl,
  fromFototeca,
  fototecaUrl,
  fotos,
  speciesUrlId,
}: SpeciesFotosClientProps) {
  const groups = useMemo(() => {
    const map = new Map<string, SpeciesFotoItem[]>();

    fotos.forEach((f) => {
      const key = f.categoria || "Sin categoría";
      const arr = map.get(key) ?? [];

      arr.push(f);
      map.set(key, arr);
    });

    return Array.from(map.entries());
  }, [fotos]);

  const allItems = useMemo(() => fotos.filter((f) => f.enlace), [fotos]);

  const slides: Slide[] = useMemo(
    () =>
      allItems.map((foto) => ({
        src: foto.enlace || "",
        alt: foto.nombre || "Fotografía",
        title: foto.nombre || undefined,
        description: buildCaption(foto),
      })),
    [allItems],
  );

  const [lightboxIndex, setLightboxIndex] = useState<number>(-1);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [dims, setDims] = useState<Record<string, {w: number; h: number}>>({});

  useEffect(() => {
    let cancelled = false;

    fotos.forEach((f) => {
      if (!f.enlace || dims[f.enlace]) return;
      const img = new Image();

      img.onload = () => {
        if (!cancelled) {
          setDims((prev) => ({
            ...prev,
            [f.enlace as string]: {w: img.naturalWidth, h: img.naturalHeight},
          }));
        }
      };
      img.src = f.enlace;
    });

    return () => {
      cancelled = true;
    };
  }, [fotos, dims]);

  const openLightbox = (foto: SpeciesFotoItem) => {
    const idx = allItems.findIndex((f) => f.id === foto.id);
    const finalIdx = idx >= 0 ? idx : 0;

    setLightboxIndex(finalIdx);
    setCurrentSlide(finalIdx);
  };

  const currentFoto = allItems[currentSlide];
  const {data: currentGbifUrl} = useGbifOccurrence(
    currentFoto?.fuente === "coleccion_externa" ? currentFoto.catalogo_museo : null,
    currentFoto?.fuente === "coleccion_externa" ? currentFoto.numero_museo : null,
  );

  const linkButton = (() => {
    if (!currentFoto) return null;
    if (currentFoto.fuente === "coleccion" && currentFoto.coleccion_id) {
      return (
        <a
          key="ctx-link"
          className="yarl__button"
          href={`/sapopedia/species/${speciesUrlId}/colecciones/${String(currentFoto.coleccion_id)}`}
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "0 10px",
            fontSize: 12,
            fontWeight: 600,
          }}
          target="_blank"
        >
          Ver colección
          <ExternalLink size={14} />
        </a>
      );
    }
    if (currentFoto.fuente === "coleccion_externa") {
      if (!currentGbifUrl) return null;

      return (
        <a
          key="ctx-link"
          className="yarl__button"
          href={currentGbifUrl}
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "0 10px",
            fontSize: 12,
            fontWeight: 600,
          }}
          target="_blank"
        >
          Ver en GBIF
          <ExternalLink size={14} />
        </a>
      );
    }

    return null;
  })();

  return (
    <div className="bg-background min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {fromFototeca ? (
                <Link
                  className="hover:text-primary inline-flex items-center gap-2 text-sm text-gray-600 no-underline transition-colors"
                  href={fototecaUrl}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver a Fototeca
                </Link>
              ) : (
                <Link
                  className="hover:text-primary inline-flex items-center gap-2 text-sm text-gray-600 no-underline transition-colors"
                  href={especieUrl}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver a la ficha de la especie
                </Link>
              )}
            </div>
            <Link
              className="hover:text-primary inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 no-underline transition-colors hover:bg-gray-50"
              href={especieUrl}
            >
              <Eye className="h-4 w-4" />
              Ver ficha
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Fotos de <span className="italic">{nombreCientifico}</span>
          </h1>
        </div>

        {fotos.length === 0 ? (
          <p className="text-sm text-gray-500">No hay fotografías publicadas.</p>
        ) : (
          <div className="space-y-10">
            {groups.map(([categoria, items]) => {
              const albumPhotos: AlbumPhoto[] = items
                .filter((f) => f.enlace)
                .map((f) => {
                  const d = dims[f.enlace as string];

                  return {
                    src: f.enlace || "",
                    width: d?.w ?? 1200,
                    height: d?.h ?? 1200,
                    alt: f.nombre || "Fotografía",
                    item: f,
                  };
                });

              return (
                <section key={categoria}>
                  <h2 className="mb-3 text-lg font-bold text-gray-900">
                    {categoria}
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({items.length})
                    </span>
                  </h2>
                  {albumPhotos.length === 0 ? (
                    <p className="text-sm text-gray-400">Sin imágenes.</p>
                  ) : (
                    <ColumnsPhotoAlbum
                      columns={4}
                      photos={albumPhotos}
                      render={{
                        image: (props) => (
                          // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
                          <img
                            {...props}
                            className="cursor-zoom-in rounded-md grayscale transition-[filter] duration-700 ease-in-out hover:grayscale-0"
                          />
                        ),
                        extras: (_, {photo}) => {
                          const item = (photo as AlbumPhoto).item;

                          if (!item.descripcion) return null;

                          return (
                            <div
                              aria-hidden
                              className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-md bg-gradient-to-t from-black/80 via-black/40 to-transparent px-2 py-1.5 text-[11px] font-medium text-white"
                            >
                              <span className="line-clamp-2">{item.descripcion}</span>
                            </div>
                          );
                        },
                      }}
                      spacing={6}
                      onClick={({photo}) => openLightbox((photo as AlbumPhoto).item)}
                    />
                  )}
                </section>
              );
            })}
          </div>
        )}
      </main>

      <Lightbox
        captions={{descriptionTextAlign: "start", descriptionMaxLines: 8}}
        close={() => setLightboxIndex(-1)}
        controller={{closeOnBackdropClick: true}}
        counter={{container: {style: {top: 0, bottom: "unset"}}}}
        index={lightboxIndex < 0 ? 0 : lightboxIndex}
        on={{view: ({index}) => setCurrentSlide(index)}}
        open={lightboxIndex >= 0}
        plugins={[Captions, Counter, Fullscreen, Thumbnails, Zoom]}
        slides={slides}
        thumbnails={{position: "bottom", width: 80, height: 60, gap: 6}}
        toolbar={{buttons: [...(linkButton ? [linkButton] : []), "close"]}}
        zoom={{maxZoomPixelRatio: 4, scrollToZoom: true}}
      />
    </div>
  );
}
