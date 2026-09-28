/**
 * PDF de la ficha de especie con maquetación de paper:
 *
 *   - cabecera a ancho completo (logo, título, autoría, linaje)
 *   - figura a ancho completo con pie
 *   - cuerpo a dos columnas justificadas, en el MISMO orden que la ficha web
 *   - pie de página con nombre científico y paginación
 *
 * El motor de texto conserva las cursivas del HTML (`<i>`), imprescindibles
 * para los nombres científicos, y usa encabezados en línea al estilo
 * `Sección.—texto`, que es como vienen escritos los sumarios originales.
 *
 * No toca el DOM: recibe las imágenes ya resueltas en base64, así que se puede
 * generar y probar fuera del navegador.
 */
import jsPDF from "jspdf";

import {buildCitaLargaDesdePublicacion} from "./format-cita-publicacion";
import {formatNumericRange} from "./format-range";
import {processCitationReferencesPlain} from "./process-html-links";
import {
  ALTITUDE_MARKERS,
  CLIMATIC_FLOORS,
  FLOOR_DEFAULT_COLOR,
  floorStartPercentage,
  floorWidthPercentage,
  getFloorActiveSegment,
  type AltitudinalRange,
} from "./pisos-altitudinales";

// ---------------------------------------------------------------- geometría
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = {top: 15, bottom: 17, left: 16, right: 16};
const GUTTER = 7;
const CONTENT_W = PAGE_W - MARGIN.left - MARGIN.right;
const COL_W = (CONTENT_W - GUTTER) / 2;
const PT_TO_MM = 0.352778;

// ------------------------------------------------------------- tipografía
const FONT = "times";
const BODY_SIZE = 8.6;
const BODY_LEADING = 1.3;
const SECTION_SIZE = 10;
const SMALL_SIZE = 7.4;

const GRAY = 110;
const RULE = 190;
/** Naranja de la marca, el mismo que separa datos en la ficha web. */
const NARANJA: [number, number, number] = [240, 115, 4];

// jsPDF usa WinAnsi con las fuentes estándar: hay glifos que no existen.
const REEMPLAZOS: [RegExp, string][] = [
  [/[‘’‛]/g, "'"],
  [/[“”]/g, '"'],
  [/…/g, "..."],
  [/[→➡]/g, "->"],
  [/≤/g, "<="],
  [/≥/g, ">="],
  [/×/g, "x"],
  [/♂/g, "(macho)"],
  [/♀/g, "(hembra)"],
  [/\u00A0/g, " "],
];

const sanear = (texto: string): string =>
  REEMPLAZOS.reduce((acc, [patron, reemplazo]) => acc.replace(patron, reemplazo), texto);

/** `#RRGGBB` a la terna que espera jsPDF. */
const hexARgb = (hex: string): [number, number, number] => [
  Number.parseInt(hex.slice(1, 3), 16),
  Number.parseInt(hex.slice(3, 5), 16),
  Number.parseInt(hex.slice(5, 7), 16),
];

// --------------------------------------------------------- texto con estilo
interface Seg {
  text: string;
  italic: boolean;
  bold: boolean;
  /** Color propio del segmento, como [r, g, b]. Por defecto hereda el del párrafo. */
  color?: [number, number, number];
}

/** Una palabra puede mezclar estilos: `<i>Atelopus</i>,` son dos segmentos. */
type Word = Seg[];

const ENTIDADES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  deg: "°",
  times: "×",
  laquo: "«",
  raquo: "»",
  aacute: "á",
  eacute: "é",
  iacute: "í",
  oacute: "ó",
  uacute: "ú",
  ntilde: "ñ",
  uuml: "ü",
};

const decodificar = (texto: string): string =>
  texto.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, cuerpo: string) => {
    if (cuerpo.startsWith("#")) {
      const codigo = cuerpo.startsWith("#x")
        ? Number.parseInt(cuerpo.slice(2), 16)
        : Number.parseInt(cuerpo.slice(1), 10);

      return Number.isNaN(codigo) ? match : String.fromCodePoint(codigo);
    }

    return ENTIDADES[cuerpo.toLowerCase()] ?? match;
  });

const CIERRA_PARRAFO = new Set(["p", "div", "li", "tr", "h1", "h2", "h3", "h4", "h5", "h6"]);

