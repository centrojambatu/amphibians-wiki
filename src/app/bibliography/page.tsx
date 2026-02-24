import Link from "next/link";
import { ExternalLink, BookOpen, Users, Link2, Calendar } from "lucide-react";

import getAllPublicaciones, {
  getAñosPublicaciones,
} from "./get-all-publicaciones";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchParams {
  año?: string;
  autor?: string;
  categoria?: string;
  publicacion_cj?: string;
  search?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function BibliographyIndexPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  // Convertir searchParams a filtros
  const filtros = {
    año: params.año ? Number.parseInt(params.año, 10) : undefined,
    autor: params.autor,
    categoria:
      params.categoria === "true"
        ? true
        : params.categoria === "false"
          ? false
          : undefined,
    publicacion_cj:
      params.publicacion_cj === "true"
        ? true
        : params.publicacion_cj === "false"
          ? false
          : undefined,
    search: params.search,
  };

  const publicaciones = await getAllPublicaciones(filtros);
  const años = await getAñosPublicaciones();

  return (
    <div className="bg-background min-h-screen">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Bibliografía</h1>
          <p className="text-muted-foreground">
            Catálogo completo de publicaciones relacionadas con anfibios de
            Ecuador
          </p>
        </div>

        {/* Filtros */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filtros de búsqueda</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              method="GET"
              className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
            >
              <div>
                <label className="text-sm font-medium mb-2 block">Buscar</label>
                <Input
                  name="search"
                  placeholder="Título, autor, cita..."
                  defaultValue={params.search}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Año</label>
                <select
                  name="año"
                  defaultValue={params.año}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Todos los años</option>
                  {años.map((año) => (
                    <option key={año} value={String(año)}>
                      {año}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Categoría
                </label>
                <select
                  name="categoria"
                  defaultValue={params.categoria}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Todas</option>
                  <option value="true">Científica</option>
                  <option value="false">Divulgación</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Publicación CJ
                </label>
                <select
                  name="publicacion_cj"
                  defaultValue={params.publicacion_cj}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Todas</option>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </div>

              <div className="md:col-span-2 lg:col-span-4 flex gap-2">
                <Button type="submit">Aplicar filtros</Button>
                <Button type="reset" variant="outline" asChild>
                  <Link href="/bibliography">Limpiar</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{publicaciones.length}</p>
                  <p className="text-xs text-muted-foreground">Publicaciones</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">
                    {
                      new Set(
                        publicaciones.flatMap((p) =>
                          p.autores.map((a) => a.id_autor),
                        ),
                      ).size
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Autores únicos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">
                    {publicaciones.reduce((sum, p) => sum + p.num_enlaces, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Enlaces externos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{años.length}</p>
                  <p className="text-xs text-muted-foreground">
                    Años diferentes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de publicaciones */}
        <div className="space-y-4">
          {publicaciones.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No se encontraron publicaciones con los filtros seleccionados.
                </p>
              </CardContent>
            </Card>
          ) : (
            publicaciones.map((pub) => {
              const año =
                pub.numero_publicacion_ano || new Date(pub.fecha).getFullYear();

              return (
                <Card
                  key={pub.id_publicacion}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-4">
                      {/* Título y enlace */}
                      <div>
                        <Link
                          href={`/bibliography/${pub.id_publicacion}`}
                          className="text-lg font-semibold hover:text-primary transition-colors"
                        >
                          {pub.titulo && (
                            <span
                              dangerouslySetInnerHTML={{ __html: pub.titulo }}
                            />
                          )}
                        </Link>
                        {pub.titulo_secundario && (
                          <p className="text-sm text-muted-foreground mt-1">
                            <span
                              dangerouslySetInnerHTML={{
                                __html: pub.titulo_secundario,
                              }}
                            />
                          </p>
                        )}
                      </div>

                      {/* Cita */}
                      {pub.cita_corta && (
                        <div className="text-sm text-muted-foreground">
                          <strong>Cita:</strong> {pub.cita_corta} ({año})
                        </div>
                      )}

                      {/* Autores */}
                      {pub.autores.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium">Autores:</span>
                          {pub.autores.map((autor, idx) => (
                            <span
                              key={autor.id_autor}
                              className="text-sm text-muted-foreground"
                            >
                              {autor.nombres} {autor.apellidos}
                              {idx < pub.autores.length - 1 && ","}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Información adicional */}
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        {pub.editorial && (
                          <span>
                            <strong>Editorial:</strong> {pub.editorial}
                          </span>
                        )}
                        {pub.volumen && (
                          <span>
                            <strong>Vol:</strong> {pub.volumen}
                          </span>
                        )}
                        {pub.pagina && (
                          <span>
                            <strong>Págs:</strong> {pub.pagina}
                          </span>
                        )}
                      </div>

                      {/* Enlaces externos */}
                      {pub.enlaces.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {pub.enlaces.map((enlace) => (
                            <a
                              key={enlace.id_publicacion_enlace}
                              href={enlace.enlace}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-primary hover:no-underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {enlace.texto_enlace || "Enlace externo"}
                              {enlace.exclusivo_cj && (
                                <span className="text-xs text-muted-foreground">
                                  (CJ)
                                </span>
                              )}
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Estadísticas */}
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2 border-t">
                        {pub.num_taxones > 0 && (
                          <span>
                            <BookOpen className="inline h-3 w-3 mr-1" />
                            {pub.num_taxones}{" "}
                            {pub.num_taxones === 1 ? "taxón" : "taxones"}
                          </span>
                        )}
                        {pub.num_autores > 0 && (
                          <span>
                            <Users className="inline h-3 w-3 mr-1" />
                            {pub.num_autores}{" "}
                            {pub.num_autores === 1 ? "autor" : "autores"}
                          </span>
                        )}
                        {pub.num_enlaces > 0 && (
                          <span>
                            <Link2 className="inline h-3 w-3 mr-1" />
                            {pub.num_enlaces}{" "}
                            {pub.num_enlaces === 1 ? "enlace" : "enlaces"}
                          </span>
                        )}
                        {pub.publicacion_cj && (
                          <span className="text-primary font-medium">
                            Publicación CJ
                          </span>
                        )}
                        {pub.categoria && (
                          <span className="text-primary font-medium">
                            Científica
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
