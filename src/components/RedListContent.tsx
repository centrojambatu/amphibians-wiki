"use client";

import {useState} from "react";

import {SpeciesListItem} from "@/app/sapopedia/get-all-especies";
import {CatalogOption, FilterCatalogs} from "@/app/sapopedia/get-filter-catalogs";
import {filterEspecies} from "@/lib/filter-especies";
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

  const especiesFiltradas = filterEspecies(especies, filters);

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
        {content}
      </div>
    );
  }

  return content;
}
