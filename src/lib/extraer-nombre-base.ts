/**
 * Extracción de nombre base a partir del nombre común completo.
 * Misma lógica que en la vista de nombres (get-taxon-nombres).
 * Usado para género/familia en el acordeón y para agrupación en nombres comunes.
 */
export function extraerNombreBaseNormalizado(nombreCompleto: string | null): string {
  if (!nombreCompleto) return "";

  let nombre = nombreCompleto.trim();

  // Regla 1a: "de [sustantivo] [adjetivo] con/sin [algo]" -> mantener "de [sustantivo]"
  const sustantivoAdjetivoConSin =
    /(de\s+(?:bosque|pies|vientre|cabeza|dorso|disco|ojos|muslos|patas|dedos|flancos|ingle|ingles|líneas|manchas|puntos|rayas|saco|párpado|color|garganta|hocico|rostro|brazo|membrana|bigote|membranas|cara|gula|trasero|rorso|anteojos|labio|labios))\s+[\wáéíóúñü]+\s+(?:con|sin)\s+[\wáéíóúñü\s]+$/iu;
  const match1a = sustantivoAdjetivoConSin.exec(nombre);

  if (match1a) return nombre.substring(0, match1a.index) + match1a[1];

  // Regla 1b: "de [sustantivo] [adjetivo]" -> mantener "de [sustantivo]"
  const sustantivosComunes =
    /(de\s+(?:bosque|pies|vientre|cabeza|dorso|disco|ojos|muslos|patas|dedos|flancos|ingle|ingles|líneas|manchas|puntos|rayas|saco|párpado|color|garganta|hocico|rostro|brazo|membrana|bigote|membranas|cara|gula|trasero|plano|rorso|anteojos|hocico|labio|labios))\s+[\wáéíóúñü]+$/iu;
  const match1b = sustantivosComunes.exec(nombre);

  if (match1b) return nombre.substring(0, match1b.index) + match1b[1];

  // Regla 2: "[sustantivo descriptivo compuesto] de [algo]"
  const descriptivosCompuestos =
    /((?:Rana)\s+de\s+(?:cristal|casco|dedos\s+delgados|espuma))\s+de\s+.+$/iu;

  nombre = nombre.replace(descriptivosCompuestos, "$1");

  // Regla 2b: "[sustantivo descriptivo simple] de [Nombre Propio]"
  const descriptivosSimples =
    /(hojarasquero|arlequín|espinosa|torrentícola|venenosa|arbórea|cohete|gladiadora|gomosa|verde|ágil|amazónica|nodriza|dedilarga|bullanguero|listada|marsupial|hoja)\s+de\s+[A-ZÁÉÍÓÚÑÜ].+$/iu;

  nombre = nombre.replace(descriptivosSimples, "$1");

  // Regla 2c: Limpiar "[sustantivo descriptivo] de"
  nombre = nombre.replace(
    /(hojarasquero|arlequín|espinosa|torrentícola|venenosa|arbórea|cohete|gladiadora|gomosa|verde|ágil|nodriza|dedilarga|bullanguero|listada|marsupial|hoja)\s+de$/iu,
    "$1",
  );

  // Regla 3: "[sustantivo descriptivo o base] [cualquier palabra]"
  const descriptivoConSufijo =
    /^(.*\s+)(hojarasquero|arlequín|espinosa|torrentícola|venenosa|arbórea|cohete|gladiadora|gomosa|verde|ágil|amazónica|nodriza|dedilarga|bullanguero|listada|marsupial|hoja|hocicuda|de\s+charco|Ilulo|Sapo|Sapito|Cutín|Cutin|Rana|Ranita|Salamandra|Kayla|Pipa|Smilisca)\s+[\wáéíóúñü]+$/iu;
  const match3 = descriptivoConSufijo.exec(nombre);

  if (match3) nombre = match3[1].trim() + " " + match3[2];

  // Regla 4: "con [algo]"
  nombre = nombre.replace(/\s+con\s+[\wáéíóúñü\s]+$/iu, "");

  // Regla 5: "de [Nombre Propio]"
  nombre = nombre.replace(/\s+de\s+[A-ZÁÉÍÓÚÑÜ].+$/iu, "");

  // Regla 6: "del [sustantivo] [adjetivo]"
  const delSustantivo =
    /(del\s+(?:bosque|Norte|Chocó|Cóndor|Gualaceño|Alto\s+Amazonas))\s+[\wáéíóúñü]+$/iu;
  const match6 = delSustantivo.exec(nombre);

  if (match6) return nombre.substring(0, match6.index) + match6[1];

  // Regla 7: "del [Lugar]"
  const delExcepciones = /\s+del\s+(Cóndor|Norte|Padre|Alto\s+Amazonas|Gualaceño|Chocó|bosque)/iu;

  if (!delExcepciones.test(nombre)) nombre = nombre.replace(/\s+del\s+[A-ZÁÉÍÓÚÑÜ].+$/iu, "");

  // Regla 8: "amante de [algo]" y "en forma de [algo]"
  nombre = nombre.replace(/(\s+amante)\s+de\s+.+$/iu, "$1");
  nombre = nombre.replace(/(\s+en\s+forma)\s+de\s+.+$/iu, "$1");

  // Regla 9: Frases compuestas
  nombre = nombre.replace(
    /\s+(amazónico\s+variable|cabeza\s+grande|calcar\s+pequeño|diablo\s+andino|gigante\s+andino|línea\s+amarilla|más\s+hermoso|muslo\s+negro|negro\s+y\s+gris|no\s+saltarín|previo\s+a\s+la\s+muerte|rojo\s+sangre|salpicado\s+pálido|tuberculoso\s+pequeño|verde\s+rojizo|gigante\s+moteado|mágica\s+y\s+maravillosa|mapa\s+apendiculado|anteojos\s+bifurcado|de\s+la\s+costa|juiciu\s+jambatu|gran\s+hermano|de\s+cinco\s+líneas|de\s+ojos\s+rojos|punteada\s+naranja|punteada\s+rosada)$/iu,
    "",
  );

  // Regla 10: Adjetivos simples
  nombre = nombre.replace(
    /\s+(adornado|afortunado|afro|ágata|amazónico|anaranjado|andino|atenuado|alado|amistoso|balador|bello|bonito|bromelícola|café|cañari|ceniciento|ceñudo|charlatán|conífero|coronado|cornudo|desnudo|diferente|diminuto|ecuatoriano|elfo|enano|enguatado|escondedor|espadachín|espejo|espinoso|exiliado|frío|gigante|glandular|grande|grueso|gualita|guardián|labioso|llorón|luchador|magnífico|manchado|marino|mezclado|minúsculo|minuto|modesto|montañero|morlaco|moteado|mutable|narizón|negro|negra|obscuro|ocelado|ocultador|pequeño|peruano|pinchaque|pseudoacuminado|raro|resplandeciente|rugoso|sacharuna|saltarín|salpicado|sanguinolento|sencillo|silencioso|solitario|sonrosado|sordo|sucio|tiktik|tímido|truncado|tubercular|variable|variado|verde|vertebralis|viudo|marrones|anómala|salpicada|ecuatoriana|minúscula|punteada|naranja|rosada|amarilla|azul|blanca)$/iu,
    "",
  );

  // Regla 11: Nombres propios
  nombre = nombre.replace(
    /\s+(Cuico|Kichwa|Quechua|Waorani|Yumbo|Tesoro|Tsáchila|Siona|Puro\s+Coffee|Príncipe\s+Carlos|Jambato|Zápara)$/iu,
    "",
  );

  return nombre.trim();
}

