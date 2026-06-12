"use client";

import {useMemo, useState} from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {Camera, Download, MapPin, Video, Volume2} from "lucide-react";
import jsPDF from "jspdf";
import Lightbox, {type Slide} from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";

import {formatNumericRange} from "@/lib/format-range";
import {
  processHTMLLinks,
  processHTMLLinksNoUnderline,
  processCitationReferences,
  processCitationReferencesPlain,
} from "@/lib/process-html-links";
import {
  buildCitaLargaDesdePublicacion,
  ordenarPublicacionesAlfabeticamente,
  resaltarTituloEnCita,
} from "@/lib/format-cita-publicacion";

import {Button} from "./ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "./ui/card";
import {Separator} from "./ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "./ui/tooltip";
import ClimaticFloorChart from "./ClimaticFloorChart";

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

const ORDENES_SIN_RENACUAJOS = new Set(["caudata", "gymnophiona"]);
const FAMILIAS_SIN_RENACUAJOS = new Set(["craugastoridae", "eleutherodactylidae"]);


const cardSubsectionTitle = "mb-2 text-base font-semibold text-gray-900";
const cardSectionDivider = "mt-4 border-t border-gray-100 pt-3";
const RANARIUM_URL = "https://deepskyblue-beaver-511675.hostingersite.com/portfolio/saparium/";

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

const shouldShowRenacuajos = (lineage: {rank_id?: number; taxon?: string}[] | undefined) => {
  const orden = lineage
    ?.find((item) => item.rank_id === 4)
    ?.taxon?.trim()
    .toLowerCase();
  const familia = lineage
    ?.find((item) => item.rank_id === 5)
    ?.taxon?.trim()
    .toLowerCase();

  if (orden && ORDENES_SIN_RENACUAJOS.has(orden)) return false;
  if (familia && FAMILIAS_SIN_RENACUAJOS.has(familia)) return false;

  return true;
};

