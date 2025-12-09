"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Camera, MapPin, Volume2 } from "lucide-react";

import {
  processHTMLLinks,
  processCitationReferences,
} from "@/lib/process-html-links";
import { getBibliographyUrl } from "@/lib/get-bibliography-url";

import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import ClimaticFloorChart from "./ClimaticFloorChart";
import RedListStatus from "./RedListStatus";

// Función para agrupar datos geopolíticos jerárquicamente
const groupGeoPoliticalData = (geoPolitica: any[]) => {
  if (!geoPolitica || geoPolitica.length === 0) return {};

  // Ordenar por rank_geopolitica_id (de menor a mayor, asumiendo que 1=Continente, 2=País, 3=Provincia)
  const sortedData = [...geoPolitica].sort(
    (a, b) => a.rank_geopolitica_id - b.rank_geopolitica_id,
  );

  const grouped: any = {};
  let currentContinente: string | null = null;
  let currentPais: string | null = null;

  sortedData.forEach((item: any) => {
    const { rank_nombre, nombre } = item;
    const normalizedRankNombre = rank_nombre?.toLowerCase();

    if (normalizedRankNombre === "continente") {
      currentContinente = nombre;
      if (!grouped[nombre]) {
        grouped[nombre] = { paises: {} };
      }
    } else if (
      normalizedRankNombre === "país" ||
      normalizedRankNombre === "pais"
    ) {
      if (!currentContinente) {
        currentContinente = "Sin continente";
        grouped[currentContinente] = { paises: {} };
      }
      currentPais = nombre;
      if (!grouped[currentContinente].paises[nombre]) {
        grouped[currentContinente].paises[nombre] = { provincias: [] };
      }
    } else if (normalizedRankNombre === "provincia") {
      if (!currentContinente) {
        currentContinente = "Sin continente";
        grouped[currentContinente] = { paises: {} };
      }
      if (!currentPais) {
        currentPais = "Sin país";
        grouped[currentContinente].paises[currentPais] = { provincias: [] };
      }
      if (
        !grouped[currentContinente].paises[currentPais].provincias.includes(
          nombre,
        )
      ) {
        grouped[currentContinente].paises[currentPais].provincias.push(nombre);
      }
    }
  });

  return grouped;
};

interface CardSpeciesContentProps {
  fichaEspecie: any;
}

