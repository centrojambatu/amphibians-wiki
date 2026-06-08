"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {useSearchParams} from "next/navigation";
import {Check, MoveLeft, MoveRight, ChevronDown} from "lucide-react";
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

const ColeccionMiniMap = dynamic(() => import("@/components/ColeccionMiniMap"), {ssr: false});
const AudioSpectrogramOscillogram = dynamic(
  () => import("@/components/AudioSpectrogramOscillogram"),
  {ssr: false},
);
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type {
  Canto,
  Tejido,
  Sangre,
  Esperma,
  Heces,
  ExtractoPiel,
  PrestamoColeccion,
  PrestamoTejido,
  ColeccionPersonal,
  Identificacion,
  CuerpoAgua,
  FotografiaColeccion,
  VideoColeccion,
} from "./get-coleccion-relacionados";

interface ColeccionDetailClientProps {
  coleccion: any;
  cantos: Canto[];
  tejidos: Tejido[];
  sangres: Sangre[];
  espermas: Esperma[];
  heces: Heces[];
  extractosPiel: ExtractoPiel[];
  prestamosColeccion: PrestamoColeccion[];
  prestamosTejido: PrestamoTejido[];
  coleccionPersonal: ColeccionPersonal[];
  identificaciones: Identificacion[];
  cuerposAgua: CuerpoAgua[];
  fotografias: FotografiaColeccion[];
  videos: VideoColeccion[];
  especieUrl: string;
  coleccionesUrl: string;
  nombreCientifico?: string | null;
  nombreComun?: string | null;
  orden?: string | null;
  familia?: string | null;
  genero?: string | null;
}

const formatDate = (date: string | null | undefined): string => {
  if (!date) return "—";
  try {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = d.toLocaleDateString("es-ES", {month: "long"});
    const capitalMonth = month.charAt(0).toUpperCase() + month.slice(1);
    return `${day} ${capitalMonth} ${d.getFullYear()}`;
  } catch {
    return "—";
  }
};

const v = (val: any): string => {
  if (val === null || val === undefined || val === "") return "—";
  if (typeof val === "boolean") return val ? "Sí" : "No";
  return String(val);
};

/** Sección colapsable */
function Section({title, children, count}: {title: string; children: React.ReactNode; count?: number}) {
  return (
    <section className="border-t pt-6">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-500">
        {title} {count != null && <span className="text-gray-400">({count})</span>}
      </h2>
      {children}
    </section>
  );
}

/** Reproductor de video con poster + grayscale → color al reproducir (estilo videoteca) */
function VideoPreview({
  src,
  poster,
  onPlay,
}: {
  src: string;
  poster?: string | null;
  onPlay?: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
}) {
  const [paused, setPaused] = useState(true);
  return (
    <video
      className={`h-full w-full object-cover transition-[filter] duration-700 ease-in-out ${
        paused ? "grayscale group-hover:grayscale-0" : ""
      }`}
      controls
      poster={poster ?? undefined}
      preload="none"
      src={src}
      onPause={() => setPaused(true)}
      onPlay={(e) => {
        setPaused(false);
        onPlay?.(e);
      }}
    />
  );
}

/** Campo inline para grids tipo audioteca: omite valores vacíos */
function FieldInline({label, value}: {label: string; value: React.ReactNode}) {
  if (value == null || value === "") return null;
  return (
    <div className="flex flex-col leading-tight">
      <span className="text-[9px] font-medium uppercase tracking-wide text-gray-500">{label}</span>
      <span className="truncate text-xs text-gray-800">{value}</span>
    </div>
  );
}

/** Fila label:valor — muestra todos los campos, vacíos como "—" */
function Field({label, value}: {label: string; value: string}) {
  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 py-1.5 last:border-0">
      <span className="shrink-0 text-xs text-gray-500">{label}</span>
      <span className={`text-right text-xs font-medium ${value === "—" ? "text-gray-300" : "text-gray-900"}`}>
        {value}
      </span>
    </div>
  );
}

/** Bloque con título y campos */
function FieldGroup({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <div>
      <h3 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">{title}</h3>
      <div className="rounded-lg border border-gray-200 bg-white p-3">
        {children}
      </div>
    </div>
  );
}

