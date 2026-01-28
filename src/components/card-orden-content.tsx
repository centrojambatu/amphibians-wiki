"use client";

import {useMemo} from "react";
import Link from "next/link";

import {processHTMLLinks, processHTMLLinksNoUnderline, processCitationReferences} from "@/lib/process-html-links";
import {getBibliographyUrl} from "@/lib/get-bibliography-url";

import {Card, CardContent, CardHeader, CardTitle} from "./ui/card";

interface CardOrdenContentProps {
  fichaOrden: any;
}

export const CardOrdenContent = ({fichaOrden}: CardOrdenContentProps) => {
  // Validar que fichaOrden existe
  if (!fichaOrden) {
    console.error("❌ CardOrdenContent: fichaOrden es null o undefined");

    return (
      <CardContent className="flex-1 overflow-y-auto p-0">
        <div className="p-4">
          <p className="text-muted-foreground text-sm">No se encontraron datos del orden.</p>
        </div>
      </CardContent>
    );
  }

  // Memoizar las publicaciones para evitar recálculos
  const publicaciones = useMemo(
    () => fichaOrden.publicacionesOrdenadas || fichaOrden.publicaciones || [],
    [fichaOrden.publicacionesOrdenadas, fichaOrden.publicaciones],
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
            <Card className="">
              <CardHeader>
                <CardTitle className="text-base">Sinonimia</CardTitle>
              </CardHeader>
              <CardContent>
                {fichaOrden.sinonimia ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: procesarHTML(fichaOrden.sinonimia),
                    }}
                    className="text-muted-foreground text-sm"
                  />
                ) : (
                  <p className="text-muted-foreground text-sm">No disponible</p>
                )}
              </CardContent>
            </Card>

            {/* Etimología */}
            <Card className="">
              <CardHeader>
                <CardTitle className="text-base">Etimología</CardTitle>
              </CardHeader>
              <CardContent>
                {fichaOrden.etimologia ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: procesarHTML(fichaOrden.etimologia),
                    }}
                    className="text-muted-foreground text-sm"
                  />
                ) : (
                  <p className="text-muted-foreground text-sm">No disponible</p>
                )}
              </CardContent>
            </Card>

            {/* Definición */}
            <Card className="">
              <CardHeader>
                <CardTitle className="text-base">Definición</CardTitle>
              </CardHeader>
              <CardContent>
                {fichaOrden.definicion ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: procesarHTML(fichaOrden.definicion),
                    }}
                    className="text-muted-foreground text-sm"
                  />
                ) : (
                  <p className="text-muted-foreground text-sm">No disponible</p>
                )}
              </CardContent>
            </Card>

            {/* Contenido */}
            <Card className="">
              <CardHeader>
                <CardTitle className="text-base">Contenido</CardTitle>
              </CardHeader>
              <CardContent>
                {fichaOrden.contenido ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: procesarHTML(fichaOrden.contenido),
                    }}
                    className="text-muted-foreground text-sm"
                  />
                ) : (
                  <p className="text-muted-foreground text-sm">No disponible</p>
                )}
              </CardContent>
            </Card>

            {/* Distribución */}
            <Card className="">
              <CardHeader>
                <CardTitle className="text-base">Distribución</CardTitle>
              </CardHeader>
              <CardContent>
                {fichaOrden.distribucion ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: procesarHTML(fichaOrden.distribucion),
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
                {fichaOrden.observaciones ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: procesarHTML(fichaOrden.observaciones),
                    }}
                    className="text-muted-foreground text-sm"
                  />
                ) : (
                  <p className="text-muted-foreground text-sm">No disponible</p>
                )}
              </CardContent>
            </Card>

            {/* Literatura Citada */}
            <Card className="">
              <CardHeader>
                <CardTitle className="text-base">Literatura Citada</CardTitle>
              </CardHeader>
              <CardContent>
                {fichaOrden.publicaciones && fichaOrden.publicaciones.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-1">
                    {fichaOrden.publicaciones.map((pub: any) => {
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
                              dangerouslySetInnerHTML={{
                                __html: processHTMLLinksNoUnderline(pub.publicacion.titulo),
                              }}
                              className="hover:text-primary text-sm font-medium"
                            />
                          )}
                          <div
                            dangerouslySetInnerHTML={{
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

            {/* Agradecimientos */}
            <Card className="">
              <CardHeader>
                <CardTitle className="text-base">Agradecimientos</CardTitle>
              </CardHeader>
              <CardContent>
                {fichaOrden.agradecimientos ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: procesarHTML(fichaOrden.agradecimientos),
                    }}
                    className="text-muted-foreground text-sm"
                  />
                ) : (
                  <p className="text-muted-foreground text-sm">No disponible</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CardContent>
  );
};
