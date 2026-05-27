"use client";

import {useState, useEffect, Suspense} from "react";
import {useSearchParams} from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import {useQuery} from "@tanstack/react-query";
import {Search, X, Mountain, Check, RotateCcw, ExternalLink} from "lucide-react";
import Lightbox, {type Slide} from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import "yet-another-react-lightbox/plugins/counter.css";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import MapotecaTabla from "@/components/MapotecaTabla";
import YearRangeFilter from "@/components/YearRangeFilter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Select is still used for mapType
import {Slider} from "@/components/ui/slider";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
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

// Checkbox reutilizable para los paneles de filtro
function FilterCheckbox({checked}: {checked: boolean}) {
  return (
    <div
      className={[
        "flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-[4px] border-[1.5px]",
        "transition-all duration-150",
        checked
          ? "border-[#4ba24b] bg-[#4ba24b] shadow-[inset_0_1px_2px_rgba(0,0,0,0.12)]"
          : "border-gray-300 bg-white group-hover:border-[#4ba24b] group-hover:bg-[#4ba24b]/5",
      ].join(" ")}
    >
      <Check
        className={[
          "h-[10px] w-[10px] text-white transition-all duration-150",
          checked ? "scale-100 opacity-100" : "scale-50 opacity-0",
        ].join(" ")}
        strokeWidth={3}
      />
    </div>
  );
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

// Componente multi-select para especies
function EspecieMultiSelect({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (val: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const enabled = debouncedQuery.length >= 2;
  const {data: results = [], isFetching: loading} = useQuery<{nombre_cientifico: string}[]>({
    queryKey: ["mapoteca", "especies", debouncedQuery],
    queryFn: async () => {
      const res = await fetch(
        `/api/mapoteca/especies?especie=${encodeURIComponent(debouncedQuery)}`,
      );

      if (!res.ok) return [];
      const data = await res.json();

      return (data as {nombre_cientifico: string}[]).slice(0, 10);
    },
    enabled,
  });

  const toggleEspecie = (nombre: string) => {
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
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              className="w-full pl-10 text-sm"
              placeholder="Especie"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(e.target.value.length >= 2);
              }}
              onFocus={() => {
                if (query.length >= 2) setOpen(true);
              }}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="z-[1100] w-[--radix-popover-trigger-width] p-0"
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
                      className="group cursor-pointer"
                      onSelect={() => {
                        toggleEspecie(r.nombre_cientifico);
                        setQuery("");
                        setOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <FilterCheckbox checked={selected.includes(r.nombre_cientifico)} />
                        <i className="text-sm">{r.nombre_cientifico}</i>
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
              className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] text-green-800 italic"
            >
              {nombre}
              <button type="button" onClick={() => toggleEspecie(nombre)}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
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
  const debouncedQuery = useDebounce(query, 300);
  const enabled = debouncedQuery.length >= 2;
  const {data: options = [], isFetching: loading} = useQuery<string[]>({
    queryKey: ["mapoteca", "catalogos", debouncedQuery],
    queryFn: async () => {
      const res = await fetch(`/api/mapoteca/catalogos?q=${encodeURIComponent(debouncedQuery)}`);

      if (!res.ok) return [];

      return res.json();
    },
    enabled,
  });

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
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              className="w-full pl-10 text-sm"
              placeholder="CJ 10441"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(e.target.value.length >= 2);
              }}
              onFocus={() => {
                if (query.length >= 2) setOpen(true);
              }}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="z-[1100] max-h-[200px] w-[--radix-popover-trigger-width] overflow-y-auto p-0"
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
                      className="group cursor-pointer"
                      onSelect={() => toggleCatalogo(cat)}
                    >
                      <div className="flex items-center gap-2.5">
                        <FilterCheckbox checked={selected.includes(cat)} />
                        <span className="font-mono text-sm">
                          {(() => {
                            const [museo, num] = cat.split("::");
                            const acr = museo?.includes(" - ") ? museo.split(" - ").pop() : museo;

                            return [acr, num].filter(Boolean).join(" ");
                          })()}
                        </span>
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
              className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 font-mono text-[11px] text-orange-800"
            >
              {(() => {
                const [museo, num] = cat.split("::");
                const acr = museo?.includes(" - ") ? museo.split(" - ").pop() : museo;

                return [acr, num].filter(Boolean).join(" ");
              })()}
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
  const debouncedQuery = useDebounce(query, 300);
  const enabled = debouncedQuery.length >= 2;
  const {data: options = [], isFetching: loading} = useQuery<string[]>({
    queryKey: ["mapoteca", "localidades", debouncedQuery],
    queryFn: async () => {
      const res = await fetch(`/api/mapoteca/localidades?q=${encodeURIComponent(debouncedQuery)}`);

      if (!res.ok) return [];

      return res.json();
    },
    enabled,
  });

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
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              className="w-full pl-10 text-sm"
              placeholder="Localidad"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(e.target.value.length >= 2);
              }}
              onFocus={() => {
                if (query.length >= 2) setOpen(true);
              }}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="z-[1100] max-h-[200px] w-[--radix-popover-trigger-width] overflow-y-auto p-0"
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
                      className="group cursor-pointer"
                      onSelect={() => toggleLocalidad(loc)}
                    >
                      <div className="flex items-center gap-2.5">
                        <FilterCheckbox checked={selected.includes(loc)} />
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

  const filtered =
    query.length > 0
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
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              className="w-full pl-10 text-sm"
              placeholder="Provincia"
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
          className="z-[1100] max-h-[200px] w-[--radix-popover-trigger-width] overflow-y-auto p-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command>
            <CommandList>
              {filtered.length === 0 && (
                <CommandEmpty className="px-4 py-3 text-sm text-gray-400">
                  Sin resultados.
                </CommandEmpty>
              )}
              {filtered.length > 0 && (
                <CommandGroup>
                  {filtered.map((p) => (
                    <CommandItem
                      key={p.id}
                      className="group cursor-pointer"
                      onSelect={() => toggleProvincia(p.nombre)}
                    >
                      <div className="flex items-center gap-2.5">
                        <FilterCheckbox checked={selected.includes(p.nombre)} />
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
function MapotecaContent({
  provinciaFilter,
  setProvinciaFilter,
  pisoFilter,
  setPisoFilter,
  snapFilter,
  setSnapFilter,
}: {
  provinciaFilter: string[];
  setProvinciaFilter: (v: string[]) => void;
  pisoFilter: string[];
  setPisoFilter: (v: string[]) => void;
  snapFilter: string[];
  setSnapFilter: (v: string[]) => void;
}) {
  const searchParams = useSearchParams();
  const especieFromUrl = searchParams.get("especie") || "";

  // Restaurar estado desde sessionStorage si existe
  const getStoredState = () => {
    if (typeof window === "undefined") return null;
    const stored = sessionStorage.getItem("mapotecaState");

    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }

    return null;
  };

  const storedState = getStoredState();
  const [especieFilter, setEspecieFilter] = useState<string[]>(
    storedState?.especieFilter || (especieFromUrl ? [especieFromUrl] : []),
  );
  const [catalogoFilter, setCatalogoFilter] = useState<string[]>(storedState?.catalogoFilter || []);
  const [localidadesFilter, setLocalidadesFilter] = useState<string[]>(
    storedState?.localidadesFilter || [],
  );
  const [elevacionRange, setElevacionRange] = useState<[number, number]>(
    storedState?.elevacionRange || [0, 5000],
  );
  const [elevacionActive, setElevacionActive] = useState<boolean>(
    storedState?.elevacionActive || false,
  );
  const [anioDesde, setAnioDesde] = useState<string>(storedState?.anioDesde || "");
  const [anioHasta, setAnioHasta] = useState<string>(storedState?.anioHasta || "");
  const [anioEspecifico, setAnioEspecifico] = useState<string>(storedState?.anioEspecifico || "");

  // Calcular fechas desde/hasta a partir de años
  const fechaDesde = anioEspecifico
    ? `${anioEspecifico}-01-01`
    : anioDesde
      ? `${anioDesde}-01-01`
      : "";
  const fechaHasta = anioEspecifico
    ? `${anioEspecifico}-12-31`
    : anioHasta
      ? `${anioHasta}-12-31`
      : "";
  const [mapType, setMapType] = useState<
    "relief" | "terrain" | "provinces" | "satellite" | "streets"
  >(storedState?.mapType || "provinces");
  const [provincias, setProvincias] = useState<ProvinciaOption[]>([]);

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
    setPisoFilter([]);
    setSnapFilter([]);
    setEspecieFilter([]);
    setCatalogoFilter([]);
    setLocalidadesFilter([]);
    setElevacionRange([0, 5000]);
    setElevacionActive(false);
    setAnioDesde("");
    setAnioHasta("");
    setAnioEspecifico("");
  };

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
          anioDesde,
          anioHasta,
          anioEspecifico,
          mapType,
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
            style={{color: "#16a34a", fontSize: "14px"}}
          >
            <span>←</span>
            <span>Volver a la ficha de la especie</span>
          </Link>
        </div>
      )}

      <div className="container mx-auto px-4 pb-6">
        <div className="flex gap-4">
          {/* Panel lateral de filtros - Desktop */}
          <div className="hidden w-80 min-w-[320px] lg:block">
            <div
              className="sticky top-4 flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
              style={{maxHeight: "calc(100vh - 120px)"}}
            >
              <div className="flex-1 overflow-y-auto py-4">
                <div className="w-full space-y-5">
                  {/* Limpiar - top derecha */}
                  <div className="flex justify-end px-4">
                    <Button
                      className="w-auto gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-normal text-gray-700 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50"
                      type="button"
                      variant="ghost"
                      onClick={clearFilters}
                    >
                      <RotateCcw className="h-3.5 w-3.5 shrink-0 text-black" />
                      Limpiar
                    </Button>
                  </div>

                  <div className="space-y-5 px-4">
                    <EspecieMultiSelect selected={especieFilter} onChange={setEspecieFilter} />
                    <CatalogoMultiSelect selected={catalogoFilter} onChange={setCatalogoFilter} />
                    <LocalidadMultiSelect
                      selected={localidadesFilter}
                      onChange={setLocalidadesFilter}
                    />
                    <ProvinciaMultiSelect
                      provincias={provincias}
                      selected={provinciaFilter}
                      onChange={setProvinciaFilter}
                    />

                    {/* Elevación */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-gray-600">
                          Elevación (msnm)
                        </label>
                        <button
                          className={`rounded px-1.5 py-0.5 text-[10px] ${elevacionActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                          onClick={() => setElevacionActive(!elevacionActive)}
                        >
                          {elevacionActive ? "Activo" : "Inactivo"}
                        </button>
                      </div>
                      <Slider
                        className="w-full"
                        max={5000}
                        min={0}
                        step={50}
                        value={elevacionRange}
                        onValueChange={(v) => {
                          setElevacionRange(v as [number, number]);
                          if (!elevacionActive) setElevacionActive(true);
                        }}
                      />
                      <div className="flex justify-between text-[10px] text-gray-400">
                        <span>{elevacionRange[0]} m</span>
                        <span>{elevacionRange[1]} m</span>
                      </div>
                    </div>

                    {/* Filtro por año */}
                    <YearRangeFilter
                      desde={anioDesde}
                      hasta={anioHasta}
                      yearMax={new Date().getFullYear()}
                      yearMin={1970}
                      onChange={(d, h) => {
                        setAnioDesde(d);
                        setAnioHasta(h);
                        if (anioEspecifico) setAnioEspecifico("");
                      }}
                    />

                    {/* Tipo de mapa */}
                    <div className="space-y-4">
                      <label className="block text-xs font-semibold text-gray-600">
                        Tipo de mapa
                      </label>
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
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mapa */}
          <div className="min-w-0 flex-1">
            {/* Controles móviles */}
            <div className="mb-3 flex items-center gap-2 lg:hidden">
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

            {/* Mapa */}
            <div className="h-[calc(100vh-180px)]">
              <MapotecaMap
                catalogoFilter={catalogoFilter.length > 0 ? catalogoFilter : undefined}
                elevacionMax={elevacionActive ? elevacionRange[1] : undefined}
                elevacionMin={elevacionActive ? elevacionRange[0] : undefined}
                especieFilter={especieFilter.length > 0 ? especieFilter : undefined}
                fechaDesde={fechaDesde || undefined}
                fechaHasta={fechaHasta || undefined}
                localidadesFilter={localidadesFilter.length > 0 ? localidadesFilter : undefined}
                mapType={mapType}
                pisoFilter={pisoFilter.length > 0 ? pisoFilter : undefined}
                provinciaFilter={provinciaFilter.length > 0 ? provinciaFilter : undefined}
                snapFilter={snapFilter.length > 0 ? snapFilter : undefined}
                onNavigateToSpecies={saveState}
              />
            </div>

            {/* Tabla de especies */}
            <div className="mt-4">
              <MapotecaTabla
                catalogoFilter={catalogoFilter.length > 0 ? catalogoFilter : undefined}
                elevacionMax={elevacionActive ? elevacionRange[1] : undefined}
                elevacionMin={elevacionActive ? elevacionRange[0] : undefined}
                especieFilter={especieFilter.length > 0 ? especieFilter : undefined}
                localidadesFilter={localidadesFilter.length > 0 ? localidadesFilter : undefined}
                pisoFilter={pisoFilter.length > 0 ? pisoFilter : undefined}
                provinciaFilter={provinciaFilter.length > 0 ? provinciaFilter : undefined}
                snapFilter={snapFilter.length > 0 ? snapFilter : undefined}
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

const MAPOTECA_CARDS: {
  title: string;
  subtitle?: string;
  href: string;
  citation?: {label: string; url: string};
}[] = [
  {
    title: "Mapa especies por provincias",
    href: "https://deepskyblue-beaver-511675.hostingersite.com/wp-content/uploads/2026/05/EcuadorNumberSpeciesProvinces.webp",
  },
  {
    title: "Nombres renacuajos",
    href: "https://deepskyblue-beaver-511675.hostingersite.com/wp-content/uploads/2026/02/Mapa-Nombres-renacuajos-scaled.jpg",
  },
  {
    title: "Rana toro",
    subtitle: "Aquarana catesbeiana",
    href: "https://deepskyblue-beaver-511675.hostingersite.com/wp-content/uploads/2026/03/Figure-54-scaled.webp",
  },
  {
    title: "Sectores biogeográficos",
    href: "https://deepskyblue-beaver-511675.hostingersite.com/wp-content/uploads/2026/05/EcuadorBiogeographicSectors.webp",
  },
  {
    title: "Mapa deforestación",
    href: "https://deepskyblue-beaver-511675.hostingersite.com/wp-content/uploads/2026/04/Figure-31-1-scaled.webp",
    citation: {
      label: "MAE, 2023",
      url: "http://ide.ambiente.gob.ec:8080/mapainteractivo/",
    },
  },
  {
    title: "Especies amenazadas minería",
    href: "https://deepskyblue-beaver-511675.hostingersite.com/wp-content/uploads/2026/05/EcuadorMuseumRecordsOverlapMiningConcessions.webp",
  },
  {
    title: "Otros mapas MAE",
    href: "https://deepskyblue-beaver-511675.hostingersite.com/wp-content/uploads/2026/05/EcuadorBioclimas.webp",
    citation: {
      label: "MAE, 2023",
      url: "http://ide.ambiente.gob.ec:8080/mapainteractivo/",
    },
  },
];

const PUBLICACION_URL =
  "https://www.routledge.com/An-Introduction-to-the-Amphibians-of-Ecuador-Diversity-Conservation-and-Cultural-History/Coloma-Duellman/p/book/9780367653569";

function CitationLink({label, url}: {label: string; url: string}) {
  return (
    <a
      className="citation-link"
      href={url}
      rel="noopener noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: 6,
        fontSize: 20,
        fontWeight: 600,
        textDecoration: "none",
        transition: "color 200ms",
      }}
      target="_blank"
    >
      {label}
      <ExternalLink size={18} style={{transform: "translateY(3px)"}} />
    </a>
  );
}

// Página principal
export default function MapotecaPage() {
  const [provinciaFilter, setProvinciaFilter] = useState<string[]>([]);
  const [pisoFilter, setPisoFilter] = useState<string[]>([]);
  const [snapFilter, setSnapFilter] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number>(-1);

  const mapSlides: Slide[] = MAPOTECA_CARDS.map((card) => ({
    src: card.href,
    alt: card.title,
    title: (
      <span
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 4,
          fontSize: 20,
          paddingLeft: 56,
        }}
      >
        <span>{card.title}</span>
        <CitationLink
          label={card.citation?.label ?? "Coloma & Duellman, 2024"}
          url={card.citation?.url ?? PUBLICACION_URL}
        />
      </span>
    ),
    description: card.subtitle,
  }));

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Mapoteca</h1>
        </div>
      </div>

      {/* Tarjetas destacadas */}
      <div className="container mx-auto px-4 pb-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
          {MAPOTECA_CARDS.map((card, index) => (
            <button
              key={card.title}
              className="group flex cursor-pointer flex-col overflow-hidden rounded-md border text-center transition-shadow hover:shadow-md"
              style={{borderColor: "#dddddd"}}
              type="button"
              onClick={() => setLightboxIndex(index)}
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-gray-50">
                <img
                  alt={card.title}
                  className="h-full w-full object-cover grayscale transition-[filter] duration-700 ease-in-out group-hover:grayscale-0"
                  loading="lazy"
                  src={card.href}
                />
              </div>
              <div className="flex flex-1 flex-col items-center justify-center p-2">
                <span className="text-sm font-semibold" style={{color: "#666666"}}>
                  {card.title}
                </span>
                {card.subtitle && (
                  <i className="mt-0.5 text-xs" style={{color: "#888888"}}>
                    {card.subtitle}
                  </i>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <Lightbox
        captions={{descriptionTextAlign: "start", descriptionMaxLines: 4}}
        close={() => setLightboxIndex(-1)}
        controller={{closeOnBackdropClick: true}}
        counter={{container: {style: {top: 0, bottom: "unset"}}}}
        index={lightboxIndex < 0 ? 0 : lightboxIndex}
        open={lightboxIndex >= 0}
        plugins={[Captions, Counter, Fullscreen, Zoom]}
        slides={mapSlides}
        zoom={{maxZoomPixelRatio: 4, scrollToZoom: true}}
      />

      <Suspense fallback={<MapotecaLoading />}>
        <MapotecaContent
          pisoFilter={pisoFilter}
          provinciaFilter={provinciaFilter}
          setPisoFilter={setPisoFilter}
          setProvinciaFilter={setProvinciaFilter}
          setSnapFilter={setSnapFilter}
          snapFilter={snapFilter}
        />
      </Suspense>
    </div>
  );
}
