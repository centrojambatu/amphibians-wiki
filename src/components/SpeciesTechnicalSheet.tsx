"use client";

import Link from "next/link";
import {Camera, Volume2, MapPin} from "lucide-react";

import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {Separator} from "@/components/ui/separator";
import {processHTMLLinks} from "@/lib/process-html-links";

import ClimaticFloorChart from "./ClimaticFloorChart";

interface SpeciesTechnicalSheetProps {
  scientificName: string;
  collectors: string;
  commonName: string;
  order: string;
  orderId: string;
  family: string;
  familyId: string;
  genus: string;
  genusId: string;
  etymology?: string;
  identification?: string;
  comparisons?: string;
  naturalHistory?: string;
  content?: string;
  distribution?: string;
  conservation?: string;
  references?: string;
  isEndemic?: boolean;
  redListStatus?: string;
  altitudinalRange?: {
    min: number;
    max: number;
  };
  climaticFloors?: string[];
  morphosource?: string;
}

export default function SpeciesTechnicalSheet({
  scientificName,
  collectors,
  commonName,
  order,
  orderId,
  family,
  familyId,
  genus,
  genusId,
  etymology,
  identification,
  comparisons,
  naturalHistory,
  content,
  distribution,
  conservation,
  references,
  isEndemic,
  redListStatus,
  altitudinalRange,
  climaticFloors,
  morphosource,
}: SpeciesTechnicalSheetProps) {
  return (
    <Card
      className="flex flex-col gap-0 overflow-hidden rounded-none border-0 bg-white p-0"
      style={{
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        borderRadius: 0,
        border: "none",
      }}
    >
      {/* Encabezado */}
      <CardHeader
        className="sticky top-0 z-30 text-center text-gray-900"
        style={{padding: "0", backgroundColor: "#ffffff"}}
      >
        <div className="space-y-4" style={{padding: "40px 30px 30px"}}>
          {/* Título principal - Jerarquía taxonómica completa */}
          <div className="flex flex-wrap items-baseline justify-center gap-2">
            {/* Orden - PEQUEÑO con link */}
            <Link
              className="text-sm font-medium transition-all hover:underline"
              href={`/order/${orderId}`}
              style={{
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                color: "#666666",
              }}
            >
              {order}
            </Link>
            <span className="text-sm" style={{color: "#cccccc", fontWeight: "300"}}>
              |
            </span>

            {/* Familia - PEQUEÑO con link */}
            <Link
              className="text-sm font-medium transition-all hover:underline"
              href={`/family/${familyId}`}
              style={{
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                color: "#666666",
              }}
            >
              {family}
            </Link>
            <span className="text-sm" style={{color: "#cccccc", fontWeight: "300"}}>
              |
            </span>

            {/* Género - PEQUEÑO e itálica con link */}
            <Link
              className="text-sm font-medium italic transition-all hover:underline"
              href={`/genus/${genusId}`}
              style={{
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                color: "#666666",
              }}
            >
              {genus}
            </Link>
            <span className="text-sm" style={{color: "#cccccc", fontWeight: "300"}}>
              |
            </span>

            {/* Especie - GRANDE, destacado, en cursiva (no clicable) */}
            <h1
              className="text-4xl font-bold italic"
              style={{
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                color: "#1a1a1a",
                letterSpacing: "-0.02em",
              }}
            >
              {scientificName}
            </h1>

            {/* Descriptor y año - MEDIANO */}
            <span
              className="text-lg font-normal"
              style={{
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                color: "#888888",
              }}
            >
              ({collectors})
            </span>
          </div>

          {/* Nombre común */}
          <p
            className="text-xl font-semibold"
            style={{
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
              color: "#555555",
              marginTop: "12px",
            }}
          >
            {commonName}
          </p>
        </div>

        {/* Línea divisoria horizontal - extremo a extremo */}
        <Separator className="bg-gray-200" style={{margin: "0"}} />
      </CardHeader>

      {/* Cuerpo - Layout con sidebar fijo y contenido con scroll */}
      <CardContent className="flex-1 overflow-y-auto p-0">
        <div className="flex">
          {/* Columna izquierda - Contenido principal */}
          <div className="flex-1">
            <div className="space-y-10 p-8">
              {/* Secciones de contenido */}
              {etymology && (
                <section>
                  <h3
                    className="mb-4"
                    style={{
                      color: "#333333",
                      fontSize: "16px",
                      padding: "8px 0px",
                      fontFamily:
                        '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      fontWeight: "bold",
                    }}
                  >
                    Etimología
                  </h3>
                  <div
                    className="text-justify"
                    style={{
                      fontFamily:
                        '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      color: "#444444",
                      fontSize: "16px",
                      lineHeight: "1.6",
                    }}
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: processHTMLLinks(etymology),
                      }}
                    />
                  </div>
                </section>
              )}

              {identification && (
                <section>
                  <h3
                    className="mb-4"
                    style={{
                      color: "#333333",
                      fontSize: "16px",
                      padding: "8px 0px",
                      fontFamily:
                        '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      fontWeight: "bold",
                    }}
                  >
                    Identificación
                  </h3>
                  <div
                    className="text-justify"
                    style={{
                      fontFamily:
                        '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      color: "#444444",
                      fontSize: "16px",
                      lineHeight: "1.6",
                    }}
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: processHTMLLinks(identification),
                      }}
                    />
                  </div>
                </section>
              )}

              {comparisons && (
                <section>
                  <h3
                    className="mb-4"
                    style={{
                      color: "#333333",
                      fontSize: "16px",
                      padding: "8px 0px",
                      fontFamily:
                        '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      fontWeight: "bold",
                    }}
                  >
                    Comparaciones
                  </h3>
                  <div
                    className="text-justify"
                    style={{
                      fontFamily:
                        '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      color: "#444444",
                      fontSize: "16px",
                      lineHeight: "1.6",
                    }}
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: processHTMLLinks(comparisons),
                      }}
                    />
                  </div>
                </section>
              )}

              {naturalHistory && (
                <section>
                  <h3
                    className="mb-4"
                    style={{
                      color: "#333333",
                      fontSize: "16px",
                      padding: "8px 0px",
                      fontFamily:
                        '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      fontWeight: "bold",
                    }}
                  >
                    Historia natural
                  </h3>
                  <div
                    className="text-justify"
                    style={{
                      fontFamily:
                        '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      color: "#444444",
                      fontSize: "16px",
                      lineHeight: "1.6",
                    }}
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: processHTMLLinks(naturalHistory),
                      }}
                    />
                  </div>
                </section>
              )}

              {content && (
                <section>
                  <h3
                    className="mb-4"
                    style={{
                      color: "#333333",
                      fontSize: "16px",
                      padding: "8px 0px",
                      fontFamily:
                        '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      fontWeight: "bold",
                    }}
                  >
                    Contenido
                  </h3>
                  <div
                    className="text-justify"
                    style={{
                      fontFamily:
                        '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      color: "#444444",
                      fontSize: "16px",
                      lineHeight: "1.6",
                    }}
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: processHTMLLinks(content),
                      }}
                    />
                  </div>
                </section>
              )}

              {distribution && (
                <section>
                  <h3
                    className="mb-4"
                    style={{
                      color: "#333333",
                      fontSize: "16px",
                      padding: "8px 0px",
                      fontFamily:
                        '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      fontWeight: "bold",
                    }}
                  >
                    Distribución
                  </h3>
                  <div
                    className="text-justify"
                    style={{
                      fontFamily:
                        '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      color: "#444444",
                      fontSize: "16px",
                      lineHeight: "1.6",
                    }}
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: processHTMLLinks(distribution),
                      }}
                    />
                  </div>
                </section>
              )}

              {conservation && (
                <section>
                  <h3
                    className="mb-4"
                    style={{
                      color: "#333333",
                      fontSize: "16px",
                      padding: "8px 0px",
                      fontFamily:
                        '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      fontWeight: "bold",
                    }}
                  >
                    Conservación
                  </h3>
                  <div
                    className="text-justify"
                    style={{
                      fontFamily:
                        '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      color: "#444444",
                      fontSize: "16px",
                      lineHeight: "1.6",
                    }}
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: processHTMLLinks(conservation),
                      }}
                    />
                  </div>
                </section>
              )}

              {references && (
                <section>
                  <h3
                    className="mb-4"
                    style={{
                      color: "#333333",
                      fontSize: "16px",
                      padding: "8px 0px",
                      fontFamily:
                        '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      fontWeight: "bold",
                    }}
                  >
                    Referencias
                  </h3>
                  <div
                    className="text-justify"
                    style={{
                      fontFamily:
                        '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      color: "#444444",
                      fontSize: "16px",
                      lineHeight: "1.6",
                    }}
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: processHTMLLinks(references),
                      }}
                    />
                  </div>
                </section>
              )}
            </div>
          </div>

          {/* Columna derecha - Sidebar fijo */}
          <div className="sticky top-0 h-screen w-96 overflow-y-auto border-l">
            <div className="space-y-8" style={{padding: "25px 30px"}}>
              {/* Distribución Altitudinal */}
              {altitudinalRange && climaticFloors && (
                <section>
                  <h3
                    className="mb-4"
                    style={{
                      color: "#333333",
                      fontSize: "16px",
                      padding: "8px 0px",
                      fontFamily:
                        '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      fontWeight: "bold",
                    }}
                  >
                    Distribución altitudinal
                  </h3>
                  <div
                    className="rounded-none border p-4"
                    style={{
                      backgroundColor: "#f9f9f9",
                      borderColor: "#dddddd",
                    }}
                  >
                    <ClimaticFloorChart altitudinalRange={altitudinalRange} />
                  </div>
                </section>
              )}

              {/* Información General */}
              <section>
                <h3
                  className="mb-4"
                  style={{
                    color: "#333333",
                    fontSize: "16px",
                    padding: "8px 0px",
                    fontFamily:
                      '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                    fontWeight: "bold",
                  }}
                >
                  Información General
                </h3>

                <div className="grid grid-cols-1 gap-2">
                  {/* Endemismo */}
                  <div
                    className="flex aspect-square flex-col items-center justify-center rounded-none border p-2"
                    style={{
                      backgroundColor: "#f9f9f9",
                      borderColor: "#dddddd",
                    }}
                  >
                    <h4
                      className="mb-2"
                      style={{
                        color: "#666666",
                        fontSize: "12px",
                        fontFamily:
                          '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                        fontWeight: "600",
                      }}
                    >
                      Endemismo
                    </h4>
                    <span
                      className="text-center text-sm font-semibold"
                      style={{color: isEndemic ? "#16a34a" : "#6b7280"}}
                    >
                      {isEndemic ? "Endémica" : "No endémica"}
                    </span>
                  </div>

                  {/* Lista Roja */}
                  {redListStatus && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-none border p-2"
                            style={{
                              backgroundColor: "#f9f9f9",
                              borderColor: "#dddddd",
                            }}
                          >
                            <h4
                              className="mb-2"
                              style={{
                                color: "#666666",
                                fontSize: "12px",
                                fontFamily:
                                  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                                fontWeight: "600",
                              }}
                            >
                              Lista Roja IUCN
                            </h4>
                            <span
                              className="rounded-none px-2 py-1 font-mono text-base"
                              style={{
                                backgroundColor:
                                  redListStatus === "LC"
                                    ? "#f8f9fa"
                                    : redListStatus === "NT"
                                      ? "#f1f3f4"
                                      : redListStatus === "VU"
                                        ? "#e8eaed"
                                        : redListStatus === "EN"
                                          ? "#dadce0"
                                          : redListStatus === "CR"
                                            ? "#bdc1c6"
                                            : "#f8f9fa",
                                color:
                                  redListStatus === "LC"
                                    ? "#5f6368"
                                    : redListStatus === "NT"
                                      ? "#5f6368"
                                      : redListStatus === "VU"
                                        ? "#5f6368"
                                        : redListStatus === "EN"
                                          ? "#3c4043"
                                          : redListStatus === "CR"
                                            ? "#202124"
                                            : "#5f6368",
                                border: "1px solid",
                                borderColor:
                                  redListStatus === "LC"
                                    ? "#e8eaed"
                                    : redListStatus === "NT"
                                      ? "#dadce0"
                                      : redListStatus === "VU"
                                        ? "#bdc1c6"
                                        : redListStatus === "EN"
                                          ? "#9aa0a6"
                                          : redListStatus === "CR"
                                            ? "#5f6368"
                                            : "#e8eaed",
                              }}
                            >
                              {redListStatus}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {redListStatus === "LC"
                              ? "Preocupación Menor"
                              : redListStatus === "NT"
                                ? "Casi Amenazada"
                                : redListStatus === "VU"
                                  ? "Vulnerable"
                                  : redListStatus === "EN"
                                    ? "En Peligro"
                                    : redListStatus === "CR"
                                      ? "Críticamente Amenazada"
                                      : redListStatus === "EW"
                                        ? "Extinta en Estado Silvestre"
                                        : redListStatus === "EX"
                                          ? "Extinta"
                                          : redListStatus === "DD"
                                            ? "Datos Deficientes"
                                            : redListStatus}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </section>

              {/* Recursos */}
              <section>
                <h3
                  className="mb-4"
                  style={{
                    color: "#333333",
                    fontSize: "16px",
                    padding: "8px 0px",
                    fontFamily:
                      '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                    fontWeight: "bold",
                  }}
                >
                  Recursos
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  <div
                    className="flex aspect-square cursor-pointer items-center justify-center rounded-none border p-2 transition-colors hover:bg-gray-50"
                    style={{
                      backgroundColor: "#f9f9f9",
                      borderColor: "#dddddd",
                    }}
                  >
                    <Camera className="h-8 w-8" style={{color: "#333333"}} />
                  </div>

                  <div
                    className="flex aspect-square cursor-pointer items-center justify-center rounded-none border p-2 transition-colors hover:bg-gray-50"
                    style={{
                      backgroundColor: "#f9f9f9",
                      borderColor: "#dddddd",
                    }}
                  >
                    <Volume2 className="h-8 w-8" style={{color: "#333333"}} />
                  </div>

                  <div
                    className="flex aspect-square cursor-pointer items-center justify-center rounded-none border p-2 transition-colors hover:bg-gray-50"
                    style={{
                      backgroundColor: "#f9f9f9",
                      borderColor: "#dddddd",
                    }}
                  >
                    <MapPin className="h-8 w-8" style={{color: "#333333"}} />
                  </div>
                </div>
              </section>

              {/* Fuentes Externas */}
              <section>
                <h3
                  className="mb-4"
                  style={{
                    color: "#333333",
                    fontSize: "16px",
                    padding: "8px 0px",
                    fontFamily:
                      '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                    fontWeight: "bold",
                  }}
                >
                  Fuentes externas
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          asChild
                          className="group h-auto rounded-none border p-2 hover:bg-gray-50"
                          style={{backgroundColor: "#f9f9f9"}}
                          variant="outline"
                        >
                          <a href="#">
                            <img
                              alt="ASW Logo"
                              className="mx-auto grayscale transition-all duration-300 group-hover:scale-110 group-hover:grayscale-0"
                              src="/assets/references/wikipedia.png"
                              style={{width: "100%", height: "auto"}}
                            />
                          </a>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>ASW - Amphibian Species of the World</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          asChild
                          className="group h-auto rounded-none border p-2 hover:bg-gray-50"
                          style={{backgroundColor: "#f9f9f9"}}
                          variant="outline"
                        >
                          <a href="#">
                            <img
                              alt="AmphibiaWeb Logo"
                              className="mx-auto grayscale transition-all duration-300 group-hover:scale-110 group-hover:grayscale-0"
                              src="/assets/references/amphibiaweb.png"
                              style={{width: "100%", height: "auto"}}
                            />
                          </a>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>AmphibiaWeb</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {morphosource && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            asChild
                            className="group h-auto rounded-none border p-2 hover:bg-gray-50"
                            style={{backgroundColor: "#f9f9f9"}}
                            variant="outline"
                          >
                            <a href={morphosource} rel="noopener noreferrer" target="_blank">
                              <img
                                alt="MorphoSource Logo"
                                className="mx-auto grayscale transition-all duration-300 group-hover:scale-110 group-hover:grayscale-0"
                                src="/assets/references/morphosource.png"
                                style={{width: "100%", height: "auto"}}
                              />
                            </a>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>MorphoSource</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          asChild
                          className="group h-auto rounded-none border p-2 hover:bg-gray-50"
                          style={{backgroundColor: "#f9f9f9"}}
                          variant="outline"
                        >
                          <a href="#">
                            <img
                              alt="NCBI Logo"
                              className="mx-auto grayscale transition-all duration-300 group-hover:scale-110 group-hover:grayscale-0"
                              src="/assets/references/ncbi.png"
                              style={{width: "100%", height: "auto"}}
                            />
                          </a>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>NCBI - National Center for Biotechnology Information</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          asChild
                          className="group h-auto rounded-none border p-2 hover:bg-gray-50"
                          style={{backgroundColor: "#f9f9f9"}}
                          variant="outline"
                        >
                          <a href="#">
                            <img
                              alt="VertNet Logo"
                              className="mx-auto grayscale transition-all duration-300 group-hover:scale-110 group-hover:grayscale-0"
                              src="/assets/references/vertnet.png"
                              style={{width: "100%", height: "auto"}}
                            />
                          </a>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>VertNet</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          asChild
                          className="group h-auto rounded-none border p-2 hover:bg-gray-50"
                          style={{backgroundColor: "#f9f9f9"}}
                          variant="outline"
                        >
                          <a href="#">
                            <img
                              alt="iNaturalist Logo"
                              className="mx-auto grayscale transition-all duration-300 group-hover:scale-110 group-hover:grayscale-0"
                              src="/assets/references/iNaturalist.png"
                              style={{width: "100%", height: "auto"}}
                            />
                          </a>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>iNaturalist</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          asChild
                          className="group h-auto rounded-none border p-2 hover:bg-gray-50"
                          style={{backgroundColor: "#f9f9f9"}}
                          variant="outline"
                        >
                          <a href="#">
                            <img
                              alt="IUCN Logo"
                              className="mx-auto grayscale transition-all duration-300 group-hover:scale-110 group-hover:grayscale-0"
                              src="/assets/references/redlist.png"
                              style={{width: "100%", height: "auto"}}
                            />
                          </a>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>IUCN Red List</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </section>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
