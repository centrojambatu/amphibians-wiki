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

  // Función para obtener el color de cada categoría
  const getColor = (sigla: string) => {
    if (isPE(sigla)) {
      return "#b71c1c"; // Rojo intenso para Posiblemente extinta
    }
    switch (sigla) {
      case "CR":
        return "#d32f2f";
      case "EN":
        return "#f57c00";
      case "VU":
        return "#fbc02d";
      case "NT":
        return "#f9a825";
      case "LC":
        return "#388e3c";
      default:
        return "#9e9e9e";
    }
  };

  // Función para obtener el color del texto según el fondo
  const getTextColor = (sigla: string) => {
    if (isPE(sigla) || sigla === "CR" || sigla === "EN") {
      return "#ffffff";
    }
    return "#000000";
  };

  return (
    <div className="mb-8 grid gap-4 md:grid-cols-2">
      {/* Card de especies amenazadas */}
      <div className="rounded-lg border border-gray-300 bg-gray-50 p-6 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-gray-700"></div>
          <h3 className="text-lg font-semibold text-gray-900">Especies Amenazadas</h3>
        </div>
        <div className="mb-1 flex flex-wrap items-center gap-2">
          {["CR", "EN", "VU"].map((sigla) => (
            <div
              key={sigla}
              className="inline-flex items-center justify-center text-[8px] font-semibold"
              style={{
                backgroundColor: getColor(sigla),
                color: getTextColor(sigla),
                borderRadius: "100% 0% 100% 100%",
                minWidth: "24px",
                minHeight: "24px",
                padding: "2px 6px",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
              }}
            >
              {sigla}
            </div>
          ))}
          <div
            className="inline-flex items-center justify-center text-[8px] font-semibold"
            style={{
              backgroundColor: getColor("CR (PE)"),
              color: getTextColor("CR (PE)"),
              borderRadius: "100% 0% 100% 100%",
              minWidth: "24px",
              minHeight: "24px",
              padding: "2px 6px",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
            }}
          >
            PE
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900">{totalAmenazadas}</span>
            <span className="text-lg text-gray-700">especies</span>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            {porcentajeAmenazadas}% del total
          </p>
        </div>
      </div>

      {/* Card de especies no amenazadas */}
      <div className="rounded-lg border border-gray-300 bg-gray-50 p-6 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-gray-400"></div>
          <h3 className="text-lg font-semibold text-gray-900">Especies No Amenazadas</h3>
        </div>
        <div className="mb-1 flex flex-wrap items-center gap-2">
          {["NT", "LC"].map((sigla) => (
            <div
              key={sigla}
              className="inline-flex items-center justify-center text-[8px] font-semibold"
              style={{
                backgroundColor: getColor(sigla),
                color: getTextColor(sigla),
                borderRadius: "100% 0% 100% 100%",
                minWidth: "24px",
                minHeight: "24px",
                padding: "2px 6px",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
              }}
            >
              {sigla}
            </div>
          ))}
        </div>
        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900">{totalNoAmenazadas}</span>
            <span className="text-lg text-gray-700">especies</span>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            {porcentajeNoAmenazadas}% del total
          </p>
        </div>
      </div>
    </div>
  );
}
