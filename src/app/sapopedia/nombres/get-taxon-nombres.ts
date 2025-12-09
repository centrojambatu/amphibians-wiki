import { createServiceClient } from "@/utils/supabase/server";

export interface TaxonNombre {
  id_taxon: number;
  taxon: string;
  nombre_comun: string | null;
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

// Función para obtener todos los taxones con nombres comunes, organizados jerárquicamente
export default async function getTaxonNombres(): Promise<NombreGroup[]> {
  const supabaseClient = createServiceClient();

  // Obtener todos los taxones con nombres comunes desde la vista
  const { data: taxones, error } = await supabaseClient
    .from("vw_nombres_comunes")
    .select(
      "id_taxon, orden, familia, genero, especie, nombre_comun_especie, nombre_comun_familia, nombre_comun_genero, nombre_cientifico",
    )
    .not("nombre_comun_especie", "is", null)
    .order("orden", { ascending: true })
    .order("familia", { ascending: true })
    .order("genero", { ascending: true })
    .order("especie", { ascending: true });

  if (error) {
    console.error("Error al obtener nombres comunes:", error);

    return [];
  }

  if (!taxones || taxones.length === 0) {
    return [];
  }

  // Convertir los datos de la vista a la estructura TaxonNombre
  const taxonesValidos: TaxonNombre[] = taxones
    .filter(
      (t: any) => t.orden && t.familia && t.genero && t.nombre_comun_especie,
    )
    .map((t: any) => ({
      id_taxon: t.id_taxon,
      taxon: t.especie || "",
      nombre_comun: t.nombre_comun_especie,
      nombre_cientifico: t.nombre_cientifico || null,
      orden: t.orden,
      familia: t.familia,
      genero: t.genero,
    }));

  // Agrupar por orden > familia > género
  // Usar Maps para almacenar también los nombres comunes de familia y género
  const ordenesMap = new Map<
    string,
    Map<
      string,
      {
        nombre_comun: string | null;
        generos: Map<
          string,
          { nombre_comun: string | null; nombres: TaxonNombre[] }
        >;
      }
    >
  >();

  taxonesValidos.forEach((taxon) => {
    if (!taxon.orden || !taxon.familia || !taxon.genero) return;

    // Obtener el nombre común de familia y género del taxón original
    const taxonOriginal = taxones.find(
      (t: any) => t.id_taxon === taxon.id_taxon,
    ) as any;
    const nombreComunFamilia = taxonOriginal?.nombre_comun_familia || null;
    const nombreComunGenero = taxonOriginal?.nombre_comun_genero || null;

    if (!ordenesMap.has(taxon.orden)) {
      ordenesMap.set(taxon.orden, new Map());
    }

    const familiasMap = ordenesMap.get(taxon.orden)!;

    if (!familiasMap.has(taxon.familia)) {
      familiasMap.set(taxon.familia, {
        nombre_comun: nombreComunFamilia,
        generos: new Map(),
      });
    }

    const familiaData = familiasMap.get(taxon.familia)!;

    if (!familiaData.generos.has(taxon.genero)) {
      familiaData.generos.set(taxon.genero, {
        nombre_comun: nombreComunGenero,
        nombres: [],
      });
    }

    familiaData.generos.get(taxon.genero)!.nombres.push(taxon);
  });

  // Convertir a la estructura de grupos
  const ordenes: NombreGroup[] = [];

  ordenesMap.forEach((familiasMap, ordenName) => {
    const familias: NombreGroup[] = [];

    familiasMap.forEach((familiaData, familiaName) => {
      const generos: NombreGroup[] = [];

      familiaData.generos.forEach((generoData, generoName) => {
        generos.push({
          id: `genero-${generoName}`,
          name: generoName,
          nombre_comun: generoData.nombre_comun,
          nombres: generoData.nombres.sort((a, b) =>
            (a.nombre_comun || "").localeCompare(b.nombre_comun || ""),
          ),
        });
      });

      familias.push({
        id: `familia-${familiaName}`,
        name: familiaName,
        nombre_comun: familiaData.nombre_comun,
        nombres: [],
        children: generos.sort((a, b) => a.name.localeCompare(b.name)),
      });
    });

    ordenes.push({
      id: `orden-${ordenName}`,
      name: ordenName,
      nombres: [],
      children: familias.sort((a, b) => a.name.localeCompare(b.name)),
    });
  });

  return ordenes.sort((a, b) => a.name.localeCompare(b.name));
}
