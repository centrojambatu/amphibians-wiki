"use client";

import {useState} from "react";
import {SlidersHorizontal, X} from "lucide-react";

import {SpeciesListItem} from "@/app/sapopedia/get-all-especies";
import {CatalogOption, FilterCatalogs} from "@/app/sapopedia/get-filter-catalogs";
import {filterEspecies} from "@/lib/filter-especies";
import {Button} from "@/components/ui/button";
import FiltersPanel, {DEFAULT_FILTERS_STATE, FiltersState} from "./FiltersPanel";
import RedListAccordion from "./RedListAccordion";
import RedListChartSelector from "./RedListChartSelector";
import RedListSummaryCards from "./RedListSummaryCards";

interface RedListContentProps {
  readonly especies: SpeciesListItem[];
  readonly categorias: CatalogOption[];
  /** Catálogos para el panel de filtros; si se pasa, se muestran filtros (sin precipitación ni temperatura) */
  readonly filterCatalogs?: FilterCatalogs;
}

export default function RedListContent({
  especies,
  categorias,
  filterCatalogs,
}: RedListContentProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [filters, setFilters] = useState<FiltersState>(DEFAULT_FILTERS_STATE);
  const [speciesSearchQuery, setSpeciesSearchQuery] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const especiesFiltradas = filterEspecies(especies, filters);

  // Badge del botón móvil: conteo de filtros activos
  const activeFilterCount =
    [
      filters.provincia,
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

  const handleCategoryClick = (categoria: string) => {
    setActiveCategory(categoria);
    setTimeout(() => setActiveCategory(null), 500);
  };

  const handleFiltersChange = (newFilters: FiltersState) => {
    setFilters(newFilters);
  };

  const content = (
    <>
      {/* Fila superior: Lista Roja externa + especies amenazadas + no amenazadas (fuera del card unificado) */}
      <RedListSummaryCards
        especies={especiesFiltradas}
        section="top"
        onCategoryClick={handleCategoryClick}
      />

      {/* Card unificado: las 7 categorías de Lista Roja + histograma de barras */}
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-3 sm:mt-8 sm:p-6">
        <RedListSummaryCards
          especies={especiesFiltradas}
          section="categories"
          onCategoryClick={handleCategoryClick}
        />
        <div className="mt-6 sm:mt-8">
          <RedListChartSelector
            categorias={categorias}
            especies={especiesFiltradas}
            onCategoryClick={handleCategoryClick}
          />
        </div>
      </div>
      <div className="mt-8 mb-8">
        {/* Botón de filtros móvil — encima del acordeón */}
        {filterCatalogs && (
          <div className="mb-4 lg:hidden">
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
        )}
        <RedListAccordion
          categorias={categorias}
          especies={especiesFiltradas}
          activeCategory={activeCategory}
          speciesSearchQuery={speciesSearchQuery}
          onSpeciesSearchChange={setSpeciesSearchQuery}
          filters={filterCatalogs ? filters : undefined}
          onFiltersChange={filterCatalogs ? handleFiltersChange : undefined}
          filterCatalogs={filterCatalogs}
          especiesFull={filterCatalogs ? especies : undefined}
        />
      </div>
    </>
  );

  if (filterCatalogs) {
    return (
      <div className="min-w-0 flex-1">
        {/* Panel de filtros móvil (bottom sheet) */}
        {showMobileFilters && (
          <div
            aria-label="Panel de filtros"
            aria-modal="true"
            className="fixed inset-0 z-50 lg:hidden"
            role="dialog"
          >
            <button
              aria-label="Cerrar filtros"
              className="absolute inset-0 w-full cursor-default"
              style={{backgroundColor: "rgba(0,0,0,0.45)"}}
              type="button"
              onClick={() => setShowMobileFilters(false)}
            />
            <div
              className="absolute right-0 bottom-0 left-0 flex flex-col rounded-t-2xl bg-white shadow-2xl"
              style={{maxHeight: "90vh"}}
            >
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
              <div className="min-h-0 flex-1 overflow-hidden">
                <FiltersPanel
                  embedded
                  catalogs={filterCatalogs}
                  especies={especies}
                  excludeFilters={["pluviocidad", "temperatura", "listaRoja"]}
                  filters={filters}
                  searchQuery={speciesSearchQuery}
                  onFiltersChange={setFilters}
                  onSearchQueryChange={setSpeciesSearchQuery}
                />
              </div>
            </div>
          </div>
        )}

        {content}
      </div>
    );
  }

  return content;
}
