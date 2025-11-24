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

