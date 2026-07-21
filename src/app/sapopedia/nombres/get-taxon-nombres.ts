import {unstable_cache} from "next/cache";

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
  rank_id?: number; // Rank taxonómico: 4=Orden, 5=Familia, 6=Género, 7=Especie
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
 * En otros idiomas, el nombre base es el sustantivo principal (frog, toad, salamander, etc.)
 * Remueve adjetivos, nombres propios y especificadores, dejando solo el sustantivo.
 * MÁS ESTRICTA: Solo devuelve sustantivos principales conocidos, nunca adjetivos.
 */
function extraerNombreBaseGenerico(nombreComun: string | null): string {
  if (!nombreComun) return "";
  
  let nombre = nombreComun.trim();
  
  // Remover apóstrofes y posesivos comunes (ej: "Göldi's", "Simpson's")
  nombre = nombre.replace(/['']s\s+/gi, " ");
  
  // Diccionario de sustantivos principales por idioma (el nombre base que queremos extraer)
  // Estos son los ÚNICOS valores válidos como nombre base
  // Ordenados por prioridad (más específicos primero para evitar falsos positivos)
  const sustantivosPrincipales = [
    // Inglés (compuestos primero, luego simples)
    "treefrog", "glassfrog", "rainfrog", "swampfrog", "froglet", "toadlet",
    "frog", "toad", "salamander", "caecilian", "newt",
    // Alemán (compuestos primero)
    "laubfrosch", "regenfrosch", "glasfrosch", "hammerfrosch", "pfeilgiftfrosch",
    "raketenfrosch", "sumpffrosch", "fröschlein", "riesenkröte", "zwergkröte",
    "frosch", "kröte", "salamander", "molch", "blindwühle", "wurmsalamander",
    // Francés (compuestos primero)
    "grenouille-feuille", "grenouille-marteau", "grenouille-fusée",
    "grenouille", "crapaud", "salamandre", "triton", "rainette", "cécilie",
    // Portugués (compuestos primero)
    "perereca-de-dorso-espinhoso", "perereca-de-riacho", "rã-da-chuva",
    "rã-da-chuva-da-floresta", "rã-de-capacete", "rã-de-dedos-finos",
    "rã-de-focinho", "rã-de-riacho", "rã-de-vidro", "rã-do-brejo",
    "rã-enfermeira", "rã-foguete", "rã-folha", "rã-gladiadora",
    "rã-marsupial", "rã-martelo", "rã-pac-man", "rã-pegajosa",
    "rã-venenosa", "rã-verde", "rã-ágil", "rãzinha",
    "salamandra-sem-pulmão", "salamandra-verme", "sapo-arlequim",
    "sapo-de-espuma", "sapo-gigante",
    "rã", "sapo", "salamandra", "cobrinha", "perereca", "sapinho", "cecília",
    // Italiano
    "ranina", "rospetto",
    "rana", "rospo", "salamandra", "tritone", "cecilia",
    // Chino
    "蛙", "蟾蜍", "蝾螈",
    // Hindi
    "मेंढक", "टोड", "सीसीलियन", "सैलामैंडर",
    // Árabe
    "ضفدع", "علجوم",
    // Ruso
    "лягушка", "жаба", "саламандра", "жабка", "лягушонок", "червяга",
    // Japonés
    "カエル", "ガマ", "イモリ", "アマガエル", "アメガエル", "コガエル", "コガマ",
    // Holandés (compuestos primero)
    "boomkikker", "regenkikker", "glaskikker", "hamerkikker", "raketkikker",
    "sumpfkikker", "buidelkikker", "kikkertje", "reuzenpad", "dwergpad",
    "kikker", "pad", "salamander", "wormsalamander",
  ];
  
  // Diccionario de adjetivos comunes que NO deben ser nombre base
  const adjetivosComunes = [
    // Inglés
    "confused", "dark", "spotted", "smooth", "gliding", "exasperating", "thin", "toed", "hammer",
    "amazonian", "senior", "brother", "nurse", "leaf",
    // Alemán
    "verwechselt", "dunkel", "gefleckt", "glatt", "schenkel", "blatt", "amazonisch", "amazonian",
    // Francés
    "confondu", "sombre", "taches", "lisse", "cuisse", "feuille", "amazonien",
    // Portugués
    "confuso", "escuro", "manchas", "liso", "coxa", "folha", "amazônico",
    // Italiano
    "confuso", "scuro", "macchie", "liscio", "coscia", "foglia", "amazzonico",
  ];
  
  // Primero buscar en el nombre completo (más confiable para nombres compuestos)
  const nombreLower = nombre.toLowerCase();
  for (const sustantivo of sustantivosPrincipales) {
    // Buscar el sustantivo en el nombre completo (puede tener variaciones)
    // Priorizar coincidencias exactas de palabras completas
    const regexExacto = new RegExp(`\\b${sustantivo}\\b`, "i");
    if (regexExacto.test(nombreLower)) {
      return sustantivo;
    }
    // Si no hay coincidencia exacta, buscar como substring
    if (nombreLower.includes(sustantivo)) {
      return sustantivo;
    }
  }
  
  // Si no se encuentra en el nombre completo, buscar palabra por palabra
  const palabras = nombre.split(/[\s-]+/); // Dividir por espacios y guiones
  
  // Buscar el sustantivo principal (generalmente está al final o cerca del final)
  // Buscar desde el final hacia el inicio para encontrar el sustantivo principal
  for (let i = palabras.length - 1; i >= 0; i--) {
    const palabraLimpia = palabras[i].toLowerCase().replace(/[.,;:!?]/g, ""); // Remover puntuación
    
    // Verificar si es un sustantivo principal (coincidencia exacta primero)
    for (const sustantivo of sustantivosPrincipales) {
      if (palabraLimpia === sustantivo) {
        // Coincidencia exacta - devolver el sustantivo principal canónico
        return sustantivo;
      }
      // También verificar si contiene o está contenido en el sustantivo
      if (palabraLimpia.includes(sustantivo) || sustantivo.includes(palabraLimpia)) {
        // Devolver el sustantivo principal canónico (no la variación)
        return sustantivo;
      }
    }
  }
  
  // Si aún no se encuentra, intentar buscar variaciones con sufijos comunes y compuestos
  // Primero buscar compuestos que contengan sustantivos base
  const compuestosConBase = [
    // Inglés: extraer base de compuestos
    {patron: /treefrog|tree-frog/i, base: "frog"},
    {patron: /glassfrog|glass-frog/i, base: "frog"},
    {patron: /rainfrog|rain-frog/i, base: "frog"},
    {patron: /swampfrog|swamp-frog/i, base: "frog"},
    {patron: /froglet/i, base: "frog"},
    {patron: /toadlet/i, base: "toad"},
    // Alemán: extraer base de compuestos
    {patron: /laubfrosch|laub-frosch/i, base: "frosch"},
    {patron: /regenfrosch|regen-frosch/i, base: "frosch"},
    {patron: /glasfrosch|glas-frosch/i, base: "frosch"},
    {patron: /hammerfrosch|hammer-frosch/i, base: "frosch"},
    {patron: /raketenfrosch|raketen-frosch/i, base: "frosch"},
    {patron: /sumpffrosch|sumpf-frosch/i, base: "frosch"},
    {patron: /fröschlein/i, base: "frosch"},
    {patron: /riesenkröte|riesen-kröte/i, base: "kröte"},
    {patron: /zwergkröte|zwerg-kröte/i, base: "kröte"},
    // Francés: extraer base de compuestos
    {patron: /grenouille-feuille|grenouille feuille/i, base: "grenouille"},
    {patron: /grenouille-marteau|grenouille marteau/i, base: "grenouille"},
    {patron: /grenouille-fusée|grenouille fusée/i, base: "grenouille"},
    // Portugués: extraer base de compuestos con "rã-"
    {patron: /rã-[a-z-]+|rã [a-z ]+/i, base: "rã"},
    {patron: /perereca-[a-z-]+|perereca [a-z ]+/i, base: "perereca"},
    {patron: /sapinho/i, base: "sapinho"},
    {patron: /sapo-[a-z-]+|sapo [a-z ]+/i, base: "sapo"},
    // Holandés: extraer base de compuestos
    {patron: /boomkikker|boom-kikker/i, base: "kikker"},
    {patron: /regenkikker|regen-kikker/i, base: "kikker"},
    {patron: /glaskikker|glas-kikker/i, base: "kikker"},
    {patron: /hamerkikker|hamer-kikker/i, base: "kikker"},
    {patron: /raketkikker|raket-kikker/i, base: "kikker"},
    {patron: /sumpfkikker|sumpf-kikker/i, base: "kikker"},
    {patron: /kikkertje/i, base: "kikker"},
    {patron: /reuzenpad|reuzen-pad/i, base: "pad"},
    {patron: /dwergpad|dwerg-pad/i, base: "pad"},
  ];
  
  for (const compuesto of compuestosConBase) {
    if (compuesto.patron.test(nombreLower)) {
      return compuesto.base;
    }
  }
  
  // Buscar variaciones con sufijos comunes (plurales, diminutivos, etc.)
  const variacionesSustantivos = [
    {base: "frosch", variaciones: ["frösche", "frosches", "frosch", "fröschlein"]},
    {base: "kröte", variaciones: ["kröten", "kröte", "riesenkröte", "zwergkröte"]},
    {base: "frog", variaciones: ["frogs", "frog", "froglet", "treefrog", "glassfrog", "rainfrog", "swampfrog"]},
    {base: "toad", variaciones: ["toads", "toad", "toadlet"]},
    {base: "grenouille", variaciones: ["grenouilles", "grenouille", "grenouille-feuille", "grenouille-marteau", "grenouille-fusée"]},
    {base: "crapaud", variaciones: ["crapauds", "crapaud"]},
    {base: "rainette", variaciones: ["rainettes", "rainette"]},
    {base: "rana", variaciones: ["rane", "rana", "ranina"]},
    {base: "rospo", variaciones: ["rospi", "rospo", "rospetto"]},
    {base: "rã", variaciones: ["rãs", "rã", "rãzinha"]},
    {base: "sapo", variaciones: ["sapos", "sapo"]},
    {base: "perereca", variaciones: ["pererecas", "perereca"]},
    {base: "sapinho", variaciones: ["sapinhos", "sapinho"]},
    {base: "salamander", variaciones: ["salamanders", "salamander", "wurmsalamander"]},
    {base: "salamandre", variaciones: ["salamandres", "salamandre"]},
    {base: "kikker", variaciones: ["kikkers", "kikker", "kikkertje", "boomkikker", "regenkikker", "glaskikker", "hamerkikker", "raketkikker", "sumpfkikker"]},
    {base: "pad", variaciones: ["padden", "pad", "reuzenpad", "dwergpad"]},
    {base: "лягушка", variaciones: ["лягушка", "лягушонок", "жабка"]},
    {base: "жаба", variaciones: ["жаба", "жабка"]},
  ];
  
  for (const variacion of variacionesSustantivos) {
    for (const variacionForma of variacion.variaciones) {
      // Buscar con límites de palabra para evitar falsos positivos
      const regexVariacion = new RegExp(`\\b${variacionForma.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (regexVariacion.test(nombreLower)) {
        return variacion.base;
      }
      // También buscar como substring si no hay límites de palabra
      if (nombreLower.includes(variacionForma.toLowerCase())) {
        return variacion.base;
      }
    }
  }
  
  // Si NO se encuentra ningún sustantivo principal conocido, NO devolver adjetivos
  // En su lugar, devolver el nombre completo original (mejor que un adjetivo incorrecto)
  // Esto fuerza a que se use el nombre completo si no hay sustantivo identificable
  return nombreComun.trim();
}

/**
 * Función de normalización con dos pasadas y agrupación sin tildes
 * Funciona con cualquier idioma, pero las reglas están optimizadas para español.
 * Para otros idiomas, usa una extracción más genérica y estricta (solo sustantivo principal).
 */
function normalizarNombres(
  listaEspecies: TaxonNombre[],
  idiomaId?: number,
): (TaxonNombre & {nombreBase: string; nombreBaseNormalizado: string})[] {
  // Para español (idiomaId = 1), usar la función específica
  // Para otros idiomas, usar una extracción más genérica y estricta
  const esEspanol = idiomaId === 1 || idiomaId === undefined;
  
  // PASADA 1: Extraer nombre base
  const especiesConBase = listaEspecies.map((especie) => {
    let nombreBase: string;
    
    if (esEspanol) {
      // Usar la función específica para español
      nombreBase = extraerNombreBaseNormalizado(especie.nombre_comun);
    } else {
      // Para otros idiomas, extracción genérica ESTRICTA: solo sustantivo principal
      nombreBase = extraerNombreBaseGenerico(especie.nombre_comun);
    }
    
    return {
      ...especie,
      nombreBase,
      nombreBaseNormalizado: normalizarTildes(nombreBase),
    };
  });
  
  // Para otros idiomas, NO hacer optimizaciones - devolver directamente el sustantivo extraído
  if (!esEspanol) {
    // Contar por nombre normalizado para elegir versión canónica
    const versionesPreferidas: Record<string, Record<string, number>> = {};
    
    especiesConBase.forEach((item) => {
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
    
    // Aplicar nombres canónicos (solo para unificar variaciones del mismo sustantivo)
    return especiesConBase.map((item) => ({
      ...item,
      nombreBase: nombreBaseCanonicos[item.nombreBaseNormalizado] || item.nombreBase,
    }));
  }

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

        // NUEVO: calcular el LCP (longest common prefix) más largo entre la base de esta
        // especie y las bases de OTRAS especies del grupo. Adopta el LCP si es un prefijo
        // más específico compartido (ej: "Rana cohete de brazo" + "Rana cohete" -> ambas
        // usan "Rana cohete"). Si la base actual ya coincide con el LCP más largo, se
        // mantiene y se saltan las estrategias antiguas de colapso a primera palabra.
        let mejorLCPPalabras = 0;

        for (const otra of especiesConBase) {
          if (otra.nombreBaseNormalizado === item.nombreBaseNormalizado) continue;
          const palabrasOtra = otra.nombreBase.split(/\s+/);
          const maxComparar = Math.min(palabras.length, palabrasOtra.length);
          let lcpLen = 0;

          for (let i = 0; i < maxComparar; i++) {
            if (normalizarTildes(palabras[i]) === normalizarTildes(palabrasOtra[i])) {
              lcpLen += 1;
            } else {
              break;
            }
          }
          if (lcpLen > mejorLCPPalabras) mejorLCPPalabras = lcpLen;
        }

        // Truncar el LCP si termina en preposición/conector (ej: "Rana arlequín de")
        // para no crear bases semánticamente inválidas.
        const conectores = new Set(["de", "del", "con", "sin", "y", "a", "en", "para", "por"]);

        while (
          mejorLCPPalabras >= 1 &&
          conectores.has(normalizarTildes(palabras[mejorLCPPalabras - 1]))
        ) {
          mejorLCPPalabras -= 1;
        }

        // Si el LCP es tan largo como la base actual, mantenerla (la base ya es un prefijo compartido)
        if (mejorLCPPalabras >= palabras.length) {
          // No hacer nada: la base ya es un prefijo compartido con alguna otra especie
        } else if (mejorLCPPalabras >= 2) {
          // Reducir a un prefijo compartido más específico que "primera palabra"
          const lcp = palabras.slice(0, mejorLCPPalabras).join(" ");
          baseFinal = lcp;
          baseFinalNormalizado = normalizarTildes(lcp);
        } else if (
          especiesConBase.length === 1 &&
          palabras.length >= 2 &&
          nombresBaseSimples.has(normalizarTildes(palabras[0]))
        ) {
          // Grupo con una sola especie: colapsar al nombre más base (primera palabra)
          // Ej: Tepuihyla → "Rana arbórea de tepui" → "Rana"
          baseFinal = palabras[0];
          baseFinalNormalizado = normalizarTildes(palabras[0]);
        } else {
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

// Función para obtener todos los taxones con nombres comunes, organizados jerárquicamente
// Agrupa por orden > familia > género > nombre_base > especies
// idiomaId: ID del idioma en catalogo_awe (1=Español, 8=Inglés, etc.). Por defecto 1 (Español)
async function getTaxonNombresRaw(idiomaId: number = 1): Promise<NombreGroup[]> {
  const supabaseClient = createServiceClient();

  // Una sola query a vw_nombres_comunes.
  // La vista ya filtra ficha_especie.publicar=true y expone orden/familia/género
  // desde vw_ficha_especie_completa, más nombres_comunes_json con todos los idiomas.
  const {data: rows, error} = await (supabaseClient as any)
    .from("vw_nombres_comunes")
    .select(
      "id_taxon, especie, nombre_cientifico, orden, familia, genero, nombres_comunes_json",
    );

  if (error) {
    console.error("Error al obtener nombres comunes:", error);
    return [];
  }

  if (!rows || rows.length === 0) {
    return [];
  }

  const idiomaKey = String(idiomaId);
  const inglesKey = "8";

  const taxonesValidos: TaxonNombre[] = rows
    .map((r: any) => {
      const nombresJson = (r.nombres_comunes_json || {}) as Record<string, string | null>;
      const nombreComun = nombresJson[idiomaKey];

      if (!nombreComun || !r.orden || !r.familia || !r.genero) return null;

      return {
        id_taxon: r.id_taxon,
        taxon: r.especie || "",
        nombre_comun: nombreComun,
        nombre_comun_completo: nombreComun,
        nombre_comun_ingles: nombresJson[inglesKey] || undefined,
        nombre_cientifico: r.nombre_cientifico || undefined,
        orden: r.orden,
        familia: r.familia,
        genero: r.genero,
      } as TaxonNombre;
    })
    .filter((t: TaxonNombre | null): t is TaxonNombre => t !== null);

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

        // Reglas excepcionales por género: garantizar que ciertos nombres base
        // simples aparezcan siempre aunque la lógica de LCP los haya "escondido"
        // porque cada especie tiene un adjetivo/sufijo diferente.
        const REGLAS_EXCEPCIONALES_GENERO: Record<string, string[]> = {
          Pristimantis: ["Cutín"],
          Ectopoglossus: ["Rana cohete"],
          Oophaga: ["Rana venenosa"],
          Adelophryne: ["Rana martillo"],
          Diasporus: ["Rana martillo"],
          Ecnomiohyla: ["Rana arbórea"],
          Sphaenorhynchus: ["Rana verde"],
          Tepuihyla: ["Rana arbórea"],
          Lithodytes: ["Rana lista"],
          Pithecopus: ["Rana hoja"],
          Elachistocleis: ["Ranita hocicuda"],
          Hamptophryne: ["Ranita hocicuda"],
          Synapturanus: ["Ranita hocicuda"],
          Nyctimantis: ["Rana arbórea"],
        };
        const basesForzadas = REGLAS_EXCEPCIONALES_GENERO[generoName];

        if (basesForzadas && idiomaId === 1) {
          // Reemplazar: descartar los nombres base auto-generados y dejar solo los forzados.
          nombresBaseGeneroMap.clear();
          for (const base of basesForzadas) {
            const clave = normalizarTildes(base);

            nombresBaseGeneroMap.set(clave, base);
          }
        }

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

  return ordenesOrdenados;
}

// Wrapper con cache por idioma. Un cache miss por idioma; los siguientes son instantáneos.
const getTaxonNombresCached = unstable_cache(
  (idiomaId: number) => getTaxonNombresRaw(idiomaId),
  ["get-taxon-nombres"],
  {revalidate: 3600, tags: ["nombres"]},
);

export default async function getTaxonNombres(idiomaId: number = 1): Promise<NombreGroup[]> {
  return getTaxonNombresCached(idiomaId);
}
