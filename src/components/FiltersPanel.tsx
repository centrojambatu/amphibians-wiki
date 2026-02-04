"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, RotateCcw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { SpeciesListItem } from "@/app/sapopedia/get-all-especies";
import { FilterCatalogs } from "@/app/sapopedia/get-filter-catalogs";
import ClimaticFloorChartFilter from "@/components/ClimaticFloorChartFilter";

export interface FiltersState {
  provincia: string[];
  listaRoja: string[];
  endemismo: string[];
  rangoAltitudinal: { min: number; max: number };
  areaDistribucion: { min: number; max: number };
  ecosistemas: string[];
  regionesBiogeograficas: string[];
  reservasBiosfera: string[];
  bosquesProtegidos: string[];
  areasProtegidasEstado: string[];
  areasProtegidasPrivadas: string[];
  pluviocidad: { min: number; max: number };
  temperatura: { min: number; max: number };
  distribucion: string[]; // "oriental" | "occidental"
}

export type ExcludeFilterOption = "pluviocidad" | "temperatura" | "listaRoja";

export const DEFAULT_FILTERS_STATE: FiltersState = {
  provincia: [],
  listaRoja: [],
  endemismo: [],
  rangoAltitudinal: { min: 0, max: 4800 },
  areaDistribucion: { min: 1, max: 100000 },
  ecosistemas: [],
  regionesBiogeograficas: [],
  reservasBiosfera: [],
  bosquesProtegidos: [],
  areasProtegidasEstado: [],
  areasProtegidasPrivadas: [],
  pluviocidad: { min: 640, max: 4000 },
  temperatura: { min: 5, max: 25 },
  distribucion: [],
};

interface FiltersPanelProps {
  readonly especies: SpeciesListItem[];
  readonly catalogs: FilterCatalogs;
  readonly onFiltersChange: (filters: FiltersState) => void;
  /** Ocultar secciones de filtro (ej. en Lista Roja no se usan precipitación ni temperatura) */
  readonly excludeFilters?: ExcludeFilterOption[];
  /** Modo controlado: filtros desde el padre */
  readonly filters?: FiltersState;
  /** Solo accordion de filtros (para incrustar en Card de Lista Roja). Si se pasa onSearchQueryChange, incluye buscador. */
  readonly embedded?: boolean;
  /** Búsqueda controlada (ej. Lista Roja). Si se pasa con onSearchQueryChange, el buscador queda en el panel. */
  readonly searchQuery?: string;
  /** Notificar cambio de búsqueda para filtrar el acordeón de especies (Sapopedia / Lista Roja) */
  readonly onSearchQueryChange?: (query: string) => void;
}

interface SearchResult {
  id: number | string;
  name: string;
  type: "order" | "family" | "genus" | "species";
  path: string;
  commonName?: string | null;
}

