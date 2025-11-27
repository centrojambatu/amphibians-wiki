"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";

import {Button} from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {Slider} from "@/components/ui/slider";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Input} from "@/components/ui/input";
import {SpeciesListItem} from "@/app/sapopedia/get-all-especies";
import {FilterCatalogs} from "@/app/sapopedia/get-filter-catalogs";
import ClimaticFloorChartFilter from "@/components/ClimaticFloorChartFilter";

export interface FiltersState {
  provincia: string[];
  listaRoja: string[];
  endemismo: string[];
  rangoAltitudinal: {min: number; max: number};
  areaDistribucion: {min: number; max: number};
  ecosistemas: string[];
  regionesBiogeograficas: string[];
  reservasBiosfera: string[];
  bosquesProtegidos: string[];
  areasProtegidasEstado: string[];
  areasProtegidasPrivadas: string[];
  pluviocidad: {min: number; max: number};
  temperatura: {min: number; max: number};
}

interface FiltersPanelProps {
  readonly especies: SpeciesListItem[];
  readonly catalogs: FilterCatalogs;
  readonly onFiltersChange: (filters: FiltersState) => void;
}

interface SearchResult {
  id: number;
  name: string;
  type: "order" | "family" | "genus" | "species";
  path: string;
  commonName?: string | null;
}

