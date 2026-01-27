/**
 * Genera la URL para una página de bibliografía usando el ID
 */
export function getBibliographyUrl(
  _citaCorta: string | null,
  _año: number | null,
  _titulo: string | null,
  idPublicacion: number,
): string {
  return `/bibliography/${idPublicacion}`;
}
