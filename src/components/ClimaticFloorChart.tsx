import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {RANGE_DASH} from "@/lib/format-range";
import {
  ALTITUDE_MARKERS,
  CLIMATIC_FLOORS,
  FLOOR_DEFAULT_COLOR,
  floorStartPercentage,
  floorWidthPercentage,
  getFloorActiveSegment,
  type AltitudinalRange,
} from "@/lib/pisos-altitudinales";

interface ClimaticFloorChartProps {
  readonly altitudinalRange: AltitudinalRange;
}

export default function ClimaticFloorChart({altitudinalRange}: ClimaticFloorChartProps) {
  return (
    <div className="box-border flex w-full max-w-full min-w-0 flex-col items-center overflow-hidden px-2 sm:px-6">
      {/* Gráfico de pisos climáticos - Referencia geográfica */}
      <div className="mb-1 flex w-full justify-between text-[9px] text-gray-400 sm:text-[10px]">
        <span>← Occidental</span>
        <span>Oriental →</span>
      </div>
      <div className="relative flex h-6 w-full sm:h-8">
        {/* Base: todos los pisos en color plomo */}
        {CLIMATIC_FLOORS.map((floor, index) => (
          <div
            key={`floor-base-${floor.name}`}
            className="h-full"
            style={{
              backgroundColor: FLOOR_DEFAULT_COLOR,
              width: `${String(floorWidthPercentage(floor))}%`,
              borderRight: index === CLIMATIC_FLOORS.length - 1 ? "none" : "1px solid white",
            }}
            title={`${floor.name} (${String(floor.min)}${RANGE_DASH}${String(floor.max)} m) - ${floor.region}`}
          />
        ))}

        {/* Fragmentos activos: solo las partes dentro del rango de la especie */}
        {CLIMATIC_FLOORS.map((floor, index) => {
          const activeSegment = getFloorActiveSegment(
            floor,
            floorStartPercentage(index),
            floorWidthPercentage(floor),
            altitudinalRange,
          );

          if (!activeSegment) return null;

          return (
            <TooltipProvider key={`floor-active-${floor.name}`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="absolute top-0 h-full cursor-pointer"
                    style={{
                      backgroundColor: activeSegment.color,
                      left: `${String(activeSegment.left)}%`,
                      width: `${String(activeSegment.width)}%`,
                      pointerEvents: "auto",
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-xs font-normal text-white">
                    <p className="font-normal">{floor.name}</p>
                    <p>
                      {activeSegment.from}-{activeSegment.to}m
                    </p>
                    <p className="text-[10px] text-gray-400">{floor.region}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>

      {/* Etiquetas de altitud */}
      <div className="relative mt-1 w-full">
        <div className="relative flex h-4 w-full">
          {ALTITUDE_MARKERS.map((marker, index) => {
            // "0m" pegado a sus extremos para que no se corte en mobile
            const isStart = index === 0;
            const isEnd = index === ALTITUDE_MARKERS.length - 1;

            return (
              <div
                key={`altitude-marker-${String(index)}`}
                className="absolute text-[9px] whitespace-nowrap text-gray-600 sm:text-[10px]"
                style={{
                  left: `${String(marker.position)}%`,
                  transform: isStart
                    ? "translateX(0)"
                    : isEnd
                      ? "translateX(-100%)"
                      : "translateX(-50%)",
                }}
              >
                {marker.altitude}m
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
