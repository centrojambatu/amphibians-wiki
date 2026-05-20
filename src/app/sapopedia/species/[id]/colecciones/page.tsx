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

  const decodedId = decodeURIComponent(id);
  const sanitizedId = /^\d+$/.test(decodedId) ? decodedId : decodedId.replaceAll("-", " ");

  const fichaEspecie = await getFichaEspecie(sanitizedId);

  if (!fichaEspecie) {
    notFound();
  }

  const pagina = searchParamsResolved.pagina ? Number.parseInt(searchParamsResolved.pagina, 10) : 1;

  const {colecciones, total, totalPaginas, paginaActual} = await getColeccionesPaginadas(
    fichaEspecie.taxon_id,
    pagina,
  );

  const baseUrl = `/sapopedia/species/${encodeURIComponent(id)}/colecciones`;

  // Extraer jerarquía taxonómica del lineage
  const lineage: any[] = fichaEspecie.lineage ?? [];
  const orden = lineage.find((l: any) => l.rank?.rank === "Orden")?.taxon ?? null;
  const familia = lineage.find((l: any) => l.rank?.rank === "Familia")?.taxon ?? null;
  const genero = lineage.find((l: any) => l.rank?.rank === "Género")?.taxon ?? null;
  const especie = lineage.find((l: any) => l.rank?.rank === "especie")?.taxon ?? null;

  const nombreCientifico = genero && especie ? `${genero} ${especie}` : null;
  const nombreComun = (fichaEspecie as any)?.nombresComunes?.nombre_comun_espanol ?? null;

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          className="text-muted-foreground mb-4 inline-block text-sm hover:no-underline"
          href={`/sapopedia/species/${encodeURIComponent(id)}`}
        >
          ← Volver a la ficha de la especie
        </Link>
        <h1 className="mb-1 text-4xl font-bold">Colecciones</h1>
        {nombreCientifico && (
          <p className="text-muted-foreground text-lg italic">{nombreCientifico}</p>
        )}
        {nombreComun && (
          <p className="text-sm text-gray-600">{nombreComun}</p>
        )}

        {/* Clasificación taxonómica condensada (estilo fototeca) */}
        {(orden || familia || genero) && (
          <p className="mt-0.5 text-xs text-gray-400">
            {[orden, familia, genero].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>

      {/* Contador */}
      <div className="text-muted-foreground mb-6 text-sm">
        Mostrando {colecciones.length} de {total} colecciones
        {totalPaginas > 1 && ` (Página ${paginaActual} de ${totalPaginas})`}
      </div>

      {/* Lista de colecciones */}
      {colecciones.length > 0 ? (
        <div className="mb-8 flex flex-col gap-1.5">
          {colecciones.map((coleccion: ColeccionCompleta) => {
            const coleccionUrl = `${baseUrl}/${coleccion.id_coleccion}`;
            const fecha = coleccion.fecha_coleccion
              ? (() => {
                  const d = new Date(coleccion.fecha_coleccion);
                  const day = String(d.getDate()).padStart(2, "0");
                  const month = d.toLocaleDateString("es-ES", {month: "long"});
                  return `${day} ${month} ${d.getFullYear()}`;
                })()
              : null;

            const acronimo = coleccion.catalogo_museo?.includes(" - ")
              ? coleccion.catalogo_museo.split(" - ").pop()
              : coleccion.catalogo_museo;
            const catalogoLabel = [acronimo, coleccion.num_museo].filter(Boolean).join(" ");

            const localidad = [coleccion.detalle_localidad, coleccion.provincia]
              .filter(Boolean)
              .join(", ");

            const coordenadas =
              coleccion.latitud != null && coleccion.longitud != null
                ? `${coleccion.latitud}, ${coleccion.longitud}`
                : null;

            const colectorLabel =
              coleccion.colectores ||
              [coleccion.personal_nombre, coleccion.personal_siglas && `(${coleccion.personal_siglas})`]
                .filter(Boolean)
                .join(" ") ||
              null;

            const metaParts = [
              coleccion.estadio,
              coleccion.numero_individuos != null
                ? `${String(coleccion.numero_individuos)} indiv.`
                : null,
              coleccion.estado,
            ].filter(Boolean) as string[];

            return (
              <Link key={coleccion.id_coleccion} className="block w-full no-underline" href={coleccionUrl}>
                <Card className="hover:bg-muted/30 w-full cursor-pointer gap-0 border py-0 transition-colors">
                  <CardContent className="flex w-full flex-col gap-0.5 px-3 py-2">
                    {/* Fila 0: fecha arriba */}
                    {fecha && (
                      <p className="text-[11px] font-semibold whitespace-nowrap text-gray-600">
                        {fecha}
                      </p>
                    )}

                    {/* Fila 1: catálogo + N° Campo + GUI · chevron */}
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      {catalogoLabel && (
                        <p className="text-[13px] font-bold leading-tight">{catalogoLabel}</p>
                      )}
                      {coleccion.sc && (
                        <p className="text-[11px] leading-tight text-gray-500">
                          N° Campo: <span className="font-medium text-gray-700">{coleccion.sc}</span>
                        </p>
                      )}
                      {coleccion.gui && (
                        <p className="text-[11px] leading-tight text-gray-500">
                          GUI:{" "}
                          <span className="font-mono font-medium text-gray-700">
                            {coleccion.gui}
                          </span>
                        </p>
                      )}
                      <span className="ml-auto text-gray-400">›</span>
                    </div>

                    {/* Fila 2: localidad · coordenadas | altitud */}
                    {(localidad || coordenadas || coleccion.altitud != null) && (
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[12px] leading-snug text-gray-700">
                        {localidad && <span>{localidad}</span>}
                        {(coordenadas || coleccion.altitud != null) && (
                          <span className="font-mono text-[10px] text-gray-400">
                            {coordenadas}
                            {coordenadas && coleccion.altitud != null && (
                              <span
                                className="mx-1.5 font-semibold"
                                style={{color: "#f07304"}}
                              >
                                |
                              </span>
                            )}
                            {coleccion.altitud != null && `${coleccion.altitud} msnm`}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Fila 3: colectores · estadio · n. indiv · estado */}
                    {(colectorLabel || metaParts.length > 0) && (
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[11px] text-gray-500">
                        {colectorLabel && (
                          <span>
                            <span className="text-gray-400">Colector:</span>{" "}
                            <span className="text-gray-700">{colectorLabel}</span>
                          </span>
                        )}
                        {metaParts.length > 0 && (
                          <span className="text-gray-500">{metaParts.join(" · ")}</span>
                        )}
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
