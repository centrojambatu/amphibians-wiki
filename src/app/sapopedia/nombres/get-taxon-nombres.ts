import {createServiceClient} from "@/utils/supabase/server";

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
}

export interface NombreGroup {
  id: string;
  name: string;
  nombre_comun?: string | null;
  nombres: TaxonNombre[];
  children?: NombreGroup[];
}

/**
 * Normaliza un nombre común extrayendo el nombre base según las reglas especificadas.
 * Esta función se aplica solo a los nombres agrupados en familia y género.
 */
export function normalizarNombreBase(nombreComun: string | null): string {
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

  // Obtener información taxonómica en lotes
  const batchSize = 100;

  for (let i = 0; i < taxonIds.length; i += batchSize) {
    const batch = taxonIds.slice(i, i + batchSize);

    const {data: taxones, error} = await supabaseClient
      .from("taxon")
      .select(
        "id_taxon, taxon_id, genero:taxon_id(taxon, taxon_id, familia:taxon_id(taxon, taxon_id, orden:taxon_id(taxon)))",
      )
      .in("id_taxon", batch);

    if (error) {
      console.error("Error al obtener información taxonómica:", error);
      continue;
    }

    if (taxones) {
      taxones.forEach((t: any) => {
        const genero = t.genero;
        const familia = genero?.familia;
        const orden = familia?.orden;

        if (orden?.taxon && familia?.taxon && genero?.taxon) {
          taxonInfoMap.set(t.id_taxon, {
            id_taxon: t.id_taxon,
            orden: orden.taxon,
            familia: familia.taxon,
            genero: genero.taxon,
          });
        }
      });
    }
  }

  return taxonInfoMap;
}

// Función para obtener todos los taxones con nombres comunes, organizados jerárquicamente
// Agrupa por orden > familia > género > nombre_base > especies
export default async function getTaxonNombres(): Promise<NombreGroup[]> {
  const supabaseClient = createServiceClient();

  // Obtener todos los taxones con nombres comunes desde la vista
  const {data: vwData, error: errorVw} = await supabaseClient
    .from("vw_nombres_comunes")
    .select(
      "id_taxon, id_ficha_especie, especie, nombre_cientifico, nombre_comun_espanol, nombre_comun_ingles",
    )
    .not("nombre_comun_espanol", "is", null)
    .order("especie", {ascending: true});

  if (errorVw) {
    console.error("Error al obtener nombres comunes:", errorVw);

    return [];
  }

  if (!vwData || vwData.length === 0) {
    return [];
  }

  // Obtener información taxonómica
  const taxonIds = [...new Set(vwData.map((t: any) => t.id_taxon))];
  const taxonInfoMap = await getTaxonInfo(supabaseClient, taxonIds);

  // Combinar datos - usar nombres comunes originales sin normalización
  const taxonesValidos: TaxonNombre[] = vwData
    .map((t: any) => {
      const taxonInfo = taxonInfoMap.get(t.id_taxon);

      if (!taxonInfo || !t.nombre_comun_espanol) {
        return null;
      }

      const nombreComun = t.nombre_comun_espanol;

      return {
        id_taxon: t.id_taxon,
        taxon: t.especie || "",
        nombre_comun: nombreComun, // Usar nombre común original
        nombre_comun_completo: nombreComun, // Mismo valor
        nombre_comun_ingles: t.nombre_comun_ingles || undefined,
        nombre_cientifico: t.nombre_cientifico || undefined,
        orden: taxonInfo.orden,
        familia: taxonInfo.familia,
        genero: taxonInfo.genero,
      } as TaxonNombre;
    })
    .filter((t): t is TaxonNombre => t !== null);

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

      // Recopilar todos los nombres comunes únicos de la familia (originales, sin normalización)
      const nombresComunesFamiliaSet = new Set<string>(); // Usar Set para evitar duplicados exactos

      familiaData.generos.forEach((generoData, generoName) => {
        // Recopilar todas las especies del género y sus nombres comunes únicos (originales)
        const todasLasEspecies: TaxonNombre[] = [];
        const nombresComunesGeneroSet = new Set<string>(); // Usar Set para evitar duplicados exactos

        generoData.nombresComunes.forEach((especies, nombreComun) => {
          // Agregar el nombre común original al set (sin normalización)
          nombresComunesGeneroSet.add(nombreComun);
          nombresComunesFamiliaSet.add(nombreComun);

          // Agregar todas las especies a la lista del género
          todasLasEspecies.push(...especies);
        });

        // Convertir Set a array ordenado y unir con comas para mostrar
        const nombresComunesGenero = Array.from(nombresComunesGeneroSet)
          .toSorted((a, b) => a.localeCompare(b))
          .join(", ");

        // Ordenar todas las especies por nombre común
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

      // Convertir Set a array ordenado y unir con comas
      const nombresComunesFamilia = Array.from(nombresComunesFamiliaSet)
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

  return ordenes.toSorted((a, b) => a.name.localeCompare(b.name));
}
