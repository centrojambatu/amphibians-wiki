"use client";

import {SpeciesListItem} from "@/app/sapopedia/get-all-especies";
import {Card, CardContent} from "@/components/ui/card";
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
    if (sigla === "PE" || isPE(sigla)) {
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
      case "DD":
        return "#9e9e9e";
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
      case "DD":
        return "Datos insuficientes";
      default:
        return sigla;
    }
  };

  // 7 categorías para las cards superiores: PE, CR, EN, VU, NT, LC, DD
  const categoriasListaRoja: { sigla: string; etiqueta: string }[] = [
    { sigla: "PE", etiqueta: "Posiblemente extintas" },
    { sigla: "CR", etiqueta: "Críticamente amenazadas" },
    { sigla: "EN", etiqueta: "En peligro" },
    { sigla: "VU", etiqueta: "Vulnerables" },
    { sigla: "NT", etiqueta: "Casi amenazadas" },
    { sigla: "LC", etiqueta: "Preocupación menor" },
    { sigla: "DD", etiqueta: "Datos insuficientes" },
  ];

  const contarPorCategoria = (sigla: string): number => {
    if (sigla === "PE") {
      return especies.filter((e) => isPE(e.lista_roja_iucn)).length;
    }
    return especies.filter((e) => e.lista_roja_iucn === sigla).length;
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 7 cards por categoría de lista roja */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7 sm:gap-4">
        {categoriasListaRoja.map(({ sigla, etiqueta }) => {
          const count = contarPorCategoria(sigla);
          const pct =
            especiesConCategoria > 0 ? ((count / especiesConCategoria) * 100).toFixed(1) : "0";
          return (
            <Card key={sigla} className="min-w-0 overflow-visible">
              <CardContent className="pt-4">
                <p className="text-3xl font-bold sm:text-4xl">
                  {count}{" "}
                  <span className="text-muted-foreground text-2xl font-normal sm:text-2xl">
                    {pct}%
                  </span>
                </p>
                <p className="break-words text-muted-foreground text-xs sm:text-sm">{etiqueta}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Card de especies amenazadas + no amenazadas */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
      {/* Card de especies amenazadas */}
      <Card>
        <CardContent>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {["CR", "EN", "VU"].map((sigla) => (
              <TooltipProvider key={sigla}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="inline-flex cursor-pointer items-center justify-center text-[11px] font-semibold"
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
                    className="inline-flex cursor-pointer items-center justify-center text-[11px] font-semibold"
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
          <p className="text-3xl font-bold sm:text-4xl">{totalAmenazadas}</p>
          <p className="text-muted-foreground text-xs sm:text-sm">Especies amenazadas</p>
          <p className="mt-1 text-muted-foreground text-xs sm:text-sm">{porcentajeAmenazadas}% del total</p>
        </CardContent>
      </Card>

      {/* Card de especies no amenazadas */}
      <Card>
        <CardContent>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {["NT", "LC"].map((sigla) => (
              <TooltipProvider key={sigla}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="inline-flex cursor-pointer items-center justify-center text-[11px] font-semibold"
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
          <p className="text-3xl font-bold sm:text-4xl">{totalNoAmenazadas}</p>
          <p className="text-muted-foreground text-xs sm:text-sm">Especies no amenazadas</p>
          <p className="mt-1 text-muted-foreground text-xs sm:text-sm">{porcentajeNoAmenazadas}% del total</p>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
