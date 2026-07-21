"use client";

import {useEffect, useMemo, useState} from "react";
import {useInfiniteQuery, useQuery} from "@tanstack/react-query";
import {Check, RotateCcw, Search, SlidersHorizontal, X} from "lucide-react";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Slider} from "@/components/ui/slider";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import ColeccionCard, {type ColeccionCardData} from "@/components/ColeccionCard";
import {RANGE_DASH} from "@/lib/format-range";
import CatalogoMultiSelect from "@/components/CatalogoMultiSelect";
import YearRangeFilter from "@/components/YearRangeFilter";
import ClimaticFloorChartFilter from "@/components/ClimaticFloorChartFilter";
import RegistrosPorAnioChart from "@/components/RegistrosPorAnioChart";

function MuestraLabel({label}: {label: string}) {
  const idx = label.indexOf(" ");

  if (idx === -1) return <>{label}</>;
  const first = label.slice(0, idx);
  const rest = label.slice(idx + 1);

  if (first !== "Piel") return <>{label}</>;

  return (
    <>
      {first}
      <span className="mx-0.5" style={{color: "#f07304"}}>
        |
      </span>
      {rest}
    </>
  );
}

const MUESTRA_FIELDS = [
  {key: "piel_exudado", label: "Piel exudado"},
  {key: "piel_liofilizado", label: "Piel liofilizado"},
  {key: "tejido_higado", label: "Tejido hígado"},
  {key: "tejido_musculo", label: "Tejido músculo"},
  {key: "esqueleto_transparentacion", label: "Ejemplar diafanizado"},
  {key: "microfotografia", label: "MicrofotografíaCT"},
  {key: "esperma", label: "Esperma"},
  {key: "heces", label: "Heces"},
  {key: "sangre", label: "Sangre"},
  {key: "otros", label: "Otros"},
] as const;

type MuestraKey = (typeof MUESTRA_FIELDS)[number]["key"];

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);

    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

function FilterCheckbox({checked}: {checked: boolean}) {
  return (
    <div
      className={[
        "flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-[4px] border-[1.5px] transition-all",
        checked
          ? "border-[#4ba24b] bg-[#4ba24b] shadow-[inset_0_1px_2px_rgba(0,0,0,0.12)]"
          : "border-gray-300 bg-white",
      ].join(" ")}
    >
      <Check
        className={[
          "h-[10px] w-[10px] text-white transition-all",
          checked ? "scale-100 opacity-100" : "scale-50 opacity-0",
        ].join(" ")}
        strokeWidth={3}
      />
    </div>
  );
}

