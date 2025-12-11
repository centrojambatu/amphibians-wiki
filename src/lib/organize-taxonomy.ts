import {
  SpeciesData,
  GenusGroup,
  FamilyGroup,
  OrderGroup,
} from "@/types/taxonomy";

/**
 * Organiza un array plano de especies en una estructura jerárquica
 * Orden > Familia > Género > Especie
 */
export function organizeTaxonomyData(especies: SpeciesData[]): OrderGroup[] {
  // Agrupar por orden
  const ordenesMap = new Map<string, SpeciesData[]>();

  especies.forEach((especie) => {
    const orden = especie.orden || "Sin clasificar";

    if (!ordenesMap.has(orden)) {
      ordenesMap.set(orden, []);
    }
    ordenesMap.get(orden)!.push(especie);
  });

  // Construir la estructura jerárquica
  const ordenes: OrderGroup[] = [];

  ordenesMap.forEach((especiesDelOrden, ordenNombre) => {
    // Agrupar por familia dentro del orden
    const familiasMap = new Map<string, SpeciesData[]>();

    especiesDelOrden.forEach((especie) => {
      const familia = especie.familia || "Sin clasificar";

      if (!familiasMap.has(familia)) {
        familiasMap.set(familia, []);
      }
      familiasMap.get(familia)!.push(especie);
    });

    // Construir familias
    const familias: FamilyGroup[] = [];

    familiasMap.forEach((especiesDeLaFamilia, familiaNombre) => {
      // Agrupar por género dentro de la familia
      const generosMap = new Map<string, SpeciesData[]>();

      especiesDeLaFamilia.forEach((especie) => {
        const genero = especie.genero || "Sin clasificar";

        if (!generosMap.has(genero)) {
          generosMap.set(genero, []);
        }
        generosMap.get(genero)!.push(especie);
      });

      // Construir géneros
      const generos: GenusGroup[] = [];

      generosMap.forEach((especiesDelGenero, generoNombre) => {
        const endemicSpecies = especiesDelGenero.filter(
          (e) => e.endemica,
        ).length;
        const redListSpecies = especiesDelGenero.filter(
          (e) => e.lista_roja_iucn && e.lista_roja_iucn !== "LC",
        ).length;

        generos.push({
          id: generoNombre.toLowerCase().replace(/\s+/g, "-"),
          name: generoNombre,
          nombre_comun: especiesDelGenero[0]?.nombre_comun || null,
          species: especiesDelGenero,
          summary: {
            totalSpecies: especiesDelGenero.length,
            endemicSpecies,
            redListSpecies,
          },
        });
      });

      // Ordenar géneros alfabéticamente
      generos.sort((a, b) => a.name.localeCompare(b.name));

      // Calcular resumen de la familia
      const totalSpecies = especiesDeLaFamilia.length;
      const endemicSpecies = especiesDeLaFamilia.filter(
        (e) => e.endemica,
      ).length;
      const redListSpecies = especiesDeLaFamilia.filter(
        (e) => e.lista_roja_iucn && e.lista_roja_iucn !== "LC",
      ).length;

      familias.push({
        id: familiaNombre.toLowerCase().replace(/\s+/g, "-"),
        name: familiaNombre,
        genera: generos,
        summary: {
          totalSpecies,
          totalGenera: generos.length,
          endemicSpecies,
          redListSpecies,
        },
      });
    });

    // Ordenar familias alfabéticamente
    familias.sort((a, b) => a.name.localeCompare(b.name));

    // Calcular resumen del orden
    const totalSpecies = especiesDelOrden.length;
    const endemicSpecies = especiesDelOrden.filter((e) => e.endemica).length;
    const redListSpecies = especiesDelOrden.filter(
      (e) => e.lista_roja_iucn && e.lista_roja_iucn !== "LC",
    ).length;

    ordenes.push({
      id: ordenNombre.toLowerCase().replace(/\s+/g, "-"),
      name: ordenNombre,
      families: familias,
      summary: {
        totalSpecies,
        totalFamilies: familias.length,
        endemicSpecies,
        redListSpecies,
      },
    });
  });

  // Ordenar órdenes alfabéticamente
  ordenes.sort((a, b) => a.name.localeCompare(b.name));

  return ordenes;
}
