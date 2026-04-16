"use client";

import {useState} from "react";
import {SlidersHorizontal, X} from "lucide-react";

import {Tabs, TabsContent} from "@/components/ui/tabs";
import SpeciesAccordion from "@/components/SpeciesAccordion";
import PhylogeneticTreeReal from "@/components/PhylogeneticTreeReal";
import FiltersPanel, {DEFAULT_FILTERS_STATE, FiltersState} from "@/components/FiltersPanel";
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {SpeciesListItem} from "@/app/sapopedia/get-all-especies";
import {FilterCatalogs} from "@/app/sapopedia/get-filter-catalogs";
import {filterEspecies} from "@/lib/filter-especies";
import {organizeTaxonomyData, type OrdenesNombresLookup} from "@/lib/organize-taxonomy";
import {SpeciesData} from "@/types/taxonomy";

interface SapopediaContentProps {
  readonly especies: SpeciesListItem[];
  readonly filterCatalogs: FilterCatalogs;
  /** Misma fuente que el acordeón de nombres comunes; se usan estos nombre_comun para familia y género */
  readonly ordenesNombres?: OrdenesNombresLookup[] | null;
}

const TAB_STORAGE_KEY = "sapopedia-selected-tab";

function isPosiblementeExtinta(sigla: string | null): boolean {
  if (!sigla) return false;

  return sigla === "PE" || sigla.includes("PE") || sigla.includes("Posiblemente extinta");
}

function filterBySearchQuery(list: SpeciesListItem[], query: string): SpeciesListItem[] {
  const q = query.trim();

  if (!q) return list;
  const normalized = q
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return list.filter((e) => {
    const cient = (e.nombre_cientifico ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    const comun = (e.nombre_comun ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    return cient.includes(normalized) || comun.includes(normalized);
  });
}

export function SapopediaContent({
  especies,
  filterCatalogs,
  ordenesNombres = null,
}: SapopediaContentProps) {
  const [filters, setFilters] = useState<FiltersState>(DEFAULT_FILTERS_STATE);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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

  const ordenesOrganizados = organizeTaxonomyData(especiesParaAccordion, ordenesNombres);

  const handleFiltersChange = (newFilters: FiltersState) => {
    setFilters(newFilters);
  };

  type QuickFilter = "endemicas" | "amenazadas" | "posiblemente-extintas";
  const applyQuickFilter = (type: QuickFilter) => {
    switch (type) {
      case "endemicas":
        setFilters({...DEFAULT_FILTERS_STATE, endemismo: ["endemic"]});
        break;
      case "amenazadas":
        setFilters({...DEFAULT_FILTERS_STATE, listaRoja: ["CR"]});
        break;
      case "posiblemente-extintas": {
        const peOption = filterCatalogs.listaRoja.find(
          (o) =>
            o.sigla === "PE" ||
            o.sigla?.includes("PE") ||
            o.nombre?.toLowerCase().includes("posiblemente"),
        );

        setFilters({
          ...DEFAULT_FILTERS_STATE,
          listaRoja: peOption ? [peOption.value] : ["PE"],
        });
        break;
      }
    }
  };

  const totalEspecies = especies.length;
  const endemicasCount = especies.filter((e) => e.endemica).length;
  const posiblementeExtintaCount = especies.filter((e) =>
    isPosiblementeExtinta(e.lista_roja_iucn),
  ).length;

  const anuraCount = especies.filter((e) => e.orden?.toLowerCase() === "anura").length;
  const caudataCount = especies.filter((e) => e.orden?.toLowerCase() === "caudata").length;
  const gymnophionaCount = especies.filter((e) => e.orden?.toLowerCase() === "gymnophiona").length;

  // Conteo de filtros activos para el badge del botón móvil
  const activeFilterCount =
    [
      filters.provincia,
      filters.listaRoja,
      filters.endemismo,
      filters.ecosistemas,
      filters.regionesBiogeograficas,
      filters.reservasBiosfera,
      filters.bosquesProtegidos,
      filters.areasProtegidasEstado,
      filters.areasProtegidasPrivadas,
      filters.distribucion,
    ].flat().length +
    (filters.rangoAltitudinal.min !== 0 ||
    filters.rangoAltitudinal.max !== 4800 ||
    filters.areaDistribucion.min !== 1 ||
    filters.areaDistribucion.max !== 100000
      ? 1
      : 0);

  return (
    <div className="flex flex-col gap-4">
      {/* ── BOTÓN DE FILTROS MÓVIL ──────────────────────────────────── */}
      <div className="lg:hidden">
        <Button
          className="w-full gap-2"
          variant="outline"
          onClick={() => setShowMobileFilters(true)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
          {activeFilterCount > 0 && (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#f07304] text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* ── PANEL DE FILTROS MÓVIL (bottom sheet) ──────────────────── */}
      {showMobileFilters && (
        <div
          aria-label="Panel de filtros"
          aria-modal="true"
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
        >
          {/* Backdrop */}
          <button
            aria-label="Cerrar filtros"
            className="absolute inset-0 w-full cursor-default"
            style={{backgroundColor: "rgba(0,0,0,0.45)"}}
            type="button"
            onClick={() => setShowMobileFilters(false)}
          />
          {/* Sheet content */}
          <div
            className="absolute right-0 bottom-0 left-0 flex flex-col rounded-t-2xl bg-white shadow-2xl"
            style={{maxHeight: "90vh"}}
          >
            {/* Header del sheet */}
            <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 className="text-base font-semibold text-gray-900">Filtros</h2>
              <button
                className="rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100"
                type="button"
                onClick={() => setShowMobileFilters(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* Panel de filtros embebido */}
            <div className="min-h-0 flex-1 overflow-hidden">
              <FiltersPanel
                embedded
                catalogs={filterCatalogs}
                especies={especies}
                filters={filters}
                searchQuery={searchQuery}
                onFiltersChange={handleFiltersChange}
                onSearchQueryChange={setSearchQuery}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── LAYOUT PRINCIPAL ────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
        {/* Panel de filtros — solo visible en desktop */}
        <div className="hidden w-80 flex-shrink-0 lg:block">
          <FiltersPanel
            catalogs={filterCatalogs}
            especies={especies}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onSearchQueryChange={setSearchQuery}
          />
        </div>

        {/* Contenido principal */}
        <div className="min-w-0 flex-1">
          <Tabs className="w-full" value={selectedTab} onValueChange={handleTabChange}>
            <TabsContent className="mt-4 sm:mt-0" value="accordion">
              {/* Contador de resultados */}
              {(especiesPorBusqueda.length < especies.length || searchQuery) && (
                <p className="text-muted-foreground mb-3 text-xs sm:mb-4 sm:text-sm">
                  Mostrando {especiesPorBusqueda.length} de {especies.length} especies
                </p>
              )}
              {/* Vista de accordion */}
              <SpeciesAccordion
                activeOrderId={activeOrderId}
                orders={ordenesOrganizados}
                onActiveOrderIdConsumed={() => setActiveOrderId(null)}
              />
            </TabsContent>

            <TabsContent className="mt-4 sm:mt-0" value="tree">
              {/* Vista de árbol filogenético */}
              <PhylogeneticTreeReal orders={ordenesOrganizados} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
