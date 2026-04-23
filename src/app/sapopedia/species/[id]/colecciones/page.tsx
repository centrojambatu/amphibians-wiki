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
          <p className="text-muted-foreground mb-4 text-lg italic">{nombreCientifico}</p>
        )}

        {/* Clasificación taxonómica */}
        {(orden || familia || genero) && (
          <div className="flex flex-wrap gap-3">
            {orden && (
              <div className="bg-muted rounded-md px-3 py-1.5">
                <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wide">
                  Orden
                </span>
                <p className="text-sm font-medium">{orden}</p>
              </div>
            )}
            {familia && (
              <div className="bg-muted rounded-md px-3 py-1.5">
                <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wide">
                  Familia
                </span>
                <p className="text-sm font-medium">{familia}</p>
              </div>
            )}
            {genero && (
              <div className="bg-muted rounded-md px-3 py-1.5">
                <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wide">
                  Género
                </span>
                <p className="text-sm font-medium italic">{genero}</p>
              </div>
            )}
            {especie && (
              <div className="bg-muted rounded-md px-3 py-1.5">
                <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wide">
                  Especie
                </span>
                <p className="text-sm font-medium italic">{especie}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contador */}
      <div className="text-muted-foreground mb-6 text-sm">
        Mostrando {colecciones.length} de {total} colecciones
        {totalPaginas > 1 && ` (Página ${paginaActual} de ${totalPaginas})`}
      </div>

      {/* Lista de colecciones */}
      {colecciones.length > 0 ? (
        <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {colecciones.map((coleccion: ColeccionCompleta) => {
            const coleccionUrl = `${baseUrl}/${coleccion.id_coleccion}`;
            const fecha = coleccion.fecha_coleccion
              ? (() => {
                  const d = new Date(coleccion.fecha_coleccion);
                  const day = String(d.getDate()).padStart(2, "0");
                  const month = d.toLocaleDateString("es-ES", {month: "long"});
                  return `${day} ${month.charAt(0).toUpperCase() + month.slice(1)} de ${d.getFullYear()}`;
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

            return (
              <Link key={coleccion.id_coleccion} className="block h-full" href={coleccionUrl}>
                <Card className="hover:bg-muted/30 h-full cursor-pointer border transition-colors">
                  <CardContent className="flex flex-col gap-1 px-3 py-3">
                    {/* Identificador — más prominente */}
                    {catalogoLabel && (
                      <p className="text-[13px] font-bold leading-tight">{catalogoLabel}</p>
                    )}

                    {/* Número de campo */}
                    {coleccion.sc && (
                      <p className="text-[11px] leading-tight text-gray-500">
                        <span className="font-medium">N° Campo:</span> {coleccion.sc}
                      </p>
                    )}

                    {/* Nombre científico */}
                    {nombreCientifico && (
                      <p className="text-[11px] italic leading-tight" style={{color: "#f07304"}}>
                        {nombreCientifico}
                      </p>
                    )}

                    {/* Taxonomía — muy pequeño, separado visualmente */}
                    {(orden || familia) && (
                      <p className="text-[10px] tracking-wide text-gray-400 uppercase">
                        {[orden, familia].filter(Boolean).join(" · ")}
                      </p>
                    )}

                    {/* Localidad */}
                    {localidad && (
                      <p className="text-[11px] leading-snug text-gray-600">{localidad}</p>
                    )}

                    {/* Coordenadas + altitud */}
                    {(coordenadas || coleccion.altitud != null) && (
                      <p className="text-[10px] text-gray-400 font-mono">
                        {coordenadas}
                        {coordenadas && coleccion.altitud != null && " | "}
                        {coleccion.altitud != null && `${coleccion.altitud} msnm`}
                      </p>
                    )}

                    {/* Fecha — al final, destacada */}
                    {fecha && (
                      <p className="text-[10px] font-semibold text-gray-500 mt-auto pt-1">{fecha}</p>
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
