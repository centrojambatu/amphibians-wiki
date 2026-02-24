import {notFound} from "next/navigation";
import Link from "next/link";
import {ArrowLeft, ExternalLink, Users} from "lucide-react";

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import CopyButton from "@/components/copy-button";

import getPublicacionById, {getAllPublicacionIds} from "../get-publicacion-by-id";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

// Revalidar cada 24 horas
export const revalidate = 86400;

// Generar parámetros estáticos para todas las publicaciones
export async function generateStaticParams() {
  try {
    const publicaciones = await getAllPublicacionIds();

    // Limitar a las primeras 100 en desarrollo para evitar builds lentos
    const limit = process.env.NODE_ENV === "development" ? 100 : undefined;
    const publicacionesLimitadas = limit ? publicaciones.slice(0, limit) : publicaciones;

    return publicacionesLimitadas;
  } catch (error) {
    console.error("Error en generateStaticParams:", error);
    return [];
  }
}

export default async function BibliographyPage({params}: PageProps) {
  const {id} = await params;
  const idNumber = Number.parseInt(id, 10);

  if (Number.isNaN(idNumber) || idNumber <= 0) {
    notFound();
  }

  const publicacion = await getPublicacionById(idNumber);

  if (!publicacion) {
    notFound();
  }

  // Extraer año
  const año = publicacion.numero_publicacion_ano || new Date(publicacion.fecha).getFullYear();

  return (
    <div className="bg-background min-h-screen">
      <main className="container mx-auto px-4 py-8">
        {/* Botón de regreso */}
        <div className="mb-6">
          <Link href="/sapoteca">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver a la Biblioteca
            </Button>
          </Link>
        </div>

        <article className="prose prose-lg max-w-none">
          {/* Título principal */}
          <h1 className="mb-2 text-2xl font-bold">
            {publicacion.titulo ? (
              <span dangerouslySetInnerHTML={{__html: publicacion.titulo}} />
            ) : (
              <span className="text-muted-foreground">No disponible</span>
            )}
          </h1>

          <h2 className="text-muted-foreground mb-4 text-base">
            {publicacion.titulo_secundario ? (
              <span
                dangerouslySetInnerHTML={{
                  __html: publicacion.titulo_secundario,
                }}
              />
            ) : (
              <span>No disponible</span>
            )}
          </h2>

          {/* Cita completa */}
          <div className="bg-muted mb-4 overflow-hidden rounded-xl border shadow-sm py-2 gap-2">
            <div className="px-3 py-1 flex items-center justify-between">
              <h2 className="text-base font-semibold">Cita completa</h2>
              {(publicacion.cita_larga || publicacion.cita) && (
                <CopyButton text={publicacion.cita_larga || publicacion.cita || ""} />
              )}
            </div>
            <div className="px-3 pb-0.5 pt-1">
              {publicacion.cita_larga ? (
                <div
                  dangerouslySetInnerHTML={{__html: publicacion.cita_larga}}
                  className="text-xs leading-relaxed"
                />
              ) : publicacion.cita ? (
                <div
                  dangerouslySetInnerHTML={{__html: publicacion.cita}}
                  className="text-xs leading-relaxed"
                />
              ) : (
                <p className="text-muted-foreground text-xs">Cita no disponible</p>
              )}
            </div>
          </div>

          {/* Información bibliográfica */}
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className="overflow-hidden transition-all hover:shadow-md py-2 gap-2">
              <CardHeader className="px-3 py-1">
                <CardTitle className="text-base font-semibold">Información bibliográfica</CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-0.5 pt-1">
                <dl className="space-y-1 text-xs leading-tight">
                  <dt className="font-medium">Cita corta:</dt>
                  <dd className="text-muted-foreground">
                    {publicacion.cita_corta || "No disponible"}
                  </dd>

                  <dt className="font-medium">Año:</dt>
                  <dd className="text-muted-foreground">{año || "No disponible"}</dd>

                  <dt className="font-medium">Editorial/Revista:</dt>
                  <dd className="text-muted-foreground">
                    {publicacion.editorial || "No disponible"}
                  </dd>

                  <dt className="font-medium">Volumen:</dt>
                  <dd className="text-muted-foreground">
                    {publicacion.volumen || "No disponible"}
                  </dd>

                  <dt className="font-medium">Número:</dt>
                  <dd className="text-muted-foreground">{publicacion.numero || "No disponible"}</dd>

                  <dt className="font-medium">Páginas:</dt>
                  <dd className="text-muted-foreground">{publicacion.pagina || "No disponible"}</dd>

                  <dt className="font-medium">Fecha:</dt>
                  <dd className="text-muted-foreground">
                    {publicacion.fecha
                      ? new Date(publicacion.fecha).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "No disponible"}
                  </dd>
                </dl>
              </CardContent>
            </Card>

            <Card className="overflow-hidden transition-all hover:shadow-md py-2 gap-2">
              <CardHeader className="px-3 py-1">
                <CardTitle className="text-base font-semibold">Detalles adicionales</CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-0.5 pt-1">
                <dl className="space-y-1 text-xs leading-tight">
                  <dt className="font-medium">Palabras clave:</dt>
                  <dd className="text-muted-foreground">
                    {publicacion.palabras_clave || "No disponible"}
                  </dd>

                  <dt className="font-medium">Publicación CJ:</dt>
                  <dd className="text-muted-foreground">
                    {publicacion.publicacion_cj ? "Sí" : "No"}
                  </dd>

                  <dt className="font-medium">Categoría:</dt>
                  <dd className="text-muted-foreground">
                    {publicacion.categoria !== null && publicacion.categoria !== undefined
                      ? publicacion.categoria
                        ? "Científica"
                        : "Divulgación"
                      : "No disponible"}
                  </dd>

                  <dt className="font-medium">Tipo:</dt>
                  <dd className="text-muted-foreground">
                    {publicacion.editor !== null && publicacion.editor !== undefined
                      ? publicacion.editor
                        ? "Editor"
                        : "Autor"
                      : "No disponible"}
                  </dd>
                </dl>
              </CardContent>
            </Card>
          </div>

          {/* Resumen */}
          <Card className="mb-4 overflow-hidden transition-all hover:shadow-md py-2 gap-2">
            <CardHeader className="px-3 py-1">
              <CardTitle className="text-base font-semibold">Resumen</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-0.5 pt-1">
              {publicacion.resumen ? (
                <div
                  dangerouslySetInnerHTML={{__html: publicacion.resumen}}
                  className="text-xs leading-relaxed prose prose-sm max-w-none"
                />
              ) : (
                <p className="text-muted-foreground text-xs">No disponible</p>
              )}
            </CardContent>
          </Card>

          {/* Observaciones */}
          <Card className="mb-4 overflow-hidden transition-all hover:shadow-md py-2 gap-2">
            <CardHeader className="px-3 py-1">
              <CardTitle className="text-base font-semibold">Observaciones</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-0.5 pt-1">
              {publicacion.observaciones ? (
                <div
                  dangerouslySetInnerHTML={{__html: publicacion.observaciones}}
                  className="text-xs leading-relaxed prose prose-sm max-w-none"
                />
              ) : (
                <p className="text-muted-foreground text-xs">No disponible</p>
              )}
            </CardContent>
          </Card>

          {/* Enlaces externos */}
          <Card className="mb-4 overflow-hidden transition-all hover:shadow-md py-2 gap-2">
            <CardHeader className="px-3 py-1">
              <CardTitle className="text-base font-semibold">Enlaces externos</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-0.5 pt-1">
              {publicacion.enlaces && publicacion.enlaces.length > 0 ? (
                <div className="space-y-1">
                  {publicacion.enlaces.map((enlace) => (
                    <a
                      key={enlace.id_publicacion_enlace}
                      className="text-primary flex items-center gap-1.5 hover:no-underline text-xs"
                      href={enlace.enlace}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>{enlace.texto_enlace || "Enlace externo"}</span>
                      {enlace.exclusivo_cj && (
                        <span className="text-muted-foreground text-[10px]">(CJ)</span>
                      )}
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-xs">No disponible</p>
              )}
            </CardContent>
          </Card>

          {/* Autores */}
          <Card className="mb-4 overflow-hidden transition-all hover:shadow-md py-2 gap-2">
            <CardHeader className="px-3 py-1">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Users className="h-4 w-4" />
                Autores
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-0.5 pt-1">
              {publicacion.autores && publicacion.autores.length > 0 ? (
                <div className="space-y-1">
                  {publicacion.autores.map((autor) => (
                    <div key={autor.id_autor} className="text-xs leading-tight">
                      {autor.nombres} {autor.apellidos}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-xs">No disponible</p>
              )}
            </CardContent>
          </Card>
        </article>
      </main>
    </div>
  );
}
