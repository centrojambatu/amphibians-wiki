/**
 * Geometría de la barra de pisos altitudinales.
 *
 * La comparten `ClimaticFloorChart` (la ficha web) y `ficha-pdf` (la barra
 * vectorial del PDF), para que las dos pinten exactamente lo mismo.
 */
export interface AltitudinalRange {
  readonly min: number;
  readonly max: number;
  readonly occidente?: {min: number; max: number};
  readonly oriente?: {min: number; max: number};
}

export interface ClimaticFloor {
  readonly name: string;
  readonly min: number;
  readonly max: number;
  readonly colorIndex: number;
  readonly region: string;
}

// Costa → Sierra → Oriente (Ecuador)
export const FLOOR_COLORS = [
  "#C5D86D", // [0] Verde claro - Costa
  "#C8C4A4", // [1] Beige claro - Pie de monte/zona seca
  "#9B9764", // [2] Beige grisáceo - Sierra baja
  "#7D7645", // [3] Marrón - Sierra alta/andina
  "#7D7645", // [4] Marrón - Sierra alta/andina
  "#9B9764", // [5] Beige grisáceo - Sierra baja
  "#C8C4A4", // [6] Beige grisáceo - Vertiente oriental andina
  "#C5D86D", // [7] Verde claro - Selva baja/Oriente
];

/** Gris plomo de los tramos fuera del rango de la especie. */
export const FLOOR_DEFAULT_COLOR = "#9CA3AF";

export const CLIMATIC_FLOORS: ClimaticFloor[] = [
  // Occidente (ascendente)
  {name: "Tropical Occidental", min: 0, max: 1000, colorIndex: 0, region: "Costa del Pacífico"},
  {
    name: "Subtropical Occidental",
    min: 1000,
    max: 2300,
    colorIndex: 1,
    region: "Vertiente occidental",
  },
  {
    name: "Templada Occidental",
    min: 2300,
    max: 3400,
    colorIndex: 2,
    region: "Vertiente occidental",
  },
  {name: "Altoandina Occidental", min: 3400, max: 4800, colorIndex: 3, region: "Páramo occidental"},
  // Oriente (descendente)
  {name: "Altoandina Oriental", min: 4800, max: 3400, colorIndex: 3, region: "Páramo oriental"},
  {name: "Templada Oriental", min: 3400, max: 2300, colorIndex: 2, region: "Vertiente oriental"},
  {name: "Subtropical Oriental", min: 2300, max: 1000, colorIndex: 1, region: "Amazonía alta"},
  {name: "Tropical Oriental", min: 1000, max: 0, colorIndex: 0, region: "Amazonía baja"},
];

/** Suma de todos los pisos: 1000+1300+1100+1400+1400+1100+1300+1000. */
export const TOTAL_ALTITUDE_RANGE = 9600;

/** Ancho del piso como porcentaje de la barra completa. */
export const floorWidthPercentage = (floor: ClimaticFloor): number =>
  (Math.abs(floor.max - floor.min) / TOTAL_ALTITUDE_RANGE) * 100;

/** Posición acumulada del piso dentro de la barra, en porcentaje. */
export const floorStartPercentage = (index: number): number =>
  CLIMATIC_FLOORS.slice(0, index).reduce((acc, floor) => acc + floorWidthPercentage(floor), 0);

const getActiveVertientes = (range: AltitudinalRange): ("occidente" | "oriente")[] => {
  // Si hay rangos específicos por vertiente, activar las que existan.
  if (range.occidente || range.oriente) {
    const vertientes: ("occidente" | "oriente")[] = [];

    if (range.occidente) vertientes.push("occidente");
    if (range.oriente) vertientes.push("oriente");

    return vertientes;
  }

  // Con un solo rango general, la vertiente la decide el punto medio.
  const speciesMin = Math.min(range.min, range.max);
  const speciesMax = Math.max(range.min, range.max);
  const midPoint = (speciesMin + speciesMax) / 2;

  return midPoint <= 2500 ? ["occidente"] : ["oriente"];
};

/**
 * Los pisos occidentales van de menor a mayor (0→4800) y los orientales al
 * revés, así que cada uno solo se activa en su dirección.
 */
