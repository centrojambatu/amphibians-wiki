"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ProvinciaPoint {
  name: string;
  total: number;
  secondary?: number;   // valor apilado (no usado en modo porcentaje)
  endemicas?: number;   // conteo real de endémicas (para tooltip)
  totalSpp?: number;    // total de especies reales (para tooltip)
}

interface MapotecaHistogramaChartProps {
  data: ProvinciaPoint[];
  activeProvincias?: string[];
  onBarClick?: (name: string) => void;
  title?: string;
  unit?: string;
  showLabels?: boolean;
  secondaryLabel?: string; // etiqueta para el tooltip del valor secundario
}

const ALTURA_MAX_BARRA = 200;

export default function MapotecaHistogramaChart({
  data,
  activeProvincias = [],
  onBarClick,
  title = "Especies por provincia",
  unit = "provincias",
  showLabels = true,
  secondaryLabel = "endémicas",
}: MapotecaHistogramaChartProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-lg font-semibold text-gray-800">{title}</p>
        <p className="mt-4 text-sm text-gray-500">No hay datos disponibles.</p>
      </div>
    );
  }

  const hasSecondary = data.some((p) => (p.secondary ?? 0) > 0);
  const maxTotal = Math.max(...data.map((p) => p.total), 1);

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white px-6 pt-6 pb-4">
      <div className="mb-4 flex items-center gap-4">
        <p className="text-lg font-semibold text-gray-800">
          {title}{" "}
          <span className="text-[#f07304]">|</span>{" "}
          <span className="text-gray-500">{data.length} {unit}</span>
        </p>
        {hasSecondary && (
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: "#ffa04d" }} />
              Total
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: "#f07304" }} />
              {secondaryLabel}
            </span>
          </div>
        )}
      </div>

      <div className="flex w-full items-end gap-2" style={{ height: ALTURA_MAX_BARRA + 32, minWidth: data.length * 72 }}>
        <TooltipProvider delayDuration={0}>
          {data.map((punto) => {
            const alturaTotalPx = (punto.total / maxTotal) * ALTURA_MAX_BARRA;
            const ratio = maxTotal > 0 ? punto.total / maxTotal : 0;
            const isActive = activeProvincias.includes(punto.name);

            const r = Math.round(255 + (255 - 255) * (1 - ratio));
            const g = Math.round(141 + (212 - 141) * (1 - ratio));
            const b = Math.round(65  + (176 - 65)  * (1 - ratio));
            const colorTotal = isActive ? "#c45e03" : `rgb(${r},${g},${b})`;

            const secondary = punto.secondary ?? 0;
            const alturaSecondaryPx = hasSecondary
              ? (secondary / maxTotal) * ALTURA_MAX_BARRA
              : 0;
            const alturaRestoPx = Math.max(alturaTotalPx - alturaSecondaryPx, 0);

            return (
              <Tooltip key={punto.name}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="min-w-0 flex-1 rounded-t border-0 p-0 transition-all hover:opacity-80 flex flex-col-reverse"
                    style={{
                      height: Math.max(alturaTotalPx, 4),
                      cursor: onBarClick ? "pointer" : "default",
                      outline: isActive ? "2px solid #c45e03" : "none",
                      outlineOffset: "1px",
                    }}
                    onClick={() => onBarClick?.(punto.name)}
                  >
                    {/* Parte superior: no endémicas */}
                    {hasSecondary && (
                      <span
                        className="block w-full"
                        style={{
                          height: Math.max(alturaRestoPx, 0),
                          backgroundColor: colorTotal,
                          borderRadius: alturaSecondaryPx === 0 ? "4px 4px 0 0" : "0",
                        }}
                      />
                    )}
                    {/* Parte inferior: endémicas */}
                    {hasSecondary && secondary > 0 && (
                      <span
                        className="block w-full"
                        style={{
                          height: Math.max(alturaSecondaryPx, 4),
                          backgroundColor: "#f07304",
                          borderRadius: alturaRestoPx === 0 ? "4px 4px 0 0" : "4px 4px 0 0",
                        }}
                      />
                    )}
                    {/* Barra simple sin secondary */}
                    {!hasSecondary && (
                      <span
                        className="block w-full rounded-t"
                        style={{
                          height: "100%",
                          backgroundColor: colorTotal,
                        }}
                      />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  className="border border-gray-200 bg-white text-gray-900 shadow-md"
                  side="top"
                >
                  <div className="space-y-0.5">
                    <p className="font-medium">{punto.name}</p>
                    {punto.endemicas != null ? (
                      <>
                        <p className="text-xs font-semibold" style={{ color: "#f07304" }}>
                          {punto.total}% endémicas
                        </p>
                        <p className="text-xs text-gray-600">
                          {punto.endemicas} endémicas de {punto.totalSpp} {punto.totalSpp === 1 ? "especie" : "especies"}
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-gray-600">
                        {punto.total} {punto.total === 1 ? "especie" : "especies"}
                      </p>
                    )}
                    {hasSecondary && secondary > 0 && punto.endemicas == null && (
                      <p className="text-xs" style={{ color: "#f07304" }}>
                        {secondary} {secondaryLabel} ({Math.round(secondary / punto.total * 100)}%)
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>

      {/* Eje X: nombres con wrap */}
      {showLabels && (
        <div className="mt-2 flex w-full gap-2" style={{ minWidth: data.length * 72 }}>
          {data.map((punto) => (
            <div key={punto.name} className="min-w-0 flex-1 overflow-hidden" style={{ maxHeight: 120 }}>
              <p className="break-words text-center text-[10px] leading-snug text-gray-500">
                {punto.name}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