function AccordionButtonFilter({
  label,
  apiPath,
  selected,
  onChange,
}: {
  label: string;
  apiPath: string;
  selected: string[];
  onChange: (val: string[]) => void;
}) {
  const {data: options = []} = useQuery<string[]>({
    queryKey: [apiPath, "all"],
    queryFn: async () => {
      const res = await fetch(`${apiPath}?q=`);

      if (!res.ok) return [];

      return res.json();
    },
  });

  const toggle = (opt: string) => {
    if (selected.includes(opt)) onChange(selected.filter((s) => s !== opt));
    else onChange([...selected, opt]);
  };

  return (
    <AccordionItem value={label}>
      <AccordionTrigger className="!items-start">
        <div className="flex flex-col items-start">
          <span className="font-semibold">{label}</span>
          {selected.length > 0 && (
            <span className="mt-1 text-xs font-normal text-gray-500">{selected.join(", ")}</span>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent>
        {options.length === 0 ? (
          <p className="py-2 text-xs text-gray-500">No hay opciones disponibles</p>
        ) : (
          <div className="flex flex-col gap-2">
            {options.map((opt) => {
              const isSelected = selected.includes(opt);

              return (
                <Button
                  key={opt}
                  className="h-auto min-h-[32px] w-full justify-start rounded-md px-2 py-1 text-left text-sm break-words whitespace-normal"
                  size="sm"
                  style={{
                    borderColor: isSelected ? undefined : "#e8e8e8",
                    color: isSelected ? undefined : "#2d2d2d",
                  }}
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => toggle(opt)}
                >
                  {opt}
                </Button>
              );
            })}
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

function EspecieSelect({
  selected,
  onChange,
}: {
  selected: string | null;
  onChange: (val: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const enabled = debouncedQuery.length >= 2;
  const {data: results = [], isFetching: loading} = useQuery<
    {nombre_cientifico: string; nombre_comun: string | null}[]
  >({
    queryKey: ["colecciones", "especies", debouncedQuery],
    queryFn: async () => {
      const res = await fetch(`/api/colecciones/especies?q=${encodeURIComponent(debouncedQuery)}`);

      if (!res.ok) return [];
      const data = await res.json();

      return data.slice(0, 10);
    },
    enabled,
  });

  const handleSelect = (nombre: string) => {
    if (selected === nombre) {
      onChange(null);
    } else {
      onChange(nombre);
    }
    setQuery("");
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              className="w-full pl-10 text-sm"
              placeholder="Nombre científico o común"
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
                      onSelect={() => handleSelect(r.nombre_cientifico)}
                    >
                      <div className="flex items-center gap-2.5">
                        <FilterCheckbox checked={selected === r.nombre_cientifico} />
                        <div className="flex flex-col">
                          <i className="text-sm">{r.nombre_cientifico}</i>
                          {r.nombre_comun && (
                            <span className="text-[11px] text-gray-500">{r.nombre_comun}</span>
                          )}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selected && (
        <div className="flex flex-wrap gap-1">
          <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] text-gray-700 italic">
            {selected}
            <button type="button" onClick={() => onChange(null)}>
              <X className="h-3 w-3" />
            </button>
          </span>
        </div>
      )}
    </div>
  );
}

function TextMultiSelect({
  apiPath,
  placeholder,
  selected,
  onChange,
}: {
  apiPath: string;
  placeholder: string;
  selected: string[];
  onChange: (val: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const enabled = debouncedQuery.length >= 2;
  const {data: options = [], isFetching: loading} = useQuery<string[]>({
    queryKey: [apiPath, debouncedQuery],
    queryFn: async () => {
      const res = await fetch(`${apiPath}?q=${encodeURIComponent(debouncedQuery)}`);

      if (!res.ok) return [];

      return res.json();
    },
    enabled,
  });

  const toggle = (val: string) => {
    if (selected.includes(val)) onChange(selected.filter((s) => s !== val));
    else onChange([...selected, val]);
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              className="w-full pl-10 text-sm"
              placeholder={placeholder}
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
          className="z-[1100] max-h-[220px] w-[--radix-popover-trigger-width] overflow-y-auto p-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command shouldFilter={false}>
            <CommandList>
              {options.length === 0 && debouncedQuery.length >= 2 && (
                <CommandEmpty className="px-4 py-3 text-sm text-gray-400">
                  {loading ? "Buscando..." : "Sin resultados."}
                </CommandEmpty>
              )}
              {options.length > 0 && (
                <CommandGroup>
                  {options.map((opt) => (
                    <CommandItem
                      key={opt}
                      className="cursor-pointer"
                      value={opt}
                      onSelect={() => toggle(opt)}
                    >
                      <div className="flex items-center gap-2.5">
                        <FilterCheckbox checked={selected.includes(opt)} />
                        <span className="text-sm">{opt}</span>
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
          {selected.map((opt) => (
            <span
              key={opt}
              className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] text-gray-700"
            >
              {opt.length > 30 ? opt.slice(0, 30) + "..." : opt}
              <button type="button" onClick={() => toggle(opt)}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

interface ColeccionesResponse {
  colecciones: ColeccionCardData[];
  total: number;
  totalPaginas: number;
  paginaActual: number;
}

interface EstadisticasColecciones {
  total_registros: number;
  total_especies: number;
  total_especies_con_tejido: number;
  total_especies_con_piel: number;
  total_especies_con_diafanizado: number;
  total_especies_con_esperma: number;
  total_especies_con_microfotografia: number;
  total_colectores: number;
  total_localidades: number;
  anio_min: number | null;
  anio_max: number | null;
}

function StatCard({
  label,
  value,
  highlight = false,
  valueSuffix,
}: {
  label: React.ReactNode;
  value: string | number | null;
  highlight?: boolean;
  valueSuffix?: string;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-md border p-2"
      style={{borderColor: "#dddddd"}}
    >
      <div className="flex items-baseline gap-1">
        <span
          className="text-3xl font-bold sm:text-4xl"
          style={{color: highlight ? "#f07304" : "#000000"}}
        >
          {value ?? "—"}
        </span>
        {valueSuffix && (
          <span className="text-xs font-semibold" style={{color: "#666666"}}>
            {valueSuffix}
          </span>
        )}
      </div>
      <h4
        className="mt-1 text-center"
        style={{
          color: "#666666",
          fontSize: "13px",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
          fontWeight: "400",
        }}
      >
        {label}
      </h4>
    </div>
  );
}

export default function ColeccionesPage() {
  const [familiasFilter, setFamiliasFilter] = useState<string[]>([]);
  const [generosFilter, setGenerosFilter] = useState<string[]>([]);
  const [especieFilter, setEspecieFilter] = useState<string | null>(null);
  const [estadiosFilter, setEstadiosFilter] = useState<string[]>([]);
  const [sexosFilter, setSexosFilter] = useState<string[]>([]);
  const [colectoresFilter, setColectoresFilter] = useState<string[]>([]);
  const [localidadesFilter, setLocalidadesFilter] = useState<string[]>([]);
  const [catalogosFilter, setCatalogosFilter] = useState<string[]>([]);
  const [scInput, setScInput] = useState("");
  const [anioEspecifico, setAnioEspecifico] = useState("");
  const [anioDesde, setAnioDesde] = useState("");
  const [anioHasta, setAnioHasta] = useState("");
  const [elevRange, setElevRange] = useState<[number, number] | null>(null);
  const [tiposMuestraFilter, setTiposMuestraFilter] = useState<MuestraKey[]>([]);
  const [verTodoLoading, setVerTodoLoading] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const debouncedSc = useDebounce(scInput, 300);

  // Rango disponible de elevación
  const {data: elevRangeData} = useQuery<{min: number; max: number}>({
    queryKey: ["colecciones", "elevacion-range"],
    queryFn: async () => {
      const res = await fetch("/api/colecciones/elevacion-range");

      if (!res.ok) return {min: 0, max: 6000};

      return res.json();
    },
  });

  useEffect(() => {
    if (elevRangeData && elevRange === null) {
      setElevRange([elevRangeData.min, elevRangeData.max]);
    }
  }, [elevRangeData, elevRange]);

  const elevMin = elevRangeData?.min ?? 0;
  const elevMax = elevRangeData?.max ?? 6000;
  const elevActive = elevRange !== null && (elevRange[0] !== elevMin || elevRange[1] !== elevMax);

  const hasFilters =
    familiasFilter.length > 0 ||
    generosFilter.length > 0 ||
    !!especieFilter ||
    estadiosFilter.length > 0 ||
    sexosFilter.length > 0 ||
    colectoresFilter.length > 0 ||
    localidadesFilter.length > 0 ||
    catalogosFilter.length > 0 ||
    scInput.trim().length > 0 ||
    anioEspecifico.length > 0 ||
    anioDesde.length > 0 ||
    anioHasta.length > 0 ||
    elevActive ||
    tiposMuestraFilter.length > 0;

  // Badge del botón móvil: cuenta de selecciones + 1 por rango de años/altitud
  const activeFilterCount =
    [
      familiasFilter,
      generosFilter,
      estadiosFilter,
      sexosFilter,
      colectoresFilter,
      localidadesFilter,
      catalogosFilter,
      tiposMuestraFilter,
    ].flat().length +
    (especieFilter ? 1 : 0) +
    (elevActive ? 1 : 0) +
    (anioDesde || anioHasta || anioEspecifico ? 1 : 0);

  const clearFilters = () => {
    setFamiliasFilter([]);
    setGenerosFilter([]);
    setEspecieFilter(null);
    setEstadiosFilter([]);
    setSexosFilter([]);
    setColectoresFilter([]);
    setLocalidadesFilter([]);
    setCatalogosFilter([]);
    setScInput("");
    setAnioEspecifico("");
    setAnioDesde("");
    setAnioHasta("");
    if (elevRangeData) setElevRange([elevRangeData.min, elevRangeData.max]);
    setTiposMuestraFilter([]);
  };

  const queryParams = useMemo(() => {
    const p = new URLSearchParams();

    if (familiasFilter.length) p.set("familias", familiasFilter.join("||"));
    if (generosFilter.length) p.set("generos", generosFilter.join("||"));
    if (especieFilter) p.set("especies", especieFilter);
    if (estadiosFilter.length) p.set("estadios", estadiosFilter.join("||"));
    if (sexosFilter.length) p.set("sexos", sexosFilter.join("||"));
    if (colectoresFilter.length) p.set("colectores", colectoresFilter.join("||"));
    if (localidadesFilter.length) p.set("localidades", localidadesFilter.join("||"));
    if (catalogosFilter.length) p.set("catalogos", catalogosFilter.join("||"));
    if (debouncedSc.trim()) p.set("sc", debouncedSc.trim());
    if (anioEspecifico) p.set("anio", anioEspecifico);
    if (anioDesde) p.set("anio_desde", anioDesde);
    if (anioHasta) p.set("anio_hasta", anioHasta);
    if (elevActive && elevRange) {
      p.set("elev_min", String(elevRange[0]));
      p.set("elev_max", String(elevRange[1]));
    }
    if (tiposMuestraFilter.length > 0) p.set("tipos_muestra", tiposMuestraFilter.join("||"));

    return p.toString();
  }, [
    familiasFilter,
    generosFilter,
    especieFilter,
    estadiosFilter,
    sexosFilter,
    colectoresFilter,
    localidadesFilter,
    catalogosFilter,
    debouncedSc,
    anioEspecifico,
    anioDesde,
    anioHasta,
    elevActive,
    elevRange,
    tiposMuestraFilter,
  ]);

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery<ColeccionesResponse>({
    queryKey: ["colecciones", queryParams],
    initialPageParam: 1,
    queryFn: async ({pageParam}) => {
      const params = new URLSearchParams(queryParams);

      params.set("pagina", String(pageParam));
      const res = await fetch(`/api/colecciones?${params.toString()}`);

      if (!res.ok) throw new Error("Error al cargar colecciones");

      return res.json();
    },
    getNextPageParam: (lastPage) =>
      lastPage.paginaActual < lastPage.totalPaginas ? lastPage.paginaActual + 1 : undefined,
  });

  const handleVerTodo = async () => {
    setVerTodoLoading(true);
    try {
      let res = await fetchNextPage();

      while (res.hasNextPage) {
        res = await fetchNextPage();
      }
    } finally {
      setVerTodoLoading(false);
    }
  };

  const {data: stats} = useQuery<EstadisticasColecciones>({
    queryKey: ["colecciones", "estadisticas"],
    queryFn: async () => {
      const res = await fetch("/api/colecciones/estadisticas");

      if (!res.ok) throw new Error("Error al cargar estadísticas");

      return res.json();
    },
  });

  const colecciones = useMemo<ColeccionCardData[]>(
    () => data?.pages.flatMap((p) => p.colecciones) ?? [],
    [data],
  );
  const total = data?.pages[0]?.total ?? 0;

  const buildSlug = (nombre: string | null) => (nombre ? nombre.replace(/\s+/g, "-") : "");

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900">Colecciones Centro Jambatu</h1>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-9">
          <div
            className="flex flex-col justify-center rounded-md border p-2"
            style={{borderColor: "#dddddd"}}
          >
            <a
              className="hover:text-gray-900"
              href="https://www.gbif.org/occurrence/search?offset=400&q=amphibia%20ecuador&taxon_key=131"
              rel="noopener noreferrer"
              style={{
                color: "#666666",
                fontSize: "13px",
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                fontWeight: "600",
              }}
              target="_blank"
            >
              GBIF
            </a>
            <a
              className="hover:text-gray-900"
              href="https://www.vertnet.org/occurrence/search?taxonKey=131&country=EC"
              rel="noopener noreferrer"
              style={{
                color: "#666666",
                fontSize: "13px",
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                fontWeight: "600",
              }}
              target="_blank"
            >
              VertNet
            </a>
            <a
              className="hover:text-gray-900"
              href="mailto:investigacion@anfibiosecuador.ec"
              style={{
                color: "#666666",
                fontSize: "13px",
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                fontWeight: "600",
              }}
            >
              Préstamos CJ
            </a>
          </div>
          <StatCard
            highlight
            label="Registros"
            value={(stats?.total_registros ?? 0).toLocaleString()}
          />
          <StatCard label="Especies" value={(stats?.total_especies ?? 0).toLocaleString()} />
          <StatCard
            label="Localidades"
            value={(stats?.total_localidades ?? 0).toLocaleString()}
          />
          <StatCard
            label="Tejido"
            value={(stats?.total_especies_con_tejido ?? 0).toLocaleString()}
            valueSuffix="especies"
          />
          <StatCard
            label="Extracto piel"
            value={(stats?.total_especies_con_piel ?? 0).toLocaleString()}
            valueSuffix="especies"
          />
          <StatCard
            label="Ejemplar diafanizado"
            value={(stats?.total_especies_con_diafanizado ?? 0).toLocaleString()}
            valueSuffix="especies"
          />
          <StatCard
            label="MicroCT"
            value={(stats?.total_especies_con_microfotografia ?? 0).toLocaleString()}
            valueSuffix="especies"
          />
          <StatCard
            label="Esperma"
            value={(stats?.total_especies_con_esperma ?? 0).toLocaleString()}
            valueSuffix="especies"
          />
        </div>

        <div className="mb-8">
          <RegistrosPorAnioChart
            anioSeleccionado={anioEspecifico ? Number.parseInt(anioEspecifico, 10) : undefined}
            onToggleAnio={(anio) => {
              const actual = anioEspecifico ? Number.parseInt(anioEspecifico, 10) : undefined;

              if (actual === anio) {
                setAnioEspecifico("");
              } else {
                setAnioEspecifico(String(anio));
                setAnioDesde("");
                setAnioHasta("");
              }
            }}
          />
        </div>

        <section className="mb-12">
          {(() => {
            const filterPanelContent = (
              <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="flex-shrink-0 px-6 pt-4 pb-2">
                  <EspecieSelect selected={especieFilter} onChange={setEspecieFilter} />
                </div>
                <div className="flex flex-shrink-0 justify-end px-6 pb-2">
                  <Button
                    className="gap-1.5 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-normal text-gray-700 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50"
                    disabled={!hasFilters}
                    type="button"
                    variant="ghost"
                    onClick={clearFilters}
                  >
                    <RotateCcw className="h-3.5 w-3.5 shrink-0 text-black" />
                    Limpiar
                  </Button>
                </div>

                <div className="mt-1 min-h-0 w-full flex-1 border-t">
                  <Accordion
                    className="[&>[data-slot=accordion-item]]:border-b [&>[data-slot=accordion-item]]:px-6"
                    type="multiple"
                  >
                    <AccordionButtonFilter
                      apiPath="/api/colecciones/familias"
                      label="Familia"
                      selected={familiasFilter}
                      onChange={setFamiliasFilter}
                    />
                    <AccordionButtonFilter
                      apiPath="/api/colecciones/generos"
                      label="Género"
                      selected={generosFilter}
                      onChange={setGenerosFilter}
                    />
                    <AccordionButtonFilter
                      apiPath="/api/colecciones/estadios"
                      label="Estadio"
                      selected={estadiosFilter}
                      onChange={setEstadiosFilter}
                    />
                    <AccordionButtonFilter
                      apiPath="/api/colecciones/sexos"
                      label="Sexo"
                      selected={sexosFilter}
                      onChange={setSexosFilter}
                    />
                    <AccordionItem value="tipoMuestra">
                      <AccordionTrigger className="!items-start">
                        <div className="flex flex-col items-start">
                          <span className="font-semibold">Tipo de muestra</span>
                          {tiposMuestraFilter.length > 0 && (
                            <span className="mt-1 text-xs font-normal text-gray-500">
                              {tiposMuestraFilter
                                .map((k) => MUESTRA_FIELDS.find((f) => f.key === k)?.label)
                                .filter(Boolean)
                                .join(", ")}
                            </span>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col gap-2">
                          {MUESTRA_FIELDS.map((f) => {
                            const active = tiposMuestraFilter.includes(f.key);

                            return (
                              <Button
                                key={f.key}
                                aria-pressed={active}
                                className="h-auto min-h-[32px] w-full justify-start rounded-md px-2 py-1 text-left text-sm break-words whitespace-normal"
                                size="sm"
                                style={{
                                  borderColor: active ? undefined : "#e8e8e8",
                                  color: active ? undefined : "#2d2d2d",
                                }}
                                variant={active ? "default" : "outline"}
                                onClick={() => {
                                  setTiposMuestraFilter((prev) =>
                                    prev.includes(f.key)
                                      ? prev.filter((k) => k !== f.key)
                                      : [...prev, f.key],
                                  );
                                }}
                              >
                                <MuestraLabel label={f.label} />
                              </Button>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <div className="space-y-3 px-6 py-4">
                    <TextMultiSelect
                      apiPath="/api/colecciones/colectores"
                      placeholder="Colector"
                      selected={colectoresFilter}
                      onChange={setColectoresFilter}
                    />
                    <TextMultiSelect
                      apiPath="/api/colecciones/localidades"
                      placeholder="Localidad"
                      selected={localidadesFilter}
                      onChange={setLocalidadesFilter}
                    />
                    <CatalogoMultiSelect
                      apiPath="/api/colecciones/catalogos"
                      placeholder="Número de museo (ej. CJ 15671)"
                      selected={catalogosFilter}
                      onChange={setCatalogosFilter}
                    />

                    <div className="relative">
                      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                      <Input
                        className="w-full pl-10 text-sm"
                        placeholder="N° de campo (sc)"
                        value={scInput}
                        onChange={(e) => setScInput(e.target.value)}
                      />
                    </div>

                    <YearRangeFilter
                      desde={anioDesde}
                      hasta={anioHasta}
                      yearMax={stats?.anio_max ?? new Date().getFullYear()}
                      yearMin={stats?.anio_min ?? 1970}
                      onChange={(d, h) => {
                        setAnioDesde(d);
                        setAnioHasta(h);
                        if (anioEspecifico) setAnioEspecifico("");
                      }}
                    />

                    {/* Altitud */}
                    <div className="space-y-2 pt-2 [&_[data-slot=slider-range]]:bg-gray-400 [&_[data-slot=slider-track]]:bg-gray-300">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-700">Altitud (msnm)</span>
                        {elevActive && (
                          <button
                            className="text-[10px] text-gray-400 hover:text-gray-600"
                            type="button"
                            onClick={() => setElevRange([elevMin, elevMax])}
                          >
                            Limpiar
                          </button>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>{elevRange ? elevRange[0] : elevMin}m</span>
                        <span>{elevRange ? elevRange[1] : elevMax}m</span>
                      </div>
                      <Slider
                        className="w-full"
                        max={elevMax}
                        min={elevMin}
                        step={50}
                        value={elevRange ?? [elevMin, elevMax]}
                        onValueChange={(v) => setElevRange([v[0] ?? elevMin, v[1] ?? elevMax])}
                      />
                      <ClimaticFloorChartFilter
                        altitudinalRange={{
                          min: elevRange ? elevRange[0] : elevMin,
                          max: elevRange ? elevRange[1] : elevMax,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );

            return (
              <>
                <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
                  {/* Sidebar de filtros — solo desktop */}
                  <aside className="hidden lg:block lg:w-80 lg:flex-shrink-0">
                    <div className="sticky top-4">{filterPanelContent}</div>
                  </aside>

            <div className="min-w-0 flex-1">
              {/* Botón de filtros móvil */}
              <div className="mb-4 lg:hidden">
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

              {isLoading && colecciones.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
                  <p className="text-gray-600">Cargando colecciones...</p>
                </div>
              ) : colecciones.length > 0 ? (
                <>
                  <div
                    className={`mb-6 flex flex-col gap-1.5 transition-opacity duration-200 ${
                      isFetching && !isFetchingNextPage && !verTodoLoading
                        ? "opacity-60"
                        : "opacity-100"
                    }`}
                  >
                    {colecciones.map((c) => {
                      const slug = buildSlug(c.nombre_cientifico ?? null);
                      const href = slug
                        ? `/sapopedia/species/${encodeURIComponent(slug)}/colecciones/${String(c.id_coleccion)}?from=colecciones`
                        : undefined;

                      return <ColeccionCard key={c.id_coleccion} coleccion={c} href={href} />;
                    })}
                  </div>

                  <div className="mt-6 flex items-center justify-center gap-4">
                    <p className="text-xs text-gray-400">
                      {`Mostrando 1${RANGE_DASH}${colecciones.length.toLocaleString()} de ${total.toLocaleString()} ${
                        total === 1 ? "registro" : "registros"
                      }`}
                    </p>
                    {hasNextPage && (
                      <>
                        <button
                          className="rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-medium tracking-wide text-gray-700 transition-colors hover:border-gray-400 hover:text-gray-900 disabled:opacity-50"
                          disabled={isFetchingNextPage || verTodoLoading}
                          type="button"
                          onClick={() => {
                            void fetchNextPage();
                          }}
                        >
                          {isFetchingNextPage ? "Cargando..." : "Cargar más"}
                        </button>
                        <button
                          className="rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-medium tracking-wide text-gray-700 transition-colors hover:border-gray-400 hover:text-gray-900 disabled:opacity-50"
                          disabled={isFetchingNextPage || verTodoLoading}
                          type="button"
                          onClick={() => {
                            void handleVerTodo();
                          }}
                        >
                          {verTodoLoading ? "Cargando todo..." : "Ver todo"}
                        </button>
                      </>
                    )}
                  </div>
                </>
              ) : hasFilters ? (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
                  <p className="text-gray-600">No se encontraron registros con esos filtros.</p>
                </div>
              ) : (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
                  <p className="text-gray-600">No hay registros publicados.</p>
                </div>
              )}
            </div>
          </div>

                {/* Panel de filtros móvil (bottom sheet) */}
                {showMobileFilters && (
                  <div
                    aria-label="Panel de filtros"
                    aria-modal="true"
                    className="fixed inset-0 z-50 lg:hidden"
                    role="dialog"
                  >
                    <button
                      aria-label="Cerrar filtros"
                      className="absolute inset-0 w-full cursor-default"
                      style={{backgroundColor: "rgba(0,0,0,0.45)"}}
                      type="button"
                      onClick={() => setShowMobileFilters(false)}
                    />
                    <div
                      className="absolute right-0 bottom-0 left-0 flex flex-col rounded-t-2xl bg-white shadow-2xl"
                      style={{maxHeight: "90vh"}}
                    >
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
                      <div className="min-h-0 flex-1 overflow-hidden">
                        {filterPanelContent}
                      </div>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </section>
      </div>
    </div>
  );
}
