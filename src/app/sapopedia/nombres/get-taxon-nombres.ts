import {createServiceClient} from "@/utils/supabase/server";
import {extraerNombreBaseNormalizado} from "@/lib/extraer-nombre-base";

export interface TaxonNombre {
  id_taxon: number;
  taxon: string;
  nombre_comun: string | null;
  nombre_comun_completo?: string | null; // Nombre completo original
  nombre_comun_ingles?: string | null; // Nombre común en inglés
  nombre_cientifico?: string;
  orden?: string;
  familia?: string;
  genero?: string;
  catalogo_awe_idioma_id?: number; // Para filtrar por idioma en nombres vernáculos
}

export interface NombreGroup {
  id: string;
  name: string;
  nombre_comun?: string | null;
  nombres: TaxonNombre[];
  children?: NombreGroup[];
}

/**
 * Función para normalizar tildes y acentos
 */
function normalizarTildes(texto: string): string {
  return texto
    .normalize("NFD") // Descompone caracteres con tildes (á -> a + ´)
    .replace(/[\u0300-\u036f]/g, "") // Remueve los diacríticos
    .toLowerCase(); // Convierte a minúsculas para comparación
}

/**
 * Extracción genérica de nombre base para idiomas distintos al español.
 * Remueve nombres propios, especificadores comunes y frases descriptivas.
 * Adapta patrones comunes en múltiples idiomas (inglés, francés, alemán, etc.)
 */
function extraerNombreBaseGenerico(nombreComun: string | null): string {
  if (!nombreComun) return "";
  
  let nombre = nombreComun.trim();
  
  // Remover apóstrofes y posesivos comunes (ej: "Göldi's", "Simpson's")
  nombre = nombre.replace(/['']s\s+/gi, " ");
  
  // Remover nombres propios al final (palabras que empiezan con mayúscula, excepto si es la primera palabra)
  const palabras = nombre.split(/\s+/);
  if (palabras.length > 1) {
    const ultimaPalabra = palabras[palabras.length - 1];
    // Si la última palabra empieza con mayúscula y no es la primera palabra, es probablemente un nombre propio
    if (/^[A-ZÁÉÍÓÚÑÜ]/.test(ultimaPalabra) && palabras.length > 1) {
      nombre = palabras.slice(0, -1).join(" ");
    }
  }
  
  // Remover frases comunes con "de"/"del"/"of"/"von"/"di" seguido de nombre propio
  nombre = nombre.replace(/\s+(de|del|of|von|di|du|des|der|die|das)\s+[A-ZÁÉÍÓÚÑÜ][^\s]+(?:\s+[A-ZÁÉÍÓÚÑÜ][^\s]+)*$/i, "");
  
  // Remover especificadores comunes al final (adjetivos descriptivos en múltiples idiomas)
  // Patrones comunes: inglés, alemán, francés, portugués, italiano, etc.
  const especificadores = [
    // Inglés
    "confused", "dark", "spotted", "smooth", "gliding", "exasperating", "thigh", "senior", "brother", 
    "nurse", "leaf", "frog", "toad", "salamander", "caecilian", "thin", "toed", "hammer",
    // Alemán
    "verwechselt", "dunkel", "gefleckt", "glatt", "schenkel", "blatt", "frosch", "kröte",
    // Francés
    "confondu", "sombre", "taches", "lisse", "cuisse", "feuille", "grenouille", "crapaud",
    // Portugués
    "confuso", "escuro", "manchas", "liso", "coxa", "folha", "rã", "sapo",
    // Italiano
    "confuso", "scuro", "macchie", "liscio", "coscia", "foglia", "rana", "rospo",
  ];
  
  const patronEspecificadores = new RegExp(`\\s+(${especificadores.join("|")})$`, "i");
  nombre = nombre.replace(patronEspecificadores, "");
  
  // Remover última palabra si hay más de 2 palabras y parece ser un especificador
  const palabrasRestantes = nombre.split(/\s+/);
  if (palabrasRestantes.length > 2) {
    const ultima = palabrasRestantes[palabrasRestantes.length - 1].toLowerCase();
    // Si la última palabra es muy corta o parece un especificador, removerla
    if (ultima.length <= 4 || especificadores.some(e => ultima.includes(e.toLowerCase()))) {
      nombre = palabrasRestantes.slice(0, -1).join(" ");
    }
  }
  
  return nombre.trim() || nombreComun.trim();
}

/**
 * Función de normalización con dos pasadas y agrupación sin tildes
 * Funciona con cualquier idioma, pero las reglas están optimizadas para español.
 * Para otros idiomas, usa una extracción más genérica.
 */
