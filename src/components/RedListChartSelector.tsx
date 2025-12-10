"use client";

import { CatalogOption } from "@/app/sapopedia/get-filter-catalogs";
import { SpeciesListItem } from "@/app/sapopedia/get-all-especies";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import RedListBarChart from "./RedListBarChart";
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
    <div className="mb-8">
      <Tabs defaultValue="pie" className="w-full">
        <div className="mb-4 flex items-center justify-center">
          <TabsList>
            <TabsTrigger value="pie">Diagrama de Pastel</TabsTrigger>
            <TabsTrigger value="bar">Diagrama de Barras</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="pie" className="mt-0">
          <RedListPieChart categorias={categorias} especies={especies} />
        </TabsContent>
        <TabsContent value="bar" className="mt-0">
          <RedListBarChart categorias={categorias} especies={especies} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
