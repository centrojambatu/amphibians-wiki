import {notFound} from "next/navigation";
import {ExternalLink, Users} from "lucide-react";

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

import getPublicacionBySlug, {getAllPublicacionesWithSlugs} from "../get-publicacion-by-slug";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Revalidar cada 24 horas
export const revalidate = 86400;

// Generar parámetros estáticos para todas las publicaciones
// En desarrollo, Next.js generará las rutas bajo demanda
export async function generateStaticParams() {
  try {
    const publicaciones = await getAllPublicacionesWithSlugs();

    // Limitar a las primeras 100 en desarrollo para evitar builds lentos
    const limit = process.env.NODE_ENV === "development" ? 100 : undefined;
    const publicacionesLimitadas = limit ? publicaciones.slice(0, limit) : publicaciones;

    return publicacionesLimitadas.map((pub) => ({
      slug: pub.slug,
    }));
  } catch (error) {
    console.error("Error en generateStaticParams:", error);

    return [];
  }
}

export default async function BibliographyPage({params}: PageProps) {
  const {slug} = await params;

  const publicacion = await getPublicacionBySlug(slug);

  if (!publicacion) {
    notFound();
  }

  // Extraer año
  const año = publicacion.numero_publicacion_ano || new Date(publicacion.fecha).getFullYear();

  return (
    <div className="bg-background min-h-screen">
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <article className="prose prose-lg dark:prose-invert max-w-none">
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
          <div className="bg-muted mb-6 rounded-lg p-4">
            <h2 className="mb-2 text-lg font-semibold">Cita completa</h2>
            {publicacion.cita_larga ? (
              <div
                dangerouslySetInnerHTML={{__html: publicacion.cita_larga}}
                className="text-sm leading-normal"
              />
            ) : publicacion.cita ? (
              <div
                dangerouslySetInnerHTML={{__html: publicacion.cita}}
                className="text-sm leading-normal"
              />
            ) : (
              <p className="text-muted-foreground text-sm">Cita no disponible</p>
            )}
          </div>

          {/* Información bibliográfica */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Información bibliográfica</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2 text-sm">
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

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Detalles adicionales</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2 text-sm">
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
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl">Resumen</CardTitle>
            </CardHeader>
            <CardContent>
              {publicacion.resumen ? (
                <div
                  dangerouslySetInnerHTML={{__html: publicacion.resumen}}
                  className="prose dark:prose-invert"
                />
              ) : (
                <p className="text-muted-foreground">No disponible</p>
              )}
            </CardContent>
          </Card>

          {/* Observaciones */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl">Observaciones</CardTitle>
            </CardHeader>
            <CardContent>
              {publicacion.observaciones ? (
                <div
                  dangerouslySetInnerHTML={{__html: publicacion.observaciones}}
                  className="prose dark:prose-invert"
                />
              ) : (
                <p className="text-muted-foreground">No disponible</p>
              )}
            </CardContent>
          </Card>

          {/* Enlaces externos */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl">Enlaces externos</CardTitle>
            </CardHeader>
            <CardContent>
              {publicacion.enlaces && publicacion.enlaces.length > 0 ? (
                <div className="space-y-2">
                  {publicacion.enlaces.map((enlace) => (
                    <a
                      key={enlace.id_publicacion_enlace}
                      className="text-primary flex items-center gap-2 hover:underline"
                      href={enlace.enlace}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>{enlace.texto_enlace || "Enlace externo"}</span>
                      {enlace.exclusivo_cj && (
                        <span className="text-muted-foreground text-xs">(CJ)</span>
                      )}
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No disponible</p>
              )}
            </CardContent>
          </Card>

          {/* Autores */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="h-5 w-5" />
                Autores
              </CardTitle>
            </CardHeader>
            <CardContent>
              {publicacion.autores && publicacion.autores.length > 0 ? (
                <div className="space-y-2">
                  {publicacion.autores.map((autor) => (
                    <div key={autor.id_autor} className="text-sm">
                      {autor.nombres} {autor.apellidos}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No disponible</p>
              )}
            </CardContent>
          </Card>
        </article>
      </main>
    </div>
  );
}
