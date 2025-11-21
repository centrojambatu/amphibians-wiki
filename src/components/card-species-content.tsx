"use client";

import {Camera, MapPin, Volume2} from "lucide-react";

import {
  getBackgroundColor,
  getBorderColor,
  getRedListStatusFullName,
  getTextColor,
} from "@/lib/get-badge-color-by-red-list-status";
import {processHTMLLinks} from "@/lib/process-html-links";

import {Button} from "./ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "./ui/card";
import {Separator} from "./ui/separator";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "./ui/tooltip";
import ClimaticFloorChart from "./ClimaticFloorChart";
import RedListStatus from "./RedListStatus";

// Función para agrupar datos geopolíticos jerárquicamente
const groupGeoPoliticalData = (geoPolitica: any[]) => {
  if (!geoPolitica || geoPolitica.length === 0) return {};

  // Ordenar por rank_geopolitica_id (de menor a mayor, asumiendo que 1=Continente, 2=País, 3=Provincia)
  const sortedData = [...geoPolitica].sort((a, b) => a.rank_geopolitica_id - b.rank_geopolitica_id);

  const grouped: any = {};
  let currentContinente: string | null = null;
  let currentPais: string | null = null;

  sortedData.forEach((item) => {
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

export const CardSpeciesContent = ({fichaEspecie}) => {
  return (
    <CardContent className="flex-1 overflow-y-auto p-0">
      <div className="flex">
        {/* Columna izquierda - Contenido principal */}
        <div className="flex-1">
          <div className="space-y-10 p-8">
            {/* Secciones de contenido */}
            {/* Primer(os) colector(es) */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Primer(os) colector(es)</CardTitle>
              </CardHeader>
              <CardContent>
                {fichaEspecie.descubridor ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: processHTMLLinks(fichaEspecie.descubridor),
                    }}
                    className="text-muted-foreground italic"
                  />
                ) : (
                  <p className="text-muted-foreground italic">No disponible</p>
                )}
              </CardContent>
            </Card>
            {/* Etimología */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Etimología</CardTitle>
              </CardHeader>
              <CardContent>
                {fichaEspecie.etimologia ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: processHTMLLinks(fichaEspecie.etimologia),
                    }}
                    className="text-muted-foreground"
                  />
                ) : (
                  <p className="text-muted-foreground">No disponible</p>
                )}
              </CardContent>
            </Card>
            {/* {Identificacion} */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Identificación</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Taxonomía */}
                {fichaEspecie.taxonomia && (
                  <div className="mt-4">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: processHTMLLinks(fichaEspecie.taxonomia),
                      }}
                      className="text-muted-foreground"
                    />
                  </div>
                )}

                {/* Longitud rostro-cloacal */}
                <div className="mt-4 space-y-2">
                  {fichaEspecie.svl_macho && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Longitud rostro-cloacal ♂:</span>
                      <span className="text-muted-foreground">{fichaEspecie.svl_macho}</span>
                    </div>
                  )}
                  {fichaEspecie.svl_hembra && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Longitud rostro-cloacal ♀:</span>
                      <span className="text-muted-foreground">{fichaEspecie.svl_hembra}</span>
                    </div>
                  )}
                </div>

                {fichaEspecie.identificacion ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: processHTMLLinks(fichaEspecie.identificacion),
                    }}
                    className="text-muted-foreground mt-4"
                  />
                ) : (
                  <p className="text-muted-foreground mt-4">No disponible</p>
                )}
              </CardContent>
            </Card>
            {/* Historia Natural */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Historia Natural</CardTitle>
              </CardHeader>
              <CardContent>
                {fichaEspecie.habitat_biologia ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: processHTMLLinks(fichaEspecie.habitat_biologia),
                    }}
                    className="text-muted-foreground"
                  />
                ) : (
                  <p className="text-muted-foreground">No disponible</p>
                )}
              </CardContent>
            </Card>
            {/* Contenido */} {/* Información básica */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Distribución</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Distribución Geopolítica */}
                  {fichaEspecie.geoPolitica && fichaEspecie.geoPolitica.length > 0 && (
                    <div>
                      <h4 className="mb-2 font-semibold">Distribución Geopolítica</h4>
                      <div className="space-y-4">
                        {Object.entries(groupGeoPoliticalData(fichaEspecie.geoPolitica)).map(
                          ([continente, continenteData]: [string, any]) => (
                            <div key={continente} className="space-y-2">
                              {Object.entries(continenteData.paises).map(
                                ([pais, paisData]: [string, any]) => (
                                  <div key={`${continente}-${pais}`} className="text-sm">
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
                    </div>
                  )}

                  {/* Zonas Altitudinales */}
                  <div>
                    <h4 className="mb-2 font-semibold">Zonas Altitudinales</h4>
                    <div className="space-y-2">
                      {fichaEspecie.distributions.map((categoria) => (
                        <div key={`${categoria.catalogo_awe_id}-graphic`}>
                          <span className="text-muted-foreground text-sm">
                            {categoria.catalogo_awe.nombre}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rango Altitudinal */}
                  <div>
                    <h4 className="mb-2 font-semibold">Rango Altitudinal</h4>
                    <p className="text-muted-foreground text-sm">
                      {(() => {
                        const occidente = fichaEspecie.altitudinalRange?.occidente;
                        const oriente = fichaEspecie.altitudinalRange?.oriente;

                        // Verificar si realmente hay valores (no solo el objeto vacío)
                        const hasOccidenteValues = occidente?.min != null && occidente?.max != null;
                        const hasOrienteValues = oriente?.min != null && oriente?.max != null;

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
                                {oriente.min && oriente.max ? `${oriente.min}-${oriente.max}` : "-"}{" "}
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
                    <h4 className="mb-2 px-6 font-semibold">Distribución Altitudinal</h4>
                    <div className="mb-8 w-full">
                      <ClimaticFloorChart altitudinalRange={fichaEspecie.altitudinalRange} />
                    </div>
                  </div>

                  {/* Regiones Biogeográficas */}
                  <div>
                    <h4 className="mb-2 font-semibold">Regiones Biogeográficas</h4>
                    <div className="space-y-2">
                      {fichaEspecie.dataRegionBio.map((region) => (
                        <div key={region.id_taxon_catalogo_awe_region_biogeografica}>
                          <span className="text-muted-foreground text-sm">
                            {region.catalogo_awe.nombre}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Catalogo Awe */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Categorías en Catálogos AWE</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6 md:grid-cols-2">
                  {fichaEspecie.taxon_catalogo_awe_results.map((categoria) => (
                    <div
                      key={categoria.id_taxon_catalogo_awe}
                      className="flex items-center justify-between"
                    >
                      <span>{categoria.catalogo_awe.tipo_catalogo_awe?.nombre}</span>
                      <span className="text-muted-foreground text-sm">
                        {categoria.catalogo_awe.nombre}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            {/* { Publicaciones } */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Publicaciones</CardTitle>
              </CardHeader>
              <CardContent>
                {fichaEspecie.publicaciones && fichaEspecie.publicaciones.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-1">
                    {fichaEspecie.publicaciones.map((pub) => (
                      <div
                        key={pub.id_taxon_publicacion}
                        className="flex items-center justify-between"
                      >
                        <div
                          dangerouslySetInnerHTML={{
                            __html: processHTMLLinks(
                              pub.publicacion?.titulo || "Título no disponible",
                            ),
                          }}
                        />
                        <div
                          dangerouslySetInnerHTML={{
                            __html: processHTMLLinks(
                              pub.publicacion?.cita_corta || "Cita corta no disponible",
                            ),
                          }}
                          className="text-muted-foreground text-sm"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No hay publicaciones disponibles</p>
                )}
              </CardContent>
            </Card>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Historial de la ficha</CardTitle>
              </CardHeader>
              <CardContent>
                {fichaEspecie.historial ? (
                  <div className="text-muted-foreground">
                    {fichaEspecie.historial.split(/\r\n?|\n/).map((line: string, idx: number) => (
                      <div key={idx}>{line}</div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No disponible</p>
                )}
              </CardContent>
            </Card>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Fecha Actualizacion</CardTitle>
              </CardHeader>
              <CardContent>
                {fichaEspecie.fecha_actualizacion ? (
                  <span className="text-muted-foreground">{fichaEspecie.fecha_actualizacion}</span>
                ) : (
                  <p className="text-muted-foreground">No disponible</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Columna derecha - Sidebar fijo */}
        <div className="sticky top-0 h-screen py-8 pr-8 pl-4" style={{width: "25%"}}>
          <Card className="h-full overflow-hidden">
            <CardContent className="h-full space-y-8 overflow-y-auto p-8">
              {/* Información General */}
              <section>
                <h3 className="mb-4 text-lg font-semibold">Información General</h3>
                {/* Fotografía de Ficha */}
                {fichaEspecie.fotografia_ficha && (
                  <div
                    className="group mb-2 flex w-full flex-col items-center justify-center overflow-hidden rounded-none border p-2"
                    style={{backgroundColor: "#ffffff", borderColor: "#dddddd"}}
                  >
                    <img
                      alt="Fotografía de la especie"
                      className="mx-auto h-auto w-full cursor-pointer object-contain grayscale transition-all duration-[800ms] ease-in-out hover:grayscale-0"
                      src={fichaEspecie.fotografia_ficha}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2">
                  {/* Endemismo */}
                  <div
                    className="flex aspect-square flex-col items-center justify-center rounded-none border p-2"
                    style={{backgroundColor: "#f9f9f9", borderColor: "#dddddd"}}
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
                    <span className="text-center text-sm font-semibold" style={{color: "#000000"}}>
                      {fichaEspecie.taxones[0].endemica ? "Endémica" : " No endémica"}
                    </span>
                  </div>

                  {/* En Ecuador */}
                  <div
                    className="flex aspect-square flex-col items-center justify-center rounded-none border p-2"
                    style={{backgroundColor: "#f9f9f9", borderColor: "#dddddd"}}
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
                      En Ecuador
                    </h4>
                    <span className="text-center text-sm font-semibold" style={{color: "#000000"}}>
                      {fichaEspecie.taxones[0].en_ecuador ? "Sí" : "No"}
                    </span>
                  </div>

                  {/* Lista Roja */}
                  {fichaEspecie.listaRojaIUCN && (
                    <div
                      className="flex aspect-square flex-col items-center justify-center rounded-none border p-2"
                      style={{backgroundColor: "#f9f9f9", borderColor: "#dddddd"}}
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
                      <RedListStatus status={fichaEspecie.listaRojaIUCN.catalogo_awe.sigla} />
                    </div>
                  )}
                </div>
              </section>

              <Separator />

              {/* Recursos */}
              <section>
                <h3 className="mb-4 text-lg font-semibold">Recursos</h3>
                <div className="grid grid-cols-1 gap-2">
                  <div
                    className="flex aspect-square cursor-pointer items-center justify-center rounded-none border p-2 transition-colors hover:bg-gray-50"
                    style={{backgroundColor: "#f9f9f9", borderColor: "#dddddd"}}
                  >
                    <Camera className="h-8 w-8" style={{color: "#333333"}} />
                  </div>

                  <div
                    className="flex aspect-square cursor-pointer items-center justify-center rounded-none border p-2 transition-colors hover:bg-gray-50"
                    style={{backgroundColor: "#f9f9f9", borderColor: "#dddddd"}}
                  >
                    <Volume2 className="h-8 w-8" style={{color: "#333333"}} />
                  </div>

                  <div
                    className="flex aspect-square cursor-pointer items-center justify-center rounded-none border p-2 transition-colors hover:bg-gray-50"
                    style={{backgroundColor: "#f9f9f9", borderColor: "#dddddd"}}
                  >
                    <MapPin className="h-8 w-8" style={{color: "#333333"}} />
                  </div>
                </div>
              </section>

              <Separator />

              {/* Fuentes Externas */}
              <section>
                <h3 className="mb-4 text-lg font-semibold">Fuentes externas</h3>
                <div className="grid grid-cols-1 gap-2">
                  {fichaEspecie.wikipedia && (
                    <Button
                      asChild
                      className="group h-auto rounded-none border p-2 hover:bg-gray-50"
                      style={{backgroundColor: "#f9f9f9"}}
                      variant="outline"
                    >
                      <a href={fichaEspecie.wikipedia}>
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
                      className="group h-auto rounded-none border p-2 hover:bg-gray-50"
                      style={{backgroundColor: "#f9f9f9"}}
                      variant="outline"
                    >
                      <a href={fichaEspecie.aw}>
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
                      className="group h-auto rounded-none border p-2 hover:bg-gray-50"
                      style={{backgroundColor: "#f9f9f9"}}
                      variant="outline"
                    >
                      <a href={fichaEspecie.genbank}>
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
                      className="group h-auto rounded-none border p-2 hover:bg-gray-50"
                      style={{backgroundColor: "#f9f9f9"}}
                      variant="outline"
                    >
                      <a href={fichaEspecie.herpnet}>
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
                      className="group h-auto rounded-none border p-2 hover:bg-gray-50"
                      style={{backgroundColor: "#f9f9f9"}}
                      variant="outline"
                    >
                      <a href={fichaEspecie.inaturalist}>
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
                      className="group h-auto rounded-none border p-2 hover:bg-gray-50"
                      style={{backgroundColor: "#f9f9f9"}}
                      variant="outline"
                    >
                      <a href={fichaEspecie.asw}>
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
                      className="group h-auto rounded-none border p-2 hover:bg-gray-50"
                      style={{backgroundColor: "#f9f9f9"}}
                      variant="outline"
                    >
                      <a href={fichaEspecie.uicn}>
                        <img
                          alt="IUCN Logo"
                          className="mx-auto grayscale transition-all duration-[800ms] ease-in-out group-hover:grayscale-0"
                          src="/assets/references/redlist.png"
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
