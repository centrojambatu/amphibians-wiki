"use client";

import {useState, useEffect, Suspense} from "react";
import {useSearchParams} from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import {Search, X, Mountain, MapPin, RotateCcw, SlidersHorizontal, Check} from "lucide-react";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Select is still used for mapType
import {Slider} from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// Cargar el mapa dinámicamente para evitar SSR con Leaflet
const MapotecaMap = dynamic(() => import("@/components/MapotecaMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center rounded-lg bg-gray-100">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
        <p className="text-muted-foreground">Cargando mapa...</p>
      </div>
    </div>
  ),
});

interface ProvinciaOption {
  id: number;
  nombre: string;
  value: string;
}

// Hook para debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

// Componente de autocompletado para especies
function EspecieAutocomplete({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<{nombre_cientifico: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const fetchResults = async () => {
      try {
        const res = await fetch(`/api/mapoteca/especies?especie=${encodeURIComponent(debouncedQuery)}`);
        if (!res.ok) return;
        const data = await res.json();
        setResults(data.slice(0, 10));
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [debouncedQuery]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            className="w-full pl-10 text-sm"
            placeholder="Ej: Atelopus, Pristimantis..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(e.target.value.length >= 2);
              if (e.target.value === "") onChange("");
            }}
            onFocus={() => { if (query.length >= 2) setOpen(true); }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onChange(query);
                setOpen(false);
              }
            }}
          />
          {query && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => { setQuery(""); onChange(""); }}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[--radix-popover-trigger-width] p-0 z-[1100]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command>
          <CommandList>
            {results.length === 0 && debouncedQuery.length >= 2 && (
              <CommandEmpty className="px-4 py-3 text-sm text-gray-400">
                {loading ? "Buscando..." : "Sin resultados."}
              </CommandEmpty>
            )}
            {results.length > 0 && (
              <CommandGroup>
                {results.map((r) => (
                  <CommandItem
                    key={r.nombre_cientifico}
                    className="cursor-pointer"
                    onSelect={() => {
                      setQuery(r.nombre_cientifico);
                      onChange(r.nombre_cientifico);
                      setOpen(false);
                    }}
                  >
                    <i className="text-sm">{r.nombre_cientifico}</i>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Componente multi-select para catálogos
function CatalogoMultiSelect({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (val: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setOptions([]);
      return;
    }
    setLoading(true);
    const fetchCatalogos = async () => {
      try {
        const res = await fetch(`/api/mapoteca/catalogos?q=${encodeURIComponent(debouncedQuery)}`);
        if (!res.ok) return;
        const data = await res.json();
        setOptions(data);
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    };
    fetchCatalogos();
  }, [debouncedQuery]);

  const toggleCatalogo = (cat: string) => {
    if (selected.includes(cat)) {
      onChange(selected.filter((s) => s !== cat));
    } else {
      onChange([...selected, cat]);
    }
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              className="w-full pl-10 text-sm"
              placeholder="Ej: CJ 8405, QCAZ..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(e.target.value.length >= 2);
              }}
              onFocus={() => { if (query.length >= 2) setOpen(true); }}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[--radix-popover-trigger-width] p-0 z-[1100] max-h-[200px] overflow-y-auto"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command>
            <CommandList>
              {options.length === 0 && debouncedQuery.length >= 2 && (
                <CommandEmpty className="px-4 py-3 text-sm text-gray-400">
                  {loading ? "Buscando..." : "Sin resultados."}
                </CommandEmpty>
              )}
              {options.length > 0 && (
                <CommandGroup>
                  {options.map((cat) => (
                    <CommandItem
                      key={cat}
                      className="cursor-pointer"
                      onSelect={() => toggleCatalogo(cat)}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`h-4 w-4 rounded border flex items-center justify-center ${selected.includes(cat) ? "bg-green-600 border-green-600" : "border-gray-300"}`}>
                          {selected.includes(cat) && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className="text-sm font-mono">{cat}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map((cat) => (
            <span
              key={cat}
              className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[11px] text-orange-800 font-mono"
            >
              {cat}
              <button type="button" onClick={() => toggleCatalogo(cat)}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Componente multi-select para localidades
function LocalidadMultiSelect({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (val: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setOptions([]);
      return;
    }
    setLoading(true);
    const fetchLocalidades = async () => {
      try {
        const res = await fetch(`/api/mapoteca/localidades?q=${encodeURIComponent(debouncedQuery)}`);
        if (!res.ok) return;
        const data = await res.json();
        setOptions(data);
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    };
    fetchLocalidades();
  }, [debouncedQuery]);

  const toggleLocalidad = (loc: string) => {
    if (selected.includes(loc)) {
      onChange(selected.filter((s) => s !== loc));
    } else {
      onChange([...selected, loc]);
    }
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              className="w-full pl-10 text-sm"
              placeholder="Buscar localidad..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(e.target.value.length >= 2);
              }}
              onFocus={() => { if (query.length >= 2) setOpen(true); }}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[--radix-popover-trigger-width] p-0 z-[1100] max-h-[200px] overflow-y-auto"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command>
            <CommandList>
              {options.length === 0 && debouncedQuery.length >= 2 && (
                <CommandEmpty className="px-4 py-3 text-sm text-gray-400">
                  {loading ? "Buscando..." : "Sin resultados."}
                </CommandEmpty>
              )}
              {options.length > 0 && (
                <CommandGroup>
                  {options.map((loc) => (
                    <CommandItem
                      key={loc}
                      className="cursor-pointer"
                      onSelect={() => toggleLocalidad(loc)}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`h-4 w-4 rounded border flex items-center justify-center ${selected.includes(loc) ? "bg-green-600 border-green-600" : "border-gray-300"}`}>
                          {selected.includes(loc) && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className="text-sm">{loc}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map((loc) => (
            <span
              key={loc}
              className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] text-green-800"
            >
              {loc.length > 25 ? loc.slice(0, 25) + "..." : loc}
              <button onClick={() => toggleLocalidad(loc)}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Componente multi-select para provincias (lista pre-cargada, filtro local)
function ProvinciaMultiSelect({
  provincias,
  selected,
  onChange,
}: {
  provincias: ProvinciaOption[];
  selected: string[];
  onChange: (val: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = query.length > 0
    ? provincias.filter((p) => p.nombre.toLowerCase().includes(query.toLowerCase()))
    : provincias;

  const toggleProvincia = (nombre: string) => {
    if (selected.includes(nombre)) {
      onChange(selected.filter((s) => s !== nombre));
    } else {
      onChange([...selected, nombre]);
    }
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              className="w-full pl-10 text-sm"
              placeholder="Buscar provincia..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[--radix-popover-trigger-width] p-0 z-[1100] max-h-[200px] overflow-y-auto"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command>
            <CommandList>
              {filtered.length === 0 && (
                <CommandEmpty className="px-4 py-3 text-sm text-gray-400">Sin resultados.</CommandEmpty>
              )}
              {filtered.length > 0 && (
                <CommandGroup>
                  {filtered.map((p) => (
                    <CommandItem
                      key={p.id}
                      className="cursor-pointer"
                      onSelect={() => toggleProvincia(p.nombre)}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`h-4 w-4 rounded border flex items-center justify-center ${selected.includes(p.nombre) ? "bg-green-600 border-green-600" : "border-gray-300"}`}>
                          {selected.includes(p.nombre) && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className="text-sm">{p.nombre}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map((nombre) => (
            <span
              key={nombre}
              className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[11px] text-blue-800"
            >
              {nombre}
              <button type="button" onClick={() => toggleProvincia(nombre)}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Componente interno que usa useSearchParams
function MapotecaContent() {
  const searchParams = useSearchParams();
  const especieFromUrl = searchParams.get("especie") || "";

  // Restaurar estado desde sessionStorage si existe
  const getStoredState = () => {
    if (typeof window === "undefined") return null;
    const stored = sessionStorage.getItem("mapotecaState");
    if (stored) {
      try { return JSON.parse(stored); } catch { return null; }
    }
    return null;
  };

  const storedState = getStoredState();

  const [provinciaFilter, setProvinciaFilter] = useState<string[]>(storedState?.provinciaFilter || []);
  const [especieFilter, setEspecieFilter] = useState<string>(storedState?.especieFilter || especieFromUrl);
  const [catalogoFilter, setCatalogoFilter] = useState<string[]>(storedState?.catalogoFilter || []);
  const [localidadesFilter, setLocalidadesFilter] = useState<string[]>(storedState?.localidadesFilter || []);
  const [elevacionRange, setElevacionRange] = useState<[number, number]>(storedState?.elevacionRange || [0, 5000]);
  const [elevacionActive, setElevacionActive] = useState<boolean>(storedState?.elevacionActive || false);
  const [mapType, setMapType] = useState<"relief" | "terrain" | "provinces" | "satellite" | "streets">(storedState?.mapType || "provinces");
  const [showFilters, setShowFilters] = useState<boolean>(storedState?.showFilters !== undefined ? storedState.showFilters : true);
  const [provincias, setProvincias] = useState<ProvinciaOption[]>([]);
  const [maxPuntos, setMaxPuntos] = useState<number>(storedState?.maxPuntos || 1000);

  // Limpiar sessionStorage después de restaurar
  useEffect(() => {
    if (storedState) sessionStorage.removeItem("mapotecaState");
  }, []);

  // Cargar provincias al montar
  useEffect(() => {
    fetch("/api/mapoteca/provincias")
      .then((r) => r.json())
      .then(setProvincias)
      .catch(() => {});
  }, []);

  const clearFilters = () => {
    setProvinciaFilter([]);
    setEspecieFilter("");
    setCatalogoFilter([]);
    setLocalidadesFilter([]);
    setElevacionRange([0, 5000]);
    setElevacionActive(false);
  };

  const hasActiveFilters = provinciaFilter.length > 0 || especieFilter || catalogoFilter.length > 0 || localidadesFilter.length > 0 || elevacionActive;

  // Link de regreso a la ficha
  const speciesSlug = especieFromUrl ? especieFromUrl.replaceAll(" ", "-") : "";

  const saveState = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "mapotecaState",
        JSON.stringify({
          provinciaFilter,
          especieFilter,
          catalogoFilter,
          localidadesFilter,
          elevacionRange,
          elevacionActive,
          mapType,
          showFilters,
          maxPuntos,
        }),
      );
    }
  };

  return (
    <>
      {especieFromUrl && (
        <div className="container mx-auto px-4 pb-2">
          <Link
            className="inline-flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-80"
            href={`/sapopedia/species/${speciesSlug}`}
            style={{ color: "#16a34a", fontSize: "14px" }}
          >
            <span>←</span>
            <span>Volver a la ficha de la especie</span>
          </Link>
        </div>
      )}

      <div className="container mx-auto px-4 pb-6">
        <div className="flex gap-4">
          {/* Panel lateral de filtros - Desktop */}
          <div className={`hidden lg:block transition-all ${showFilters ? "w-80 min-w-[320px]" : "w-0 min-w-0 overflow-hidden"}`}>
            {showFilters && (
              <div className="sticky top-4 flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden" style={{ maxHeight: "calc(100vh - 120px)" }}>
                {/* Header */}
                <div className="flex-shrink-0 border-b border-gray-200 px-4 py-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Filtros</span>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={clearFilters}
                      className="h-auto gap-1 px-2 py-1 text-xs font-normal text-gray-500 hover:text-gray-700"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Limpiar
                    </Button>
                  </div>
                </div>

                {/* Filtros con scroll */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5">
                  {/* Especie */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">Especie</label>
                    <EspecieAutocomplete value={especieFilter} onChange={setEspecieFilter} />
                  </div>

                  {/* Catálogo */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">Catálogo de museo</label>
                    <CatalogoMultiSelect selected={catalogoFilter} onChange={setCatalogoFilter} />
                  </div>

                  {/* Localidad */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">Localidad</label>
                    <LocalidadMultiSelect selected={localidadesFilter} onChange={setLocalidadesFilter} />
                  </div>

                  {/* Provincia */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">Provincia</label>
                    <ProvinciaMultiSelect
                      provincias={provincias}
                      selected={provinciaFilter}
                      onChange={setProvinciaFilter}
                    />
                  </div>

                  {/* Elevación */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-gray-600">Elevación (msnm)</label>
                      <button
                        className={`text-[10px] px-1.5 py-0.5 rounded ${elevacionActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                        onClick={() => setElevacionActive(!elevacionActive)}
                      >
                        {elevacionActive ? "Activo" : "Inactivo"}
                      </button>
                    </div>
                    <Slider
                      min={0}
                      max={5000}
                      step={50}
                      value={elevacionRange}
                      onValueChange={(v) => {
                        setElevacionRange(v as [number, number]);
                        if (!elevacionActive) setElevacionActive(true);
                      }}
                      className="w-full"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>{elevacionRange[0]} m</span>
                      <span>{elevacionRange[1]} m</span>
                    </div>
                  </div>

                  {/* Tipo de mapa */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">Tipo de mapa</label>
                    <Select value={mapType} onValueChange={(v: any) => setMapType(v)}>
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-[1100]">
                        <SelectItem value="relief">Relieve</SelectItem>
                        <SelectItem value="terrain">Topográfico</SelectItem>
                        <SelectItem value="provinces">Estándar</SelectItem>
                        <SelectItem value="satellite">Satélite</SelectItem>
                        <SelectItem value="streets">Minimalista</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Puntos a mostrar */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">
                      <MapPin className="mr-1 inline h-3.5 w-3.5" />
                      Puntos: {maxPuntos.toLocaleString()}
                    </label>
                    <Slider
                      value={[maxPuntos]}
                      onValueChange={(v) => setMaxPuntos(v[0])}
                      min={100}
                      max={60000}
                      step={100}
                      className="w-full"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>100</span>
                      <span>60,000</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mapa */}
          <div className="flex-1 min-w-0">
            {/* Barra superior con botón de filtros y controles móviles */}
            <div className="mb-3 flex items-center justify-between gap-2">
              <Button
                size="sm"
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className="gap-1.5"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filtros
                {hasActiveFilters && (
                  <span className="ml-1 rounded-full bg-white/20 px-1.5 text-[10px]">
                    {[provinciaFilter, especieFilter, catalogoFilter.length > 0 ? "cat" : "", localidadesFilter.length > 0 ? "loc" : "", elevacionActive ? "elev" : ""].filter(Boolean).length}
                  </span>
                )}
              </Button>

              {/* Filtros móviles inline */}
              <div className="flex items-center gap-2 lg:hidden">
                <Mountain className="text-muted-foreground h-4 w-4" />
                <Select value={mapType} onValueChange={(v: any) => setMapType(v)}>
                  <SelectTrigger className="w-[130px] text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[1100]">
                    <SelectItem value="relief">Relieve</SelectItem>
                    <SelectItem value="terrain">Topográfico</SelectItem>
                    <SelectItem value="provinces">Estándar</SelectItem>
                    <SelectItem value="satellite">Satélite</SelectItem>
                    <SelectItem value="streets">Minimalista</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filtros móviles expandibles */}
            {showFilters && (
              <div className="mb-3 rounded-lg border bg-white p-4 shadow-sm lg:hidden">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">Especie</label>
                    <EspecieAutocomplete value={especieFilter} onChange={setEspecieFilter} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">Catálogo</label>
                    <CatalogoMultiSelect selected={catalogoFilter} onChange={setCatalogoFilter} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">Localidad</label>
                    <LocalidadMultiSelect selected={localidadesFilter} onChange={setLocalidadesFilter} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">Provincia</label>
                    <ProvinciaMultiSelect
                      provincias={provincias}
                      selected={provinciaFilter}
                      onChange={setProvinciaFilter}
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-gray-600">Elevación</label>
                    <Slider min={0} max={5000} step={50} value={elevacionRange} onValueChange={(v) => { setElevacionRange(v as [number, number]); if (!elevacionActive) setElevacionActive(true); }} />
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>{elevacionRange[0]} m</span>
                      <span>{elevacionRange[1]} m</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">Puntos: {maxPuntos.toLocaleString()}</label>
                    <Slider value={[maxPuntos]} onValueChange={(v) => setMaxPuntos(v[0])} min={100} max={60000} step={100} />
                  </div>
                  <div className="flex items-end">
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={clearFilters}>
                      <RotateCcw className="mr-1 h-3.5 w-3.5" /> Limpiar
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Mapa */}
            <div className="h-[calc(100vh-180px)]">
              <MapotecaMap
                especieFilter={especieFilter}
                catalogoFilter={catalogoFilter.length > 0 ? catalogoFilter : undefined}
                localidadesFilter={localidadesFilter.length > 0 ? localidadesFilter : undefined}
                elevacionMin={elevacionActive ? elevacionRange[0] : undefined}
                elevacionMax={elevacionActive ? elevacionRange[1] : undefined}
                mapType={mapType}
                maxPuntos={maxPuntos}
                provinciaFilter={provinciaFilter.length > 0 ? provinciaFilter : undefined}
                onNavigateToSpecies={saveState}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Componente de carga para el Suspense
function MapotecaLoading() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex h-[600px] items-center justify-center rounded-lg bg-gray-100">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
          <p className="text-muted-foreground">Cargando mapa...</p>
        </div>
      </div>
    </div>
  );
}

// Página principal
export default function MapotecaPage() {
  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Mapoteca</h1>
          <p className="text-muted-foreground mt-1">
            Mapa interactivo de distribución de anfibios en Ecuador
          </p>
        </div>
      </div>

      <Suspense fallback={<MapotecaLoading />}>
        <MapotecaContent />
      </Suspense>
    </div>
  );
}
