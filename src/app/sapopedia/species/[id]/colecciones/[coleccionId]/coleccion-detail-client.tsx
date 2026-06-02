"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {useSearchParams} from "next/navigation";
import {MoveLeft, ChevronDown} from "lucide-react";
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
import type {
  Canto,
  Tejido,
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
    return `${day} ${capitalMonth} de ${d.getFullYear()}`;
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
        paused ? "grayscale" : ""
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
  const [openCantoId, setOpenCantoId] = useState<number | null>(null);

  // Lightbox para fotografías (estilo fototeca)
  const fotosConEnlace = useMemo(
    () => fotografias.filter((f) => f.enlace),
    [fotografias],
  );
  const [lightboxIndex, setLightboxIndex] = useState<number>(-1);
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

  const fotoSlides: Slide[] = useMemo(
    () =>
      fotosConEnlace.map((f) => {
        const lines: string[] = [];
        if (f.tipo) lines.push(`Tipo: ${f.tipo}`);
        if (f.autor) lines.push(`Autor: ${f.autor}`);
        if (f.localidad) lines.push(`Localidad: ${f.localidad}`);
        if (f.fecha) lines.push(`Fecha: ${formatDate(f.fecha)}`);
        if (f.descripcion) lines.push(f.descripcion);
        return {
          src: f.enlace || "",
          alt: f.nombre || "Fotografía",
          title: f.nombre ? (
            <span style={{paddingLeft: 56, display: "inline-block"}}>{f.nombre}</span>
          ) : undefined,
          description: lines.join("\n"),
        };
      }),
    [fotosConEnlace],
  );

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
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {catalogoLabel && (
              <h1 className="text-2xl font-bold tracking-tight">{catalogoLabel}</h1>
            )}
            {(nombreCientifico ?? c.taxon_nombre) && (
              <p className="text-base italic" style={{color: "#f07304"}}>
                {nombreCientifico ?? c.taxon_nombre}
              </p>
            )}
            {(orden || familia || genero) && (
              <p className="mt-0.5 text-xs text-gray-400">
                {[orden, familia, genero].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {c.fecha_coleccion && (
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium">{formatDate(c.fecha_coleccion)}</span>
            )}
            {gbifUrl && (
              <a
                href={gbifUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded border border-[#4ba24b]/30 bg-[#4ba24b]/5 px-2.5 py-1 text-xs font-semibold text-[#4ba24b] transition-colors hover:bg-[#4ba24b]/15"
              >
                <img src="/assets/references/gbif.png" alt="GBIF" className="h-4 w-auto" />
                Ver en GBIF
              </a>
            )}
          </div>
        </div>
        {/* Colectores */}
        <div className="mt-2 text-xs text-gray-600">
          <span className="font-medium">{v(c.personal_nombre)}</span>
          {(() => {
            const secundarios = coleccionPersonal
              .filter((cp) => !cp.principal && cp.personal?.nombre)
              .map((cp) => cp.personal!.nombre!);
            const colectoresTexto = secundarios.length > 0
              ? secundarios.join(", ")
              : c.colectores || c.personal_adicional_nombres || null;
            return colectoresTexto ? <span className="text-gray-400"> · {colectoresTexto}</span> : null;
          })()}
        </div>
      </div>

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

        const muestrasFields: {key: string; label: string}[] = [
          {key: "sangre", label: "Sangre"},
          {key: "piel_exudado", label: "Piel exudado"},
          {key: "piel_liofilizado", label: "Piel liofilizado"},
          {key: "tejido_higado", label: "Tejido hígado"},
          {key: "tejido_musculo", label: "Tejido músculo"},
          {key: "esqueleto_transparentacion", label: "Esqueleto"},
          {key: "esperma", label: "Esperma"},
          {key: "heces", label: "Heces"},
        ];

        // Catálogo CJ: acrónimo + número de museo (ej. "CJ TEST-CJ-001")
        const acronimoCJ = c.catalogo_museo?.includes(" - ")
          ? c.catalogo_museo.split(" - ").pop()
          : c.catalogo_museo;
        const catalogoCJ = [acronimoCJ, c.numero_museo].filter(Boolean).join(" ") || null;

        // Coordenadas: usa el campo texto si existe, sino concatena lat/lon
        const coordenadas =
          c.coordenadas ||
          (c.latitud != null && c.longitud != null
            ? `${String(c.latitud)}, ${String(c.longitud)}`
            : null);

        return (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <SectionBlock
              items={[
                {label: "Catálogo CJ", value: catalogoCJ},
                {label: "N° campo (SC)", value: c.sc},
                {label: "Familia", value: familia},
                {label: "Especie", value: nombreCientifico ?? c.taxon_nombre, italic: true},
              ]}
              title="Identificación"
            />

            <SectionBlock
              items={[
                {label: "Localidad", value: c.localidad},
                {label: "Provincia", value: c.provincia},
                {label: "Coordenadas", value: coordenadas},
                {label: "Fuente coordenadas", value: c.fuente_coord},
                {label: "Altitud", value: c.elevacion, unit: "msnm"},
                {label: "Hábitat", value: c.habitat},
              ]}
              title="Localización"
            />

            <SectionBlock
              items={[
                {label: "Fecha colección", value: c.fecha_col ? formatDate(c.fecha_col) : null},
                {label: "Hora", value: c.hora},
                {label: "Colector(es) principal", value: c.personal_nombre},
                {label: "Colectores adicionales", value: c.colectores},
              ]}
              title="Recolección"
            />

            <SectionBlock
              items={[
                {label: "Sexo", value: c.sexo},
                {label: "Estadio", value: c.estadio},
                {label: "SVL", value: c.svl, unit: "mm"},
                {label: "Peso", value: c.peso, unit: "g"},
                {label: "N° individuos", value: c.numero_individuos},
                {label: "Estado", value: c.estado},
                {label: "Estatus tipo", value: c.estatus_tipo},
                {label: "Condición reproductiva", value: c.condicion_reproductiva},
              ]}
              title="Espécimen"
            />

            <SectionBlock
              items={[
                {label: "Fijado en", value: c.metodo_fijacion},
                {label: "Preservado en", value: c.metodo_preservacion},
                {label: "Identificado por", value: c.identificado_por},
                {label: "Fecha identificación", value: c.fecha_identifica ? formatDate(c.fecha_identifica) : null},
              ]}
              title="Preservación e identificación"
            />

            <SectionBlock
              items={[
                {label: "Temperatura", value: c.temperatura, unit: "°C"},
                {label: "Humedad", value: c.humedad, unit: "%"},
                {label: "pH", value: c.ph},
                {label: "Datos ambientales", value: c.datos_ambientales},
              ]}
              title="Condiciones ambientales"
            />

            {/* Muestras biológicas — explícito Sí/No por cada tipo */}
            <div className="border-t border-gray-100 px-4 py-3">
              <h3 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                Muestras biológicas
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 md:grid-cols-3 lg:grid-cols-4">
                {muestrasFields.map((m) => {
                  const active = Boolean(c[m.key]);

                  return (
                    <div key={m.key} className="flex items-center justify-between gap-2 rounded-md border border-gray-100 px-2 py-1">
                      <span className="text-xs text-gray-700">{m.label}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {active ? "Sí" : "No"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Observaciones */}
            {c.observacion && (
              <div className="border-t border-gray-100 px-4 py-3">
                <h3 className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Observaciones
                </h3>
                <p className="text-xs leading-relaxed text-gray-700 italic">
                  {c.observacion}
                </p>
              </div>
            )}
          </div>
        );
      })()}


      {/* ═══ TABS DE DATOS RELACIONADOS ═══ */}
      {(() => {
        const tabs: {id: string; label: string; count: number}[] = [
          {id: "fotografias", label: "Fotografías", count: fotosConEnlace.length},
          {id: "cantos", label: "Cantos", count: cantos.length},
          {id: "videos", label: "Videos", count: videos.length},
        ];

        const pauseOtherMedia = (e: React.SyntheticEvent<HTMLMediaElement>) => {
          const current = e.currentTarget;

          document
            .querySelectorAll<HTMLMediaElement>("audio, video")
            .forEach((m) => {
              if (m !== current && !m.paused) m.pause();
            });
        };

        return (
          <div>
            {/* Tab buttons */}
            <div className="flex gap-1 overflow-x-auto border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`shrink-0 border-b-2 px-4 py-2.5 text-xs font-medium transition-colors ${
                    activeTab === tab.id
                      ? "border-[#f07304] text-[#f07304]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label} <span className="ml-1 text-gray-400">({tab.count})</span>
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="pt-4">

              {/* Fotografías — estilo fototeca (mosaico + lightbox) */}
              {activeTab === "fotografias" && (fotosConEnlace.length > 0 ? (
                (() => {
                  type AlbumPhoto = Photo & {idx: number};
                  const albumPhotos: AlbumPhoto[] = fotosConEnlace.map((f, idx) => {
                    const d = fotoDims[f.enlace as string];
                    return {
                      src: f.enlace || "",
                      width: d?.w ?? 1200,
                      height: d?.h ?? 1200,
                      alt: f.nombre || "Fotografía",
                      idx,
                    };
                  });
                  return (
                    <ColumnsPhotoAlbum
                      columns={3}
                      photos={albumPhotos}
                      render={{
                        // eslint-disable-next-line @next/next/no-img-element
                        image: (props) => (
                          // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
                          <img
                            {...props}
                            className="cursor-zoom-in rounded-md grayscale transition-[filter] duration-700 ease-in-out hover:grayscale-0"
                          />
                        ),
                      }}
                      spacing={6}
                      onClick={({photo}) => setLightboxIndex((photo as AlbumPhoto).idx)}
                    />
                  );
                })()
              ) : <p className="py-8 text-center text-sm text-gray-400">Sin registros</p>)}

              {/* Cantos — estilo audioteca (card completo con oscilograma + espectrograma) */}
              {activeTab === "cantos" && (cantos.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {cantos.map((canto) => {
                    const isOpen = openCantoId === canto.id_canto;
                    const coords =
                      (canto as any).latitud != null && (canto as any).longitud != null
                        ? `${Number((canto as any).latitud).toFixed(5)}, ${Number((canto as any).longitud).toFixed(5)}`
                        : null;
                    return (
                      <div
                        key={canto.id_canto}
                        className="rounded-md border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
                      >
                        <div className="mb-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                          {canto.nombre && (
                            <span className="text-xs font-semibold text-gray-800">{canto.nombre}</span>
                          )}
                          {canto.gui_aud && (
                            <span className="text-[11px] text-gray-500">· {canto.gui_aud}</span>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-x-3 gap-y-1 sm:grid-cols-4 md:grid-cols-6">
                          <FieldInline label="Fecha" value={canto.fecha ? formatDate(canto.fecha) : null} />
                          <FieldInline label="Hora" value={canto.hora} />
                          <FieldInline label="Colector" value={canto.colector || canto.autor} />
                          <FieldInline label="Localidad" value={canto.localidad} />
                          <FieldInline label="Coordenadas" value={coords} />
                          <FieldInline
                            label="Temp."
                            value={canto.temp != null ? `${String(canto.temp)} °C` : null}
                          />
                          <FieldInline
                            label="Humedad"
                            value={canto.humedad != null ? `${String(canto.humedad)}%` : null}
                          />
                          <FieldInline
                            label="Nubosidad"
                            value={canto.nubosidad != null ? String(canto.nubosidad) : null}
                          />
                          <FieldInline
                            label="Distancia micro"
                            value={
                              canto.distancia_micro != null
                                ? `${String(canto.distancia_micro)} m`
                                : null
                            }
                          />
                          <FieldInline label="Equipo" value={canto.equipo} />
                          <FieldInline label="Observación" value={canto.observacion} />
                        </div>

                        <button
                          aria-expanded={isOpen}
                          className="mt-2 flex w-full items-center justify-between rounded bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100"
                          type="button"
                          onClick={() =>
                            setOpenCantoId((v) => (v === canto.id_canto ? null : canto.id_canto))
                          }
                        >
                          <span>{isOpen ? "Ocultar audio" : "Reproducir audio"}</span>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                          />
                        </button>

                        {isOpen && (
                          <div className="mt-3">
                            {canto.enlace ? (
                              <AudioSpectrogramOscillogram src={canto.enlace} />
                            ) : (
                              <p className="text-sm text-gray-500">
                                No hay enlace de audio disponible.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : <p className="py-8 text-center text-sm text-gray-400">Sin registros</p>)}

              {/* Videos — estilo videoteca */}
              {activeTab === "videos" && (videos.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {videos.map((video) => {
                    const posterFallback =
                      video.thumbnail || fotosConEnlace[0]?.enlace || null;
                    return (
                    <div
                      key={video.id_video}
                      className="group flex flex-col overflow-hidden rounded-md border bg-white text-center transition-shadow hover:shadow-md"
                      style={{borderColor: "#dddddd"}}
                    >
                      <div className="aspect-video w-full overflow-hidden bg-gray-50">
                        {video.enlace ? (
                          <VideoPreview
                            poster={posterFallback}
                            src={video.enlace}
                            onPlay={pauseOtherMedia}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                            Sin video
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-center gap-0.5 border-t border-gray-100 px-3 py-2 text-center">
                        {video.nombre && (
                          <span className="text-xs font-semibold text-gray-700">
                            {video.nombre}
                          </span>
                        )}
                        {video.autor && (
                          <span className="text-[11px] text-gray-500">{video.autor}</span>
                        )}
                        {video.fecha && (
                          <span className="text-[10px] text-gray-400">{formatDate(video.fecha)}</span>
                        )}
                      </div>
                    </div>
                    );
                  })}
                </div>
              ) : <p className="py-8 text-center text-sm text-gray-400">Sin registros</p>)}

            </div>
          </div>
        );
      })()}

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
