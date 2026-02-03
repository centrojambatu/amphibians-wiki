"use client";

import {useState, useEffect} from "react";

import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import SpeciesAccordion from "@/components/SpeciesAccordion";
import PhylogeneticTreeReal from "@/components/PhylogeneticTreeReal";
import FiltersPanel, {FiltersState} from "@/components/FiltersPanel";
import {SpeciesListItem} from "@/app/sapopedia/get-all-especies";
import {FilterCatalogs} from "@/app/sapopedia/get-filter-catalogs";
import {filterEspecies} from "@/lib/filter-especies";
import {organizeTaxonomyData} from "@/lib/organize-taxonomy";
import {SpeciesData} from "@/types/taxonomy";

interface SapopediaContentProps {
  readonly especies: SpeciesListItem[];
  readonly filterCatalogs: FilterCatalogs;
}

const TAB_STORAGE_KEY = "sapopedia-selected-tab";

function filterBySearchQuery(list: SpeciesListItem[], query: string): SpeciesListItem[] {
  const q = query.trim();
  if (!q) return list;
  const normalized = q
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return list.filter((e) => {
    const cient = (e.nombre_cientifico ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const comun = (e.nombre_comun ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return cient.includes(normalized) || comun.includes(normalized);
  });
}

export function SapopediaContent({especies, filterCatalogs}: SapopediaContentProps) {
  const [filters, setFilters] = useState<FiltersState | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  const especiesFiltradas = filterEspecies(especies, filters);
  const especiesPorBusqueda = filterBySearchQuery(especiesFiltradas, searchQuery);

  // Convertir datos para el accordion
  const especiesParaAccordion: SpeciesData[] = especiesPorBusqueda.map((e) => ({
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
          onSearchQueryChange={setSearchQuery}
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
            {(filters || searchQuery) && (
              <p className="text-muted-foreground mb-3 text-xs sm:mb-4 sm:text-sm">
                Mostrando {especiesPorBusqueda.length} de {especies.length} especies
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
