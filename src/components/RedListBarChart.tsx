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
}

export default function RedListBarChart({
  especies,
  categorias,
}: RedListBarChartProps) {
  // Calcular datos para el gráfico
  const datos = categorias
    .map((categoria) => {
      const especiesEnCategoria = especies.filter(
        (e) => e.lista_roja_iucn === categoria.sigla,
      );
      const count = especiesEnCategoria.length;

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
      const orden = ["CR", "EN", "VU", "NT", "LC", "DD", "EW", "EX"];

      const indexA = orden.indexOf(a.categoria.sigla || "");
      const indexB = orden.indexOf(b.categoria.sigla || "");

      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;

      return indexA - indexB;
    });

  const maxCount = Math.max(...datos.map((d) => d.count), 1);
  const totalEspecies = especies.filter((e) => e.lista_roja_iucn).length;

  // Colores para cada categoría
  const getColor = (sigla: string | null) => {
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
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Distribución por Categorías
        </h3>
        <p className="text-muted-foreground text-sm">
          Total: {totalEspecies} especies con categoría UICN
        </p>
      </div>

      <div className="space-y-4">
        {datos.map((dato) => {
          const porcentaje = (dato.count / maxCount) * 100;

          return (
            <div key={dato.categoria.id} className="flex items-center gap-4">
              {/* Badge de categoría */}
              <div className="flex w-20 items-center justify-center">
                {dato.categoria.sigla && (
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
              </div>

              {/* Nombre de categoría */}
              <div className="w-48 flex-shrink-0">
                <p className="text-sm font-medium text-gray-800">
                  {dato.categoria.nombre}
                </p>
                <p className="text-xs text-gray-500">{dato.categoria.sigla}</p>
              </div>

              {/* Barra */}
              <div className="flex-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative h-8 w-full rounded-md bg-gray-100 cursor-pointer">
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
                      <div className="space-y-1">
                        <p className="font-semibold">{dato.categoria.nombre}</p>
                        <div className="text-xs space-y-0.5">
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
              <div className="w-16 text-right">
                <p className="text-sm font-medium text-gray-600">
                  {totalEspecies > 0
                    ? ((dato.count / totalEspecies) * 100).toFixed(1)
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
