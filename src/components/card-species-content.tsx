"use client";

import {useMemo, useRef, useState} from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {Camera, Download, Mars, MapPin, Venus, Video, Volume2} from "lucide-react";
import Lightbox, {type Slide} from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";

import {
  SITE_URL,
  buildCitaSugerida,
  formatFechaLarga,
  getAnoActualizacion,
} from "@/lib/cita-sitio";
import {buildFichaPdf} from "@/lib/ficha-pdf";
import {formatNumericRange} from "@/lib/format-range";
import {
  processHTMLLinks,
  processHTMLLinksNoUnderline,
  processCitationReferences,
} from "@/lib/process-html-links";
import {
  buildCitaLargaDesdePublicacion,
  ordenarPublicacionesAlfabeticamente,
  resaltarTituloEnCita,
} from "@/lib/format-cita-publicacion";

import {Button} from "./ui/button";
import {Card, CardAction, CardContent, CardHeader, CardTitle} from "./ui/card";
import {Separator} from "./ui/separator";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "./ui/select";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "./ui/tooltip";
import ClimaticFloorChart from "./ClimaticFloorChart";
import CopyButton from "./copy-button";

type MapType = "relief" | "terrain" | "provinces" | "satellite" | "streets";

const MAP_TYPE_OPTIONS: {value: MapType; label: string}[] = [
  {value: "relief", label: "Relieve"},
  {value: "terrain", label: "Topográfico"},
  {value: "provinces", label: "Estándar"},
  {value: "satellite", label: "Satélite"},
  {value: "streets", label: "Minimalista"},
];

// Mapa de la Mapoteca cargado dinámicamente (depende de Leaflet, requiere window)
const MapotecaMap = dynamic(() => import("./MapotecaMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center rounded-lg bg-gray-100">
      <div className="text-center">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
        <p className="text-muted-foreground text-sm">Cargando mapa...</p>
      </div>
    </div>
  ),
});

const cardSubsectionTitle = "mb-2 text-base font-semibold text-gray-900";
const cardSectionDivider = "mt-4 border-t border-gray-100 pt-3";
const RANARIUM_URL = "https://anfibiosecuador.ec/portfolio/saparium/";

const getProvinciasFromGeoPolitica = (
  geoPolitica: {rank_nombre?: string; nombre?: string}[] | undefined,
) => {
  const unique = new Set<string>();

  geoPolitica?.forEach((item) => {
    const rank = item.rank_nombre?.toLowerCase();

    if (rank === "provincia" && item.nombre) {
      unique.add(item.nombre);
    }
  });

  return Array.from(unique).sort((a, b) => a.localeCompare(b, "es"));
};

const getPisosAltitudinales = (distributions: {catalogo_awe?: {nombre?: string}}[] | undefined) => {
  const unique = new Map<string, string>();

  distributions?.forEach((categoria) => {
    const nombre = categoria.catalogo_awe?.nombre;

    if (nombre && !unique.has(nombre)) {
      unique.set(nombre, nombre);
    }
  });

  return Array.from(unique.values());
};

const buildReferenciaClaveText = (pub: any) => {
  const citaCorta = pub.publicacion?.cita_corta || pub.publicacion?.cita || "Cita no disponible";
  const tema = pub.tema?.trim();

  return tema ? `${citaCorta} (${tema})` : citaCorta;
};

const ReferenciasClaveList = ({
  publicaciones,
  processHTMLLinksNoUnderline,
}: {
  publicaciones: any[];
  processHTMLLinksNoUnderline: (html: string) => string;
}) => (
  <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[13px] text-gray-800">
    {publicaciones.map((pub: any, i) => {
      const tooltipTexto = buildCitaLargaDesdePublicacion(pub);

      return (
        <span key={pub.id_taxon_publicacion} className="inline-flex items-baseline gap-x-2">
          {i > 0 && <span style={{color: "#f07304"}}>|</span>}
          <span
            aria-label={`Ver publicación: ${tooltipTexto}`}
            className="inline-citation text-muted-foreground"
            role="button"
            tabIndex={0}
          >
            <span
              dangerouslySetInnerHTML={{
                __html: processHTMLLinksNoUnderline(buildReferenciaClaveText(pub)),
              }}
              suppressHydrationWarning
            />
            <span className="inline-citation-popup" role="tooltip">
              {tooltipTexto}
            </span>
          </span>
        </span>
      );
    })}
  </p>
);

const PublicacionesList = ({
  publicaciones,
  processHTMLLinksNoUnderline,
}: {
  publicaciones: any[];
  processHTMLLinksNoUnderline: (html: string) => string;
}) => (
  <div className="space-y-1">
    {publicaciones.map((pub: any, i: number) => {
      const citaParaMostrar = buildCitaLargaDesdePublicacion(pub);
      const citaResaltada = resaltarTituloEnCita(
        citaParaMostrar,
        pub.publicacion?.titulo,
        pub.publicacion?.tipo,
      );
      const idPub = pub.publicacion?.id_publicacion as number | undefined;
      const idTxnPub = pub.id_taxon_publicacion as number | string | undefined;
      let key: string;

      if (typeof idPub === "number") {
        key = "pub-" + String(idPub);
      } else if (idTxnPub != null) {
        key = "txn-" + String(idTxnPub);
      } else {
        key = "idx-" + String(i);
      }

      return (
        <div key={key} className="px-1">
          <p
            dangerouslySetInnerHTML={{
              __html: processHTMLLinksNoUnderline(citaResaltada),
            }}
            suppressHydrationWarning
            className="text-sm leading-relaxed text-gray-700"
          />
        </div>
      );
    })}
  </div>
);

interface CardSpeciesContentProps {
  fichaEspecie: any;
}

