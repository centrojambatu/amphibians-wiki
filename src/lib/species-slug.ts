/**
 * Convierte el segmento de URL de una especie (ya decodificado) en lo que espera getFichaEspecie.
 *
 * - Un número (id_ficha_especie) se devuelve tal cual.
 * - Un slug "Genero-epiteto" se convierte en "Genero epiteto". Solo el **primer** guion separa
 *   género y epíteto: los géneros nunca llevan guion, pero el epíteto sí puede
 *   ("Pristimantis-w-nigrum" -> "Pristimantis w-nigrum"). Todos los nombres son binomios.
 */
export const slugANombreCientifico = (segmento: string): string =>
  /^\d+$/.test(segmento) ? segmento : segmento.replace("-", " ");
