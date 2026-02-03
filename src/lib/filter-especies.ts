import type { SpeciesListItem } from "@/app/sapopedia/get-all-especies";
import type { FiltersState } from "@/components/FiltersPanel";

/**
 * Filtra especies según el estado de filtros.
 * No aplica filtros de pluviocidad ni temperatura (para uso en Lista Roja).
 */
export function filterEspecies(
  especiesList: SpeciesListItem[],
  filters: FiltersState | null,
): SpeciesListItem[] {
  if (!filters) return especiesList;

  const isPosiblementeExtinta = (sigla: string | null) =>
    !!sigla && (sigla === "PE" || sigla.includes("PE"));

  return especiesList.filter((especie) => {
    if (filters.listaRoja.length > 0) {
      const matchListaRoja = filters.listaRoja.some((val) => {
        if (val === "PE" || val === "CR (PE)") {
          return especie.lista_roja_iucn != null && isPosiblementeExtinta(especie.lista_roja_iucn);
        }
        return especie.lista_roja_iucn === val;
      });
      if (!matchListaRoja) return false;
    }

    if (filters.endemismo.length > 0) {
      const isEndemic = especie.endemica === true;
      const matchesEndemicFilter =
        (filters.endemismo.includes("endemic") && isEndemic) ||
        (filters.endemismo.includes("non-endemic") && !isEndemic);
      if (!matchesEndemicFilter) return false;
    }

    const isDefaultRange =
      filters.rangoAltitudinal.min === 0 && filters.rangoAltitudinal.max === 4800;
    if (!isDefaultRange) {
      const speciesMinAlt = especie.rango_altitudinal_min || 0;
      const speciesMaxAlt = especie.rango_altitudinal_max || 0;
      const filterMin = filters.rangoAltitudinal.min;
      const filterMax = filters.rangoAltitudinal.max;
      const hasOverlap = speciesMinAlt <= filterMax && speciesMaxAlt >= filterMin;
      if (!hasOverlap) return false;
    }

    if (filters.provincia.length > 0) {
      const hasMatch = filters.provincia.some((p) => especie.catalogos.provincias.includes(p));
      if (!hasMatch) return false;
    }

    if (filters.regionesBiogeograficas.length > 0) {
      const hasMatch = filters.regionesBiogeograficas.some((r) =>
        especie.catalogos.regiones_biogeograficas.includes(r),
      );
      if (!hasMatch) return false;
    }

    if (filters.ecosistemas.length > 0) {
      const hasMatch = filters.ecosistemas.some((e) =>
        especie.catalogos.ecosistemas.includes(e),
      );
      if (!hasMatch) return false;
    }

    if (filters.reservasBiosfera.length > 0) {
      const hasMatch = filters.reservasBiosfera.some((r) =>
        especie.catalogos.reservas_biosfera.includes(r),
      );
      if (!hasMatch) return false;
    }

    if (filters.bosquesProtegidos.length > 0) {
      const hasMatch = filters.bosquesProtegidos.some((b) =>
        especie.catalogos.bosques_protegidos.includes(b),
      );
      if (!hasMatch) return false;
    }

    if (filters.areasProtegidasEstado.length > 0) {
      const hasMatch = filters.areasProtegidasEstado.some((a) =>
        especie.catalogos.areas_protegidas_estado.includes(a),
      );
      if (!hasMatch) return false;
    }

    if (filters.areasProtegidasPrivadas.length > 0) {
      const hasMatch = filters.areasProtegidasPrivadas.some((a) =>
        especie.catalogos.areas_protegidas_privadas.includes(a),
      );
      if (!hasMatch) return false;
    }

    if (filters.distribucion.length > 0) {
      const matchesDistribucion = filters.distribucion.some((d) => {
        if (d === "occidental") return especie.has_distribucion_occidental;
        if (d === "oriental") return especie.has_distribucion_oriental;
        return false;
      });
      if (!matchesDistribucion) return false;
    }

    return true;
  });
}
