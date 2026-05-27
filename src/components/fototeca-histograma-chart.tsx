"use client";

import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";

export interface PuntoHistogramaAutorFoto {
  autor: string;
  cantidad: number;
}

interface FototecaHistogramaChartProps {
  puntos: PuntoHistogramaAutorFoto[];
  totalFotos: number;
  totalSinAutor: number;
}

const ALTURA_MAX_BARRA = 200;
const COLOR_BARRA = "#f07304";
const POCOS_DATOS_UMBRAL = 12;

export default function FototecaHistogramaChart({
  puntos,
  totalFotos,
  totalSinAutor,
}: FototecaHistogramaChartProps) {
  const puntosOrdenados = [...puntos].sort((a, b) => b.cantidad - a.cantidad);
  const maxCantidad = Math.max(...puntosOrdenados.map((p) => p.cantidad), 1);
  const pocosDatos = puntosOrdenados.length > 0 && puntosOrdenados.length <= POCOS_DATOS_UMBRAL;

  const Pie = (
    <div className="mt-4 flex items-center gap-4">
      <p className="text-lg font-semibold text-gray-500">
        Fotografías por autor <span className="text-[#f07304]">|</span>{" "}
        <span className="text-gray-500">total {totalFotos.toLocaleString()} fotos</span>
      </p>
    </div>
  );

  if (puntosOrdenados.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white px-6 pt-6 pb-4">
        <p className="text-sm text-gray-500">No hay datos disponibles.</p>
        {Pie}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-6 pt-6 pb-4">
      {pocosDatos ? (
        <div
          className="flex w-full items-end justify-center gap-6"
          style={{height: ALTURA_MAX_BARRA + 16}}
        >
          <TooltipProvider delayDuration={0}>
            {puntosOrdenados.map((punto) => {
              const altura = (punto.cantidad / maxCantidad) * ALTURA_MAX_BARRA;

              return (
                <Tooltip key={punto.autor}>
                  <TooltipTrigger asChild>
                    <button
                      aria-label={`${String(punto.cantidad)} fotos de ${punto.autor}`}
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
                      <p className="font-medium">{punto.autor}</p>
                      <p className="text-xs text-gray-600">
                        {punto.cantidad} {punto.cantidad === 1 ? "foto" : "fotos"}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </div>
      ) : (
        <div className="flex w-full items-end gap-px" style={{height: ALTURA_MAX_BARRA + 16}}>
          <TooltipProvider delayDuration={0}>
            {puntosOrdenados.map((punto) => {
              const altura = (punto.cantidad / maxCantidad) * ALTURA_MAX_BARRA;

              return (
                <Tooltip key={punto.autor}>
                  <TooltipTrigger asChild>
                    <button
                      aria-label={`${String(punto.cantidad)} fotos de ${punto.autor}`}
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
                      <p className="font-medium">{punto.autor}</p>
                      <p className="text-xs text-gray-600">
                        {punto.cantidad} {punto.cantidad === 1 ? "foto" : "fotos"}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </div>
      )}

      {Pie}
    </div>
  );
}
