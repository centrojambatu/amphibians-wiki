"use client";

import {useState} from "react";

import {SpeciesListItem} from "@/app/sapopedia/get-all-especies";
import {CatalogOption} from "@/app/sapopedia/get-filter-catalogs";

import RedListSummaryCards from "./RedListSummaryCards";
import RedListChartSelector from "./RedListChartSelector";
import RedListAccordion from "./RedListAccordion";

interface RedListContentProps {
  readonly especies: SpeciesListItem[];
  readonly categorias: CatalogOption[];
}

export default function RedListContent({especies, categorias}: RedListContentProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleCategoryClick = (categoria: string) => {
    // Cambiar la categoría activa (esto disparará el efecto en RedListAccordion)
    setActiveCategory(categoria);
    // Reset después de un tiempo para permitir clicks repetidos en la misma categoría
    setTimeout(() => setActiveCategory(null), 500);
  };

  return (
    <>
      {/* Cards de resumen */}
      <RedListSummaryCards especies={especies} onCategoryClick={handleCategoryClick} />

      {/* Selector de gráficos */}
      <RedListChartSelector categorias={categorias} especies={especies} />

      {/* Acordeón de categorías */}
      <div className="mt-8 mb-8">
        <RedListAccordion
          categorias={categorias}
          especies={especies}
          activeCategory={activeCategory}
        />
      </div>
    </>
  );
}