function normalizarNombres(
  listaEspecies: TaxonNombre[],
  idiomaId?: number,
): (TaxonNombre & {nombreBase: string; nombreBaseNormalizado: string})[] {
  // Para español (idiomaId = 1), usar la función específica
  // Para otros idiomas, usar una extracción más genérica
  const esEspanol = idiomaId === 1 || idiomaId === undefined;
  
  // PASADA 1: Extraer nombre base
  const especiesConBase = listaEspecies.map((especie) => {
    let nombreBase: string;
    
    if (esEspanol) {
      // Usar la función específica para español
      nombreBase = extraerNombreBaseNormalizado(especie.nombre_comun);
    } else {
      // Para otros idiomas, extracción genérica: remover nombres propios y especificadores comunes
      nombreBase = extraerNombreBaseGenerico(especie.nombre_comun);
    }
    
    return {
      ...especie,
      nombreBase,
      nombreBaseNormalizado: normalizarTildes(nombreBase),
    };
  });

  // Contar por nombre normalizado (sin tildes)
  const conteoBaseNormalizado: Record<string, number> = {};

  especiesConBase.forEach((item) => {
    conteoBaseNormalizado[item.nombreBaseNormalizado] =
      (conteoBaseNormalizado[item.nombreBaseNormalizado] || 0) + 1;
  });

  // PASADA 2: Optimizar nombres únicos (subir al grupo padre)
  // Primero, identificar nombres base simples y sus variaciones
  const nombresBaseSimples = new Set<string>();
  especiesConBase.forEach((item) => {
    const palabras = item.nombreBase.split(/\s+/);
    if (palabras.length > 0) {
      const primeraPalabra = palabras[0];
      if (/^(Ilulo|Sapo|Sapito|Cutín|Cutin|Rana|Ranita|Salamandra|Kayla|Pipa|Smilisca)$/iu.test(primeraPalabra)) {
        nombresBaseSimples.add(normalizarTildes(primeraPalabra));
      }
    }
  });

  // Contar variaciones por nombre base simple
  const variacionesPorBaseSimple: Record<string, number> = {};
  especiesConBase.forEach((item) => {
    const palabras = item.nombreBase.split(/\s+/);
    if (palabras.length > 0) {
      const primeraPalabra = palabras[0];
      const baseSimpleNormalizado = normalizarTildes(primeraPalabra);
      if (nombresBaseSimples.has(baseSimpleNormalizado)) {
        variacionesPorBaseSimple[baseSimpleNormalizado] =
          (variacionesPorBaseSimple[baseSimpleNormalizado] || 0) + 1;
      }
    }
  });

  const especiesOptimizadas = especiesConBase.map((item) => {
    let baseFinal = item.nombreBase;
    let baseFinalNormalizado = item.nombreBaseNormalizado;

    // Solo si hay 1 especie con este nombre base normalizado
    if (conteoBaseNormalizado[item.nombreBaseNormalizado] === 1) {
      // Proteger descriptivos compuestos
      const esDescriptivoCompuesto =
        /^(Rana)\s+de\s+(cristal|casco|dedos\s+delgados|espuma)$/iu.test(baseFinal);

      if (!esDescriptivoCompuesto) {
        const palabras = baseFinal.split(/\s+/);
        const primeraPalabra = palabras[0];
        const baseSimpleNormalizado = normalizarTildes(primeraPalabra);

        // Si la primera palabra es un nombre base común y hay múltiples variaciones
        if (
          nombresBaseSimples.has(baseSimpleNormalizado) &&
          variacionesPorBaseSimple[baseSimpleNormalizado] > 1
        ) {
          // Agrupar bajo el nombre base simple
          baseFinal = primeraPalabra;
          baseFinalNormalizado = baseSimpleNormalizado;
        } else {
          // Estrategia 1: Remover "de [sustantivo común]"
          let match =
            /^(.+)\s+de(?:l)?\s+(bosque|pies|vientre|cabeza|dorso|disco|ojos|muslos|patas|dedos|flancos|ingle|ingles|líneas|manchas|puntos|rayas|saco|párpado|color|garganta|hocico|rostro|brazo|membrana|bigote|membranas|cara|gula|trasero|plano|rorso|anteojos|casco|charco|labio|labios|oriente)$/iu.exec(
              baseFinal,
            );

          if (match) {
            const baseSinDe = match[1].trim();
            const baseSinDeNormalizado = normalizarTildes(baseSinDe);
            const primeraPalabraSinDe = baseSinDe.split(/\s+/)[0];
            const baseSimpleSinDeNormalizado = normalizarTildes(primeraPalabraSinDe);

            // Si después de remover "de [sustantivo]" queda un nombre base simple con múltiples variaciones
            if (
              nombresBaseSimples.has(baseSimpleSinDeNormalizado) &&
              variacionesPorBaseSimple[baseSimpleSinDeNormalizado] > 1
            ) {
              baseFinal = primeraPalabraSinDe;
              baseFinalNormalizado = baseSimpleSinDeNormalizado;
            } else {
              baseFinal = baseSinDe;
              baseFinalNormalizado = baseSinDeNormalizado;
            }
          } else {
            // Estrategia 2: Remover adjetivos específicos y nombres propios
            match =
              /^(.+)\s+(colilarga|óseo|yamba|lisa|confusa|picudita|ágata|ecuatoriana|minúscula|vertebral|punteada|naranja|rosada|bufo|cofán|occidental|amazónico|andino|gigante|pequeño|grande|manchado|moteado|negro|verde|amarillo|azul|blanco|rojo|gris|marrones|anómala|salpicada|punteada|naranja|rosada|amarilla|azul|blanca)$/iu.exec(
                baseFinal,
              );
            if (match) {
              const baseSinAdjetivo = match[1].trim();
              const baseSinAdjetivoNormalizado = normalizarTildes(baseSinAdjetivo);
              const primeraPalabraSinAdjetivo = baseSinAdjetivo.split(/\s+/)[0];
              const baseSimpleSinAdjetivoNormalizado = normalizarTildes(primeraPalabraSinAdjetivo);

              // Si después de remover el adjetivo queda un nombre base simple con múltiples variaciones
              if (
                nombresBaseSimples.has(baseSimpleSinAdjetivoNormalizado) &&
                variacionesPorBaseSimple[baseSimpleSinAdjetivoNormalizado] > 1
              ) {
                baseFinal = primeraPalabraSinAdjetivo;
                baseFinalNormalizado = baseSimpleSinAdjetivoNormalizado;
              } else {
                baseFinal = baseSinAdjetivo;
                baseFinalNormalizado = baseSinAdjetivoNormalizado;
              }
            } else if (palabras.length >= 3) {
              // Estrategia 3: Simplificar nombres largos (3+ palabras)
              match =
                /^(Ilulo|Sapo|Sapito|Cutín|Cutin|Rana|Ranita|Salamandra|Kayla|Pipa|Smilisca)\s+[\wáéíóúñü\s]+$/iu.exec(
                  baseFinal,
                );
              if (match) {
                const baseSimple = match[1];
                const baseSimpleNormalizado = normalizarTildes(baseSimple);

                // Si hay múltiples variaciones del mismo nombre base simple
                if (
                  nombresBaseSimples.has(baseSimpleNormalizado) &&
                  variacionesPorBaseSimple[baseSimpleNormalizado] > 1
                ) {
                  baseFinal = baseSimple;
                  baseFinalNormalizado = baseSimpleNormalizado;
                }
              }
            }
          }
        }
      }
    }

    return {
      ...item,
      nombreBase: baseFinal,
      nombreBaseNormalizado: baseFinalNormalizado,
    };
  });

  // PASADA 3: Elegir nombre canónico (versión más común)
  const versionesPreferidas: Record<string, Record<string, number>> = {};

  especiesOptimizadas.forEach((item) => {
    if (!versionesPreferidas[item.nombreBaseNormalizado]) {
      versionesPreferidas[item.nombreBaseNormalizado] = {};
    }
    const version = item.nombreBase;

    versionesPreferidas[item.nombreBaseNormalizado][version] =
      (versionesPreferidas[item.nombreBaseNormalizado][version] || 0) + 1;
  });

  // Elegir la versión más común para cada nombre normalizado
  const nombreBaseCanonicos: Record<string, string> = {};

  Object.keys(versionesPreferidas).forEach((normalizado) => {
    const versiones = versionesPreferidas[normalizado];
    const versionMasComun = Object.entries(versiones).sort((a, b) => b[1] - a[1])[0][0];

    nombreBaseCanonicos[normalizado] = versionMasComun;
  });

  // Aplicar nombres canónicos
  return especiesOptimizadas.map((item) => ({
    ...item,
    nombreBase: nombreBaseCanonicos[item.nombreBaseNormalizado] || item.nombreBase,
  }));
}

