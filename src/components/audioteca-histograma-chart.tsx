"use client";

import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";

export interface PuntoHistogramaColector {
  colector: string;
  cantidad: number;
}

interface AudiotecaHistogramaChartProps {
  puntos: PuntoHistogramaColector[];
  totalCantos: number;
  totalSinColector: number;
}

const ALTURA_MAX_BARRA = 200;
const COLOR_BARRA = "#f07304";
const POCOS_DATOS_UMBRAL = 12;

export default function AudiotecaHistogramaChart({
  puntos,
  totalCantos,
  totalSinColector,
}: AudiotecaHistogramaChartProps) {
  const puntosOrdenados = [...puntos].sort((a, b) => b.cantidad - a.cantidad);
  const maxCantidad = Math.max(...puntosOrdenados.map((p) => p.cantidad), 1);
  const pocosDatos = puntosOrdenados.length > 0 && puntosOrdenados.length <= POCOS_DATOS_UMBRAL;

  if (puntosOrdenados.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-lg font-semibold text-gray-800">Cantos por autor grabación</p>
        <p className="mt-4 text-sm text-gray-500">No hay datos disponibles.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-4">
        <p className="text-lg font-semibold text-gray-800">
          Cantos por autor grabación <span className="text-[#f07304]">|</span>{" "}
          <span className="text-gray-500">
            total {totalCantos.toLocaleString()} audios ·{" "}
            {puntosOrdenados.length.toLocaleString()} colectores
            {totalSinColector > 0 && (
              <span className="ml-2 text-xs text-gray-400">
                ({totalSinColector.toLocaleString()} sin colector)
              </span>
            )}
          </span>
        </p>
      </div>

      {pocosDatos ? (
        // Layout con barras de ancho fijo (pocos datos)
        <div
          className="flex w-full items-end justify-center gap-6"
          style={{height: ALTURA_MAX_BARRA + 16}}
        >
          <TooltipProvider delayDuration={0}>
            {puntosOrdenados.map((punto) => {
              const altura = (punto.cantidad / maxCantidad) * ALTURA_MAX_BARRA;

              return (
                <Tooltip key={punto.colector}>
                  <TooltipTrigger asChild>
                    <button
                      aria-label={`${String(punto.cantidad)} cantos de ${punto.colector}`}
                      className="w-16 cursor-pointer rounded-t transition-opacity hover:opacity-90 focus:outline-none"
                      style={{
                        height: Math.max(altura, 6),
                        backgroundColor: COLOR_BARRA,
                      }}
                      type="button"
                    />
                  </TooltipTrigger>
                  <TooltipContent
                    className="border border-gray-200 bg-white text-gray-900 shadow-md"
                    side="top"
                  >
                    <div className="space-y-0.5">
                      <p className="font-medium">{punto.colector}</p>
                      <p className="text-xs text-gray-600">
                        {punto.cantidad} {punto.cantidad === 1 ? "canto" : "cantos"}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </div>
      ) : (
        // Layout original con barras finas (muchos datos)
        <div className="flex w-full items-end gap-px" style={{height: ALTURA_MAX_BARRA + 16}}>
          <TooltipProvider delayDuration={0}>
            {puntosOrdenados.map((punto) => {
              const altura = (punto.cantidad / maxCantidad) * ALTURA_MAX_BARRA;
              return (
                <Tooltip key={punto.colector}>
                  <TooltipTrigger asChild>
                    <button
                      aria-label={`${punto.cantidad} cantos de ${punto.colector}`}
                      className="min-w-0 flex-1 cursor-pointer rounded-t transition-opacity hover:opacity-90 focus:outline-none"
                      style={{
                        height: Math.max(altura, 6),
                        backgroundColor: COLOR_BARRA,
                      }}
                      type="button"
                    />
                  </TooltipTrigger>
                  <TooltipContent
                    className="border border-gray-200 bg-white text-gray-900 shadow-md"
                    side="top"
                  >
                    <div className="space-y-0.5">
                      <p className="font-medium">{punto.colector}</p>
                      <p className="text-xs text-gray-600">
                        {punto.cantidad} {punto.cantidad === 1 ? "canto" : "cantos"}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </div>
      )}
    </div>
  );
}
