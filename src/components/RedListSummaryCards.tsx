"use client";

import { SpeciesListItem } from "@/app/sapopedia/get-all-especies";

interface RedListSummaryCardsProps {
  readonly especies: SpeciesListItem[];
}

export default function RedListSummaryCards({
  especies,
}: RedListSummaryCardsProps) {
  // Función helper para detectar si es PE
  const isPE = (sigla: string | null): boolean => {
    if (!sigla) return false;
    return sigla === "PE" || sigla.includes("PE") || sigla.includes("Posiblemente extinta");
  };

  // Categorías amenazadas: CR, EN, VU, CR (PE)
  const categoriasAmenazadas = ["CR", "EN", "VU"];
  const especiesAmenazadas = especies.filter((e) => {
    const sigla = e.lista_roja_iucn;
    if (!sigla) return false;
    // Incluir CR (PE) también
    if (isPE(sigla)) return true;
    return categoriasAmenazadas.includes(sigla);
  });

  // Categorías no amenazadas: NT, LC
  const categoriasNoAmenazadas = ["NT", "LC"];
  const especiesNoAmenazadas = especies.filter((e) => {
    const sigla = e.lista_roja_iucn;
    if (!sigla) return false;
    return categoriasNoAmenazadas.includes(sigla);
  });

  const totalEspecies = especies.length;
  const especiesConCategoria = especies.filter((e) => e.lista_roja_iucn).length;

  const totalAmenazadas = especiesAmenazadas.length;
  const porcentajeAmenazadas =
    especiesConCategoria > 0
      ? ((totalAmenazadas / especiesConCategoria) * 100).toFixed(1)
      : "0";

  const totalNoAmenazadas = especiesNoAmenazadas.length;
  const porcentajeNoAmenazadas =
    especiesConCategoria > 0
      ? ((totalNoAmenazadas / especiesConCategoria) * 100).toFixed(1)
      : "0";

  return (
    <div className="mb-8 grid gap-4 md:grid-cols-2">
      {/* Card de especies amenazadas */}
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <h3 className="text-lg font-semibold text-red-900">Especies Amenazadas</h3>
        </div>
        <p className="mb-1 text-sm text-red-700">
          CR, EN, VU, CR (PE)
        </p>
        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-red-900">{totalAmenazadas}</span>
            <span className="text-lg text-red-700">especies</span>
          </div>
          <p className="mt-2 text-sm text-red-600">
            {porcentajeAmenazadas}% del total
          </p>
        </div>
      </div>

      {/* Card de especies no amenazadas */}
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
          <h3 className="text-lg font-semibold text-green-900">Especies No Amenazadas</h3>
        </div>
        <p className="mb-1 text-sm text-green-700">
          NT, LC
        </p>
        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-green-900">{totalNoAmenazadas}</span>
            <span className="text-lg text-green-700">especies</span>
          </div>
          <p className="mt-2 text-sm text-green-600">
            {porcentajeNoAmenazadas}% del total
          </p>
        </div>
      </div>
    </div>
  );
}