/** Tabla de dos columnas (label | valor) para mostrar todos los campos */
function TwoColTable({title, rows}: {title: string; rows: [string, any][]}) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200 bg-gray-50 px-3 py-1.5">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-500">{title}</h3>
      </div>
      <table className="w-full text-xs">
        <tbody>
          {rows.map(([label, value], i) => (
            <tr key={label} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
              <td className="w-1/2 border-b border-gray-100 px-3 py-1.5 align-top text-gray-500">
                {label}
              </td>
              <td
                className={`w-1/2 border-b border-gray-100 px-3 py-1.5 align-top font-medium ${v(value) === "—" ? "text-gray-300" : "text-gray-900"}`}
              >
                {v(value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ColeccionDetailClient({
  coleccion,
  cantos,
  tejidos,
  sangres,
  espermas,
  heces,
  extractosPiel,
  prestamosColeccion,
  prestamosTejido,
  coleccionPersonal,
  identificaciones,
  cuerposAgua,
  fotografias,
  videos,
  especieUrl,
  coleccionesUrl,
  nombreCientifico,
  nombreComun,
  orden,
  familia,
  genero,
}: ColeccionDetailClientProps) {
  const c = coleccion;
  const searchParams = useSearchParams();
  const cameFromColecciones = searchParams?.get("from") === "colecciones";
  const cameFromMoleculoteca = searchParams?.get("from") === "moleculoteca";
  const moleculotecaTaxonId = searchParams?.get("taxonId");
  const backHref = cameFromMoleculoteca && moleculotecaTaxonId
    ? `/moleculoteca/${moleculotecaTaxonId}`
    : cameFromColecciones
      ? "/colecciones"
      : coleccionesUrl;

  const catalogoLabel = (() => {
    const acronimo = c.catalogo_museo?.includes(" - ")
      ? c.catalogo_museo.split(" - ").pop()
      : c.catalogo_museo;
    const numero = c.num_museo || c.sc || null;
    return [acronimo, numero].filter(Boolean).join(" ") || null;
  })();

  const hasCoords = c.latitud != null && c.longitud != null;

  // Tab activa para datos relacionados
  const [activeTab, setActiveTab] = useState("fotografias");
  // Canto abierto (mostrando oscilograma + espectrograma)

  // Lightbox para fotografías (estilo fototeca)
  const fotosConEnlace = useMemo(
    () => fotografias.filter((f) => f.enlace),
    [fotografias],
  );
  const [lightboxIndex, setLightboxIndex] = useState<number>(-1);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [carouselCanLeft, setCarouselCanLeft] = useState(false);
  const [carouselCanRight, setCarouselCanRight] = useState(false);
  const scrollCarousel = (dir: "left" | "right") => {
    const el = carouselRef.current;

    if (!el) return;
    const amount = el.clientWidth * 0.8;

    el.scrollBy({left: dir === "left" ? -amount : amount, behavior: "smooth"});
  };
  const updateCarouselScrollState = () => {
    const el = carouselRef.current;

    if (!el) return;
    setCarouselCanLeft(el.scrollLeft > 0);
    setCarouselCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    updateCarouselScrollState();
    const el = carouselRef.current;

    if (!el) return;
    el.addEventListener("scroll", updateCarouselScrollState, {passive: true});
    window.addEventListener("resize", updateCarouselScrollState);

    return () => {
      el.removeEventListener("scroll", updateCarouselScrollState);
      window.removeEventListener("resize", updateCarouselScrollState);
    };
  }, [fotosConEnlace.length]);

  const videosCarouselRef = useRef<HTMLDivElement>(null);
  const [videosCarouselCanLeft, setVideosCarouselCanLeft] = useState(false);
  const [videosCarouselCanRight, setVideosCarouselCanRight] = useState(false);
  const scrollVideosCarousel = (dir: "left" | "right") => {
    const el = videosCarouselRef.current;

    if (!el) return;
    const amount = el.clientWidth * 0.8;

    el.scrollBy({left: dir === "left" ? -amount : amount, behavior: "smooth"});
  };
  const updateVideosCarouselScrollState = () => {
    const el = videosCarouselRef.current;

    if (!el) return;
    setVideosCarouselCanLeft(el.scrollLeft > 0);
    setVideosCarouselCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    updateVideosCarouselScrollState();
    const el = videosCarouselRef.current;

    if (!el) return;
    el.addEventListener("scroll", updateVideosCarouselScrollState, {passive: true});
    window.addEventListener("resize", updateVideosCarouselScrollState);

    return () => {
      el.removeEventListener("scroll", updateVideosCarouselScrollState);
      window.removeEventListener("resize", updateVideosCarouselScrollState);
    };
  }, [videos.length]);
  const [fotoDims, setFotoDims] = useState<Record<string, {w: number; h: number}>>({});

  useEffect(() => {
    let cancelled = false;
    fotosConEnlace.forEach((f) => {
      if (!f.enlace || fotoDims[f.enlace]) return;
      const img = new Image();
      img.onload = () => {
        if (cancelled) return;
        setFotoDims((prev) => ({
          ...prev,
          [f.enlace as string]: {w: img.naturalWidth, h: img.naturalHeight},
        }));
      };
      img.src = f.enlace;
    });
    return () => {
      cancelled = true;
    };
  }, [fotosConEnlace, fotoDims]);

  const fotoSlides: Slide[] = useMemo(() => {
    const nombreEspecie = nombreCientifico ?? c.taxon_nombre ?? null;
    const catalogoFoto = (() => {
      const acron = c.catalogo_museo?.includes(" - ")
        ? c.catalogo_museo.split(" - ").pop()
        : c.catalogo_museo;
      return [acron, c.numero_museo].filter(Boolean).join(" ") || null;
    })();

    return fotosConEnlace.map((f) => {
      const lines: React.ReactNode[] = [];

      if (catalogoFoto) {
        lines.push(
          <span key="museo" style={{fontWeight: 600}}>
            {catalogoFoto}
          </span>,
        );
      }
      if (f.descripcion) lines.push(<span key="descripcion">{f.descripcion}</span>);
      if (f.localidad) lines.push(<span key="localidad">{f.localidad}</span>);
      const fechaFmt = f.fecha ? formatDate(f.fecha) : null;
      if (fechaFmt) lines.push(<span key="fecha">{fechaFmt}</span>);
      if (f.autor || f.tipo_licencia) {
        lines.push(
          <span key="autor">
            {f.autor}
            {f.autor && f.tipo_licencia && (
              <span style={{color: "#f07304", margin: "0 6px"}}>|</span>
            )}
            {f.tipo_licencia}
          </span>,
        );
      }

      const description =
        lines.length > 0 ? (
          <span style={{display: "block"}}>
            {lines.map((line, i) => (
              <span key={i} style={{display: "block"}}>
                {line}
              </span>
            ))}
          </span>
        ) : undefined;

      return {
        src: f.enlace || "",
        alt: nombreEspecie || f.nombre || "Fotografía",
        title: nombreEspecie ? (
          <span style={{paddingLeft: 56, display: "inline-block"}}>
            <i style={{fontStyle: "italic"}}>{nombreEspecie}</i>
          </span>
        ) : undefined,
        description: description as unknown as string,
      };
    });
  }, [fotosConEnlace, nombreCientifico, c.taxon_nombre, c.catalogo_museo, c.numero_museo]);

  // GBIF lookup
  const acronimo = c.catalogo_museo?.includes(" - ")
    ? c.catalogo_museo.split(" - ").pop()?.trim()
    : c.catalogo_museo;
  const [gbifUrl, setGbifUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!acronimo || !c.num_museo) return;
    const fetchGbif = async () => {
      try {
        let institutionCode = acronimo;
        let catNumber = String(c.num_museo);
        let collectionCode: string | null = null;
        switch (acronimo) {
          case "KU": collectionCode = "KUH"; break;
          case "QCAZA": institutionCode = "QCAZ"; catNumber = `QCAZA${c.num_museo}`; break;
          case "QCAZ": catNumber = `QCAZA${c.num_museo}`; break;
          case "AMNH": catNumber = `A-${c.num_museo}`; break;
          case "USNM": catNumber = `USNM ${c.num_museo}`; break;
          case "DHMECN": catNumber = `DHMECN ${c.num_museo}`; break;
        }
        const params = new URLSearchParams({institutionCode, catalogNumber: catNumber, classKey: "131", limit: "1"});
        if (collectionCode) params.set("collectionCode", collectionCode);
        const res = await fetch(`https://api.gbif.org/v1/occurrence/search?${params.toString()}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.results?.length > 0) {
          setGbifUrl(`https://www.gbif.org/occurrence/${data.results[0].key}`);
        }
      } catch { /* silently fail */ }
    };
    fetchGbif();
  }, [acronimo, c.num_museo]);

  return (
    <main className="container mx-auto max-w-5xl space-y-6 px-4 py-6">

      {/* Back link al origen */}
      <Link
        aria-label="Volver"
        className="text-muted-foreground inline-flex items-center hover:no-underline"
        href={backHref}
      >
        <MoveLeft className="h-8 w-8" strokeWidth={1} />
      </Link>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500">
        <Link className="hover:text-gray-900" href={especieUrl}>Especie</Link>
        <span>/</span>
        <Link className="hover:text-gray-900" href={coleccionesUrl}>Colecciones</Link>
        <span>/</span>
        <span className="font-medium text-gray-900">{catalogoLabel ?? "Detalle"}</span>
      </nav>

      {/* ═══ HEADER ═══ */}
      <div className="relative rounded-lg border border-gray-200 bg-white p-4">
        {(catalogoLabel || c.sc) && (
          <div className="flex items-baseline gap-2">
            {catalogoLabel && (
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h1 className="cursor-help text-base font-bold tracking-tight">
                      {catalogoLabel}
                    </h1>
                  </TooltipTrigger>
                  <TooltipContent className="px-2 py-0.5 text-[10px]">
                    # museo
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {c.sc && (
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help text-xs font-medium text-gray-500">
                      {c.sc}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="px-2 py-0.5 text-[10px]">
                    # campo
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}
        {(nombreCientifico ?? c.taxon_nombre) && (
          <Link
            className="block text-center text-4xl italic no-underline transition-opacity hover:opacity-80"
            href={especieUrl}
            style={{color: "#f07304"}}
          >
            {nombreCientifico ?? c.taxon_nombre}
          </Link>
        )}
      </div>

      {/* ═══ CARRUSEL DE FOTOS ═══ */}
      {fotosConEnlace.length > 0 && (
        <div>
          <div ref={carouselRef} className="flex gap-2 overflow-x-auto scroll-smooth">
            {fotosConEnlace.map((f, idx) => (
              <button
                key={f.id_fotografia ?? idx}
                aria-label={f.nombre || `Foto ${String(idx + 1)}`}
                className="relative h-40 w-64 flex-shrink-0 overflow-hidden rounded"
                type="button"
                onClick={() => setLightboxIndex(idx)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={f.nombre || "Fotografía"}
                  className="h-full w-full cursor-zoom-in object-cover grayscale transition-[filter] duration-700 ease-in-out hover:grayscale-0"
                  src={f.enlace as string}
                />
              </button>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-end gap-1">
            <button
              aria-label="Anterior"
              className="flex h-8 w-8 items-center justify-center text-gray-700 transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-30"
              disabled={!carouselCanLeft}
              type="button"
              onClick={() => scrollCarousel("left")}
            >
              <MoveLeft className="h-6 w-6" strokeWidth={1.5} />
            </button>
            <button
              aria-label="Siguiente"
              className="flex h-8 w-8 items-center justify-center text-gray-700 transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-30"
              disabled={!carouselCanRight}
              type="button"
              onClick={() => scrollCarousel("right")}
            >
              <MoveRight className="h-6 w-6" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}

      {/* ═══ MAPA — full width ═══ */}
      {hasCoords && (
        <div
          className="relative z-0 overflow-hidden rounded-lg border border-gray-200"
          style={{height: 350}}
        >
          <ColeccionMiniMap
            elevacion={c.altitud}
            latitud={c.latitud}
            localidad={c.detalle_localidad}
            longitud={c.longitud}
            nombreCientifico={nombreCientifico ?? c.taxon_nombre}
            nombreComun={nombreComun}
            provincia={c.provincia}
          />
        </div>
      )}

      {/* ═══ LOCALIZACIÓN — card bajo el mapa ═══ */}
      {(() => {
        const coordenadasInline =
          c.coordenadas ||
          (c.latitud != null && c.longitud != null
            ? `${String(c.latitud)}, ${String(c.longitud)}`
            : null);
        const lineaSecundaria: {label?: string; value: string}[] = [];

        if (c.provincia) lineaSecundaria.push({label: "Provincia", value: c.provincia});
        if (coordenadasInline) lineaSecundaria.push({value: coordenadasInline});
        if (c.fuente_coord) lineaSecundaria.push({value: c.fuente_coord});
        if (c.altitud != null) lineaSecundaria.push({value: `${String(c.altitud)} m`});

        const lineaAmbiental: {label?: string; value: string}[] = [];

        if (c.temperatura != null)
          lineaAmbiental.push({label: "Temperatura", value: `${String(c.temperatura)} °C`});
        if (c.humedad != null)
          lineaAmbiental.push({label: "Humedad", value: `${String(c.humedad)}%`});
        if (c.ph != null) lineaAmbiental.push({label: "pH", value: String(c.ph)});
        if (c.datos_ambientales)
          lineaAmbiental.push({label: "Datos ambientales", value: c.datos_ambientales});

        if (
          !c.localidad &&
          lineaSecundaria.length === 0 &&
          lineaAmbiental.length === 0 &&
          !c.habitat
        )
          return null;

        return (
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            {c.localidad && (
              <p className="mb-2 text-sm text-gray-900">{c.localidad}</p>
            )}
            {lineaSecundaria.length > 0 && (
              <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[13px] text-gray-800">
                {lineaSecundaria.map((it, i) => (
                  <span key={`${it.value}-${String(i)}`} className="inline-flex items-baseline gap-x-2">
                    {i > 0 && (
                      <span style={{color: "#f07304"}}>
                        |
                      </span>
                    )}
                    <span className="inline-flex items-baseline gap-x-1">
                      {it.label && (
                        <span className="text-xs text-gray-500">{it.label}</span>
                      )}
                      <span>{it.value}</span>
                    </span>
                  </span>
                ))}
              </p>
            )}
            {c.habitat && (
              <p className="mt-4 inline-flex items-baseline gap-x-1 text-[13px] text-gray-800">
                <span className="text-xs text-gray-500">Hábitat</span>
                <span>{c.habitat}</span>
              </p>
            )}
            {lineaAmbiental.length > 0 && (
              <p className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[13px] text-gray-800">
                {lineaAmbiental.map((it, i) => (
                  <span key={`${it.value}-${String(i)}`} className="inline-flex items-baseline gap-x-2">
                    {i > 0 && (
                      <span style={{color: "#f07304"}}>
                        |
                      </span>
                    )}
                    <span className="inline-flex items-baseline gap-x-1">
                      {it.label && (
                        <span className="text-xs text-gray-500">{it.label}</span>
                      )}
                      <span>{it.value}</span>
                    </span>
                  </span>
                ))}
              </p>
            )}
            {c.observacion && (
              <p className="mt-1 inline-flex items-baseline gap-x-1 text-[13px] text-gray-800">
                <span className="text-xs text-gray-500">Observación</span>
                <span>{c.observacion}</span>
              </p>
            )}
          </div>
        );
      })()}

      {/* ═══ RECOLECCIÓN — card bajo localización ═══ */}
      {(() => {
        const colectoresSecundarios = coleccionPersonal
          .filter((cp) => !cp.principal && cp.personal?.nombre)
          .map((cp) => cp.personal!.nombre!);
        const colectoresAdicionales =
          colectoresSecundarios.length > 0
            ? colectoresSecundarios.join(", ")
            : c.colectores || c.personal_adicional_nombres || null;
        const fecha = c.fecha_col ? formatDate(c.fecha_col) : null;

        const todosColectores = [c.personal_nombre, colectoresAdicionales]
          .filter(Boolean)
          .join(", ");

        const linea: {label?: string; value: string}[] = [];

        if (fecha) linea.push({label: "Fecha colección", value: fecha});
        if (c.hora) linea.push({label: "Hora", value: c.hora});
        if (todosColectores)
          linea.push({label: "Colectado por", value: todosColectores});

        if (linea.length === 0) return null;

        return (
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[13px] text-gray-800">
              {linea.map((it, i) => (
                <span key={`${it.value}-${String(i)}`} className="inline-flex items-baseline gap-x-2">
                  {i > 0 && (
                    <span style={{color: "#f07304"}}>|</span>
                  )}
                  <span className="inline-flex items-baseline gap-x-1">
                    {it.label && (
                      <span className="text-xs text-gray-500">{it.label}</span>
                    )}
                    <span>{it.value}</span>
                  </span>
                </span>
              ))}
            </p>
          </div>
        );
      })()}

      {/* ═══ ESPÉCIMEN — card bajo recolección ═══ */}
      {(() => {
        const linea: {label?: string; value: string}[] = [];

        if (c.sexo) linea.push({label: "Sexo", value: c.sexo});
        if (c.estadio) linea.push({label: "Estadio", value: c.estadio});
        if (c.svl != null) linea.push({label: "SVL", value: `${String(c.svl)} mm`});
        if (c.peso != null) linea.push({label: "Peso", value: `${String(c.peso)} g`});
        if (c.numero_individuos != null)
          linea.push({label: "N° individuos", value: String(c.numero_individuos)});
        if (c.condicion_reproductiva)
          linea.push({label: "Condición reproductiva", value: c.condicion_reproductiva});
        if (c.estatus_tipo) linea.push({label: "Estatus tipo", value: c.estatus_tipo});

        if (linea.length === 0) return null;

        return (
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[13px] text-gray-800">
              {linea.map((it, i) => (
                <span key={`${it.value}-${String(i)}`} className="inline-flex items-baseline gap-x-2">
                  {i > 0 && (
                    <span style={{color: "#f07304"}}>|</span>
                  )}
                  <span className="inline-flex items-baseline gap-x-1">
                    {it.label && (
                      <span className="text-xs text-gray-500">{it.label}</span>
                    )}
                    <span>{it.value}</span>
                  </span>
                </span>
              ))}
            </p>
          </div>
        );
      })()}

      {/* ═══ PRESERVACIÓN — card bajo espécimen ═══ */}
      {(() => {
        const linea: {label?: string; value: string}[] = [];

        if (c.metodo_fijacion) linea.push({label: "Fijado", value: c.metodo_fijacion});
        if (c.metodo_preservacion)
          linea.push({label: "Preservado", value: c.metodo_preservacion});
        if (c.identificado_por)
          linea.push({label: "Identificado por", value: c.identificado_por});
        if (c.fecha_identifica)
          linea.push({label: "Fecha identificación", value: formatDate(c.fecha_identifica)});

        if (linea.length === 0) return null;

        return (
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[13px] text-gray-800">
              {linea.map((it, i) => (
                <span key={`${it.value}-${String(i)}`} className="inline-flex items-baseline gap-x-2">
                  {i > 0 && (
                    <span style={{color: "#f07304"}}>|</span>
                  )}
                  <span className="inline-flex items-baseline gap-x-1">
                    {it.label && (
                      <span className="text-xs text-gray-500">{it.label}</span>
                    )}
                    <span>{it.value}</span>
                  </span>
                </span>
              ))}
            </p>
          </div>
        );
      })()}

      {/* ═══ INFORMACIÓN — card único ═══ */}
      {(() => {
        type Item = {label: string; value: any; unit?: string; italic?: boolean};
        const renderItem = (it: Item, i: number) => {
          const val = v(it.value);
          const isEmpty = val === "—";

          return (
            <div key={`${it.label}-${String(i)}`} className="min-w-0">
              <span className="block text-[10px] font-medium uppercase tracking-wide text-gray-400">
                {it.label}
              </span>
              <span
                className={`block break-words text-xs ${
                  isEmpty ? "text-gray-300" : "text-gray-900"
                } ${it.italic ? "italic" : ""}`}
              >
                {val}
                {!isEmpty && it.unit ? ` ${it.unit}` : ""}
              </span>
            </div>
          );
        };

        const SectionBlock = ({
          title,
          items,
        }: {
          title: string;
          items: Item[];
        }) => (
          <div className="border-t border-gray-100 px-4 py-3 first:border-t-0">
            <h3 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
              {title}
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 md:grid-cols-3 lg:grid-cols-4">
              {items.map(renderItem)}
            </div>
          </div>
        );

        // Agrupa muestras por nombre de subtipo (catalogo_awe.nombre) → conteo
        const groupBySubtipo = (
          items: {catalogo_awe: {nombre: string} | null}[],
        ): {nombre: string; n: number}[] => {
          const map = new Map<string, number>();

          items.forEach((it) => {
            const k = it.catalogo_awe?.nombre ?? "Sin tipo";

            map.set(k, (map.get(k) ?? 0) + 1);
          });

          return Array.from(map.entries())
            .map(([nombre, n]) => ({nombre, n}))
            .sort((a, b) => b.n - a.n);
        };

        const muestras: {label: string; total: number; subtipos: {nombre: string; n: number}[]}[] = [
          {label: "Tejido", total: tejidos.length, subtipos: groupBySubtipo(tejidos)},
          {label: "Sangre", total: sangres.length, subtipos: groupBySubtipo(sangres)},
          {label: "Esperma", total: espermas.length, subtipos: groupBySubtipo(espermas)},
          {label: "Heces", total: heces.length, subtipos: groupBySubtipo(heces)},
          {
            label: "Extracto piel",
            total: extractosPiel.length,
            subtipos: groupBySubtipo(extractosPiel),
          },
        ];

        return (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-1.5">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                Muestras biológicas
              </h3>
            </div>
            <div className="px-4 py-3">
              <ul className="flex flex-col gap-2">
                {muestras.map((m) => {
                  const tieneMuestras = m.total > 0;

                  return (
                    <li
                      key={m.label}
                      className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[13px]"
                    >
                      <span
                        className={`inline-flex items-center gap-x-1.5 ${
                          tieneMuestras ? "text-gray-900" : "text-gray-300"
                        }`}
                      >
                        <span className="text-xs font-semibold uppercase tracking-wide">
                          {m.label}
                        </span>
                        {tieneMuestras && (
                          <>
                            <Check
                              className="h-4 w-4"
                              strokeWidth={2.5}
                              style={{color: "#2d6e2d"}}
                            />
                            <span className="text-[11px] font-medium text-gray-500">
                              ({m.total})
                            </span>
                          </>
                        )}
                      </span>
                      {tieneMuestras && m.subtipos.length > 0 && (
                        <span className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-[12px] text-gray-700">
                          {m.subtipos.map((s, i) => (
                            <span key={s.nombre} className="inline-flex items-baseline gap-x-1.5">
                              {i > 0 && <span style={{color: "#f07304"}}>|</span>}
                              <span>
                                {s.nombre}{" "}
                                <span className="text-[11px] text-gray-500">({s.n})</span>
                              </span>
                            </span>
                          ))}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        );
      })()}


      {/* ═══ CARRUSEL DE VIDEOS ═══ */}
      {videos.length > 0 && (
        <div>
          <div ref={videosCarouselRef} className="flex gap-3 overflow-x-auto scroll-smooth">
            {videos.map((video) => {
              const fechaFmt = video.fecha ? formatDate(video.fecha) : null;

              return (
                <div
                  key={video.id_video}
                  className="flex w-80 flex-shrink-0 flex-col overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm"
                >
                  {video.enlace ? (
                    <video
                      controls
                      className="aspect-video w-full bg-black"
                      poster={video.thumbnail || undefined}
                      preload="metadata"
                      src={video.enlace}
                      onPlay={(e) => {
                        const current = e.currentTarget;

                        document
                          .querySelectorAll<HTMLMediaElement>("audio, video")
                          .forEach((m) => {
                            if (m !== current && !m.paused) m.pause();
                          });
                      }}
                    >
                      <track kind="captions" />
                      Tu navegador no soporta video.
                    </video>
                  ) : (
                    <div className="flex aspect-video w-full items-center justify-center bg-gray-100 text-xs text-gray-400">
                      Sin enlace de video
                    </div>
                  )}
                  <div className="p-3">
                    {video.nombre && (
                      <div className="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <span className="text-xs font-semibold text-gray-800">
                          {video.nombre}
                        </span>
                      </div>
                    )}
                    {video.descripcion && (
                      <p className="mt-1 line-clamp-2 text-xs text-gray-700">
                        {video.descripcion}
                      </p>
                    )}
                    {(video.autor || fechaFmt) && (
                      <p className="mt-0.5 flex flex-wrap items-baseline gap-x-2 text-[11px] text-gray-500">
                        {video.autor && <span>{video.autor}</span>}
                        {video.autor && fechaFmt && (
                          <span style={{color: "#f07304"}}>|</span>
                        )}
                        {fechaFmt && <span>{fechaFmt}</span>}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex items-center justify-end gap-1">
            <button
              aria-label="Anterior"
              className="flex h-8 w-8 items-center justify-center text-gray-700 transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-30"
              disabled={!videosCarouselCanLeft}
              type="button"
              onClick={() => scrollVideosCarousel("left")}
            >
              <MoveLeft className="h-6 w-6" strokeWidth={1.5} />
            </button>
            <button
              aria-label="Siguiente"
              className="flex h-8 w-8 items-center justify-center text-gray-700 transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-30"
              disabled={!videosCarouselCanRight}
              type="button"
              onClick={() => scrollVideosCarousel("right")}
            >
              <MoveRight className="h-6 w-6" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}

      {/* ═══ CANTOS — lista scrollable, al final de la ficha ═══ */}
      {cantos.length > 0 && (
        <div className="max-h-[480px] overflow-y-auto pr-1">
          <div className="flex flex-col gap-3">
            {cantos.map((canto) => {
              const coords =
                (canto as any).latitud != null && (canto as any).longitud != null
                  ? `${Number((canto as any).latitud).toFixed(5)}, ${Number((canto as any).longitud).toFixed(5)}`
                  : null;
              const parts: React.ReactNode[] = [];

              if (canto.localidad) parts.push(<span key="loc">{canto.localidad}</span>);
              if (coords) parts.push(<span key="coords">{coords}</span>);
              if (canto.temp != null)
                parts.push(
                  <span key="temp">
                    <span className="text-xs text-gray-500">temp</span>{" "}
                    {String(canto.temp)} °C
                  </span>,
                );
              if (canto.humedad != null)
                parts.push(
                  <span key="hum">
                    <span className="text-xs text-gray-500">humedad</span>{" "}
                    {String(canto.humedad)}%
                  </span>,
                );
              if (canto.nubosidad != null)
                parts.push(
                  <span key="nub">
                    <span className="text-xs text-gray-500">nubosidad</span>{" "}
                    {String(canto.nubosidad)}
                  </span>,
                );
              if (canto.distancia_micro != null)
                parts.push(
                  <span key="dist">
                    <span className="text-xs text-gray-500">distancia micro</span>{" "}
                    {String(canto.distancia_micro)} m
                  </span>,
                );
              const fechaFmt = canto.fecha ? formatDate(canto.fecha) : null;

              if (fechaFmt || canto.hora) {
                parts.push(
                  <span key="fecha">
                    {fechaFmt}
                    {fechaFmt && canto.hora && (
                      <span style={{color: "#f07304", margin: "0 6px"}}>|</span>
                    )}
                    {canto.hora}
                  </span>,
                );
              }
              if (canto.colector || canto.autor) {
                parts.push(
                  <span key="colector">
                    <span className="text-xs text-gray-500">grabado por</span>{" "}
                    {canto.colector || canto.autor}
                  </span>,
                );
              }

              return (
                <div
                  key={canto.id_canto}
                  className="rounded-md border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="mb-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    {canto.gui_aud && (
                      <span className="text-base font-semibold text-gray-700">
                        {canto.gui_aud}
                      </span>
                    )}
                    {canto.nombre && (
                      <span className="text-[11px] text-gray-600">· {canto.nombre}</span>
                    )}
                  </div>

                  {parts.length > 0 && (
                    <div className="text-[13px] text-gray-800">
                      {parts.flatMap((p, i) =>
                        i < parts.length - 1
                          ? [
                              p,
                              <span
                                key={`sep-${String(i)}`}
                                style={{color: "#f07304", margin: "0 6px"}}
                              >
                                |
                              </span>,
                            ]
                          : [p],
                      )}
                    </div>
                  )}

                  <div className="mt-3">
                    {canto.enlace ? (
                      <AudioSpectrogramOscillogram src={canto.enlace} />
                    ) : (
                      <p className="text-sm text-gray-500">
                        No hay enlace de audio disponible.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Lightbox
        captions={{descriptionTextAlign: "start", descriptionMaxLines: 8}}
        close={() => setLightboxIndex(-1)}
        controller={{closeOnBackdropClick: true}}
        counter={{container: {style: {top: 0, bottom: "unset"}}}}
        index={lightboxIndex < 0 ? 0 : lightboxIndex}
        open={lightboxIndex >= 0}
        plugins={[Captions, Counter, Fullscreen, Thumbnails, Zoom]}
        slides={fotoSlides}
        thumbnails={{position: "bottom", width: 80, height: 60, gap: 6}}
        zoom={{maxZoomPixelRatio: 4, scrollToZoom: true}}
      />
    </main>
  );
}
