"use client";

import {useMemo} from "react";
import Link from "next/link";

import {processHTMLLinks, processHTMLLinksNoUnderline, processCitationReferences} from "@/lib/process-html-links";
import {getBibliographyUrl} from "@/lib/get-bibliography-url";
import {
  buildCitaLargaDesdePublicacion,
  ordenarPublicacionesAlfabeticamente,
  resaltarTituloEnCita,
} from "@/lib/format-cita-publicacion";

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

  // Literatura citada ordenada alfabéticamente por autor (cita)
  const publicacionesOrdenadas = useMemo<any[]>(
    () => ordenarPublicacionesAlfabeticamente(fichaOrden.publicaciones || []),
    [fichaOrden.publicaciones],
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

            {/* Literatura citada */}
            <Card className="">
              <CardHeader>
                <CardTitle className="text-base">Literatura citada</CardTitle>
              </CardHeader>
              <CardContent>
                {publicacionesOrdenadas.length > 0 ? (
                  <div className="space-y-3">
                    {publicacionesOrdenadas.map((pub: any) => {
                      const citaParaMostrar = buildCitaLargaDesdePublicacion(pub);
                      const citaResaltada = resaltarTituloEnCita(
                        citaParaMostrar,
                        pub.publicacion?.titulo,
                        pub.publicacion?.tipo,
                      );

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
                          className="literature-link block px-1 py-1 transition-colors"
                          href={bibliographyUrl}
                        >
                          <p
                            dangerouslySetInnerHTML={{
                              __html: processHTMLLinksNoUnderline(citaResaltada),
                            }}
                            className="text-sm leading-relaxed text-gray-700"
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
