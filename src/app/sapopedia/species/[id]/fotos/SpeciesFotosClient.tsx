"use client";

import {MoveLeft} from "lucide-react";
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
  orden?: string | null;
  ordenId?: number | null;
  familia?: string | null;
  familiaId?: number | null;
  genero?: string | null;
  generoId?: number | null;
  especieUrl: string;
  fromFototeca: boolean;
  fototecaUrl: string;
  fotos: SpeciesFotoItem[];
  speciesUrlId: string;
}

type AlbumPhoto = Photo & {item: SpeciesFotoItem};

function formatFechaEs(fecha: string | null | undefined): string | null {
  if (!fecha) return null;
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return null;
  const day = String(d.getUTCDate());
  const month = d.toLocaleDateString("es-ES", {month: "long", timeZone: "UTC"});
  const year = String(d.getUTCFullYear());
  return `${day} ${month} ${year}`;
}

function buildNumeroMuseo(foto: SpeciesFotoItem): string | null {
  const acronimo = foto.catalogo_museo?.includes(" - ")
    ? foto.catalogo_museo.split(" - ").pop()
    : foto.catalogo_museo;
  const numeroMuseo = [acronimo, foto.numero_museo].filter(Boolean).join(" ");
  return numeroMuseo || null;
}

function buildCaption(foto: SpeciesFotoItem, speciesUrlId: string): React.ReactNode {
  const lines: React.ReactNode[] = [];
  const numeroMuseo = buildNumeroMuseo(foto);

  if (numeroMuseo) {
    if (foto.fuente === "coleccion" && foto.coleccion_id) {
      lines.push(
        <a
          key="museo"
          className="citation-link"
          href={`/sapopedia/species/${speciesUrlId}/colecciones/${String(foto.coleccion_id)}`}
          rel="noopener noreferrer"
          style={{fontWeight: 600}}
          target="_blank"
        >
          {numeroMuseo}
        </a>,
      );
    } else if (foto.fuente === "coleccion_externa" && foto.catalogo_museo && foto.numero_museo) {
      const gbifSearchHref = `https://www.gbif.org/occurrence/search?q=${encodeURIComponent(
        [foto.catalogo_museo, foto.numero_museo].filter(Boolean).join(" ").trim(),
      )}`;
      lines.push(
        <a
          key="museo"
          className="citation-link"
          href={gbifSearchHref}
          rel="noopener noreferrer"
          style={{fontWeight: 600}}
          target="_blank"
        >
          {numeroMuseo}
        </a>,
      );
    } else {
      lines.push(
        <span key="museo" style={{fontWeight: 600}}>
          {numeroMuseo}
        </span>,
      );
    }
  }
  if (foto.descripcion) lines.push(<span key="descripcion">{foto.descripcion}</span>);
  if (foto.in_situ !== null && foto.in_situ !== undefined) {
    lines.push(
      <span key="in-situ" style={{fontStyle: "italic"}}>
        {foto.in_situ ? "in situ" : "ex situ"}
      </span>,
    );
  }
  if (foto.localidad) lines.push(<span key="localidad">{foto.localidad}</span>);
  const fechaFmt = formatFechaEs(foto.fecha);
  if (fechaFmt) lines.push(<span key="fecha">{fechaFmt}</span>);
  if (foto.autor || foto.tipo_licencia) {
    lines.push(
      <span key="autor">
        {foto.autor}
        {foto.autor && foto.tipo_licencia && (
          <span style={{color: "#f07304", margin: "0 6px"}}>|</span>
        )}
        {foto.tipo_licencia}
      </span>,
    );
  }

  if (lines.length === 0) return null;

  return (
    <span style={{display: "block"}}>
      {lines.map((line, i) => (
        <span key={i} style={{display: "block"}}>
          {line}
        </span>
      ))}
    </span>
  );
}

export default function SpeciesFotosClient({
  nombreCientifico,
  orden,
  ordenId,
  familia,
  familiaId,
  genero,
  generoId,
  especieUrl,
  fromFototeca,
  fototecaUrl,
  fotos,
  speciesUrlId,
}: SpeciesFotosClientProps) {
  const allItems = useMemo(() => fotos.filter((f) => f.enlace), [fotos]);

  const slides: Slide[] = useMemo(
    () =>
      allItems.map((foto) => ({
        src: foto.enlace || "",
        alt: nombreCientifico || foto.nombre || "",
        title: (
          <span style={{paddingLeft: 56, display: "inline-block"}}>
            <i style={{fontStyle: "italic"}}>{nombreCientifico}</i>
          </span>
        ) as unknown as string,
        description: buildCaption(foto, speciesUrlId),
      })),
    [allItems, speciesUrlId, nombreCientifico],
  );

  const [lightboxIndex, setLightboxIndex] = useState<number>(-1);
  const [, setCurrentSlide] = useState<number>(0);
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
            [f.enlace!]: {w: img.naturalWidth, h: img.naturalHeight},
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

  return (
    <div className="bg-background min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                aria-label="Volver"
                className="text-muted-foreground inline-flex items-center hover:no-underline"
                href={fromFototeca ? fototecaUrl : especieUrl}
              >
                <MoveLeft className="h-8 w-8" strokeWidth={1} />
              </Link>
            </div>
          </div>
          <h1 className="flex flex-wrap items-baseline gap-x-3 text-3xl font-bold text-gray-900">
            {orden && (
              <>
                <Link
                  className="text-base font-medium"
                  href={`/sapopedia/order/${String(ordenId ?? "")}`}
                  style={{color: "#006d1b"}}
                >
                  {orden}
                </Link>
                <span className="text-base text-gray-300">|</span>
              </>
            )}
            {familia && (
              <>
                <Link
                  className="text-base font-medium"
                  href={`/sapopedia/family/${String(familiaId ?? "")}`}
                  style={{color: "#006d1b"}}
                >
                  {familia}
                </Link>
                <span className="text-base text-gray-300">|</span>
              </>
            )}
            {genero && (
              <>
                <Link
                  className="text-base font-medium italic"
                  href={`/sapopedia/genus/${String(generoId ?? "")}`}
                  style={{color: "#006d1b"}}
                >
                  {genero}
                </Link>
                <span className="text-base text-gray-300">|</span>
              </>
            )}
            <Link className="italic" href={especieUrl} style={{color: "inherit"}}>
              {nombreCientifico}
            </Link>
          </h1>
        </div>

        {fotos.length === 0 ? (
          <p className="text-sm text-gray-500">No hay fotografías publicadas.</p>
        ) : (
          (() => {
            const albumPhotos: AlbumPhoto[] = allItems.map((f) => {
              const d = dims[f.enlace!];

              return {
                src: f.enlace || "",
                width: d?.w ?? 1200,
                height: d?.h ?? 1200,
                alt: f.nombre || "",
                item: f,
              };
            });

            return (
              <ColumnsPhotoAlbum
                columns={4}
                photos={albumPhotos}
                render={{
                  image: (props) => (
                    // eslint-disable-next-line jsx-a11y/alt-text
                    <img
                      {...props}
                      className="cursor-zoom-in rounded-md grayscale transition-[filter] duration-700 ease-in-out hover:grayscale-0"
                    />
                  ),
                }}
                spacing={6}
                onClick={({photo}) => openLightbox(photo.item)}
              />
            );
          })()
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
        toolbar={{buttons: ["close"]}}
        zoom={{maxZoomPixelRatio: 4, scrollToZoom: true}}
      />
    </div>
  );
}