export const CardSpeciesContent = ({fichaEspecie}: CardSpeciesContentProps) => {
  // Validar que fichaEspecie existe
  if (!fichaEspecie) {
    console.error("❌ CardSpeciesContent: fichaEspecie es null o undefined");

    return (
      <CardContent className="flex-1 overflow-y-auto p-0">
        <div className="p-4">
          <p className="text-muted-foreground text-sm">No se encontraron datos de la especie.</p>
        </div>
      </CardContent>
    );
  }

  // Memoizar las publicaciones para evitar recálculos
  const publicaciones = useMemo(
    () => fichaEspecie.publicacionesOrdenadas || fichaEspecie.publicaciones || [],
    [fichaEspecie.publicacionesOrdenadas, fichaEspecie.publicaciones],
  );

  // Literatura citada = publicaciones referenciadas + referencias clave + publicaciones
  // citadas en otros nombres (dedup por id_publicacion), ordenado alfabéticamente.
  const publicacionesLiteraturaCitada = useMemo(() => {
    const base: any[] = fichaEspecie.publicaciones || [];
    const refsClave: any[] = fichaEspecie.referenciasClave || [];
    const otrosNombres: any[] = Array.isArray(fichaEspecie.otrosNombres)
      ? fichaEspecie.otrosNombres
      : [];

    // Normalizar las publicaciones de otros nombres al shape { publicacion: {...} }
    const refsOtrosNombres: any[] = otrosNombres
      .map((on: any) => {
        const pub = Array.isArray(on.publicacion) ? on.publicacion[0] : on.publicacion;

        return pub?.id_publicacion ? {publicacion: pub} : null;
      })
      .filter(Boolean);

    const idsVistos = new Set<number>();
    const merged: any[] = [];

    for (const pub of [...base, ...refsClave, ...refsOtrosNombres]) {
      const id = pub?.publicacion?.id_publicacion;

      if (id == null) {
        merged.push(pub);
        continue;
      }
      if (idsVistos.has(id)) continue;
      idsVistos.add(id);
      merged.push(pub);
    }

    return ordenarPublicacionesAlfabeticamente(merged);
  }, [fichaEspecie.publicaciones, fichaEspecie.referenciasClave, fichaEspecie.otrosNombres]);

  // Tipo de mapa seleccionado para el mapa de colecciones
  const [mapType, setMapType] = useState<MapType>("provinces");

  // Lightbox para la foto destacada de la especie
  const [fotoDestacadaOpen, setFotoDestacadaOpen] = useState(false);
  // Contenedor del mapa, para poder rasterizarlo al exportar el PDF
  const mapaRef = useRef<HTMLDivElement>(null);
  const nombreCientificoMain = useMemo(() => {
    const t = fichaEspecie.taxones?.[0];

    if (!t) return null;
    const padre = t.taxonPadre?.taxon as string | undefined;
    const propio = t.taxon as string | undefined;

    return [padre, propio].filter(Boolean).join(" ").trim() || null;
  }, [fichaEspecie]);
  const fotoDestacadaSlides: Slide[] = useMemo(() => {
    if (!fichaEspecie.fotografia_url) return [];
    const autor = fichaEspecie.autor_foto as string | null | undefined;

    return [
      {
        src: fichaEspecie.fotografia_url,
        alt: nombreCientificoMain || "",
        title: nombreCientificoMain ? (
          <span style={{paddingLeft: 56, display: "inline-block"}}>
            <i style={{fontStyle: "italic"}}>{nombreCientificoMain}</i>
          </span>
        ) : undefined,
        description: autor ? <span style={{display: "block"}}>{autor}</span> : undefined,
      } as Slide,
    ];
  }, [fichaEspecie, nombreCientificoMain]);

  // Función helper para procesar HTML de forma consistente
  const procesarHTML = useMemo(
    () => (texto: string | null | undefined) => {
      if (!texto) return "";
      const textoConCitas = processCitationReferences(texto, publicaciones);

      return processHTMLLinks(textoConCitas);
    },
    [publicaciones],
  );

  // Recodifica cualquier imagen a un JPEG estándar. jsPDF rechaza como 'UNKNOWN' los JPEG
  // con cabecera de Photoshop (FFD8 FFED) y no admite WebP; además así se limita el tamaño.
  const normalizarAJpeg = (src: string, ladoMax = 1600): Promise<string | null> =>
    new Promise((resolve) => {
      const img = new Image();

      img.onload = () => {
        try {
          const escala = Math.min(1, ladoMax / Math.max(img.naturalWidth, img.naturalHeight));
          const canvas = document.createElement("canvas");

          canvas.width = Math.round(img.naturalWidth * escala);
          canvas.height = Math.round(img.naturalHeight * escala);
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            resolve(null);

            return;
          }
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.9));
        } catch (canvasError) {
          console.warn("Error al recodificar la imagen:", canvasError);
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });

  // Carga una imagen como dataURL; usa el proxy del servidor para esquivar CORS.
  const cargarImagen = async (url: string): Promise<string | null> => {
    try {
      const response = await fetch(`/api/image-proxy?url=${encodeURIComponent(url)}`);

      if (!response.ok) throw new Error(`Proxy respondió ${String(response.status)}`);

      const data = await response.json();

      if (data.dataUrl) return await normalizarAJpeg(data.dataUrl as string);
      throw new Error("El proxy no devolvió dataUrl");
    } catch (proxyError) {
      console.warn("Error con proxy, intentando método directo:", proxyError);

      return new Promise((resolve) => {
        const img = new Image();

        img.crossOrigin = "anonymous";
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");

            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext("2d");

            if (!ctx) {
              resolve(null);

              return;
            }
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/jpeg", 0.9));
          } catch (canvasError) {
            console.warn("Error con canvas:", canvasError);
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
        img.src = url;
        setTimeout(() => resolve(null), 5000);
      });
    }
  };

  // Lee el logo local y devuelve también su proporción, para no deformarlo.
  const cargarLogo = async (): Promise<{dataUrl: string; ratio: number} | null> =>
    new Promise((resolve) => {
      const img = new Image();

      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");

          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            resolve(null);

            return;
          }
          ctx.drawImage(img, 0, 0);
          resolve({
            dataUrl: canvas.toDataURL("image/png"),
            ratio: img.naturalWidth / img.naturalHeight,
          });
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = "/assets/references/logo.png";
      setTimeout(() => resolve(null), 2000);
    });

  // Rasteriza el mapa que ya está pintado en la página; sin él el PDF sale igual.
  const capturarMapa = async (): Promise<string | null> => {
    // Se captura la raíz de MapotecaMap (mapa + leyenda), no el envoltorio: este tiene alto fijo
    // y el mapa usa calc(100vh - 220px), así que el envoltorio deja una franja blanca debajo.
    const contenedor =
      mapaRef.current?.querySelector<HTMLElement>(".leaflet-container")?.parentElement ??
      mapaRef.current;

    if (!contenedor) return null;

    try {
      // html2canvas-pro: el html2canvas original aborta con los colores lab()/oklch() de Tailwind 4.
      const {default: html2canvas} = await import("html2canvas-pro");
      const canvas = await html2canvas(contenedor, {
        backgroundColor: "#ffffff",
        logging: false,
        scale: 2,
        useCORS: true,
        // Leaflet hace aparecer las teselas con un fundido de opacidad que no termina si el
        // mapa está fuera de la vista: sin esto el PDF sale con el fondo gris vacío.
        onclone: (doc) => {
          doc.querySelectorAll<HTMLElement>(".leaflet-tile").forEach((tile) => {
            tile.style.opacity = "1";
          });
        },
      });

      return canvas.toDataURL("image/jpeg", 0.85);
    } catch (error) {
      console.warn("No se pudo capturar el mapa para el PDF:", error);

      return null;
    }
  };

  // Descarga la ficha como PDF con maquetación de paper (ver src/lib/ficha-pdf.ts)
  const handleDownloadPDF = async () => {
    const loadingMessage = document.createElement("div");

    loadingMessage.textContent = "Generando PDF...";
    loadingMessage.style.cssText =
      "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.8); color: white; padding: 20px; border-radius: 8px; z-index: 10000;";
    document.body.appendChild(loadingMessage);

    try {
      const nombreCientifico = nombreCientificoMain || "especie";
      const hoy = new Date();
      const [logo, foto, mapa] = await Promise.all([
        cargarLogo(),
        fichaEspecie.fotografia_url
          ? cargarImagen(fichaEspecie.fotografia_url)
          : Promise.resolve(null),
        capturarMapa(),
      ]);
      const fechaConsulta = formatFechaLarga(hoy);

      const pdf = buildFichaPdf({
        ficha: fichaEspecie,
        nombreCientifico,
        publicaciones,
        literaturaCitada: publicacionesLiteraturaCitada,
        referenciasClave: fichaEspecie.referenciasClave || [],
        fotografia: foto ? {dataUrl: foto, autor: fichaEspecie.autor_foto} : null,
        mapa: mapa ? {dataUrl: mapa} : null,
        logo,
        citaSugerida: buildCitaSugerida({
          ano: getAnoActualizacion(fichaEspecie.fecha_actualizacion, hoy),
          nombreCientifico: nombreCientificoMain,
          fechaConsulta,
        }),
      });

      pdf.save(`Ficha_${nombreCientifico.replace(/\s+/g, "_")}.pdf`);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido al generar el PDF";

      alert(
        `Error al generar el PDF: ${errorMessage}\n\nPor favor, verifica la consola para más detalles.`,
      );
    } finally {
      if (document.body.contains(loadingMessage)) {
        document.body.removeChild(loadingMessage);
      }
    }
  };

  return (
    <CardContent className="flex-1 overflow-y-auto p-0">
      <div className="flex flex-col lg:flex-row">
        {/* Columna izquierda - Contenido principal */}
        <div className="min-w-0 flex-1">
          <div className="space-y-4 p-2 sm:p-4">
            {/* Secciones de contenido */}
            {/* Fotografía de la especie */}
            {fichaEspecie.fotografia_url && (
              <Card className="overflow-hidden py-0">
                <CardContent className="p-0">
                  <button
                    aria-label="Ver foto en grande"
                    className="group relative block aspect-[3/2] w-full cursor-zoom-in overflow-hidden bg-white"
                    type="button"
                    onClick={() => setFotoDestacadaOpen(true)}
                  >
                    <img
                      alt=""
                      className="h-full w-full object-cover grayscale transition-all duration-[800ms] ease-in-out group-hover:grayscale-0"
                      src={fichaEspecie.fotografia_url}
                    />
                  </button>
                </CardContent>
              </Card>
            )}
            {/* Contenido */} {/* Información básica */}
            <Card className="">
              <CardContent>
                <>
                  {/* 0. Endemismo */}
                  <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
                    <span className={cardSubsectionTitle}>Endemismo</span>
                    <span style={{color: "#f07304"}}>|</span>
                    <span className="text-muted-foreground">
                      {fichaEspecie.taxones?.[0]?.endemica ? "Endémica" : "No endémica"}
                    </span>
                  </p>

                  {/* 0b. Distribución Global — oculto si es endémica */}
                  {!fichaEspecie.taxones?.[0]?.endemica && (
                    <div className={cardSectionDivider}>
                      <h4 className={cardSubsectionTitle}>Distribución global</h4>
                      {fichaEspecie.distribucion_global ? (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: procesarHTML(fichaEspecie.distribucion_global),
                          }}
                          suppressHydrationWarning
                          className="text-muted-foreground text-sm"
                        />
                      ) : (
                        <p className="text-muted-foreground text-sm">No disponible</p>
                      )}
                    </div>
                  )}

                  {/* 1. Distribución Altitudinal */}
                  <div className={`${cardSectionDivider} -mx-6`}>
                    <div className="mb-2 px-6">
                      <h4 className="text-base font-semibold text-gray-900">
                        Distribución Ecuador
                      </h4>
                      {(() => {
                        const rangoAltitudinal = formatNumericRange(
                          fichaEspecie.rango_altitudinal_min,
                          fichaEspecie.rango_altitudinal_max,
                          "m",
                        );
                        const pisosAltitudinales = getPisosAltitudinales(
                          fichaEspecie.distributions,
                        );
                        const temperatura = formatNumericRange(
                          fichaEspecie.temperatura_min,
                          fichaEspecie.temperatura_max,
                          "°C",
                        );
                        const pluviocidad = formatNumericRange(
                          fichaEspecie.pluviocidad_min,
                          fichaEspecie.pluviocidad_max,
                          "mm",
                        );
                        const areaDistribucion =
                          fichaEspecie.area_distribucion != null
                            ? `${fichaEspecie.area_distribucion.toLocaleString("es")} km²`
                            : null;
                        const areaOcupacion =
                          fichaEspecie.area_ocupacion != null
                            ? `${fichaEspecie.area_ocupacion.toLocaleString("es")} km²`
                            : null;

                        const inlineDatos: {label: string; value: string}[] = [];

                        if (rangoAltitudinal) {
                          inlineDatos.push({label: "Altitud", value: rangoAltitudinal});
                        }
                        if (areaDistribucion) {
                          inlineDatos.push({
                            label: "Área distribución EOO",
                            value: areaDistribucion,
                          });
                        }
                        if (areaOcupacion) {
                          inlineDatos.push({
                            label: "Área ocupación AOO",
                            value: areaOcupacion,
                          });
                        }
                        if (pisosAltitudinales.length > 0) {
                          inlineDatos.push({
                            label: "Regiones altitudinales",
                            value: pisosAltitudinales.join(", "),
                          });
                        }
                        if (temperatura) {
                          inlineDatos.push({label: "Temperatura", value: temperatura});
                        }
                        if (pluviocidad) {
                          inlineDatos.push({label: "Pluviocidad", value: pluviocidad});
                        }

                        if (inlineDatos.length === 0) {
                          return null;
                        }

                        return (
                          <p className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[13px] text-gray-800">
                            {inlineDatos.map((item, i) => (
                              <span key={item.label} className="inline-flex items-baseline gap-x-2">
                                {i > 0 && <span style={{color: "#f07304"}}>|</span>}
                                <span className="inline-flex items-baseline gap-x-1">
                                  <span className="text-xs text-gray-500">{item.label}</span>
                                  <span>{item.value}</span>
                                </span>
                              </span>
                            ))}
                          </p>
                        );
                      })()}
                    </div>
                    {fichaEspecie.altitudinalRange ? (
                      <div className="mt-4 mb-4 w-full min-w-0 overflow-hidden">
                        <ClimaticFloorChart altitudinalRange={fichaEspecie.altitudinalRange} />
                      </div>
                    ) : (
                      <p className="text-muted-foreground mb-4 px-6 text-sm">No disponible</p>
                    )}
                    {/* Mapa con colecciones internas y externas filtradas por taxon */}
                    {nombreCientificoMain && (
                      <div className="mt-4 mb-4 space-y-2 px-2 sm:px-6">
                        <div className="flex items-center justify-end">
                          <Select value={mapType} onValueChange={(v) => setMapType(v as MapType)}>
                            <SelectTrigger className="h-8 w-[140px] text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="z-[1100]">
                              {MAP_TYPE_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} className="text-xs" value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div
                          ref={mapaRef}
                          className="relative h-[360px] w-full overflow-hidden rounded-md border border-gray-200 sm:h-[480px] lg:h-[640px]"
                        >
                          <MapotecaMap especieFilter={[nombreCientificoMain]} mapType={mapType} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. Provincias */}
                  <div className={cardSectionDivider}>
                    <h4 className={cardSubsectionTitle}>Provincias</h4>
                    {(() => {
                      const provincias = getProvinciasFromGeoPolitica(fichaEspecie.geoPolitica);

                      return provincias.length > 0 ? (
                        <div className="space-y-1">
                          {provincias.map((provincia) => (
                            <div key={provincia} className="flex items-start gap-2">
                              <span className="text-muted-foreground text-xs">•</span>
                              <span className="text-muted-foreground text-xs">{provincia}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">No disponible</p>
                      );
                    })()}
                  </div>

                  {/* 3. Ecosistemas */}
                  <div className={cardSectionDivider}>
                    <h4 className={cardSubsectionTitle}>Ecosistemas</h4>
                    {(() => {
                      const ecosistemas =
                        fichaEspecie.taxon_catalogo_awe_results?.filter(
                          (categoria: any) =>
                            categoria.catalogo_awe.tipo_catalogo_awe?.nombre === "Ecosistemas",
                        ) || [];

                      return ecosistemas.length > 0 ? (
                        <div className="space-y-1">
                          {ecosistemas.map((categoria: any) => (
                            <div
                              key={categoria.id_taxon_catalogo_awe}
                              className="flex items-start gap-2"
                            >
                              <span className="text-muted-foreground text-xs">•</span>
                              <span className="text-muted-foreground text-xs">
                                {categoria.catalogo_awe.nombre}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">No disponible</p>
                      );
                    })()}
                  </div>

                  {/* 8. Sectores Biogeográficos */}
                  <div className={cardSectionDivider}>
                    <h4 className={cardSubsectionTitle}>Sectores biogeográficos</h4>
                    {fichaEspecie.dataRegionBio && fichaEspecie.dataRegionBio.length > 0 ? (
                      <div className="space-y-1">
                        {fichaEspecie.dataRegionBio.map((region: any, index: number) => (
                          <div
                            key={region.id_catalogo_awe || region.id_taxon_catalogo_awe || index}
                            className="flex items-start gap-2"
                          >
                            <span className="text-muted-foreground text-xs">•</span>
                            <span className="text-muted-foreground text-xs">
                              {region.nombre || region.catalogo_awe?.nombre}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No disponible</p>
                    )}
                  </div>
                </>
              </CardContent>
            </Card>
            {/* Primer(os) colector(es) — solo si hay contenido */}
            {fichaEspecie.primeros_colectores && (
              <Card className="gap-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Primer(os) colector(es)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: procesarHTML(fichaEspecie.primeros_colectores),
                    }}
                    suppressHydrationWarning
                    className="text-muted-foreground text-sm"
                  />
                </CardContent>
              </Card>
            )}
            {/* Nombres (etimología, estándar y vernáculos) */}
            {(() => {
              const nc = fichaEspecie.nombresComunes;
              const idiomas: {key: string; label: string}[] = [
                {key: "nombre_comun_espanol", label: "Español"},
                {key: "nombre_comun_ingles", label: "Inglés"},
                {key: "nombre_comun_aleman", label: "Alemán"},
                {key: "nombre_comun_frances", label: "Francés"},
                {key: "nombre_comun_portugues", label: "Portugués"},
                {key: "nombre_comun_italiano", label: "Italiano"},
                {key: "nombre_comun_holandes", label: "Holandés"},
                {key: "nombre_comun_chino", label: "Chino"},
                {key: "nombre_comun_japones", label: "Japonés"},
                {key: "nombre_comun_ruso", label: "Ruso"},
                {key: "nombre_comun_arabe", label: "Árabe"},
                {key: "nombre_comun_hindu", label: "Hindi"},
              ];
              const conNombre = nc ? idiomas.filter((i) => nc[i.key]) : [];
              const hasEtimologia = Boolean(fichaEspecie.etimologia);
              const hasNombresEstandar = conNombre.length > 0;
              const hasOtrosNombres =
                Array.isArray(fichaEspecie.otrosNombres) && fichaEspecie.otrosNombres.length > 0;

              if (!hasEtimologia && !hasNombresEstandar && !hasOtrosNombres) {
                return null;
              }

              return (
                <Card className="">
                  <CardContent>
                    {hasEtimologia && (
                      <div>
                        <h4 className={cardSubsectionTitle}>Etimología</h4>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: procesarHTML(fichaEspecie.etimologia),
                          }}
                          suppressHydrationWarning
                          className="text-muted-foreground text-sm"
                        />
                      </div>
                    )}

                    {hasNombresEstandar && (
                      <div className={hasEtimologia ? cardSectionDivider : ""}>
                        <h4 className={cardSubsectionTitle}>
                          <a
                            className="hover:underline"
                            href="https://anfibiosecuador.ec/nombres-estandarizados/"
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            Nombres estándar
                          </a>
                        </h4>
                        <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs sm:text-[13px]">
                          {conNombre.map((idioma, i) => (
                            <span
                              key={idioma.key}
                              className="inline-flex max-w-full items-baseline gap-x-2"
                            >
                              {i > 0 && <span style={{color: "#f07304"}}>|</span>}
                              <span className="inline-flex max-w-full items-baseline gap-x-1">
                                <span className="text-xs text-gray-500">{idioma.label}</span>
                                <span className="font-medium break-words text-gray-900">
                                  {nc[idioma.key]}
                                </span>
                              </span>
                            </span>
                          ))}
                        </p>
                      </div>
                    )}

                    {hasOtrosNombres && (
                      <div
                        className={hasEtimologia || hasNombresEstandar ? cardSectionDivider : ""}
                      >
                        <h4 className={cardSubsectionTitle}>Otros nombres</h4>
                        <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs sm:text-[13px]">
                          {[...fichaEspecie.otrosNombres]
                            .sort((a: any, b: any) => {
                              const getAno = (x: any): number => {
                                const p = Array.isArray(x.publicacion)
                                  ? x.publicacion[0]
                                  : x.publicacion;

                                return Number(p?.numero_publicacion_ano) || -Infinity;
                              };

                              return getAno(b) - getAno(a);
                            })
                            .map((on: any, i: number) => {
                              const idioma: string | undefined = on.idioma?.nombre;
                              const etnia: string | undefined = on.etnia?.nombre;
                              const label = etnia || idioma;
                              const pub = Array.isArray(on.publicacion)
                                ? on.publicacion[0]
                                : on.publicacion;
                              const citaCorta: string | undefined = pub?.cita_corta;
                              const publicacionId: number | undefined = pub?.id_publicacion;
                              const tooltipTexto: string =
                                (pub?.cita_larga as string) ||
                                (pub?.cita as string) ||
                                [citaCorta, pub?.titulo].filter(Boolean).join(". ");

                              return (
                                <span
                                  key={`${String(on.nombre)}-${String(i)}`}
                                  className="inline-flex max-w-full items-baseline gap-x-2"
                                >
                                  {i > 0 && <span style={{color: "#f07304"}}>|</span>}
                                  <span className="inline-flex max-w-full items-baseline gap-x-1">
                                    {label && (
                                      <span className="text-xs text-gray-500">{label}</span>
                                    )}
                                    <span className="font-medium break-words text-gray-900">
                                      {on.nombre}
                                    </span>
                                    {citaCorta &&
                                      (publicacionId != null ? (
                                        <span
                                          aria-label={`Ver publicación: ${tooltipTexto}`}
                                          className="inline-citation text-[11px]"
                                          role="button"
                                          tabIndex={0}
                                        >
                                          · {citaCorta}
                                          <span className="inline-citation-popup" role="tooltip">
                                            {tooltipTexto}
                                          </span>
                                        </span>
                                      ) : (
                                        <span className="text-[11px] text-gray-500">
                                          · {citaCorta}
                                        </span>
                                      ))}
                                  </span>
                                </span>
                              );
                            })}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })()}
            {/* Taxonomía */}
            <Card className="gap-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  Taxonomía y relaciones filogenéticas
                  {fichaEspecie.asw && (
                    <>
                      <span style={{color: "#f07304"}}> | </span>
                      <a
                        className="processed-link"
                        href={fichaEspecie.asw}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        Sinonimia
                      </a>
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Holotipo: sin título ni divisor, se lee como entradilla de la taxonomía */}
                {fichaEspecie.holotipo && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: procesarHTML(fichaEspecie.holotipo),
                    }}
                    suppressHydrationWarning
                    className="text-muted-foreground mb-2 text-sm"
                  />
                )}

                {fichaEspecie.taxonomia ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: procesarHTML(fichaEspecie.taxonomia),
                    }}
                    suppressHydrationWarning
                    className="text-muted-foreground text-sm"
                  />
                ) : (
                  <p className="text-muted-foreground text-sm">No disponible</p>
                )}
              </CardContent>
            </Card>
            {/* {Identificacion} */}
            <Card className="gap-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Identificación</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const hasIdentificacion = Boolean(fichaEspecie.identificacion);
                  const hasMorfometria = Boolean(
                    fichaEspecie.svl_macho || fichaEspecie.svl_hembra || fichaEspecie.peso,
                  );
                  const hasColorEnVida = Boolean(fichaEspecie.color_en_vida);
                  const hasComparacion = Boolean(fichaEspecie.comparacion);
                  const hasSppSimilares = Boolean(fichaEspecie.spp_similares);
                  const hasPriorToMorfometria = hasIdentificacion;
                  const hasPriorToColor = hasIdentificacion || hasMorfometria;
                  const hasPriorToSppSimilares = hasPriorToColor || hasColorEnVida;
                  const hasPriorToComparacion = hasPriorToSppSimilares || hasSppSimilares;

                  return (
                    <>
                      {hasIdentificacion && (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: procesarHTML(fichaEspecie.identificacion),
                          }}
                          suppressHydrationWarning
                          className="text-muted-foreground text-sm"
                        />
                      )}

                      {hasMorfometria && (
                        <div className={hasPriorToMorfometria ? cardSectionDivider : ""}>
                          <h4 className={cardSubsectionTitle}>Morfometría</h4>
                          <div className="space-y-1.5">
                            {fichaEspecie.svl_macho && (
                              <div className="flex flex-wrap items-baseline gap-x-2">
                                <span className="text-muted-foreground inline-flex items-center gap-1 text-xs font-medium">
                                  Longitud rostro-cloacal
                                  <Mars aria-label="macho" className="h-3.5 w-3.5 shrink-0" />:
                                </span>
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: procesarHTML(fichaEspecie.svl_macho),
                                  }}
                                  suppressHydrationWarning
                                  className="text-muted-foreground text-xs"
                                />
                              </div>
                            )}
                            {fichaEspecie.svl_hembra && (
                              <div className="flex flex-wrap items-baseline gap-x-2">
                                <span className="text-muted-foreground inline-flex items-center gap-1 text-xs font-medium">
                                  Longitud rostro-cloacal
                                  <Venus aria-label="hembra" className="h-3.5 w-3.5 shrink-0" />:
                                </span>
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: procesarHTML(fichaEspecie.svl_hembra),
                                  }}
                                  suppressHydrationWarning
                                  className="text-muted-foreground text-xs"
                                />
                              </div>
                            )}
                            {fichaEspecie.peso && (
                              <div className="flex flex-wrap items-baseline gap-x-2">
                                <span className="text-muted-foreground text-xs font-medium">
                                  Peso:
                                </span>
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: procesarHTML(fichaEspecie.peso),
                                  }}
                                  suppressHydrationWarning
                                  className="text-muted-foreground text-xs"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {hasColorEnVida && (
                        <div className={hasPriorToColor ? cardSectionDivider : ""}>
                          <h4 className={cardSubsectionTitle}>Color en vida</h4>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: procesarHTML(fichaEspecie.color_en_vida),
                            }}
                            suppressHydrationWarning
                            className="text-muted-foreground text-sm"
                          />
                        </div>
                      )}

                      {hasSppSimilares && (
                        <div className={hasPriorToSppSimilares ? cardSectionDivider : ""}>
                          <h4 className={cardSubsectionTitle}>Especies similares</h4>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: procesarHTML(fichaEspecie.spp_similares),
                            }}
                            suppressHydrationWarning
                            className="text-muted-foreground text-sm"
                          />
                        </div>
                      )}

                      {hasComparacion && (
                        <div className={hasPriorToComparacion ? cardSectionDivider : ""}>
                          <h4 className={cardSubsectionTitle}>Comparación</h4>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: procesarHTML(fichaEspecie.comparacion),
                            }}
                            suppressHydrationWarning
                            className="text-muted-foreground text-sm"
                          />
                        </div>
                      )}
                    </>
                  );
                })()}
              </CardContent>
            </Card>
            {/* Renacuajo — card propia, solo si hay contenido */}
            {fichaEspecie.renacuajo && (
              <Card className="gap-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Renacuajo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: procesarHTML(fichaEspecie.renacuajo),
                    }}
                    suppressHydrationWarning
                    className="text-muted-foreground text-sm"
                  />
                </CardContent>
              </Card>
            )}
            {/* Historia Natural */}
            <Card className="">
              <CardContent>
                {(() => {
                  const hasHabitat = Boolean(fichaEspecie.habitat_biologia);
                  const hasReproduccion = Boolean(fichaEspecie.reproduccion);
                  const hasCanto = Boolean(fichaEspecie.descripcion_canto);
                  const hasDieta = Boolean(fichaEspecie.dieta);

                  return (
                    <>
                      {hasHabitat && (
                        <div>
                          <h4 className={cardSubsectionTitle}>Hábitat y biología</h4>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: procesarHTML(fichaEspecie.habitat_biologia),
                            }}
                            suppressHydrationWarning
                            className="text-muted-foreground text-sm"
                          />
                        </div>
                      )}

                      {hasReproduccion && (
                        <div className={hasHabitat ? cardSectionDivider : ""}>
                          <h4 className={cardSubsectionTitle}>Reproducción</h4>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: procesarHTML(fichaEspecie.reproduccion),
                            }}
                            suppressHydrationWarning
                            className="text-muted-foreground text-sm"
                          />
                        </div>
                      )}

                      {hasCanto && (
                        <div className={hasHabitat || hasReproduccion ? cardSectionDivider : ""}>
                          <h4 className={cardSubsectionTitle}>Canto</h4>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: procesarHTML(fichaEspecie.descripcion_canto),
                            }}
                            suppressHydrationWarning
                            className="text-muted-foreground text-sm"
                          />
                        </div>
                      )}

                      {hasDieta && (
                        <div
                          className={
                            hasHabitat || hasReproduccion || hasCanto ? cardSectionDivider : ""
                          }
                        >
                          <h4 className={cardSubsectionTitle}>Dieta</h4>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: procesarHTML(fichaEspecie.dieta),
                            }}
                            suppressHydrationWarning
                            className="text-muted-foreground text-sm"
                          />
                        </div>
                      )}
                    </>
                  );
                })()}
              </CardContent>
            </Card>
            {/* Conservación */}
            <Card className="scroll-mt-24 gap-0" id="conservacion">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Conservación</CardTitle>
                <hr className="mt-2 border-t border-gray-200" />
              </CardHeader>
              <CardContent>
                <>
                  {/* 1. Lista Roja Global UICN */}
                  <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs sm:text-sm">
                    <span className={`${cardSubsectionTitle} mb-0`}>Lista Roja Global UICN</span>
                    <span className="inline-flex max-w-full items-baseline gap-x-2">
                      <span style={{color: "#f07304"}}>|</span>
                      {fichaEspecie.listaRojaGlobal?.catalogo_awe?.nombre ? (
                        <span className="text-muted-foreground break-words">
                          {fichaEspecie.listaRojaGlobal.catalogo_awe.nombre}
                          {fichaEspecie.listaRojaGlobal.catalogo_awe.sigla && (
                            <span className="ml-1 text-xs text-gray-500">
                              ({fichaEspecie.listaRojaGlobal.catalogo_awe.sigla})
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">No disponible</span>
                      )}
                    </span>
                  </p>

                  {/* 2. Lista Roja Ecuador */}
                  <p className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs sm:text-sm">
                    <span className={`${cardSubsectionTitle} mb-0`}>Lista Roja Ecuador</span>
                    <span className="inline-flex max-w-full items-baseline gap-x-2">
                      <span style={{color: "#f07304"}}>|</span>
                      {fichaEspecie.listaRojaIUCN?.catalogo_awe?.nombre ? (
                        <span className="text-muted-foreground break-words">
                          {fichaEspecie.listaRojaIUCN.catalogo_awe.nombre}
                          {fichaEspecie.listaRojaIUCN.catalogo_awe.sigla && (
                            <span className="ml-1 text-xs text-gray-500">
                              ({fichaEspecie.listaRojaIUCN.catalogo_awe.sigla})
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">No disponible</span>
                      )}
                    </span>
                  </p>

                  {/* 4. Comentario Estatus Poblacional */}
                  <div>
                    {fichaEspecie.comentario_estatus_poblacional ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: procesarHTML(fichaEspecie.comentario_estatus_poblacional),
                        }}
                        suppressHydrationWarning
                        className="text-muted-foreground text-sm"
                      />
                    ) : (
                      <p className="text-muted-foreground text-sm">No disponible</p>
                    )}
                  </div>

                  {/* 5. CITES y Manejo ex situ */}
                  <div className={cardSectionDivider}>
                    {(() => {
                      const cites =
                        fichaEspecie.taxon_catalogo_awe_results?.filter(
                          (categoria: any) =>
                            categoria.catalogo_awe.tipo_catalogo_awe?.nombre === "CITES",
                        ) || [];

                      const uniqueMap = new Map();

                      cites.forEach((categoria: any) => {
                        const key = categoria.catalogo_awe_id;

                        if (!uniqueMap.has(key)) {
                          uniqueMap.set(key, categoria);
                        }
                      });
                      const citesUnicos = Array.from(uniqueMap.values());
                      const citesValor =
                        citesUnicos.length > 0
                          ? citesUnicos.map((c) => c.catalogo_awe.nombre).join(", ")
                          : "No disponible";

                      const manejoExSituValor =
                        fichaEspecie.anfibio_conservacion === true ? (
                          <a
                            className="manejo-exsitu-si inline-flex items-center font-semibold !no-underline transition-colors hover:!no-underline"
                            href={RANARIUM_URL}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            Sí
                          </a>
                        ) : (
                          "NO"
                        );

                      return (
                        <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[13px] text-gray-800">
                          <span className="inline-flex items-baseline gap-x-2">
                            <span className="inline-flex items-baseline gap-x-1">
                              <span className="text-base font-semibold text-gray-900">CITES</span>
                              <span className="text-muted-foreground">{citesValor}</span>
                            </span>
                          </span>
                          <span className="inline-flex items-baseline gap-x-2">
                            <span style={{color: "#f07304"}}>|</span>
                            <span className="inline-flex items-baseline gap-x-1">
                              <span className="text-base font-semibold text-gray-900">
                                Manejo <span className="italic">ex situ</span>
                              </span>
                              <span className="text-muted-foreground">{manejoExSituValor}</span>
                            </span>
                          </span>
                        </p>
                      );
                    })()}
                  </div>

                  {/* 6. Áreas protegidas estado | SNAP */}
                  <div className={cardSectionDivider}>
                    <h4 className={cardSubsectionTitle}>
                      Áreas protegidas estado <span className="font-normal text-[#f07304]">|</span>{" "}
                      SNAP
                    </h4>
                    {(() => {
                      const areasEstado =
                        fichaEspecie.taxon_catalogo_awe_results?.filter(
                          (categoria: any) =>
                            categoria.catalogo_awe.tipo_catalogo_awe?.nombre ===
                            "Áreas protegidas del Estado",
                        ) || [];

                      const uniqueMap = new Map();

                      areasEstado.forEach((categoria: any) => {
                        const key = categoria.catalogo_awe_id;

                        if (!uniqueMap.has(key)) {
                          uniqueMap.set(key, categoria);
                        }
                      });
                      const areasEstadoUnicas = Array.from(uniqueMap.values());

                      return areasEstadoUnicas.length > 0 ? (
                        <div className="space-y-1">
                          {areasEstadoUnicas.map((categoria: any) => (
                            <div
                              key={categoria.id_taxon_catalogo_awe}
                              className="flex items-start gap-2"
                            >
                              <span className="text-muted-foreground text-xs">•</span>
                              <span className="text-muted-foreground text-xs">
                                {categoria.catalogo_awe.nombre}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">No disponible</p>
                      );
                    })()}
                  </div>

                  {/* 7. Bosques protectores */}
                  <div className={cardSectionDivider}>
                    <h4 className={cardSubsectionTitle}>Bosques protectores</h4>
                    {(() => {
                      const bosquesProtegidos =
                        fichaEspecie.taxon_catalogo_awe_results?.filter(
                          (categoria: any) =>
                            categoria.catalogo_awe.tipo_catalogo_awe?.nombre ===
                            "Bosques Protegidos",
                        ) || [];

                      return bosquesProtegidos.length > 0 ? (
                        <div className="space-y-1">
                          {bosquesProtegidos.map((categoria: any) => (
                            <div
                              key={categoria.id_taxon_catalogo_awe}
                              className="flex items-start gap-2"
                            >
                              <span className="text-muted-foreground text-xs">•</span>
                              <span className="text-muted-foreground text-xs">
                                {categoria.catalogo_awe.nombre}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">No disponible</p>
                      );
                    })()}
                  </div>

                  {/* 8. Áreas protegidas privadas */}
                  <div className={cardSectionDivider}>
                    <h4 className={cardSubsectionTitle}>Áreas protegidas privadas</h4>
                    {(() => {
                      const areasPrivadas =
                        fichaEspecie.taxon_catalogo_awe_results?.filter(
                          (categoria: any) =>
                            categoria.catalogo_awe.tipo_catalogo_awe?.nombre ===
                            "Áreas protegidas Privadas",
                        ) || [];

                      const uniqueMap = new Map();

                      areasPrivadas.forEach((categoria: any) => {
                        const key = categoria.catalogo_awe_id;

                        if (!uniqueMap.has(key)) {
                          uniqueMap.set(key, categoria);
                        }
                      });
                      const areasPrivadasUnicas = Array.from(uniqueMap.values());

                      return areasPrivadasUnicas.length > 0 ? (
                        <div className="space-y-1">
                          {areasPrivadasUnicas.map((categoria: any) => (
                            <div
                              key={categoria.id_taxon_catalogo_awe}
                              className="flex items-start gap-2"
                            >
                              <span className="text-muted-foreground text-xs">•</span>
                              <span className="text-muted-foreground text-xs">
                                {categoria.catalogo_awe.nombre}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">No disponible</p>
                      );
                    })()}
                  </div>

                  {/* 9. Reservas de la biósfera */}
                  <div className={cardSectionDivider}>
                    <h4 className={cardSubsectionTitle}>Reservas de la biósfera</h4>
                    {(() => {
                      const reservasBiosfera =
                        fichaEspecie.taxon_catalogo_awe_results?.filter(
                          (categoria: any) =>
                            categoria.catalogo_awe.tipo_catalogo_awe?.nombre ===
                            "Reservas de la Biósfera",
                        ) || [];

                      return reservasBiosfera.length > 0 ? (
                        <div className="space-y-1">
                          {reservasBiosfera.map((categoria: any) => (
                            <div
                              key={categoria.id_taxon_catalogo_awe}
                              className="flex items-start gap-2"
                            >
                              <span className="text-muted-foreground text-xs">•</span>
                              <span className="text-muted-foreground text-xs">
                                {categoria.catalogo_awe.nombre}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">No disponible</p>
                      );
                    })()}
                  </div>
                </>
              </CardContent>
            </Card>
            {/* Información adicional */}
            <Card className="gap-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Información adicional</CardTitle>
              </CardHeader>
              <CardContent>
                <>
                  {/* Información Adicional */}
                  <div>
                    {fichaEspecie.informacion_adicional ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: procesarHTML(fichaEspecie.informacion_adicional),
                        }}
                        suppressHydrationWarning
                        className="text-muted-foreground text-sm"
                      />
                    ) : (
                      <p className="text-muted-foreground text-sm">No disponible</p>
                    )}
                  </div>
                </>
              </CardContent>
            </Card>
            {/* { Publicaciones } */}
            <Card className="gap-0">
              <CardContent>
                <div>
                  <h4 className={cardSubsectionTitle}>Referencias clave</h4>
                  {fichaEspecie.referenciasClave && fichaEspecie.referenciasClave.length > 0 ? (
                    <ReferenciasClaveList
                      processHTMLLinksNoUnderline={processHTMLLinksNoUnderline}
                      publicaciones={fichaEspecie.referenciasClave}
                    />
                  ) : (
                    <p className="text-muted-foreground text-sm">No disponible</p>
                  )}
                </div>

                <div className={cardSectionDivider}>
                  <h4 className={cardSubsectionTitle}>Literatura citada</h4>
                  {publicacionesLiteraturaCitada.length > 0 ? (
                    <PublicacionesList
                      processHTMLLinksNoUnderline={processHTMLLinksNoUnderline}
                      publicaciones={publicacionesLiteraturaCitada}
                    />
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No hay publicaciones disponibles
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
            {/* Historial + Agradecimiento + Actualización + cita sugerida del sitio */}
            {(() => {
              const meses = [
                "Enero",
                "Febrero",
                "Marzo",
                "Abril",
                "Mayo",
                "Junio",
                "Julio",
                "Agosto",
                "Septiembre",
                "Octubre",
                "Noviembre",
                "Diciembre",
              ];
              const hoy = new Date();
              const today =
                String(hoy.getDate()) +
                " " +
                meses[hoy.getMonth()] +
                " " +
                String(hoy.getFullYear());

              const fechaStr = String(fichaEspecie.fecha_actualizacion || "");
              let anoActualizacion = String(hoy.getFullYear());
              const fechaParsed = fechaStr ? new Date(fechaStr) : null;

              if (fechaParsed && !Number.isNaN(fechaParsed.getTime())) {
                anoActualizacion = String(fechaParsed.getFullYear());
              } else {
                const yearMatch = /\b(19|20)\d{2}\b/.exec(fechaStr);

                if (yearMatch) {
                  anoActualizacion = yearMatch[0];
                }
              }

              const citaSugerida = buildCitaSugerida({
                ano: anoActualizacion,
                nombreCientifico: nombreCientificoMain,
                fechaConsulta: today,
              });

              return (
                <>
                  <Card className="gap-0">
                    <CardContent>
                      <>
                        {/* Historial cambios */}
                        <div>
                          <h4 className={cardSubsectionTitle}>Historial cambios</h4>
                          {fichaEspecie.historial ? (
                            <div
                              dangerouslySetInnerHTML={{
                                __html: procesarHTML(
                                  fichaEspecie.historial.replace(/\r\n?|\n/g, "<br />"),
                                ),
                              }}
                              suppressHydrationWarning
                              className="text-muted-foreground text-sm"
                            />
                          ) : (
                            <p className="text-muted-foreground text-sm">No disponible</p>
                          )}
                        </div>

                        {/* Agradecimiento */}
                        {fichaEspecie.agradecimiento && (
                          <div className={cardSectionDivider}>
                            <h4 className={cardSubsectionTitle}>Agradecimiento</h4>
                            <div
                              dangerouslySetInnerHTML={{
                                __html: procesarHTML(fichaEspecie.agradecimiento),
                              }}
                              suppressHydrationWarning
                              className="text-muted-foreground text-sm"
                            />
                          </div>
                        )}
                      </>
                    </CardContent>
                  </Card>

                  {/* Cita sugerida del sitio */}
                  <Card className="gap-0">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Cita</CardTitle>
                      <CardAction>
                        <CopyButton className="-mr-2" text={citaSugerida} />
                      </CardAction>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Centro Jambatu. {anoActualizacion}. Anfibios Ecuador
                        {nombreCientificoMain && (
                          <>
                            : <i>{nombreCientificoMain}</i>
                          </>
                        )}
                        . Referencia en línea. Version 2.0. Base de datos electrónica en{" "}
                        <a
                          className="processed-link"
                          href={SITE_URL}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          {SITE_URL}
                        </a>
                        . Centro Jambatu de Investigación y Conservación de Anfibios, Quito,
                        Ecuador. (Consultado en: {today})
                      </p>
                    </CardContent>
                  </Card>
                </>
              );
            })()}
          </div>
        </div>

        {/* Columna derecha - Sidebar fijo en desktop, apilado abajo en mobile */}
        <div className="w-full px-4 py-4 lg:sticky lg:top-0 lg:max-h-screen lg:w-[12%] lg:px-2 lg:py-2">
          {/* Botón de descarga */}
          <div className="mb-2">
            <Button
              className="text-muted-foreground flex h-11 w-full items-center justify-center gap-2 px-3 text-base font-semibold"
              variant="outline"
              onClick={handleDownloadPDF}
            >
              <Download className="h-5 w-5" />
              Ficha Pdf
            </Button>
          </div>
          <Card className="h-fit">
            <CardContent className="space-y-1.5 p-2">
              {/* Información General */}
              <section>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-1">
                  {/* Colecciones */}
                  {(() => {
                    const nombreCientifico = fichaEspecie.taxones?.[0]?.taxon
                      ? `${fichaEspecie.taxones[0].taxonPadre?.taxon || ""} ${fichaEspecie.taxones[0].taxon}`.trim()
                      : "";
                    const especieUrl = nombreCientifico.replaceAll(" ", "-");
                    const coleccionesUrl = `/sapopedia/species/${encodeURIComponent(especieUrl)}/colecciones`;

                    return (
                      <Link href={coleccionesUrl}>
                        <div
                          className="group flex aspect-square cursor-pointer flex-col items-center justify-center rounded-md border p-1 transition-colors hover:bg-gray-50"
                          style={{
                            backgroundColor: "#f9f9f9",
                            borderColor: "#dddddd",
                          }}
                        >
                          <img
                            alt="Colecciones"
                            className="min-h-0 w-full flex-1 object-contain grayscale transition-all duration-500 ease-in-out group-hover:grayscale-0"
                            src="/assets/coleccioncj-02.png"
                          />
                          <span className="mt-0.5 text-xs font-medium text-gray-600">
                            Colecciones
                          </span>
                        </div>
                      </Link>
                    );
                  })()}

                  {fichaEspecie.morphosource && (
                    <Button
                      asChild
                      className="group hover:bg-muted/50 h-auto rounded-md border p-2"
                      style={{backgroundColor: "#f9f9f9"}}
                      variant="outline"
                    >
                      <a
                        className="flex flex-col items-center"
                        href={fichaEspecie.morphosource}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <img
                          alt="MorphoSource Logo"
                          className="mx-auto grayscale transition-all duration-[800ms] ease-in-out group-hover:grayscale-0"
                          src="/assets/references/morphosource.png"
                          style={{width: "100%", height: "auto"}}
                        />
                        <span className="mt-0.5 text-xs font-medium text-gray-600">
                          MorphoSource
                        </span>
                      </a>
                    </Button>
                  )}

                  {fichaEspecie.herpnet && (
                    <Button
                      asChild
                      className="group hover:bg-muted/50 h-auto rounded-md border p-2"
                      style={{backgroundColor: "#f9f9f9"}}
                      variant="outline"
                    >
                      <a href={fichaEspecie.herpnet} rel="noopener noreferrer" target="_blank">
                        <img
                          alt="VertNet Logo"
                          className="mx-auto grayscale transition-all duration-[800ms] ease-in-out group-hover:grayscale-0"
                          src="/assets/references/vertnet.png"
                          style={{width: "100%", height: "auto"}}
                        />
                      </a>
                    </Button>
                  )}

                  {fichaEspecie.gbif && (
                    <Button
                      asChild
                      className="group hover:bg-muted/50 h-auto rounded-md border p-2"
                      style={{backgroundColor: "#f9f9f9"}}
                      variant="outline"
                    >
                      <a href={fichaEspecie.gbif} rel="noopener noreferrer" target="_blank">
                        <img
                          alt="GBIF Logo"
                          className="mx-auto grayscale transition-all duration-[800ms] ease-in-out group-hover:grayscale-0"
                          src="/assets/references/gbif.png"
                          style={{width: "100%", height: "auto"}}
                        />
                      </a>
                    </Button>
                  )}

                  {fichaEspecie.genbank && (
                    <Button
                      asChild
                      className="group hover:bg-muted/50 h-auto rounded-md border p-2"
                      style={{backgroundColor: "#f9f9f9"}}
                      variant="outline"
                    >
                      <a href={fichaEspecie.genbank} rel="noopener noreferrer" target="_blank">
                        <img
                          alt="NCBI Logo"
                          className="mx-auto grayscale transition-all duration-[800ms] ease-in-out group-hover:grayscale-0"
                          src="/assets/references/ncbi.png"
                          style={{width: "100%", height: "auto"}}
                        />
                      </a>
                    </Button>
                  )}
                </div>
              </section>

              {/* Divisor entre sección de Colecciones y la de Recursos (Fototeca/Audioteca/Videoteca) */}
              <hr className="my-5 border-t border-[#f07304]" />

              {/* Recursos */}
              <section>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-1">
                  {(() => {
                    const nombreCientifico =
                      `${fichaEspecie.taxones?.[0]?.taxonPadre?.taxon || ""} ${fichaEspecie.taxones?.[0]?.taxon || ""}`.trim();
                    const slug = nombreCientifico.replace(/\s+/g, "-");

                    return (
                      <Link
                        className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-md border p-2 transition-all duration-200 hover:border-gray-400 hover:bg-gray-200"
                        href={`/sapopedia/species/${slug}/fotos`}
                        style={{
                          backgroundColor: "#f9f9f9",
                          borderColor: "#dddddd",
                        }}
                      >
                        <Camera className="h-20 w-20" strokeWidth={1} style={{color: "#333333"}} />
                        <span className="mt-1 text-xs font-medium text-gray-600">Fototeca</span>
                      </Link>
                    );
                  })()}

                  {(() => {
                    const nombreCientifico =
                      `${fichaEspecie.taxones?.[0]?.taxonPadre?.taxon || ""} ${fichaEspecie.taxones?.[0]?.taxon || ""}`.trim();
                    const slug = nombreCientifico.replace(/\s+/g, "-");

                    return (
                      <Link
                        className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-md border p-2 transition-all duration-200 hover:border-gray-400 hover:bg-gray-200"
                        href={`/sapopedia/species/${slug}/audios`}
                        style={{
                          backgroundColor: "#f9f9f9",
                          borderColor: "#dddddd",
                        }}
                      >
                        <Volume2 className="h-20 w-20" strokeWidth={1} style={{color: "#333333"}} />
                        <span className="mt-1 text-xs font-medium text-gray-600">Audioteca</span>
                      </Link>
                    );
                  })()}

                  {(() => {
                    const nombreCientifico =
                      `${fichaEspecie.taxones?.[0]?.taxonPadre?.taxon || ""} ${fichaEspecie.taxones?.[0]?.taxon || ""}`.trim();
                    const slug = nombreCientifico.replace(/\s+/g, "-");

                    return (
                      <Link
                        className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-md border p-2 transition-all duration-200 hover:border-gray-400 hover:bg-gray-200"
                        href={`/sapopedia/species/${slug}/videos`}
                        style={{
                          backgroundColor: "#f9f9f9",
                          borderColor: "#dddddd",
                        }}
                      >
                        <Video className="h-20 w-20" strokeWidth={1} style={{color: "#333333"}} />
                        <span className="mt-1 text-xs font-medium text-gray-600">Videoteca</span>
                      </Link>
                    );
                  })()}

                  <Link
                    className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-md border p-2 transition-all duration-200 hover:border-gray-400 hover:bg-gray-200"
                    href={`/mapoteca?especie=${encodeURIComponent(`${fichaEspecie.taxones?.[0]?.taxonPadre?.taxon || ""} ${fichaEspecie.taxones?.[0]?.taxon || ""}`.trim())}`}
                    style={{
                      backgroundColor: "#f9f9f9",
                      borderColor: "#dddddd",
                    }}
                  >
                    <MapPin className="h-20 w-20" strokeWidth={1} style={{color: "#333333"}} />
                    <span className="mt-1 text-xs font-medium text-gray-600">Mapoteca</span>
                  </Link>
                </div>
              </section>

              {/* Divisor entre Recursos (Fototeca/Audioteca/Videoteca/Mapoteca) y Fuentes Externas */}
              <hr className="my-5 border-t border-[#f07304]" />

              {/* Fuentes Externas */}
              <section>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-1">
                  {/* 1. American Museum of Natural History — ASW Frost */}
                  {fichaEspecie.asw && (
                    <Button
                      asChild
                      className="group hover:bg-muted/50 h-auto rounded-md border p-2"
                      style={{backgroundColor: "#f9f9f9"}}
                      variant="outline"
                    >
                      <a
                        className="flex flex-col items-center"
                        href={fichaEspecie.asw}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <img
                          alt="American Museum of Natural History Logo"
                          className="mx-auto grayscale transition-all duration-[800ms] ease-in-out group-hover:grayscale-0"
                          src="/assets/references/amnh.png"
                          style={{width: "100%", height: "auto"}}
                        />
                        <span className="mt-0.5 text-xs font-medium text-gray-600">ASW Frost</span>
                      </a>
                    </Button>
                  )}

                  {/* 2. AmphibiaWeb */}
                  {fichaEspecie.aw && (
                    <Button
                      asChild
                      className="group hover:bg-muted/50 h-auto rounded-md border p-2"
                      style={{backgroundColor: "#f9f9f9"}}
                      variant="outline"
                    >
                      <a href={fichaEspecie.aw} rel="noopener noreferrer" target="_blank">
                        <img
                          alt="AmphibiaWeb Logo"
                          className="mx-auto grayscale transition-all duration-[800ms] ease-in-out group-hover:grayscale-0"
                          src="/assets/references/amphibiaweb.png"
                          style={{width: "100%", height: "auto"}}
                        />
                      </a>
                    </Button>
                  )}

                  {/* 3. IUCN Red List */}
                  {fichaEspecie.uicn && (
                    <Button
                      asChild
                      className="group hover:bg-muted/50 h-auto rounded-md border p-2"
                      style={{backgroundColor: "#f9f9f9"}}
                      variant="outline"
                    >
                      <a href={fichaEspecie.uicn} rel="noopener noreferrer" target="_blank">
                        <img
                          alt="IUCN Logo"
                          className="mx-auto grayscale transition-all duration-[800ms] ease-in-out group-hover:grayscale-0"
                          src="/assets/references/redlist.png"
                          style={{width: "100%", height: "auto"}}
                        />
                      </a>
                    </Button>
                  )}

                  {/* 4. iNaturalist */}
                  {fichaEspecie.inaturalist && (
                    <Button
                      asChild
                      className="group hover:bg-muted/50 h-auto rounded-md border p-2"
                      style={{backgroundColor: "#f9f9f9"}}
                      variant="outline"
                    >
                      <a href={fichaEspecie.inaturalist} rel="noopener noreferrer" target="_blank">
                        <img
                          alt="iNaturalist Logo"
                          className="mx-auto grayscale transition-all duration-[800ms] ease-in-out group-hover:grayscale-0"
                          src="/assets/references/iNaturalist.png"
                          style={{width: "100%", height: "auto"}}
                        />
                      </a>
                    </Button>
                  )}

                  {/* 5. Wikipedia */}
                  {fichaEspecie.wikipedia && (
                    <Button
                      asChild
                      className="group hover:bg-muted/50 h-auto rounded-md border p-2"
                      style={{backgroundColor: "#f9f9f9"}}
                      variant="outline"
                    >
                      <a href={fichaEspecie.wikipedia} rel="noopener noreferrer" target="_blank">
                        <img
                          alt="Wikipedia Logo"
                          className="mx-auto grayscale transition-all duration-[800ms] ease-in-out group-hover:grayscale-0"
                          src="/assets/references/wikipedia.png"
                          style={{width: "100%", height: "auto"}}
                        />
                      </a>
                    </Button>
                  )}
                </div>
              </section>

              {/* Divisor entre Fuentes Externas y Enlaces relacionados */}
              {Array.isArray(fichaEspecie.enlacesRelacionados) &&
                fichaEspecie.enlacesRelacionados.length > 0 && (
                  <>
                    <hr className="my-5 border-t border-[#f07304]" />
                    <section>
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-1">
                        {fichaEspecie.enlacesRelacionados.map((enlace: any) => (
                          <a
                            key={enlace.id_enlace_relacionado_taxon}
                            className="group flex aspect-square cursor-pointer flex-col items-center justify-center rounded-md border p-1 transition-colors hover:bg-gray-50"
                            href={enlace.enlace}
                            rel="noopener noreferrer"
                            style={{
                              backgroundColor: "#f9f9f9",
                              borderColor: "#dddddd",
                            }}
                            target="_blank"
                          >
                            <div className="aspect-square w-full max-w-[80px] overflow-hidden rounded-md">
                              <img
                                alt={String(enlace.nombre || "Enlace")}
                                className="h-full w-full object-cover opacity-30 grayscale transition-all duration-500 ease-in-out group-hover:grayscale-0"
                                src="/assets/coleccioncj-02.png"
                              />
                            </div>
                            <span className="mt-1 line-clamp-2 px-1 text-center text-xs font-medium text-gray-600">
                              {enlace.nombre}
                            </span>
                          </a>
                        ))}
                      </div>
                    </section>
                  </>
                )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Lightbox
        captions={{descriptionTextAlign: "center", descriptionMaxLines: 4}}
        close={() => setFotoDestacadaOpen(false)}
        controller={{closeOnBackdropClick: true}}
        open={fotoDestacadaOpen}
        plugins={[Captions, Fullscreen, Zoom]}
        slides={fotoDestacadaSlides}
        zoom={{maxZoomPixelRatio: 4, scrollToZoom: true}}
      />
    </CardContent>
  );
};
