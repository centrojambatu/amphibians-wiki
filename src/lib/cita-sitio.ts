/**
 * Cita sugerida del sitio. La usan la ficha web y el PDF exportable, así que
 * vive aquí para que no se separen.
 */
export const SITE_URL = "https://anfibiosecuador.ec";

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export const formatFechaLarga = (fecha: Date): string =>
  `${String(fecha.getDate())} ${MESES[fecha.getMonth()]} ${String(fecha.getFullYear())}`;

/** Año de `fecha_actualizacion`, con el año en curso como respaldo. */
export const getAnoActualizacion = (
  fechaActualizacion: unknown,
  hoy: Date = new Date(),
): string => {
  const fechaStr =
    typeof fechaActualizacion === "string"
      ? fechaActualizacion
      : fechaActualizacion instanceof Date
        ? fechaActualizacion.toISOString()
        : "";
  const parsed = fechaStr ? new Date(fechaStr) : null;

  if (parsed && !Number.isNaN(parsed.getTime())) {
    return String(parsed.getFullYear());
  }

  const yearMatch = /\b(19|20)\d{2}\b/.exec(fechaStr);

  return yearMatch ? yearMatch[0] : String(hoy.getFullYear());
};

/** Versión en texto plano, la que copia el botón y la que imprime el PDF. */
export const buildCitaSugerida = ({
  ano,
  nombreCientifico,
  fechaConsulta,
}: {
  ano: string;
  nombreCientifico?: string | null;
  fechaConsulta: string;
}): string =>
  [
    `Centro Jambatu. ${ano}.`,
    nombreCientifico ? `Anfibios Ecuador: ${nombreCientifico}.` : "Anfibios Ecuador.",
    `Referencia en línea. Version 2.0. Base de datos electrónica en ${SITE_URL}.`,
    `Centro Jambatu de Investigación y Conservación de Anfibios, Quito, Ecuador. (Consultado en: ${fechaConsulta})`,
  ].join(" ");