/**
 * Extrae el nombre base de un nombre común removiendo especificadores al final.
 * (Función legacy - no se usa actualmente)
 *
 * Lógica de agrupamiento general (aplica a todos los nombres):
 * 1. Si hay una palabra simple + especificador simple → nombre base = palabra simple
 *    Ej: "Rana cohete" → "Rana"
 * 2. Si hay una frase base (con "de" o múltiples palabras) + especificadores → nombre base = frase base
 *    Ej: "Rana de dedos delgados de Göldi" → "Rana de dedos delgados"
 *    Ej: "Rana arbórea de Alfaro" → "Rana arbórea"
 */
function extraerNombreBaseLegacy(nombreComun: string | null): string {
  if (!nombreComun) return "";

  let nombreBase = nombreComun.trim();

  // Sustantivos comunes para regla 1
  const sustantivosComunes = [
    "bosque",
    "pies",
    "vientre",
    "cabeza",
    "dorso",
    "disco",
    "ojos",
    "muslos",
    "patas",
    "dedos",
    "flancos",
    "ingle",
    "líneas",
    "manchas",
    "puntos",
    "rayas",
    "saco",
    "párpado",
    "color",
    "garganta",
    "hocico",
    "rostro",
  ];

  // Sustantivos descriptivos comunes para regla 2
  const sustantivosDescriptivos = [
    "hojarasquero",
    "arlequín",
    "espinosa",
    "torrentícola",
    "venenosa",
    "arbórea",
    "cohete",
    "gladiadora",
    "gomosa",
    "verde",
    "ágil",
  ];

  // Adjetivos comunes para regla 8
  const adjetivosComunes = [
    "adornado",
    "afortunado",
    "amazónico",
    "andino",
    "atenuado",
    "bello",
    "cofán",
    "conífero",
    "cornudo",
    "ecuatoriano",
    "elegante",
    "enmascarado",
    "gigante",
    "grande",
    "grueso",
    "magnífico",
    "manchada",
    "marino",
    "moteado",
    "negro",
    "occidental",
    "pequeño",
    "punteado",
    "truncado",
    "verrugoso",
    "críptica",
    "cenicienta",
    "lanceolada",
    "ruidosa",
    "apendiculado",
  ];

  // REGLA 1: Sustantivo + "de" + Sustantivo común + Adjetivo
  // Patrón: [Base] de [sustantivo] [adjetivo]
  // Mantener: [Base] de [sustantivo]
  // Aplicar primero esta regla para preservar construcciones con "de [sustantivo común]"
  for (const sustantivo of sustantivosComunes) {
    const patron = new RegExp(`\\s+de\\s+${sustantivo}\\s+[^\\s]+(?:\\s+[^\\s]+)*$`, "i");

    if (patron.test(nombreBase)) {
      nombreBase = nombreBase.replace(
        new RegExp(`\\s+de\\s+${sustantivo}\\s+[^\\s]+(?:\\s+[^\\s]+)*$`, "i"),
        ` de ${sustantivo}`,
      );

      // Si se aplicó esta regla, no aplicar otras reglas que puedan afectar "de"
      return nombreBase;
    }
  }

  // REGLA 2: Base + Sustantivo Descriptivo + "de" + Nombre Propio/Lugar
  // Patrón: [Base] [sustantivo descriptivo] de [Nombre Propio]
  // Mantener: [Base] [sustantivo descriptivo]
  for (const sustantivo of sustantivosDescriptivos) {
    const patron = new RegExp(
      `\\s+${sustantivo}\\s+de\\s+[A-ZÁÉÍÓÚÑÜ][^\\s]+(?:\\s+[^\\s]+)*$`,
      "u",
    );

    if (patron.test(nombreBase)) {
      nombreBase = nombreBase.replace(
        new RegExp(`\\s+${sustantivo}\\s+de\\s+[A-ZÁÉÍÓÚÑÜ][^\\s]+(?:\\s+[^\\s]+)*$`, "u"),
        ` ${sustantivo}`,
      );
    }
  }

  // Casos especiales con "de charco", "de cristal", "de casco", "de ojos"
  const frasesDescriptivas = ["de charco", "de cristal", "de casco", "de ojos"];

  for (const frase of frasesDescriptivas) {
    const patron = new RegExp(`\\s+${frase}\\s+de\\s+[A-ZÁÉÍÓÚÑÜ][^\\s]+(?:\\s+[^\\s]+)*$`, "i");

    if (patron.test(nombreBase)) {
      nombreBase = nombreBase.replace(
        new RegExp(`\\s+${frase}\\s+de\\s+[A-ZÁÉÍÓÚÑÜ][^\\s]+(?:\\s+[^\\s]+)*$`, "i"),
        ` ${frase}`,
      );
    }
  }

  // REGLA 3: Base + Sustantivo Descriptivo + Adjetivo Simple
  // Patrón: [Base] [sustantivo descriptivo] [adjetivo]
  // Mantener: [Base] [sustantivo descriptivo]
  for (const sustantivo of sustantivosDescriptivos) {
    for (const adjetivo of adjetivosComunes) {
      const patron = new RegExp(`\\s+${sustantivo}\\s+${adjetivo}$`, "i");

      if (patron.test(nombreBase)) {
        nombreBase = nombreBase.replace(
          new RegExp(`\\s+${sustantivo}\\s+${adjetivo}$`, "i"),
          ` ${sustantivo}`,
        );
        break;
      }
    }
  }

  // Casos especiales con "de charco", "de cristal", etc. + adjetivo
  for (const frase of frasesDescriptivas) {
    for (const adjetivo of adjetivosComunes) {
      const patron = new RegExp(`\\s+${frase}\\s+${adjetivo}$`, "i");

      if (patron.test(nombreBase)) {
        nombreBase = nombreBase.replace(
          new RegExp(`\\s+${frase}\\s+${adjetivo}$`, "i"),
          ` ${frase}`,
        );
        break;
      }
    }
  }

  // REGLA 4: Base + "de" + Nombre Propio (sin sustantivo intermedio)
  // Patrón: [Base] de [Nombre Propio con Mayúscula]
  // Mantener solo: [Base]
  const patronDeNombrePropio = /\s+de\s+[A-ZÁÉÍÓÚÑÜ][^\s]+(?:\s+[^\s]+)*$/u;
  // Verificar que no sea parte de una construcción "de [sustantivo común]"
  const tieneSustantivoComun = sustantivosComunes.some((sust) =>
    new RegExp(`\\s+de\\s+${sust}`, "i").test(nombreBase),
  );

  if (patronDeNombrePropio.test(nombreBase) && !tieneSustantivoComun) {
    // Verificar que no sea "del" seguido de sustantivo común
    if (!/\s+del\s+[a-záéíóúñü]/.test(nombreBase)) {
      nombreBase = nombreBase.replace(patronDeNombrePropio, "").trim();
    }
  }

  // REGLA 5: Base + "del" + Lugar
  // Si es nombre propio compuesto, remover; si es sustantivo común, mantener
  const patronDelNombrePropio = /\s+del\s+[A-ZÁÉÍÓÚÑÜ][^\s]+(?:\s+[^\s]+)*$/u;

  if (patronDelNombrePropio.test(nombreBase)) {
    // Verificar si es un nombre propio compuesto (ej: "del Padre Saturnino")
    // Si tiene más de una palabra después de "del", es un nombre propio compuesto
    const matchDel = /\s+del\s+([^\s]+(?:\s+[^\s]+)*)$/u.exec(nombreBase);

    if (matchDel) {
      const textoDespuesDel = matchDel[1];
      const palabrasDespuesDel = textoDespuesDel.split(/\s+/);

      // Si hay más de una palabra después de "del", es nombre propio compuesto
      if (palabrasDespuesDel.length > 1) {
        nombreBase = nombreBase.replace(patronDelNombrePropio, "").trim();
      }
      // Si es una sola palabra (ej: "Cóndor", "oriente"), mantener como está y no aplicar más reglas
      else {
        return nombreBase;
      }
    }
  }

  // REGLA 6: Base + "con" + Descripción
  // Patrón: [Base] con [descripción]
  // Mantener solo: [Base]
  const patronCon = /\s+con\s+[^\s]+(?:\s+[^\s]+)*$/u;

  if (patronCon.test(nombreBase)) {
    nombreBase = nombreBase.replace(patronCon, "").trim();
  }

  // REGLA 7: Base + "amante de" + Algo
  // Patrón: [Base] amante de [algo]
  // Mantener: [Base] amante
  const patronAmante = /\s+amante\s+de\s+[^\s]+(?:\s+[^\s]+)*$/u;

  if (patronAmante.test(nombreBase)) {
    nombreBase = nombreBase.replace(/\s+amante\s+de\s+[^\s]+(?:\s+[^\s]+)*$/u, " amante");
  }

  // REGLA 8: Adjetivos Simples al Final
  // Patrón: [Base] [adjetivo]
  // Mantener solo: [Base]
  // Solo si no hay "de" en el nombre (para no afectar construcciones con "de")
  if (!/\s+de\s+/.test(nombreBase)) {
    for (const adjetivo of adjetivosComunes) {
      const patron = new RegExp(`\\s+${adjetivo}$`, "i");

      if (patron.test(nombreBase)) {
        nombreBase = nombreBase.replace(patron, "").trim();
        break;
      }
    }
  }

  // REGLA 9: Frases Compuestas al Final
  // Patrón: [Base] [frase de dos o más palabras]
  // Mantener solo: [Base] (excepto si es "gigante" que puede ser parte de la base)
  const palabras = nombreBase.split(/\s+/).filter((p) => p.length > 0);

  if (palabras.length > 3) {
    // Si hay más de 3 palabras, remover las últimas hasta quedar con máximo 2-3
    // Pero preservar "gigante" si está antes de la última palabra
    if (palabras.length > 3 && palabras[palabras.length - 2] === "gigante") {
      nombreBase = palabras.slice(0, -1).join(" ").trim();
    } else {
      // Remover última palabra si hay más de 3
      nombreBase = palabras.slice(0, -1).join(" ").trim();
    }
  } else if (palabras.length === 3) {
    // Si hay exactamente 3 palabras, verificar si las últimas dos forman una frase
    const segundaPalabra = palabras[1];
    const terceraPalabra = palabras[2];

    // Si la tercera es un adjetivo, removerla
    if (adjetivosComunes.some((adj) => new RegExp(`^${adj}$`, "i").test(terceraPalabra))) {
      nombreBase = palabras.slice(0, 2).join(" ").trim();
    } else if (
      // Si la segunda palabra NO es un sustantivo descriptivo conocido
      !sustantivosDescriptivos.some((sust) => new RegExp(`^${sust}$`, "i").test(segundaPalabra)) &&
      !frasesDescriptivas.some((frase) => nombreBase.includes(frase)) &&
      !nombreBase.includes(" de ") && // No aplicar si hay "de" (ya procesado en regla 1)
      !nombreBase.includes(" del ") // No aplicar si hay "del" (ya procesado en regla 5)
    ) {
      // Remover las últimas dos palabras (frase compuesta)
      nombreBase = palabras[0];
    }
  }

  // REGLA 10: Nombres Propios Simples al Final
  // Patrón: [Base] [Nombre Propio]
  // Mantener solo: [Base]
  if (palabras.length >= 2) {
    const ultimaPalabra = palabras[palabras.length - 1];

    // Si la última palabra empieza con mayúscula y no es un adjetivo común
    if (
      /^[A-ZÁÉÍÓÚÑÜ]/.test(ultimaPalabra) &&
      !adjetivosComunes.some((adj) => new RegExp(`^${adj}$`, "i").test(ultimaPalabra))
    ) {
      nombreBase = palabras.slice(0, -1).join(" ").trim();
    }
  }

  return nombreBase || nombreComun;
}

