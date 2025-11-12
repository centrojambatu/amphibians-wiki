import {Camera, MapPin, Volume2} from "lucide-react";

import {Button} from "./ui/button";
import {CardContent} from "./ui/card";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "./ui/tooltip";

export const CardSpeciesContent = () => {
  return (
    <CardContent className="flex-1 overflow-y-auto p-0">
      <div className="flex">
        {/* Columna izquierda - Contenido principal */}
        <div className="flex-1">
          <div className="space-y-10 p-8">
            {/* Secciones de contenido */}
            {true && (
              <section>
                <h3 className="mb-4">Etimología</h3>
                <div className="text-justify">
                  <div dangerouslySetInnerHTML={{__html: "TODO etymology"}} />
                </div>
              </section>
            )}

            {true && (
              <section>
                <h3 className="mb-4">Identificación</h3>
                <div className="text-justify">
                  <div dangerouslySetInnerHTML={{__html: "todo identification"}} />
                </div>
              </section>
            )}

            {true && (
              <section>
                <h3 className="mb-4">Comparaciones</h3>
                <div className="text-justify">
                  <div dangerouslySetInnerHTML={{__html: "TODO comparisons"}} />
                </div>
              </section>
            )}

            {true && (
              <section>
                <h3 className="mb-4">Historia natural</h3>
                <div className="text-justify">
                  <div dangerouslySetInnerHTML={{__html: "todo naturalHistory"}} />
                </div>
              </section>
            )}

            {true && (
              <section>
                <h3 className="mb-4">Contenido</h3>
                <div className="text-justify">
                  <div dangerouslySetInnerHTML={{__html: "todo content"}} />
                </div>
              </section>
            )}

            {true && (
              <section>
                <h3 className="mb-4">Distribución</h3>
                <div className="text-justify">
                  <div dangerouslySetInnerHTML={{__html: "todo distribution"}} />
                </div>
              </section>
            )}

            {true && (
              <section>
                <h3 className="mb-4">Conservación</h3>
                <div className="text-justify">
                  <div dangerouslySetInnerHTML={{__html: "todo conservation"}} />
                </div>
              </section>
            )}

            {true && (
              <section>
                <h3 className="mb-4">Referencias</h3>
                <div className="text-justify">
                  <div dangerouslySetInnerHTML={{__html: "todo references"}} />
                </div>
              </section>
            )}
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
