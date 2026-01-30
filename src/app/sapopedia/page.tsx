import Image from "next/image";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SapopediaContent } from "@/components/sapopedia-content";

import getAllEspecies from "./get-all-especies";
import getFilterCatalogs from "./get-filter-catalogs";

export default async function SapopediaPage() {
  // Obtener especies y catálogos de filtros en paralelo
  const [especies, filterCatalogs] = await Promise.all([getAllEspecies(), getFilterCatalogs()]);

  return (
    <main className="container mx-auto px-4 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <div className="mb-6 text-center sm:mb-8">
        <h1 className="text-primary mb-4 text-2xl font-bold sm:mb-6 sm:text-3xl lg:text-4xl">
          Sapopedia Ecuador
        </h1>
      </div>

      {/* Estadísticas */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
        <Card>
          <CardContent>
            <p className="text-3xl font-bold sm:text-4xl">{especies.length}</p>
            <p className="text-muted-foreground text-xs sm:text-sm">Especies</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <p className="text-3xl font-bold sm:text-4xl">
              {new Set(especies.map((e) => e.familia).filter(Boolean)).size}
            </p>
            <p className="text-muted-foreground text-xs sm:text-sm">Familias</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <p className="text-3xl font-bold sm:text-4xl">
              {new Set(especies.map((e) => e.genero).filter(Boolean)).size}
            </p>
            <p className="text-muted-foreground text-xs sm:text-sm">Géneros</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <p className="text-3xl font-bold sm:text-4xl">
              {especies.filter((e) => e.endemica).length}{" "}
              <span className="text-muted-foreground text-2xl font-normal sm:text-2xl">
                {((especies.filter((e) => e.endemica).length / especies.length) * 100).toFixed(1)}%
              </span>
            </p>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Endémicas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <p className="text-3xl font-bold sm:text-4xl">
              {especies.filter((e) => e.lista_roja_iucn === "CR").length}
            </p>
            <p className="text-muted-foreground text-xs sm:text-sm">En peligro crítico</p>
          </CardContent>
        </Card>
      </div>

      {/* Contenido con tabs */}
      <div className="mb-6 sm:mb-8">
        <SapopediaContent especies={especies} filterCatalogs={filterCatalogs} />
      </div>
    </main>
  );
}
