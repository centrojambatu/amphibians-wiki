"use client";

import {SpeciesListItem} from "@/app/sapopedia/get-all-especies";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";

interface RedListSummaryCardsProps {
  readonly especies: SpeciesListItem[];
}

export default function RedListSummaryCards({especies}: RedListSummaryCardsProps) {
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
    especiesConCategoria > 0 ? ((totalAmenazadas / especiesConCategoria) * 100).toFixed(1) : "0";

  const totalNoAmenazadas = especiesNoAmenazadas.length;
  const porcentajeNoAmenazadas =
    especiesConCategoria > 0 ? ((totalNoAmenazadas / especiesConCategoria) * 100).toFixed(1) : "0";

  // Función para obtener el color de cada categoría (mismos colores que RedListStatus)
  const getColor = (sigla: string) => {
    if (isPE(sigla)) {
      return "#b71c1c"; // Rojo intenso para Posiblemente extinta
    }
    switch (sigla) {
      case "CR":
        return "#d81e05";
      case "EN":
        return "#fc7f3f";
      case "VU":
        return "#f9e814";
      case "NT":
        return "#cce226";
      case "LC":
        return "#60c659";
      default:
        return "#9e9e9e";
    }
  };

  // Función para obtener el color del texto según el fondo (mismos que RedListStatus)
  const getTextColor = (sigla: string) => {
    if (isPE(sigla) || sigla === "CR" || sigla === "EN") {
      return "#ffffff";
    }

    return "#000000";
  };

  // Función para obtener el nombre completo de cada categoría
  const getFullName = (sigla: string) => {
    if (isPE(sigla)) {
      return "Posiblemente Extinta";
    }
    switch (sigla) {
      case "CR":
        return "Críticamente Amenazado";
      case "EN":
        return "En Peligro";
      case "VU":
        return "Vulnerable";
      case "NT":
        return "Casi Amenazado";
      case "LC":
        return "Preocupación Menor";
      default:
        return sigla;
    }
  };

  return (
    <div className="mb-8 grid gap-4 md:grid-cols-2">
      {/* Card de especies amenazadas */}
      <div className="rounded-lg border border-gray-300 bg-gray-50 p-6 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">Especies Amenazadas</h3>
        </div>
        <div className="mb-1 flex flex-wrap items-center gap-2">
          {["CR", "EN", "VU"].map((sigla) => (
            <TooltipProvider key={sigla}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="inline-flex items-center justify-center text-[11px] font-semibold cursor-pointer"
                    style={{
                      backgroundColor: getColor(sigla),
                      color: getTextColor(sigla),
                      borderRadius: "100% 0% 100% 100%",
                      width: "36px",
                      height: "36px",
                      padding: "4px 9px",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    {sigla}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-semibold">{getFullName(sigla)}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="inline-flex items-center justify-center text-[11px] font-semibold cursor-pointer"
                  style={{
                    backgroundColor: getColor("CR (PE)"),
                    color: getTextColor("CR (PE)"),
                    borderRadius: "100% 0% 100% 100%",
                    width: "36px",
                    height: "36px",
                    padding: "4px 9px",
                    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  PE
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-semibold">{getFullName("CR (PE)")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900">{totalAmenazadas}</span>
            <span className="text-lg text-gray-700">especies</span>
          </div>
          <p className="mt-2 text-sm text-gray-600">{porcentajeAmenazadas}% del total</p>
        </div>
      </div>

      {/* Card de especies no amenazadas */}
      <div className="rounded-lg border border-gray-300 bg-gray-50 p-6 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">Especies No Amenazadas</h3>
        </div>
        <div className="mb-1 flex flex-wrap items-center gap-2">
          {["NT", "LC"].map((sigla) => (
            <TooltipProvider key={sigla}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="inline-flex items-center justify-center text-[11px] font-semibold cursor-pointer"
                    style={{
                      backgroundColor: getColor(sigla),
                      color: getTextColor(sigla),
                      borderRadius: "100% 0% 100% 100%",
                      width: "36px",
                      height: "36px",
                      padding: "4px 9px",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    {sigla}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-semibold">{getFullName(sigla)}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900">{totalNoAmenazadas}</span>
            <span className="text-lg text-gray-700">especies</span>
          </div>
          <p className="mt-2 text-sm text-gray-600">{porcentajeNoAmenazadas}% del total</p>
        </div>
      </div>
    </div>
  );
}
