/**
 * Procesa el HTML para agregar estilos inline a todos los enlaces
 * Esto asegura que los enlaces tengan el color verde correcto, el efecto hover,
 * y que se abran en una nueva pestaña
 */
export const processHTMLLinks = (html: string | undefined): string => {
  if (!html) return "";

  // Agregar estilos inline, target="_blank" y rel="noopener noreferrer" a todos los enlaces
  // Los estilos de fuente se heredan para que coincidan con el texto circundante
  return html.replace(
    /<a\s+([^>]*href="[^"]*"[^>]*)>/gi,
    "<a $1 target=\"_blank\" rel=\"noopener noreferrer\" style=\"color: #006d1b; text-decoration: none; font-family: inherit; font-size: inherit; font-weight: inherit; font-style: inherit; transition: color 0.3s ease;\" onmouseover=\"this.style.color='#004d13'; this.style.textDecoration='underline';\" onmouseout=\"this.style.color='#006d1b'; this.style.textDecoration='none';\">"
  );
};

/**
 * Procesa el texto para convertir {{id_publicacion}} a citas completas
 * En el renderizado, usa cita_corta (como se especificó)
 * @param texto - El texto que puede contener referencias {{id_publicacion}}
 * @param publicaciones - Array de publicaciones con publicacion.id_publicacion
 * @returns El texto con las referencias convertidas a cita_corta
 */
export const processCitationReferences = (
  texto: string | null | undefined,
  publicaciones: Array<{publicacion?: {id_publicacion?: number; cita_corta?: string | null}}> | null | undefined,
): string => {
  if (!texto) return "";
  if (!publicaciones || publicaciones.length === 0) return texto;

  let textoProcesado = texto;
  // Buscar patrones como {{123}} donde 123 es id_publicacion
  const citasEncontradas = texto.match(/\{\{(\d+)\}\}/g) || [];

  citasEncontradas.forEach((match) => {
    const idPublicacion = Number.parseInt(match.replaceAll(/\{\{|\}\}/g, ""), 10);
    // Buscar la publicación por id_publicacion
    const publicacion = publicaciones.find((pub) => pub.publicacion?.id_publicacion === idPublicacion)?.publicacion;

    if (publicacion && publicacion.cita_corta) {
      // Reemplazar {{id_publicacion}} con la cita_corta
      textoProcesado = textoProcesado.replace(match, publicacion.cita_corta);
    }
  });

  return textoProcesado;
};

