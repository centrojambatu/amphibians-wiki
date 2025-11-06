import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";

interface ClimaticFloorChartProps {
  readonly altitudinalRange: {
    readonly min: number;
    readonly max: number;
    readonly occidente?: {min: number; max: number};
    readonly oriente?: {min: number; max: number};
  };
  readonly climaticFloors: readonly string[];
}

export default function ClimaticFloorChart({
  altitudinalRange,
  climaticFloors,
}: ClimaticFloorChartProps) {
  // Colores representando Costa → Sierra → Oriente (Ecuador)
  // Verde claro → Beige claro → Beige grisáceo → Marrón → Beige grisáceo → Verde claro
  const colorPalette = [
    "#C5D86D", // [0] Verde claro - Costa (más brillante como en la imagen)
    "#C8C4A4", // [1] Beige claro - Pie de monte/zona seca
    "#9B9764", // [2] Beige grisáceo - Sierra baja (más marrón)
    "#7D7645", // [3] Marrón - Sierra alta/andina (más oscuro)
    "#7D7645", // [4] Marrón - Sierra alta/andina (más oscuro)
    "#9B9764", // [5] Beige grisáceo - Sierra baja (más marrón)
    "#C8C4A4", // [6] Beige grisáceo - Vertiente oriental andina
    "#C5D86D", // [7] Verde claro - Selva baja/Oriente (más brillante como en la imagen)
  ];

  const allClimaticFloors = [
    // Occidente (ascendente de 0 a 5000 en pasos de 1000)
    {name: "Tropical Occidental", min: 0, max: 1000, colorIndex: 0, region: "Costa"},
    {name: "Subtropical Occidental", min: 1000, max: 2000, colorIndex: 1, region: "Pie de monte"},
    {name: "Templado Occidental", min: 2000, max: 3000, colorIndex: 2, region: "Sierra baja"},
    {name: "Frío", min: 3000, max: 4000, colorIndex: 3, region: "Sierra alta"},
    {name: "Páramo", min: 4000, max: 5000, colorIndex: 4, region: "Pico máximo"},
    // Oriente (descendente de 5000 a 0 en pasos de 1000)
    {name: "Páramo Oriental", min: 5000, max: 4000, colorIndex: 4, region: "Pico máximo"},
    {name: "Frío Oriental", min: 4000, max: 3000, colorIndex: 3, region: "Sierra alta"},
    {name: "Templado Oriental", min: 3000, max: 2000, colorIndex: 2, region: "Sierra oriental"},
    {
      name: "Subtropical Oriental",
      min: 2000,
      max: 1000,
      colorIndex: 1,
      region: "Pie de monte oriental",
    },
    {name: "Tropical Oriental", min: 1000, max: 0, colorIndex: 0, region: "Oriente"},
  ];

  // Calcular el rango total altitudinal (0 a 5000 en occidente + 5000 a 0 en oriente)
  // Todos los pisos tienen 1000m: 10 pisos × 1000m = 10000m total
  const totalAltitudeRange = 1000 + 1000 + 1000 + 1000 + 1000 + 1000 + 1000 + 1000 + 1000 + 1000; // = 10000m total

  // Color plomo por defecto
  const defaultColor = "#9CA3AF"; // Gris plomo

  // Determinar qué vertientes deben activarse
  const getActiveVertientes = (): ("occidente" | "oriente")[] => {
    // Si hay rangos específicos por vertiente, activar ambas
    if (altitudinalRange.occidente || altitudinalRange.oriente) {
      const vertientes: ("occidente" | "oriente")[] = [];

      if (altitudinalRange.occidente) vertientes.push("occidente");
      if (altitudinalRange.oriente) vertientes.push("oriente");

      return vertientes;
    }

    // Si solo hay un rango general, determinar la vertiente por el punto medio
    const speciesMin = Math.min(altitudinalRange.min, altitudinalRange.max);
    const speciesMax = Math.max(altitudinalRange.min, altitudinalRange.max);
    const midPoint = (speciesMin + speciesMax) / 2;

    // Punto de corte: 2500m
    return midPoint <= 2500 ? ["occidente"] : ["oriente"];
  };

  // Determinar si un piso debe activarse basándose en su dirección (ascendente/descendente)
  // Los pisos occidentales van de menor a mayor (0→5000), los orientales de mayor a menor (5000→0)
  const isFloorInCorrectDirection = (floor: (typeof allClimaticFloors)[0]) => {
    const activeVertientes = getActiveVertientes();
    const isOccidental = floor.name.toLowerCase().includes("occidental");
    const isOriental = floor.name.toLowerCase().includes("oriental");

    // Determinar la dirección del piso
    const floorIsAscending = floor.min < floor.max; // Occidente: 0→5000
    const floorIsDescending = floor.min > floor.max; // Oriente: 5000→0

    // Pisos centrales (Frío, Páramo sin especificar vertiente)
    // Solo se activan si están en la mitad alta del rango
    if (!isOccidental && !isOriental) {
      // Si hay rangos específicos por vertiente, verificar ambos
      if (altitudinalRange.occidente || altitudinalRange.oriente) {
        const occidenteHigh =
          altitudinalRange.occidente &&
          Math.max(altitudinalRange.occidente.min, altitudinalRange.occidente.max) >= 3000;
        const orienteHigh =
          altitudinalRange.oriente &&
          Math.max(altitudinalRange.oriente.min, altitudinalRange.oriente.max) >= 3000;

        return (occidenteHigh || orienteHigh) && (floorIsAscending || floorIsDescending);
      }

      const speciesMin = Math.min(altitudinalRange.min, altitudinalRange.max);
      const speciesMax = Math.max(altitudinalRange.min, altitudinalRange.max);
      const midPoint = (speciesMin + speciesMax) / 2;

      return midPoint >= 3000 && (floorIsAscending || floorIsDescending);
    }

    // Pisos occidentales: solo activar si occidente está en vertientes activas
    if (isOccidental && floorIsAscending) {
      return activeVertientes.includes("occidente");
    }

    // Pisos orientales: solo activar si oriente está en vertientes activas
    if (isOriental && floorIsDescending) {
      return activeVertientes.includes("oriente");
    }

    return false;
  };

  // Calcular la posición y tamaño del fragmento activo dentro de cada piso
  const getFloorActiveSegment = (
    floor: (typeof allClimaticFloors)[0],
    floorStartPosition: number,
    floorWidthPercentage: number,
  ) => {
    if (altitudinalRange.min === 0 && altitudinalRange.max === 0) {
      return null;
    }

    // Verificar si el piso está en la dirección correcta (occidental u oriental)
    if (!isFloorInCorrectDirection(floor)) {
      return null;
    }

    // Normalizar el rango del piso
    const floorMin = Math.min(floor.min, floor.max);
    const floorMax = Math.max(floor.min, floor.max);

    // Determinar qué rango usar según la vertiente del piso
    const isOccidental = floor.name.toLowerCase().includes("occidental");
    const isOriental = floor.name.toLowerCase().includes("oriental");

    let speciesMin, speciesMax;

    if (isOccidental && altitudinalRange.occidente) {
      // Usar rango específico de occidente
      speciesMin = Math.min(altitudinalRange.occidente.min, altitudinalRange.occidente.max);
      speciesMax = Math.max(altitudinalRange.occidente.min, altitudinalRange.occidente.max);
    } else if (isOriental && altitudinalRange.oriente) {
      // Usar rango específico de oriente
      speciesMin = Math.min(altitudinalRange.oriente.min, altitudinalRange.oriente.max);
      speciesMax = Math.max(altitudinalRange.oriente.min, altitudinalRange.oriente.max);
    } else {
      // Usar rango general
      speciesMin = Math.min(altitudinalRange.min, altitudinalRange.max);
      speciesMax = Math.max(altitudinalRange.min, altitudinalRange.max);
    }

    // Calcular la intersección entre el rango del piso y el rango de la especie
    const intersectionStart = Math.max(speciesMin, floorMin);
    const intersectionEnd = Math.min(speciesMax, floorMax);

    // Si no hay intersección, retornar null
    if (intersectionStart > intersectionEnd) {
      return null;
    }

    // Determinar si el piso es descendente (oriental)
    const isDescending = floor.min > floor.max;
    const floorRange = floorMax - floorMin;

    let positionInFloorStart, positionInFloorEnd;

    if (isDescending) {
      // Para pisos descendentes (orientales): el piso va de max a min visualmente
      // Por ejemplo: Páramo Oriental 5000->4000, si intersección es 4500-4200:
      // - 4500 está al 50% del recorrido desde 5000 = (5000-4500)/1000 = 0.5
      // - 4200 está al 80% del recorrido desde 5000 = (5000-4200)/1000 = 0.8
      positionInFloorStart = ((floorMax - intersectionEnd) / floorRange) * 100;
      positionInFloorEnd = ((floorMax - intersectionStart) / floorRange) * 100;
    } else {
      // Para pisos ascendentes (occidentales): el piso va de min a max visualmente
      positionInFloorStart = ((intersectionStart - floorMin) / floorRange) * 100;
      positionInFloorEnd = ((intersectionEnd - floorMin) / floorRange) * 100;
    }

    const widthInFloor = positionInFloorEnd - positionInFloorStart;

    // Calcular la posición absoluta en la barra completa
    const absoluteLeft = floorStartPosition + (positionInFloorStart / 100) * floorWidthPercentage;
    const absoluteWidth = (widthInFloor / 100) * floorWidthPercentage;

    return {
      left: absoluteLeft,
      width: absoluteWidth,
      color: colorPalette[floor.colorIndex],
    };
  };

  return (
    <div className="flex w-full flex-col items-center">
      {/* Gráfico de pisos climáticos - Referencia geográfica */}
      <div className="relative flex h-8 w-full max-w-80">
        {/* Base: Todos los pisos en color plomo */}
        {allClimaticFloors.map((floor, index) => {
          const range = Math.abs(floor.max - floor.min);
          const widthPercentage = (range / totalAltitudeRange) * 100;
          let cumulativeWidth = 0;

          // Calcular la posición acumulada del piso
          for (let i = 0; i < index; i++) {
            const prevFloorRange = Math.abs(allClimaticFloors[i].max - allClimaticFloors[i].min);

            cumulativeWidth += (prevFloorRange / totalAltitudeRange) * 100;
          }

          const isLast = index === allClimaticFloors.length - 1;

          return (
            <div
              key={`floor-base-${floor.name}-${index}`}
              className="h-full"
              style={{
                backgroundColor: defaultColor,
                width: `${widthPercentage}%`,
                borderRight: isLast ? "none" : "1px solid white",
              }}
              title={`${floor.name} (${floor.min}-${floor.max}m) - ${floor.region}`}
            />
          );
        })}

        {/* Fragmentos activos: Solo las partes que están en el rango */}
        {allClimaticFloors.map((floor, index) => {
          const range = Math.abs(floor.max - floor.min);
          const widthPercentage = (range / totalAltitudeRange) * 100;
          let cumulativeWidth = 0;

          // Calcular la posición acumulada del piso
          for (let i = 0; i < index; i++) {
            const prevFloorRange = Math.abs(allClimaticFloors[i].max - allClimaticFloors[i].min);

            cumulativeWidth += (prevFloorRange / totalAltitudeRange) * 100;
          }

          const activeSegment = getFloorActiveSegment(floor, cumulativeWidth, widthPercentage);

          if (activeSegment) {
            // Calcular el rango específico que se está mostrando
            const floorMin = Math.min(floor.min, floor.max);
            const floorMax = Math.max(floor.min, floor.max);

            const isOccidental = floor.name.toLowerCase().includes("occidental");
            const isOriental = floor.name.toLowerCase().includes("oriental");

            let speciesMin, speciesMax;

            if (isOccidental && altitudinalRange.occidente) {
              speciesMin = Math.min(altitudinalRange.occidente.min, altitudinalRange.occidente.max);
              speciesMax = Math.max(altitudinalRange.occidente.min, altitudinalRange.occidente.max);
            } else if (isOriental && altitudinalRange.oriente) {
              speciesMin = Math.min(altitudinalRange.oriente.min, altitudinalRange.oriente.max);
              speciesMax = Math.max(altitudinalRange.oriente.min, altitudinalRange.oriente.max);
            } else {
              speciesMin = Math.min(altitudinalRange.min, altitudinalRange.max);
              speciesMax = Math.max(altitudinalRange.min, altitudinalRange.max);
            }

            const intersectionStart = Math.max(speciesMin, floorMin);
            const intersectionEnd = Math.min(speciesMax, floorMax);

            return (
              <TooltipProvider key={`floor-active-${floor.name}-${index}`}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="absolute top-0 h-full cursor-pointer"
                      style={{
                        backgroundColor: activeSegment.color,
                        left: `${activeSegment.left}%`,
                        width: `${activeSegment.width}%`,
                        pointerEvents: "auto",
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs">
                      <p className="font-semibold">{floor.name}</p>
                      <p>
                        {intersectionStart}-{intersectionEnd}m
                      </p>
                      <p className="text-[10px] text-gray-400">{floor.region}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          }

          return null;
        })}
      </div>

      {/* Rango altitudinal - Indica dónde está presente */}
      <div className="mt-1 text-xs text-gray-600">
        {altitudinalRange.min === 0 && altitudinalRange.max === 0 ? (
          "No presente"
        ) : altitudinalRange.occidente || altitudinalRange.oriente ? (
          <div className="flex items-center justify-center gap-2">
            {altitudinalRange.occidente && (
              <span>
                Occ: {altitudinalRange.occidente.min}-{altitudinalRange.occidente.max}m
              </span>
            )}
            {altitudinalRange.occidente && altitudinalRange.oriente && <span>|</span>}
            {altitudinalRange.oriente && (
              <span>
                Or: {altitudinalRange.oriente.min}-{altitudinalRange.oriente.max}m
              </span>
            )}
          </div>
        ) : (
          `${altitudinalRange.min}-${altitudinalRange.max}m`
        )}
      </div>
    </div>
  );
}