/**
 * Extrae el nombre base de un nombre común removiendo especificadores al final.
 *
 * Lógica de agrupamiento general (aplica a todos los nombres):
 * 1. Si hay una palabra simple + especificador simple → nombre base = palabra simple
 *    Ej: "Rana cohete" → "Rana"
 * 2. Si hay una frase base (con "de" o múltiples palabras) + especificadores → nombre base = frase base
 *    Ej: "Rana de dedos delgados de Göldi" → "Rana de dedos delgados"
 *    Ej: "Rana arbórea de Alfaro" → "Rana arbórea"
 */
export function extraerNombreBase(nombreComun: string | null): string {
  if (!nombreComun) return "";

  let nombreBase = nombreComun.trim();

  // Dividir el nombre en palabras
  const palabras = nombreBase.split(/\s+/);

  // Si solo hay una palabra, esa es la base
  if (palabras.length === 1) {
    return nombreBase;
  }

  // Verificar si hay construcciones con "de"
  const ocurrenciasDe = (nombreBase.match(/\s+de\s+/gi) || []).length;

  if (ocurrenciasDe > 1) {
    // Hay múltiples "de", remover solo el último "de [especificador]"
    // Buscar todas las ocurrencias de " de " y tomar la última
    const regexDe = /\s+de\s+/gi;
    let ultimoIndice = -1;
    let match;

    // Reiniciar el regex para evitar problemas de estado
    regexDe.lastIndex = 0;

    // Encontrar la posición del último " de "
    while ((match = regexDe.exec(nombreBase)) !== null) {
      ultimoIndice = match.index;
    }

    if (ultimoIndice >= 0) {
      // Remover todo desde el último " de " hasta el final
      nombreBase = nombreBase.substring(0, ultimoIndice).trim();
    }
  } else if (ocurrenciasDe === 1) {
    // Hay un solo "de", verificar si es parte de la frase base o un especificador
    // Si el "de" está seguido de un nombre propio al final, es un especificador
    const patronDeFinal = /\s+de\s+[A-ZÁÉÍÓÚÑÜ][^\s]+(?:\s+[^\s]+)*$/u;

    if (patronDeFinal.test(nombreBase)) {
      // Verificar cuántas palabras hay antes del "de"
      const indiceDe = nombreBase.search(/\s+de\s+/i);
      const textoAntesDe = nombreBase.substring(0, indiceDe);
      const palabrasAntesDe = textoAntesDe.split(/\s+/).filter((p) => p.length > 0);

      // Si hay más de una palabra antes del "de", mantenerlas como frase base
      // Ej: "Rana arbórea de Alfaro" → "Rana arbórea"
      if (palabrasAntesDe.length > 1) {
        nombreBase = textoAntesDe.trim();
      } else {
        // Si solo hay una palabra antes del "de", remover el especificador
        nombreBase = nombreBase.replace(patronDeFinal, "").trim();
      }
    }
    // Si no, el "de" es parte de la frase base y se mantiene
  }

  // Remover adjetivos descriptivos al final si aún quedan
  // Solo remover si hay más de una palabra (para preservar frases base como "Rana arbórea")
  const palabrasActuales = nombreBase.split(/\s+/).filter((p) => p.length > 0);

  if (palabrasActuales.length === 2) {
    // Si hay exactamente 2 palabras, la segunda es un especificador simple
    // Ej: "Rana cohete" → "Rana"
    // Pero preservar frases base de 2 palabras que no tienen especificadores obvios
    // (esto se maneja antes con la lógica de "de")
    const segundaPalabra = palabrasActuales[1];
    // Si la segunda palabra es un adjetivo/especificador común, removerla
    const esEspecificador =
      /^(cohete|arlequín|torrentícola|marsupial|elegante|manchada|pastusa|payaso|pequeña|sapoide|triste|verrugosa|venenosa|bufo|cofán|occidental|alado|amistoso|andino|bello|conífero|cornudo|ecuatoriano|gigante|moteado|magnífico|marino|narizón|sanguinolento|exasperante|trilineada|confusa)$/i.test(
        segundaPalabra,
      );

    if (esEspecificador) {
      nombreBase = palabrasActuales[0];
    }
    // Si no es un especificador obvio, mantener las 2 palabras (ej: "Rana arbórea")
  } else if (palabrasActuales.length > 2) {
    // Remover adjetivos finales si hay más de 2 palabras
    const patronesAdjetivos = [
      /\s+(cenicienta|lanceolada|ruidosa|apendiculado|de\s+espuelas|de\s+bandas|cohete|arlequín|torrentícola|marsupial|elegante|manchada|pastusa|payaso|pequeña|sapoide|triste|verrugosa|venenosa|bufo|cofán|occidental|alado|amistoso|andino|bello|conífero|cornudo|ecuatoriano|gigante|moteado|magnífico|marino|narizón|sanguinolento|exasperante|trilineada|confusa)$/i,
    ];

    for (const patron of patronesAdjetivos) {
      const nuevoNombre = nombreBase.replace(patron, "").trim();
      const palabrasNuevas = nuevoNombre.split(/\s+/).filter((p) => p.length > 0);

      // Solo aplicar si después de remover quedan al menos 2 palabras
      if (nuevoNombre !== nombreBase && nuevoNombre.length > 0 && palabrasNuevas.length >= 2) {
        nombreBase = nuevoNombre;
        break; // Solo remover un adjetivo a la vez
      }
    }

    // Remover palabras adicionales al final (como "mapa apendiculado")
    const palabrasRestantes = nombreBase.split(/\s+/).filter((p) => p.length > 0);

    if (palabrasRestantes.length > 2) {
      // Remover la última palabra si parece ser un especificador
      const ultimaPalabra = palabrasRestantes[palabrasRestantes.length - 1];

      // Remover si es un nombre propio o palabra descriptiva adicional
      if (/^[A-ZÁÉÍÓÚÑÜ]/.test(ultimaPalabra) && ultimaPalabra.length > 2) {
        nombreBase = palabrasRestantes.slice(0, -1).join(" ").trim();
      } else if (ultimaPalabra === "mapa" || ultimaPalabra === "apendiculado") {
        // Remover palabras específicas que son especificadores
        nombreBase = palabrasRestantes.slice(0, -1).join(" ").trim();
      }
    }
  }

  return nombreBase || nombreComun; // Si queda vacío, devolver el original
}

