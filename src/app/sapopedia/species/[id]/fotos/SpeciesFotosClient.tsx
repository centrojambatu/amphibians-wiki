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

function buildCaption(foto: SpeciesFotoItem, speciesUrlId: string): string {
  const parts: string[] = [];

  if (foto.catalogo_museo && foto.numero_museo) {
    parts.push(`${foto.catalogo_museo} ${foto.numero_museo}`);
  }
  if (foto.fecha) parts.push(foto.fecha);
  if (foto.autor) parts.push(`Por ${foto.autor}`);
  if (foto.tipo_licencia) parts.push(foto.tipo_licencia);
  const head = parts.join(" · ");
  const lines: string[] = [];

  if (head) lines.push(head);
  if (foto.localidad) lines.push(foto.localidad);
  if (foto.descripcion) lines.push(foto.descripcion);
  if (foto.observaciones) lines.push(foto.observaciones);
  if (foto.cita_corta) lines.push(foto.cita_corta);
  // speciesUrlId is reserved for future deep-linking from caption.
  void speciesUrlId;

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
        description: buildCaption(foto, speciesUrlId),
      })),
    [allItems, speciesUrlId],
  );

  const [lightboxIndex, setLightboxIndex] = useState<number>(-1);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [dims, setDims] = useState<Record<string, {w: number; h: number}>>({});
  const [gbifUrls, setGbifUrls] = useState<Record<string, string>>({});

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

  useEffect(() => {
    let cancelled = false;

    fotos.forEach((f) => {
      if (
        f.fuente !== "coleccion_externa" ||
        !f.catalogo_museo ||
        !f.numero_museo ||
        gbifUrls[f.id]
      )
        return;

      const fetchGbif = async () => {
        try {
          let institutionCode = f.catalogo_museo as string;
          let catNumber = f.numero_museo as string;
          let collectionCode: string | null = null;

          switch (f.catalogo_museo) {
            case "KU":
              collectionCode = "KUH";
              break;
            case "QCAZA":
              institutionCode = "QCAZ";
              catNumber = `QCAZA${String(f.numero_museo)}`;
              break;
            case "QCAZ":
              catNumber = `QCAZA${String(f.numero_museo)}`;
              break;
            case "AMNH":
              catNumber = `A-${String(f.numero_museo)}`;
              break;
            case "USNM":
              catNumber = `USNM ${String(f.numero_museo)}`;
              break;
            case "DHMECN":
              catNumber = `DHMECN ${String(f.numero_museo)}`;
              break;
          }
          const params = new URLSearchParams({
            institutionCode,
            catalogNumber: catNumber,
            classKey: "131",
            limit: "1",
          });

          if (collectionCode) params.set("collectionCode", collectionCode);
          const res = await fetch(
            `https://api.gbif.org/v1/occurrence/search?${params.toString()}`,
          );

          if (!res.ok || cancelled) return;
          const data = await res.json();

          if (data.results?.length > 0) {
            setGbifUrls((prev) => ({
              ...prev,
              [f.id]: `https://www.gbif.org/occurrence/${String(data.results[0].key)}`,
            }));
          }
        } catch {
          // silently fail
        }
      };

      void fetchGbif();
    });

    return () => {
      cancelled = true;
    };
  }, [fotos, gbifUrls]);

  const openLightbox = (foto: SpeciesFotoItem) => {
    const idx = allItems.findIndex((f) => f.id === foto.id);
    const finalIdx = idx >= 0 ? idx : 0;

    setLightboxIndex(finalIdx);
    setCurrentSlide(finalIdx);
  };

  const currentFoto = allItems[currentSlide];

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
      const gbifUrl = gbifUrls[currentFoto.id];

      if (!gbifUrl) return null;

      return (
        <a
          key="ctx-link"
          className="yarl__button"
          href={gbifUrl}
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
