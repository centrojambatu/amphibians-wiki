"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { DatosHistograma } from "@/app/sapoteca/get-histograma-publicaciones";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SapotecaHistogramaChartProps {
  data: DatosHistograma;
  idsTiposCientificas: number[];
}

const ALTURA_MAX_BARRA = 220;
const COLOR_BARRA = "#67aa4d";
const COLOR_BARRA_SELECCIONADA = "#4a7c39";
const COLOR_BARRA_CERO = "#e5e7eb";
const COLOR_BARRA_CERO_SELECCIONADA = "#d1d5db";

export default function SapotecaHistogramaChart({
  data,
  idsTiposCientificas,
}: SapotecaHistogramaChartProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { puntos, totalPublicaciones } = data;
  const maxCantidad = Math.max(...puntos.map((p) => p.cantidad), 1);

  const añosActivos = new Set(
    (searchParams.get("años") ?? "")
      .split(",")
      .map((s) => Number.parseInt(s.trim(), 10))
      .filter((n) => !Number.isNaN(n)),
  );

  const handleBarClick = (año: number) => {
    const params = new URLSearchParams();
    params.set("años", String(año));
    if (idsTiposCientificas.length > 0) {
      params.set("tipos", idsTiposCientificas.join(","));
    }
    router.push(`/sapoteca?${params.toString()}`, { scroll: false });
  };

  if (puntos.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-lg font-semibold text-gray-800">
          Publicaciones científicas por año (1849 – {new Date().getFullYear()})
        </p>
        <p className="mt-4 text-sm text-gray-500">No hay datos disponibles.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-4">
        <p className="text-lg font-semibold text-gray-800">
          Publicaciones científicas por año <span className="text-[#f07304]">|</span>{" "}
          <span className="text-gray-500">total {totalPublicaciones.toLocaleString()}</span>
        </p>
      </div>

      <div className="flex w-full items-end gap-px" style={{ height: ALTURA_MAX_BARRA + 32 }}>
        <TooltipProvider delayDuration={0}>
          {puntos.map((punto) => {
            const altura = maxCantidad > 0 ? (punto.cantidad / maxCantidad) * ALTURA_MAX_BARRA : 0;
            const tieneDatos = punto.cantidad > 0;
            const seleccionada = añosActivos.has(punto.año);

            return (
              <Tooltip key={punto.año}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="min-w-0 flex-1 cursor-pointer rounded-t transition-colors hover:opacity-90 focus:outline-none"
                    style={{
                      height: tieneDatos ? Math.max(altura, 6) : 2,
                      backgroundColor: seleccionada
                        ? tieneDatos
                          ? COLOR_BARRA_SELECCIONADA
                          : COLOR_BARRA_CERO_SELECCIONADA
                        : tieneDatos
                          ? COLOR_BARRA
                          : COLOR_BARRA_CERO,
                    }}
                    onClick={() => tieneDatos && handleBarClick(punto.año)}
                    aria-label={`Filtrar publicaciones del año ${String(punto.año)}`}
                  />
                </TooltipTrigger>
                <TooltipContent
                  className="border border-gray-200 bg-white text-gray-900 shadow-md"
                  side="top"
                >
                  <div className="space-y-0.5">
                    <p className="font-medium">{punto.año}</p>
                    <p className="text-xs text-gray-600">
                      {punto.cantidad} {punto.cantidad === 1 ? "publicación científica" : "publicaciones científicas"}
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
            <div key={punto.año} className="min-w-0 flex-1 text-center">
              {mostrar ? punto.año : ""}
            </div>
          );
        })}
      </div>
    </div>
  );
}