// Función para agrupar datos geopolíticos jerárquicamente
const groupGeoPoliticalData = (geoPolitica: any[]) => {
  if (!geoPolitica || geoPolitica.length === 0) return {};

  // Ordenar por rank_geopolitica_id (de menor a mayor, asumiendo que 1=Continente, 2=País, 3=Provincia)
  const sortedData = [...geoPolitica].sort((a, b) => a.rank_geopolitica_id - b.rank_geopolitica_id);

  const grouped: any = {};
  let currentContinente: string | null = null;
  let currentPais: string | null = null;

  sortedData.forEach((item: any) => {
    const {rank_nombre, nombre} = item;
    const normalizedRankNombre = rank_nombre?.toLowerCase();

    if (normalizedRankNombre === "continente") {
      currentContinente = nombre;
      if (!grouped[nombre]) {
        grouped[nombre] = {paises: {}};
      }
    } else if (normalizedRankNombre === "país" || normalizedRankNombre === "pais") {
      if (!currentContinente) {
        currentContinente = "Sin continente";
        grouped[currentContinente] = {paises: {}};
      }
      currentPais = nombre;
      if (!grouped[currentContinente].paises[nombre]) {
        grouped[currentContinente].paises[nombre] = {provincias: []};
      }
    } else if (normalizedRankNombre === "provincia") {
      if (!currentContinente) {
        currentContinente = "Sin continente";
        grouped[currentContinente] = {paises: {}};
      }
      if (!currentPais) {
        currentPais = "Sin país";
        grouped[currentContinente].paises[currentPais] = {provincias: []};
      }
      if (!grouped[currentContinente].paises[currentPais].provincias.includes(nombre)) {
        grouped[currentContinente].paises[currentPais].provincias.push(nombre);
      }
    }
  });

  return grouped;
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
  <div className="space-y-3">
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
        <div key={key} className="px-1 py-1">
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

  const showRenacuajos = useMemo(
    () => shouldShowRenacuajos(fichaEspecie.lineage),
    [fichaEspecie.lineage],
  );

  // Tipo de mapa seleccionado para el mapa de colecciones
  const [mapType, setMapType] = useState<MapType>("provinces");

  // Lightbox para la foto destacada de la especie
  const [fotoDestacadaOpen, setFotoDestacadaOpen] = useState(false);
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

  // Función para extraer texto de un elemento HTML
  const extractTextFromElement = (element: HTMLElement): string => {
    let text = "";

    // Obtener texto directo del nodo
    if (element.nodeType === Node.TEXT_NODE) {
      text += element.textContent?.trim() || "";
    } else {
      // Procesar hijos
      element.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const nodeText = node.textContent?.trim();

          if (nodeText) {
            text += nodeText + " ";
          }
        } else if (node instanceof HTMLElement) {
          // Ignorar imágenes y elementos ocultos
          if (
            node.tagName === "IMG" ||
            node.style.display === "none" ||
            node.style.visibility === "hidden"
          ) {
            return;
          }

          // Agregar saltos de línea para elementos de bloque
          const blockElements = ["DIV", "P", "H1", "H2", "H3", "H4", "H5", "H6", "LI", "BR"];

          if (blockElements.includes(node.tagName)) {
            const childText = extractTextFromElement(node);

            if (childText) {
              text += childText + "\n";
            }
          } else {
            text += extractTextFromElement(node);
          }
        }
      });
    }

    return text.trim();
  };

  // Función para limpiar HTML y obtener texto plano
  const stripHTML = (html: string | null | undefined): string => {
    if (!html || html === "undefined" || html === "null") return "";
    const tmp = document.createElement("div");

    tmp.innerHTML = html;
    const text = tmp.textContent || tmp.innerText || "";

    return text.trim();
  };

  // Función para validar y formatear valores
  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === "undefined" || value === "null") {
      return "";
    }
    if (typeof value === "string") {
      return value.trim();
    }

    return String(value).trim();
  };

  // Función para descargar la ficha como PDF (solo texto)
  const handleDownloadPDF = async () => {
    try {
      // Obtener el nombre científico para el nombre del archivo
      const nombreCientifico = fichaEspecie.taxones?.[0]?.taxon
        ? `${fichaEspecie.taxones[0].taxonPadre?.taxon || ""} ${fichaEspecie.taxones[0].taxon}`.trim()
        : "especie";

      // Mostrar mensaje de carga
      const loadingMessage = document.createElement("div");

      loadingMessage.textContent = "Generando PDF...";
      loadingMessage.style.cssText =
        "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.8); color: white; padding: 20px; border-radius: 8px; z-index: 10000;";
      document.body.appendChild(loadingMessage);

      // Crear PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = 210; // Ancho A4 en mm
      const pageHeight = 297; // Alto A4 en mm
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Función para agregar texto con salto de página automático
      // Factor de conversión: 1 punto = 0.352778 mm, con lineHeight aplicado
      const ptToMm = 0.352778;
      const addText = (
        text: string,
        fontSize: number = 10,
        isBold: boolean = false,
        lineHeight: number = 1.2,
      ) => {
        if (!text || text.trim() === "" || text === "undefined" || text === "null") {
          return;
        }

        pdf.setFontSize(fontSize);
        pdf.setFont("helvetica", isBold ? "bold" : "normal");

        const lines = pdf.splitTextToSize(text.trim(), maxWidth);

        lines.forEach((line: string) => {
          if (yPosition > pageHeight - margin - 15) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(line, margin, yPosition);
          yPosition += fontSize * ptToMm * lineHeight;
        });
      };

      // Función para procesar citas {{id}} en el texto.
      // Usa la versión plana (sin HTML/popup) para evitar duplicar la
      // cita_larga cuando luego se aplica stripHTML antes de pintar en el PDF.
      const procesarCitas = (texto: string | null | undefined): string => {
        if (!texto) return "";

        return processCitationReferencesPlain(texto, publicaciones);
      };

      // Función para agregar una sección con título
      const addSection = (title: string, content: string | null | undefined) => {
        // Primero procesar las citas, luego limpiar HTML
        const contentConCitas = procesarCitas(content);
        const cleanContent = formatValue(stripHTML(contentConCitas));

        if (!cleanContent) return;

        yPosition += 3;
        addText(title, 12, true, 1.2);
        yPosition += 1;
        addText(cleanContent, 10, false, 1.2);
      };

      // Cargar y agregar logo
      try {
        const logoImg = new Image();

        logoImg.crossOrigin = "anonymous";
        logoImg.src = "/assets/references/logo.png";

        await new Promise((resolve) => {
          logoImg.onload = () => {
            try {
              // Calcular proporciones para mantener el aspecto original
              const originalWidth = logoImg.naturalWidth;
              const originalHeight = logoImg.naturalHeight;
              const aspectRatio = originalWidth / originalHeight;

              // Definir altura máxima deseada y calcular ancho proporcional
              const maxHeight = 20; // mm
              const calculatedWidth = maxHeight * aspectRatio;

              // Limitar el ancho máximo a 60mm
              const finalWidth = Math.min(calculatedWidth, 60);
              const finalHeight = finalWidth / aspectRatio;

              pdf.addImage(logoImg, "PNG", margin, yPosition, finalWidth, finalHeight);
              yPosition += finalHeight + 10;
            } catch (err) {
              console.warn("Error al agregar logo:", err);
            }
            resolve(null);
          };
          logoImg.onerror = () => resolve(null);
          setTimeout(() => resolve(null), 2000);
        });
      } catch (err) {
        console.warn("Error al cargar logo:", err);
      }

      // Título principal
      addText(nombreCientifico, 16, true, 1.3);
      yPosition += 3;

      // Agregar fotografía de la especie si existe
      if (fichaEspecie.fotografia_url) {
        try {
          // Función para obtener imagen como base64 usando proxy del servidor
          const getImageAsBase64 = async (url: string): Promise<string | null> => {
            try {
              // Usar el proxy del servidor para evitar problemas de CORS
              const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(url)}`;
              const response = await fetch(proxyUrl);

              if (!response.ok) {
                console.warn("Proxy response not ok:", response.status);
                throw new Error("Proxy fetch failed");
              }

              const data = await response.json();

              if (data.dataUrl) {
                return data.dataUrl;
              }
              throw new Error("No dataUrl in response");
            } catch (proxyError) {
              console.warn("Error con proxy, intentando método directo:", proxyError);

              // Fallback: intentar con Image y canvas (puede fallar por CORS)
              return new Promise((resolve) => {
                const img = new Image();

                img.crossOrigin = "anonymous";
                img.onload = () => {
                  try {
                    const canvas = document.createElement("canvas");

                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                    const ctx = canvas.getContext("2d");

                    if (ctx) {
                      ctx.drawImage(img, 0, 0);
                      resolve(canvas.toDataURL("image/jpeg", 0.9));
                    } else {
                      resolve(null);
                    }
                  } catch (canvasError) {
                    console.warn("Error con canvas:", canvasError);
                    resolve(null);
                  }
                };
                img.onerror = (e) => {
                  console.warn("Error cargando imagen:", e);
                  resolve(null);
                };
                img.src = url;
                setTimeout(() => resolve(null), 5000);
              });
            }
          };

          console.log("Cargando imagen:", fichaEspecie.fotografia_url);
          const imageBase64 = await getImageAsBase64(fichaEspecie.fotografia_url);

          console.log("Imagen cargada:", imageBase64 ? "Sí" : "No");

          if (imageBase64) {
            // Crear imagen temporal para obtener dimensiones
            const tempImg = new Image();

            await new Promise<void>((resolve) => {
              tempImg.onload = () => resolve();
              tempImg.onerror = () => resolve();
              tempImg.src = imageBase64;
            });

            if (tempImg.naturalWidth > 0 && tempImg.naturalHeight > 0) {
              // Calcular proporciones para mantener el aspecto original
              const originalWidth = tempImg.naturalWidth;
              const originalHeight = tempImg.naturalHeight;
              const aspectRatio = originalWidth / originalHeight;

              // Definir ancho máximo y calcular altura proporcional
              const maxImgWidth = 80; // mm
              const maxImgHeight = 60; // mm

              let imgWidth = maxImgWidth;
              let imgHeight = imgWidth / aspectRatio;

              // Si la altura excede el máximo, ajustar
              if (imgHeight > maxImgHeight) {
                imgHeight = maxImgHeight;
                imgWidth = imgHeight * aspectRatio;
              }

              // Alinear la imagen a la izquierda
              const imgX = margin;

              // Verificar si hay espacio en la página actual
              if (yPosition + imgHeight > pageHeight - margin - 15) {
                pdf.addPage();
                yPosition = margin;
              }

              pdf.addImage(imageBase64, "JPEG", imgX, yPosition, imgWidth, imgHeight);
              yPosition += imgHeight + 15;
              console.log("Imagen agregada al PDF");
            } else {
              console.warn("Dimensiones de imagen inválidas");
            }
          } else {
            console.warn("No se pudo cargar la fotografía de la especie");
          }
        } catch (err) {
          console.warn("Error al procesar fotografía:", err);
        }
      }

      // Información taxonómica (Orden, Familia, Género)
      const orden = formatValue(
        fichaEspecie.lineage?.find((item: any) => item.rank_id === 4)?.taxon,
      );
      const familia = formatValue(
        fichaEspecie.lineage?.find((item: any) => item.rank_id === 5)?.taxon,
      );
      const genero = formatValue(
        fichaEspecie.taxones?.[0]?.taxonPadre?.taxon ||
          fichaEspecie.lineage?.find((item: any) => item.rank_id === 6)?.taxon,
      );
      const nombreComun = formatValue(fichaEspecie.taxones?.[0]?.nombre_comun);

      if (orden || familia || genero || nombreComun) {
        addText("Clasificación Taxonómica", 11, true, 1.2);
        yPosition += 1;
        if (orden) {
          addText(`Orden: ${orden}`, 10, false, 1.2);
        }
        if (familia) {
          addText(`Familia: ${familia}`, 10, false, 1.2);
        }
        if (genero) {
          addText(`Género: ${genero}`, 10, false, 1.2);
        }
        if (nombreComun) {
          addText(`Nombre común: ${nombreComun}`, 10, false, 1.2);
        }
        yPosition += 2;
      }

      // Agregar contenido de la ficha
      const sections = [
        {title: "Primer(os) colector(es)", content: fichaEspecie.descubridor},
        {title: "Sinonimia", content: fichaEspecie.sinonimia},
        {title: "Etimología", content: fichaEspecie.etimologia},
        {title: "Taxonomía", content: fichaEspecie.taxonomia},
        {title: "Identificación", content: fichaEspecie.identificacion},
        {
          title: "Morfometría",
          content: [
            fichaEspecie.svl_macho && `Longitud rostro-cloacal ♂: ${fichaEspecie.svl_macho}`,
            fichaEspecie.svl_hembra && `Longitud rostro-cloacal ♀: ${fichaEspecie.svl_hembra}`,
          ]
            .filter(Boolean)
            .join("<br />"),
        },
        {title: "Color en Vida", content: fichaEspecie.color_en_vida},
        {title: "Color en Preservación", content: fichaEspecie.color_en_preservacion},
        {title: "Hábitat y Biología", content: fichaEspecie.habitat_biologia},
        {title: "Reproducción", content: fichaEspecie.reproduccion},
        {title: "Dieta", content: fichaEspecie.dieta},
        {title: "Canto", content: fichaEspecie.canto},
        ...(showRenacuajos ? [{title: "Larva", content: fichaEspecie.larva}] : []),
        {title: "Distribución", content: fichaEspecie.distribucion},
        {title: "Rango Altitudinal (Texto)", content: fichaEspecie.rango_altitudinal},
        {title: "Observación Zona Altitudinal", content: fichaEspecie.observacion_zona_altitudinal},
        {title: "Referencia Área Protegida", content: fichaEspecie.referencia_area_protegida},
        {
          title: "Comentario Estatus Poblacional",
          content: fichaEspecie.comentario_estatus_poblacional,
        },
        {title: "Usos", content: fichaEspecie.usos},
        {title: "Información Adicional", content: fichaEspecie.informacion_adicional},
        {title: "Agradecimiento", content: fichaEspecie.agradecimiento},
      ];

      sections.forEach((section) => {
        // addSection ahora procesa citas y limpia HTML internamente
        addSection(section.title, section.content);
      });

      // Agregar información de distribución detallada
      yPosition += 3;
      addText("Distribución y Ecología", 11, true, 1.2);
      yPosition += 1;

      // Rango Altitudinal numérico
      const minAlt = fichaEspecie.rango_altitudinal_min;
      const maxAlt = fichaEspecie.rango_altitudinal_max;

      if ((minAlt !== null && minAlt !== undefined) || (maxAlt !== null && maxAlt !== undefined)) {
        addText("Rango Altitudinal", 10, true, 1.2);
        yPosition += 1;
        if (minAlt !== null && minAlt !== undefined && maxAlt !== null && maxAlt !== undefined) {
          addText(formatNumericRange(minAlt, maxAlt, "m") ?? "", 10, false, 1.2);
        } else if (minAlt !== null && minAlt !== undefined) {
          addText(`Mínimo: ${minAlt} m`, 10, false, 1.2);
        } else if (maxAlt !== null && maxAlt !== undefined) {
          addText(`Máximo: ${maxAlt} m`, 10, false, 1.2);
        }
        yPosition += 1.5;
      }

      // Distribución Global con Geopolítica
      const distribucionGlobal = stripHTML(procesarCitas(fichaEspecie.distribucion_global));
      const geoPoliticaData = fichaEspecie.geoPolitica;

      if (distribucionGlobal || (geoPoliticaData && geoPoliticaData.length > 0)) {
        addText("Distribución global", 10, true, 1.2);
        yPosition += 1;

        // Geopolítica
        if (geoPoliticaData && geoPoliticaData.length > 0) {
          addText("Geopolítica:", 10, false, 1.2);
          yPosition += 0.5;
          const grouped = groupGeoPoliticalData(geoPoliticaData);

          Object.entries(grouped).forEach(([continente, continenteData]: [string, any]) => {
            Object.entries(continenteData.paises).forEach(([pais, paisData]: [string, any]) => {
              let geoText = `${continente} > ${pais}`;

              if (paisData.provincias && paisData.provincias.length > 0) {
                geoText += ` > ${paisData.provincias.join(", ")}`;
              }
              addText(geoText, 10, false, 1.2);
            });
          });
          yPosition += 0.5;
        }

        // Descripción de distribución global
        if (distribucionGlobal) {
          addText(distribucionGlobal, 10, false, 1.2);
        }
        yPosition += 1.5;
      }

      // Zonas Altitudinales
      const zonasAltitudinales = fichaEspecie.distributions;

      if (zonasAltitudinales && zonasAltitudinales.length > 0) {
        const uniqueZonas = new Map();

        zonasAltitudinales.forEach((categoria: any) => {
          const key = categoria.id_taxon_catalogo_awe || categoria.catalogo_awe_id;

          if (!uniqueZonas.has(key) && categoria.catalogo_awe?.nombre) {
            uniqueZonas.set(key, categoria.catalogo_awe.nombre);
          }
        });
        if (uniqueZonas.size > 0) {
          addText("Zonas Altitudinales", 10, true, 1.2);
          yPosition += 1;
          Array.from(uniqueZonas.values()).forEach((nombre: string) => {
            addText(`• ${nombre}`, 10, false, 1.2);
          });
          yPosition += 1.5;
        }
      }

      // Ecosistemas
      const ecosistemas =
        fichaEspecie.taxon_catalogo_awe_results?.filter(
          (categoria: any) => categoria.catalogo_awe?.tipo_catalogo_awe?.nombre === "Ecosistemas",
        ) || [];

      if (ecosistemas.length > 0) {
        addText("Ecosistemas", 10, true, 1.2);
        yPosition += 1;
        ecosistemas.forEach((categoria: any) => {
          if (categoria.catalogo_awe?.nombre) {
            addText(`• ${categoria.catalogo_awe.nombre}`, 10, false, 1.2);
          }
        });
        yPosition += 1.5;
      }

      // Regiones Biogeográficas
      const regionesBio = fichaEspecie.dataRegionBio;

      if (regionesBio && regionesBio.length > 0) {
        addText("Regiones Biogeográficas", 10, true, 1.2);
        yPosition += 1;
        regionesBio.forEach((region: any) => {
          if (region.catalogo_awe?.nombre) {
            addText(`• ${region.catalogo_awe.nombre}`, 10, false, 1.2);
          }
        });
        yPosition += 1.5;
      }

      // Reservas de la Biosfera
      const reservasBiosfera =
        fichaEspecie.taxon_catalogo_awe_results?.filter(
          (categoria: any) =>
            categoria.catalogo_awe?.tipo_catalogo_awe?.nombre === "Reservas de la Biósfera",
        ) || [];

      if (reservasBiosfera.length > 0) {
        addText("Reservas de la Biosfera", 10, true, 1.2);
        yPosition += 1;
        reservasBiosfera.forEach((categoria: any) => {
          if (categoria.catalogo_awe?.nombre) {
            addText(`• ${categoria.catalogo_awe.nombre}`, 10, false, 1.2);
          }
        });
        yPosition += 1.5;
      }

      // Bosques Protegidos
      const bosquesProtegidos =
        fichaEspecie.taxon_catalogo_awe_results?.filter(
          (categoria: any) =>
            categoria.catalogo_awe?.tipo_catalogo_awe?.nombre === "Bosques Protegidos",
        ) || [];

      if (bosquesProtegidos.length > 0) {
        addText("Bosques Protegidos", 10, true, 1.2);
        yPosition += 1;
        bosquesProtegidos.forEach((categoria: any) => {
          if (categoria.catalogo_awe?.nombre) {
            addText(`• ${categoria.catalogo_awe.nombre}`, 10, false, 1.2);
          }
        });
        yPosition += 1.5;
      }

      // Áreas Protegidas
      const areasProtegidas =
        fichaEspecie.taxon_catalogo_awe_results?.filter(
          (categoria: any) =>
            categoria.catalogo_awe?.tipo_catalogo_awe?.nombre === "Áreas protegidas del Estado" ||
            categoria.catalogo_awe?.tipo_catalogo_awe?.nombre === "Áreas protegidas Privadas",
        ) || [];

      if (areasProtegidas.length > 0) {
        // Eliminar duplicados
        const uniqueAreas = new Map();

        areasProtegidas.forEach((categoria: any) => {
          const key = categoria.catalogo_awe_id;

          if (!uniqueAreas.has(key) && categoria.catalogo_awe?.nombre) {
            uniqueAreas.set(key, categoria);
          }
        });
        const areasUnicas = Array.from(uniqueAreas.values());

        if (areasUnicas.length > 0) {
          addText("Áreas Protegidas", 10, true, 1.2);
          yPosition += 1;

          const areasEstado = areasUnicas.filter(
            (categoria: any) =>
              categoria.catalogo_awe?.tipo_catalogo_awe?.nombre === "Áreas protegidas del Estado",
          );
          const areasPrivadas = areasUnicas.filter(
            (categoria: any) =>
              categoria.catalogo_awe?.tipo_catalogo_awe?.nombre === "Áreas protegidas Privadas",
          );

          if (areasEstado.length > 0) {
            addText("Áreas protegidas del Estado:", 10, false, 1.2);
            yPosition += 0.5;
            areasEstado.forEach((categoria: any) => {
              addText(`  • ${categoria.catalogo_awe.nombre}`, 10, false, 1.2);
            });
            yPosition += 0.5;
          }

          if (areasPrivadas.length > 0) {
            addText("Áreas protegidas Privadas:", 10, false, 1.2);
            yPosition += 0.5;
            areasPrivadas.forEach((categoria: any) => {
              addText(`  • ${categoria.catalogo_awe.nombre}`, 10, false, 1.2);
            });
            yPosition += 0.5;
          }
        }
      }

      // Agregar información de SVL si existe
      const svlMacho = formatValue(fichaEspecie.svl_macho);
      const svlHembra = formatValue(fichaEspecie.svl_hembra);

      if (svlMacho || svlHembra) {
        yPosition += 3;
        addText("Tamaño", 11, true, 1.2);
        yPosition += 1;
        if (svlMacho) {
          addText(`SVL Macho: ${svlMacho}`, 10, false, 1.2);
        }
        if (svlHembra) {
          addText(`SVL Hembra: ${svlHembra}`, 10, false, 1.2);
        }
      }

      // Agregar información de temperatura si existe
      const temp = fichaEspecie.temperatura;
      const tempMin = fichaEspecie.temperatura_min;
      const tempMax = fichaEspecie.temperatura_max;

      if (
        (temp !== null && temp !== undefined) ||
        (tempMin !== null && tempMin !== undefined) ||
        (tempMax !== null && tempMax !== undefined)
      ) {
        yPosition += 3;
        addText("Temperatura", 11, true, 1.2);
        yPosition += 1;
        if (temp !== null && temp !== undefined) {
          addText(`Temperatura: ${temp}°C`, 10, false, 1.2);
        }
        if (tempMin !== null && tempMin !== undefined) {
          addText(`Temperatura mínima: ${tempMin}°C`, 10, false, 1.2);
        }
        if (tempMax !== null && tempMax !== undefined) {
          addText(`Temperatura máxima: ${tempMax}°C`, 10, false, 1.2);
        }
      }

      // Agregar información de pluviocidad si existe
      const pluv = fichaEspecie.pluviocidad;
      const pluvMin = fichaEspecie.pluviocidad_min;
      const pluvMax = fichaEspecie.pluviocidad_max;

      if (
        (pluv !== null && pluv !== undefined) ||
        (pluvMin !== null && pluvMin !== undefined) ||
        (pluvMax !== null && pluvMax !== undefined)
      ) {
        yPosition += 3;
        addText("Pluviocidad", 11, true, 1.2);
        yPosition += 1;
        if (pluv !== null && pluv !== undefined) {
          addText(`Pluviocidad: ${pluv} mm`, 10, false, 1.2);
        }
        if (pluvMin !== null && pluvMin !== undefined) {
          addText(`Pluviocidad mínima: ${pluvMin} mm`, 10, false, 1.2);
        }
        if (pluvMax !== null && pluvMax !== undefined) {
          addText(`Pluviocidad máxima: ${pluvMax} mm`, 10, false, 1.2);
        }
      }

      // Agregar información de Lista Roja si existe
      const listaRojaSigla = formatValue(fichaEspecie.listaRojaIUCN?.catalogo_awe?.sigla);
      const listaRojaNombre = formatValue(fichaEspecie.listaRojaIUCN?.catalogo_awe?.nombre);

      if (listaRojaSigla) {
        yPosition += 3;
        addText("Lista Roja Ecuador", 11, true, 1.2);
        yPosition += 1;
        addText(`Estado: ${listaRojaSigla}`, 10, false, 1.2);
        if (listaRojaNombre) {
          addText(`Categoría: ${listaRojaNombre}`, 10, false, 1.2);
        }
      }

      // Agregar información de endemismo
      const endemica = fichaEspecie.taxones?.[0]?.endemica;

      if (endemica !== undefined && endemica !== null) {
        yPosition += 3;
        addText("Endemismo", 11, true, 1.2);
        yPosition += 1;
        addText(endemica ? "Endémica" : "No endémica", 10, false, 1.2);
      }

      // Agregar información de compilador y editor
      const compilador = formatValue(fichaEspecie.compilador);
      const editor = formatValue(fichaEspecie.editor);

      if (compilador || editor) {
        yPosition += 3;
        addText("Créditos", 11, true, 1.2);
        yPosition += 1;
        if (compilador) {
          addText(`Compilador: ${compilador}`, 10, false, 1.2);
          const autoriaComp = formatValue(fichaEspecie.autoria_compilador);

          if (autoriaComp) {
            addText(`Autoría compilador: ${autoriaComp}`, 10, false, 1.2);
          }
          const fechaComp = formatValue(fichaEspecie.fecha_compilacion);

          if (fechaComp) {
            addText(`Fecha compilación: ${fechaComp}`, 10, false, 1.2);
          }
        }
        if (editor) {
          addText(`Editor: ${editor}`, 10, false, 1.2);
          const autoriaEdit = formatValue(fichaEspecie.autoria_editor);

          if (autoriaEdit) {
            addText(`Autoría editor: ${autoriaEdit}`, 10, false, 1.2);
          }
          const fechaEdit = formatValue(fichaEspecie.fecha_edicion);

          if (fechaEdit) {
            addText(`Fecha edición: ${fechaEdit}`, 10, false, 1.2);
          }
        }
      }

      // Agregar historial
      const historial = formatValue(fichaEspecie.historial);

      if (historial) {
        yPosition += 3;
        addText("Historial", 11, true, 1.2);
        yPosition += 1;
        const cleanHistorial = stripHTML(procesarCitas(historial));

        if (cleanHistorial) {
          addText(cleanHistorial, 10, false, 1.2);
        }
      }

      // Agregar fecha de actualización
      const fechaActualizacion = formatValue(fichaEspecie.fecha_actualizacion);

      if (fechaActualizacion) {
        yPosition += 3;
        addText("Fecha de Actualización", 11, true, 1.2);
        yPosition += 1;
        addText(fechaActualizacion, 10, false, 1.2);
      }

      const referenciasClave = fichaEspecie.referenciasClave || [];

      if (referenciasClave.length > 0) {
        yPosition += 5;
        addText("Referencias clave", 11, true, 1.2);
        yPosition += 2;

        const referenciasClaveTexto = referenciasClave
          .map((pub: any) => (pub.publicacion ? stripHTML(buildReferenciaClaveText(pub)) : ""))
          .filter(Boolean)
          .join(" | ");

        if (referenciasClaveTexto) {
          addText(referenciasClaveTexto, 9, false, 1.2);
        }
      }

      // Agregar Literatura citada
      if (publicaciones && publicaciones.length > 0) {
        yPosition += 5;
        addText("Literatura citada", 11, true, 1.2);
        yPosition += 2;

        publicaciones.forEach((pub: any) => {
          if (!pub.publicacion) return;

          // Construir cita completa
          let citaCompleta = "";

          if (pub.publicacion.cita_larga) {
            citaCompleta = pub.publicacion.cita_larga;
          } else if (pub.publicacion.cita_corta) {
            const partes: string[] = [];

            partes.push(pub.publicacion.cita_corta);

            if (
              pub.publicacion.titulo &&
              !pub.publicacion.cita_corta.includes(pub.publicacion.titulo)
            ) {
              partes.push(pub.publicacion.titulo);
            }
            if (pub.publicacion.editorial) {
              partes.push(pub.publicacion.editorial);
            }
            if (pub.publicacion.volumen) {
              partes.push(`Vol. ${pub.publicacion.volumen}`);
            }
            if (pub.publicacion.numero) {
              partes.push(`No. ${pub.publicacion.numero}`);
            }
            if (pub.publicacion.pagina) {
              partes.push(`pp. ${pub.publicacion.pagina}`);
            }
            if (pub.publicacion.numero_publicacion_ano) {
              const añoStr = String(pub.publicacion.numero_publicacion_ano);

              if (!pub.publicacion.cita_corta.includes(añoStr)) {
                partes.push(`(${añoStr})`);
              }
            }
            citaCompleta = partes.join(", ");
          } else if (pub.publicacion.cita) {
            citaCompleta = pub.publicacion.cita;
          }

          if (citaCompleta) {
            // Limpiar HTML de la cita
            const citaLimpia = stripHTML(citaCompleta);

            if (citaLimpia) {
              addText(`• ${citaLimpia}`, 9, false, 1.2);
              yPosition += 1;
            }
          }
        });
      }

      // Remover mensaje de carga
      if (document.body.contains(loadingMessage)) {
        document.body.removeChild(loadingMessage);
      }

      // Descargar el PDF
      pdf.save(`Ficha_${nombreCientifico.replace(/\s+/g, "_")}.pdf`);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido al generar el PDF";

      alert(
        `Error al generar el PDF: ${errorMessage}\n\nPor favor, verifica la consola para más detalles.`,
      );

      // Remover mensaje de carga en caso de error
      const loadingMessage = document.getElementById("pdf-loading-message");

      if (loadingMessage) {
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
            {/* Primer(os) colector(es) */}
            <Card className="gap-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Primer(os) colector(es)</CardTitle>
              </CardHeader>
              <CardContent>
                {fichaEspecie.descubridor ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: procesarHTML(fichaEspecie.descubridor),
                    }}
                    suppressHydrationWarning
                    className="text-muted-foreground text-sm"
                  />
                ) : (
                  <p className="text-muted-foreground text-sm">No disponible</p>
                )}
              </CardContent>
            </Card>
            {/* Material tipo (sinonimia) */}
            {fichaEspecie.sinonimia && (
              <Card className="gap-0">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-baseline gap-2 text-base">
                    <span>Material tipo</span>
                    {fichaEspecie.asw && (
                      <>
                        <span style={{color: "#f07304"}}>|</span>
                        <a
                          className="text-base font-medium hover:underline"
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
                  <div
                    dangerouslySetInnerHTML={{
                      __html: procesarHTML(fichaEspecie.sinonimia),
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
                        <h4 className={cardSubsectionTitle}>Nombres estándar</h4>
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
                <CardTitle className="text-base">Taxonomía y relaciones filogenéticas</CardTitle>
              </CardHeader>
              <CardContent>
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
                  const hasMorfometria = Boolean(fichaEspecie.svl_macho || fichaEspecie.svl_hembra);
                  const hasColorEnVida = Boolean(fichaEspecie.color_en_vida);
                  const hasPriorToMorfometria = hasIdentificacion;
                  const hasPriorToColor = hasIdentificacion || hasMorfometria;
                  const hasPriorToSimilares = hasIdentificacion || hasMorfometria || hasColorEnVida;

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
                                <span className="text-muted-foreground text-xs font-medium">
                                  Longitud rostro-cloacal ♂:
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
                                <span className="text-muted-foreground text-xs font-medium">
                                  Longitud rostro-cloacal ♀:
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

                      <div className={hasPriorToSimilares ? cardSectionDivider : ""}>
                        <h4 className={cardSubsectionTitle}>Especies similares</h4>
                        {fichaEspecie.comparacion && (
                          <div
                            dangerouslySetInnerHTML={{
                              __html: procesarHTML(fichaEspecie.comparacion),
                            }}
                            suppressHydrationWarning
                            className="text-muted-foreground text-sm"
                          />
                        )}
                      </div>
                    </>
                  );
                })()}

                {/* Color en preservación - OCULTO */}
                {/* {fichaEspecie.color_en_preservacion && (
                  <div className="mt-4">
                    <h4 className={cardSubsectionTitle}>Color en preservación</h4>
                    <div
                      suppressHydrationWarning dangerouslySetInnerHTML={{
                        __html: procesarHTML(fichaEspecie.color_en_preservacion),
                      }}
                      className="text-muted-foreground text-sm"
                    />
                  </div>
                )} */}
              </CardContent>
            </Card>
            {showRenacuajos && (
              <Card className="gap-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Renacuajo</CardTitle>
                </CardHeader>
                <CardContent>
                  {fichaEspecie.larva ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: procesarHTML(fichaEspecie.larva),
                      }}
                      suppressHydrationWarning
                      className="text-muted-foreground text-sm"
                    />
                  ) : (
                    <p className="text-muted-foreground text-sm">No disponible</p>
                  )}
                </CardContent>
              </Card>
            )}
            {/* Historia Natural */}
            <Card className="">
              <CardContent>
                {(() => {
                  const hasHabitat = Boolean(fichaEspecie.habitat_biologia);
                  const hasReproduccion = Boolean(fichaEspecie.reproduccion);
                  const hasDieta = Boolean(fichaEspecie.dieta);
                  const hasCanto = Boolean(fichaEspecie.canto);

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

                      {hasDieta && (
                        <div className={hasHabitat || hasReproduccion ? cardSectionDivider : ""}>
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

                      {hasCanto && (
                        <div
                          className={
                            hasHabitat || hasReproduccion || hasDieta ? cardSectionDivider : ""
                          }
                        >
                          <h4 className={cardSubsectionTitle}>Canto</h4>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: procesarHTML(fichaEspecie.canto),
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
                        inlineDatos.push({
                          label: "Área ocupación AOO",
                          value: "0.00 km²",
                        });
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
                        <div className="relative h-[360px] w-full overflow-hidden rounded-md border border-gray-200 sm:h-[480px] lg:h-[640px]">
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
            {/* Conservación */}
            <Card className="scroll-mt-24 gap-0" id="conservacion">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Conservación</CardTitle>
              </CardHeader>
              <CardContent>
                <>
                  {/* 1. Lista Roja Global */}
                  <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs sm:text-sm">
                    <span className={`${cardSubsectionTitle} mb-0`}>Lista Roja Global</span>
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

                  {/* Usos */}
                  <div className="mt-3">
                    {fichaEspecie.usos ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: procesarHTML(fichaEspecie.usos),
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
              <CardContent className="pt-4">
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

              return (
                <>
                  <Card className="gap-0">
                    <CardContent className="pt-4">
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
                    <CardContent className="py-3">
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Coloma, L. A. {anoActualizacion}. Anfibios Ecuador: Referencia en línea.
                        Version 1.0. ({today}) Base de datos electrónica en{" "}
                        <a
                          className="processed-link"
                          href="https://deepskyblue-beaver-511675.hostingersite.com"
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          https://deepskyblue-beaver-511675.hostingersite.com
                        </a>
                        . Centro Jambatu de investigación y conservación de anfibios, Quito, Ecuador.
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
              className="flex h-7 w-full items-center justify-center gap-1 px-2 text-[11px]"
              variant="outline"
              onClick={handleDownloadPDF}
            >
              <Download className="h-3 w-3" />
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
              <hr className="my-5 border-t border-gray-200" />

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
              <hr className="my-5 border-t border-gray-200" />

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
                    <hr className="my-5 border-t border-gray-200" />
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
