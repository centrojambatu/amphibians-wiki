"use client";

import {useState} from "react";

import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {SpeciesListCard} from "@/components/species-list-card";
import SpeciesAccordion from "@/components/SpeciesAccordion";
import {SpeciesListItem} from "@/app/sapopedia/get-all-especies";
import {organizeTaxonomyData} from "@/lib/organize-taxonomy";
import {SpeciesData} from "@/types/taxonomy";

interface SapopediaContentProps {
  especies: SpeciesListItem[];
}

export function SapopediaContent({especies}: SapopediaContentProps) {
  // Agrupar por orden para la vista de cards
  const especiesPorOrden = especies.reduce<Record<string, typeof especies>>((acc, especie) => {
    const orden = especie.orden || "Sin clasificar";

    if (!acc[orden]) {
      acc[orden] = [];
    }
    acc[orden].push(especie);

    return acc;
  }, {});

  // Convertir datos para el accordion
  const especiesParaAccordion: SpeciesData[] = especies.map((e) => ({
    ...e,
    lista_roja_iucn: e.lista_roja_iucn || null,
  }));

  const ordenesOrganizados = organizeTaxonomyData(especiesParaAccordion);

  return (
    <Tabs className="w-full" defaultValue="cards">
      <TabsList className="mb-6 grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="cards">Vista de Cards</TabsTrigger>
        <TabsTrigger value="accordion">Vista Jerárquica</TabsTrigger>
      </TabsList>

      <TabsContent value="cards">
        {/* Listado de especies en cards */}
        <div className="mb-8">
          {Object.entries(especiesPorOrden).map(([orden, especiesDelOrden]) => (
            <div key={orden} className="mb-8">
              <h3 className="text-primary mb-4 text-xl font-semibold">{orden}</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {especiesDelOrden.map((especie) => (
                  <SpeciesListCard key={especie.id_taxon} species={especie} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="accordion">
        {/* Vista de accordion */}
        <SpeciesAccordion orders={ordenesOrganizados} />
      </TabsContent>
    </Tabs>
  );
}