const isFloorInCorrectDirection = (floor: ClimaticFloor, range: AltitudinalRange): boolean => {
  const activeVertientes = getActiveVertientes(range);
  const isOccidental = floor.name.toLowerCase().includes("occidental");
  const isOriental = floor.name.toLowerCase().includes("oriental");
  const floorIsAscending = floor.min < floor.max;
  const floorIsDescending = floor.min > floor.max;

  // Pisos sin vertiente: hoy no hay ninguno, se conserva por si se añaden.
  if (!isOccidental && !isOriental) {
    if (range.occidente || range.oriente) {
      const occidenteHigh =
        range.occidente && Math.max(range.occidente.min, range.occidente.max) >= 3400;
      const orienteHigh = range.oriente && Math.max(range.oriente.min, range.oriente.max) >= 3400;

      return Boolean(occidenteHigh || orienteHigh) && floorIsAscending;
    }

    const speciesMin = Math.min(range.min, range.max);
    const speciesMax = Math.max(range.min, range.max);

    return (speciesMin + speciesMax) / 2 >= 3400 && floorIsAscending;
  }

  if (isOccidental && floorIsAscending) return activeVertientes.includes("occidente");
  if (isOriental && floorIsDescending) return activeVertientes.includes("oriente");

  return false;
};

/** Rango de la especie que aplica a este piso, según su vertiente. */
export const speciesRangeForFloor = (
  floor: ClimaticFloor,
  range: AltitudinalRange,
): {min: number; max: number} => {
  const isOccidental = floor.name.toLowerCase().includes("occidental");
  const isOriental = floor.name.toLowerCase().includes("oriental");

  if (isOccidental && range.occidente) {
    return {
      min: Math.min(range.occidente.min, range.occidente.max),
      max: Math.max(range.occidente.min, range.occidente.max),
    };
  }
  if (isOriental && range.oriente) {
    return {
      min: Math.min(range.oriente.min, range.oriente.max),
      max: Math.max(range.oriente.min, range.oriente.max),
    };
  }

  return {min: Math.min(range.min, range.max), max: Math.max(range.min, range.max)};
};

export interface ActiveSegment {
  /** Posición izquierda dentro de la barra completa, en porcentaje. */
  left: number;
  /** Ancho dentro de la barra completa, en porcentaje. */
  width: number;
  color: string;
  /** Tramo altitudinal que representa, para el tooltip. */
  from: number;
  to: number;
}

/** Fragmento coloreado del piso, o null si la especie no lo ocupa. */
export const getFloorActiveSegment = (
  floor: ClimaticFloor,
  floorStartPosition: number,
  widthPercentage: number,
  range: AltitudinalRange,
): ActiveSegment | null => {
  if (range.min === 0 && range.max === 0) return null;
  if (!isFloorInCorrectDirection(floor, range)) return null;

  const floorMin = Math.min(floor.min, floor.max);
  const floorMax = Math.max(floor.min, floor.max);
  const {min: speciesMin, max: speciesMax} = speciesRangeForFloor(floor, range);

  const intersectionStart = Math.max(speciesMin, floorMin);
  const intersectionEnd = Math.min(speciesMax, floorMax);

  if (intersectionStart > intersectionEnd) return null;

  const floorRange = floorMax - floorMin;
  const isDescending = floor.min > floor.max;

  // En los pisos orientales la barra se recorre de max a min.
  const positionInFloorStart = isDescending
    ? ((floorMax - intersectionEnd) / floorRange) * 100
    : ((intersectionStart - floorMin) / floorRange) * 100;
  const positionInFloorEnd = isDescending
    ? ((floorMax - intersectionStart) / floorRange) * 100
    : ((intersectionEnd - floorMin) / floorRange) * 100;

  return {
    left: floorStartPosition + (positionInFloorStart / 100) * widthPercentage,
    width: ((positionInFloorEnd - positionInFloorStart) / 100) * widthPercentage,
    color: FLOOR_COLORS[floor.colorIndex],
    from: intersectionStart,
    to: intersectionEnd,
  };
};

/** Marcas de altitud bajo la barra. */
export const ALTITUDE_MARKERS = [
  {altitude: 0, position: 0},
  {altitude: 4800, position: (4800 / TOTAL_ALTITUDE_RANGE) * 100},
  {altitude: 0, position: 100},
];
