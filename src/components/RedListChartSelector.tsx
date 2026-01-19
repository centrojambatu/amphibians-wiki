"use client";

import { CatalogOption } from "@/app/sapopedia/get-filter-catalogs";
import { SpeciesListItem } from "@/app/sapopedia/get-all-especies";
import RedListPieChart from "./RedListPieChart";

interface RedListChartSelectorProps {
  readonly especies: SpeciesListItem[];
  readonly categorias: CatalogOption[];
}

export default function RedListChartSelector({
  especies,
  categorias,
}: RedListChartSelectorProps) {
  return (
    <div className="mb-2">
      <div>
        <RedListPieChart categorias={categorias} especies={especies} />
      </div>
    </div>
  );
}
