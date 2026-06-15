"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { DatosHistograma } from "@/app/sapoteca/get-histograma-publicaciones";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SapotecaHistogramaChartProps {
  data: DatosHistograma;
  idsTiposCientificas: number[];
}

// Alturas máximas vienen del contenedor (h-[140px] sm:h-[220px]); las barras se
// dimensionan como % relativo a esa altura.
const COLOR_BARRA = "#f07304";
const COLOR_BARRA_SELECCIONADA = "#d86503";
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

  const Pie = (
    <div className="mt-4 flex items-center gap-4">
      <p className="text-lg font-semibold text-gray-500">
        Publicaciones científicas por año <span className="text-[#f07304]">|</span>{" "}
        <span className="text-gray-500">total {totalPublicaciones.toLocaleString()}</span>
      </p>
    </div>
  );

  if (puntos.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-6">
        <p className="text-sm text-gray-500">No hay datos disponibles.</p>
        {Pie}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-6">
      {/* Altura mobile-first: ~140px en móvil, 220px en sm+ (alturas por porcentaje
          se calculan dentro del contenedor responsive). */}
      <div className="flex h-[140px] w-full items-end gap-px sm:h-[220px]">
        <TooltipProvider delayDuration={0}>
          {puntos.map((punto) => {
            const porcentaje = maxCantidad > 0 ? (punto.cantidad / maxCantidad) * 100 : 0;
            const tieneDatos = punto.cantidad > 0;
            const seleccionada = añosActivos.has(punto.año);

            return (
              <div
                key={punto.año}
                className="flex h-full min-w-0 flex-1 items-end justify-center"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="w-[5px] cursor-pointer rounded-t transition-colors hover:opacity-90 focus:outline-none"
                      style={{
                        height: tieneDatos ? `max(${porcentaje}%, 6px)` : "2px",
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
              </div>
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

      {Pie}
    </div>
  );
}
