import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";

interface ClimaticFloorChartFilterProps {
  readonly altitudinalRange: {
    readonly min: number;
    readonly max: number;
  };
}

export default function ClimaticFloorChartFilter({
  altitudinalRange,
}: ClimaticFloorChartFilterProps) {
  // Colores representando Costa → Sierra → Oriente (Ecuador)
  const colorPalette = [
    "#C5D86D", // Verde claro - Tropical
    "#C8C4A4", // Beige claro - Subtropical
    "#9B9764", // Beige grisáceo - Templado
    "#7D7645", // Marrón - Altoandino
  ];

  // Pisos climáticos (solo occidental para simplificar el filtro)
  const climaticFloors = [
    {name: "Tropical", min: 0, max: 1000, colorIndex: 0},
    {name: "Subtropical", min: 1000, max: 2300, colorIndex: 1},
    {name: "Templado", min: 2300, max: 3400, colorIndex: 2},
    {name: "Altoandino", min: 3400, max: 4800, colorIndex: 3},
  ];

  const totalAltitudeRange = 4800;
  const defaultColor = "#9CA3AF";

  // Calcular si un piso está activo según el rango seleccionado
  const getFloorActiveSegment = (floor: (typeof climaticFloors)[0], floorStartPosition: number) => {
    const speciesMin = Math.min(altitudinalRange.min, altitudinalRange.max);
    const speciesMax = Math.max(altitudinalRange.min, altitudinalRange.max);

    // Si el rango está en los valores por defecto (0-4800), mostrar todo activo
    const isDefaultRange = speciesMin === 0 && speciesMax === 4800;

    if (isDefaultRange) {
      const floorRange = floor.max - floor.min;
      const widthPercentage = (floorRange / totalAltitudeRange) * 100;

      return {
        left: floorStartPosition,
        width: widthPercentage,
        color: colorPalette[floor.colorIndex],
      };
    }

    // Calcular la intersección entre el rango del piso y el rango seleccionado
    const intersectionStart = Math.max(speciesMin, floor.min);
    const intersectionEnd = Math.min(speciesMax, floor.max);

    if (intersectionStart >= intersectionEnd) {
      return null;
    }

    const floorRange = floor.max - floor.min;
    const positionInFloorStart = ((intersectionStart - floor.min) / floorRange) * 100;
    const positionInFloorEnd = ((intersectionEnd - floor.min) / floorRange) * 100;
    const widthInFloor = positionInFloorEnd - positionInFloorStart;

    const floorWidthPercentage = (floorRange / totalAltitudeRange) * 100;
    const absoluteLeft = floorStartPosition + (positionInFloorStart / 100) * floorWidthPercentage;
    const absoluteWidth = (widthInFloor / 100) * floorWidthPercentage;

    return {
      left: absoluteLeft,
      width: absoluteWidth,
      color: colorPalette[floor.colorIndex],
    };
  };

  return (
    <div className="flex w-full flex-col">
      {/* Gráfico de pisos climáticos */}
      <div className="relative flex h-6 w-full overflow-hidden rounded">
        {/* Base: Todos los pisos en color plomo */}
        {climaticFloors.map((floor, index) => {
          const floorRange = floor.max - floor.min;
          const widthPercentage = (floorRange / totalAltitudeRange) * 100;

          return (
            <div
              key={`floor-base-${floor.name}`}
              className="h-full"
              style={{
                backgroundColor: defaultColor,
                width: `${widthPercentage}%`,
                borderRight: index < climaticFloors.length - 1 ? "1px solid white" : "none",
              }}
            />
          );
        })}

        {/* Fragmentos activos */}
        {climaticFloors.map((floor, index) => {
          const floorRange = floor.max - floor.min;
          let cumulativeWidth = 0;

          for (let i = 0; i < index; i++) {
            const prevFloorRange = climaticFloors[i].max - climaticFloors[i].min;

            cumulativeWidth += (prevFloorRange / totalAltitudeRange) * 100;
          }

          const activeSegment = getFloorActiveSegment(floor, cumulativeWidth);

          if (activeSegment) {
            const speciesMin = Math.min(altitudinalRange.min, altitudinalRange.max);
            const speciesMax = Math.max(altitudinalRange.min, altitudinalRange.max);
            const intersectionStart = Math.max(speciesMin, floor.min);
            const intersectionEnd = Math.min(speciesMax, floor.max);

            return (
              <TooltipProvider key={`floor-active-${floor.name}`}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="absolute top-0 h-full cursor-pointer"
                      style={{
                        backgroundColor: activeSegment.color,
                        left: `${activeSegment.left}%`,
                        width: `${activeSegment.width}%`,
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs">
                      <p className="font-semibold">{floor.name}</p>
                      <p>
                        {intersectionStart}-{intersectionEnd}m
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          }

          return null;
        })}
      </div>

      {/* Etiquetas de pisos */}
      <div className="mt-1 flex w-full">
        {climaticFloors.map((floor, index) => {
          const floorRange = floor.max - floor.min;
          const widthPercentage = (floorRange / totalAltitudeRange) * 100;

          return (
            <div
              key={`label-${floor.name}`}
              className="overflow-hidden text-center text-[8px] text-gray-500"
              style={{width: `${widthPercentage}%`}}
            >
              {floor.name}
            </div>
          );
        })}
      </div>
    </div>
  );
}
