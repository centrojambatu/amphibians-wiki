"use client";

import { useState, useEffect } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SpeciesAccordion from "@/components/SpeciesAccordion";
import PhylogeneticTreeReal from "@/components/PhylogeneticTreeReal";
import FiltersPanel, { DEFAULT_FILTERS_STATE, FiltersState } from "@/components/FiltersPanel";
import { Card, CardContent } from "@/components/ui/card";
import { SpeciesListItem } from "@/app/sapopedia/get-all-especies";
import { FilterCatalogs } from "@/app/sapopedia/get-filter-catalogs";
import { filterEspecies } from "@/lib/filter-especies";
import {
  organizeTaxonomyData,
  type OrdenesNombresLookup,
} from "@/lib/organize-taxonomy";
import { SpeciesData } from "@/types/taxonomy";

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
    const cient = (e.nombre_cientifico ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const comun = (e.nombre_comun ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
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

  const ordenesOrganizados = organizeTaxonomyData(
    especiesParaAccordion,
    ordenesNombres,
  );

  const handleFiltersChange = (newFilters: FiltersState) => {
    setFilters(newFilters);
  };

  type QuickFilter = "endemicas" | "amenazadas" | "posiblemente-extintas";
  const applyQuickFilter = (type: QuickFilter) => {
    switch (type) {
      case "endemicas":
        setFilters({ ...DEFAULT_FILTERS_STATE, endemismo: ["endemic"] });
        break;
      case "amenazadas":
        setFilters({ ...DEFAULT_FILTERS_STATE, listaRoja: ["CR"] });
        break;
      case "posiblemente-extintas": {
        // Usar el valor del catálogo (ej. "CR (PE)") para que el panel muestre la opción activa
        const peOption = filterCatalogs.listaRoja.find(
          (o) =>
            o.sigla === "PE" ||
            (o.sigla && o.sigla.includes("PE")) ||
            (o.nombre && o.nombre.toLowerCase().includes("posiblemente"))
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
  const totalGeneros = new Set(especies.map((e) => e.genero).filter(Boolean)).size;
  const totalFamilias = new Set(especies.map((e) => e.familia).filter(Boolean)).size;
  const endemicasCount = especies.filter((e) => e.endemica).length;
  const amenazadasCount = especies.filter((e) => e.lista_roja_iucn === "CR").length;
  const posiblementeExtintaCount = especies.filter((e) => isPosiblementeExtinta(e.lista_roja_iucn)).length;

  const anuraCount = especies.filter((e) => e.orden?.toLowerCase() === "anura").length;
  const caudataCount = especies.filter((e) => e.orden?.toLowerCase() === "caudata").length;
  const gymnophionaCount = especies.filter((e) => e.orden?.toLowerCase() === "gymnophiona").length;

  return (
    <div className="flex flex-col gap-4">
      {/* Estadísticas - una sola fila horizontal */}
      <div className="mb-6 flex flex-nowrap gap-2 overflow-x-auto sm:mb-8 sm:gap-4">
        <Card className="min-w-0 flex-1 flex-shrink-0 !gap-0 !py-1 transition-shadow">
          <CardContent className="!py-0">
            <div className="mt-3 flex flex-col gap-1.5 items-start">
              <a
                href="https://deepskyblue-beaver-511675.hostingersite.com/historia"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline"
              >
                Historia
              </a>
              <a
                href="https://deepskyblue-beaver-511675.hostingersite.com/arqueologia"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline"
              >
                Arqueología
              </a>
              <a
                href="https://deepskyblue-beaver-511675.hostingersite.com/cultura"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline"
              >
                Cultura
              </a>
              <a
                href="https://deepskyblue-beaver-511675.hostingersite.com/biocomercio"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline"
              >
                Biocomercio
              </a>
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0 flex-1 flex-shrink-0 !gap-0 !py-1 transition-shadow">
          <CardContent className="!py-0">
            <div className="mt-3 flex flex-col gap-1.5 items-start">
              <a
                href="https://deepskyblue-beaver-511675.hostingersite.com/diversidad"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline"
              >
                Diversidad
              </a>
              <a
                href="https://deepskyblue-beaver-511675.hostingersite.com/diversidad"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline"
              >
                Distribución
              </a>
              <a
                href="https://deepskyblue-beaver-511675.hostingersite.com/extincion"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline"
              >
                Extinción
              </a>
              <a
                href="https://deepskyblue-beaver-511675.hostingersite.com/conservacion"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline"
              >
                Conservación
              </a>
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0 flex-1 flex-shrink-0">
          <CardContent>
            <p className="text-3xl font-bold sm:text-4xl">{totalEspecies}</p>
            <p className="text-muted-foreground text-xs sm:text-sm">Especies</p>
          </CardContent>
        </Card>

        <Card
          className="min-w-0 flex-1 flex-shrink-0 cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => setActiveOrderId("anura")}
        >
          <CardContent>
            <p className="text-3xl font-bold sm:text-4xl">{anuraCount}</p>
            <p className="text-muted-foreground text-xs sm:text-sm">Anura</p>
          </CardContent>
        </Card>

        <Card
          className="min-w-0 flex-1 flex-shrink-0 cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => setActiveOrderId("caudata")}
        >
          <CardContent>
            <p className="text-3xl font-bold sm:text-4xl">{caudataCount}</p>
            <p className="text-muted-foreground text-xs sm:text-sm">Caudata</p>
          </CardContent>
        </Card>

        <Card
          className="min-w-0 flex-1 flex-shrink-0 cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => setActiveOrderId("gymnophiona")}
        >
          <CardContent>
            <p className="text-3xl font-bold sm:text-4xl">{gymnophionaCount}</p>
            <p className="text-muted-foreground text-xs sm:text-sm">Gymnophiona</p>
          </CardContent>
        </Card>

        <Card
          className="min-w-0 flex-1 flex-shrink-0 cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => applyQuickFilter("endemicas")}
        >
          <CardContent>
            <p className="text-3xl font-bold sm:text-4xl">
              {endemicasCount}{" "}
              <span className="text-muted-foreground text-lg font-normal">
                {totalEspecies > 0 ? ((endemicasCount / totalEspecies) * 100).toFixed(1) : "0"}%
              </span>
            </p>
            <p className="text-muted-foreground text-xs sm:text-sm">Endémicas</p>
          </CardContent>
        </Card>

        <Card
          className="min-w-0 flex-1 flex-shrink-0 cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => applyQuickFilter("posiblemente-extintas")}
        >
          <CardContent>
            <p className="text-3xl font-bold sm:text-4xl">
              {posiblementeExtintaCount}{" "}
              <span className="text-muted-foreground text-lg font-normal">
                {totalEspecies > 0 ? ((posiblementeExtintaCount / totalEspecies) * 100).toFixed(1) : "0"}%
              </span>
            </p>
            <p className="text-muted-foreground text-xs sm:text-sm">Posiblemente extintas</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
        {/* Panel de filtros - lado izquierdo */}
        <div className="order-2 w-full flex-shrink-0 lg:order-1 lg:w-80">
          <FiltersPanel
            catalogs={filterCatalogs}
            especies={especies}
            filters={filters}
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
              {(especiesPorBusqueda.length < especies.length || searchQuery) && (
                <p className="text-muted-foreground mb-3 text-xs sm:mb-4 sm:text-sm">
                  Mostrando {especiesPorBusqueda.length} de {especies.length} especies
                </p>
              )}
              {/* Vista de accordion */}
              <SpeciesAccordion
                orders={ordenesOrganizados}
                activeOrderId={activeOrderId}
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
