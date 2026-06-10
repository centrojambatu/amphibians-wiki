/** Raya (em dash) para intervalos numéricos, p. ej. 1200—3400 m */
export const RANGE_DASH = "\u2014";

export function formatNumericRange(
  min: number | null | undefined,
  max: number | null | undefined,
  unit = "",
): string | null {
  const hasMin = min != null;
  const hasMax = max != null;
  const suffix = unit ? (unit.startsWith(" ") ? unit : ` ${unit}`) : "";

  if (hasMin && hasMax) {
    return `${min}${RANGE_DASH}${max}${suffix}`;
  }
  if (hasMin) {
    return `Mín: ${min}${suffix}`;
  }
  if (hasMax) {
    return `Máx: ${max}${suffix}`;
  }

  return null;
}
