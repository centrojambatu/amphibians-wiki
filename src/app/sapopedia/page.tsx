import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {SapopediaContent} from "@/components/sapopedia-content";

import getAllEspecies from "./get-all-especies";
import getFilterCatalogs from "./get-filter-catalogs";

export default async function SapopediaPage() {
  // Obtener especies y catálogos de filtros en paralelo
  const [especies, filterCatalogs] = await Promise.all([getAllEspecies(), getFilterCatalogs()]);

  // Agrupar por orden para las estadísticas
  const especiesPorOrden = especies.reduce<Record<string, typeof especies>>((acc, especie) => {
    const orden = especie.orden || "Sin clasificar";

    if (!acc[orden]) {
      acc[orden] = [];
    }
    acc[orden].push(especie);

    return acc;
  }, {});

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
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total de Especies</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{especies.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Especies Endémicas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{especies.filter((e) => e.endemica).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Órdenes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{Object.keys(especiesPorOrden).length}</p>
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
