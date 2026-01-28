"use client";

import {useState, useEffect} from "react";

import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import SpeciesAccordion from "@/components/SpeciesAccordion";
import PhylogeneticTreeReal from "@/components/PhylogeneticTreeReal";
import FiltersPanel, {FiltersState} from "@/components/FiltersPanel";
import {SpeciesListItem} from "@/app/sapopedia/get-all-especies";
import {FilterCatalogs} from "@/app/sapopedia/get-filter-catalogs";
import {organizeTaxonomyData} from "@/lib/organize-taxonomy";
import {SpeciesData} from "@/types/taxonomy";

interface SapopediaContentProps {
  readonly especies: SpeciesListItem[];
  readonly filterCatalogs: FilterCatalogs;
}

const TAB_STORAGE_KEY = "sapopedia-selected-tab";

export function SapopediaContent({especies, filterCatalogs}: SapopediaContentProps) {
  const [filters, setFilters] = useState<FiltersState | null>(null);

  // Cargar pestaña seleccionada desde localStorage
  const [selectedTab, setSelectedTab] = useState<string>(() => {
    if (typeof globalThis.window === "undefined") return "accordion";

    try {
      const saved = globalThis.window.localStorage.getItem(TAB_STORAGE_KEY);

      if (saved && (saved === "accordion" || saved === "tree")) {
        return saved;
      }
    } catch {
      // Ignorar errores
    }

    return "accordion";
  });

  // Guardar pestaña cuando cambie
  const handleTabChange = (value: string) => {
    setSelectedTab(value);

    try {
      globalThis.window.localStorage.setItem(TAB_STORAGE_KEY, value);
    } catch {
      // Ignorar errores de localStorage
    }
  };

  // Función para filtrar especies basado en los filtros seleccionados
  const filterEspecies = (especiesList: SpeciesListItem[]): SpeciesListItem[] => {
    if (!filters) return especiesList;

    return especiesList.filter((especie) => {
      // Filtro por Lista Roja
      if (filters.listaRoja.length > 0) {
        if (!especie.lista_roja_iucn || !filters.listaRoja.includes(especie.lista_roja_iucn)) {
          return false;
        }
      }

      // Filtro por endemismo
      // Si hay filtros seleccionados, la especie debe coincidir con al menos uno
      if (filters.endemismo.length > 0) {
        const isEndemic = especie.endemica === true;
        const matchesEndemicFilter =
          (filters.endemismo.includes("endemic") && isEndemic) ||
          (filters.endemismo.includes("non-endemic") && !isEndemic);

        if (!matchesEndemicFilter) return false;
      }

      // Filtro por rango altitudinal
      // Solo aplicar si el rango no es el valor por defecto (0-4800)
      const isDefaultRange =
        filters.rangoAltitudinal.min === 0 && filters.rangoAltitudinal.max === 4800;

      if (!isDefaultRange) {
        const speciesMinAlt = especie.rango_altitudinal_min || 0;
        const speciesMaxAlt = especie.rango_altitudinal_max || 0;
        const filterMin = filters.rangoAltitudinal.min;
        const filterMax = filters.rangoAltitudinal.max;

        // Verificar si hay solapamiento entre el rango de la especie y el rango del filtro
        const hasOverlap = speciesMinAlt <= filterMax && speciesMaxAlt >= filterMin;

        if (!hasOverlap) return false;
      }

      // Filtro por provincias
      if (filters.provincia.length > 0) {
        const hasMatch = filters.provincia.some((p) => especie.catalogos.provincias.includes(p));

        if (!hasMatch) return false;
      }

      // Filtro por regiones biogeográficas
      if (filters.regionesBiogeograficas.length > 0) {
        const hasMatch = filters.regionesBiogeograficas.some((r) =>
          especie.catalogos.regiones_biogeograficas.includes(r),
        );

        if (!hasMatch) return false;
      }

      // Filtro por ecosistemas
      if (filters.ecosistemas.length > 0) {
        const hasMatch = filters.ecosistemas.some((e) => especie.catalogos.ecosistemas.includes(e));

        if (!hasMatch) return false;
      }

      // Filtro por reservas de la biosfera
      if (filters.reservasBiosfera.length > 0) {
        const hasMatch = filters.reservasBiosfera.some((r) =>
          especie.catalogos.reservas_biosfera.includes(r),
        );

        if (!hasMatch) return false;
      }

      // Filtro por bosques protegidos
      if (filters.bosquesProtegidos.length > 0) {
        const hasMatch = filters.bosquesProtegidos.some((b) =>
          especie.catalogos.bosques_protegidos.includes(b),
        );

        if (!hasMatch) return false;
      }

      // Filtro por áreas protegidas del estado
      if (filters.areasProtegidasEstado.length > 0) {
        const hasMatch = filters.areasProtegidasEstado.some((a) =>
          especie.catalogos.areas_protegidas_estado.includes(a),
        );

        if (!hasMatch) return false;
      }

      // Filtro por áreas protegidas privadas
      if (filters.areasProtegidasPrivadas.length > 0) {
        const hasMatch = filters.areasProtegidasPrivadas.some((a) =>
          especie.catalogos.areas_protegidas_privadas.includes(a),
        );

        if (!hasMatch) return false;
      }

      // Filtro por distribución (oriental/occidental)
      if (filters.distribucion.length > 0) {
        const matchesDistribucion = filters.distribucion.some((d) => {
          if (d === "occidental") {
            return especie.has_distribucion_occidental;
          }
          if (d === "oriental") {
            return especie.has_distribucion_oriental;
          }

          return false;
        });

        if (!matchesDistribucion) return false;
      }

      return true;
    });
  };

  const especiesFiltradas = filterEspecies(especies);

  // Convertir datos para el accordion
  const especiesParaAccordion: SpeciesData[] = especiesFiltradas.map((e) => ({
    ...e,
    lista_roja_iucn: e.lista_roja_iucn || null,
    has_distribucion_occidental: e.has_distribucion_occidental || false,
    has_distribucion_oriental: e.has_distribucion_oriental || false,
  }));

  const ordenesOrganizados = organizeTaxonomyData(especiesParaAccordion);

  const handleFiltersChange = (newFilters: FiltersState) => {
    setFilters(newFilters);
  };

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
      {/* Panel de filtros - lado izquierdo */}
      <div className="order-2 w-full flex-shrink-0 lg:order-1 lg:w-80">
        <FiltersPanel
          catalogs={filterCatalogs}
          especies={especies}
          onFiltersChange={handleFiltersChange}
        />
      </div>

      {/* Contenido principal */}
      <div className="order-1 min-w-0 flex-1 lg:order-2">
        <Tabs className="w-full" value={selectedTab} onValueChange={handleTabChange}>
          {/* <TabsList className="mb-4 inline-flex h-10 w-full gap-1 rounded-lg bg-gray-100 p-1 sm:mb-6 sm:h-12 sm:w-auto">
            <TabsTrigger
              className="flex-1 rounded-md px-3 py-2 text-xs font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-md sm:flex-initial sm:px-6 sm:text-sm"
              value="accordion"
            >
              Vista Jerárquica
            </TabsTrigger>
            <TabsTrigger
              className="flex-1 rounded-md px-3 py-2 text-xs font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-md sm:flex-initial sm:px-6 sm:text-sm"
              value="tree"
            >
              Árbol Filogenético
            </TabsTrigger>
          </TabsList> */}

          <TabsContent className="mt-4 sm:mt-0" value="accordion">
            {/* Contador de resultados */}
            {filters && (
              <p className="text-muted-foreground mb-3 text-xs sm:mb-4 sm:text-sm">
                Mostrando {especiesFiltradas.length} de {especies.length} especies
              </p>
            )}
            {/* Vista de accordion */}
            <SpeciesAccordion orders={ordenesOrganizados} />
          </TabsContent>

          <TabsContent className="mt-4 sm:mt-0" value="tree">
            {/* Vista de árbol filogenético */}
            <PhylogeneticTreeReal orders={ordenesOrganizados} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