interface TaxonInfo {
  id_taxon: number;
  orden: string;
  familia: string;
  genero: string;
}

interface VwNombresComunes {
  id_taxon: number;
  id_ficha_especie: number;
  especie: string;
  nombre_cientifico: string | null;
  nombre_comun_espanol: string | null;
  nombre_comun_ingles: string | null;
}

/**
 * Obtiene la información taxonómica (orden, familia, género) para una lista de taxones
 */
async function getTaxonInfo(
  supabaseClient: any,
  taxonIds: number[],
): Promise<Map<number, TaxonInfo>> {
  const taxonInfoMap = new Map<number, TaxonInfo>();

  if (taxonIds.length === 0) {
    return taxonInfoMap;
  }

  // Obtener información taxonómica en lotes
  const batchSize = 100;

  for (let i = 0; i < taxonIds.length; i += batchSize) {
    const batch = taxonIds.slice(i, i + batchSize);

    // Obtener especies con su taxon_id (género)
    const {data: especies, error: errorEspecies} = await supabaseClient
      .from("taxon")
      .select("id_taxon, taxon_id")
      .in("id_taxon", batch)
      .eq("rank_id", 7);

    if (errorEspecies) {
      console.error("Error al obtener especies:", errorEspecies);
      continue;
    }

    if (!especies || especies.length === 0) {
      continue;
    }

    // Obtener géneros
    const generoIds = [...new Set(especies.map((e: any) => e.taxon_id).filter((id: any) => id !== null))];
    
    if (generoIds.length === 0) {
      continue;
    }

    const {data: generos, error: errorGeneros} = await supabaseClient
      .from("taxon")
      .select("id_taxon, taxon, taxon_id")
      .in("id_taxon", generoIds)
      .eq("rank_id", 6);

    if (errorGeneros) {
      console.error("Error al obtener géneros:", errorGeneros);
      continue;
    }

    // Obtener familias
    const familiaIds = [...new Set(generos?.map((g: any) => g.taxon_id).filter((id: any) => id !== null) || [])];
    
    if (familiaIds.length === 0) {
      continue;
    }

    const {data: familias, error: errorFamilias} = await supabaseClient
      .from("taxon")
      .select("id_taxon, taxon, taxon_id")
      .in("id_taxon", familiaIds);

    if (errorFamilias) {
      console.error("Error al obtener familias:", errorFamilias);
      continue;
    }

    // Obtener órdenes
    const ordenIds = [...new Set(familias?.map((f: any) => f.taxon_id).filter((id: any) => id !== null) || [])];
    
    if (ordenIds.length === 0) {
      continue;
    }

    const {data: ordenes, error: errorOrdenes} = await supabaseClient
      .from("taxon")
      .select("id_taxon, taxon")
      .in("id_taxon", ordenIds);

    if (errorOrdenes) {
      console.error("Error al obtener órdenes:", errorOrdenes);
      continue;
    }

    // Crear mapas para búsqueda rápida
    const generoMap = new Map<number, {taxon: string; taxon_id: number}>();
    generos?.forEach((g: any) => {
      generoMap.set(g.id_taxon, {taxon: g.taxon, taxon_id: g.taxon_id});
    });

    const familiaMap = new Map<number, {taxon: string; taxon_id: number}>();
    familias?.forEach((f: any) => {
      familiaMap.set(f.id_taxon, {taxon: f.taxon, taxon_id: f.taxon_id});
    });

    const ordenMap = new Map<number, string>();
    ordenes?.forEach((o: any) => {
      ordenMap.set(o.id_taxon, o.taxon);
    });

    // Construir el mapa final
    especies.forEach((especie: any) => {
      const genero = generoMap.get(especie.taxon_id);
      if (!genero) return;

      const familia = familiaMap.get(genero.taxon_id);
      if (!familia) return;

      const orden = ordenMap.get(familia.taxon_id);
      if (!orden) return;

      taxonInfoMap.set(especie.id_taxon, {
        id_taxon: especie.id_taxon,
        orden,
        familia: familia.taxon,
        genero: genero.taxon,
      });
    });
  }

  console.log(`✅ Información taxonómica obtenida para ${taxonInfoMap.size} taxones de ${taxonIds.length} solicitados`);
  return taxonInfoMap;
}

