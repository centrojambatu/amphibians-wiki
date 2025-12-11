import { createServiceClient } from "@/utils/supabase/server";
import { TaxonNombre } from "./get-taxon-nombres";

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

    const { data: taxones, error } = await supabaseClient
      .from("taxon")
      .select("id_taxon, taxon_id, genero:taxon_id(taxon, taxon_id, familia:taxon_id(taxon, taxon_id, orden:taxon_id(taxon)))")
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

/**
 * Encuentra nombres comunes compartidos por múltiples especies dentro de la misma familia
 * Lee directamente de la vista vw_nombres_comunes
 */
export async function getNombresCompartidosPorFamilia(): Promise<
  NombresCompartidosPorFamilia[]
> {
  const supabaseClient = createServiceClient();

  // Obtener todos los taxones con nombres comunes desde la vista
  const { data: vwData, error: errorVw } = await supabaseClient
    .from("vw_nombres_comunes")
    .select("id_taxon, id_ficha_especie, especie, nombre_cientifico, nombre_comun_espanol, nombre_comun_ingles")
    .not("nombre_comun_espanol", "is", null);

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

  // Combinar datos
  const taxonesValidos: (VwNombresComunes & TaxonInfo)[] = vwData
    .map((t: any) => {
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
        nombre_comun: null, // No hay nombre común de familia en la nueva estructura
        orden: taxon.orden,
        familia: taxon.familia,
        nombresCompartidos: new Map(),
      });
    }

    const familiaData = familiasMap.get(familiaKey)!;

    // Agregar el nombre común de la especie (usar español como principal)
    if (taxon.nombre_comun_espanol) {
      const nombreKey = taxon.nombre_comun_espanol.toLowerCase().trim();

      if (!familiaData.nombresCompartidos.has(nombreKey)) {
        familiaData.nombresCompartidos.set(nombreKey, []);
      }

      familiaData.nombresCompartidos.get(nombreKey)!.push({
        id_taxon: taxon.id_taxon,
        taxon: taxon.especie || "",
        nombre_comun: taxon.nombre_comun_espanol,
        nombre_cientifico: taxon.nombre_cientifico || null,
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
      const sortedNombres = nombresCompartidos.toSorted((a, b) =>
        a.nombre.localeCompare(b.nombre),
      );
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
 */
export async function getNombresCompartidosPorGenero(): Promise<
  NombresCompartidosPorGenero[]
> {
  const supabaseClient = createServiceClient();

  // Obtener todos los taxones con nombres comunes desde la vista
  const { data: vwData, error: errorVw } = await supabaseClient
    .from("vw_nombres_comunes")
    .select("id_taxon, id_ficha_especie, especie, nombre_cientifico, nombre_comun_espanol, nombre_comun_ingles")
    .not("nombre_comun_espanol", "is", null);

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

  // Combinar datos
  const taxonesValidos: (VwNombresComunes & TaxonInfo)[] = vwData
    .map((t: any) => {
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
        nombre_comun: null, // No hay nombre común de género en la nueva estructura
        familia: taxon.familia,
        orden: taxon.orden,
        genero: taxon.genero,
        nombresCompartidos: new Map(),
      });
    }

    const generoData = generosMap.get(generoKey)!;

    // Agregar el nombre común de la especie (usar español como principal)
    if (taxon.nombre_comun_espanol) {
      const nombreKey = taxon.nombre_comun_espanol.toLowerCase().trim();

      if (!generoData.nombresCompartidos.has(nombreKey)) {
        generoData.nombresCompartidos.set(nombreKey, []);
      }

      generoData.nombresCompartidos.get(nombreKey)!.push({
        id_taxon: taxon.id_taxon,
        taxon: taxon.especie || "",
        nombre_comun: taxon.nombre_comun_espanol,
        nombre_cientifico: taxon.nombre_cientifico || null,
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
      const sortedNombres = nombresCompartidos.toSorted((a, b) =>
        a.nombre.localeCompare(b.nombre),
      );
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
