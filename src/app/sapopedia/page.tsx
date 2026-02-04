import { SapopediaContent } from "@/components/sapopedia-content";
import type { OrdenesNombresLookup } from "@/lib/organize-taxonomy";

import getAllEspecies from "./get-all-especies";
import getFilterCatalogs from "./get-filter-catalogs";
import getTaxonNombres from "./nombres/get-taxon-nombres";

export default async function SapopediaPage() {
  const [especies, filterCatalogs, ordenesNombres] = await Promise.all([
    getAllEspecies(),
    getFilterCatalogs(),
    getTaxonNombres(),
  ]);

  return (
    <main className="container mx-auto px-4 py-4 sm:py-6 lg:py-8">
      <div className="mb-6 text-center sm:mb-8">
        <h1 className="text-primary mb-4 text-2xl font-bold sm:mb-6 sm:text-3xl lg:text-4xl">
          Anfibios Ecuador
        </h1>
      </div>

      <div className="mb-6 sm:mb-8">
        <SapopediaContent
          especies={especies}
          filterCatalogs={filterCatalogs}
          ordenesNombres={ordenesNombres as OrdenesNombresLookup[]}
        />
      </div>
    </main>
  );
}