// Función para obtener todos los taxones con nombres comunes, organizados jerárquicamente
// Agrupa por orden > familia > género > nombre_base > especies
// idiomaId: ID del idioma en catalogo_awe (1=Español, 8=Inglés, etc.). Por defecto 1 (Español)
export default async function getTaxonNombres(idiomaId: number = 1): Promise<NombreGroup[]> {
  const supabaseClient = createServiceClient();

  // Obtener nombres comunes directamente de nombre_comun donde principal = true
  const {data: nombresData, error: errorNombres} = await supabaseClient
    .from("nombre_comun")
    .select("id_nombre_comun, nombre, taxon_id, catalogo_awe_idioma_id")
    .eq("principal", true)
    .eq("catalogo_awe_idioma_id", idiomaId)
    .not("taxon_id", "is", null);

  if (errorNombres) {
    console.error("Error al obtener nombres comunes:", errorNombres);
    return [];
  }

  if (!nombresData || nombresData.length === 0) {
    console.warn(`No se encontraron nombres comunes para idioma ${idiomaId}`);
    return [];
  }

  console.log(`✅ Encontrados ${nombresData.length} nombres comunes para idioma ${idiomaId}`);

  // Obtener información de taxones y nombres científicos
  const taxonIds = [...new Set(nombresData.map((n: any) => n.taxon_id))];
  
  // Obtener taxones (pueden ser especies o géneros)
  const {data: taxonesData, error: errorTaxones} = await supabaseClient
    .from("taxon")
    .select("id_taxon, taxon, taxon_id, rank_id")
    .in("id_taxon", taxonIds);

  if (errorTaxones) {
    console.error("Error al obtener taxones:", errorTaxones);
    return [];
  }

  // Crear mapa de taxon_id -> nombre científico
  const taxonIdToNombreCientifico = new Map<number, string>();
  const taxonIdToEspecie = new Map<number, string>();
  
  taxonesData?.forEach((t: any) => {
    // Usar el campo taxon (no el alias especie)
    taxonIdToEspecie.set(t.id_taxon, t.taxon);
  });

  // Obtener nombres científicos completos desde vw_lista_especies
  const {data: vwData, error: errorVw} = await supabaseClient
    .from("vw_lista_especies")
    .select("id_taxon, nombre_cientifico")
    .in("id_taxon", taxonIds);

  if (errorVw) {
    console.error("Error al obtener nombres científicos:", errorVw);
  } else if (vwData) {
    vwData.forEach((t: any) => {
      if (t.nombre_cientifico) {
        taxonIdToNombreCientifico.set(t.id_taxon, t.nombre_cientifico);
      }
    });
  }

  // Obtener información taxonómica
  const taxonInfoMap = await getTaxonInfo(supabaseClient, taxonIds);

  // Combinar datos de nombre_comun con información taxonómica
  const taxonesValidos: TaxonNombre[] = nombresData
    .map((n: any) => {
      const taxonInfo = taxonInfoMap.get(n.taxon_id);

      if (!taxonInfo) {
        console.warn(`No se encontró información taxonómica para taxon_id ${n.taxon_id}`);
        return null;
      }

      const nombreComun = n.nombre;
      const especie = taxonIdToEspecie.get(n.taxon_id) || "";
      const nombreCientifico = taxonIdToNombreCientifico.get(n.taxon_id);

      return {
        id_taxon: n.taxon_id,
        taxon: especie,
        nombre_comun: nombreComun,
        nombre_comun_completo: nombreComun,
        nombre_comun_ingles: idiomaId === 8 ? nombreComun : undefined, // Si es inglés, también ponerlo aquí
        nombre_cientifico: nombreCientifico,
        orden: taxonInfo.orden,
        familia: taxonInfo.familia,
        genero: taxonInfo.genero,
      } as TaxonNombre;
    })
    .filter((t): t is TaxonNombre => t !== null);

  console.log(`✅ Taxones válidos después de filtrar: ${taxonesValidos.length}`);

  // Agrupar por orden > familia > género > nombre_comun (original)
  const ordenesMap = new Map<
    string,
    Map<
      string,
      {
        generos: Map<
          string,
          {
            nombresComunes: Map<string, TaxonNombre[]>;
          }
        >;
      }
    >
  >();

  taxonesValidos.forEach((taxon) => {
    if (!taxon.orden || !taxon.familia || !taxon.genero || !taxon.nombre_comun) return;

    if (!ordenesMap.has(taxon.orden)) {
      ordenesMap.set(taxon.orden, new Map());
    }

    const familiasMap = ordenesMap.get(taxon.orden)!;

    if (!familiasMap.has(taxon.familia)) {
      familiasMap.set(taxon.familia, {
        generos: new Map(),
      });
    }

    const familiaData = familiasMap.get(taxon.familia)!;

    if (!familiaData.generos.has(taxon.genero)) {
      familiaData.generos.set(taxon.genero, {
        nombresComunes: new Map(),
      });
    }

    const generoData = familiaData.generos.get(taxon.genero)!;

    if (!generoData.nombresComunes.has(taxon.nombre_comun)) {
      generoData.nombresComunes.set(taxon.nombre_comun, []);
    }

    generoData.nombresComunes.get(taxon.nombre_comun)!.push(taxon);
  });

  // Convertir a la estructura de grupos
  const ordenes: NombreGroup[] = [];

  ordenesMap.forEach((familiasMap, ordenName) => {
    const familias: NombreGroup[] = [];

    familiasMap.forEach((familiaData, familiaName) => {
      const generos: NombreGroup[] = [];

      // Recopilar todos los nombres comunes únicos de la familia (normalizados)
      const nombresComunesFamiliaMap = new Map<string, string>(); // normalizado -> canónico

      familiaData.generos.forEach((generoData, generoName) => {
        // Recopilar todas las especies del género
        const todasLasEspecies: TaxonNombre[] = [];

        generoData.nombresComunes.forEach((especies, nombreComun) => {
          // Agregar todas las especies a la lista del género
          todasLasEspecies.push(...especies);
        });

        // Normalizar nombres para agrupamiento (pasar idiomaId)
        const especiesNormalizadas = normalizarNombres(todasLasEspecies, idiomaId);

        // Extraer nombres base únicos normalizados para el género
        const nombresBaseGeneroMap = new Map<string, string>(); // normalizado -> canónico

        especiesNormalizadas.forEach((especie) => {
          const especieConBase = especie as TaxonNombre & {
            nombreBase?: string;
          };
          const nombreBaseCanonico = especieConBase.nombreBase || "";

          if (nombreBaseCanonico) {
            const nombreBaseNormalizado = normalizarTildes(nombreBaseCanonico);

            if (!nombresBaseGeneroMap.has(nombreBaseNormalizado)) {
              nombresBaseGeneroMap.set(nombreBaseNormalizado, nombreBaseCanonico);
            }
          }
        });

        // Agregar nombres base del género a la familia
        nombresBaseGeneroMap.forEach((canonico, normalizado) => {
          if (!nombresComunesFamiliaMap.has(normalizado)) {
            nombresComunesFamiliaMap.set(normalizado, canonico);
          }
        });

        // Convertir a array de nombres canónicos ordenados
        const nombresComunesGenero = Array.from(nombresBaseGeneroMap.values())
          .toSorted((a, b) => a.localeCompare(b))
          .join(", ");

        // Ordenar todas las especies por nombre común (usar especies originales, no normalizadas)
        const especiesOrdenadas = todasLasEspecies.toSorted((a, b) =>
          (a.nombre_comun || "").localeCompare(b.nombre_comun || ""),
        );

        generos.push({
          id: `genero-${generoName}`,
          name: generoName,
          nombre_comun: nombresComunesGenero || null,
          nombres: especiesOrdenadas,
          children: undefined, // No mostrar agrupamiento por nombre base
        });
      });

      // Convertir Map a array de nombres canónicos ordenados
      const nombresComunesFamilia = Array.from(nombresComunesFamiliaMap.values())
        .toSorted((a, b) => a.localeCompare(b))
        .join(", ");

      familias.push({
        id: `familia-${familiaName}`,
        name: familiaName,
        nombre_comun: nombresComunesFamilia || null,
        nombres: [],
        children: generos.toSorted((a, b) => a.name.localeCompare(b.name)),
      });
    });

    ordenes.push({
      id: `orden-${ordenName}`,
      name: ordenName,
      nombres: [],
      children: familias.toSorted((a, b) => a.name.localeCompare(b.name)),
    });
  });

  const ordenesOrdenados = ordenes.toSorted((a, b) => a.name.localeCompare(b.name));
  console.log(`✅ Total de órdenes generados: ${ordenesOrdenados.length}`);
  
  return ordenesOrdenados;
}
