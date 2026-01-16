import Image from "next/image";

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {SapopediaContent} from "@/components/sapopedia-content";

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
          SapoPedia Ecuador
        </h1>
        {/* Imágenes de los órdenes */}
        <div className="mx-auto flex max-w-7xl flex-nowrap justify-center gap-4 px-2 sm:gap-6">
          <div className="flex flex-col items-center">
            <div className="mb-2 overflow-hidden rounded-lg">
              <Image
                priority
                alt="Anura"
                className="h-auto w-96 rounded-lg object-cover sm:w-[28rem]"
                height={216}
                src="/assets/references/anura.jpg"
                width={384}
              />
            </div>
            <h3 className="text-base font-semibold text-gray-800 sm:text-lg">Anura</h3>
          </div>
          <div className="flex flex-col items-center">
            <div className="mb-2 overflow-hidden rounded-lg">
              <Image
                priority
                alt="Caudata"
                className="h-auto w-96 rounded-lg object-cover sm:w-[28rem]"
                height={216}
                src="/assets/references/caudata.jpg"
                width={384}
              />
            </div>
            <h3 className="text-base font-semibold text-gray-800 sm:text-lg">Caudata</h3>
          </div>
          <div className="flex flex-col items-center">
            <div className="mb-2 overflow-hidden rounded-lg">
              <Image
                priority
                alt="Gymnophiona"
                className="h-auto w-96 rounded-lg object-cover sm:w-[28rem]"
                height={216}
                src="/assets/references/gymnophiona.jpg"
                width={384}
              />
            </div>
            <h3 className="text-base font-semibold text-gray-800 sm:text-lg">Gymnophiona</h3>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Total de Especies</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold sm:text-4xl">{especies.length}</p>
            <p className="text-muted-foreground text-xs sm:text-sm">Especies registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Familias</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold sm:text-4xl">
              {new Set(especies.map((e) => e.familia).filter(Boolean)).size}
            </p>
            <p className="text-muted-foreground text-xs sm:text-sm">Familias taxonómicas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Géneros</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold sm:text-4xl">
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
            <p className="text-3xl font-bold sm:text-4xl">
              {especies.filter((e) => e.endemica).length}
            </p>
            <p className="text-muted-foreground text-xs sm:text-sm">
              {((especies.filter((e) => e.endemica).length / especies.length) * 100).toFixed(1)}%
              del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Peligro Crítico</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold sm:text-4xl">
              {especies.filter((e) => e.lista_roja_iucn === "CR").length}
            </p>
            <p className="text-muted-foreground text-xs sm:text-sm">Especies en peligro crítico</p>
          </CardContent>
        </Card>
      </div>

      {/* Contenido con tabs */}
      <div className="mb-6 sm:mb-8">
        <h2 className="mb-4 text-xl font-bold sm:mb-6 sm:text-2xl">Explorar Especies</h2>
        <SapopediaContent especies={especies} filterCatalogs={filterCatalogs} />
      </div>
    </main>
  );
}
