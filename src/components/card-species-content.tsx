"use client";

import {useMemo} from "react";
import Link from "next/link";
import {Camera, Download, MapPin, Video, Volume2} from "lucide-react";
import jsPDF from "jspdf";

import {
  processHTMLLinks,
  processHTMLLinksNoUnderline,
  processCitationReferences,
} from "@/lib/process-html-links";
import {getBibliographyUrl} from "@/lib/get-bibliography-url";

import {Button} from "./ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "./ui/card";
import {Separator} from "./ui/separator";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "./ui/tooltip";
import ClimaticFloorChart from "./ClimaticFloorChart";
import RedListStatus from "./RedListStatus";

// Función helper para detectar si es PE
const isPE = (sigla: string | null | undefined) => {
  if (!sigla) return false;

  return sigla === "PE" || sigla.includes("PE") || sigla.includes("Posiblemente extinta");
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
      const addText = (text: string, fontSize: number = 10, isBold: boolean = false, lineHeight: number = 1.2) => {
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

      // Función para procesar citas {{id}} en el texto
      const procesarCitas = (texto: string | null | undefined): string => {
        if (!texto) return "";
        return processCitationReferences(texto, publicaciones);
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
      if (fichaEspecie.fotografia_ficha) {
        try {
          const speciesImg = new Image();
          speciesImg.crossOrigin = "anonymous";
          speciesImg.src = fichaEspecie.fotografia_ficha;
          
          await new Promise((resolve) => {
            speciesImg.onload = () => {
              try {
                // Calcular proporciones para mantener el aspecto original
                const originalWidth = speciesImg.naturalWidth;
                const originalHeight = speciesImg.naturalHeight;
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
                
                pdf.addImage(speciesImg, "JPEG", imgX, yPosition, imgWidth, imgHeight);
                yPosition += imgHeight + 5;
              } catch (err) {
                console.warn("Error al agregar fotografía:", err);
              }
              resolve(null);
            };
            speciesImg.onerror = () => {
              console.warn("Error al cargar fotografía de la especie");
              resolve(null);
            };
            setTimeout(() => resolve(null), 5000); // Timeout más largo para imágenes grandes
          });
        } catch (err) {
          console.warn("Error al procesar fotografía:", err);
        }
      }

      // Información taxonómica (Orden, Familia, Género)
      const orden = formatValue(fichaEspecie.lineage?.find((item: any) => item.rank_id === 4)?.taxon);
      const familia = formatValue(fichaEspecie.lineage?.find((item: any) => item.rank_id === 5)?.taxon);
      const genero = formatValue(
        fichaEspecie.taxones?.[0]?.taxonPadre?.taxon || 
        fichaEspecie.lineage?.find((item: any) => item.rank_id === 6)?.taxon
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
        {title: "Descripción", content: fichaEspecie.descripcion},
        {title: "Diagnosis", content: fichaEspecie.diagnosis},
        {title: "Morfometría", content: fichaEspecie.morfometria},
        {title: "Color en Vida", content: fichaEspecie.color_en_vida},
        {title: "Color en Preservación", content: fichaEspecie.color_en_preservacion},
        {title: "Hábitat y Biología", content: fichaEspecie.habitat_biologia},
        {title: "Reproducción", content: fichaEspecie.reproduccion},
        {title: "Dieta", content: fichaEspecie.dieta},
        {title: "Canto", content: fichaEspecie.canto},
        {title: "Larva", content: fichaEspecie.larva},
        {title: "Distribución", content: fichaEspecie.distribucion},
        {title: "Rango Altitudinal (Texto)", content: fichaEspecie.rango_altitudinal},
        {title: "Observación Zona Altitudinal", content: fichaEspecie.observacion_zona_altitudinal},
        {title: "Referencia Área Protegida", content: fichaEspecie.referencia_area_protegida},
        {title: "Comentario Estatus Poblacional", content: fichaEspecie.comentario_estatus_poblacional},
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
      if (minAlt !== null && minAlt !== undefined || maxAlt !== null && maxAlt !== undefined) {
        addText("Rango Altitudinal", 10, true, 1.2);
        yPosition += 1;
        if (minAlt !== null && minAlt !== undefined && maxAlt !== null && maxAlt !== undefined) {
          addText(`${minAlt} - ${maxAlt} m`, 10, false, 1.2);
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
        addText("Distribución Global", 10, true, 1.2);
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
      const ecosistemas = fichaEspecie.taxon_catalogo_awe_results?.filter(
        (categoria: any) => categoria.catalogo_awe?.tipo_catalogo_awe?.nombre === "Ecosistemas"
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
      const reservasBiosfera = fichaEspecie.taxon_catalogo_awe_results?.filter(
        (categoria: any) => categoria.catalogo_awe?.tipo_catalogo_awe?.nombre === "Reservas de la Biósfera"
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
      const bosquesProtegidos = fichaEspecie.taxon_catalogo_awe_results?.filter(
        (categoria: any) => categoria.catalogo_awe?.tipo_catalogo_awe?.nombre === "Bosques Protegidos"
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
      const areasProtegidas = fichaEspecie.taxon_catalogo_awe_results?.filter(
        (categoria: any) =>
          categoria.catalogo_awe?.tipo_catalogo_awe?.nombre === "Áreas protegidas del Estado" ||
          categoria.catalogo_awe?.tipo_catalogo_awe?.nombre === "Áreas protegidas Privadas"
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
            (categoria: any) => categoria.catalogo_awe?.tipo_catalogo_awe?.nombre === "Áreas protegidas del Estado"
          );
          const areasPrivadas = areasUnicas.filter(
            (categoria: any) => categoria.catalogo_awe?.tipo_catalogo_awe?.nombre === "Áreas protegidas Privadas"
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
      if (temp !== null && temp !== undefined || tempMin !== null && tempMin !== undefined || tempMax !== null && tempMax !== undefined) {
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
      if (pluv !== null && pluv !== undefined || pluvMin !== null && pluvMin !== undefined || pluvMax !== null && pluvMax !== undefined) {
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
        addText("Lista Roja IUCN", 11, true, 1.2);
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

      // Agregar Literatura Citada
      if (publicaciones && publicaciones.length > 0) {
        yPosition += 5;
        addText("Literatura Citada", 12, true, 1.2);
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
            
            if (pub.publicacion.titulo && !pub.publicacion.cita_corta.includes(pub.publicacion.titulo)) {
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
      alert(`Error al generar el PDF: ${errorMessage}\n\nPor favor, verifica la consola para más detalles.`);
      
      // Remover mensaje de carga en caso de error
      const loadingMessage = document.getElementById("pdf-loading-message");
      if (loadingMessage) {
        document.body.removeChild(loadingMessage);
      }
    }
  };

  // Log solo en desarrollo
  if (process.env.NODE_ENV === "development") {
    console.log("✅ CardSpeciesContent recibió fichaEspecie:", {
      id_ficha_especie: fichaEspecie.id_ficha_especie,
      taxon_id: fichaEspecie.taxon_id,
      nombre_cientifico: fichaEspecie.taxones?.[0]?.taxon,
    });
  }

  return (
    <CardContent className="flex-1 overflow-y-auto p-0">
      <div className="flex">
        {/* Columna izquierda - Contenido principal */}
        <div className="flex-1">
          <div className="space-y-4 p-4">
            {/* Secciones de contenido */}
            {/* Fotografía de la especie */}
            {fichaEspecie.fotografia_ficha && (
              <Card className="h-[500px]">
                <CardHeader className="py-3">
                  <CardTitle className="text-base">Fotografía</CardTitle>
                </CardHeader>
                <CardContent className="h-[calc(100%-60px)] p-2">
                  <div
                    className="group flex h-full w-full items-center justify-center overflow-hidden"
                    style={{backgroundColor: "#ffffff"}}
                  >
                    <img
                      alt="Fotografía de la especie"
                      className="max-h-full max-w-full cursor-pointer object-contain grayscale transition-all duration-[800ms] ease-in-out hover:grayscale-0"
                      src={fichaEspecie.fotografia_ficha}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
            {/* Primer(os) colector(es) */}
            <Card className="">
              <CardHeader>
                <CardTitle className="text-base">Primer(os) colector(es)</CardTitle>
              </CardHeader>
              <CardContent>
                {fichaEspecie.descubridor ? (
                  <div
                    suppressHydrationWarning dangerouslySetInnerHTML={{
                      __html: procesarHTML(fichaEspecie.descubridor),
                    }}
                    className="text-muted-foreground text-sm italic"
                  />
                ) : (
                  <p className="text-muted-foreground text-sm italic">No disponible</p>
                )}
                {fichaEspecie.sinonimia && (
                  <div className="mt-4">
                    <div
                      suppressHydrationWarning dangerouslySetInnerHTML={{
                        __html: procesarHTML(fichaEspecie.sinonimia),
                      }}
                      className="text-muted-foreground text-xs"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Etimología */}
            <Card className="">
              <CardHeader>
                <CardTitle className="text-base">Etimología</CardTitle>
              </CardHeader>
              <CardContent>
                {fichaEspecie.etimologia ? (
                  <div
                    suppressHydrationWarning dangerouslySetInnerHTML={{
                      __html: procesarHTML(fichaEspecie.etimologia),
                    }}
                    className="text-muted-foreground text-sm"
                  />
                ) : (
                  <p className="text-muted-foreground text-sm">No disponible</p>
                )}
              </CardContent>
            </Card>
            {/* {Identificacion} */}
            <Card className="">
              <CardHeader>
                <CardTitle className="text-base">Identificación</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Identificación */}
                {fichaEspecie.identificacion && (
                  <div className="mt-4">
                    <div
                      suppressHydrationWarning dangerouslySetInnerHTML={{
                        __html: procesarHTML(fichaEspecie.identificacion),
                      }}
                      className="text-muted-foreground text-sm"
                    />
                  </div>
                )}

                {/* Longitud rostro-cloacal dentro de identificación */}
                {(fichaEspecie.svl_macho || fichaEspecie.svl_hembra) && (
                  <div className="mt-3 space-y-1.5">
                    {fichaEspecie.svl_macho && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs font-medium">
                          Longitud rostro-cloacal ♂:
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {fichaEspecie.svl_macho}
                        </span>
                      </div>
                    )}
                    {fichaEspecie.svl_hembra && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs font-medium">
                          Longitud rostro-cloacal ♀:
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {fichaEspecie.svl_hembra}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Morfometría */}
                {fichaEspecie.morfometria && (
                  <div className="mt-4">
                    <h4 className="mb-2 text-sm font-semibold">Morfometría</h4>
                    <div
                      suppressHydrationWarning dangerouslySetInnerHTML={{
                        __html: procesarHTML(fichaEspecie.morfometria),
                      }}
                      className="text-muted-foreground text-sm"
                    />
                  </div>
                )}

                {/* Diagnosis */}
                {fichaEspecie.diagnosis && (
                  <div className="mt-4">
                    <h4 className="mb-2 text-sm font-semibold">Diagnosis</h4>
                    <div
                      suppressHydrationWarning dangerouslySetInnerHTML={{
                        __html: procesarHTML(fichaEspecie.diagnosis),
                      }}
                      className="text-muted-foreground text-sm"
                    />
                  </div>
                )}

                {/* Descripción */}
                {fichaEspecie.descripcion && (
                  <div className="mt-4">
                    <h4 className="mb-2 text-sm font-semibold">Descripción</h4>
                    <div
                      suppressHydrationWarning dangerouslySetInnerHTML={{
                        __html: procesarHTML(fichaEspecie.descripcion),
                      }}
                      className="text-muted-foreground text-sm"
                    />
                  </div>
                )}

                {/* Color en vida */}
                {fichaEspecie.color_en_vida && (
                  <div className="mt-4">
                    <h4 className="mb-2 text-sm font-semibold">Color en vida</h4>
                    <div
                      suppressHydrationWarning dangerouslySetInnerHTML={{
                        __html: procesarHTML(fichaEspecie.color_en_vida),
                      }}
                      className="text-muted-foreground text-sm"
                    />
                  </div>
                )}

                {/* Color en preservación - OCULTO */}
                {/* {fichaEspecie.color_en_preservacion && (
                  <div className="mt-4">
                    <h4 className="mb-2 text-sm font-semibold">Color en preservación</h4>
                    <div
                      suppressHydrationWarning dangerouslySetInnerHTML={{
                        __html: procesarHTML(fichaEspecie.color_en_preservacion),
                      }}
                      className="text-muted-foreground text-sm"
                    />
                  </div>
                )} */}

                {/* Especies Similares */}
                {/* {fichaEspecie.sinonimia && (
                  <div className="mt-4">
                    <h4 className="mb-2 font-semibold">Especies similares</h4>
                    <div
                        suppressHydrationWarning dangerouslySetInnerHTML={{
                          __html: processHTMLLinks(
                            processCitationReferences(
                              fichaEspecie.sinonimia,
                              fichaEspecie.publicacionesOrdenadas || fichaEspecie.publicaciones,
                            ),
                          ),
                        }}
                      className="text-muted-foreground"
                    />
                  </div>
                )} */}
              </CardContent>
            </Card>
            {/* Comparaciones */}
            <Card className="">
              <CardHeader>
                <CardTitle className="text-base">Comparaciones</CardTitle>
              </CardHeader>
              <CardContent>
                {fichaEspecie.comparacion ? (
                  <div
                    suppressHydrationWarning dangerouslySetInnerHTML={{
                      __html: procesarHTML(fichaEspecie.comparacion),
                    }}
                    className="text-muted-foreground text-sm"
                  />
                ) : (
                  <p className="text-muted-foreground text-sm">No disponible</p>
                )}
              </CardContent>
            </Card>
            {/* Historia Natural */}
            <Card className="">
              <CardHeader>
                <CardTitle className="text-base">Historia Natural</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fichaEspecie.habitat_biologia ? (
                    <div
                      suppressHydrationWarning dangerouslySetInnerHTML={{
                        __html: procesarHTML(fichaEspecie.habitat_biologia),
                      }}
                      className="text-muted-foreground text-sm"
                    />
                  ) : (
                    <p className="text-muted-foreground text-sm">No disponible</p>
                  )}

                  {/* {fichaEspecie.informacion_adicional && (
                    <div
                      suppressHydrationWarning dangerouslySetInnerHTML={{
                        __html: procesarHTML(fichaEspecie.informacion_adicional),
                      }}
                      className="text-muted-foreground text-sm"
                    />
                  )} */}

                  {fichaEspecie.reproduccion && (
                    <div className="mt-4">
                      <h4 className="mb-2 text-sm font-semibold">Reproducción</h4>
                      <div
                        suppressHydrationWarning dangerouslySetInnerHTML={{
                          __html: procesarHTML(fichaEspecie.reproduccion),
                        }}
                        className="text-muted-foreground text-sm"
                      />
                    </div>
                  )}

                  {fichaEspecie.dieta && (
                    <div className="mt-4">
                      <h4 className="mb-2 text-sm font-semibold">Dieta</h4>
                      <div
                        suppressHydrationWarning dangerouslySetInnerHTML={{
                          __html: procesarHTML(fichaEspecie.dieta),
                        }}
                        className="text-muted-foreground text-sm"
                      />
                    </div>
                  )}

                  {fichaEspecie.canto && (
                    <div className="mt-4">
                      <h4 className="mb-2 text-sm font-semibold">Canto</h4>
                      <div
                        suppressHydrationWarning dangerouslySetInnerHTML={{
                          __html: procesarHTML(fichaEspecie.canto),
                        }}
                        className="text-muted-foreground text-sm"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            {/* Renacuajos */}
            <Card className="">
              <CardHeader>
                <CardTitle className="text-base">Renacuajos</CardTitle>
              </CardHeader>
              <CardContent>
                {fichaEspecie.larva ? (
                  <div
                    suppressHydrationWarning dangerouslySetInnerHTML={{
                      __html: procesarHTML(fichaEspecie.larva),
                    }}
                    className="text-muted-foreground text-sm"
                  />
                ) : (
                  <p className="text-muted-foreground text-sm">No disponible</p>
                )}
              </CardContent>
            </Card>
            {/* Contenido */} {/* Información básica */}
            <Card className="">
              <CardHeader>
                <CardTitle className="text-base">Distribución</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* 0. Distribución Altitudinal */}
                  <div className="-mx-6">
                    <h4 className="mb-2 px-6 text-sm font-semibold">Distribución Altitudinal</h4>
                    {fichaEspecie.altitudinalRange ? (
                      <div className="mb-4 w-full">
                        <ClimaticFloorChart altitudinalRange={fichaEspecie.altitudinalRange} />
                      </div>
                    ) : (
                      <p className="text-muted-foreground mb-4 px-6 text-sm">No disponible</p>
                    )}
                  </div>

                  {/* 1. Rango Altitudinal */}
                  <div>
                    <h4 className="mb-2 text-sm font-semibold">Rango Altitudinal</h4>
                    <p className="text-muted-foreground text-xs">
                      {fichaEspecie.rango_altitudinal_min != null &&
                      fichaEspecie.rango_altitudinal_max != null
                        ? `${fichaEspecie.rango_altitudinal_min} - ${fichaEspecie.rango_altitudinal_max} m`
                        : fichaEspecie.rango_altitudinal_min != null
                          ? `Mín: ${fichaEspecie.rango_altitudinal_min} m`
                          : fichaEspecie.rango_altitudinal_max != null
                            ? `Máx: ${fichaEspecie.rango_altitudinal_max} m`
                            : "No disponible"}
                    </p>
                  </div>

                  {/* 2. Distribución Global */}
                  <div>
                    <h4 className="mb-2 text-sm font-semibold">Distribución Global</h4>

                    {/* Geopolítica dentro de Distribución Global */}
                    <div>
                      <h5 className="mb-2 text-xs font-semibold">Geopolítica</h5>
                      {fichaEspecie.geoPolitica && fichaEspecie.geoPolitica.length > 0 ? (
                        <div className="space-y-4">
                          {Object.entries(groupGeoPoliticalData(fichaEspecie.geoPolitica)).map(
                            ([continente, continenteData]: [string, any]) => (
                              <div key={continente} className="space-y-2">
                                {Object.entries(continenteData.paises).map(
                                  ([pais, paisData]: [string, any]) => (
                                    <div key={`${continente}-${pais}`} className="text-xs">
                                      <div className="flex items-center gap-2">
                                        <span className="text-foreground font-semibold">
                                          {continente}
                                        </span>
                                        <span className="text-muted-foreground">›</span>
                                        <span className="text-foreground font-medium">{pais}</span>
                                        {paisData.provincias && paisData.provincias.length > 0 && (
                                          <>
                                            <span className="text-muted-foreground">›</span>
                                            <span className="text-muted-foreground">
                                              {paisData.provincias.map(
                                                (provincia: string, idx: number) => (
                                                  <span key={`${pais}-${provincia}-${idx}`}>
                                                    {idx > 0 && ", "}
                                                    {provincia}
                                                  </span>
                                                ),
                                              )}
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>
                            ),
                          )}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-xs">No disponible</p>
                      )}
                    </div>

                    {/* Distribución Global (sin título) */}
                    {fichaEspecie.distribucion_global ? (
                      <div className="mt-4">
                        <div
                          suppressHydrationWarning dangerouslySetInnerHTML={{
                            __html: procesarHTML(fichaEspecie.distribucion_global),
                          }}
                          className="text-muted-foreground text-sm"
                        />
                      </div>
                    ) : (
                      <p className="text-muted-foreground mt-4 text-sm">No disponible</p>
                    )}
                  </div>

                  {/* 4. Temperatura */}
                  <div>
                    <h4 className="mb-2 text-sm font-semibold">Temperatura</h4>
                    <p className="text-muted-foreground text-xs">
                      {fichaEspecie.temperatura_min != null && fichaEspecie.temperatura_max != null
                        ? `${fichaEspecie.temperatura_min} - ${fichaEspecie.temperatura_max} °C`
                        : fichaEspecie.temperatura_min != null
                          ? `Mín: ${fichaEspecie.temperatura_min} °C`
                          : fichaEspecie.temperatura_max != null
                            ? `Máx: ${fichaEspecie.temperatura_max} °C`
                            : "No disponible"}
                    </p>
                  </div>

                  {/* 5. Pluviocidad */}
                  <div>
                    <h4 className="mb-2 text-sm font-semibold">Pluviocidad</h4>
                    <p className="text-muted-foreground text-xs">
                      {fichaEspecie.pluviocidad_min != null && fichaEspecie.pluviocidad_max != null
                        ? `${fichaEspecie.pluviocidad_min} - ${fichaEspecie.pluviocidad_max} mm`
                        : fichaEspecie.pluviocidad_min != null
                          ? `Mín: ${fichaEspecie.pluviocidad_min} mm`
                          : fichaEspecie.pluviocidad_max != null
                            ? `Máx: ${fichaEspecie.pluviocidad_max} mm`
                            : "No disponible"}
                    </p>
                  </div>

                  {/* 6. Zonas Altitudinales */}
                  <div>
                    <h4 className="mb-2 text-sm font-semibold">Zonas Altitudinales</h4>
                    {fichaEspecie.distributions && fichaEspecie.distributions.length > 0 ? (
                      <div className="space-y-2">
                        {(() => {
                          // Eliminar duplicados basándose en id_taxon_catalogo_awe
                          const uniqueDistributions = new Map();

                          fichaEspecie.distributions.forEach((categoria: any) => {
                            const key =
                              categoria.id_taxon_catalogo_awe || categoria.catalogo_awe_id;

                            if (!uniqueDistributions.has(key)) {
                              uniqueDistributions.set(key, categoria);
                            }
                          });

                          return Array.from(uniqueDistributions.values()).map(
                            (categoria: any, index: number) => (
                              <div
                                key={`zona-altitudinal-${categoria.id_taxon_catalogo_awe || categoria.catalogo_awe_id}-${index}`}
                              >
                                <span className="text-muted-foreground text-xs">
                                  {categoria.catalogo_awe?.nombre}
                                </span>
                              </div>
                            ),
                          );
                        })()}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No disponible</p>
                    )}
                  </div>

                  {/* 7. Ecosistemas */}
                  <div>
                    <h4 className="mb-2 text-sm font-semibold">Ecosistemas</h4>
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

                  {/* 8. Regiones Biogeográficas */}
                  <div>
                    <h4 className="mb-2 text-sm font-semibold">Regiones Biogeográficas</h4>
                    {fichaEspecie.dataRegionBio && fichaEspecie.dataRegionBio.length > 0 ? (
                      <div className="space-y-2">
                        {fichaEspecie.dataRegionBio.map((region: any) => (
                          <div key={region.id_taxon_catalogo_awe_region_biogeografica}>
                            <span className="text-muted-foreground text-xs">
                              {region.catalogo_awe?.nombre}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No disponible</p>
                    )}
                  </div>

                  {/* 9. Reservas de la Biosfera */}
                  <div>
                    <h4 className="mb-2 text-sm font-semibold">Reservas de la Biosfera</h4>
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

                  {/* 10. Bosques Protegidos */}
                  <div>
                    <h4 className="mb-2 text-sm font-semibold">Bosques Protegidos</h4>
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

                  {/* 11. Áreas Protegidas */}
                  <div>
                    <h4 className="mb-2 text-sm font-semibold">Áreas Protegidas</h4>
                    {(() => {
                      const areasProtegidas =
                        fichaEspecie.taxon_catalogo_awe_results?.filter(
                          (categoria: any) =>
                            categoria.catalogo_awe.tipo_catalogo_awe?.nombre ===
                              "Áreas protegidas Privadas" ||
                            categoria.catalogo_awe.tipo_catalogo_awe?.nombre ===
                              "Áreas protegidas del Estado",
                        ) || [];

                      // Eliminar duplicados basándose en catalogo_awe_id
                      const uniqueMap = new Map();

                      areasProtegidas.forEach((categoria: any) => {
                        const key = categoria.catalogo_awe_id;

                        if (!uniqueMap.has(key)) {
                          uniqueMap.set(key, categoria);
                        }
                      });
                      const areasProtegidasUnicas = Array.from(uniqueMap.values());

                      if (areasProtegidasUnicas.length > 0) {
                        const areasEstado = areasProtegidasUnicas.filter(
                          (categoria) =>
                            categoria.catalogo_awe.tipo_catalogo_awe?.nombre ===
                            "Áreas protegidas del Estado",
                        );
                        const areasPrivadas = areasProtegidasUnicas.filter(
                          (categoria) =>
                            categoria.catalogo_awe.tipo_catalogo_awe?.nombre ===
                            "Áreas protegidas Privadas",
                        );

                        return (
                          <div className="space-y-3">
                            {/* Áreas protegidas del Estado */}
                            {areasEstado.length > 0 ? (
                              <div className="ml-4">
                                <p className="text-foreground mb-2 text-xs font-semibold">
                                  Áreas protegidas del Estado
                                </p>
                                <div className="space-y-1">
                                  {areasEstado.map((categoria: any) => (
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
                              </div>
                            ) : null}

                            {/* Áreas protegidas Privadas */}
                            {areasPrivadas.length > 0 ? (
                              <div className="ml-4">
                                <p className="text-foreground mb-2 text-xs font-semibold">
                                  Áreas protegidas Privadas
                                </p>
                                <div className="space-y-1">
                                  {areasPrivadas.map((categoria: any) => (
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
                              </div>
                            ) : null}
                          </div>
                        );
                      }

                      return <p className="text-muted-foreground text-sm">No disponible</p>;
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Conservación */}
            <Card className="">
              <CardHeader>
                <CardTitle className="text-base">Conservación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* 1. Lista Roja UICN */}
                  <div>
                    <h4 className="mb-2 text-sm font-semibold">Lista Roja UICN</h4>
                    {fichaEspecie.listaRojaIUCN?.catalogo_awe?.sigla ? (
                      (() => {
                        const sigla = fichaEspecie.listaRojaIUCN.catalogo_awe.sigla;

                        // Verificar si es PE
                        if (isPE(sigla)) {
                          return (
                            <div
                              className="inline-flex items-center justify-center px-2 py-1 text-[10px] font-semibold"
                              style={{
                                backgroundColor: "#b71c1c",
                                color: "#ffffff",
                                borderRadius: "100% 0% 100% 100%",
                                minWidth: "32px",
                                minHeight: "32px",
                                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.15)",
                              }}
                            >
                              PE
                            </div>
                          );
                        }

                        // Normalizar el valor: trim y uppercase
                        const valorNormalizado = sigla.toUpperCase().trim();
                        const valoresValidos = ["LC", "NT", "VU", "EN", "CR", "EW", "EX", "DD"];

                        if (valoresValidos.includes(valorNormalizado)) {
                          return (
                            <RedListStatus
                              status={
                                valorNormalizado as
                                  | "LC"
                                  | "NT"
                                  | "VU"
                                  | "EN"
                                  | "CR"
                                  | "EW"
                                  | "EX"
                                  | "DD"
                              }
                            />
                          );
                        }

                        return (
                          <div className="inline-flex items-center justify-center px-2 py-1 text-[10px] font-semibold">
                            {sigla}
                          </div>
                        );
                      })()
                    ) : (
                      <p className="text-muted-foreground text-sm">No disponible</p>
                    )}
                  </div>

                  {/* 2. Endemismo */}
                  <div>
                    <h4 className="mb-2 text-sm font-semibold">Endemismo</h4>
                    <p className="text-muted-foreground text-sm">
                      {fichaEspecie.taxones?.[0]?.endemica ? "Endémica" : "No endémica"}
                    </p>
                  </div>

                  {/* 3. Comentario Estatus Poblacional */}
                  <div>
                    <h4 className="mb-2 text-sm font-semibold">Estatus Poblacional</h4>
                    {fichaEspecie.comentario_estatus_poblacional ? (
                      <div
                        suppressHydrationWarning dangerouslySetInnerHTML={{
                          __html: procesarHTML(fichaEspecie.comentario_estatus_poblacional),
                        }}
                        className="text-muted-foreground text-sm"
                      />
                    ) : (
                      <p className="text-muted-foreground text-sm">No disponible</p>
                    )}
                  </div>

                  {/* 4. CITES */}
                  <div>
                    <h4 className="mb-2 text-sm font-semibold">CITES</h4>
                    {(() => {
                      const cites =
                        fichaEspecie.taxon_catalogo_awe_results?.filter(
                          (categoria: any) =>
                            categoria.catalogo_awe.tipo_catalogo_awe?.nombre === "CITES",
                        ) || [];

                      // Eliminar duplicados
                      const uniqueMap = new Map();

                      cites.forEach((categoria: any) => {
                        const key = categoria.catalogo_awe_id;

                        if (!uniqueMap.has(key)) {
                          uniqueMap.set(key, categoria);
                        }
                      });
                      const citesUnicos = Array.from(uniqueMap.values());

                      return citesUnicos.length > 0 ? (
                        <div className="space-y-1">
                          {citesUnicos.map((categoria: any) => (
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

                  {/* Ecosistemas, Reservas de la Biósfera y Bosques Protegidos */}
                  {(() => {
                    const ecosistemasYAreas =
                      fichaEspecie.taxon_catalogo_awe_results?.filter(
                        (categoria: any) =>
                          categoria.catalogo_awe.tipo_catalogo_awe?.nombre === "Ecosistemas" ||
                          categoria.catalogo_awe.tipo_catalogo_awe?.nombre ===
                            "Reservas de la Biósfera" ||
                          categoria.catalogo_awe.tipo_catalogo_awe?.nombre === "Bosques Protegidos",
                      ) || [];

                    // Eliminar duplicados basándose en catalogo_awe_id
                    const uniqueMap = new Map();

                    ecosistemasYAreas.forEach((categoria: any) => {
                      const key = categoria.catalogo_awe_id;

                      if (!uniqueMap.has(key)) {
                        uniqueMap.set(key, categoria);
                      }
                    });
                    const ecosistemasYAreasUnicas = Array.from(uniqueMap.values());

                    return ecosistemasYAreasUnicas.length > 0 ? (
                      <div>
                        <h4 className="mb-2 text-sm font-semibold">
                          Ecosistemas y Áreas de Conservación
                        </h4>
                        <div className="space-y-3">
                          {/* Ecosistemas */}
                          {(() => {
                            const ecosistemas = ecosistemasYAreasUnicas.filter(
                              (categoria) =>
                                categoria.catalogo_awe.tipo_catalogo_awe?.nombre === "Ecosistemas",
                            );

                            return ecosistemas.length > 0 ? (
                              <div className="mb-4 ml-4">
                                <p className="text-foreground mb-2 text-xs font-semibold">
                                  Ecosistemas
                                </p>
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
                              </div>
                            ) : null;
                          })()}

                          {/* Reservas de la Biósfera */}
                          {(() => {
                            const reservasBiosfera = ecosistemasYAreasUnicas.filter(
                              (categoria) =>
                                categoria.catalogo_awe.tipo_catalogo_awe?.nombre ===
                                "Reservas de la Biósfera",
                            );

                            return reservasBiosfera.length > 0 ? (
                              <div className="mb-4 ml-4">
                                <p className="text-foreground mb-2 text-xs font-semibold">
                                  Reservas de la Biósfera
                                </p>
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
                              </div>
                            ) : null;
                          })()}

                          {/* Bosques Protegidos */}
                          {(() => {
                            const bosquesProtegidos = ecosistemasYAreasUnicas.filter(
                              (categoria) =>
                                categoria.catalogo_awe.tipo_catalogo_awe?.nombre ===
                                "Bosques Protegidos",
                            );

                            return bosquesProtegidos.length > 0 ? (
                              <div className="ml-4">
                                <p className="text-foreground mb-2 text-xs font-semibold">
                                  Bosques Protegidos
                                </p>
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
                              </div>
                            ) : null;
                          })()}
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              </CardContent>
            </Card>
            {/* Taxonomía */}
            <Card className="">
              <CardHeader>
                <CardTitle className="text-base">Taxonomía y Relaciones filogenéticas</CardTitle>
              </CardHeader>
              <CardContent>
                {fichaEspecie.taxonomia ? (
                  <div
                    suppressHydrationWarning dangerouslySetInnerHTML={{
                      __html: procesarHTML(fichaEspecie.taxonomia),
                    }}
                    className="text-muted-foreground text-sm"
                  />
                ) : (
                  <p className="text-muted-foreground text-sm">No disponible</p>
                )}
              </CardContent>
            </Card>
            {/* Observaciones */}
            <Card className="">
              <CardHeader>
                <CardTitle className="text-base">Observaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Usos */}
                  <div>
                    <h4 className="mb-2 text-sm font-semibold">Usos</h4>
                    {fichaEspecie.usos ? (
                      <div
                        suppressHydrationWarning dangerouslySetInnerHTML={{
                          __html: procesarHTML(fichaEspecie.usos),
                        }}
                        className="text-muted-foreground text-sm"
                      />
                    ) : (
                      <p className="text-muted-foreground text-sm">No disponible</p>
                    )}
                  </div>

                  {/* Información Adicional */}
                  <div>
                    <h4 className="mb-2 text-sm font-semibold">Información Adicional</h4>
                    {fichaEspecie.informacion_adicional ? (
                      <div
                        suppressHydrationWarning dangerouslySetInnerHTML={{
                          __html: procesarHTML(fichaEspecie.informacion_adicional),
                        }}
                        className="text-muted-foreground text-sm"
                      />
                    ) : (
                      <p className="text-muted-foreground text-sm">No disponible</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* { Publicaciones } */}
            <Card className="">
              <CardHeader>
                <CardTitle className="text-base">Literatura Citada</CardTitle>
              </CardHeader>
              <CardContent>
                {fichaEspecie.publicaciones && fichaEspecie.publicaciones.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-1">
                    {fichaEspecie.publicaciones.map((pub: any) => {
                      // Construir cita_larga desde cita_corta y otros campos de la tabla publicacion
                      let citaLarga = pub.publicacion?.cita_larga || null;

                      // Si no hay cita_larga, construirla desde cita_corta y otros campos
                      if (!citaLarga && pub.publicacion?.cita_corta) {
                        const partes: string[] = [];

                        // Empezar con cita_corta
                        partes.push(pub.publicacion.cita_corta);

                        // Agregar información adicional si está disponible y no está ya en cita_corta
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
                          // Solo agregar año si no está ya en cita_corta
                          const añoStr = String(pub.publicacion.numero_publicacion_ano);

                          if (!pub.publicacion.cita_corta.includes(añoStr)) {
                            partes.push(`(${añoStr})`);
                          }
                        }

                        citaLarga = partes.join(", ");
                      }

                      // Si aún no hay cita_larga, usar cita o cita_corta
                      const citaParaMostrar =
                        citaLarga ||
                        pub.publicacion?.cita ||
                        pub.publicacion?.cita_corta ||
                        "Cita no disponible";

                      // Generar URL de la bibliografía
                      const año =
                        pub.publicacion?.numero_publicacion_ano ||
                        (pub.publicacion?.fecha
                          ? new Date(pub.publicacion.fecha).getFullYear()
                          : null);
                      const bibliographyUrl = getBibliographyUrl(
                        pub.publicacion?.cita_corta || null,
                        año,
                        pub.publicacion?.titulo || null,
                        pub.publicacion?.id_publicacion || 0,
                      );

                      return (
                        <Link
                          key={pub.id_taxon_publicacion}
                          className="literature-link hover:bg-muted flex flex-col gap-2 rounded-md p-3 transition-colors"
                          href={bibliographyUrl}
                        >
                          {pub.publicacion?.titulo && (
                            <div
                              suppressHydrationWarning dangerouslySetInnerHTML={{
                                __html: processHTMLLinksNoUnderline(pub.publicacion.titulo),
                              }}
                              className="hover:text-primary text-sm font-medium"
                            />
                          )}
                          <div
                            suppressHydrationWarning dangerouslySetInnerHTML={{
                              __html: processHTMLLinksNoUnderline(citaParaMostrar),
                            }}
                            className="text-muted-foreground text-xs"
                          />
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No hay publicaciones disponibles</p>
                )}
              </CardContent>
            </Card>
            <Card className="">
              <CardHeader>
                <CardTitle className="text-base">Historial de la ficha</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Historial */}
                  <div>
                    <h4 className="mb-2 text-sm font-semibold">Historial</h4>
                    {fichaEspecie.historial ? (
                      <div
                        suppressHydrationWarning dangerouslySetInnerHTML={{
                          __html: procesarHTML(fichaEspecie.historial.replace(/\r\n?|\n/g, "<br />")),
                        }}
                        className="text-muted-foreground text-sm"
                      />
                    ) : (
                      <p className="text-muted-foreground text-sm">No disponible</p>
                    )}
                  </div>

                  {/* Agradecimiento */}
                  <div>
                    <h4 className="mb-2 text-sm font-semibold">Agradecimiento</h4>
                    {fichaEspecie.agradecimiento ? (
                      <div
                        suppressHydrationWarning dangerouslySetInnerHTML={{
                          __html: procesarHTML(fichaEspecie.agradecimiento),
                        }}
                        className="text-muted-foreground text-sm"
                      />
                    ) : (
                      <p className="text-muted-foreground text-sm">No disponible</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="">
              <CardHeader>
                <CardTitle className="text-base">Fecha Actualizacion</CardTitle>
              </CardHeader>
              <CardContent>
                {fichaEspecie.fecha_actualizacion ? (
                  <span className="text-muted-foreground text-sm">
                    {fichaEspecie.fecha_actualizacion}
                  </span>
                ) : (
                  <p className="text-muted-foreground text-sm">No disponible</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Columna derecha - Sidebar fijo */}
        <div className="sticky top-0 py-4 pr-8 pl-4" style={{width: "20%", maxHeight: "100vh"}}>
          {/* Botón de descarga */}
          <div className="mb-4">
            <Button
              className="flex w-full items-center justify-center gap-2"
              onClick={handleDownloadPDF}
              variant="outline"
            >
              <Download className="h-4 w-4" />
              Descargar ficha
            </Button>
          </div>
          <Card className="h-fit">
            <CardContent className="space-y-2 p-4">
              {/* Información General */}
              <section>
                <div className="grid grid-cols-1 gap-2">
                  {/* Lista Roja */}
                  {fichaEspecie.listaRojaIUCN?.catalogo_awe?.sigla && (
                    <div
                      className="flex aspect-square flex-col items-center justify-center rounded-md border p-2"
                      style={{
                        backgroundColor: "#f9f9f9",
                        borderColor: "#dddddd",
                      }}
                    >
                      <h4
                        className="mb-2"
                        style={{
                          color: "#666666",
                          fontSize: "11px",
                          fontFamily:
                            '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                          fontWeight: "600",
                        }}
                      >
                        Lista Roja IUCN
                      </h4>
                      {(() => {
                        const sigla = fichaEspecie.listaRojaIUCN.catalogo_awe.sigla;

                        // Verificar si es PE
                        if (isPE(sigla)) {
                          return (
                            <div
                              className="inline-flex items-center justify-center px-2 py-1 text-[10px] font-semibold"
                              style={{
                                backgroundColor: "#b71c1c",
                                color: "#ffffff",
                                borderRadius: "100% 0% 100% 100%",
                                minWidth: "32px",
                                minHeight: "32px",
                                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.15)",
                              }}
                            >
                              PE
                            </div>
                          );
                        }

                        // Normalizar el valor: trim y uppercase
                        const valorNormalizado = sigla?.trim().toUpperCase() || "";
                        // Lista de valores válidos
                        const valoresValidos: readonly string[] = [
                          "LC",
                          "NT",
                          "VU",
                          "EN",
                          "CR",
                          "EW",
                          "EX",
                          "DD",
                        ];

                        // Verificar si el valor está en la lista de válidos
                        if (valoresValidos.includes(valorNormalizado)) {
                          return (
                            <RedListStatus
                              status={
                                valorNormalizado as
                                  | "LC"
                                  | "NT"
                                  | "VU"
                                  | "EN"
                                  | "CR"
                                  | "EW"
                                  | "EX"
                                  | "DD"
                              }
                            />
                          );
                        }

                        // Si no es válido, mostrar warning y badge con "?"
                        console.warn(
                          `⚠️ Valor de lista roja no válido en card-species-content: "${sigla}" (normalizado: "${valorNormalizado}")`,
                        );

                        return (
                          <div
                            className="inline-flex items-center justify-center px-2 py-1 text-[10px] font-semibold"
                            style={{
                              backgroundColor: "#d1d1c6",
                              color: "#666666",
                              borderRadius: "100% 0% 100% 100%",
                              minWidth: "32px",
                              minHeight: "32px",
                              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.15)",
                            }}
                          >
                            ?
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Endemismo */}
                  <div
                    className="flex aspect-square flex-col items-center justify-center rounded-md border p-2"
                    style={{
                      backgroundColor: "#f9f9f9",
                      borderColor: "#dddddd",
                    }}
                  >
                    <h4
                      className="mb-2"
                      style={{
                        color: "#666666",
                        fontSize: "11px",
                        fontFamily:
                          '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                        fontWeight: "600",
                      }}
                    >
                      Endemismo
                    </h4>
                    <span className="text-center text-xs font-semibold" style={{color: "#000000"}}>
                      {fichaEspecie.taxones?.[0]?.endemica ? "Endémica" : " No endémica"}
                    </span>
                  </div>

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
                          className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-md border p-2 transition-colors hover:bg-gray-50"
                          style={{
                            backgroundColor: "#f9f9f9",
                            borderColor: "#dddddd",
                          }}
                        >
                          <h4
                            className="mb-2"
                            style={{
                              color: "#666666",
                              fontSize: "11px",
                              fontFamily:
                                '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                              fontWeight: "600",
                            }}
                          >
                            Colecciones
                          </h4>
                          <span
                            className="text-center text-xs font-semibold"
                            style={{color: "#000000"}}
                          >
                            {fichaEspecie.colecciones?.length || 0}
                          </span>
                        </div>
                      </Link>
                    );
                  })()}
                </div>
              </section>

              {/* Recursos */}
              <section>
                <div className="grid grid-cols-1 gap-2">
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
                        <Camera className="h-8 w-8" style={{color: "#333333"}} />
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
                        <Volume2 className="h-8 w-8" style={{color: "#333333"}} />
                        <span className="mt-1 text-xs font-medium text-gray-600">Fonoteca</span>
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
                        <Video className="h-8 w-8" style={{color: "#333333"}} />
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
                    <MapPin className="h-8 w-8" style={{color: "#333333"}} />
                    <span className="mt-1 text-xs font-medium text-gray-600">Mapoteca</span>
                  </Link>
                </div>
              </section>

              {/* Fuentes Externas */}
              <section>
                <div className="grid grid-cols-1 gap-2">
                  {fichaEspecie.wikipedia && (
                    <Button
                      asChild
                      className="group hover:bg-muted/50 h-auto rounded-md border p-2"
                      style={{backgroundColor: "#f9f9f9"}}
                      variant="outline"
                    >
                      <a href={fichaEspecie.wikipedia} rel="noopener noreferrer" target="_blank">
                        <img
                          alt="ASW Logo"
                          className="mx-auto grayscale transition-all duration-[800ms] ease-in-out group-hover:grayscale-0"
                          src="/assets/references/wikipedia.png"
                          style={{width: "100%", height: "auto"}}
                        />
                      </a>
                    </Button>
                  )}

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

                  {fichaEspecie.asw && (
                    <Button
                      asChild
                      className="group hover:bg-muted/50 h-auto rounded-md border p-2"
                      style={{backgroundColor: "#f9f9f9"}}
                      variant="outline"
                    >
                      <a href={fichaEspecie.asw} rel="noopener noreferrer" target="_blank">
                        <img
                          alt="amnh Logo"
                          className="mx-auto grayscale transition-all duration-[800ms] ease-in-out group-hover:grayscale-0"
                          src="/assets/references/amnh.png"
                          style={{width: "100%", height: "auto"}}
                        />
                      </a>
                    </Button>
                  )}

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

                  {fichaEspecie.morphosource && (
                    <Button
                      asChild
                      className="group hover:bg-muted/50 h-auto rounded-md border p-2"
                      style={{backgroundColor: "#f9f9f9"}}
                      variant="outline"
                    >
                      <a href={fichaEspecie.morphosource} rel="noopener noreferrer" target="_blank">
                        <img
                          alt="MorphoSource Logo"
                          className="mx-auto grayscale transition-all duration-[800ms] ease-in-out group-hover:grayscale-0"
                          src="/assets/references/morphosource.png"
                          style={{width: "100%", height: "auto"}}
                        />
                      </a>
                    </Button>
                  )}
                </div>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </CardContent>
  );
};
