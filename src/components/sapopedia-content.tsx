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
    <div className="flex gap-6">
      {/* Panel de filtros - lado izquierdo */}
      <div className="w-80 flex-shrink-0">
        <FiltersPanel
          catalogs={filterCatalogs}
          especies={especies}
          onFiltersChange={handleFiltersChange}
        />
      </div>

      {/* Contenido principal */}
      <div className="min-w-0 flex-1">
        <Tabs className="w-full" onValueChange={handleTabChange} value={selectedTab}>
          <TabsList className="mb-6 inline-flex h-12 w-auto gap-1 rounded-lg bg-gray-100 p-1">
            <TabsTrigger
              className="rounded-md px-6 py-2 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-md"
              value="accordion"
            >
              Vista Jerárquica
            </TabsTrigger>
            <TabsTrigger
              className="rounded-md px-6 py-2 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-md"
              value="tree"
            >
              Árbol Filogenético
            </TabsTrigger>
          </TabsList>

          <TabsContent value="accordion">
            {/* Contador de resultados */}
            {filters && (
              <p className="text-muted-foreground mb-4 text-sm">
                Mostrando {especiesFiltradas.length} de {especies.length} especies
              </p>
            )}
            {/* Vista de accordion */}
            <SpeciesAccordion orders={ordenesOrganizados} />
          </TabsContent>

          <TabsContent className="mt-0" value="tree">
            {/* Vista de árbol filogenético */}
            <PhylogeneticTreeReal orders={ordenesOrganizados} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
