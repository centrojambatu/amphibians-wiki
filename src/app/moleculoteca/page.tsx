import { Dna, Database, Globe } from "lucide-react";

import getEspeciesMoleculoteca from "./get-especies-moleculoteca";
import { MoleculotecaSpeciesCard } from "@/components/moleculoteca-species-card";
import Pagination from "@/components/pagination";
import MoleculotecaFiltersPanel from "@/components/moleculoteca-filters-panel";

interface SearchParams {
  pagina?: string;
  busqueda?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function MoleculotecaPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const pagina = params.pagina ? Number.parseInt(params.pagina, 10) : 1;
  const itemsPorPagina = 36;

  // Construir filtros desde searchParams
  const filtros = {
    busqueda: params.busqueda || undefined,
  };

  // Obtener datos
  const { especies, total, totalPaginas } = await getEspeciesMoleculoteca(
    pagina,
    itemsPorPagina,
    filtros,
  );

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header con introducción */}
      <div className="mb-10 text-center">
        <div className="mb-4 flex items-center justify-center gap-3">
          <Dna className="h-10 w-10 text-green-600" />
          <h1 className="text-4xl font-bold">Moleculoteca</h1>
        </div>
        <p className="text-muted-foreground mx-auto max-w-3xl text-lg">
          Accede a recursos genómicos y moleculares de los anfibios de Ecuador.
          Cada especie incluye enlaces directos a las principales bases de datos
          de biodiversidad y genética del mundo.
        </p>
      </div>

      {/* Sección de información sobre las bases de datos */}
      <div className="mb-10 grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 text-center">
          <div className="mb-3 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Database className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <h3 className="mb-2 font-semibold">GBIF</h3>
          <p className="text-muted-foreground text-sm">
            Global Biodiversity Information Facility. Base de datos mundial de
            ocurrencias y distribución de especies.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 text-center">
          <div className="mb-3 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Dna className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h3 className="mb-2 font-semibold">NCBI GenBank</h3>
          <p className="text-muted-foreground text-sm">
            National Center for Biotechnology Information. Repositorio de
            secuencias genéticas y datos moleculares.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 text-center">
          <div className="mb-3 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
              <Globe className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <h3 className="mb-2 font-semibold">iNaturalist</h3>
          <p className="text-muted-foreground text-sm">
            Red social de naturalistas. Observaciones ciudadanas con
            identificación colaborativa y fotografías geolocalizadas.
          </p>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-8">
        <div className="mx-auto max-w-2xl">
          <MoleculotecaFiltersPanel />
        </div>
      </div>

      {/* Información de resultados */}
      <div className="text-muted-foreground mb-6 text-center text-sm">
        Mostrando {especies.length} de {total} especies
        {totalPaginas > 1 && ` (Página ${pagina} de ${totalPaginas})`}
      </div>

      {/* Grid de especies */}
      {especies.length > 0 ? (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {especies.map((especie) => (
            <MoleculotecaSpeciesCard key={especie.id_taxon} species={especie} />
          ))}
        </div>
      ) : (
        <div className="bg-card mb-8 rounded-lg border p-12 text-center">
          <div className="mb-4 text-4xl">🔬</div>
          <p className="text-muted-foreground text-lg">
            No se encontraron especies con los criterios de búsqueda.
          </p>
          <p className="text-muted-foreground mt-2 text-sm">
            Intenta con otro término de búsqueda.
          </p>
        </div>
      )}

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="mt-8">
          <Pagination
            paginaActual={pagina}
            totalPaginas={totalPaginas}
            baseUrl="/moleculoteca"
            searchParams={params}
          />
        </div>
      )}
    </main>
  );
}