export default function FiltersPanel({
  especies,
  catalogs,
  onFiltersChange,
  excludeFilters = [],
  filters: controlledFilters,
  embedded = false,
  searchQuery: controlledSearchQuery,
  onSearchQueryChange,
}: FiltersPanelProps) {
  const router = useRouter();
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const searchQuery = controlledSearchQuery ?? internalSearchQuery;
  const setSearchQuery = (value: string) => {
    if (controlledSearchQuery === undefined) setInternalSearchQuery(value);
    onSearchQueryChange?.(value);
  };
  const [open, setOpen] = useState(false);

  const [internalFilters, setInternalFilters] = useState<FiltersState>(DEFAULT_FILTERS_STATE);
  const filters = controlledFilters ?? internalFilters;
  const updateFilters = (newFilters: FiltersState) => {
    onFiltersChange(newFilters);
    if (controlledFilters === undefined) setInternalFilters(newFilters);
  };

  // Función para buscar en los datos de especies
  const searchData = (query: string): SearchResult[] => {
    if (!query || query.length < 2) return [];

    const lowerQuery = query.toLowerCase();
    const seenOrders = new Set<string>();
    const seenFamilies = new Set<string>();
    const seenGenera = new Set<string>();

    // Separar resultados por tipo para priorizar niveles superiores
    const orderResults: SearchResult[] = [];
    const familyResults: SearchResult[] = [];
    const genusResults: SearchResult[] = [];
    const speciesResults: SearchResult[] = [];

    for (const especie of especies) {
      // Buscar en órdenes
      if (especie.orden && !seenOrders.has(especie.orden)) {
        if (especie.orden.toLowerCase().includes(lowerQuery)) {
          seenOrders.add(especie.orden);
          orderResults.push({
            id: 0,
            name: especie.orden,
            type: "order",
            path: `/sapopedia/order/${especie.orden.toLowerCase()}`,
          });
        }
      }

      // Buscar en familias
      if (especie.familia && !seenFamilies.has(especie.familia)) {
        if (especie.familia.toLowerCase().includes(lowerQuery)) {
          seenFamilies.add(especie.familia);
          familyResults.push({
            id: 0,
            name: especie.familia,
            type: "family",
            path: `/sapopedia/family/${especie.familia.toLowerCase()}`,
          });
        }
      }

      // Buscar en géneros
      if (especie.genero && !seenGenera.has(especie.genero)) {
        if (especie.genero.toLowerCase().includes(lowerQuery)) {
          seenGenera.add(especie.genero);
          genusResults.push({
            id: 0,
            name: especie.genero,
            type: "genus",
            path: `/sapopedia/genus/${especie.genero.toLowerCase()}`,
          });
        }
      }

      // Buscar en especies
      if (
        especie.nombre_cientifico.toLowerCase().includes(lowerQuery) ||
        especie.nombre_comun?.toLowerCase().includes(lowerQuery)
      ) {
        // Usar el mismo formato que el acordeón: reemplazar espacios por guiones
        const path = `/sapopedia/species/${especie.nombre_cientifico.replaceAll(" ", "-")}`;

        speciesResults.push({
          id: especie.id_ficha_especie || especie.nombre_cientifico,
          name: especie.nombre_cientifico,
          type: "species",
          path,
          commonName: especie.nombre_comun,
        });
      }
    }

    // Combinar resultados priorizando niveles superiores
    // Máximo 2 órdenes, 3 familias, 3 géneros, y el resto especies (hasta 10 total)
    const maxOrders = 2;
    const maxFamilies = 3;
    const maxGenera = 3;
    const maxTotal = 10;

    const selectedOrders = orderResults.slice(0, maxOrders);
    const selectedFamilies = familyResults.slice(0, maxFamilies);
    const selectedGenera = genusResults.slice(0, maxGenera);
    const usedSlots =
      selectedOrders.length + selectedFamilies.length + selectedGenera.length;
    const remainingSlots = Math.max(0, maxTotal - usedSlots);

    const combinedResults: SearchResult[] = [
      ...selectedOrders,
      ...selectedFamilies,
      ...selectedGenera,
      ...speciesResults.slice(0, remainingSlots),
    ];

    return combinedResults;
  };

  const searchResults = searchData(searchQuery);

  const handleCategoricalChange = (key: keyof FiltersState, value: string) => {
    const currentValues = filters[key] as string[];
    let newValues: string[];

    if (currentValues.includes(value)) {
      newValues = currentValues.filter((v) => v !== value);
    } else {
      newValues = [...currentValues, value];
    }

    updateFilters({ ...filters, [key]: newValues });
  };

  const handleSliderChange = (key: keyof FiltersState, values: number[]) => {
    updateFilters({
      ...filters,
      [key]: { min: values[0], max: values[1] },
    });
  };

  const resetFilters = () => {
    updateFilters(DEFAULT_FILTERS_STATE);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "order":
        return "Orden";
      case "family":
        return "Familia";
      case "genus":
        return "Género";
      case "species":
        return "Especie";
      default:
        return "";
    }
  };

  const handleSelectResult = (path: string) => {
    setOpen(false);
    setSearchQuery("");
    router.push(path);
  };

  // Función para obtener los nombres de los filtros activos de un catálogo
  const getActiveFilterNames = (
    catalogItems: FilterCatalogs[keyof FilterCatalogs],
    filterKey: keyof FiltersState,
    useSigla = false,
  ): string[] => {
    const activeValues = filters[filterKey] as string[];

    if (activeValues.length === 0 || !catalogItems) return [];

    return catalogItems
      .filter((item) => activeValues.includes(item.value))
      .map((item) =>
        useSigla && item.sigla ? `${item.nombre} (${item.sigla})` : item.nombre,
      );
  };

  // Componente reutilizable para renderizar opciones de catálogo
  const renderCatalogOptions = (
    catalogItems: FilterCatalogs[keyof FilterCatalogs],
    filterKey: keyof FiltersState,
    useSigla = false,
  ) => {
    if (!catalogItems || catalogItems.length === 0) {
      return (
        <p className="py-2 text-xs text-gray-500">
          No hay opciones disponibles
        </p>
      );
    }

    return (
      <div className="flex flex-col gap-2">
        {catalogItems.map((item) => {
          const isSelected = (filters[filterKey] as string[]).includes(
            item.value,
          );

          return (
            <Button
              key={item.id}
              className="h-auto min-h-[32px] w-full justify-start rounded-none px-2 py-1 text-left text-sm break-words whitespace-normal"
              size="sm"
              style={{
                borderColor: isSelected ? undefined : "#e8e8e8",
                color: isSelected ? undefined : "#2d2d2d",
              }}
              variant={isSelected ? "default" : "outline"}
              onClick={() => handleCategoricalChange(filterKey, item.value)}
            >
              {useSigla && item.sigla ? (
                <>
                  {item.nombre}
                  <span className="mx-1 font-semibold text-gray-400">
                    |
                  </span>
                  {item.sigla}
                </>
              ) : (
                item.nombre
              )}
            </Button>
          );
        })}
      </div>
    );
  };

  if (embedded) {
    return (
      <div className="flex flex-col h-full min-h-0 w-full">
        {onSearchQueryChange != null && (
          <div className="flex-shrink-0 px-6 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Nombre científico o común"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {searchQuery && (
              <p className="mt-2 text-xs text-gray-500">
                Filtrando: &quot;{searchQuery}&quot;
              </p>
            )}
          </div>
        )}
        <div className="flex-shrink-0 py-2 flex justify-end px-6">
          <Button size="sm" variant="outline" onClick={resetFilters} className="gap-1 text-xs text-gray-600">
            <RotateCcw className="h-3.5 w-3.5 text-black" />
            Limpiar
          </Button>
        </div>
        <div className="min-h-0 w-full flex-1 overflow-y-auto max-h-[50vh] border-t mt-2 px-6">
          <Accordion className="w-full [&>[data-slot=accordion-item]]:border-b" type="multiple">
            {!excludeFilters.includes("listaRoja") && catalogs.listaRoja.length > 0 && (
              <AccordionItem value="listaRoja">
                <AccordionTrigger className="!items-start">
                  <div className="flex flex-col items-start">
                    <span className="font-semibold">Lista Roja</span>
                    {filters.listaRoja.length > 0 && (
                      <span className="mt-1 text-xs font-normal text-gray-500">
                        {getActiveFilterNames(catalogs.listaRoja, "listaRoja", true).join(", ")}
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>{renderCatalogOptions(catalogs.listaRoja, "listaRoja", true)}</AccordionContent>
              </AccordionItem>
            )}
            <AccordionItem value="endemismo">
              <AccordionTrigger className="!items-start">
                <div className="flex flex-col items-start">
                  <span className="font-semibold">Endemismo</span>
                  {filters.endemismo.length > 0 && (
                    <span className="mt-1 text-xs font-normal text-gray-500">
                      {filters.endemismo.map((val) => (val === "endemic" ? "Endémicas" : "No endémicas")).join(", ")}
                    </span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-2">
                  {[
                    { value: "endemic", label: "Endémicas" },
                    { value: "non-endemic", label: "No endémicas" },
                  ].map((option) => {
                    const isSelected = filters.endemismo.includes(option.value);
                    return (
                      <Button
                        key={option.value}
                        className="h-auto min-h-[32px] w-full justify-start rounded-none px-2 py-1 text-left text-sm"
                        size="sm"
                        style={{ borderColor: isSelected ? undefined : "#e8e8e8", color: isSelected ? undefined : "#2d2d2d" }}
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => handleCategoricalChange("endemismo", option.value)}
                      >
                        {option.label}
                      </Button>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
            {catalogs.provincias.length > 0 && (
              <AccordionItem value="provincia">
                <AccordionTrigger className="!items-start">
                  <div className="flex flex-col items-start">
                    <span className="font-semibold">Provincia</span>
                    {filters.provincia.length > 0 && (
                      <span className="mt-1 text-xs font-normal text-gray-500">
                        {getActiveFilterNames(catalogs.provincias, "provincia").join(", ")}
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>{renderCatalogOptions(catalogs.provincias, "provincia")}</AccordionContent>
              </AccordionItem>
            )}
            {/* Pisos altitudinales (gráfico + slider + distribución) */}
            <AccordionItem value="pisosAltitudinales">
              <AccordionTrigger className="!items-start">
                <div className="flex flex-col items-start">
                  <span className="font-semibold">Pisos altitudinales</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {(filters.rangoAltitudinal.min !== 0 ||
                      filters.rangoAltitudinal.max !== 4800) && (
                      <span className="text-xs font-normal text-gray-500">
                        {filters.rangoAltitudinal.min}m - {filters.rangoAltitudinal.max}m
                      </span>
                    )}
                    {filters.distribucion.length > 0 && (
                      <span className="text-xs font-normal text-gray-500">
                        {filters.distribucion.join(", ")}
                      </span>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex flex-col gap-2">
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.distribucion.includes("occidental")}
                          onChange={() => handleCategoricalChange("distribucion", "occidental")}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700">Occidental</span>
                      </label>
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.distribucion.includes("oriental")}
                          onChange={() => handleCategoricalChange("distribucion", "oriental")}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700">Oriental</span>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{filters.rangoAltitudinal.min}m</span>
                      <span>{filters.rangoAltitudinal.max}m</span>
                    </div>
                    <Slider
                      min={0}
                      max={4800}
                      step={100}
                      value={[filters.rangoAltitudinal.min, filters.rangoAltitudinal.max]}
                      onValueChange={(values) => handleSliderChange("rangoAltitudinal", values)}
                    />
                  </div>
                  <ClimaticFloorChartFilter
                    altitudinalRange={{
                      min: filters.rangoAltitudinal.min,
                      max: filters.rangoAltitudinal.max,
                    }}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="areaDistribucion">
              <AccordionTrigger className="!items-start">
                <div className="flex flex-col items-start">
                  <span className="font-semibold">Área distribución <span className="ml-1 font-normal text-gray-500">km²</span></span>
                  {(filters.areaDistribucion.min !== 1 || filters.areaDistribucion.max !== 100000) && (
                    <span className="mt-1 text-xs font-normal text-gray-500">
                      {filters.areaDistribucion.min} km² - {filters.areaDistribucion.max} km²
                    </span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{filters.areaDistribucion.min} km²</span>
                    <span>{filters.areaDistribucion.max} km²</span>
                  </div>
                  <Slider
                    min={1}
                    max={100000}
                    step={100}
                    value={[filters.areaDistribucion.min, filters.areaDistribucion.max]}
                    onValueChange={(values) => handleSliderChange("areaDistribucion", values)}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
            {catalogs.ecosistemas.length > 0 && (
              <AccordionItem value="ecosistemas">
                <AccordionTrigger className="!items-start">
                  <div className="flex flex-col items-start">
                    <span className="font-semibold">Ecosistemas</span>
                    {filters.ecosistemas.length > 0 && (
                      <span className="mt-1 text-xs font-normal text-gray-500">
                        {getActiveFilterNames(catalogs.ecosistemas, "ecosistemas").join(", ")}
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>{renderCatalogOptions(catalogs.ecosistemas, "ecosistemas")}</AccordionContent>
              </AccordionItem>
            )}
            {catalogs.regionesBiogeograficas.length > 0 && (
              <AccordionItem value="regionesBiogeograficas">
                <AccordionTrigger className="!items-start">
                  <div className="flex flex-col items-start">
                    <span className="font-semibold">Regiones biogeográficas</span>
                    {filters.regionesBiogeograficas.length > 0 && (
                      <span className="mt-1 text-xs font-normal text-gray-500">
                        {getActiveFilterNames(catalogs.regionesBiogeograficas, "regionesBiogeograficas").join(", ")}
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {renderCatalogOptions(catalogs.regionesBiogeograficas, "regionesBiogeograficas")}
                </AccordionContent>
              </AccordionItem>
            )}
            {catalogs.reservasBiosfera.length > 0 && (
              <AccordionItem value="reservasBiosfera">
                <AccordionTrigger className="!items-start">
                  <div className="flex flex-col items-start">
                    <span className="font-semibold">Reservas de la biosfera</span>
                    {filters.reservasBiosfera.length > 0 && (
                      <span className="mt-1 text-xs font-normal text-gray-500">
                        {getActiveFilterNames(catalogs.reservasBiosfera, "reservasBiosfera").join(", ")}
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {renderCatalogOptions(catalogs.reservasBiosfera, "reservasBiosfera")}
                </AccordionContent>
              </AccordionItem>
            )}
            {catalogs.bosquesProtegidos.length > 0 && (
              <AccordionItem value="bosquesProtegidos">
                <AccordionTrigger className="!items-start">
                  <div className="flex flex-col items-start">
                    <span className="font-semibold">Bosques protegidos</span>
                    {filters.bosquesProtegidos.length > 0 && (
                      <span className="mt-1 text-xs font-normal text-gray-500">
                        {getActiveFilterNames(catalogs.bosquesProtegidos, "bosquesProtegidos").join(", ")}
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {renderCatalogOptions(catalogs.bosquesProtegidos, "bosquesProtegidos")}
                </AccordionContent>
              </AccordionItem>
            )}
            {catalogs.areasProtegidasEstado.length > 0 && (
              <AccordionItem value="areasProtegidasEstado">
                <AccordionTrigger className="!items-start">
                  <div className="flex flex-col items-start">
                    <span className="font-semibold">Áreas protegidas Estado <span className="mx-1 font-normal text-[#f07304]">|</span> SNAP</span>
                    {filters.areasProtegidasEstado.length > 0 && (
                      <span className="mt-1 text-xs font-normal text-gray-500">
                        {getActiveFilterNames(catalogs.areasProtegidasEstado, "areasProtegidasEstado").join(", ")}
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {renderCatalogOptions(catalogs.areasProtegidasEstado, "areasProtegidasEstado")}
                </AccordionContent>
              </AccordionItem>
            )}
            {catalogs.areasProtegidasPrivadas.length > 0 && (
              <AccordionItem value="areasProtegidasPrivadas">
                <AccordionTrigger className="!items-start">
                  <div className="flex flex-col items-start">
                    <span className="font-semibold">Áreas protegidas privadas </span>
                    {filters.areasProtegidasPrivadas.length > 0 && (
                      <span className="mt-1 text-xs font-normal text-gray-500">
                        {getActiveFilterNames(catalogs.areasProtegidasPrivadas, "areasProtegidasPrivadas").join(", ")}
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {renderCatalogOptions(catalogs.areasProtegidasPrivadas, "areasProtegidasPrivadas")}
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-0 flex h-auto lg:h-screen lg:max-h-screen flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
      {/* Buscador y Limpiar */}
      <div className="flex-shrink-0 border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 space-y-3">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 shrink-0 text-muted-foreground pointer-events-none" />
              <Input
                className="w-full pl-10"
                placeholder="Nombre científico o común"
                value={searchQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchQuery(value);
                  setOpen(value.length >= 2);
                  onSearchQueryChange?.(value);
                }}
                onFocus={() => {
                  if (searchQuery.length >= 2) {
                    setOpen(true);
                  }
                }}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-[--radix-popover-trigger-width] p-0"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <Command>
              <CommandList>
                {searchResults.length === 0 && searchQuery.length >= 2 && (
                  <CommandEmpty className="px-4 py-6">
                    No se encontraron resultados.
                  </CommandEmpty>
                )}
                {searchResults.length > 0 && (
                  <CommandGroup>
                    {searchResults.map((result) => (
                      <CommandItem
                        key={`${result.type}-${String(result.id)}-${result.name}`}
                        className="cursor-pointer"
                        onSelect={() => handleSelectResult(result.path)}
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground text-xs">
                              {getTypeLabel(result.type)}
                            </span>
                            <span className="font-medium italic">
                              {result.name}
                            </span>
                          </div>
                          {result.commonName && (
                            <span className="text-muted-foreground text-xs">
                              {result.commonName}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={resetFilters}
            className="gap-1 text-xs text-gray-600 w-auto"
          >
            <RotateCcw className="h-3.5 w-3.5 text-black" />
            Limpiar
          </Button>
        </div>
      </div>

      <div className="filters-panel-scroll min-h-0 flex-1 overflow-y-auto px-4 sm:px-6 pt-0 pb-3 sm:pb-4 max-h-[60vh] lg:max-h-none">
        <Accordion className="w-full [&>[data-slot=accordion-item]]:border-b [&>[data-slot=accordion-item]]:-mx-4 [&>[data-slot=accordion-item]]:px-4 sm:[&>[data-slot=accordion-item]]:-mx-6 sm:[&>[data-slot=accordion-item]]:px-6" type="multiple">
          {/* Lista Roja UICN - desde Supabase */}
          {!excludeFilters.includes("listaRoja") && catalogs.listaRoja.length > 0 && (
            <AccordionItem value="listaRoja">
              <AccordionTrigger className="!items-start">
                <div className="flex flex-col items-start">
                  <span className="font-semibold">Lista Roja</span>
                  {filters.listaRoja.length > 0 && (
                    <span className="mt-1 text-xs font-normal text-gray-500">
                      {getActiveFilterNames(
                        catalogs.listaRoja,
                        "listaRoja",
                        true,
                      ).join(", ")}
                    </span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {renderCatalogOptions(catalogs.listaRoja, "listaRoja", true)}
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Endemismo - hardcoded ya que son solo 2 opciones fijas */}
          <AccordionItem value="endemismo">
            <AccordionTrigger className="!items-start">
              <div className="flex flex-col items-start">
                <span className="font-semibold">Endemismo</span>
                {filters.endemismo.length > 0 && (
                  <span className="mt-1 text-xs font-normal text-gray-500">
                    {filters.endemismo
                      .map((val) =>
                        val === "endemic" ? "Endémicas" : "No endémicas",
                      )
                      .join(", ")}
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-2">
                {[
                  { value: "endemic", label: "Endémicas" },
                  { value: "non-endemic", label: "No endémicas" },
                ].map((option) => {
                  const isSelected = filters.endemismo.includes(option.value);

                  return (
                    <Button
                      key={option.value}
                      className="h-auto min-h-[32px] w-full justify-start rounded-none px-2 py-1 text-left text-sm"
                      size="sm"
                      style={{
                        borderColor: isSelected ? undefined : "#e8e8e8",
                        color: isSelected ? undefined : "#2d2d2d",
                      }}
                      variant={isSelected ? "default" : "outline"}
                      onClick={() =>
                        handleCategoricalChange("endemismo", option.value)
                      }
                    >
                      {option.label}
                    </Button>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Provincias - desde Supabase */}
          {catalogs.provincias.length > 0 && (
            <AccordionItem value="provincia">
              <AccordionTrigger className="!items-start">
                <div className="flex flex-col items-start">
                  <span className="font-semibold">Provincia</span>
                  {filters.provincia.length > 0 && (
                    <span className="mt-1 text-xs font-normal text-gray-500">
                      {getActiveFilterNames(
                        catalogs.provincias,
                        "provincia",
                      ).join(", ")}
                    </span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {renderCatalogOptions(catalogs.provincias, "provincia")}
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Pisos Altitudinales con gráfico */}
          <AccordionItem value="pisosAltitudinales">
            <AccordionTrigger className="!items-start">
              <div className="flex flex-col items-start">
                <span className="font-semibold">Pisos altitudinales</span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {(filters.rangoAltitudinal.min !== 0 ||
                    filters.rangoAltitudinal.max !== 4800) && (
                      <span className="text-xs font-normal text-gray-500">
                        {filters.rangoAltitudinal.min}m -{" "}
                        {filters.rangoAltitudinal.max}m
                      </span>
                    )}
                  {filters.distribucion.length > 0 && (
                    <span className="text-xs font-normal text-gray-500">
                      {filters.distribucion.join(", ")}
                    </span>
                  )}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {/* Checkboxes de distribución - encima del gráfico */}
                <div className="space-y-2">
                  <div className="flex flex-col gap-2">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filters.distribucion.includes("occidental")}
                        onChange={() =>
                          handleCategoricalChange("distribucion", "occidental")
                        }
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700">Occidental</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filters.distribucion.includes("oriental")}
                        onChange={() =>
                          handleCategoricalChange("distribucion", "oriental")
                        }
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700">Oriental</span>
                    </label>
                  </div>
                </div>
                {/* Slider de rango altitudinal */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{filters.rangoAltitudinal.min}m</span>
                    <span>{filters.rangoAltitudinal.max}m</span>
                  </div>
                  <Slider
                    max={4800}
                    min={0}
                    step={100}
                    value={[
                      filters.rangoAltitudinal.min,
                      filters.rangoAltitudinal.max,
                    ]}
                    onValueChange={(values) =>
                      handleSliderChange("rangoAltitudinal", values)
                    }
                  />
                </div>

                {/* Gráfico de pisos climáticos */}
                <ClimaticFloorChartFilter
                  altitudinalRange={{
                    min: filters.rangoAltitudinal.min,
                    max: filters.rangoAltitudinal.max,
                  }}
                />


              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Área de Distribución */}
          <AccordionItem value="areaDistribucion">
            <AccordionTrigger className="!items-start">
              <div className="flex flex-col items-start">
                <span className="font-semibold">Área distribución <span className="ml-1 font-normal text-gray-500">km²</span></span>
                {(filters.areaDistribucion.min !== 1 ||
                  filters.areaDistribucion.max !== 100000) && (
                    <span className="mt-1 text-xs font-normal text-gray-500">
                      {filters.areaDistribucion.min} km² -{" "}
                      {filters.areaDistribucion.max} km²
                    </span>
                  )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{filters.areaDistribucion.min} km²</span>
                  <span>{filters.areaDistribucion.max} km²</span>
                </div>
                <Slider
                  max={100000}
                  min={1}
                  step={100}
                  value={[
                    filters.areaDistribucion.min,
                    filters.areaDistribucion.max,
                  ]}
                  onValueChange={(values) =>
                    handleSliderChange("areaDistribucion", values)
                  }
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Ecosistemas - desde Supabase */}
          {catalogs.ecosistemas.length > 0 && (
            <AccordionItem value="ecosistemas">
              <AccordionTrigger className="!items-start">
                <div className="flex flex-col items-start">
                  <span className="font-semibold">Ecosistemas</span>
                  {filters.ecosistemas.length > 0 && (
                    <span className="mt-1 text-xs font-normal text-gray-500">
                      {getActiveFilterNames(
                        catalogs.ecosistemas,
                        "ecosistemas",
                      ).join(", ")}
                    </span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {renderCatalogOptions(catalogs.ecosistemas, "ecosistemas")}
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Regiones Biogeográficas - desde Supabase */}
          {catalogs.regionesBiogeograficas.length > 0 && (
            <AccordionItem value="regionesBiogeograficas">
              <AccordionTrigger className="!items-start">
                <div className="flex flex-col items-start">
                  <span className="font-semibold">Regiones biogeográficas</span>
                  {filters.regionesBiogeograficas.length > 0 && (
                    <span className="mt-1 text-xs font-normal text-gray-500">
                      {getActiveFilterNames(
                        catalogs.regionesBiogeograficas,
                        "regionesBiogeograficas",
                      ).join(", ")}
                    </span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {renderCatalogOptions(
                  catalogs.regionesBiogeograficas,
                  "regionesBiogeograficas",
                )}
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Reservas de la Biosfera - desde Supabase */}
          {catalogs.reservasBiosfera.length > 0 && (
            <AccordionItem value="reservasBiosfera">
              <AccordionTrigger className="!items-start">
                <div className="flex flex-col items-start">
                  <span className="font-semibold">Reservas biosfera</span>
                  {filters.reservasBiosfera.length > 0 && (
                    <span className="mt-1 text-xs font-normal text-gray-500">
                      {getActiveFilterNames(
                        catalogs.reservasBiosfera,
                        "reservasBiosfera",
                      ).join(", ")}
                    </span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {renderCatalogOptions(
                  catalogs.reservasBiosfera,
                  "reservasBiosfera",
                )}
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Áreas Protegidas del Estado - desde Supabase */}
          {catalogs.areasProtegidasEstado.length > 0 && (
            <AccordionItem value="areasProtegidasEstado">
              <AccordionTrigger className="!items-start">
                <div className="flex flex-col items-start">
                  <span className="font-semibold">
                    Áreas protegidas Estado <span className="mx-1 font-normal text-[#f07304]">|</span> SNAP
                  </span>
                  {filters.areasProtegidasEstado.length > 0 && (
                    <span className="mt-1 text-xs font-normal text-gray-500">
                      {getActiveFilterNames(
                        catalogs.areasProtegidasEstado,
                        "areasProtegidasEstado",
                      ).join(", ")}
                    </span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {renderCatalogOptions(
                  catalogs.areasProtegidasEstado,
                  "areasProtegidasEstado",
                )}
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Áreas Protegidas Privadas - desde Supabase */}
          {catalogs.areasProtegidasPrivadas.length > 0 && (
            <AccordionItem value="areasProtegidasPrivadas">
              <AccordionTrigger className="!items-start">
                <div className="flex flex-col items-start">
                  <span className="font-semibold">
                    Áreas protegidas privadas
                  </span>
                  {filters.areasProtegidasPrivadas.length > 0 && (
                    <span className="mt-1 text-xs font-normal text-gray-500">
                      {getActiveFilterNames(
                        catalogs.areasProtegidasPrivadas,
                        "areasProtegidasPrivadas",
                      ).join(", ")}
                    </span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {renderCatalogOptions(
                  catalogs.areasProtegidasPrivadas,
                  "areasProtegidasPrivadas",
                )}
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Bosques Protegidos - desde Supabase */}
          {catalogs.bosquesProtegidos.length > 0 && (
            <AccordionItem value="bosquesProtegidos">
              <AccordionTrigger className="!items-start">
                <div className="flex flex-col items-start">
                  <span className="font-semibold">Bosques protegidos</span>
                  {filters.bosquesProtegidos.length > 0 && (
                    <span className="mt-1 text-xs font-normal text-gray-500">
                      {getActiveFilterNames(
                        catalogs.bosquesProtegidos,
                        "bosquesProtegidos",
                      ).join(", ")}
                    </span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {renderCatalogOptions(
                  catalogs.bosquesProtegidos,
                  "bosquesProtegidos",
                )}
              </AccordionContent>
            </AccordionItem>
          )}

          {!excludeFilters.includes("pluviocidad") && (
            <>
              {/* Precipitación */}
              <AccordionItem value="pluviocidad">
                <AccordionTrigger className="!items-start">
                  <div className="flex flex-col items-start">
                    <span className="font-semibold">Precipitación <span className="ml-1 font-normal text-gray-500">media anual</span></span>
                    {(filters.pluviocidad.min !== 640 ||
                      filters.pluviocidad.max !== 4000) && (
                        <span className="mt-1 text-xs font-normal text-gray-500">
                          {filters.pluviocidad.min} - {filters.pluviocidad.max} mm/año
                        </span>
                      )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{filters.pluviocidad.min} mm/año</span>
                      <span>{filters.pluviocidad.max} mm/año</span>
                    </div>
                    <Slider
                      max={4000}
                      min={640}
                      step={50}
                      value={[filters.pluviocidad.min, filters.pluviocidad.max]}
                      onValueChange={(values) =>
                        handleSliderChange("pluviocidad", values)
                      }
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </>
          )}

          {!excludeFilters.includes("temperatura") && (
            <>
              {/* Temperatura */}
              <AccordionItem value="temperatura">
                <AccordionTrigger className="!items-start">
                  <div className="flex flex-col items-start">
                    <span className="font-semibold">Temperatura<span className="ml-1 font-normal text-gray-500">media anual</span></span>
                    {(filters.temperatura.min !== 5 ||
                      filters.temperatura.max !== 25) && (
                        <span className="mt-1 text-xs font-normal text-gray-500">
                          {filters.temperatura.min} - {filters.temperatura.max} °C
                        </span>
                      )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{filters.temperatura.min} °C</span>
                      <span>{filters.temperatura.max} °C</span>
                    </div>
                    <Slider
                      max={25}
                      min={5}
                      step={1}
                      value={[filters.temperatura.min, filters.temperatura.max]}
                      onValueChange={(values) =>
                        handleSliderChange("temperatura", values)
                      }
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </>
          )}
        </Accordion>

        {/* Enlaces externos */}
        <div className="-mx-4 sm:-mx-6 mt-1"></div>
        <div className="pt-4 space-y-2">
          <a
            href="https://deepskyblue-beaver-511675.hostingersite.com/historia"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-gray-600 hover:text-primary transition-colors"
          >
            Historia
          </a>
          <a
            href="https://deepskyblue-beaver-511675.hostingersite.com/diversidad"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-gray-600 hover:text-primary transition-colors"
          >
            Diversidad
          </a>
          <a
            href="https://deepskyblue-beaver-511675.hostingersite.com/conservacion"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-gray-600 hover:text-primary transition-colors"
          >
            Conservación
          </a>
          <a
            href="https://deepskyblue-beaver-511675.hostingersite.com/extincion"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-gray-600 hover:text-primary transition-colors"
          >
            Extinción
          </a>
          <a
            href="https://deepskyblue-beaver-511675.hostingersite.com/arqueologia"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-gray-600 hover:text-primary transition-colors"
          >
            Arqueología
          </a>
          <a
            href="https://deepskyblue-beaver-511675.hostingersite.com/etnobatracologia"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-gray-600 hover:text-primary transition-colors"
          >
            Etnobatracología
          </a>
        </div>

      </div>
    </div>
  );
}
