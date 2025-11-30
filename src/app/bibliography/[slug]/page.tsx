import {notFound} from "next/navigation";
import Link from "next/link";
import {ExternalLink, BookOpen, Users} from "lucide-react";

import getPublicacionBySlug, {getAllPublicacionesWithSlugs} from "../get-publicacion-by-slug";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

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
  const año =
    publicacion.numero_publicacion_ano ||
    new Date(publicacion.fecha).getFullYear();

  return (
    <div className="bg-background min-h-screen">
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <article className="prose prose-lg max-w-none dark:prose-invert">
          {/* Título principal */}
          <h1 className="text-3xl font-bold mb-4">
            {publicacion.titulo && (
              <span
                dangerouslySetInnerHTML={{__html: publicacion.titulo}}
              />
            )}
          </h1>

          {publicacion.titulo_secundario && (
            <h2 className="text-xl text-muted-foreground mb-6">
              <span
                dangerouslySetInnerHTML={{
                  __html: publicacion.titulo_secundario,
                }}
              />
            </h2>
          )}

          {/* Cita completa */}
          <div className="mb-8 p-6 bg-muted rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Cita completa</h2>
            {publicacion.cita_larga ? (
              <div
                className="text-base leading-relaxed"
                dangerouslySetInnerHTML={{__html: publicacion.cita_larga}}
              />
            ) : publicacion.cita ? (
              <div
                className="text-base leading-relaxed"
                dangerouslySetInnerHTML={{__html: publicacion.cita}}
              />
            ) : (
              <p className="text-muted-foreground">Cita no disponible</p>
            )}
          </div>

          {/* Información bibliográfica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="font-semibold mb-2">Información bibliográfica</h3>
              <dl className="space-y-2 text-sm">
                {publicacion.cita_corta && (
                  <>
                    <dt className="font-medium">Cita corta:</dt>
                    <dd className="text-muted-foreground">
                      {publicacion.cita_corta}
                    </dd>
                  </>
                )}

                {año && (
                  <>
                    <dt className="font-medium">Año:</dt>
                    <dd className="text-muted-foreground">{año}</dd>
                  </>
                )}

                {publicacion.editorial && (
                  <>
                    <dt className="font-medium">Editorial/Revista:</dt>
                    <dd className="text-muted-foreground">
                      {publicacion.editorial}
                    </dd>
                  </>
                )}

                {publicacion.volumen && (
                  <>
                    <dt className="font-medium">Volumen:</dt>
                    <dd className="text-muted-foreground">
                      {publicacion.volumen}
                    </dd>
                  </>
                )}

                {publicacion.numero && (
                  <>
                    <dt className="font-medium">Número:</dt>
                    <dd className="text-muted-foreground">
                      {publicacion.numero}
                    </dd>
                  </>
                )}

                {publicacion.pagina && (
                  <>
                    <dt className="font-medium">Páginas:</dt>
                    <dd className="text-muted-foreground">
                      {publicacion.pagina}
                    </dd>
                  </>
                )}

                {publicacion.fecha && (
                  <>
                    <dt className="font-medium">Fecha:</dt>
                    <dd className="text-muted-foreground">
                      {new Date(publicacion.fecha).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </dd>
                  </>
                )}
              </dl>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Detalles adicionales</h3>
              <dl className="space-y-2 text-sm">
                {publicacion.palabras_clave && (
                  <>
                    <dt className="font-medium">Palabras clave:</dt>
                    <dd className="text-muted-foreground">
                      {publicacion.palabras_clave}
                    </dd>
                  </>
                )}

                {publicacion.publicacion_cj && (
                  <>
                    <dt className="font-medium">Publicación CJ:</dt>
                    <dd className="text-muted-foreground">Sí</dd>
                  </>
                )}

                {publicacion.categoria && (
                  <>
                    <dt className="font-medium">Categoría:</dt>
                    <dd className="text-muted-foreground">
                      {publicacion.categoria ? "Científica" : "Divulgación"}
                    </dd>
                  </>
                )}

                {publicacion.editor && (
                  <>
                    <dt className="font-medium">Tipo:</dt>
                    <dd className="text-muted-foreground">
                      {publicacion.editor ? "Editor" : "Autor"}
                    </dd>
                  </>
                )}
              </dl>
            </div>
          </div>

          {/* Resumen */}
          {publicacion.resumen && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Resumen</h3>
              <div
                className="prose dark:prose-invert"
                dangerouslySetInnerHTML={{__html: publicacion.resumen}}
              />
            </div>
          )}

          {/* Observaciones */}
          {publicacion.observaciones && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Observaciones</h3>
              <div
                className="prose dark:prose-invert"
                dangerouslySetInnerHTML={{__html: publicacion.observaciones}}
              />
            </div>
          )}

          {/* Enlaces externos */}
          {publicacion.enlaces && publicacion.enlaces.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl">Enlaces externos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {publicacion.enlaces.map((enlace) => (
                    <a
                      key={enlace.id_publicacion_enlace}
                      href={enlace.enlace}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>{enlace.texto_enlace || "Enlace externo"}</span>
                      {enlace.exclusivo_cj && (
                        <span className="text-xs text-muted-foreground">(CJ)</span>
                      )}
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Autores */}
          {publicacion.autores && publicacion.autores.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Autores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {publicacion.autores.map((autor) => (
                    <div key={autor.id_autor} className="text-sm">
                      {autor.nombres} {autor.apellidos}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Taxones relacionados */}
          {publicacion.taxones && publicacion.taxones.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Taxones relacionados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {publicacion.taxones.map((taxon) => {
                    // Usar id_ficha_especie si está disponible, sino usar nombre científico completo
                    // Priorizar id_ficha_especie, luego nombre científico completo, finalmente id_taxon
                    let href = `/sapopedia/species/${taxon.id_taxon}`;
                    if (taxon.id_ficha_especie) {
                      href = `/sapopedia/species/${taxon.id_ficha_especie}`;
                    } else if (taxon.nombre_cientifico_completo) {
                      href = `/sapopedia/species/${taxon.nombre_cientifico_completo.replaceAll(" ", "-")}`;
                    }

                    const displayName = taxon.nombre_cientifico_completo || taxon.taxon;

                    return (
                      <Link
                        key={taxon.id_taxon}
                        href={href}
                        className="inline-block rounded-md bg-muted px-3 py-1 text-sm hover:bg-muted/80 transition-colors italic"
                      >
                        {displayName}
                        {taxon.principal && (
                          <span className="ml-2 text-xs text-muted-foreground not-italic">
                            (principal)
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </article>
      </main>
    </div>
  );
}

