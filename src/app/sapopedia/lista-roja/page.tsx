import RedListAccordion from "@/components/RedListAccordion";
import RedListSummaryCards from "@/components/RedListSummaryCards";
import RedListChartSelector from "@/components/RedListChartSelector";

import getAllEspecies from "../get-all-especies";
import getFilterCatalogs from "../get-filter-catalogs";

export default async function ListaRojaPage() {
  // Obtener especies y catálogos de filtros
  const [especies, filterCatalogs] = await Promise.all([getAllEspecies(), getFilterCatalogs()]);

  return (
    <main className="container mx-auto px-4 py-2">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-primary mb-4 text-4xl font-bold">Lista Roja UICN</h1>
        <p className="text-muted-foreground mx-auto max-w-3xl text-lg">
          Especies de anfibios de Ecuador clasificadas según las categorías de la Lista Roja de la
          UICN.
        </p>
      </div>

      {/* Cards de resumen */}
      <RedListSummaryCards especies={especies} />

      {/* Selector de gráficos */}
      <RedListChartSelector categorias={filterCatalogs.listaRoja} especies={especies} />

      {/* Acordeón de categorías */}
      <div className="mt-8 mb-8">
        <h2 className="mb-2 text-2xl font-bold">Categorías de Conservación</h2>
        <RedListAccordion categorias={filterCatalogs.listaRoja} especies={especies} />
      </div>
    </main>
  );
}