function normalizarTildes(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/**
 * Dado una lista de especies con nombre_comun, devuelve el nombre común representativo
 * para el grupo (género o familia): si hay una sola especie, su nombre base extraído;
 * si hay varias, el nombre base más frecuente (o el más corto si hay empate).
 */
export function nombreComunRepresentativo(
  especies: { nombre_comun: string | null }[],
): string | null {
  const conNombre = especies
    .map((e) => e.nombre_comun)
    .filter((n): n is string => !!n && n.trim() !== "");

  if (conNombre.length === 0) return null;

  const bases = conNombre.map((n) => extraerNombreBaseNormalizado(n)).filter((b) => b !== "");

  if (bases.length === 0) return null;

  // Una sola especie (o un solo nombre base): usar el más "base" = el extraído (ya es el más base)
  if (bases.length === 1) return bases[0];

  // Varias: contar por forma normalizada y elegir el más frecuente; si empate, el más corto (más base)
  const conteo = new Map<string, { original: string; count: number }>();

  for (const base of bases) {
    const key = normalizarTildes(base);
    const existing = conteo.get(key);

    if (existing) {
      existing.count += 1;
    } else {
      conteo.set(key, { original: base, count: 1 });
    }
  }

  let mejor: { original: string; count: number } | null = null;

  conteo.forEach((val) => {
    const current = mejor;

    if (!current || val.count > current.count) {
      mejor = val;
    } else if (val.count === current.count && val.original.length < current.original.length) {
      mejor = val;
    }
  });

  return mejor ? (mejor as { original: string; count: number }).original : null;
}