export default function FiltersPanel({especies, catalogs, onFiltersChange}: FiltersPanelProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);

  const [filters, setFilters] = useState<FiltersState>({
    provincia: [],
    listaRoja: [],
    endemismo: [],
    rangoAltitudinal: {min: 0, max: 4800},
    areaDistribucion: {min: 1, max: 100000},
    ecosistemas: [],
    regionesBiogeograficas: [],
    reservasBiosfera: [],
    bosquesProtegidos: [],
    areasProtegidasEstado: [],
    areasProtegidasPrivadas: [],
    pluviocidad: {min: 640, max: 4000},
    temperatura: {min: 5, max: 25},
  });

  // Función para buscar en los datos de especies
  const searchData = (query: string): SearchResult[] => {
    if (!query || query.length < 2) return [];

    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();
    const seenOrders = new Set<string>();
    const seenFamilies = new Set<string>();
    const seenGenera = new Set<string>();

    for (const especie of especies) {
      // Buscar en órdenes
      if (especie.orden && !seenOrders.has(especie.orden)) {
        if (especie.orden.toLowerCase().includes(lowerQuery)) {
          seenOrders.add(especie.orden);
          results.push({
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
          results.push({
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
          results.push({
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
        results.push({
          id: especie.id_taxon,
          name: especie.nombre_cientifico,
          type: "species",
          path: `/sapopedia/species/${especie.id_taxon}`,
          commonName: especie.nombre_comun,
        });
      }
    }

    return results.slice(0, 10);
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

    const newFilters = {...filters, [key]: newValues};

    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSliderChange = (key: keyof FiltersState, values: number[]) => {
    const newFilters = {...filters, [key]: {min: values[0], max: values[1]}};

    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const resetFilters = () => {
    const resetFiltersState: FiltersState = {
      provincia: [],
      listaRoja: [],
      endemismo: [],
      rangoAltitudinal: {min: 0, max: 4800},
      areaDistribucion: {min: 1, max: 100000},
      ecosistemas: [],
      regionesBiogeograficas: [],
      reservasBiosfera: [],
      bosquesProtegidos: [],
      areasProtegidasEstado: [],
      areasProtegidasPrivadas: [],
      pluviocidad: {min: 640, max: 4000},
      temperatura: {min: 5, max: 25},
    };

    setFilters(resetFiltersState);
    onFiltersChange(resetFiltersState);
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
      .map((item) => (useSigla && item.sigla ? `${item.nombre} (${item.sigla})` : item.nombre));
  };

  // Componente reutilizable para renderizar opciones de catálogo
  const renderCatalogOptions = (
    catalogItems: FilterCatalogs[keyof FilterCatalogs],
    filterKey: keyof FiltersState,
    useSigla = false,
  ) => {
    if (!catalogItems || catalogItems.length === 0) {
      return <p className="py-2 text-xs text-gray-500">No hay opciones disponibles</p>;
    }

    return (
      <div className="flex flex-col gap-2">
        {catalogItems.map((item) => {
          const isSelected = (filters[filterKey] as string[]).includes(item.value);
          const displayLabel =
            useSigla && item.sigla ? `${item.nombre} (${item.sigla})` : item.nombre;

          return (
            <Button
              key={item.id}
              className="h-auto min-h-[32px] w-full justify-start rounded-none px-2 py-1 text-left text-xs break-words whitespace-normal"
              size="sm"
              style={{
                borderColor: isSelected ? undefined : "#e8e8e8",
                color: isSelected ? undefined : "#454545",
              }}
              variant={isSelected ? "default" : "outline"}
              onClick={() => handleCategoricalChange(filterKey, item.value)}
            >
              {displayLabel}
            </Button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="sticky top-0 flex h-screen max-h-screen flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
      {/* Buscador */}
      <div className="flex-shrink-0 border-b border-gray-200 px-6 py-4">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className="relative">
              <Input
                className="w-full"
                placeholder="Buscar especies, géneros, familias..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setOpen(e.target.value.length >= 2);
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
                  <CommandEmpty className="px-4 py-6">No se encontraron resultados.</CommandEmpty>
                )}
                {searchResults.length > 0 && (
                  <CommandGroup>
                    {searchResults.map((result) => (
                      <CommandItem
                        key={`${result.type}-${result.id}-${result.name}`}
                        className="cursor-pointer"
                        onSelect={() => handleSelectResult(result.path)}
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground text-xs">
                              {getTypeLabel(result.type)}
                            </span>
                            <span className="font-medium italic">{result.name}</span>
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
      </div>

      {/* Título y botón de limpiar */}
      <div className="flex-shrink-0 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Filtros</h3>
          <Button size="sm" variant="outline" onClick={resetFilters}>
            Limpiar
          </Button>
        </div>
      </div>

      <div className="filters-panel-scroll min-h-0 flex-1 overflow-y-auto px-6 py-4">
        <Accordion className="w-full" type="multiple">
          {/* Provincias - desde Supabase */}
          {catalogs.provincias.length > 0 && (
            <AccordionItem value="provincia">
              <AccordionTrigger className="!items-start">
                <div className="flex flex-col items-start">
                  <span className="font-semibold uppercase">Provincia</span>
                  {filters.provincia.length > 0 && (
                    <span className="mt-1 text-xs font-normal text-gray-500">
                      {getActiveFilterNames(catalogs.provincias, "provincia").join(", ")}
                    </span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {renderCatalogOptions(catalogs.provincias, "provincia")}
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Lista Roja UICN - desde Supabase */}
          {catalogs.listaRoja.length > 0 && (
            <AccordionItem value="listaRoja">
              <AccordionTrigger className="!items-start">
                <div className="flex flex-col items-start">
                  <span className="font-semibold uppercase">Lista Roja UICN</span>
                  {filters.listaRoja.length > 0 && (
                    <span className="mt-1 text-xs font-normal text-gray-500">
                      {getActiveFilterNames(catalogs.listaRoja, "listaRoja", true).join(", ")}
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
                <span className="font-semibold uppercase">Endemismo</span>
                {filters.endemismo.length > 0 && (
                  <span className="mt-1 text-xs font-normal text-gray-500">
                    {filters.endemismo
                      .map((val) => (val === "endemic" ? "Endémicas" : "No endémicas"))
                      .join(", ")}
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-2">
                {[
                  {value: "endemic", label: "Endémicas"},
                  {value: "non-endemic", label: "No endémicas"},
                ].map((option) => {
                  const isSelected = filters.endemismo.includes(option.value);

                  return (
                    <Button
                      key={option.value}
                      className="h-auto min-h-[32px] w-full justify-start rounded-none px-2 py-1 text-left text-xs"
                      size="sm"
                      style={{
                        borderColor: isSelected ? undefined : "#e8e8e8",
                        color: isSelected ? undefined : "#454545",
                      }}
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

          {/* Pisos Altitudinales con gráfico */}
          <AccordionItem value="pisosAltitudinales">
            <AccordionTrigger className="!items-start">
              <div className="flex flex-col items-start">
                <span className="font-semibold uppercase">Pisos altitudinales</span>
                {(filters.rangoAltitudinal.min !== 0 || filters.rangoAltitudinal.max !== 4800) && (
                  <span className="mt-1 text-xs font-normal text-gray-500">
                    {filters.rangoAltitudinal.min}m - {filters.rangoAltitudinal.max}m
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {/* Gráfico de pisos climáticos */}
                <ClimaticFloorChartFilter
                  altitudinalRange={{
                    min: filters.rangoAltitudinal.min,
                    max: filters.rangoAltitudinal.max,
                  }}
                />

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
                    value={[filters.rangoAltitudinal.min, filters.rangoAltitudinal.max]}
                    onValueChange={(values) => handleSliderChange("rangoAltitudinal", values)}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Área de Distribución */}
          <AccordionItem value="areaDistribucion">
            <AccordionTrigger className="!items-start">
              <div className="flex flex-col items-start">
                <span className="font-semibold uppercase">Área de distribución</span>
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
                  max={100000}
                  min={1}
                  step={100}
                  value={[filters.areaDistribucion.min, filters.areaDistribucion.max]}
                  onValueChange={(values) => handleSliderChange("areaDistribucion", values)}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Ecosistemas - desde Supabase */}
          {catalogs.ecosistemas.length > 0 && (
            <AccordionItem value="ecosistemas">
              <AccordionTrigger className="!items-start">
                <div className="flex flex-col items-start">
                  <span className="font-semibold uppercase">Ecosistemas</span>
                  {filters.ecosistemas.length > 0 && (
                    <span className="mt-1 text-xs font-normal text-gray-500">
                      {getActiveFilterNames(catalogs.ecosistemas, "ecosistemas").join(", ")}
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
                  <span className="font-semibold uppercase">Regiones biogeográficas</span>
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

          {/* Reservas de la Biosfera - desde Supabase */}
          {catalogs.reservasBiosfera.length > 0 && (
            <AccordionItem value="reservasBiosfera">
              <AccordionTrigger className="!items-start">
                <div className="flex flex-col items-start">
                  <span className="font-semibold uppercase">Reservas de la biosfera</span>
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

          {/* Bosques Protegidos - desde Supabase */}
          {catalogs.bosquesProtegidos.length > 0 && (
            <AccordionItem value="bosquesProtegidos">
              <AccordionTrigger className="!items-start">
                <div className="flex flex-col items-start">
                  <span className="font-semibold uppercase">Bosques protegidos</span>
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

          {/* Áreas Protegidas del Estado - desde Supabase */}
          {catalogs.areasProtegidasEstado.length > 0 && (
            <AccordionItem value="areasProtegidasEstado">
              <AccordionTrigger className="!items-start">
                <div className="flex flex-col items-start">
                  <span className="font-semibold uppercase">Áreas protegidas del Estado</span>
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

          {/* Áreas Protegidas Privadas - desde Supabase */}
          {catalogs.areasProtegidasPrivadas.length > 0 && (
            <AccordionItem value="areasProtegidasPrivadas">
              <AccordionTrigger className="!items-start">
                <div className="flex flex-col items-start">
                  <span className="font-semibold uppercase">Áreas protegidas privadas</span>
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

          {/* Pluviocidad */}
          <AccordionItem value="pluviocidad">
            <AccordionTrigger className="!items-start">
              <div className="flex flex-col items-start">
                <span className="font-semibold uppercase">Pluviocidad</span>
                {(filters.pluviocidad.min !== 640 || filters.pluviocidad.max !== 4000) && (
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
                  onValueChange={(values) => handleSliderChange("pluviocidad", values)}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Temperatura */}
          <AccordionItem value="temperatura">
            <AccordionTrigger className="!items-start">
              <div className="flex flex-col items-start">
                <span className="font-semibold uppercase">Temperatura</span>
                {(filters.temperatura.min !== 5 || filters.temperatura.max !== 25) && (
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
                  onValueChange={(values) => handleSliderChange("temperatura", values)}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
