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

  // Literatura citada ordenada alfabéticamente por autor (cita)
  const publicacionesOrdenadas = useMemo<any[]>(
    () => ordenarPublicacionesAlfabeticamente(fichaGenero.publicaciones || []),
    [fichaGenero.publicaciones],
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
                {fichaGenero.sinonimia ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: procesarHTML(fichaGenero.sinonimia),
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
            <Card className="">
              <CardHeader>
                <CardTitle className="text-base">Definición</CardTitle>
              </CardHeader>
              <CardContent>
                {fichaGenero.definicion ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: procesarHTML(fichaGenero.definicion),
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
                {fichaGenero.contenido ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: procesarHTML(fichaGenero.contenido),
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
                {fichaGenero.distribucion ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: procesarHTML(fichaGenero.distribucion),
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
                {fichaGenero.observaciones ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: procesarHTML(fichaGenero.observaciones),
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
                {fichaGenero.agradecimientos ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: procesarHTML(fichaGenero.agradecimientos),
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
