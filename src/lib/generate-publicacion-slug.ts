/**
 * Genera un slug único para una publicación basado en la cita corta, año y título
 * Formato similar a: Coloma-1986-El-napipiripri
 */
export function generatePublicacionSlug(
  citaCorta: string | null,
  año: number | null,
  titulo: string | null,
  idPublicacion: number,
): string {
  // Si no hay cita_corta, usar id_publicacion como fallback
  if (!citaCorta) {
    return `publicacion-${idPublicacion}`;
  }

  // Extraer el primer apellido del autor (antes del paréntesis o coma)
  let autor = citaCorta.split("(")[0].split(",")[0].trim();

  // Si hay múltiples autores (separados por "y"), tomar el primero
  if (autor.includes(" y ")) {
    autor = autor.split(" y ")[0].trim();
  }

  // Normalizar y limpiar el autor: remover acentos y caracteres especiales
  autor = autor
    .normalize("NFD") // Normalizar a NFD (descomponer acentos)
    .replaceAll(/[\u0300-\u036f]/g, "") // Remover diacríticos (acentos)
    .replaceAll(/[^a-zA-Z0-9\s-]/g, "") // Remover caracteres especiales excepto guiones
    .replaceAll(/\s+/g, "-") // Reemplazar espacios con guiones
    .replaceAll(/-+/g, "-") // Múltiples guiones a uno solo
    .replaceAll(/^-|-$/g, "") // Remover guiones al inicio/final
    .toLowerCase();

  // Obtener el año
  const añoStr = año ? String(año) : "";

  // Obtener las primeras palabras del título (máximo 5 palabras)
  let tituloSlug = "";
  if (titulo) {
    // Remover HTML tags
    let tituloSinHtml = titulo.replaceAll(/<[^>]*>/g, "");

    // Remover años al inicio del título si coinciden con el año de la publicación
    // Esto evita duplicar el año en el slug (ej: "2002. The title" -> "the title")
    if (año) {
      const añoStr = String(año);
      // Remover patrones como "(2002)", "2002.", "(2002–", etc.
      tituloSinHtml = tituloSinHtml.replace(
        new RegExp(`^\\(?${añoStr}[–-]?[^\\s]*\\)?\\s*[.:]?\\s*`, "gi"),
        "",
      );
      // También remover si el título empieza directamente con el año
      tituloSinHtml = tituloSinHtml.replace(
        new RegExp(`^${añoStr}\\s*[.:]?\\s*`, "gi"),
        "",
      );
    }

    // Tomar primeras 5 palabras (después de limpiar)
    const palabras = tituloSinHtml
      .trim()
      .split(/\s+/)
      .filter((p) => p.length > 0)
      .slice(0, 5);
    tituloSlug = palabras
      .join("-")
      .normalize("NFD") // Normalizar a NFD (descomponer acentos)
      .replaceAll(/[\u0300-\u036f]/g, "") // Remover diacríticos (acentos)
      .replaceAll(/[^a-zA-Z0-9\s-]/g, "") // Remover caracteres especiales
      .replaceAll(/-+/g, "-") // Múltiples guiones a uno solo
      .replaceAll(/^[-]+|[-]+$/g, "") // Remover guiones al inicio/final
      .toLowerCase();
  }

  // Construir el slug: autor-año-título
  const partes = [autor];
  if (añoStr) partes.push(añoStr);
  if (tituloSlug) partes.push(tituloSlug);

  return partes.join("-");
}

/**
 * Convierte un slug de vuelta a componentes para búsqueda
 */
export function parsePublicacionSlug(slug: string): {
  autor?: string;
  año?: string;
  titulo?: string;
} {
  const partes = slug.split("-");
  const añoMatch = partes.find((p) => /^\d{4}$/.test(p));

  return {
    autor: partes[0],
    año: añoMatch,
    titulo: partes.slice(añoMatch ? partes.indexOf(añoMatch) + 1 : 1).join("-"),
  };
}
