"use client";

import {useEffect, useState} from "react";
import Link from "next/link";
import {keepPreviousData, useQuery} from "@tanstack/react-query";
import {Image as ImageIcon, RotateCcw, Search, X, Check, ExternalLink} from "lucide-react";

import {Button} from "@/components/ui/button";
import CatalogoMultiSelect from "@/components/CatalogoMultiSelect";
import SpeciesSearchInput from "@/components/SpeciesSearchInput";
import YearRangeFilter from "@/components/YearRangeFilter";
import {Input} from "@/components/ui/input";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

function ListMultiSelect({
  apiPath,
  placeholder,
  selected,
  onChange,
  chipBg,
  chipText,
}: {
  apiPath: string;
  placeholder: string;
  selected: string[];
  onChange: (val: string[]) => void;
  chipBg: string;
  chipText: string;
}) {
  const [open, setOpen] = useState(false);
  const {data: options = []} = useQuery<string[]>({
    queryKey: [apiPath, "all"],
    queryFn: async () => {
      const res = await fetch(`${apiPath}?q=`);

      if (!res.ok) return [];

      return res.json();
    },
  });

  const toggle = (val: string) => {
    if (selected.includes(val)) onChange(selected.filter((s) => s !== val));
    else onChange([...selected, val]);
  };

  const buttonLabel =
    selected.length === 0
      ? placeholder
      : selected.length === 1
        ? selected[0]
        : `${selected.length} seleccionados`;

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className="border-input bg-background hover:bg-accent flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors"
            type="button"
          >
            <span className={selected.length === 0 ? "text-muted-foreground" : "text-foreground"}>
              {buttonLabel}
            </span>
            <Search className="text-muted-foreground h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="z-[1100] max-h-[260px] w-[--radix-popover-trigger-width] overflow-y-auto p-1"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-400">Sin opciones.</div>
          ) : (
            <div className="space-y-1">
              {options.map((opt) => {
                const checked = selected.includes(opt);

                return (
                  <button
                    key={opt}
                    className={[
                      "flex w-full items-center gap-2.5 rounded-sm px-2 py-1.5 text-left text-sm transition-colors",
                      checked ? "bg-accent" : "hover:bg-accent",
                    ].join(" ")}
                    type="button"
                    onClick={() => toggle(opt)}
                  >
                    <FilterCheckbox checked={checked} />
                    <span className="truncate">{opt}</span>
                  </button>
                );
              })}
            </div>
          )}
        </PopoverContent>
      </Popover>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map((opt) => (
            <span
              key={opt}
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${chipBg} ${chipText}`}
            >
              {opt}
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

function TextMultiSelect({
  apiPath,
  placeholder,
  selected,
  onChange,
  chipBg,
  chipText,
}: {
  apiPath: string;
  placeholder: string;
  selected: string[];
  onChange: (val: string[]) => void;
  chipBg: string;
  chipText: string;
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
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${chipBg} ${chipText}`}
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

interface EspecieItem {
  id: number;
  nombre_cientifico: string;
  nombre_comun: string | null;
  slug: string;
  fotografia_url: string | null;
  orden?: string | null;
  familia?: string | null;
  genero?: string | null;
}

interface FotoCard {
  enlace: string;
  autor: string | null;
  fecha?: string | null;
  nombre_cientifico?: string | null;
}

interface EstadisticasFototeca {
  total_fotos: number;
  primera_foto: FotoCard | null;
  foto_destacada_reciente: FotoCard | null;
  foto_destacada: FotoCard | null;
  foto_posiblemente_extinta: FotoCard | null;
}

function StatCard({
  label,
  caption,
  imageSrc,
  imageAlt,
  imageContent,
}: {
  label: string;
  caption?: string | null;
  imageSrc?: string | null;
  imageAlt?: string;
  imageContent?: React.ReactNode;
}) {
  return (
    <div
      className="group flex flex-col overflow-hidden rounded-md border text-center transition-shadow hover:shadow-md"
      style={{borderColor: "#dddddd"}}
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-gray-50">
        {imageContent ? (
          <div className="flex h-full w-full items-center justify-center">{imageContent}</div>
        ) : imageSrc ? (
          <img
            alt={imageAlt || label}
            className="h-full w-full object-cover grayscale transition-[filter] duration-700 ease-in-out group-hover:grayscale-0"
            loading="lazy"
            src={imageSrc}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
            Sin foto
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col items-center justify-center p-2">
        <span className="text-sm font-semibold" style={{color: "#666666"}}>
          {label}
        </span>
        {caption && (
          <i className="mt-0.5 text-xs" style={{color: "#888888"}}>
            {caption}
          </i>
        )}
      </div>
    </div>
  );
}

export default function FototecaPage() {
  const [searchInput, setSearchInput] = useState("");
  const [localidadesFilter, setLocalidadesFilter] = useState<string[]>([]);
  const [autoresFilter, setAutoresFilter] = useState<string[]>([]);
  const [catalogosFilter, setCatalogosFilter] = useState<string[]>([]);
  const [familiasFilter, setFamiliasFilter] = useState<string[]>([]);
  const [generosFilter, setGenerosFilter] = useState<string[]>([]);
  const [anioEspecifico, setAnioEspecifico] = useState<string>("");
  const [anioDesde, setAnioDesde] = useState<string>("");
  const [anioHasta, setAnioHasta] = useState<string>("");

  const search = searchInput.trim();
  const localidadesKey = localidadesFilter.join("||");
  const autoresKey = autoresFilter.join("||");
  const catalogosKey = catalogosFilter.join("||");
  const familiasKey = familiasFilter.join("||");
  const generosKey = generosFilter.join("||");

  const hasFilters =
    localidadesFilter.length > 0 ||
    autoresFilter.length > 0 ||
    catalogosFilter.length > 0 ||
    familiasFilter.length > 0 ||
    generosFilter.length > 0 ||
    searchInput.trim().length > 0 ||
    anioEspecifico.length > 0 ||
    anioDesde.length > 0 ||
    anioHasta.length > 0;

  const clearFilters = () => {
    setSearchInput("");
    setLocalidadesFilter([]);
    setAutoresFilter([]);
    setCatalogosFilter([]);
    setFamiliasFilter([]);
    setGenerosFilter([]);
    setAnioEspecifico("");
    setAnioDesde("");
    setAnioHasta("");
  };

  const {
    data: especies = [],
    isLoading: loadingEspecies,
    isFetching: fetchingEspecies,
  } = useQuery<EspecieItem[]>({
    queryKey: [
      "fototeca",
      "especies",
      search,
      localidadesKey,
      autoresKey,
      catalogosKey,
      familiasKey,
      generosKey,
      anioEspecifico,
      anioDesde,
      anioHasta,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (search) params.set("search", search);
      if (localidadesKey) params.set("localidades", localidadesKey);
      if (autoresKey) params.set("autores", autoresKey);
      if (catalogosKey) params.set("catalogos", catalogosKey);
      if (familiasKey) params.set("familias", familiasKey);
      if (generosKey) params.set("generos", generosKey);
      if (anioEspecifico) params.set("anio", anioEspecifico);
      if (anioDesde) params.set("anio_desde", anioDesde);
      if (anioHasta) params.set("anio_hasta", anioHasta);
      const response = await fetch(`/api/fototeca/especies?${params.toString()}`);

      if (!response.ok) throw new Error("Error al cargar especies");

      return response.json();
    },
    placeholderData: keepPreviousData,
  });

  const {data: stats} = useQuery<EstadisticasFototeca>({
    queryKey: ["fototeca", "estadisticas"],
    queryFn: async () => {
      const response = await fetch("/api/fototeca/estadisticas");

      if (!response.ok) throw new Error("Error al cargar estadísticas");

      return response.json();
    },
  });

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900">Fototeca</h1>
          <p className="mt-2 text-gray-600">Listado de especies con fotografías disponibles</p>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard
            imageContent={
              <span className="text-5xl font-bold text-gray-700">{stats?.total_fotos ?? "—"}</span>
            }
            label="Número de fotos"
          />

          <StatCard
            caption={stats?.primera_foto?.fecha ?? null}
            imageAlt={stats?.primera_foto?.nombre_cientifico || "Primera foto"}
            imageSrc={stats?.primera_foto?.enlace}
            label="1ra foto tomada"
          />

          <StatCard
            caption={stats?.foto_destacada_reciente?.nombre_cientifico ?? null}
            imageAlt={
              stats?.foto_destacada_reciente?.nombre_cientifico || "Foto especie más reciente"
            }
            imageSrc={stats?.foto_destacada_reciente?.enlace}
            label="Foto especie más reciente"
          />

          <StatCard
            caption={stats?.foto_destacada?.nombre_cientifico ?? null}
            imageAlt={stats?.foto_destacada?.nombre_cientifico || "Foto destacada"}
            imageSrc={stats?.foto_destacada?.enlace}
            label="Foto destacada"
          />

          <StatCard
            caption={stats?.foto_posiblemente_extinta?.nombre_cientifico ?? null}
            imageAlt={stats?.foto_posiblemente_extinta?.nombre_cientifico || "Posiblemente extinta"}
            imageSrc={stats?.foto_posiblemente_extinta?.enlace}
            label="Foto posiblemente extinta"
          />
        </div>

        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Fotos por Especie</h2>
            <p className="mt-1 text-sm text-gray-600">Busca una especie para ver sus fotos</p>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
            <aside className="lg:w-80 lg:flex-shrink-0">
              <div className="sticky top-4 flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="flex-shrink-0 px-6 pt-6 pb-2">
                  <SpeciesSearchInput
                    apiPath="/api/fototeca/especies"
                    placeholder="Nombre científico o común"
                    value={searchInput}
                    onChange={setSearchInput}
                  />
                </div>

                <div className="flex flex-shrink-0 justify-end px-6 py-2">
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

                <div className="mt-2 min-h-0 w-full flex-1 border-t">
                  <Accordion
                    className="[&>[data-slot=accordion-item]]:border-b [&>[data-slot=accordion-item]]:px-6"
                    type="multiple"
                  >
                    <AccordionButtonFilter
                      apiPath="/api/fototeca/familias"
                      label="Familia"
                      selected={familiasFilter}
                      onChange={setFamiliasFilter}
                    />
                    <AccordionButtonFilter
                      apiPath="/api/fototeca/generos"
                      label="Género"
                      selected={generosFilter}
                      onChange={setGenerosFilter}
                    />
                  </Accordion>

                  <div className="space-y-3 px-6 py-4">
                    <TextMultiSelect
                      apiPath="/api/fototeca/localidades"
                      chipBg="bg-green-100"
                      chipText="text-green-800"
                      placeholder="Localidad"
                      selected={localidadesFilter}
                      onChange={setLocalidadesFilter}
                    />
                    <TextMultiSelect
                      apiPath="/api/fototeca/autores"
                      chipBg="bg-blue-100"
                      chipText="text-blue-800"
                      placeholder="Autor"
                      selected={autoresFilter}
                      onChange={setAutoresFilter}
                    />
                    <CatalogoMultiSelect
                      apiPath="/api/fototeca/catalogos"
                      placeholder="CJ 10441"
                      selected={catalogosFilter}
                      onChange={setCatalogosFilter}
                    />

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
                  </div>
                </div>
              </div>
            </aside>

            <div className="min-w-0 flex-1">
              <div className="text-muted-foreground mb-3 flex items-center gap-2 text-xs">
                <span>
                  {`${String(especies.length)} ${especies.length === 1 ? "especie" : "especies"}`}
                </span>
                {fetchingEspecies && (
                  <span
                    aria-label="Actualizando"
                    className="border-muted-foreground/30 border-t-muted-foreground inline-block h-3 w-3 animate-spin rounded-full border-2"
                  />
                )}
              </div>

              {loadingEspecies && especies.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
                  <p className="text-gray-600">Cargando especies...</p>
                </div>
              ) : especies.length > 0 ? (
                <div
                  className={`grid grid-cols-1 gap-3 transition-opacity duration-200 sm:grid-cols-2 lg:grid-cols-3 ${
                    fetchingEspecies ? "opacity-60" : "opacity-100"
                  }`}
                >
                  {especies.map((especie) => {
                    const href = `/sapopedia/species/${especie.slug}/fotos?from=fototeca${searchInput.trim() ? `&search=${encodeURIComponent(searchInput.trim())}` : ""}`;
                    const queryParam = (especie.nombre_cientifico || "")
                      .split(/\s+/)
                      .map(encodeURIComponent)
                      .join("+");
                    const googleImagesUrl = `https://www.google.com/search?tbm=isch&q=${queryParam}`;
                    const inaturalistUrl = `https://www.inaturalist.org/taxa/search?q=${queryParam}`;

                    return (
                      <div
                        key={especie.id}
                        className="group flex flex-col overflow-hidden rounded-md border bg-white text-center transition-shadow hover:shadow-md"
                        style={{borderColor: "#dddddd"}}
                      >
                        <Link className="flex flex-col no-underline" href={href}>
                          <div className="aspect-[4/3] w-full overflow-hidden bg-gray-50">
                            {especie.fotografia_url ? (
                              <img
                                alt={especie.nombre_cientifico}
                                className="h-full w-full object-cover grayscale transition-[filter] duration-700 ease-in-out group-hover:grayscale-0"
                                loading="lazy"
                                src={especie.fotografia_url}
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-gray-300">
                                <ImageIcon className="h-10 w-10" />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-1 flex-col items-center justify-center gap-0.5 px-2 py-3">
                            <span
                              className="text-sm font-semibold italic"
                              style={{color: "#666666"}}
                            >
                              {especie.nombre_cientifico}
                            </span>
                            {especie.nombre_comun && (
                              <span className="text-xs" style={{color: "#888888"}}>
                                {especie.nombre_comun}
                              </span>
                            )}
                          </div>
                        </Link>
                        <div className="flex border-t border-gray-100">
                          <a
                            className="flex flex-1 items-center justify-center gap-1 px-2 py-2 text-[11px] font-medium text-gray-600 no-underline transition-colors hover:bg-gray-50 hover:text-gray-900"
                            href={googleImagesUrl}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            Google Images
                            <ExternalLink className="h-3 w-3" />
                          </a>
                          <div className="w-px bg-gray-100" />
                          <a
                            className="flex flex-1 items-center justify-center gap-1 px-2 py-2 text-[11px] font-medium text-gray-600 no-underline transition-colors hover:bg-gray-50 hover:text-gray-900"
                            href={inaturalistUrl}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            iNaturalist
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : hasFilters ? (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
                  <p className="text-gray-600">No se encontraron especies con esos filtros.</p>
                </div>
              ) : (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
                  <p className="text-gray-600">No hay especies con fotos publicadas.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