/** Convierte HTML en párrafos de palabras, conservando cursiva y negrita. */
const htmlAParrafos = (html: string): Word[][] => {
  const parrafos: Word[][] = [];
  let palabras: Word[] = [];
  let palabra: Word = [];
  let italic = 0;
  let bold = 0;

  const cerrarPalabra = () => {
    if (palabra.length > 0) {
      palabras.push(palabra);
      palabra = [];
    }
  };
  const cerrarParrafo = () => {
    cerrarPalabra();

    if (palabras.length > 0) {
      parrafos.push(palabras);
      palabras = [];
    }
  };

  for (const token of sanear(html).match(/<[^>]*>|[^<]+/g) ?? []) {
    if (token.startsWith("<")) {
      const match = /^<\s*(\/?)\s*([a-zA-Z0-9]+)/.exec(token);

      if (!match) continue;

      const cierra = match[1] === "/";
      const tag = match[2].toLowerCase();

      if (tag === "i" || tag === "em") {
        italic = Math.max(0, italic + (cierra ? -1 : 1));
      } else if (tag === "b" || tag === "strong") {
        bold = Math.max(0, bold + (cierra ? -1 : 1));
      } else if (tag === "br" || (cierra && CIERRA_PARRAFO.has(tag))) {
        cerrarParrafo();
      }

      continue;
    }

    for (const pieza of decodificar(token).split(/(\s+)/)) {
      if (!pieza) continue;

      if (/^\s+$/.test(pieza)) {
        if (/[\r\n]/.test(pieza)) {
          cerrarParrafo();
        } else {
          cerrarPalabra();
        }
        continue;
      }

      palabra.push({text: pieza, italic: italic > 0, bold: bold > 0});
    }
  }

  cerrarParrafo();

  return parrafos;
};

/** Palabras sueltas a partir de texto plano (etiquetas, valores, listas). */
const palabrasDe = (texto: string, estilo: Partial<Seg> = {}): Word[] =>
  sanear(texto)
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => [{text: t, italic: Boolean(estilo.italic), bold: Boolean(estilo.bold)}]);

// ------------------------------------------------------------------ opciones
export interface FichaPdfOptions {
  ficha: any;
  nombreCientifico: string;
  /** Publicaciones con las que se resuelven los marcadores `{{id}}`. */
  publicaciones: any[];
  /** Lista final de "Literatura citada", ya ordenada. */
  literaturaCitada: any[];
  referenciasClave: any[];
  fotografia?: {dataUrl: string; formato?: string; autor?: string | null} | null;
  /** Captura del mapa de colecciones (html2canvas), ya en dataURL. */
  mapa?: {dataUrl: string; tipo?: string} | null;
  logo?: {dataUrl: string; ratio: number} | null;
  citaSugerida: string;
  fechaConsulta: string;
}

/** Normaliza valores que vienen de la ficha (tipada como `any`). */
const comoTexto = (valor: unknown): string => {
  if (typeof valor === "string") return valor;
  if (typeof valor === "number") return String(valor);

  return "";
};

const comoNumero = (valor: unknown): number | null =>
  typeof valor === "number" && !Number.isNaN(valor) ? valor : null;

const esRelleno = (texto: string): boolean => {
  const limpio = texto.trim().toLowerCase().replace(/\.$/, "");

  return limpio === "" || limpio === "no disponible";
};

const nombresCatalogo = (items: unknown, tipo: string): string[] => {
  const unicos = new Map<string, string>();

  (Array.isArray(items) ? items : []).forEach((item: any) => {
    if (item?.catalogo_awe?.tipo_catalogo_awe?.nombre !== tipo) return;
    const nombre = comoTexto(item.catalogo_awe?.nombre);

    if (nombre && !unicos.has(nombre)) unicos.set(nombre, nombre);
  });

  return Array.from(unicos.values());
};

const referenciaClaveTexto = (pub: any): string => {
  const citaCorta = String(
    pub.publicacion?.cita_corta || pub.publicacion?.cita || "Cita no disponible",
  );
  const tema = String(pub.tema ?? "").trim();

  return tema ? `${citaCorta} (${tema})` : citaCorta;
};

