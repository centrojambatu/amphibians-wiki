"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { DatosHistograma } from "@/app/sapoteca/get-histograma-publicaciones";

interface SapotecaHistogramaChartProps {
  data: DatosHistograma;
}

const ALTURA_MAX_BARRA = 220;
const COLOR_BARRA = "#67aa4d";
const COLOR_BARRA_CERO = "#e5e7eb";

export default function SapotecaHistogramaChart({ data }: SapotecaHistogramaChartProps) {
  const { puntos, totalPublicaciones } = data;
  const maxCantidad = Math.max(...puntos.map((p) => p.cantidad), 1);

  if (puntos.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-lg font-semibold text-gray-800">
          Publicaciones por año (1849 – {new Date().getFullYear()})
        </p>
        <p className="mt-4 text-sm text-gray-500">No hay datos disponibles.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-4">
        <p className="text-lg font-semibold text-gray-800">
          Publicaciones por año{" "}
          <span className="text-gray-500">
            (1849 – {new Date().getFullYear()}) · {totalPublicaciones.toLocaleString()} total
          </span>
        </p>
      </div>

      <div
        className="flex w-full items-end gap-px"
        style={{ height: ALTURA_MAX_BARRA + 32 }}
      >
        <TooltipProvider delayDuration={0}>
          {puntos.map((punto) => {
            const altura =
              maxCantidad > 0
                ? (punto.cantidad / maxCantidad) * ALTURA_MAX_BARRA
                : 0;
            const tieneDatos = punto.cantidad > 0;
            return (
              <Tooltip key={punto.año}>
                <TooltipTrigger asChild>
                  <div
                    className="min-w-0 flex-1 cursor-pointer rounded-t transition-opacity hover:opacity-85"
                    style={{
                      height: tieneDatos ? Math.max(altura, 6) : 2,
                      backgroundColor: tieneDatos ? COLOR_BARRA : COLOR_BARRA_CERO,
                    }}
                  />
                </TooltipTrigger>
                  <TooltipContent side="top" className="border border-gray-200 bg-white text-gray-900 shadow-md">
                    <div className="space-y-0.5">
                      <p className="font-medium">{punto.año}</p>
                      <p className="text-xs text-gray-600">
                        {punto.cantidad}{" "}
                        {punto.cantidad === 1 ? "publicación" : "publicaciones"}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
        </TooltipProvider>
      </div>

      {/* Eje X: años cada cierto paso */}
      <div className="mt-2 flex w-full gap-px text-xs text-gray-500">
        {puntos.map((punto, i) => {
          const step = Math.max(1, Math.floor(puntos.length / 10));
          const mostrar = i % step === 0;
          return (
            <div
              key={punto.año}
              className="min-w-0 flex-1 text-center"
            >
              {mostrar ? punto.año : ""}
            </div>
          );
        })}
      </div>
    </div>
  );
}
