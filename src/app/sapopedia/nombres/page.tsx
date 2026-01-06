import NombresAccordion from "@/components/NombresAccordion";
import NombresCompartidos from "@/components/NombresCompartidos";

import getTaxonNombres from "./get-taxon-nombres";
import {
  getNombresCompartidosPorFamilia,
  getNombresCompartidosPorGenero,
} from "./get-nombres-compartidos";

export default async function NombresPage() {
  const ordenes = await getTaxonNombres();

  // Calcular estadísticas
  const totalNombres = ordenes.reduce(
    (sum, orden) =>
      sum +
      (orden.children?.reduce(
        (s, familia) =>
          s + (familia.children?.reduce((g, genero) => g + genero.nombres.length, 0) || 0),
        0,
      ) || 0),
    0,
  );

  const totalOrdenes = ordenes.length;
  const totalFamilias = ordenes.reduce((sum, orden) => sum + (orden.children?.length || 0), 0);
  const totalGeneros = ordenes.reduce(
    (sum, orden) =>
      sum + (orden.children?.reduce((s, familia) => s + (familia.children?.length || 0), 0) || 0),
    0,
  );

  // Obtener nombres compartidos directamente de la vista
  const nombresPorFamilia = await getNombresCompartidosPorFamilia();
  const nombresPorGenero = await getNombresCompartidosPorGenero();

  // Calcular estadísticas adicionales
  const totalNombresCompartidosFamilia = nombresPorFamilia.reduce(
    (sum, familia) => sum + familia.nombres.length,
    0,
  );
  const totalNombresCompartidosGenero = nombresPorGenero.reduce(
    (sum, genero) => sum + genero.nombres.length,
    0,
  );

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-primary mb-4 text-4xl font-bold">Nombres Comunes</h1>
        <p className="text-muted-foreground mx-auto max-w-3xl text-lg">
          Nombres comunes de anfibios de Ecuador organizados por orden, familia y género.
        </p>
      </div>

      <div className="mb-8 flex justify-center">
        <img
          alt="Mapa nombres comunes"
          className="mx-auto max-w-full rounded-md shadow grayscale transition-all duration-[800ms] ease-in-out hover:grayscale-0"
          src="/assets/references/mapa_nombre_comun.jpg"
          style={{width: "100%", maxWidth: "700px", height: "auto"}}
        />
      </div>

      {/* Estadísticas */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-800">Total de Nombres</h3>
          <p className="text-4xl font-bold">{totalNombres}</p>
          <p className="text-muted-foreground text-sm">Nombres comunes</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-800">Órdenes</h3>
          <p className="text-4xl font-bold">{totalOrdenes}</p>
          <p className="text-muted-foreground text-sm">Órdenes taxonómicos</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-800">Familias</h3>
          <p className="text-4xl font-bold">{totalFamilias}</p>
          <p className="text-muted-foreground text-sm">Familias taxonómicas</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-800">Géneros</h3>
          <p className="text-4xl font-bold">{totalGeneros}</p>
          <p className="text-muted-foreground text-sm">Géneros taxonómicos</p>
        </div>
      </div>

      {/* Acordeón de nombres */}
      <div className="mb-8">
        <h2 className="mb-6 text-2xl font-bold">Nombres por Categoría Taxonómica</h2>
        <NombresAccordion ordenes={ordenes} />
      </div>
    </main>
  );
}
