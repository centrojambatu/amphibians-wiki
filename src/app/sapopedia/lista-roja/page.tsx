import getAllEspecies from "../get-all-especies";
import getFilterCatalogs from "../get-filter-catalogs";
import RedListAccordion from "@/components/RedListAccordion";
import RedListBarChart from "@/components/RedListBarChart";

export default async function ListaRojaPage() {
  // Obtener especies y catálogos de filtros
  const [especies, filterCatalogs] = await Promise.all([
    getAllEspecies(),
    getFilterCatalogs(),
  ]);

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-primary mb-4 text-4xl font-bold">
          Lista Roja UICN
        </h1>
        <p className="text-muted-foreground mx-auto max-w-3xl text-lg">
          Especies de anfibios de Ecuador clasificadas según las categorías de
          la Lista Roja de la UICN.
        </p>
      </div>

      {/* Diagrama de barras */}
      <div className="mb-8">
        <RedListBarChart
          especies={especies}
          categorias={filterCatalogs.listaRoja}
        />
      </div>

      {/* Acordeón de categorías */}
      <div className="mb-8">
        <h2 className="mb-6 text-2xl font-bold">Categorías de Conservación</h2>
        <RedListAccordion
          especies={especies}
          categorias={filterCatalogs.listaRoja}
        />
      </div>
    </main>
  );
}
