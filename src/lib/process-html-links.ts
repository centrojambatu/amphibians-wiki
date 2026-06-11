/**
 * Procesa el HTML para agregar clases CSS a todos los enlaces
 * Esto asegura que los enlaces tengan el color verde correcto, el efecto hover,
 * y que se abran en una nueva pestaña
 * Usa clases CSS en lugar de eventos inline para evitar problemas de hidratación
 */
export const processHTMLLinks = (html: string | undefined): string => {
  if (!html) return "";

  // Agregar clases CSS, target="_blank" y rel="noopener noreferrer" a todos los enlaces
  return html.replaceAll(/<a\s+([^>]*?)>/gi, (match, attributes) => {
    // Verificar si ya tiene target y rel
    const hasTarget = /target=["']_blank["']/.test(attributes);
    const hasRel = /rel=["']/.test(attributes);

    // Agregar target si no existe
    let newAttributes = attributes;
    if (!hasTarget) {
      newAttributes += ' target="_blank"';
    }

    // Agregar rel si no existe
    if (!hasRel) {
      newAttributes += ' rel="noopener noreferrer"';
    } else if (!/rel=["'][^"']*noopener/.test(attributes)) {
      // Si tiene rel pero no tiene noopener, agregarlo
      newAttributes = newAttributes.replaceAll(
        /rel=["']([^"']*)["']/g,
        'rel="$1 noopener noreferrer"',
      );
    }

    // Verificar si ya tiene la clase processed-link
    const hasProcessedClass = /class=["'][^"']*processed-link/.test(attributes);

    if (!hasProcessedClass) {
      // Agregar clase processed-link
      const hasClass = /class=["']/.test(attributes);
      if (hasClass) {
        newAttributes = newAttributes.replaceAll(
          /class=["']([^"']*)["']/g,
          'class="$1 processed-link"',
        );
      } else {
        newAttributes += ' class="processed-link"';
      }
    }

    return `<a ${newAttributes}>`;
  });
};

const escapeAttr = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const stripHtmlTags = (html: string): string =>
  html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

/**
 * Procesa el texto para convertir {{id_publicacion}} a citas clicables.
 * Cada referencia se envuelve en un `<span class="inline-citation">` con
 * la cita_corta como texto visible y un popup hijo (CSS `:focus`) con la
 * cita_larga. Al hacer click la cita se enfoca y aparece el tooltip; al
 * hacer click fuera se pierde el foco y el tooltip se oculta.
 */
export const processCitationReferences = (
  texto: string | null | undefined,
  publicaciones:
    | Array<{
        publicacion?: {
          id_publicacion?: number;
          cita_corta?: string | null;
          cita_larga?: string | null;
          cita?: string | null;
          titulo?: string | null;
        };
      }>
    | null
    | undefined,
): string => {
  if (!texto) return "";
  if (!publicaciones || publicaciones.length === 0) return texto;

  let textoProcesado = texto;
  // Buscar patrones como {{123}} donde 123 es id_publicacion
  const citasEncontradas = texto.match(/\{\{(\d+)\}\}/g) || [];

  citasEncontradas.forEach((match) => {
    const idPublicacion = Number.parseInt(
      match.replaceAll(/\{\{|\}\}/g, ""),
      10,
    );
    // Buscar la publicación por id_publicacion
    const publicacion = publicaciones.find(
      (pub) => pub.publicacion?.id_publicacion === idPublicacion,
    )?.publicacion;

    if (publicacion?.cita_corta) {
      const tooltipRaw =
        publicacion.cita_larga ||
        publicacion.cita ||
        [publicacion.cita_corta, publicacion.titulo].filter(Boolean).join(". ");
      const tooltipTexto = escapeAttr(stripHtmlTags(tooltipRaw));
      const reemplazo =
        `<span class="inline-citation" role="button" tabindex="0" aria-label="Ver publicación: ${tooltipTexto}">` +
        `${publicacion.cita_corta}` +
        `<span class="inline-citation-popup" role="tooltip">${tooltipTexto}</span>` +
        `</span>`;

      textoProcesado = textoProcesado.replace(match, reemplazo);
    }
  });

  return textoProcesado;
};

/**
 * Procesa el HTML para agregar clases CSS a todos los enlaces SIN subrayado
 * Específico para secciones de publicaciones donde no se desea subrayado
 * Mantiene la misma lógica que processHTMLLinks pero añade clase para eliminar subrayado
 */
export const processHTMLLinksNoUnderline = (html: string | undefined): string => {
  if (!html) return "";

  // Agregar clases CSS, target="_blank" y rel="noopener noreferrer" a todos los enlaces
  return html.replaceAll(/<a\s+([^>]*?)>/gi, (match, attributes) => {
    // Verificar si ya tiene target y rel
    const hasTarget = /target=["']_blank["']/.test(attributes);
    const hasRel = /rel=["']/.test(attributes);

    // Agregar target si no existe
    let newAttributes = attributes;
    if (!hasTarget) {
      newAttributes += ' target="_blank"';
    }

    // Agregar rel si no existe
    if (!hasRel) {
      newAttributes += ' rel="noopener noreferrer"';
    } else if (!/rel=["'][^"']*noopener/.test(attributes)) {
      // Si tiene rel pero no tiene noopener, agregarlo
      newAttributes = newAttributes.replaceAll(
        /rel=["']([^"']*)["']/g,
        'rel="$1 noopener noreferrer"',
      );
    }

    // Verificar si ya tiene las clases
    const hasProcessedClass = /class=["'][^"']*processed-link/.test(attributes);
    const hasNoUnderlineClass = /class=["'][^"']*processed-link-no-underline/.test(attributes);

    if (!hasProcessedClass || !hasNoUnderlineClass) {
      // Agregar clases processed-link y processed-link-no-underline
      const hasClass = /class=["']/.test(attributes);
      if (hasClass) {
        let existingClass = attributes.match(/class=["']([^"']*)["']/)?.[1] || "";
        if (!existingClass.includes("processed-link")) {
          existingClass += " processed-link";
        }
        if (!existingClass.includes("processed-link-no-underline")) {
          existingClass += " processed-link-no-underline";
        }
        newAttributes = newAttributes.replaceAll(
          /class=["'][^"']*["']/g,
          `class="${existingClass}"`,
        );
      } else {
        newAttributes += ' class="processed-link processed-link-no-underline"';
      }
    }

    return `<a ${newAttributes}>`;
  });
};
