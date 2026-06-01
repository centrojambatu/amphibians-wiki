"use client";

import {useQuery} from "@tanstack/react-query";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RegistrosPorAnioResponse {
  puntos: {anio: number; count: number}[];
  totalConFecha: number;
  totalSinFecha: number;
}

const ALTURA_MAX_BARRA = 200;
const COLOR_BARRA = "#f07304";

export default function RegistrosPorAnioChart() {
  const {data, isLoading} = useQuery<RegistrosPorAnioResponse>({
    queryKey: ["colecciones", "registros-por-anio"],
    queryFn: async () => {
      const res = await fetch("/api/colecciones/registros-por-anio");

      if (!res.ok) return {puntos: [], totalConFecha: 0, totalSinFecha: 0};

      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white px-6 pt-6 pb-4 text-center text-sm text-gray-500">
        Cargando histograma...
      </div>
    );
  }

  const puntos = data?.puntos ?? [];
  const totalConFecha = data?.totalConFecha ?? 0;
  const totalSinFecha = data?.totalSinFecha ?? 0;

  if (puntos.length === 0) return null;

  const maxCount = Math.max(...puntos.map((d) => d.count), 1);
  const minYear = puntos[0].anio;
  const maxYear = puntos[puntos.length - 1].anio;
  const rangeYears = maxYear - minYear;
  const tickStep = rangeYears > 60 ? 20 : rangeYears > 30 ? 10 : rangeYears > 15 ? 5 : 1;
  const ticks: number[] = [];

  for (let y = Math.ceil(minYear / tickStep) * tickStep; y <= maxYear; y += tickStep) {
    ticks.push(y);
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-6 pt-6 pb-4">
      <div
        className="flex w-full items-end gap-px"
        style={{height: ALTURA_MAX_BARRA + 16}}
      >
        <TooltipProvider delayDuration={0}>
          {puntos.map((d) => {
            const altura = (d.count / maxCount) * ALTURA_MAX_BARRA;

            return (
              <Tooltip key={d.anio}>
                <TooltipTrigger asChild>
                  <button
                    aria-label={`${String(d.count)} registros en ${String(d.anio)}`}
                    className="min-w-0 flex-1 cursor-pointer rounded-t transition-opacity hover:opacity-90 focus:outline-none"
                    style={{
                      height: d.count > 0 ? Math.max(altura, 4) : 1,
                      backgroundColor: d.count > 0 ? COLOR_BARRA : "#e5e5e5",
                    }}
                    type="button"
                  />
                </TooltipTrigger>
                <TooltipContent
                  className="border border-gray-200 bg-white text-gray-900 shadow-md"
                  side="top"
                >
                  <div className="space-y-0.5">
                    <p className="font-medium">{d.anio}</p>
                    <p className="text-xs text-gray-600">
                      {d.count.toLocaleString()} {d.count === 1 ? "registro" : "registros"}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>

      <div className="relative mt-1 h-4 w-full">
        {ticks.map((tick) => {
          const pct = ((tick - minYear) / Math.max(rangeYears, 1)) * 100;

          return (
            <span
              key={tick}
              className="absolute top-0 -translate-x-1/2 text-[10px] text-gray-500"
              style={{left: `${String(pct)}%`}}
            >
              {tick}
            </span>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-4">
        <p className="text-lg font-semibold text-gray-500">
          Registros por año <span className="text-[#f07304]">|</span>{" "}
          <span className="text-gray-500">
            total {totalConFecha.toLocaleString()} registros
          </span>
        </p>
      </div>
    </div>
  );
}
