import {Camera, MapPin, Volume2} from "lucide-react";

import {
  getBackgroundColor,
  getBorderColor,
  getRedListStatusFullName,
  getTextColor,
} from "@/lib/get-badge-color-by-red-list-status";

import {Button} from "./ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "./ui/card";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "./ui/tooltip";
import ClimaticFloorChart from "./ClimaticFloorChart";
import RedListStatus from "./RedListStatus";

export const CardSpeciesContent = ({fichaEspecie}) => {
  return (
    <CardContent className="flex-1 overflow-y-auto p-0">
      <div className="flex">
        {/* Columna izquierda - Contenido principal */}
        <div className="flex-1">
          <div className="space-y-10 p-8">
            {/* Secciones de contenido */}

            {/* Información básica */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Información Básica</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
                  <div>
                    <h4 className="mb-2 font-semibold">Primeros colectores</h4>
                    {fichaEspecie.descubridor ? (
                      <div
                        dangerouslySetInnerHTML={{__html: fichaEspecie.descubridor}}
                        className="text-muted-foreground italic"
                      />
                    ) : (
                      <p className="text-muted-foreground italic">No disponible</p>
                    )}
                  </div>
                  <div>
                    <h4 className="mb-2 font-semibold">Etimología</h4>
                    {fichaEspecie.etimologia ? (
                      <div
                        dangerouslySetInnerHTML={{__html: fichaEspecie.etimologia}}
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
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Distribución Geopolítica</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-1">
                  {fichaEspecie.geoPolitica?.map((region) => (
                    <div
                      key={`${region.rank_geopolitica_id}-geopolitica`}
                      className="flex items-center justify-between"
                    >
                      <span>{region.rank_nombre}</span>
                      <span className="text-muted-foreground text-sm">{region.nombre}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* {Identificacion} */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Identificación</CardTitle>
              </CardHeader>
              <CardContent>
                {fichaEspecie.identificacion ? (
                  <div dangerouslySetInnerHTML={{__html: fichaEspecie.identificacion}} />
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
                            __html: pub.publicacion?.titulo || "Título no disponible",
                          }}
                        />
                        <div
                          dangerouslySetInnerHTML={{
                            __html: pub.publicacion?.cita_corta || "Cita corta no disponible",
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
                <CardContent>
                  {fichaEspecie.historial ? (
                    <span className="text-muted-foreground">{fichaEspecie.historial}</span>
                  ) : (
                    <p className="text-muted-foreground">No disponible</p>
                  )}
                </CardContent>
              </CardHeader>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Fecha Actualizacion</CardTitle>
                <CardContent>
                  {fichaEspecie.fecha_actualizacion ? (
                    <span className="text-muted-foreground">
                      {fichaEspecie.fecha_actualizacion}
                    </span>
                  ) : (
                    <p className="text-muted-foreground">No disponible</p>
                  )}
                </CardContent>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Columna derecha - Sidebar fijo */}
        <div className="sticky top-0 h-screen w-96 overflow-y-auto border-l">
          <div className="space-y-8" style={{padding: "25px 30px"}}>
            {/* Información General */}
            <section>
              <h3 className="mb-4">Información General</h3>

              {/* Fotografía de Ficha */}
              {fichaEspecie.fotografia_ficha && (
                <div
                  className="flex aspect-square flex-col items-center justify-center rounded-none border p-2"
                  style={{backgroundColor: "#f9f9f9", borderColor: "#dddddd"}}
                >
                  <img
                    alt="Fotografía de la especie"
                    // className="h-full w-full object-cover"
                    className="mx-auto h-full w-full object-cover grayscale transition-all duration-300 group-hover:scale-110 group-hover:grayscale-0"
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
                  <span
                    className="text-center text-sm font-semibold"
                    style={{color: fichaEspecie.taxones[0].endemica ? "#16a34a" : "#6b7280"}}
                  >
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
                  <span
                    className="text-center text-sm font-semibold"
                    style={{color: fichaEspecie.taxones[0].en_ecuador ? "#16a34a" : "#6b7280"}}
                  >
                    {fichaEspecie.taxones[0].en_ecuador ? "Sí" : "No"}
                  </span>
                </div>

                {/* Lista Roja */}
                {fichaEspecie.listaRojaIUCN && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-none border p-2"
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
                          {/* <span
                            className="rounded-none px-2 py-1 font-mono text-base"
                            style={{
                              backgroundColor: getBackgroundColor(
                                fichaEspecie.listaRojaIUCN.catalogo_awe.sigla,
                              ),
                              color: getTextColor(fichaEspecie.listaRojaIUCN.catalogo_awe.sigla),
                              border: "1px solid",
                              borderColor: getBorderColor(
                                fichaEspecie.listaRojaIUCN.catalogo_awe.sigla,
                              ),
                            }}
                          >
                            {fichaEspecie.listaRojaIUCN.catalogo_awe.sigla}
                          </span> */}
                          <RedListStatus status={fichaEspecie.listaRojaIUCN.catalogo_awe.sigla} />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {getRedListStatusFullName(fichaEspecie.listaRojaIUCN.catalogo_awe.sigla)}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </section>

            {/* Recursos */}
            <section>
              <h3 className="mb-4">Recursos</h3>
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

            {/* Fuentes Externas */}
            <section>
              <h3 className="mb-4">Fuentes externas</h3>
              <div className="grid grid-cols-1 gap-2">
                {fichaEspecie.wikipedia && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          asChild
                          className="group h-auto rounded-none border p-2 hover:bg-gray-50"
                          style={{backgroundColor: "#f9f9f9"}}
                          variant="outline"
                        >
                          <a href={fichaEspecie.wikipedia}>
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
                )}

                {fichaEspecie.aw && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          asChild
                          className="group h-auto rounded-none border p-2 hover:bg-gray-50"
                          style={{backgroundColor: "#f9f9f9"}}
                          variant="outline"
                        >
                          <a href={fichaEspecie.aw}>
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
                )}

                {fichaEspecie.genbank && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          asChild
                          className="group h-auto rounded-none border p-2 hover:bg-gray-50"
                          style={{backgroundColor: "#f9f9f9"}}
                          variant="outline"
                        >
                          <a href={fichaEspecie.genbank}>
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
                )}

                {fichaEspecie.herpnet && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          asChild
                          className="group h-auto rounded-none border p-2 hover:bg-gray-50"
                          style={{backgroundColor: "#f9f9f9"}}
                          variant="outline"
                        >
                          <a href={fichaEspecie.herpnet}>
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
                )}

                {fichaEspecie.inaturalist && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          asChild
                          className="group h-auto rounded-none border p-2 hover:bg-gray-50"
                          style={{backgroundColor: "#f9f9f9"}}
                          variant="outline"
                        >
                          <a href={fichaEspecie.inaturalist}>
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
                )}

                {fichaEspecie.asw && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          asChild
                          className="group h-auto rounded-none border p-2 hover:bg-gray-50"
                          style={{backgroundColor: "#f9f9f9"}}
                          variant="outline"
                        >
                          <a href={fichaEspecie.asw}>
                            <img
                              alt="amnh Logo"
                              className="mx-auto grayscale transition-all duration-300 group-hover:scale-110 group-hover:grayscale-0"
                              src="/assets/references/amnh.png"
                              style={{width: "100%", height: "auto"}}
                            />
                          </a>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>amnh</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {fichaEspecie.uicn && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          asChild
                          className="group h-auto rounded-none border p-2 hover:bg-gray-50"
                          style={{backgroundColor: "#f9f9f9"}}
                          variant="outline"
                        >
                          <a href={fichaEspecie.uicn}>
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
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </CardContent>
  );
};
