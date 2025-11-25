"use client";

import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import SpeciesAccordion from "@/components/SpeciesAccordion";
import PhylogeneticTreeReal from "@/components/PhylogeneticTreeReal";
import {SpeciesListItem} from "@/app/sapopedia/get-all-especies";
import {organizeTaxonomyData} from "@/lib/organize-taxonomy";
import {SpeciesData} from "@/types/taxonomy";

interface SapopediaContentProps {
  readonly especies: SpeciesListItem[];
}

export function SapopediaContent({especies}: SapopediaContentProps) {
  // Convertir datos para el accordion
  const especiesParaAccordion: SpeciesData[] = especies.map((e) => ({
    ...e,
    lista_roja_iucn: e.lista_roja_iucn || null,
    has_distribucion_occidental: e.has_distribucion_occidental || false,
    has_distribucion_oriental: e.has_distribucion_oriental || false,
  }));

  const ordenesOrganizados = organizeTaxonomyData(especiesParaAccordion);

  return (
    <Tabs className="w-full" defaultValue="accordion">
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
        {/* Vista de accordion */}
        <SpeciesAccordion orders={ordenesOrganizados} />
      </TabsContent>

      <TabsContent value="tree">
        {/* Vista de árbol filogenético */}
        <PhylogeneticTreeReal orders={ordenesOrganizados} />
      </TabsContent>
    </Tabs>
  );
}
