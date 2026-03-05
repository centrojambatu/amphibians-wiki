/**
 * Exportación de publicaciones a BibTeX y RIS (Research Information Systems).
 * Uso en servidor; stripHtml es seguro sin DOM.
 */

export interface PublicacionParaExport {
  id_publicacion: number;
  titulo: string;
  titulo_secundario: string | null;
  numero_publicacion_ano: number | null;
  fecha: string;
  editorial: string | null;
  volumen: string | null;
  numero: string | null;
  pagina: string | null;
  palabras_clave: string | null;
  resumen: string | null;
  autores: { nombres: string | null; apellidos: string }[];
  enlaces: { enlace: string }[];
}

function stripHtml(html: string | null | undefined): string {
  if (html == null || html === "") return "";
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function escapeBibtexValue(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .trim();
}

function authorBibtex(autores: PublicacionParaExport["autores"]): string {
  return autores
    .map((a) => {
      const ap = (a.apellidos || "").trim();
      const no = (a.nombres || "").trim();
      return ap ? `${escapeBibtexValue(ap)}, ${escapeBibtexValue(no)}` : escapeBibtexValue(no || ap);
    })
    .filter(Boolean)
    .join(" and ");
}

function citeKey(pub: PublicacionParaExport): string {
  const año = pub.numero_publicacion_ano ?? new Date(pub.fecha).getFullYear();
  const first = pub.autores[0];
  const ap = first?.apellidos?.trim().replace(/\W/g, "") ?? "unknown";
  return `${ap}${año}id${pub.id_publicacion}`;
}

/**
 * Genera una entrada BibTeX para la publicación.
 * Tipo por defecto: @article (compatible con journals y libros).
 */
export function toBibtex(pub: PublicacionParaExport): string {
  const key = citeKey(pub);
  const title = stripHtml(pub.titulo) || "Untitled";
  const year = String(pub.numero_publicacion_ano ?? new Date(pub.fecha).getFullYear());
  const author = authorBibtex(pub.autores);
  const fields: string[] = [
    `  author = {${author}}`,
    `  title = {${escapeBibtexValue(title)}}`,
    `  year = {${year}}`,
  ];
  if (pub.editorial) fields.push(`  publisher = {${escapeBibtexValue(stripHtml(pub.editorial))}}`);
  if (pub.volumen) fields.push(`  volume = {${escapeBibtexValue(pub.volumen)}}`);
  if (pub.numero) fields.push(`  number = {${escapeBibtexValue(pub.numero)}}`);
  if (pub.pagina) fields.push(`  pages = {${escapeBibtexValue(pub.pagina)}}`);
  if (pub.resumen) fields.push(`  abstract = {${escapeBibtexValue(stripHtml(pub.resumen))}}`);
  if (pub.palabras_clave) fields.push(`  keywords = {${escapeBibtexValue(stripHtml(pub.palabras_clave))}}`);
  const url = pub.enlaces?.find((e) => e.enlace && e.enlace !== "http://")?.enlace;
  if (url) fields.push(`  url = {${url}}`);
  fields.push(`  note = {Centro Jambatu - ID ${pub.id_publicacion}}`);
  return `@article{${key},\n${fields.join(",\n")}\n}`;
}

/**
 * Genera una entrada RIS para la publicación.
 * TY por defecto: JOUR (Journal).
 */
export function toRis(pub: PublicacionParaExport): string {
  const title = stripHtml(pub.titulo) || "Untitled";
  const year = String(pub.numero_publicacion_ano ?? new Date(pub.fecha).getFullYear());
  const lines: string[] = ["TY  - JOUR"];
  for (const a of pub.autores) {
    const ap = (a.apellidos || "").trim();
    const no = (a.nombres || "").trim();
    const full = ap ? `${ap}, ${no}` : (no || ap);
    if (full) lines.push(`AU  - ${full}`);
  }
  lines.push(`TI  - ${title}`);
  lines.push(`PY  - ${year}`);
  if (pub.editorial) lines.push(`PB  - ${stripHtml(pub.editorial)}`);
  if (pub.volumen) lines.push(`VL  - ${pub.volumen}`);
  if (pub.numero) lines.push(`IS  - ${pub.numero}`);
  if (pub.pagina) lines.push(`SP  - ${pub.pagina}`);
  if (pub.resumen) lines.push(`AB  - ${stripHtml(pub.resumen)}`);
  if (pub.palabras_clave) lines.push(`KW  - ${stripHtml(pub.palabras_clave)}`);
  const url = pub.enlaces?.find((e) => e.enlace && e.enlace !== "http://")?.enlace;
  if (url) lines.push(`UR  - ${url}`);
  lines.push(`N1  - Centro Jambatu - ID ${pub.id_publicacion}`);
  lines.push("ER  - ");
  return lines.join("\n");
}
