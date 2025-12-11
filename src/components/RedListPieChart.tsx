"use client";

import { CatalogOption } from "@/app/sapopedia/get-filter-catalogs";
import { SpeciesListItem } from "@/app/sapopedia/get-all-especies";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import RedListStatus from "./RedListStatus";

interface RedListPieChartProps {
  readonly especies: SpeciesListItem[];
  readonly categorias: CatalogOption[];
}

export default function RedListPieChart({ especies, categorias }: RedListPieChartProps) {
  // Obtener todas las categorías únicas de las especies
  const categoriasUnicas = new Set(
    especies
      .map((e) => e.lista_roja_iucn)
      .filter((sigla): sigla is string => sigla !== null && sigla !== undefined),
  );

  // Combinar categorías de getFilterCatalogs con las que realmente tienen especies
  const todasLasCategorias = Array.from(categoriasUnicas)
    .map((sigla) => {
      const categoriaEncontrada = categorias.find((c) => c.sigla === sigla);
      if (categoriaEncontrada) {
        return categoriaEncontrada;
      }
      return {
        id: 0,
        nombre: sigla,
        sigla: sigla,
        value: sigla,
      };
    })
    .filter((c) => c.sigla !== null);

  // Calcular datos para el gráfico
  const datos = todasLasCategorias
    .map((categoria) => {
      const especiesEnCategoria = especies.filter((e) => e.lista_roja_iucn === categoria.sigla);
      const count = especiesEnCategoria.length;

      const familias = new Set(especiesEnCategoria.map((e) => e.familia).filter(Boolean));
      const generos = new Set(especiesEnCategoria.map((e) => e.genero).filter(Boolean));

      return {
        categoria,
        count,
        familias: familias.size,
        generos: generos.size,
        especies: count,
      };
    })
    .filter((d) => d.count > 0);

  const datosOrdenados = datos.sort((a, b) => {
    const siglaA = a.categoria.sigla || "";
    const siglaB = b.categoria.sigla || "";

    const isPE = (sigla: string) => {
      return sigla === "PE" || sigla.includes("PE") || sigla.includes("Posiblemente extinta");
    };

    if (isPE(siglaA) && !isPE(siglaB)) return -1;
    if (!isPE(siglaA) && isPE(siglaB)) return 1;

    const orden = ["CR", "EN", "VU", "NT", "LC", "DD", "EW", "EX"];
    const indexA = orden.indexOf(siglaA);
    const indexB = orden.indexOf(siglaB);

    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;

    return indexA - indexB;
  });

  const totalEspecies = especies.length;
  const especiesConCategoria = especies.filter((e) => e.lista_roja_iucn).length;

  const isPE = (sigla: string | null) => {
    if (!sigla) return false;
    return sigla === "PE" || sigla.includes("PE") || sigla.includes("Posiblemente extinta");
  };

  const getColor = (sigla: string | null) => {
    if (isPE(sigla)) {
      return "#b71c1c";
    }
    switch (sigla) {
      case "EX":
        return "#000000";
      case "EW":
        return "#7a7a7a";
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
      case "DD":
        return "#757575";
      default:
        return "#9e9e9e";
    }
  };

  // Calcular los ángulos para el diagrama de pastel
  const size = 300;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 20;

  let currentAngle = -90; // Empezar desde arriba

  const paths = datosOrdenados.map((dato) => {
    const percentage = especiesConCategoria > 0 ? (dato.count / especiesConCategoria) * 100 : 0;
    const angle = especiesConCategoria > 0 ? (dato.count / especiesConCategoria) * 360 : 0;

    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;

    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

    const slice = {
      pathData,
      color: getColor(dato.categoria.sigla),
      percentage,
      dato,
    };

    currentAngle += angle;

    return slice;
  });

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Distribución por Categorías</h3>
        <p className="text-muted-foreground text-sm">Total: {totalEspecies} especies</p>
      </div>

      <div className="flex flex-col items-center gap-8 md:flex-row md:items-start flex-1">
        {/* Diagrama de pastel */}
        <div className="flex-shrink-0">
          <TooltipProvider>
            <svg className="mx-auto" height={size} width={size}>
              {paths.map((slice, index) => (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <path
                      className="cursor-pointer transition-opacity hover:opacity-80"
                      d={slice.pathData}
                      fill={slice.color}
                      stroke="white"
                      strokeWidth="2"
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <p className="font-semibold">{slice.dato.categoria.nombre}</p>
                      <div className="space-y-0.5 text-xs">
                        <p>Familias: {slice.dato.familias}</p>
                        <p>Géneros: {slice.dato.generos}</p>
                        <p>Especies: {slice.dato.especies}</p>
                        <p>Porcentaje: {slice.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </svg>
          </TooltipProvider>
        </div>

        {/* Leyenda */}
        <div className="flex-1 space-y-3">
          {datosOrdenados.map((dato, index) => {
            const percentage =
              especiesConCategoria > 0
                ? ((dato.count / especiesConCategoria) * 100).toFixed(1)
                : "0";

            return (
              <div key={dato.categoria.id} className="flex items-center gap-3">
                {/* Color y badge */}
                <div className="flex w-20 items-center justify-center">
                  {dato.categoria.sigla && (
                    <>
                      {isPE(dato.categoria.sigla) ? (
                        <div
                          className="inline-flex items-center justify-center px-2 py-1 text-[10px] font-semibold"
                          style={{
                            backgroundColor: getColor(dato.categoria.sigla),
                            color: "#ffffff",
                            borderRadius: "100% 0% 100% 100%",
                            minWidth: "32px",
                            minHeight: "32px",
                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.15)",
                          }}
                        >
                          PE
                        </div>
                      ) : (
                        <RedListStatus
                          showTooltip={false}
                          status={
                            dato.categoria.sigla as
                              | "LC"
                              | "NT"
                              | "VU"
                              | "EN"
                              | "CR"
                              | "EW"
                              | "EX"
                              | "DD"
                          }
                        />
                      )}
                    </>
                  )}
                </div>

                {/* Nombre de categoría */}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{dato.categoria.nombre}</p>
                  <p className="text-xs text-gray-500">
                    {isPE(dato.categoria.sigla) ? "CR (PE)" : dato.categoria.sigla}
                  </p>
                </div>

                {/* Contador y porcentaje */}
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-700">{dato.count}</p>
                  <p className="text-xs text-gray-500">{percentage}%</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
