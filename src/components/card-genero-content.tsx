"use client";

import {useMemo} from "react";
import Link from "next/link";

import {processHTMLLinks, processCitationReferences} from "@/lib/process-html-links";
import {getBibliographyUrl} from "@/lib/get-bibliography-url";

import {Card, CardContent, CardHeader, CardTitle} from "./ui/card";

interface CardGeneroContentProps {
  fichaGenero: any;
}

export const CardGeneroContent = ({fichaGenero}: CardGeneroContentProps) => {
  // Validar que fichaGenero existe
  if (!fichaGenero) {
    console.error("❌ CardGeneroContent: fichaGenero es null o undefined");

    return (
      <CardContent className="flex-1 overflow-y-auto p-0">
        <div className="p-4">
          <p className="text-muted-foreground text-sm">No se encontraron datos del género.</p>
        </div>
      </CardContent>
    );
  }

  // Memoizar las publicaciones para evitar recálculos
  const publicaciones = useMemo(
    () => fichaGenero.publicacionesOrdenadas || fichaGenero.publicaciones || [],
    [fichaGenero.publicacionesOrdenadas, fichaGenero.publicaciones],
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

  return (
    <CardContent className="flex-1 overflow-y-auto p-0">
      <div className="flex">
        {/* Columna izquierda - Contenido principal */}
        <div className="flex-1">
          <div className="space-y-4 p-4">
            {/* Sinonimia */}
            {fichaGenero.sinonimia && (
              <Card className="">
                <CardHeader>
                  <CardTitle className="text-base">Sinonimia</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: procesarHTML(fichaGenero.sinonimia),
                    }}
                    className="text-muted-foreground text-sm"
                  />
                </CardContent>
              </Card>
            )}

            {/* Etimología */}
            <Card className="">
              <CardHeader>
                <CardTitle className="text-base">Etimología</CardTitle>
              </CardHeader>
              <CardContent>
                {fichaGenero.etimologia ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: procesarHTML(fichaGenero.etimologia),
                    }}
                    className="text-muted-foreground text-sm"
                  />
                ) : (
                  <p className="text-muted-foreground text-sm">No disponible</p>
                )}
              </CardContent>
            </Card>

            {/* Definición */}
            {fichaGenero.definicion && (
              <Card className="">
                <CardHeader>
                  <CardTitle className="text-base">Definición</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: procesarHTML(fichaGenero.definicion),
                    }}
                    className="text-muted-foreground text-sm"
                  />
                </CardContent>
              </Card>
            )}

            {/* Contenido */}
            {fichaGenero.contenido && (
              <Card className="">
                <CardHeader>
                  <CardTitle className="text-base">Contenido</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: procesarHTML(fichaGenero.contenido),
                    }}
                    className="text-muted-foreground text-sm"
                  />
                </CardContent>
              </Card>
            )}

            {/* Distribución */}
            {fichaGenero.distribucion && (
              <Card className="">
                <CardHeader>
                  <CardTitle className="text-base">Distribución</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: procesarHTML(fichaGenero.distribucion),
                    }}
                    className="text-muted-foreground text-sm"
                  />
                </CardContent>
              </Card>
            )}

            {/* Observaciones */}
            {fichaGenero.observaciones && (
              <Card className="">
                <CardHeader>
                  <CardTitle className="text-base">Observaciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: procesarHTML(fichaGenero.observaciones),
                    }}
                    className="text-muted-foreground text-sm"
                  />
                </CardContent>
              </Card>
            )}

            {/* Literatura Citada */}
            <Card className="">
              <CardHeader>
                <CardTitle className="text-base">Literatura Citada</CardTitle>
              </CardHeader>
              <CardContent>
                {fichaGenero.publicaciones && fichaGenero.publicaciones.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-1">
                    {fichaGenero.publicaciones.map((pub: any) => {
                      let citaLarga = pub.publicacion?.cita_larga || null;

                      if (!citaLarga && pub.publicacion?.cita_corta) {
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

                        citaLarga = partes.join(", ");
                      }

                      const citaParaMostrar =
                        citaLarga ||
                        pub.publicacion?.cita ||
                        pub.publicacion?.cita_corta ||
                        "Cita no disponible";

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
                                __html: processHTMLLinks(pub.publicacion.titulo),
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
                  <p className="text-muted-foreground text-sm">No hay publicaciones disponibles</p>
                )}
              </CardContent>
            </Card>

            {/* Referencias Clave */}
            <Card className="">
              <CardHeader>
                <CardTitle className="text-base">Referencias Clave</CardTitle>
              </CardHeader>
              <CardContent>
                {fichaGenero.publicaciones && fichaGenero.publicaciones.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-1">
                    {fichaGenero.publicaciones.map((pub: any) => {
                      let citaLarga = pub.publicacion?.cita_larga || null;

                      if (!citaLarga && pub.publicacion?.cita_corta) {
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

                        citaLarga = partes.join(", ");
                      }

                      const citaParaMostrar =
                        citaLarga ||
                        pub.publicacion?.cita ||
                        pub.publicacion?.cita_corta ||
                        "Cita no disponible";

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
                                __html: processHTMLLinks(pub.publicacion.titulo),
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
                  <p className="text-muted-foreground text-sm">No hay publicaciones disponibles</p>
                )}
              </CardContent>
            </Card>

            {/* Agradecimientos */}
            {fichaGenero.agradecimientos && (
              <Card className="">
                <CardHeader>
                  <CardTitle className="text-base">Agradecimientos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: procesarHTML(fichaGenero.agradecimientos),
                    }}
                    className="text-muted-foreground text-sm"
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </CardContent>
  );
};
