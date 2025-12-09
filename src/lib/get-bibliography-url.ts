import { generatePublicacionSlug } from "./generate-publicacion-slug";

/**
 * Genera la URL para una página de bibliografía
 */
export function getBibliographyUrl(
  citaCorta: string | null,
  año: number | null,
  titulo: string | null,
  idPublicacion: number,
): string {
  const slug = generatePublicacionSlug(citaCorta, año, titulo, idPublicacion);
  return `/bibliography/${slug}`;
}
