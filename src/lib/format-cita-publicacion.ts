const COLOR_TITULO_CIENTIFICA = "#f07304";
const COLOR_TITULO_RESTO = "#006d1b";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Construye la cita larga a partir de los campos de la publicación.
 * Si existe `cita_larga`, la usa directamente; si no, la construye desde
 * `cita_corta` + título + editorial + volumen + número + página + año.
 */
export function buildCitaLargaDesdePublicacion(pub: any): string {
  let citaLarga = pub.publicacion?.cita_larga || null;

  if (!citaLarga && pub.publicacion?.cita_corta) {
    const partes: string[] = [pub.publicacion.cita_corta];

    if (
      pub.publicacion.titulo &&
      !pub.publicacion.cita_corta.includes(pub.publicacion.titulo)
    ) {
      partes.push(pub.publicacion.titulo);
    }
    if (pub.publicacion.editorial) partes.push(pub.publicacion.editorial);
    if (pub.publicacion.volumen) partes.push(`Vol. ${pub.publicacion.volumen}`);
    if (pub.publicacion.numero) partes.push(`No. ${pub.publicacion.numero}`);
    if (pub.publicacion.pagina) partes.push(`pp. ${pub.publicacion.pagina}`);
    if (pub.publicacion.numero_publicacion_ano) {
      const añoStr = String(pub.publicacion.numero_publicacion_ano);

      if (!pub.publicacion.cita_corta.includes(añoStr)) {
        partes.push(`(${añoStr})`);
      }
    }

    citaLarga = partes.join(", ");
  }

  return (
    citaLarga || pub.publicacion?.cita || pub.publicacion?.cita_corta || "Cita no disponible"
  );
}

/**
 * Ordena una lista de publicaciones (taxon_publicacion) alfabéticamente por su cita,
 * usando localeCompare con locale "es" (maneja correctamente acentos y ñ).
 */
export function ordenarPublicacionesAlfabeticamente<T extends {publicacion?: any}>(
  publicaciones: T[],
): T[] {
  return [...publicaciones].sort((a, b) => {
    const citaA = buildCitaLargaDesdePublicacion(a).trim();
    const citaB = buildCitaLargaDesdePublicacion(b).trim();

    return citaA.localeCompare(citaB, "es", {sensitivity: "base"});
  });
}

/**
 * Resalta el título dentro de la cita larga con un span en color y negrita.
 * Naranja (#f07304) para publicaciones científicas, verde (#006d1b) para el resto.
 * Replica el formato visual de las cards de la sapoteca/biblioteca.
 */
export function resaltarTituloEnCita(
  cita: string,
  titulo: string | null | undefined,
  tipo?: string | null,
): string {
  const tituloTrim = titulo?.trim() || "";

  if (!tituloTrim || !cita.includes(tituloTrim)) return cita;

  const colorTitulo = tipo === "CIENTIFICA" ? COLOR_TITULO_CIENTIFICA : COLOR_TITULO_RESTO;

  return cita.replace(
    tituloTrim,
    `<span class="font-semibold" style="color:${colorTitulo}">${escapeHtml(tituloTrim)}</span>`,
  );
}
