"use client";

import {useState} from "react";
import {SlidersHorizontal, X, ChevronDown, ChevronUp} from "lucide-react";

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
  const [showLinks, setShowLinks] = useState(false);

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

  const explorarLinks: [string, string][] = [
    ["Historia", "https://deepskyblue-beaver-511675.hostingersite.com/historia"],
    ["Diversidad", "https://deepskyblue-beaver-511675.hostingersite.com/diversidad"],
    ["Arqueología", "https://deepskyblue-beaver-511675.hostingersite.com/arqueologia"],
    ["Distribución", "https://deepskyblue-beaver-511675.hostingersite.com/distribucion"],
    ["Cultura", "https://deepskyblue-beaver-511675.hostingersite.com/cultura"],
    ["Extinción", "https://deepskyblue-beaver-511675.hostingersite.com/extincion"],
    ["Biocomercio", "https://deepskyblue-beaver-511675.hostingersite.com/biocomercio"],
    ["Conservación", "https://deepskyblue-beaver-511675.hostingersite.com/conservacion"],
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* ── STATS: DESKTOP (sm+) ──────────────────────────────────────── */}
      <div className="mb-6 hidden flex-nowrap gap-2 overflow-x-auto pb-1 sm:mb-8 sm:flex sm:gap-3">
        <Card className="min-w-[118px] flex-1 flex-shrink-0 !gap-0 !py-1 transition-shadow">
          <CardContent className="!py-0">
            <div className="mt-3 flex flex-col items-start gap-1.5">
              <a
                className="text-primary text-sm font-medium hover:no-underline"
                href="https://deepskyblue-beaver-511675.hostingersite.com/historia"
                rel="noopener noreferrer"
                target="_blank"
              >
                Historia
              </a>
              <a
                className="text-primary text-sm font-medium hover:no-underline"
                href="https://deepskyblue-beaver-511675.hostingersite.com/arqueologia"
                rel="noopener noreferrer"
                target="_blank"
              >
                Arqueología
              </a>
              <a
                className="text-primary text-sm font-medium hover:no-underline"
                href="https://deepskyblue-beaver-511675.hostingersite.com/cultura"
                rel="noopener noreferrer"
                target="_blank"
              >
                Cultura
              </a>
              <a
                className="text-primary text-sm font-medium hover:no-underline"
                href="https://deepskyblue-beaver-511675.hostingersite.com/biocomercio"
                rel="noopener noreferrer"
                target="_blank"
              >
                Biocomercio
              </a>
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-[118px] flex-1 flex-shrink-0 !gap-0 !py-1 transition-shadow">
          <CardContent className="!py-0">
            <div className="mt-3 flex flex-col items-start gap-1.5">
              <a
                className="text-primary text-sm font-medium hover:no-underline"
                href="https://deepskyblue-beaver-511675.hostingersite.com/diversidad"
                rel="noopener noreferrer"
                target="_blank"
              >
                Diversidad
              </a>
              <a
                className="text-primary text-sm font-medium hover:no-underline"
                href="https://deepskyblue-beaver-511675.hostingersite.com/distribucion"
                rel="noopener noreferrer"
                target="_blank"
              >
                Distribución
              </a>
              <a
                className="text-primary text-sm font-medium hover:no-underline"
                href="https://deepskyblue-beaver-511675.hostingersite.com/extincion"
                rel="noopener noreferrer"
                target="_blank"
              >
                Extinción
              </a>
              <a
                className="text-primary text-sm font-medium hover:no-underline"
                href="https://deepskyblue-beaver-511675.hostingersite.com/conservacion"
                rel="noopener noreferrer"
                target="_blank"
              >
                Conservación
              </a>
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-[100px] flex-1 flex-shrink-0">
          <CardContent>
            <p className="text-4xl font-bold text-[#f07304]">{totalEspecies}</p>
            <p className="text-muted-foreground text-xs sm:text-sm">Especies</p>
          </CardContent>
        </Card>

        <Card
          className="min-w-[85px] flex-1 flex-shrink-0 cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => setActiveOrderId("anura")}
        >
          <CardContent>
            <p className="text-3xl font-bold">{anuraCount}</p>
            <p className="text-muted-foreground text-xs sm:text-sm">Anura</p>
          </CardContent>
        </Card>

        <Card
          className="min-w-[85px] flex-1 flex-shrink-0 cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => setActiveOrderId("caudata")}
        >
          <CardContent>
            <p className="text-3xl font-bold">{caudataCount}</p>
            <p className="text-muted-foreground text-xs sm:text-sm">Caudata</p>
          </CardContent>
        </Card>

        <Card
          className="min-w-[108px] flex-1 flex-shrink-0 cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => setActiveOrderId("gymnophiona")}
        >
          <CardContent>
            <p className="text-3xl font-bold">{gymnophionaCount}</p>
            <p className="text-muted-foreground text-xs sm:text-sm">Gymnophiona</p>
          </CardContent>
        </Card>

        <Card
          className="min-w-[118px] flex-1 flex-shrink-0 cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => applyQuickFilter("endemicas")}
        >
          <CardContent>
            <p className="text-3xl font-bold">
              {endemicasCount}{" "}
              <span className="text-muted-foreground text-base font-normal">
                {totalEspecies > 0 ? ((endemicasCount / totalEspecies) * 100).toFixed(1) : "0"}%
              </span>
            </p>
            <p className="text-muted-foreground text-xs sm:text-sm">Endémicas</p>
          </CardContent>
        </Card>

        <Card
          className="min-w-[128px] flex-1 flex-shrink-0 cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => applyQuickFilter("posiblemente-extintas")}
        >
          <CardContent>
            <p className="text-3xl font-bold">
              {posiblementeExtintaCount}{" "}
              <span className="text-muted-foreground text-base font-normal">
                {totalEspecies > 0
                  ? ((posiblementeExtintaCount / totalEspecies) * 100).toFixed(1)
                  : "0"}
                %
              </span>
            </p>
            <p className="text-muted-foreground text-xs sm:text-sm">Posiblemente extintas</p>
          </CardContent>
        </Card>
      </div>

      {/* ── STATS: MOBILE (<sm) ──────────────────────────────────────── */}
      <div className="mb-3 sm:hidden">
        {/* Grilla compacta 3 columnas */}
        <div className="mb-3 grid grid-cols-3 gap-2">
          <Card>
            <CardContent className="p-3">
              <p className="text-2xl font-bold text-[#f07304]">{totalEspecies}</p>
              <p className="text-muted-foreground text-[11px] leading-tight">Especies</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer transition-shadow active:shadow-md"
            onClick={() => setActiveOrderId("anura")}
          >
            <CardContent className="p-3">
              <p className="text-2xl font-bold">{anuraCount}</p>
              <p className="text-muted-foreground text-[11px] leading-tight">Anura</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer transition-shadow active:shadow-md"
            onClick={() => setActiveOrderId("caudata")}
          >
            <CardContent className="p-3">
              <p className="text-2xl font-bold">{caudataCount}</p>
              <p className="text-muted-foreground text-[11px] leading-tight">Caudata</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer transition-shadow active:shadow-md"
            onClick={() => setActiveOrderId("gymnophiona")}
          >
            <CardContent className="p-3">
              <p className="text-2xl font-bold">{gymnophionaCount}</p>
              <p className="text-muted-foreground text-[11px] leading-tight">Gymnophiona</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer transition-shadow active:shadow-md"
            onClick={() => applyQuickFilter("endemicas")}
          >
            <CardContent className="p-3">
              <p className="text-2xl font-bold">{endemicasCount}</p>
              <p className="text-muted-foreground text-[11px] leading-tight">Endémicas</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer transition-shadow active:shadow-md"
            onClick={() => applyQuickFilter("posiblemente-extintas")}
          >
            <CardContent className="p-3">
              <p className="text-xl font-bold">{posiblementeExtintaCount}</p>
              <p className="text-muted-foreground text-[11px] leading-tight">Posib. extintas</p>
            </CardContent>
          </Card>
        </div>

        {/* Acordeón de enlaces */}
        <button
          className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          type="button"
          onClick={() => setShowLinks((v) => !v)}
        >
          <span>Explorar Centro Jambatu</span>
          {showLinks ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </button>

        {showLinks && (
          <div className="mt-1.5 rounded-lg border border-gray-200 bg-white p-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
              {explorarLinks.map(([label, href]) => (
                <a
                  key={label}
                  className="text-primary text-sm font-medium"
                  href={href}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

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
