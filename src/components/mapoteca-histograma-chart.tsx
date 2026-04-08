"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ProvinciaPoint {
  name: string;
  total: number;
}

interface MapotecaHistogramaChartProps {
  data: ProvinciaPoint[];
  activeProvincias?: string[];
  onBarClick?: (name: string) => void;
}

const ALTURA_MAX_BARRA = 200;

export default function MapotecaHistogramaChart({ data, activeProvincias = [], onBarClick }: MapotecaHistogramaChartProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-lg font-semibold text-gray-800">Especies por provincia</p>
        <p className="mt-4 text-sm text-gray-500">No hay datos disponibles.</p>
      </div>
    );
  }

  const maxTotal = Math.max(...data.map((p) => p.total), 1);

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-6 pt-6 pb-0 overflow-visible">
      <div className="mb-4">
        <p className="text-lg font-semibold text-gray-800">
          Especies por provincia{" "}
          <span className="text-[#f07304]">|</span>{" "}
          <span className="text-gray-500">{data.length} provincias</span>
        </p>
      </div>

      <div className="flex w-full items-end gap-3" style={{ height: ALTURA_MAX_BARRA + 32 }}>
        <TooltipProvider delayDuration={0}>
          {data.map((punto) => {
            const altura = (punto.total / maxTotal) * ALTURA_MAX_BARRA;
            const ratio = maxTotal > 0 ? punto.total / maxTotal : 0;
            const isActive = activeProvincias.includes(punto.name);
            // Gradiente: barra más alta = #ff8d41, más baja = #ffd4b0; activa = borde oscuro
            const r = Math.round(255 + (255 - 255) * (1 - ratio));
            const g = Math.round(141 + (212 - 141) * (1 - ratio));
            const b = Math.round(65  + (176 - 65)  * (1 - ratio));
            const color = isActive ? "#c45e03" : `rgb(${r},${g},${b})`;

            return (
              <Tooltip key={punto.name}>
                <TooltipTrigger asChild>
                  <div
                    className="min-w-0 flex-1 rounded-t transition-all hover:opacity-80"
                    style={{
                      height: Math.max(altura, 4),
                      backgroundColor: color,
                      cursor: onBarClick ? "pointer" : "default",
                      outline: isActive ? "2px solid #c45e03" : "none",
                      outlineOffset: "1px",
                    }}
                    onClick={() => onBarClick?.(punto.name)}
                  />
                </TooltipTrigger>
                <TooltipContent
                  className="border border-gray-200 bg-white text-gray-900 shadow-md"
                  side="top"
                >
                  <div className="space-y-0.5">
                    <p className="font-medium">{punto.name}</p>
                    <p className="text-xs text-gray-600">
                      {punto.total} {punto.total === 1 ? "especie" : "especies"}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>

      {/* Eje X: nombres de provincias rotados */}
      <div className="mt-1 flex w-full gap-3" style={{ height: 140 }}>
        {data.map((punto) => (
          <div key={punto.name} className="relative min-w-0 flex-1">
            <span
              className="absolute left-1/2 top-0 origin-top-left rotate-45 whitespace-nowrap text-[13px] text-gray-500"
            >
              {punto.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
