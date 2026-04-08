"use client";

import {useState, useEffect, useTransition, Suspense} from "react";
import {useSearchParams} from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import {Search, X, Mountain, Check, RotateCcw} from "lucide-react";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card, CardContent} from "@/components/ui/card";
import MapotecaHistogramaChart from "@/components/mapoteca-histograma-chart";
import MapotecaTabla from "@/components/MapotecaTabla";
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
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              className="w-full pl-10 text-sm"
              placeholder="Especie"
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
                        toggleEspecie(r.nombre_cientifico);
                        setQuery("");
                        setOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`h-4 w-4 rounded border flex items-center justify-center ${selected.includes(r.nombre_cientifico) ? "bg-green-600 border-green-600" : "border-gray-300"}`}>
                          {selected.includes(r.nombre_cientifico) && <Check className="h-3 w-3 text-white" />}
                        </div>
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
              placeholder="Museo"
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
              placeholder="Localidad"
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

interface MapStats {
  provincia: { name: string; total: number };
  biogeografico: { name: string; total: number };
  ecosistema: { name: string; total: number };
  piso: { name: string; total: number };
  snap: { name: string; total: number };
  histogramaProvincias: { name: string; total: number }[];
}

function StatCards({
  activeProvincias,
  onProvinciaClick,
  activePisos,
  onPisoClick,
  activeSnaps,
  onSnapClick,
}: {
  activeProvincias: string[];
  onProvinciaClick: (name: string) => void;
  activePisos: string[];
  onPisoClick: (name: string) => void;
  activeSnaps: string[];
  onSnapClick: (name: string) => void;
}) {
  const [stats, setStats] = useState<MapStats | null>(null);

  useEffect(() => {
    fetch("/api/mapoteca/estadisticas")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <div className="container mx-auto px-4 pb-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 sm:gap-4">

        {/* Distribución — link */}
        <a
          href="https://deepskyblue-beaver-511675.hostingersite.com/distribucion/"
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Card className="min-w-0 cursor-pointer overflow-visible transition-shadow hover:shadow-md">
            <CardContent className="pt-4">
              <p className="text-3xl font-bold tabular-nums sm:text-4xl">→</p>
              <p className="break-words text-muted-foreground text-xs sm:text-sm">
                Distribución
              </p>
            </CardContent>
          </Card>
        </a>

        {/* Provincia más diversa */}
        <Card className="min-w-0 overflow-visible transition-shadow hover:shadow-md">
          <CardContent className="pt-4">
            <p className="text-3xl font-bold tabular-nums sm:text-4xl">
              {stats ? stats.provincia.total.toLocaleString() : "—"}
            </p>
            <p className="break-words text-muted-foreground text-xs sm:text-sm">
              Especies en provincia más diversa
            </p>
            {stats?.provincia.name && (
              <p className="mt-0.5 line-clamp-1 text-[10px] font-medium text-foreground sm:text-xs">
                {stats.provincia.name}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Región Biogeográfica más diversa */}
        <Card className="min-w-0 overflow-visible transition-shadow hover:shadow-md">
          <CardContent className="pt-4">
            <p className="text-3xl font-bold tabular-nums sm:text-4xl">
              {stats ? stats.biogeografico.total.toLocaleString() : "—"}
            </p>
            <p className="break-words text-muted-foreground text-xs sm:text-sm">
              Especies en región biogeográfica más diversa
            </p>
            {stats?.biogeografico.name && (
              <p className="mt-0.5 line-clamp-2 text-[10px] font-medium text-foreground sm:text-xs">
                {stats.biogeografico.name}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Ecosistema más diverso */}
        <Card className="min-w-0 overflow-visible transition-shadow hover:shadow-md">
          <CardContent className="pt-4">
            <p className="text-3xl font-bold tabular-nums sm:text-4xl">
              {stats ? stats.ecosistema.total.toLocaleString() : "—"}
            </p>
            <p className="break-words text-muted-foreground text-xs sm:text-sm">
              Especies en ecosistema más diverso
            </p>
            {stats?.ecosistema.name && (
              <p className="mt-0.5 line-clamp-2 text-[10px] font-medium text-foreground sm:text-xs">
                {stats.ecosistema.name}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Piso altitudinal más diverso */}
        {stats?.piso.name ? (
          <Card
            className={`min-w-0 overflow-visible transition-shadow cursor-pointer hover:shadow-md ${activePisos.includes(stats.piso.name) ? "ring-2 ring-[#f07304] bg-orange-50" : ""}`}
            onClick={() => onPisoClick(stats.piso.name)}
          >
            <CardContent className="pt-4">
              <p className="text-3xl font-bold tabular-nums sm:text-4xl">
                {stats.piso.total.toLocaleString()}
              </p>
              <p className="break-words text-muted-foreground text-xs sm:text-sm">
                Especies en piso altitudinal más diverso
              </p>
              <p className="mt-0.5 line-clamp-1 text-[10px] font-medium text-foreground sm:text-xs">
                {stats.piso.name}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="min-w-0 overflow-visible transition-shadow hover:shadow-md">
            <CardContent className="pt-4">
              <p className="text-3xl font-bold tabular-nums sm:text-4xl">—</p>
              <p className="break-words text-muted-foreground text-xs sm:text-sm">
                Especies en piso altitudinal más diverso
              </p>
            </CardContent>
          </Card>
        )}

        {/* Área SNAP más diversa */}
        {stats?.snap.name ? (
          <Card
            className={`min-w-0 overflow-visible transition-shadow cursor-pointer hover:shadow-md ${activeSnaps.includes(stats.snap.name) ? "ring-2 ring-[#f07304] bg-orange-50" : ""}`}
            onClick={() => onSnapClick(stats.snap.name)}
          >
            <CardContent className="pt-4">
              <p className="text-3xl font-bold tabular-nums sm:text-4xl">
                {stats.snap.total.toLocaleString()}
              </p>
              <p className="break-words text-muted-foreground text-xs sm:text-sm">
                Especies en área SNAP más diversa
              </p>
              <p className="mt-0.5 line-clamp-2 text-[10px] font-medium text-foreground sm:text-xs">
                {stats.snap.name}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="min-w-0 overflow-visible transition-shadow hover:shadow-md">
            <CardContent className="pt-4">
              <p className="text-3xl font-bold tabular-nums sm:text-4xl">—</p>
              <p className="break-words text-muted-foreground text-xs sm:text-sm">
                Especies en área SNAP más diversa
              </p>
            </CardContent>
          </Card>
        )}

      </div>

      {/* Histograma por provincia */}
      <div className="mt-4">
        <MapotecaHistogramaChart
          data={stats?.histogramaProvincias ?? []}
          activeProvincias={activeProvincias}
          onBarClick={onProvinciaClick}
        />
      </div>
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
      try { return JSON.parse(stored); } catch { return null; }
    }
    return null;
  };

  const storedState = getStoredState();
  const [especieFilter, setEspecieFilter] = useState<string[]>(storedState?.especieFilter || (especieFromUrl ? [especieFromUrl] : []));
  const [catalogoFilter, setCatalogoFilter] = useState<string[]>(storedState?.catalogoFilter || []);
  const [localidadesFilter, setLocalidadesFilter] = useState<string[]>(storedState?.localidadesFilter || []);
  const [elevacionRange, setElevacionRange] = useState<[number, number]>(storedState?.elevacionRange || [0, 5000]);
  const [elevacionActive, setElevacionActive] = useState<boolean>(storedState?.elevacionActive || false);
  const [mapType, setMapType] = useState<"relief" | "terrain" | "provinces" | "satellite" | "streets">(storedState?.mapType || "provinces");
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
          <div className="hidden lg:block w-80 min-w-[320px]">
              <div className="sticky top-4 flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden" style={{ maxHeight: "calc(100vh - 120px)" }}>
                <div className="flex-1 overflow-y-auto py-4">
                  <div className="w-full space-y-5">

                    {/* Limpiar - top derecha */}
                    <div className="flex justify-end px-4">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={clearFilters}
                        className="w-auto gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-normal text-gray-700 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50"
                      >
                        <RotateCcw className="h-3.5 w-3.5 shrink-0 text-black" />
                        Limpiar
                      </Button>
                    </div>

                    <div className="space-y-5 px-4">
                      <EspecieMultiSelect selected={especieFilter} onChange={setEspecieFilter} />
                      <CatalogoMultiSelect selected={catalogoFilter} onChange={setCatalogoFilter} />
                      <LocalidadMultiSelect selected={localidadesFilter} onChange={setLocalidadesFilter} />
                      <ProvinciaMultiSelect
                        provincias={provincias}
                        selected={provinciaFilter}
                        onChange={setProvinciaFilter}
                      />

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
                    </div>

                  </div>
                </div>
              </div>
          </div>

          {/* Mapa */}
          <div className="flex-1 min-w-0">
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
                especieFilter={especieFilter.length > 0 ? especieFilter : undefined}
                catalogoFilter={catalogoFilter.length > 0 ? catalogoFilter : undefined}
                localidadesFilter={localidadesFilter.length > 0 ? localidadesFilter : undefined}
                elevacionMin={elevacionActive ? elevacionRange[0] : undefined}
                elevacionMax={elevacionActive ? elevacionRange[1] : undefined}
                mapType={mapType}
                provinciaFilter={provinciaFilter.length > 0 ? provinciaFilter : undefined}
                pisoFilter={pisoFilter.length > 0 ? pisoFilter : undefined}
                snapFilter={snapFilter.length > 0 ? snapFilter : undefined}
                onNavigateToSpecies={saveState}
              />
            </div>

            {/* Tabla de especies */}
            <div className="mt-4">
              <MapotecaTabla
                provinciaFilter={provinciaFilter.length > 0 ? provinciaFilter : undefined}
                pisoFilter={pisoFilter.length > 0 ? pisoFilter : undefined}
                snapFilter={snapFilter.length > 0 ? snapFilter : undefined}
                especieFilter={especieFilter.length > 0 ? especieFilter : undefined}
                catalogoFilter={catalogoFilter.length > 0 ? catalogoFilter : undefined}
                localidadesFilter={localidadesFilter.length > 0 ? localidadesFilter : undefined}
                elevacionMin={elevacionActive ? elevacionRange[0] : undefined}
                elevacionMax={elevacionActive ? elevacionRange[1] : undefined}
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
  const [provinciaFilter, setProvinciaFilter] = useState<string[]>([]);
  const [pisoFilter, setPisoFilter] = useState<string[]>([]);
  const [snapFilter, setSnapFilter] = useState<string[]>([]);
  const [, startTransition] = useTransition();

  const handleProvinciaClick = (name: string) => {
    startTransition(() => {
      setProvinciaFilter((prev) =>
        prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
      );
    });
  };

  const handlePisoClick = (name: string) => {
    startTransition(() => {
      setPisoFilter((prev) =>
        prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
      );
    });
  };

  const handleSnapClick = (name: string) => {
    startTransition(() => {
      setSnapFilter((prev) =>
        prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
      );
    });
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Mapoteca</h1>
        </div>
      </div>

      <StatCards
        activeProvincias={provinciaFilter}
        onProvinciaClick={handleProvinciaClick}
        activePisos={pisoFilter}
        onPisoClick={handlePisoClick}
        activeSnaps={snapFilter}
        onSnapClick={handleSnapClick}
      />

      <Suspense fallback={<MapotecaLoading />}>
        <MapotecaContent
          provinciaFilter={provinciaFilter}
          setProvinciaFilter={setProvinciaFilter}
          pisoFilter={pisoFilter}
          setPisoFilter={setPisoFilter}
          snapFilter={snapFilter}
          setSnapFilter={setSnapFilter}
        />
      </Suspense>
    </div>
  );
}
