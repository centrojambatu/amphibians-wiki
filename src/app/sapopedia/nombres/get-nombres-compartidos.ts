import {createServiceClient} from "@/utils/supabase/server";

import {TaxonNombre} from "./get-taxon-nombres";

export interface NombreCompartido {
  nombre: string;
  especies: TaxonNombre[];
  familia?: string;
  genero?: string;
  orden?: string;
}

export interface NombresCompartidosPorFamilia {
  familia: string;
  nombre_comun_familia: string | null;
  orden: string;
  nombres: NombreCompartido[];
}

export interface NombresCompartidosPorGenero {
  genero: string;
  nombre_comun_genero: string | null;
  familia: string;
  orden: string;
  nombres: NombreCompartido[];
}

interface VwNombresComunes {
  id_taxon: number;
  id_ficha_especie: number;
  especie: string;
  nombre_cientifico: string | null;
  nombre_comun_espanol: string | null;
  nombre_comun_ingles: string | null;
  nombre_comun_aleman: string | null;
  nombre_comun_frances: string | null;
  nombre_comun_portugues: string | null;
  nombre_comun_chino: string | null;
  nombre_comun_italiano: string | null;
  nombre_comun_hindu: string | null;
  nombre_comun_arabe: string | null;
  nombre_comun_ruso: string | null;
  nombre_comun_japones: string | null;
  nombre_comun_holandes: string | null;
  nombres_comunes_json: Record<string, string> | null;
}

interface TaxonInfo {
  id_taxon: number;
  orden: string;
  familia: string;
  genero: string;
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
          const idTaxon = t.id_taxon as number;

