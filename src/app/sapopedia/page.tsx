import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SapopediaContent } from "@/components/sapopedia-content";

import getAllEspecies from "./get-all-especies";
import getFilterCatalogs from "./get-filter-catalogs";

export default async function SapopediaPage() {
  // Obtener especies y catálogos de filtros en paralelo
  const [especies, filterCatalogs] = await Promise.all([
    getAllEspecies(),
    getFilterCatalogs(),
  ]);

  return (
    <main className="container mx-auto px-4 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8 text-center">
        <h1 className="text-primary mb-2 sm:mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold">
          SapoPedia Ecuador
        </h1>
        <p className="text-muted-foreground mx-auto max-w-3xl text-sm sm:text-base lg:text-lg px-2">
          Enciclopedia electrónica de anfibios de Ecuador. Explora la increíble
          diversidad de ranas, sapos, salamandras y cecilias que habitan en
          nuestro país.
        </p>
      </div>

      {/* Estadísticas */}
      <div className="mb-6 sm:mb-8 grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Total de Especies</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl sm:text-4xl font-bold">{especies.length}</p>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Especies registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Familias</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl sm:text-4xl font-bold">
              {new Set(especies.map((e) => e.familia).filter(Boolean)).size}
            </p>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Familias taxonómicas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Géneros</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl sm:text-4xl font-bold">
              {new Set(especies.map((e) => e.genero).filter(Boolean)).size}
            </p>
            <p className="text-muted-foreground text-xs sm:text-sm">Géneros taxonómicos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Endémicas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl sm:text-4xl font-bold">
              {especies.filter((e) => e.endemica).length}
            </p>
            <p className="text-muted-foreground text-xs sm:text-sm">
              {(
                (especies.filter((e) => e.endemica).length / especies.length) *
                100
              ).toFixed(1)}
              % del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Peligro Crítico</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl sm:text-4xl font-bold">
              {especies.filter((e) => e.lista_roja_iucn === "CR").length}
            </p>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Especies en peligro crítico
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contenido con tabs */}
      <div className="mb-6 sm:mb-8">
        <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-bold">Explorar Especies</h2>
        <SapopediaContent especies={especies} filterCatalogs={filterCatalogs} />
      </div>
    </main>
  );
}
