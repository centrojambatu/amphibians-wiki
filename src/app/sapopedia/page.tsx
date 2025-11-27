import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {SapopediaContent} from "@/components/sapopedia-content";

import getAllEspecies from "./get-all-especies";
import getFilterCatalogs from "./get-filter-catalogs";

export default async function SapopediaPage() {
  // Obtener especies y catálogos de filtros en paralelo
  const [especies, filterCatalogs] = await Promise.all([getAllEspecies(), getFilterCatalogs()]);

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-primary mb-4 text-4xl font-bold">SapoPedia Ecuador</h1>
        <p className="text-muted-foreground mx-auto max-w-3xl text-lg">
          Enciclopedia electrónica de anfibios de Ecuador. Explora la increíble diversidad de ranas,
          sapos, salamandras y cecilias que habitan en nuestro país.
        </p>
      </div>

      {/* Estadísticas */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-white shadow-md transition-all hover:shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-700">
              Total de Especies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-blue-600">{especies.length}</p>
            <p className="mt-1 text-xs text-gray-500">Especies registradas</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50 to-white shadow-md transition-all hover:shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-700">Familias</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-amber-600">
              {new Set(especies.map((e) => e.familia).filter(Boolean)).size}
            </p>
            <p className="mt-1 text-xs text-gray-500">Familias taxonómicas</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-white shadow-md transition-all hover:shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-700">Géneros</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-purple-600">
              {new Set(especies.map((e) => e.genero).filter(Boolean)).size}
            </p>
            <p className="mt-1 text-xs text-gray-500">Géneros taxonómicos</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-white shadow-md transition-all hover:shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-700">Endémicas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">
              {especies.filter((e) => e.endemica).length}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {((especies.filter((e) => e.endemica).length / especies.length) * 100).toFixed(1)}%
              del total
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 bg-gradient-to-br from-red-50 to-white shadow-md transition-all hover:shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-700">Peligro Crítico</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-red-600">
              {especies.filter((e) => e.lista_roja_iucn === "CR").length}
            </p>
            <p className="mt-1 text-xs text-gray-500">Especies en peligro crítico</p>
          </CardContent>
        </Card>
      </div>

      {/* Contenido con tabs */}
      <div className="mb-8">
        <h2 className="mb-6 text-2xl font-bold">Explorar Especies</h2>
        <SapopediaContent especies={especies} filterCatalogs={filterCatalogs} />
      </div>
    </main>
  );
}
