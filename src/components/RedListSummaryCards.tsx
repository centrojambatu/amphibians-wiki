"use client";

import {SpeciesListItem} from "@/app/sapopedia/get-all-especies";
import {Card, CardContent} from "@/components/ui/card";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";

interface RedListSummaryCardsProps {
  readonly especies: SpeciesListItem[];
  readonly onCategoryClick?: (categoria: string) => void;
}

export default function RedListSummaryCards({especies, onCategoryClick}: RedListSummaryCardsProps) {
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
    { sigla: "CR", etiqueta: "Peligro Crítico" },
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
      {/* Card de especies amenazadas + no amenazadas + enlaces */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
      {/* Card de enlaces externos Lista Roja */}
      <Card className="transition-shadow">
        <CardContent>
          <div className="mt-2 flex flex-col gap-2">
            <a
              href="https://deepskyblue-beaver-511675.hostingersite.com/portfolio/lista-roja"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary hover:no-underline"
            >
              Lista Roja Ecuador
            </a>
            <a
              href="https://www.iucnredlist.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary hover:no-underline"
            >
              Lista Roja IUCN
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Card de especies amenazadas */}
      <Card className="transition-shadow">
        <CardContent>
          <div className="flex flex-wrap items-start gap-2 sm:flex-nowrap sm:items-center">
            <button
              type="button"
              onClick={() => onCategoryClick?.("AMENAZADAS")}
              className="cursor-pointer border-0 bg-transparent p-0 text-left"
            >
              <span className="inline-flex items-baseline gap-2">
                <span className="text-3xl font-bold sm:text-4xl">{totalAmenazadas}</span>
                <span className="text-muted-foreground text-2xl font-normal sm:text-2xl">
                  {porcentajeAmenazadas}%
                </span>
              </span>
              <p className="mt-1 text-muted-foreground text-xs sm:text-sm">Especies amenazadas</p>
            </button>
            <span className="w-full sm:w-auto sm:ml-3 inline-flex flex-wrap items-center justify-start gap-1.5 sm:-translate-y-1">
              <div
                className="inline-flex items-center justify-center text-[11px] font-semibold"
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
              {["CR", "EN", "VU"].map((sigla) => (
                <div
                  key={sigla}
                  className="inline-flex items-center justify-center text-[11px] font-semibold"
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
              ))}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Card de especies no amenazadas */}
      <Card className="transition-shadow">
        <CardContent>
          <div className="flex flex-wrap items-start gap-2 sm:flex-nowrap sm:items-center">
            <button
              type="button"
              onClick={() => onCategoryClick?.("NO_AMENAZADAS")}
              className="cursor-pointer border-0 bg-transparent p-0 text-left"
            >
              <span className="inline-flex items-baseline gap-2">
                <span className="text-3xl font-bold sm:text-4xl">{totalNoAmenazadas}</span>
                <span className="text-muted-foreground text-2xl font-normal sm:text-2xl">
                  {porcentajeNoAmenazadas}%
                </span>
              </span>
              <p className="mt-1 text-muted-foreground text-xs sm:text-sm">Especies no amenazadas</p>
            </button>
            <span className="w-full sm:w-auto sm:ml-3 inline-flex flex-wrap items-center justify-start gap-1.5 sm:-translate-y-1">
              {["NT", "LC"].map((sigla) => (
                <div
                  key={sigla}
                  className="inline-flex items-center justify-center text-[11px] font-semibold"
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
              ))}
            </span>
          </div>
        </CardContent>
      </Card>
      </div>

      {/* 7 cards por categoría de lista roja */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7 sm:gap-4">
        {categoriasListaRoja.map(({ sigla, etiqueta }) => {
          const count = contarPorCategoria(sigla);
          const pct =
            especiesConCategoria > 0 ? ((count / especiesConCategoria) * 100).toFixed(1) : "0";
          return (
            <Card
              key={sigla}
              className="min-w-0 cursor-pointer overflow-visible transition-shadow hover:shadow-md"
              onClick={() => onCategoryClick?.(sigla)}
            >
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
    </div>
  );
}