          taxonInfoMap.set(idTaxon, {
            id_taxon: idTaxon,
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

/**
 * Obtiene el nombre común según el idioma especificado
 */
function obtenerNombreComunPorIdioma(taxon: VwNombresComunes, idiomaId: number): string | null {
  // Mapeo de ID de idioma a nombre de columna
  const columnasPorIdioma: Record<number, keyof VwNombresComunes> = {
    1: "nombre_comun_espanol",
    8: "nombre_comun_ingles",
    9: "nombre_comun_aleman",
    10: "nombre_comun_frances",
    11: "nombre_comun_portugues",
    545: "nombre_comun_chino",
    546: "nombre_comun_italiano",
    547: "nombre_comun_hindu",
    548: "nombre_comun_arabe",
    549: "nombre_comun_ruso",
    550: "nombre_comun_japones",
    551: "nombre_comun_holandes",
  };

  // Intentar obtener de la columna específica
  const columna = columnasPorIdioma[idiomaId];

  if (columna && taxon[columna]) {
    return taxon[columna] as string | null;
  }

  // Si no está en la columna específica, intentar obtener del JSONB
  return taxon.nombres_comunes_json?.[String(idiomaId)] || null;
}

/**
 * Encuentra nombres comunes compartidos por múltiples especies dentro de la misma familia
 * Lee directamente de la vista vw_nombres_comunes
 * @param idiomaId - ID del idioma (1=Español, 8=Inglés, etc.). Por defecto 1 (Español)
 */
export async function getNombresCompartidosPorFamilia(
  idiomaId: number = 1,
): Promise<NombresCompartidosPorFamilia[]> {
  const supabaseClient = createServiceClient();

  // Seleccionar todas las columnas disponibles de la vista
  const {data: vwData, error: errorVw} = await supabaseClient
    .from("vw_nombres_comunes")
    .select(
      "id_taxon, id_ficha_especie, especie, nombre_cientifico, nombre_comun_espanol, nombre_comun_ingles, nombre_comun_aleman, nombre_comun_frances, nombre_comun_portugues, nombre_comun_chino, nombre_comun_italiano, nombre_comun_hindu, nombre_comun_arabe, nombre_comun_ruso, nombre_comun_japones, nombre_comun_holandes, nombres_comunes_json",
    );

  if (errorVw || !vwData) {
    console.error("Error al obtener nombres comunes:", errorVw);

    return [];
  }

  // Filtrar por idioma usando el JSONB o la columna específica
  const vwDataFiltrados = (vwData as unknown as VwNombresComunes[]).filter((taxon) => {
    const nombreComun = obtenerNombreComunPorIdioma(taxon, idiomaId);

    return nombreComun !== null && nombreComun.trim() !== "";
  });

  if (!vwDataFiltrados || vwDataFiltrados.length === 0) {
    return [];
  }

  // Obtener información taxonómica
  const taxonIds = [...new Set(vwDataFiltrados.map((t: VwNombresComunes) => t.id_taxon))];
  const taxonInfoMap = await getTaxonInfo(supabaseClient, taxonIds);

  // Combinar datos
  const taxonesValidos: (VwNombresComunes & TaxonInfo)[] = vwDataFiltrados
    .map((t: VwNombresComunes) => {
      const taxonInfo = taxonInfoMap.get(t.id_taxon);

      if (!taxonInfo) {
        return null;
      }

      return {
        ...t,
        ...taxonInfo,
      };
    })
    .filter((t): t is VwNombresComunes & TaxonInfo => t !== null);

  const familiasMap = new Map<
    string,
    {
      nombre_comun: string | null;
      orden: string;
      familia: string;
      nombresCompartidos: Map<string, TaxonNombre[]>;
    }
  >();

  // Agrupar por familia y recopilar todos los nombres
  taxonesValidos.forEach((taxon) => {
    const familiaKey = `${taxon.orden}-${taxon.familia}`;

    if (!familiasMap.has(familiaKey)) {
      familiasMap.set(familiaKey, {
        nombre_comun: null,
        orden: taxon.orden,
        familia: taxon.familia,
        nombresCompartidos: new Map(),
      });
    }

    const familiaData = familiasMap.get(familiaKey)!;

    // Obtener el nombre común según el idioma especificado
    const nombreComun = obtenerNombreComunPorIdioma(taxon, idiomaId);

    if (nombreComun) {
      const nombreKey = nombreComun.toLowerCase().trim();

      if (!familiaData.nombresCompartidos.has(nombreKey)) {
        familiaData.nombresCompartidos.set(nombreKey, []);
      }

      familiaData.nombresCompartidos.get(nombreKey)!.push({
        id_taxon: taxon.id_taxon,
        taxon: taxon.especie || "",
        nombre_comun: nombreComun,
        nombre_cientifico: taxon.nombre_cientifico || undefined,
        orden: taxon.orden,
        familia: taxon.familia,
        genero: taxon.genero,
      });
    }
  });

  // Filtrar solo los nombres que aparecen en múltiples especies
  const resultados: NombresCompartidosPorFamilia[] = [];

  familiasMap.forEach((familiaData) => {
    const nombresCompartidos: NombreCompartido[] = [];

    familiaData.nombresCompartidos.forEach((especies) => {
      // Solo incluir si hay más de una especie con este nombre
      if (especies.length > 1) {
        nombresCompartidos.push({
          nombre: especies[0].nombre_comun!,
          especies: especies,
          familia: familiaData.familia,
          orden: familiaData.orden,
        });
      }
    });

    if (nombresCompartidos.length > 0) {
      const sortedNombres = nombresCompartidos.toSorted((a, b) => a.nombre.localeCompare(b.nombre));

      resultados.push({
        familia: familiaData.familia,
        nombre_comun_familia: familiaData.nombre_comun,
        orden: familiaData.orden,
        nombres: sortedNombres,
      });
    }
  });

  return resultados.sort((a, b) => {
    if (a.orden !== b.orden) {
      return a.orden.localeCompare(b.orden);
    }

    return a.familia.localeCompare(b.familia);
  });
}

/**
 * Encuentra nombres comunes compartidos por múltiples especies dentro del mismo género
 * Lee directamente de la vista vw_nombres_comunes
 * @param idiomaId - ID del idioma (1=Español, 8=Inglés, etc.). Por defecto 1 (Español)
 */
export async function getNombresCompartidosPorGenero(
  idiomaId: number = 1,
): Promise<NombresCompartidosPorGenero[]> {
  const supabaseClient = createServiceClient();

  // Seleccionar todas las columnas disponibles de la vista
  const {data: vwData, error: errorVw} = await supabaseClient
    .from("vw_nombres_comunes")
    .select(
      "id_taxon, id_ficha_especie, especie, nombre_cientifico, nombre_comun_espanol, nombre_comun_ingles, nombre_comun_aleman, nombre_comun_frances, nombre_comun_portugues, nombre_comun_chino, nombre_comun_italiano, nombre_comun_hindu, nombre_comun_arabe, nombre_comun_ruso, nombre_comun_japones, nombre_comun_holandes, nombres_comunes_json",
    );

  if (errorVw || !vwData) {
    console.error("Error al obtener nombres comunes:", errorVw);

    return [];
  }

  // Filtrar por idioma usando el JSONB o la columna específica
  const vwDataFiltrados = (vwData as unknown as VwNombresComunes[]).filter((taxon) => {
    const nombreComun = obtenerNombreComunPorIdioma(taxon, idiomaId);

    return nombreComun !== null && nombreComun.trim() !== "";
  });

  if (!vwDataFiltrados || vwDataFiltrados.length === 0) {
    return [];
  }

  // Obtener información taxonómica
  const taxonIds = [...new Set(vwDataFiltrados.map((t: VwNombresComunes) => t.id_taxon))];
  const taxonInfoMap = await getTaxonInfo(supabaseClient, taxonIds);

  // Combinar datos
  const taxonesValidos: (VwNombresComunes & TaxonInfo)[] = vwDataFiltrados
    .map((t: VwNombresComunes) => {
      const taxonInfo = taxonInfoMap.get(t.id_taxon);

      if (!taxonInfo) {
        return null;
      }

      return {
        ...t,
        ...taxonInfo,
      };
    })
    .filter((t): t is VwNombresComunes & TaxonInfo => t !== null);

  const generosMap = new Map<
    string,
    {
      nombre_comun: string | null;
      familia: string;
      orden: string;
      genero: string;
      nombresCompartidos: Map<string, TaxonNombre[]>;
    }
  >();

  // Agrupar por género y recopilar todos los nombres
  taxonesValidos.forEach((taxon) => {
    const generoKey = `${taxon.orden}-${taxon.familia}-${taxon.genero}`;

    if (!generosMap.has(generoKey)) {
      generosMap.set(generoKey, {
        nombre_comun: null,
        familia: taxon.familia,
        orden: taxon.orden,
        genero: taxon.genero,
        nombresCompartidos: new Map(),
      });
    }

    const generoData = generosMap.get(generoKey)!;

    // Obtener el nombre común según el idioma especificado
    const nombreComun = obtenerNombreComunPorIdioma(taxon, idiomaId);

    if (nombreComun) {
      const nombreKey = nombreComun.toLowerCase().trim();

      if (!generoData.nombresCompartidos.has(nombreKey)) {
        generoData.nombresCompartidos.set(nombreKey, []);
      }

      generoData.nombresCompartidos.get(nombreKey)!.push({
        id_taxon: taxon.id_taxon,
        taxon: taxon.especie || "",
        nombre_comun: nombreComun,
        nombre_cientifico: taxon.nombre_cientifico || undefined,
        orden: taxon.orden,
        familia: taxon.familia,
        genero: taxon.genero,
      });
    }
  });

  // Filtrar solo los nombres que aparecen en múltiples especies
  const resultados: NombresCompartidosPorGenero[] = [];

  generosMap.forEach((generoData) => {
    const nombresCompartidos: NombreCompartido[] = [];

    generoData.nombresCompartidos.forEach((especies) => {
      // Solo incluir si hay más de una especie con este nombre
      if (especies.length > 1) {
        nombresCompartidos.push({
          nombre: especies[0].nombre_comun!,
          especies: especies,
          genero: generoData.genero,
          familia: generoData.familia,
          orden: generoData.orden,
        });
      }
    });

    if (nombresCompartidos.length > 0) {
      const sortedNombres = nombresCompartidos.toSorted((a, b) => a.nombre.localeCompare(b.nombre));

      resultados.push({
        genero: generoData.genero,
        nombre_comun_genero: generoData.nombre_comun,
        familia: generoData.familia,
        orden: generoData.orden,
        nombres: sortedNombres,
      });
    }
  });

  return resultados.sort((a, b) => {
    if (a.orden !== b.orden) {
      return a.orden.localeCompare(b.orden);
    }
    if (a.familia !== b.familia) {
      return a.familia.localeCompare(b.familia);
    }

    return a.genero.localeCompare(b.genero);
  });
}
