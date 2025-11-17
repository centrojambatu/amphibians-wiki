import {Camera, MapPin, Volume2} from "lucide-react";

import {Button} from "./ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "./ui/card";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "./ui/tooltip";

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
                    <p className="text-muted-foreground italic">TODO</p>
                  </div>
                  <div>
                    <h4 className="mb-2 font-semibold">Etimología</h4>
                    <p className="text-muted-foreground">
                      {fichaEspecie.etimologia || "No disponible"}
                    </p>
                  </div>
                  <div>
                    <h4 className="mb-2 font-semibold">Distribución</h4>
                    <p className="text-muted-foreground">
                      grafico TODO : {fichaEspecie.rango_altitudinal || "No disponible"}
                    </p>
                  </div>
                  <div>
                    <h4 className="mb-2 font-semibold">Distribución Altitudinal nombre</h4>
                    <p className="text-muted-foreground">
                      grafico TODO : {fichaEspecie.rango_altitudinal || "No disponible"}
                    </p>
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
                      key={region.rank_geopolitica_id}
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
                  fichaEspecie.identificacion
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
                        <span>{pub.publicacion?.titulo || "Título no disponible"}</span>
                        <span className="text-muted-foreground text-sm">
                          {pub.publicacion?.cita_corta || "Cita corta no disponible"}
                        </span>
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
            {/* Distribución Altitudinal */}
            {true && true && (
              <section>
                <h3 className="mb-4">Distribución altitudinal</h3>
                <div
                  className="rounded-none border p-4"
                  style={{backgroundColor: "#f9f9f9", borderColor: "#dddddd"}}
                >
                  {/* <ClimaticFloorChart
                    altitudinalRange={altitudinalRange}
                    climaticFloors={climaticFloors}
                  /> */}
                  <span> todo climaticFloors graphic</span>
                </div>
              </section>
            )}

            {/* Información General */}
            <section>
              <h3 className="mb-4">Información General</h3>

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
                    style={{color: true ? "#16a34a" : "#6b7280"}}
                  >
                    {true ? "TODO Endémica" : " TODO No endémica"}
                  </span>
                </div>

                {/* Lista Roja */}
                {true && (
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
                          </span> */}
                          todo redListStatus badge
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {/* {redListStatus === "LC"
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
                                          : redListStatus} */}
                          TODO redListStatus full text
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
  );
};
