"use client";

import { CatalogOption } from "@/app/sapopedia/get-filter-catalogs";
import { SpeciesListItem } from "@/app/sapopedia/get-all-especies";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import RedListStatus from "./RedListStatus";

interface RedListBarChartProps {
  readonly especies: SpeciesListItem[];
  readonly categorias: CatalogOption[];
  readonly onCategoryClick?: (categoria: string) => void;
}

export default function RedListBarChart({
  especies,
  categorias,
  onCategoryClick,
}: RedListBarChartProps) {
  // Debug: Verificar datos recibidos
  console.log("🔍 RedListBarChart - Total especies recibidas:", especies.length);
  console.log("🔍 RedListBarChart - Especies con categoría UICN:", especies.filter((e) => e.lista_roja_iucn).length);

  // Obtener todas las categorías únicas de las especies (no solo las de getFilterCatalogs)
  const categoriasUnicas = new Set(
    especies
      .map((e) => e.lista_roja_iucn)
      .filter((sigla): sigla is string => sigla !== null && sigla !== undefined),
  );

  console.log("🔍 RedListBarChart - Categorías únicas encontradas:", Array.from(categoriasUnicas));

  // Combinar categorías de getFilterCatalogs con las que realmente tienen especies
  const todasLasCategorias = Array.from(categoriasUnicas)
    .map((sigla) => {
      // Buscar la categoría en el listado de getFilterCatalogs
      const categoriaEncontrada = categorias.find((c) => c.sigla === sigla);
      if (categoriaEncontrada) {
        return categoriaEncontrada;
      }
      // Si no se encuentra, crear una categoría temporal con el nombre de la sigla
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
      const especiesEnCategoria = especies.filter(
        (e) => e.lista_roja_iucn === categoria.sigla,
      );
      const count = especiesEnCategoria.length;

      // Debug por categoría
      if (count > 0) {
        console.log(`🔍 BarChart - Categoría ${categoria.sigla} (${categoria.nombre}): ${count} especies`);
      }

      // Calcular familias y géneros únicos
      const familias = new Set(
        especiesEnCategoria.map((e) => e.familia).filter(Boolean),
      );
      const generos = new Set(
        especiesEnCategoria.map((e) => e.genero).filter(Boolean),
      );

      return {
        categoria,
        count,
        familias: familias.size,
        generos: generos.size,
        especies: count,
      };
    })
    .filter((d) => d.count > 0)
    .sort((a, b) => {
      // Ordenar por orden de importancia de las categorías
      // PE (Posiblemente extinta) debe ser la primera, siempre
      const siglaA = a.categoria.sigla || "";
      const siglaB = b.categoria.sigla || "";

      // Función helper para detectar si es PE
      const isPE = (sigla: string) => {
        return sigla === "PE" || sigla.includes("PE") || sigla.includes("Posiblemente extinta");
      };

      // PE siempre primero
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

  const maxCount = Math.max(...datos.map((d) => d.count), 1);
  const totalEspecies = especies.length;
  const especiesConCategoria = especies.filter((e) => e.lista_roja_iucn).length;

  // Función helper para detectar si es PE
  const isPE = (sigla: string | null) => {
    if (!sigla) return false;
    return sigla === "PE" || sigla.includes("PE") || sigla.includes("Posiblemente extinta");
  };

  // Colores para cada categoría
  const getColor = (sigla: string | null) => {
    if (isPE(sigla)) {
      return "#b71c1c"; // Rojo intenso para Posiblemente extinta
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

  return (
    <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white p-3 sm:p-6">
      <div className="mb-4 pl-2 sm:pl-6">
        <p className="text-base font-semibold text-gray-800 sm:text-lg">
          {totalEspecies} <span className="text-gray-500">especies</span>
        </p>
      </div>

      <div className="flex-1 space-y-3 sm:space-y-4">
        {datos.map((dato) => {
          const porcentaje = (dato.count / maxCount) * 100;

          return (
            <div key={dato.categoria.id} className="flex items-center gap-2 sm:gap-4">
              {/* Badge de categoría */}
              <div
                className="flex w-10 flex-shrink-0 cursor-pointer items-center justify-center transition-transform hover:scale-110 sm:w-20"
                onClick={() => {
                  const sigla = isPE(dato.categoria.sigla) ? "PE" : dato.categoria.sigla;
                  if (sigla) onCategoryClick?.(sigla);
                }}
              >
                {dato.categoria.sigla && (
                  <>
                    {isPE(dato.categoria.sigla) ? (
                      <div
                        className="inline-flex items-center justify-center font-semibold text-[11px]"
                        style={{
                          backgroundColor: getColor(dato.categoria.sigla),
                          color: "#ffffff",
                          borderRadius: "100% 0% 100% 100%",
                          width: "36px",
                          height: "36px",
                          padding: "4px 9px",
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
              <div
                className="hidden w-32 flex-shrink-0 cursor-pointer transition-colors hover:text-gray-600 md:block lg:w-48"
                onClick={() => {
                  const sigla = isPE(dato.categoria.sigla) ? "PE" : dato.categoria.sigla;
                  if (sigla) onCategoryClick?.(sigla);
                }}
              >
                <p className="text-sm font-medium text-gray-800">
                  {dato.categoria.nombre}
                </p>
                <p className="text-xs text-gray-500">
                  {isPE(dato.categoria.sigla) ? "CR (PE)" : dato.categoria.sigla}
                </p>
              </div>

              {/* Barra */}
              <div className="min-w-0 flex-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="relative h-7 w-full cursor-pointer rounded-md bg-gray-100 transition-opacity hover:opacity-80 sm:h-8"
                        onClick={() => {
                          const sigla = isPE(dato.categoria.sigla) ? "PE" : dato.categoria.sigla;
                          if (sigla) onCategoryClick?.(sigla);
                        }}
                      >
                        <div
                          className="h-full rounded-md transition-all"
                          style={{
                            width: `${porcentaje}%`,
                            backgroundColor: getColor(dato.categoria.sigla),
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-end pr-2">
                          <span className="text-xs font-semibold text-gray-700">
                            {dato.count}
                          </span>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1 text-white">
                        <p className="font-normal">{dato.categoria.nombre}</p>
                        <div className="space-y-0.5 text-xs font-normal">
                          <p>Familias: {dato.familias}</p>
                          <p>Géneros: {dato.generos}</p>
                          <p>Especies: {dato.especies}</p>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Porcentaje del total */}
              <div className="w-12 flex-shrink-0 text-right sm:w-16">
                <p className="text-xs font-medium text-gray-600 sm:text-sm">
                  {especiesConCategoria > 0
                    ? ((dato.count / especiesConCategoria) * 100).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
