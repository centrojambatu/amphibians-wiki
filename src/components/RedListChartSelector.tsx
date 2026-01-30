"use client";

import {CatalogOption} from "@/app/sapopedia/get-filter-catalogs";
import {SpeciesListItem} from "@/app/sapopedia/get-all-especies";
import RedListBarChart from "./RedListBarChart";

interface RedListChartSelectorProps {
  readonly especies: SpeciesListItem[];
  readonly categorias: CatalogOption[];
  readonly onCategoryClick?: (categoria: string) => void;
}

export default function RedListChartSelector({
  especies,
  categorias,
  onCategoryClick,
}: RedListChartSelectorProps) {
  return (
    <div className="mt-8 mb-2">
      <RedListBarChart categorias={categorias} especies={especies} onCategoryClick={onCategoryClick} />
    </div>
  );
}
