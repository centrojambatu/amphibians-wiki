import RedListContent from "@/components/RedListContent";

import getAllEspecies from "../get-all-especies";
import getFilterCatalogs from "../get-filter-catalogs";

export default async function ListaRojaPage() {
  // Obtener especies y catálogos de filtros
  const [especies, filterCatalogs] = await Promise.all([getAllEspecies(), getFilterCatalogs()]);

  return (
    <main className="container mx-auto px-4 py-2">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-primary mb-4 text-4xl font-bold">Lista Roja</h1>
      </div>

      {/* Contenido interactivo (con panel de filtros, sin precipitación ni temperatura) */}
      <RedListContent
        especies={especies}
        categorias={filterCatalogs.listaRoja}
        filterCatalogs={filterCatalogs}
      />
    </main>
  );
}