export const CardSpeciesContent = ({
  fichaEspecie,
}: CardSpeciesContentProps) => {
  // Validar que fichaEspecie existe
  if (!fichaEspecie) {
    console.error("❌ CardSpeciesContent: fichaEspecie es null o undefined");

    return (
      <CardContent className="flex-1 overflow-y-auto p-0">
        <div className="p-4">
          <p className="text-muted-foreground text-sm">
            No se encontraron datos de la especie.
          </p>
        </div>
      </CardContent>
    );
  }

  // Memoizar las publicaciones para evitar recálculos
  const publicaciones = useMemo(
    () =>
      fichaEspecie.publicacionesOrdenadas || fichaEspecie.publicaciones || [],
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
                    style={{ backgroundColor: "#ffffff" }}
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
                <CardTitle className="text-base">
                  Primer(os) colector(es)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {fichaEspecie.colector ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: procesarHTML(fichaEspecie.colector),
                    }}
                    className="text-muted-foreground text-sm italic"
                  />
                ) : (
                  <p className="text-muted-foreground text-sm italic">
                    {fichaEspecie.colector}
                  </p>
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
                    dangerouslySetInnerHTML={{
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
                {/* Taxonomía */}
                {fichaEspecie.taxonomia && (
                  <div className="mt-4">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: procesarHTML(fichaEspecie.taxonomia),
                      }}
                      className="text-muted-foreground text-sm"
                    />
                  </div>
                )}

                {/* Longitud rostro-cloacal */}
                <div className="mt-4 space-y-2">
                  {fichaEspecie.svl_macho && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        Longitud rostro-cloacal ♂:
                      </span>
                      <span className="text-muted-foreground text-sm">
                        {fichaEspecie.svl_macho}
                      </span>
                    </div>
                  )}
                  {fichaEspecie.svl_hembra && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        Longitud rostro-cloacal ♀:
                      </span>
                      <span className="text-muted-foreground text-sm">
                        {fichaEspecie.svl_hembra}
                      </span>
                    </div>
                  )}
                </div>

                {fichaEspecie.identificacion ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: procesarHTML(fichaEspecie.identificacion),
                    }}
                    className="text-muted-foreground mt-4 text-sm"
                  />
                ) : (
                  <p className="text-muted-foreground mt-4 text-sm">
                    No disponible
                  </p>
                )}

                {/* Especies Similares */}
                {/* {fichaEspecie.sinonimia && (
                  <div className="mt-4">
                    <h4 className="mb-2 font-semibold">Especies similares</h4>
                    <div
                        dangerouslySetInnerHTML={{
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
            {/* Historia Natural */}
            <Card className="">
              <CardHeader>
                <CardTitle className="text-base">Historia Natural</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fichaEspecie.habitat_biologia ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: procesarHTML(fichaEspecie.habitat_biologia),
                      }}
                      className="text-muted-foreground text-sm"
                    />
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No disponible
                    </p>
                  )}

                  {fichaEspecie.informacion_adicional && (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: procesarHTML(
                          fichaEspecie.informacion_adicional,
                        ),
                      }}
                      className="text-muted-foreground text-sm"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
            {/* Contenido */} {/* Información básica */}
            <Card className="">
              <CardHeader>
                <CardTitle className="text-base">Distribución</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Distribución Global */}
                  {fichaEspecie.distribucion_global && (
                    <div>
                      <h4 className="mb-2 text-sm font-semibold">
                        Distribución Global
                      </h4>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: procesarHTML(
                            fichaEspecie.distribucion_global,
                          ),
                        }}
                        className="text-muted-foreground text-sm"
                      />
                    </div>
                  )}

                  {/* Distribución Geopolítica */}
                  {fichaEspecie.geoPolitica &&
                    fichaEspecie.geoPolitica.length > 0 && (
                      <div>
                        <h4 className="mb-2 text-sm font-semibold">
                          Distribución Geopolítica
                        </h4>
                        <div className="space-y-4">
                          {Object.entries(
                            groupGeoPoliticalData(fichaEspecie.geoPolitica),
                          ).map(
                            ([continente, continenteData]: [string, any]) => (
                              <div key={continente} className="space-y-2">
                                {Object.entries(continenteData.paises).map(
                                  ([pais, paisData]: [string, any]) => (
                                    <div
                                      key={`${continente}-${pais}`}
                                      className="text-xs"
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="text-foreground font-semibold">
                                          {continente}
                                        </span>
                                        <span className="text-muted-foreground">
                                          ›
                                        </span>
                                        <span className="text-foreground font-medium">
                                          {pais}
                                        </span>
                                        {paisData.provincias &&
                                          paisData.provincias.length > 0 && (
                                            <>
                                              <span className="text-muted-foreground">
                                                ›
                                              </span>
                                              <span className="text-muted-foreground">
                                                {paisData.provincias.map(
                                                  (
                                                    provincia: string,
                                                    idx: number,
                                                  ) => (
                                                    <span
                                                      key={`${pais}-${provincia}-${idx}`}
                                                    >
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
                      </div>
                    )}

                  {/* Zonas Altitudinales */}
                  {fichaEspecie.distributions &&
                    fichaEspecie.distributions.length > 0 && (
                      <div>
                        <h4 className="mb-2 text-sm font-semibold">
                          Zonas Altitudinales
                        </h4>
                        <div className="space-y-2">
                          {(() => {
                            // Eliminar duplicados basándose en id_taxon_catalogo_awe
                            const uniqueDistributions = new Map();

                            fichaEspecie.distributions.forEach(
                              (categoria: any) => {
                                const key =
                                  categoria.id_taxon_catalogo_awe ||
                                  categoria.catalogo_awe_id;

                                if (!uniqueDistributions.has(key)) {
                                  uniqueDistributions.set(key, categoria);
                                }
                              },
                            );

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
                      </div>
                    )}

                  {/* Rango Altitudinal */}
                  <div>
                    <h4 className="mb-2 text-sm font-semibold">
                      Rango Altitudinal
                    </h4>
                    <p className="text-muted-foreground text-xs">
                      {(() => {
                        const occidente =
                          fichaEspecie.altitudinalRange?.occidente;
                        const oriente = fichaEspecie.altitudinalRange?.oriente;

                        // Verificar si realmente hay valores (no solo el objeto vacío)
                        const hasOccidenteValues =
                          occidente?.min != null && occidente?.max != null;
                        const hasOrienteValues =
                          oriente?.min != null && oriente?.max != null;

                        // Si hay ambas vertientes con valores, mostrar con prefijos
                        if (hasOccidenteValues && hasOrienteValues) {
                          return (
                            <>
                              <span>
                                Occ:{" "}
                                {occidente.min && occidente.max
                                  ? `${occidente.min}-${occidente.max}`
                                  : "-"}{" "}
                                m
                              </span>
                              <span> | </span>
                              <span>
                                Or:{" "}
                                {oriente.min && oriente.max
                                  ? `${oriente.min}-${oriente.max}`
                                  : "-"}{" "}
                                m
                              </span>
                            </>
                          );
                        }

                        // Si solo hay una vertiente, mostrar solo los números
                        if (hasOccidenteValues) {
                          return `${occidente.min}-${occidente.max} m`;
                        }

                        if (hasOrienteValues) {
                          return `${oriente.min}-${oriente.max} m`;
                        }

                        // Fallback al rango general
                        return `${fichaEspecie.altitudinalRange?.min || 0}-${fichaEspecie.altitudinalRange?.max || 0} m`;
                      })()}
                    </p>
                  </div>

                  {/* ClimaticFloorChart - Ancho completo */}
                  <div className="-mx-6">
                    <h4 className="mb-2 px-6 text-sm font-semibold">
                      Distribución Altitudinal
                    </h4>
                    <div className="mb-8 w-full">
                      <ClimaticFloorChart
                        altitudinalRange={fichaEspecie.altitudinalRange}
                      />
                    </div>
                  </div>

                  {/* Regiones Biogeográficas */}
                  {fichaEspecie.dataRegionBio &&
                    fichaEspecie.dataRegionBio.length > 0 && (
                      <div>
                        <h4 className="mb-2 text-sm font-semibold">
                          Regiones Biogeográficas
                        </h4>
                        <div className="space-y-2">
                          {fichaEspecie.dataRegionBio.map((region: any) => (
                            <div
                              key={
                                region.id_taxon_catalogo_awe_region_biogeografica
                              }
                            >
                              <span className="text-muted-foreground text-xs">
                                {region.catalogo_awe?.nombre}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
                  {/* Comentario Estatus Poblacional */}
                  {fichaEspecie.comentario_estatus_poblacional ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: procesarHTML(
                          fichaEspecie.comentario_estatus_poblacional,
                        ),
                      }}
                      className="text-muted-foreground text-sm"
                    />
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No disponible
                    </p>
                  )}

                  {/* Áreas Protegidas */}
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
                    const areasProtegidasUnicas = Array.from(
                      uniqueMap.values(),
                    );

                    return areasProtegidasUnicas.length > 0 ? (
                      <div>
                        <h4 className="mb-2 text-sm font-semibold">
                          Áreas Protegidas
                        </h4>
                        <div className="space-y-3">
                          {/* Áreas protegidas del Estado */}
                          {(() => {
                            const areasEstado = areasProtegidasUnicas.filter(
                              (categoria) =>
                                categoria.catalogo_awe.tipo_catalogo_awe
                                  ?.nombre === "Áreas protegidas del Estado",
                            );

                            return areasEstado.length > 0 ? (
                              <div className="mb-4 ml-4">
                                <p className="mb-2 text-xs font-semibold text-gray-600">
                                  Áreas protegidas del Estado
                                </p>
                                <div className="space-y-1">
                                  {areasEstado.map((categoria: any) => (
                                    <div
                                      key={categoria.id_taxon_catalogo_awe}
                                      className="flex items-start gap-2"
                                    >
                                      <span className="text-muted-foreground text-xs">
                                        •
                                      </span>
                                      <span className="text-muted-foreground text-xs">
                                        {categoria.catalogo_awe.nombre}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : null;
                          })()}

                          {/* Áreas protegidas Privadas */}
                          {(() => {
                            const areasPrivadas = areasProtegidasUnicas.filter(
                              (categoria) =>
                                categoria.catalogo_awe.tipo_catalogo_awe
                                  ?.nombre === "Áreas protegidas Privadas",
                            );

                            return areasPrivadas.length > 0 ? (
                              <div className="ml-4">
                                <p className="mb-2 text-xs font-semibold text-gray-600">
                                  Áreas protegidas Privadas
                                </p>
                                <div className="space-y-1">
                                  {areasPrivadas.map((categoria: any) => (
                                    <div
                                      key={categoria.id_taxon_catalogo_awe}
                                      className="flex items-start gap-2"
                                    >
                                      <span className="text-muted-foreground text-xs">
                                        •
                                      </span>
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

                  {/* Categorías de Conservación */}
                  {(() => {
                    const categoriasConservacion =
                      fichaEspecie.taxon_catalogo_awe_results?.filter(
                        (categoria: any) =>
                          categoria.catalogo_awe.tipo_catalogo_awe?.nombre ===
                            "Lista Roja Coloma" ||
                          categoria.catalogo_awe.tipo_catalogo_awe?.nombre ===
                            "Lista Roja UICN" ||
                          categoria.catalogo_awe.tipo_catalogo_awe?.nombre ===
                            "CITES",
                      ) || [];

                    // Eliminar duplicados basándose en catalogo_awe_id
                    const uniqueMap = new Map();

                    categoriasConservacion.forEach((categoria: any) => {
                      const key = categoria.catalogo_awe_id;

                      if (!uniqueMap.has(key)) {
                        uniqueMap.set(key, categoria);
                      }
                    });
                    const categoriasUnicas = Array.from(uniqueMap.values());

                    return categoriasUnicas.length > 0 ? (
                      <div>
                        <h4 className="mb-2 text-sm font-semibold">
                          Categorías de Conservación
                        </h4>
                        <div className="space-y-3">
                          {/* Lista Roja Coloma */}
                          {(() => {
                            const listaRojaColoma = categoriasUnicas.filter(
                              (categoria) =>
                                categoria.catalogo_awe.tipo_catalogo_awe
                                  ?.nombre === "Lista Roja Coloma",
                            );

                            return listaRojaColoma.length > 0 ? (
                              <div className="mb-4 ml-4">
                                <p className="mb-2 text-xs font-semibold text-gray-600">
                                  Lista Roja Coloma
                                </p>
                                <div className="space-y-1">
                                  {listaRojaColoma.map((categoria: any) => (
                                    <div
                                      key={categoria.id_taxon_catalogo_awe}
                                      className="flex items-start gap-2"
                                    >
                                      <span className="text-muted-foreground text-xs">
                                        •
                                      </span>
                                      <span className="text-muted-foreground text-xs">
                                        {categoria.catalogo_awe.nombre}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : null;
                          })()}

                          {/* Lista Roja UICN */}
                          {(() => {
                            const listaRojaUICN = categoriasUnicas.filter(
                              (categoria) =>
                                categoria.catalogo_awe.tipo_catalogo_awe
                                  ?.nombre === "Lista Roja UICN",
                            );

                            return listaRojaUICN.length > 0 ? (
                              <div className="mb-4 ml-4">
                                <p className="mb-2 text-xs font-semibold text-gray-600">
                                  Lista Roja UICN
                                </p>
                                <div className="space-y-1">
                                  {listaRojaUICN.map((categoria: any) => (
                                    <div
                                      key={categoria.id_taxon_catalogo_awe}
                                      className="flex items-start gap-2"
                                    >
                                      <span className="text-muted-foreground text-xs">
                                        •
                                      </span>
                                      <span className="text-muted-foreground text-xs">
                                        {categoria.catalogo_awe.nombre}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : null;
                          })()}

                          {/* CITES */}
                          {(() => {
                            const cites = categoriasUnicas.filter(
                              (categoria) =>
                                categoria.catalogo_awe.tipo_catalogo_awe
                                  ?.nombre === "CITES",
                            );

                            return cites.length > 0 ? (
                              <div className="ml-4">
                                <p className="mb-2 text-xs font-semibold text-gray-600">
                                  CITES
                                </p>
                                <div className="space-y-1">
                                  {cites.map((categoria: any) => (
                                    <div
                                      key={categoria.id_taxon_catalogo_awe}
                                      className="flex items-start gap-2"
                                    >
                                      <span className="text-muted-foreground text-xs">
                                        •
                                      </span>
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

                  {/* Ecosistemas, Reservas de la Biósfera y Bosques Protegidos */}
                  {(() => {
                    const ecosistemasYAreas =
                      fichaEspecie.taxon_catalogo_awe_results?.filter(
                        (categoria: any) =>
                          categoria.catalogo_awe.tipo_catalogo_awe?.nombre ===
                            "Ecosistemas" ||
                          categoria.catalogo_awe.tipo_catalogo_awe?.nombre ===
                            "Reservas de la Biósfera" ||
                          categoria.catalogo_awe.tipo_catalogo_awe?.nombre ===
                            "Bosques Protegidos",
                      ) || [];

                    // Eliminar duplicados basándose en catalogo_awe_id
                    const uniqueMap = new Map();

                    ecosistemasYAreas.forEach((categoria: any) => {
                      const key = categoria.catalogo_awe_id;

                      if (!uniqueMap.has(key)) {
                        uniqueMap.set(key, categoria);
                      }
                    });
                    const ecosistemasYAreasUnicas = Array.from(
                      uniqueMap.values(),
                    );

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
                                categoria.catalogo_awe.tipo_catalogo_awe
                                  ?.nombre === "Ecosistemas",
                            );

                            return ecosistemas.length > 0 ? (
                              <div className="mb-4 ml-4">
                                <p className="mb-2 text-xs font-semibold text-gray-600">
                                  Ecosistemas
                                </p>
                                <div className="space-y-1">
                                  {ecosistemas.map((categoria: any) => (
                                    <div
                                      key={categoria.id_taxon_catalogo_awe}
                                      className="flex items-start gap-2"
                                    >
                                      <span className="text-muted-foreground text-xs">
                                        •
                                      </span>
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
                            const reservasBiosfera =
                              ecosistemasYAreasUnicas.filter(
                                (categoria) =>
                                  categoria.catalogo_awe.tipo_catalogo_awe
                                    ?.nombre === "Reservas de la Biósfera",
                              );

                            return reservasBiosfera.length > 0 ? (
                              <div className="mb-4 ml-4">
                                <p className="mb-2 text-xs font-semibold text-gray-600">
                                  Reservas de la Biósfera
                                </p>
                                <div className="space-y-1">
                                  {reservasBiosfera.map((categoria: any) => (
                                    <div
                                      key={categoria.id_taxon_catalogo_awe}
                                      className="flex items-start gap-2"
                                    >
                                      <span className="text-muted-foreground text-xs">
                                        •
                                      </span>
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
                            const bosquesProtegidos =
                              ecosistemasYAreasUnicas.filter(
                                (categoria) =>
                                  categoria.catalogo_awe.tipo_catalogo_awe
                                    ?.nombre === "Bosques Protegidos",
                              );

                            return bosquesProtegidos.length > 0 ? (
                              <div className="ml-4">
                                <p className="mb-2 text-xs font-semibold text-gray-600">
                                  Bosques Protegidos
                                </p>
                                <div className="space-y-1">
                                  {bosquesProtegidos.map((categoria: any) => (
                                    <div
                                      key={categoria.id_taxon_catalogo_awe}
                                      className="flex items-start gap-2"
                                    >
                                      <span className="text-muted-foreground text-xs">
                                        •
                                      </span>
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
            {/* { Publicaciones } */}
            <Card className="">
              <CardHeader>
                <CardTitle className="text-base">Publicaciones</CardTitle>
              </CardHeader>
              <CardContent>
                {fichaEspecie.publicaciones &&
                fichaEspecie.publicaciones.length > 0 ? (
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
                          !pub.publicacion.cita_corta.includes(
                            pub.publicacion.titulo,
                          )
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
                          const añoStr = String(
                            pub.publicacion.numero_publicacion_ano,
                          );

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
                          className="hover:bg-muted flex flex-col gap-2 rounded-md p-3 transition-colors"
                          href={bibliographyUrl}
                        >
                          {pub.publicacion?.titulo && (
                            <div
                              dangerouslySetInnerHTML={{
                                __html: processHTMLLinks(
                                  pub.publicacion.titulo,
                                ),
                              }}
                              className="hover:text-primary text-sm font-medium"
                            />
                          )}
                          <div
                            dangerouslySetInnerHTML={{
                              __html: processHTMLLinks(citaParaMostrar),
                            }}
                            className="text-muted-foreground text-xs"
                          />
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No hay publicaciones disponibles
                  </p>
                )}
              </CardContent>
            </Card>
            <Card className="">
              <CardHeader>
                <CardTitle className="text-base">
                  Historial de la ficha
                </CardTitle>
              </CardHeader>
              <CardContent>
                {fichaEspecie.historial ? (
                  <div className="text-muted-foreground text-sm">
                    {fichaEspecie.historial
                      .split(/\r\n?|\n/)
                      .map((line: string, idx: number) => (
                        <div key={idx}>{line}</div>
                      ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No disponible</p>
                )}
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
        <div
          className="sticky top-0 h-screen py-4 pr-8 pl-4"
          style={{ width: "20%" }}
        >
          <Card className="h-full overflow-hidden">
            <CardContent className="h-full space-y-2 overflow-y-auto p-4">
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
                      <RedListStatus
                        status={fichaEspecie.listaRojaIUCN.catalogo_awe.sigla}
                      />
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
                    <span
                      className="text-center text-xs font-semibold"
                      style={{ color: "#000000" }}
                    >
                      {fichaEspecie.taxones?.[0]?.endemica
                        ? "Endémica"
                        : " No endémica"}
                    </span>
                  </div>
                </div>
              </section>

              {/* Recursos */}
              <section>
                <div className="grid grid-cols-1 gap-2">
                  <div
                    className="flex aspect-square cursor-pointer items-center justify-center rounded-md border p-2 transition-colors hover:bg-gray-50"
                    style={{
                      backgroundColor: "#f9f9f9",
                      borderColor: "#dddddd",
                    }}
                  >
                    <Camera className="h-8 w-8" style={{ color: "#333333" }} />
                  </div>

                  <div
                    className="flex aspect-square cursor-pointer items-center justify-center rounded-md border p-2 transition-colors hover:bg-gray-50"
                    style={{
                      backgroundColor: "#f9f9f9",
                      borderColor: "#dddddd",
                    }}
                  >
                    <Volume2 className="h-8 w-8" style={{ color: "#333333" }} />
                  </div>

                  <div
                    className="flex aspect-square cursor-pointer items-center justify-center rounded-md border p-2 transition-colors hover:bg-gray-50"
                    style={{
                      backgroundColor: "#f9f9f9",
                      borderColor: "#dddddd",
                    }}
                  >
                    <MapPin className="h-8 w-8" style={{ color: "#333333" }} />
                  </div>
                </div>
              </section>

              {/* Fuentes Externas */}
              <section>
                <div className="grid grid-cols-1 gap-2">
                  {fichaEspecie.wikipedia && (
                    <Button
                      asChild
                      className="group h-auto rounded-md border p-2 hover:bg-gray-50"
                      style={{ backgroundColor: "#f9f9f9" }}
                      variant="outline"
                    >
                      <a href={fichaEspecie.wikipedia}>
                        <img
                          alt="ASW Logo"
                          className="mx-auto grayscale transition-all duration-[800ms] ease-in-out group-hover:grayscale-0"
                          src="/assets/references/wikipedia.png"
                          style={{ width: "100%", height: "auto" }}
                        />
                      </a>
                    </Button>
                  )}

                  {fichaEspecie.aw && (
                    <Button
                      asChild
                      className="group h-auto rounded-md border p-2 hover:bg-gray-50"
                      style={{ backgroundColor: "#f9f9f9" }}
                      variant="outline"
                    >
                      <a href={fichaEspecie.aw}>
                        <img
                          alt="AmphibiaWeb Logo"
                          className="mx-auto grayscale transition-all duration-[800ms] ease-in-out group-hover:grayscale-0"
                          src="/assets/references/amphibiaweb.png"
                          style={{ width: "100%", height: "auto" }}
                        />
                      </a>
                    </Button>
                  )}

                  {fichaEspecie.genbank && (
                    <Button
                      asChild
                      className="group h-auto rounded-md border p-2 hover:bg-gray-50"
                      style={{ backgroundColor: "#f9f9f9" }}
                      variant="outline"
                    >
                      <a href={fichaEspecie.genbank}>
                        <img
                          alt="NCBI Logo"
                          className="mx-auto grayscale transition-all duration-[800ms] ease-in-out group-hover:grayscale-0"
                          src="/assets/references/ncbi.png"
                          style={{ width: "100%", height: "auto" }}
                        />
                      </a>
                    </Button>
                  )}

                  {fichaEspecie.herpnet && (
                    <Button
                      asChild
                      className="group h-auto rounded-md border p-2 hover:bg-gray-50"
                      style={{ backgroundColor: "#f9f9f9" }}
                      variant="outline"
                    >
                      <a href={fichaEspecie.herpnet}>
                        <img
                          alt="VertNet Logo"
                          className="mx-auto grayscale transition-all duration-[800ms] ease-in-out group-hover:grayscale-0"
                          src="/assets/references/vertnet.png"
                          style={{ width: "100%", height: "auto" }}
                        />
                      </a>
                    </Button>
                  )}

                  {fichaEspecie.inaturalist && (
                    <Button
                      asChild
                      className="group h-auto rounded-md border p-2 hover:bg-gray-50"
                      style={{ backgroundColor: "#f9f9f9" }}
                      variant="outline"
                    >
                      <a href={fichaEspecie.inaturalist}>
                        <img
                          alt="iNaturalist Logo"
                          className="mx-auto grayscale transition-all duration-[800ms] ease-in-out group-hover:grayscale-0"
                          src="/assets/references/iNaturalist.png"
                          style={{ width: "100%", height: "auto" }}
                        />
                      </a>
                    </Button>
                  )}

                  {fichaEspecie.asw && (
                    <Button
                      asChild
                      className="group h-auto rounded-md border p-2 hover:bg-gray-50"
                      style={{ backgroundColor: "#f9f9f9" }}
                      variant="outline"
                    >
                      <a href={fichaEspecie.asw}>
                        <img
                          alt="amnh Logo"
                          className="mx-auto grayscale transition-all duration-[800ms] ease-in-out group-hover:grayscale-0"
                          src="/assets/references/amnh.png"
                          style={{ width: "100%", height: "auto" }}
                        />
                      </a>
                    </Button>
                  )}

                  {fichaEspecie.uicn && (
                    <Button
                      asChild
                      className="group h-auto rounded-md border p-2 hover:bg-gray-50"
                      style={{ backgroundColor: "#f9f9f9" }}
                      variant="outline"
                    >
                      <a href={fichaEspecie.uicn}>
                        <img
                          alt="IUCN Logo"
                          className="mx-auto grayscale transition-all duration-[800ms] ease-in-out group-hover:grayscale-0"
                          src="/assets/references/redlist.png"
                          style={{ width: "100%", height: "auto" }}
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
