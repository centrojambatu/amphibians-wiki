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

            {/* Información básica */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Información Básica</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
                  <div>
                    <h4 className="mb-2 font-semibold">Etimología</h4>
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
                  </div>
                  <div>
                    <h4 className="mb-2 font-semibold">Distribución</h4>
                    {/* <p className="text-muted-foreground">
                      grafico TODO : {fichaEspecie.rango_altitudinal || "No disponible"}
                    </p> */}
                    <ClimaticFloorChart
                      altitudinalRange={fichaEspecie.altitudinalRange}
                      // altitudinalRange={{
                      //   min: null,
                      //   max: null,
                      //   occidente: {
                      //     min: null,
                      //     max: null,
                      //   },
                      //   oriente: {
                      //     min: 2000,
                      //     max: 2500,
                      //   },
                      // }}
                    />
                  </div>
                  <div>
                    <h4 className="mb-2 font-semibold">Distribución Altitudinal</h4>
                    {fichaEspecie.distributions.map((categoria) => (
                      <div
                        key={`${categoria.catalogo_awe_id}-graphic`}
                        className="flex items-center justify-between"
                      >
                        {/* <span>{categoria.catalogo_awe.tipo_catalogo_awe?.nombre}</span> */}
                        <span className="text-muted-foreground text-sm">
                          {categoria.catalogo_awe.nombre}
                        </span>
                      </div>
                    ))}
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

            {/* Ecoregion */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Regiones Biogeográficas AWE</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6 md:grid-cols-2">
                  {fichaEspecie.dataRegionBio.map((region) => (
                    <div
                      key={region.id_taxon_catalogo_awe_region_biogeografica}
                      className="flex items-center justify-between"
                    >
                      <span>{region.catalogo_awe.tipo_catalogo_awe?.nombre}</span>
                      <span className="text-muted-foreground text-sm">
                        {region.catalogo_awe.nombre} ({region.catalogo_awe.descripcion})
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Geopolítica */}
            {fichaEspecie.geoPolitica && fichaEspecie.geoPolitica.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Distribución Geopolítica</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {Object.entries(groupGeoPoliticalData(fichaEspecie.geoPolitica)).map(
                      ([continente, continenteData]: [string, any], index) => (
                        <div key={continente}>
                          {index > 0 && <Separator className="mb-6" />}
                          <div className="space-y-2">
                            {/* Continente */}
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 shrink-0 rounded-full bg-green-600" />
                              <div className="text-foreground text-base font-bold">
                                {continente}
                              </div>
                            </div>
                            {/* Países */}
                            <div className="space-y-2">
                              {Object.entries(continenteData.paises).map(
                                ([pais, paisData]: [string, any]) => (
                                  <div key={`${continente}-${pais}`} className="ml-6 space-y-1">
                                    <div className="flex items-center gap-2">
                                      <div className="h-2 w-2 shrink-0 rounded-full bg-green-500" />
                                      <div className="text-foreground text-sm font-semibold">
                                        {pais}
                                      </div>
                                    </div>
                                    {/* Provincias */}
                                    {paisData.provincias && paisData.provincias.length > 0 && (
                                      <div className="text-muted-foreground ml-6 text-sm">
                                        {paisData.provincias.map(
                                          (provincia: string, idx: number) => (
                                            <span key={`${pais}-${provincia}-${idx}`}>
                                              • {provincia}
                                              {idx < paisData.provincias.length - 1 && " "}
                                            </span>
                                          ),
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* {Identificacion} */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Identificación</CardTitle>
              </CardHeader>
              <CardContent>
                {fichaEspecie.identificacion ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: processHTMLLinks(fichaEspecie.identificacion),
                    }}
                    className="text-muted-foreground"
                  />
                ) : (
                  <p className="text-muted-foreground">No disponible</p>
                )}
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