// -------------------------------------------------------------------- motor
export const buildFichaPdf = (opts: FichaPdfOptions): jsPDF => {
  const {ficha, nombreCientifico, publicaciones, literaturaCitada, referenciasClave} = opts;

  const pdf = new jsPDF({orientation: "portrait", unit: "mm", format: "a4"});

  // --- estado de columnas -------------------------------------------------
  let col = 0;
  let y = MARGIN.top;
  let bodyTop = MARGIN.top;
  const bottomY = PAGE_H - MARGIN.bottom;
  const colX = () => MARGIN.left + col * (COL_W + GUTTER);

  const nuevaPagina = () => {
    pdf.addPage();
    bodyTop = MARGIN.top;
    col = 0;
    y = bodyTop;
  };
  const siguienteColumna = () => {
    if (col === 0) {
      col = 1;
      y = bodyTop;
    } else {
      nuevaPagina();
    }
  };
  const reservar = (alto: number) => {
    if (y + alto > bottomY) siguienteColumna();
  };

  // --- medición -----------------------------------------------------------
  const cache = new Map<string, number>();
  const aplicarFuente = (size: number, italic = false, bold = false) => {
    let estilo = "normal";

    if (italic && bold) estilo = "bolditalic";
    else if (italic) estilo = "italic";
    else if (bold) estilo = "bold";

    pdf.setFont(FONT, estilo);
    pdf.setFontSize(size);
  };
  const anchoSeg = (seg: Seg, size: number): number => {
    const clave = `${String(size)}|${seg.italic ? "i" : ""}${seg.bold ? "b" : ""}|${seg.text}`;
    const previo = cache.get(clave);

    if (previo !== undefined) return previo;

    aplicarFuente(size, seg.italic, seg.bold);
    const ancho = pdf.getTextWidth(seg.text);

    cache.set(clave, ancho);

    return ancho;
  };
  const anchoPalabra = (palabra: Word, size: number): number =>
    palabra.reduce((suma, seg) => suma + anchoSeg(seg, size), 0);
  const anchoEspacio = (size: number): number =>
    anchoSeg({text: " ", italic: false, bold: false}, size);

  /** Parte una palabra más ancha que la columna (URLs, listas sin espacios). */
  const partirLarga = (palabra: Word, size: number, ancho: number): Word[] => {
    if (anchoPalabra(palabra, size) <= ancho) return [palabra];

    const trozos: Word[] = [];
    let actual: Word = [];
    let acumulado = 0;

    for (const seg of palabra) {
      let buffer = "";

      for (const char of seg.text) {
        const anchoChar = anchoSeg({...seg, text: char}, size);

        if (acumulado + anchoChar > ancho && (buffer || actual.length > 0)) {
          if (buffer) actual.push({...seg, text: buffer});
          trozos.push(actual);
          actual = [];
          buffer = "";
          acumulado = 0;
        }
        buffer += char;
        acumulado += anchoChar;
      }
      if (buffer) actual.push({...seg, text: buffer});
    }
    if (actual.length > 0) trozos.push(actual);

    return trozos;
  };

  interface Linea {
    palabras: Word[];
    ancho: number;
  }

  const repartirLineas = (
    palabras: Word[],
    size: number,
    ancho: number,
    sangriaPrimera = 0,
  ): Linea[] => {
    const espacio = anchoEspacio(size);
    const lineas: Linea[] = [];
    let actual: Word[] = [];
    let acumulado = 0;

    const disponible = () => ancho - (lineas.length === 0 ? sangriaPrimera : 0);

    for (const original of palabras) {
      for (const palabra of partirLarga(original, size, ancho)) {
        const anchoW = anchoPalabra(palabra, size);
        const incremento = actual.length > 0 ? espacio + anchoW : anchoW;

        if (actual.length > 0 && acumulado + incremento > disponible()) {
          lineas.push({palabras: actual, ancho: acumulado});
          actual = [palabra];
          acumulado = anchoW;
        } else {
          actual.push(palabra);
          acumulado += incremento;
        }
      }
    }
    if (actual.length > 0) lineas.push({palabras: actual, ancho: acumulado});

    return lineas;
  };

  const pintarLinea = (
    linea: Linea,
    x: number,
    baseline: number,
    size: number,
    ancho: number,
    justificar: boolean,
  ) => {
    const espacio = anchoEspacio(size);
    let hueco = espacio;

    if (justificar && linea.palabras.length > 1) {
      const suma = linea.palabras.reduce((acc, w) => acc + anchoPalabra(w, size), 0);
      const candidato = (ancho - suma) / (linea.palabras.length - 1);

      // Si el hueco se dispara, la línea queda peor justificada que alineada.
      if (candidato > 0 && candidato < espacio * 4) hueco = candidato;
    }

    let cursor = x;

    for (const palabra of linea.palabras) {
      for (const seg of palabra) {
        aplicarFuente(size, seg.italic, seg.bold);

        if (seg.color) pdf.setTextColor(seg.color[0], seg.color[1], seg.color[2]);
        pdf.text(seg.text, cursor, baseline);
        if (seg.color) pdf.setTextColor(0);
        cursor += anchoSeg(seg, size);
      }
      cursor += hueco;
    }
  };

  interface ParrafoOpts {
    size?: number;
    leading?: number;
    espacioDespues?: number;
    justificar?: boolean;
    sangriaColgante?: number;
    color?: number;
  }

  const escribirParrafo = (palabras: Word[], opciones: ParrafoOpts = {}) => {
    if (palabras.length === 0) return;

    const size = opciones.size ?? BODY_SIZE;
    const leading = opciones.leading ?? BODY_LEADING;
    const justificar = opciones.justificar ?? true;
    const colgante = opciones.sangriaColgante ?? 0;
    const alto = size * PT_TO_MM * leading;
    const lineas = repartirLineas(palabras, size, COL_W - colgante);

    pdf.setTextColor(opciones.color ?? 0);

    lineas.forEach((linea, i) => {
      reservar(alto);
      const ultima = i === lineas.length - 1;

      pintarLinea(
        linea,
        colX() + (i === 0 ? 0 : colgante),
        y,
        size,
        COL_W - (i === 0 ? 0 : colgante),
        justificar && !ultima,
      );
      y += alto;
    });

    pdf.setTextColor(0);
    y += opciones.espacioDespues ?? 1.4;
  };

  /** Texto (HTML) precedido por una etiqueta en negrita, al estilo `Etiqueta.—`. */
  const bloque = (
    etiqueta: string | null,
    contenido: unknown,
    opciones: ParrafoOpts & {permitirRelleno?: boolean} = {},
  ): boolean => {
    const texto = comoTexto(contenido);
    const crudo = texto ? processCitationReferencesPlain(texto, publicaciones) : "";
    const parrafos = htmlAParrafos(crudo);

    if (parrafos.length === 0) return false;

    const plano = parrafos
      .flat()
      .flat()
      .map((s) => s.text)
      .join(" ");

    if (!opciones.permitirRelleno && esRelleno(plano)) return false;

    parrafos.forEach((palabras, i) => {
      let contenidoLinea = palabras;

      if (i === 0 && etiqueta) {
        const marca: Seg = {text: `${etiqueta}.—`, italic: false, bold: true};

        contenidoLinea = [[marca, ...palabras[0]], ...palabras.slice(1)];
      }
      escribirParrafo(contenidoLinea, {
        ...opciones,
        espacioDespues: i === parrafos.length - 1 ? (opciones.espacioDespues ?? 1.4) : 0.8,
      });
    });

    return true;
  };

  /** Encabezado de sección (equivale a una card de la ficha web). */
  const seccion = (titulo: string) => {
    const alto = SECTION_SIZE * PT_TO_MM * 1.2;

    // Evita que el título quede colgado al final de la columna.
    reservar(alto + BODY_SIZE * PT_TO_MM * BODY_LEADING * 2 + 3);
    y += 2.6;
    aplicarFuente(SECTION_SIZE, false, true);
    pdf.setTextColor(0);
    pdf.text(sanear(titulo), colX(), y);
    y += SECTION_SIZE * PT_TO_MM * 1.25;
  };

  /** Pares etiqueta/valor en una línea, separados por `·`. */
  const datosEnLinea = (etiqueta: string | null, datos: {label: string; value: string}[]) => {
    if (datos.length === 0) return;

    const palabras: Word[] = [];

    datos.forEach((dato, i) => {
      if (i > 0) palabras.push([{text: "·", italic: false, bold: false}]);
      palabras.push(...palabrasDe(dato.label, {italic: true}));
      palabras.push(...palabrasDe(dato.value));
    });

    if (etiqueta) {
      palabras[0] = [{text: `${etiqueta}.—`, italic: false, bold: true}, ...palabras[0]];
    }
    escribirParrafo(palabras, {justificar: false});
  };

  const lista = (etiqueta: string, valores: string[]) => {
    if (valores.length === 0) return;
    bloque(etiqueta, valores.join(", "));
  };

  // ------------------------------------------------------------ figuras
  let numeroFigura = 0;

  /** Pie de figura, alineado a la izquierda del elemento. */
  const pieFigura = (x: number, texto: string, cursiva?: string) => {
    y += 2.4;
    pdf.setTextColor(GRAY);

    const piezas: Seg[] = cursiva
      ? [
          {text: `Figura ${String(numeroFigura)}. `, italic: false, bold: false},
          {text: cursiva, italic: true, bold: false},
          {text: texto, italic: false, bold: false},
        ]
      : [{text: `Figura ${String(numeroFigura)}. ${texto}`, italic: false, bold: false}];
    let cursor = x;

    piezas.forEach((seg) => {
      const limpio = sanear(seg.text);

      aplicarFuente(SMALL_SIZE, seg.italic, seg.bold);
      pdf.text(limpio, cursor, y);
      cursor += anchoSeg({...seg, text: limpio}, SMALL_SIZE);
    });
    pdf.setTextColor(0);
    y += 4.6;
  };

  /** Imagen al ancho de la columna, dentro del flujo del cuerpo. */
  const figuraEnColumna = (dataUrl: string, tipo: string, pie: string) => {
    let ratio: number;

    try {
      const props = pdf.getImageProperties(dataUrl);

      ratio = props.width / props.height;
    } catch {
      return;
    }

    let ancho = COL_W;
    let alto = COL_W / ratio;
    // Nunca más alta que una columna entera, o no cabría en ninguna.
    const maxAlto = bottomY - MARGIN.top - 12;

    if (alto > maxAlto) {
      alto = maxAlto;
      ancho = alto * ratio;
    }

    y += 1.6;
    reservar(alto + 8);
    numeroFigura += 1;

    try {
      pdf.addImage(dataUrl, tipo, colX(), y, ancho, alto);
    } catch {
      return;
    }
    y += alto;
    pieFigura(colX(), pie);
  };

  /** Barra de pisos altitudinales, dibujada en vectorial. */
  const barraPisos = (rango: AltitudinalRange) => {
    const altoEtiquetas = 2.6;
    const altoBarra = 4.6;

    y += 1.6;
    reservar(altoEtiquetas * 2 + altoBarra + 9);
    numeroFigura += 1;

    // Vertientes
    aplicarFuente(6.4, false, false);
    pdf.setTextColor(GRAY);
    pdf.text("<- Occidental", colX(), y);
    pdf.text("Oriental ->", colX() + COL_W, y, {align: "right"});
    pdf.setTextColor(0);
    y += altoEtiquetas;

    // Base gris con separadores blancos
    const base = hexARgb(FLOOR_DEFAULT_COLOR);

    pdf.setFillColor(base[0], base[1], base[2]);
    pdf.rect(colX(), y, COL_W, altoBarra, "F");

    // Separadores entre pisos, sobre la base
    pdf.setDrawColor(255, 255, 255);
    pdf.setLineWidth(0.3);
    CLIMATIC_FLOORS.slice(1).forEach((_, i) => {
      const x = colX() + (floorStartPercentage(i + 1) / 100) * COL_W;

      pdf.line(x, y, x, y + altoBarra);
    });

    // Tramos dentro del rango de la especie, encima de todo
    CLIMATIC_FLOORS.forEach((floor, i) => {
      const segmento = getFloorActiveSegment(
        floor,
        floorStartPercentage(i),
        floorWidthPercentage(floor),
        rango,
      );

      if (!segmento || segmento.width <= 0) return;

      const color = hexARgb(segmento.color);

      pdf.setFillColor(color[0], color[1], color[2]);
      pdf.rect(
        colX() + (segmento.left / 100) * COL_W,
        y,
        (segmento.width / 100) * COL_W,
        altoBarra,
        "F",
      );
    });

    y += altoBarra + 2.6;

    // Marcas de altitud
    aplicarFuente(6.4, false, false);
    pdf.setTextColor(GRAY);
    ALTITUDE_MARKERS.forEach((marker, i) => {
      const x = colX() + (marker.position / 100) * COL_W;
      const align = i === 0 ? "left" : i === ALTITUDE_MARKERS.length - 1 ? "right" : "center";

      pdf.text(`${String(marker.altitude)}m`, x, y, {align});
    });
    pdf.setTextColor(0);
    y += 1;

    pieFigura(colX(), "Pisos altitudinales ocupados en Ecuador.");
  };

  // ------------------------------------------------------------- cabecera
  let headerY = MARGIN.top;

  if (opts.logo) {
    const alto = 9;
    const ancho = alto * opts.logo.ratio;

    pdf.addImage(opts.logo.dataUrl, "PNG", MARGIN.left, headerY, ancho, alto);
  }

  aplicarFuente(SMALL_SIZE, true, false);
  pdf.setTextColor(GRAY);
  pdf.text(
    "Anfibios Ecuador: Referencia en línea · Versión 2.0",
    PAGE_W - MARGIN.right,
    headerY + 3.4,
    {
      align: "right",
    },
  );
  pdf.text(
    `Centro Jambatu · Consultado en ${sanear(opts.fechaConsulta)}`,
    PAGE_W - MARGIN.right,
    headerY + 6.8,
    {align: "right"},
  );
  pdf.setTextColor(0);

  headerY += 12;
  pdf.setDrawColor(RULE);
  pdf.setLineWidth(0.3);
  pdf.line(MARGIN.left, headerY, PAGE_W - MARGIN.right, headerY);
  headerY += 9;

  // Título en tres filas: familia | nombre científico, autoría y nombre común.
  const rango = (rankId: number): string =>
    comoTexto(
      (ficha.lineage as {rank_id?: number; taxon?: string}[] | undefined)?.find(
        (item) => item.rank_id === rankId,
      )?.taxon,
    );
  const familia = rango(5);
  const autorAno = comoTexto(ficha.taxones?.[0]?.autor_ano).trim();
  const nombreComun = comoTexto(ficha.taxones?.[0]?.nombre_comun).trim();

  /** Pinta un bloque centrado a ancho completo y devuelve la nueva altura. */
  const filaCentrada = (palabras: Word[], size: number, interlinea = 1.22): void => {
    if (palabras.length === 0) return;

    repartirLineas(palabras, size, CONTENT_W).forEach((linea) => {
      pintarLinea(
        linea,
        MARGIN.left + (CONTENT_W - linea.ancho) / 2,
        headerY,
        size,
        CONTENT_W,
        false,
      );
      headerY += size * PT_TO_MM * interlinea;
    });
  };

  filaCentrada(
    [
      ...(familia ? palabrasDe(familia) : []),
      ...(familia ? [[{text: "|", italic: false, bold: false, color: NARANJA}] as Word] : []),
      ...palabrasDe(nombreCientifico, {italic: true}),
    ],
    18,
  );

  if (autorAno) {
    headerY += 1.4;
    filaCentrada(palabrasDe(autorAno), 11);
  }

  if (nombreComun) {
    headerY += 1.2;
    pdf.setTextColor(GRAY);
    filaCentrada(palabrasDe(nombreComun), 10);
    pdf.setTextColor(0);
  }

  headerY += 3;

  pdf.setDrawColor(RULE);
  pdf.setLineWidth(0.3);
  pdf.line(MARGIN.left, headerY, PAGE_W - MARGIN.right, headerY);
  headerY += 6;

  // --------------------------------------------------------------- figura
  if (opts.fotografia) {
    const maxAlto = 52;
    let alto = 0;
    let figuraX = MARGIN.left;
    let figuraW = CONTENT_W;

    try {
      const props = pdf.getImageProperties(opts.fotografia.dataUrl);
      const ratio = props.width / props.height;

      alto = Math.min(maxAlto, CONTENT_W / ratio);
      figuraW = alto * ratio;
      figuraX = MARGIN.left + (CONTENT_W - figuraW) / 2;

      pdf.addImage(
        opts.fotografia.dataUrl,
        opts.fotografia.formato ?? "JPEG",
        figuraX,
        headerY,
        figuraW,
        alto,
      );
    } catch {
      alto = 0;
    }

    if (alto > 0) {
      numeroFigura += 1;
      headerY += alto + 3.4;
      pdf.setTextColor(GRAY);

      // El pie va alineado con la figura, con el nombre científico en cursiva.
      const piezas: Seg[] = [
        {text: `Figura ${String(numeroFigura)}. `, italic: false, bold: false},
        {text: nombreCientifico, italic: true, bold: false},
        {
          text: opts.fotografia.autor ? `. Foto: ${opts.fotografia.autor}.` : ".",
          italic: false,
          bold: false,
        },
      ];
      let cursor = figuraX;

      piezas.forEach((seg) => {
        aplicarFuente(SMALL_SIZE, seg.italic, seg.bold);
        pdf.text(sanear(seg.text), cursor, headerY);
        cursor += anchoSeg({...seg, text: sanear(seg.text)}, SMALL_SIZE);
      });
      pdf.setTextColor(0);
      headerY += 5;
    }
  }

  bodyTop = headerY;
  y = bodyTop;
  col = 0;

  // ================================================================ cuerpo
  // El orden replica el de la ficha web.

  // 1. Endemismo y distribución
  const endemica = ficha.taxones?.[0]?.endemica;

  seccion("Endemismo y distribución");

  if (endemica !== undefined && endemica !== null) {
    bloque("Endemismo", endemica ? "Endémica de Ecuador" : "No endémica", {
      permitirRelleno: true,
    });
  }

  if (!endemica) {
    bloque("Distribución global", ficha.distribucion_global);
  }

  const pisos: string[] = [];
  const pisosUnicos = new Map<string, string>();

  (ficha.distributions ?? []).forEach((item: any) => {
    const nombre = comoTexto(item?.catalogo_awe?.nombre);

    if (nombre && !pisosUnicos.has(nombre)) pisosUnicos.set(nombre, nombre);
  });
  pisos.push(...pisosUnicos.values());

  const datosEcuador: {label: string; value: string}[] = [];
  const rangoAltitudinal = formatNumericRange(
    comoNumero(ficha.rango_altitudinal_min),
    comoNumero(ficha.rango_altitudinal_max),
    "m",
  );
  const temperatura = formatNumericRange(
    comoNumero(ficha.temperatura_min),
    comoNumero(ficha.temperatura_max),
    "°C",
  );
  const pluviocidad = formatNumericRange(
    comoNumero(ficha.pluviocidad_min),
    comoNumero(ficha.pluviocidad_max),
    "mm",
  );

  if (rangoAltitudinal) datosEcuador.push({label: "Altitud", value: rangoAltitudinal});
  if (ficha.area_distribucion != null) {
    datosEcuador.push({
      label: "Área distribución EOO",
      value: `${Number(ficha.area_distribucion).toLocaleString("es")} km²`,
    });
  }
  if (ficha.area_ocupacion != null) {
    datosEcuador.push({
      label: "Área ocupación AOO",
      value: `${Number(ficha.area_ocupacion).toLocaleString("es")} km²`,
    });
  }
  if (pisos.length > 0) {
    datosEcuador.push({label: "Regiones altitudinales", value: pisos.join(", ")});
  }
  if (temperatura) datosEcuador.push({label: "Temperatura", value: temperatura});
  if (pluviocidad) datosEcuador.push({label: "Pluviocidad", value: pluviocidad});

  datosEnLinea("Distribución Ecuador", datosEcuador);

  const altitudinalRange = ficha.altitudinalRange as AltitudinalRange | null | undefined;

  if (altitudinalRange) {
    barraPisos(altitudinalRange);
  }

  if (opts.mapa) {
    figuraEnColumna(
      opts.mapa.dataUrl,
      opts.mapa.tipo ?? "JPEG",
      "Registros de colecciones para la especie.",
    );
  }

  const provincias = new Set<string>();

  (ficha.geoPolitica ?? []).forEach((item: any) => {
    const nombre = comoTexto(item?.nombre);

    if (comoTexto(item?.rank_nombre).toLowerCase() === "provincia" && nombre) {
      provincias.add(nombre);
    }
  });
  lista(
    "Provincias",
    Array.from(provincias).sort((a, b) => a.localeCompare(b, "es")),
  );
  lista("Ecosistemas", nombresCatalogo(ficha.taxon_catalogo_awe_results, "Ecosistemas"));
  lista(
    "Sectores biogeográficos",
    (Array.isArray(ficha.dataRegionBio) ? (ficha.dataRegionBio as unknown[]) : [])
      .map((region) =>
        comoTexto((region as {catalogo_awe?: {nombre?: string}})?.catalogo_awe?.nombre),
      )
      .filter(Boolean),
  );

  // 2. Primer(os) colector(es)
  if (ficha.primeros_colectores) {
    seccion("Primer(os) colector(es)");
    bloque(null, ficha.primeros_colectores);
  }

  // 3. Nombres
  const idiomas: [string, string][] = [
    ["nombre_comun_espanol", "Español"],
    ["nombre_comun_ingles", "Inglés"],
    ["nombre_comun_aleman", "Alemán"],
    ["nombre_comun_frances", "Francés"],
    ["nombre_comun_portugues", "Portugués"],
    ["nombre_comun_italiano", "Italiano"],
    ["nombre_comun_holandes", "Holandés"],
    ["nombre_comun_chino", "Chino"],
    ["nombre_comun_japones", "Japonés"],
    ["nombre_comun_ruso", "Ruso"],
    ["nombre_comun_arabe", "Árabe"],
    ["nombre_comun_hindu", "Hindi"],
  ];
  const nombresEstandar = idiomas
    .filter(([clave]) => ficha.nombresComunes?.[clave])
    .map(([clave, etiqueta]) => ({label: etiqueta, value: String(ficha.nombresComunes[clave])}));
  const otrosNombres: any[] = Array.isArray(ficha.otrosNombres) ? ficha.otrosNombres : [];

  if (ficha.etimologia || nombresEstandar.length > 0 || otrosNombres.length > 0) {
    seccion("Nombres");
    bloque("Etimología", ficha.etimologia);
    datosEnLinea("Nombres estándar", nombresEstandar);

    if (otrosNombres.length > 0) {
      const anoDe = (item: any): number => {
        const pub = Array.isArray(item.publicacion) ? item.publicacion[0] : item.publicacion;

        return Number(pub?.numero_publicacion_ano) || -Infinity;
      };

      datosEnLinea(
        "Otros nombres",
        [...otrosNombres]
          .sort((a, b) => anoDe(b) - anoDe(a))
          .map((item: any) => {
            const pub = Array.isArray(item.publicacion) ? item.publicacion[0] : item.publicacion;
            const etiqueta = item.etnia?.nombre || item.idioma?.nombre || "";

            return {
              label: etiqueta,
              value: `${String(item.nombre)}${pub?.cita_corta ? ` (${String(pub.cita_corta)})` : ""}`,
            };
          }),
      );
    }
  }

  // 4. Taxonomía
  if (ficha.holotipo || ficha.taxonomia) {
    seccion("Taxonomía y relaciones filogenéticas");
    bloque(null, ficha.holotipo);
    bloque(null, ficha.taxonomia);
  }

  // 5. Identificación
  const morfometria: {label: string; value: string}[] = [];

  if (ficha.svl_macho) {
    morfometria.push({label: "LRC macho", value: String(ficha.svl_macho)});
  }
  if (ficha.svl_hembra) {
    morfometria.push({label: "LRC hembra", value: String(ficha.svl_hembra)});
  }
  if (ficha.peso) morfometria.push({label: "Peso", value: String(ficha.peso)});

  if (
    ficha.identificacion ||
    morfometria.length > 0 ||
    ficha.color_en_vida ||
    ficha.spp_similares ||
    ficha.comparacion
  ) {
    seccion("Identificación");
    bloque(null, ficha.identificacion);
    datosEnLinea("Morfometría", morfometria);
    bloque("Color en vida", ficha.color_en_vida);
    bloque("Especies similares", ficha.spp_similares);
    bloque("Comparación", ficha.comparacion);
  }

  // 6. Renacuajo
  if (ficha.renacuajo) {
    seccion("Renacuajo");
    bloque(null, ficha.renacuajo);
  }

  // 7. Historia natural
  if (ficha.habitat_biologia || ficha.reproduccion || ficha.descripcion_canto || ficha.dieta) {
    seccion("Historia natural");
    bloque("Hábitat y biología", ficha.habitat_biologia);
    bloque("Reproducción", ficha.reproduccion);
    bloque("Canto", ficha.descripcion_canto);
    bloque("Dieta", ficha.dieta);
  }

  // 8. Conservación
  seccion("Conservación");

  const categoria = (entrada: unknown): string => {
    const catalogo = (entrada as {catalogo_awe?: {nombre?: string; sigla?: string}} | null)
      ?.catalogo_awe;
    const nombre = comoTexto(catalogo?.nombre);
    const sigla = comoTexto(catalogo?.sigla);

    if (!nombre) return "";

    return sigla ? `${nombre} (${sigla})` : nombre;
  };

  bloque("Lista Roja Global UICN", categoria(ficha.listaRojaGlobal) || "No disponible", {
    permitirRelleno: true,
  });
  bloque("Lista Roja Ecuador", categoria(ficha.listaRojaIUCN) || "No disponible", {
    permitirRelleno: true,
  });
  bloque(null, ficha.comentario_estatus_poblacional);

  const cites = nombresCatalogo(ficha.taxon_catalogo_awe_results, "CITES");

  datosEnLinea(null, [
    {label: "CITES", value: cites.length > 0 ? cites.join(", ") : "No disponible"},
    {label: "Manejo ex situ", value: ficha.anfibio_conservacion === true ? "Sí" : "No"},
  ]);

  lista(
    "Áreas protegidas del Estado (SNAP)",
    nombresCatalogo(ficha.taxon_catalogo_awe_results, "Áreas protegidas del Estado"),
  );
  lista(
    "Bosques protectores",
    nombresCatalogo(ficha.taxon_catalogo_awe_results, "Bosques Protegidos"),
  );
  lista(
    "Áreas protegidas privadas",
    nombresCatalogo(ficha.taxon_catalogo_awe_results, "Áreas protegidas Privadas"),
  );
  lista(
    "Reservas de la biósfera",
    nombresCatalogo(ficha.taxon_catalogo_awe_results, "Reservas de la Biósfera"),
  );

  // 9. Información adicional
  if (ficha.informacion_adicional) {
    seccion("Información adicional");
    bloque(null, ficha.informacion_adicional);
  }

  // 10. Referencias clave
  if (referenciasClave.length > 0) {
    seccion("Referencias clave");
    bloque(
      null,
      referenciasClave
        .filter((pub: any) => pub.publicacion)
        .map((pub: any) => referenciaClaveTexto(pub))
        .join(" | "),
      {size: SMALL_SIZE, leading: 1.25},
    );
  }

  // 11. Literatura citada
  if (literaturaCitada.length > 0) {
    seccion("Literatura citada");

    literaturaCitada.forEach((pub: any) => {
      if (!pub.publicacion) return;
      const cita = buildCitaLargaDesdePublicacion(pub);

      if (!cita) return;

      const parrafos = htmlAParrafos(cita);

      if (parrafos.length === 0) return;

      escribirParrafo(parrafos.flat(), {
        size: SMALL_SIZE,
        leading: 1.22,
        espacioDespues: 1,
        sangriaColgante: 3.5,
      });
    });
  }

  // 12. Historial y agradecimiento
  if (ficha.historial || ficha.agradecimiento || ficha.fecha_actualizacion) {
    seccion("Historial y créditos");
    bloque("Historial de cambios", ficha.historial);
    bloque("Agradecimiento", ficha.agradecimiento);

    if (ficha.fecha_actualizacion) {
      bloque("Última actualización", String(ficha.fecha_actualizacion), {permitirRelleno: true});
    }
  }

  // 13. Cita sugerida
  seccion("Cita");
  bloque(null, opts.citaSugerida, {
    size: SMALL_SIZE,
    leading: 1.25,
    permitirRelleno: true,
  });

  // ------------------------------------------------------------ pie de página
  const totalPaginas = pdf.getNumberOfPages();

  for (let pagina = 1; pagina <= totalPaginas; pagina++) {
    pdf.setPage(pagina);
    const linea = PAGE_H - MARGIN.bottom + 6;

    pdf.setDrawColor(RULE);
    pdf.setLineWidth(0.2);
    pdf.line(MARGIN.left, linea, PAGE_W - MARGIN.right, linea);

    aplicarFuente(SMALL_SIZE, false, false);
    pdf.setTextColor(GRAY);
    pdf.text("Anfibios Ecuador", MARGIN.left, linea + 3.8);
    aplicarFuente(SMALL_SIZE, true, false);
    pdf.text(sanear(nombreCientifico), PAGE_W / 2, linea + 3.8, {align: "center"});
    aplicarFuente(SMALL_SIZE, false, false);
    pdf.text(`${String(pagina)} / ${String(totalPaginas)}`, PAGE_W - MARGIN.right, linea + 3.8, {
      align: "right",
    });
    pdf.setTextColor(0);
  }

  return pdf;
};
