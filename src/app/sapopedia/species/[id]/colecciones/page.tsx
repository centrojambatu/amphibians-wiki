import type {ColeccionCompleta} from "../get-colecciones-especie";

import {notFound} from "next/navigation";
import Link from "next/link";

import {Card, CardContent} from "@/components/ui/card";
import Pagination from "@/components/pagination";

import getFichaEspecie from "../get-ficha-especie";

import getColeccionesPaginadas from "./get-colecciones-paginadas";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    pagina?: string;
  }>;
}

export default async function ColeccionesPage({params, searchParams}: PageProps) {
  const {id} = await params;
  const searchParamsResolved = await searchParams;

  // Decodificar el id de la URL
  const decodedId = decodeURIComponent(id);

  // Si es un número (id_ficha_especie), usarlo directamente
  // Si no es un número (nombre científico con guiones), reemplazar guiones por espacios
  const sanitizedId = /^\d+$/.test(decodedId) ? decodedId : decodedId.replaceAll("-", " ");

  const fichaEspecie = await getFichaEspecie(sanitizedId);

  if (!fichaEspecie) {
    notFound();
  }

  const pagina = searchParamsResolved.pagina ? Number.parseInt(searchParamsResolved.pagina, 10) : 1;

  const nombreCientifico = fichaEspecie.taxones?.[0]?.taxon
    ? `${fichaEspecie.taxones[0].taxonPadre?.taxon || ""} ${fichaEspecie.taxones[0].taxon}`.trim()
    : undefined;

  const {colecciones, total, totalPaginas, paginaActual} = await getColeccionesPaginadas(
    fichaEspecie.taxon_id,
    nombreCientifico,
    pagina,
  );

  // Construir la URL base para la paginación
  const baseUrl = `/sapopedia/species/${encodeURIComponent(id)}/colecciones`;

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          className="text-muted-foreground mb-2 inline-block text-sm hover:no-underline"
          href={`/sapopedia/species/${encodeURIComponent(id)}`}
        >
          ← Volver a la ficha de la especie
        </Link>
        <h1 className="mb-2 text-4xl font-bold">Colecciones</h1>
        <p className="text-muted-foreground text-lg">
          {fichaEspecie.taxones?.[0]?.taxonPadre?.taxon || ""}{" "}
          {fichaEspecie.taxones?.[0]?.taxon || ""}
        </p>
      </div>

      {/* Información de resultados */}
      <div className="text-muted-foreground mb-6 text-sm">
        Mostrando {colecciones.length} de {total} colecciones
        {totalPaginas > 1 && ` (Página ${paginaActual} de ${totalPaginas})`}
      </div>

      {/* Lista de colecciones */}
      {colecciones.length > 0 ? (
        <div className="mb-8 flex flex-col gap-4">
          {colecciones.map((coleccion: ColeccionCompleta) => {
            const coleccionUrl = `${baseUrl}/${coleccion.id_coleccion}`;

            return (
              <Link
                key={coleccion.id_coleccion}
                className="coleccion-link block"
                href={coleccionUrl}
              >
                <Card className="hover:bg-muted/50 cursor-pointer border transition-colors">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {/* Información básica */}
                      <div className="space-y-2">
                        {coleccion.num_colector && (
                          <div>
                            <span className="text-muted-foreground text-xs font-semibold">
                              Número Colector:
                            </span>{" "}
                            <span className="text-sm">{coleccion.num_colector}</span>
                          </div>
                        )}
                        {coleccion.sc && (
                          <div>
                            <span className="text-muted-foreground text-xs font-semibold">SC:</span>{" "}
                            <span className="text-sm">{coleccion.sc}</span>
                          </div>
                        )}
                        {coleccion.num_museo && (
                          <div>
                            <span className="text-muted-foreground text-xs font-semibold">
                              Número Museo:
                            </span>{" "}
                            <span className="text-sm">{coleccion.num_museo}</span>
                          </div>
                        )}
                        {coleccion.fecha_col && (
                          <div>
                            <span className="text-muted-foreground text-xs font-semibold">
                              Fecha Colección:
                            </span>{" "}
                            <span className="text-sm">
                              {new Date(coleccion.fecha_col).toLocaleDateString("es-ES")}
                            </span>
                          </div>
                        )}
                        {coleccion.colectores && (
                          <div>
                            <span className="text-muted-foreground text-xs font-semibold">
                              Colectores:
                            </span>{" "}
                            <span className="text-sm">{coleccion.colectores}</span>
                          </div>
                        )}
                      </div>

                      {/* Información de localidad */}
                      <div className="space-y-2">
                        {coleccion.provincia && (
                          <div>
                            <span className="text-muted-foreground text-xs font-semibold">
                              Provincia:
                            </span>{" "}
                            <span className="text-sm">{coleccion.provincia}</span>
                          </div>
                        )}
                        {coleccion.detalle_localidad && (
                          <div>
                            <span className="text-muted-foreground text-xs font-semibold">
                              Localidad:
                            </span>{" "}
                            <span className="text-sm">{coleccion.detalle_localidad}</span>
                          </div>
                        )}
                        {coleccion.campobase_localidad && (
                          <div>
                            <span className="text-muted-foreground text-xs font-semibold">
                              Campo Base:
                            </span>{" "}
                            <span className="text-sm">{coleccion.campobase_localidad}</span>
                          </div>
                        )}
                        {coleccion.altitud !== null && (
                          <div>
                            <span className="text-muted-foreground text-xs font-semibold">
                              Altitud:
                            </span>{" "}
                            <span className="text-sm">{coleccion.altitud} m</span>
                          </div>
                        )}
                        {coleccion.numero_individuos !== null && (
                          <div>
                            <span className="text-muted-foreground text-xs font-semibold">
                              Individuos:
                            </span>{" "}
                            <span className="text-sm">{coleccion.numero_individuos}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Observaciones si existen */}
                    {coleccion.observacion && (
                      <div className="mt-4 border-t pt-4">
                        <span className="text-muted-foreground text-xs font-semibold">
                          Observaciones:
                        </span>{" "}
                        <span className="text-sm">{coleccion.observacion}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="bg-card mb-8 rounded-lg border p-8 text-center">
          <p className="text-muted-foreground">No hay colecciones disponibles para esta especie.</p>
        </div>
      )}

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="mt-8">
          <Pagination
            baseUrl={baseUrl}
            paginaActual={paginaActual}
            searchParams={searchParamsResolved}
            totalPaginas={totalPaginas}
          />
        </div>
      )}
    </main>
  );
}
