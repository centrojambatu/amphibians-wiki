"use client";

import {MoveRight, Check, RotateCcw} from "lucide-react";
import Link from "next/link";
import {useMemo, useState, type ReactNode} from "react";
import {useInfiniteQuery, useQuery} from "@tanstack/react-query";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {Button} from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import SpeciesSearchInput from "@/components/SpeciesSearchInput";

import {MUESTRA_FIELDS, type MuestraField, type MuestrasTaxon} from "./get-moleculoteca-taxa";

interface TaxaResponse {
  taxa: MuestrasTaxon[];
  total: number;
  totalPaginas: number;
  paginaActual: number;
}

interface EstadisticasMoleculoteca {
  total_especies: number;
  especies_por_muestra: Record<MuestraField, number>;
}

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

function StatCard({label, value}: {label: ReactNode; value: number}) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-md border p-2"
      style={{borderColor: "#dddddd"}}
    >
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold sm:text-4xl text-black">
          {value.toLocaleString()}
        </span>
        <span className="text-xs font-semibold" style={{color: "#666666"}}>
          especies
        </span>
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
            <span className="mt-1 text-xs font-normal text-gray-500">
              {selected.join(", ")}
            </span>
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

export default function MoleculotecaListClient() {
  const [busqueda, setBusqueda] = useState("");
  const [activos, setActivos] = useState<Set<MuestraField>>(new Set());
  const [familiasFilter, setFamiliasFilter] = useState<string[]>([]);
  const [generosFilter, setGenerosFilter] = useState<string[]>([]);
  const [verTodoLoading, setVerTodoLoading] = useState(false);

  const queryParams = useMemo(() => {
    const p = new URLSearchParams();

    if (busqueda.trim()) p.set("busqueda", busqueda.trim());
    if (familiasFilter.length) p.set("familias", familiasFilter.join("||"));
    if (generosFilter.length) p.set("generos", generosFilter.join("||"));
    if (activos.size) p.set("tipos_muestra", Array.from(activos).join("||"));

    return p.toString();
  }, [busqueda, familiasFilter, generosFilter, activos]);

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery<TaxaResponse>({
    queryKey: ["moleculoteca", queryParams],
    initialPageParam: 1,
    queryFn: async ({pageParam}) => {
      const params = new URLSearchParams(queryParams);

      params.set("pagina", String(pageParam));
      const res = await fetch(`/api/moleculoteca?${params.toString()}`);

      if (!res.ok) throw new Error("Error al cargar moleculoteca");

      return res.json();
    },
    getNextPageParam: (lastPage) =>
      lastPage.paginaActual < lastPage.totalPaginas ? lastPage.paginaActual + 1 : undefined,
  });

  const {data: stats} = useQuery<EstadisticasMoleculoteca>({
    queryKey: ["moleculoteca", "estadisticas"],
    queryFn: async () => {
      const res = await fetch("/api/moleculoteca/estadisticas");

      if (!res.ok) throw new Error("Error al cargar estadísticas");

      return res.json();
    },
  });

  const taxa = useMemo<MuestrasTaxon[]>(
    () => data?.pages.flatMap((p) => p.taxa) ?? [],
    [data],
  );
  const total = data?.pages[0]?.total ?? 0;

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

  const toggle = (key: MuestraField) => {
    setActivos((prev) => {
      const next = new Set(prev);

      if (next.has(key)) next.delete(key);
      else next.add(key);

      return next;
    });
  };

  const resetAll = () => {
    setActivos(new Set());
    setBusqueda("");
    setFamiliasFilter([]);
    setGenerosFilter([]);
  };

  const hasFilters =
    activos.size > 0 ||
    busqueda.trim().length > 0 ||
    familiasFilter.length > 0 ||
    generosFilter.length > 0;

  return (
    <>
      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div
          className="flex flex-col justify-center rounded-md border p-2"
          style={{borderColor: "#dddddd"}}
        >
          <a
            className="hover:text-gray-900"
            href="https://deepskyblue-beaver-511675.hostingersite.com/diversidad-molecular/"
            rel="noopener noreferrer"
            style={{color: "#666666", fontSize: "13px", fontWeight: 600}}
            target="_blank"
          >
            Diversidad molecular
          </a>
          <a
            className="hover:text-gray-900"
            href="https://www.ncbi.nlm.nih.gov/nuccore/?term=amphibia+ecuador"
            rel="noopener noreferrer"
            style={{color: "#666666", fontSize: "13px", fontWeight: 600}}
            target="_blank"
          >
            GenBank ADN <span style={{color: "#f07304"}}>|</span> ARN
          </a>
          <a
            className="hover:text-gray-900"
            href="https://www.ncbi.nlm.nih.gov/protein/?term=amphibia%20ecuador"
            rel="noopener noreferrer"
            style={{color: "#666666", fontSize: "13px", fontWeight: 600}}
            target="_blank"
          >
            GenBank proteínas
          </a>
          <a
            className="hover:text-gray-900"
            href="https://www.ncbi.nlm.nih.gov/bioproject/?term=amphibia%20ecuador"
            rel="noopener noreferrer"
            style={{color: "#666666", fontSize: "13px", fontWeight: 600}}
            target="_blank"
          >
            GenBank bioproyectos
          </a>
        </div>
        {MUESTRA_FIELDS.slice(0, 5).map((f) => (
          <StatCard
            key={f.key}
            label={<MuestraLabel label={f.label} />}
            value={stats?.especies_por_muestra[f.key] ?? 0}
          />
        ))}
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
        <aside className="lg:w-80 lg:flex-shrink-0">
          <div className="sticky top-4 flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="flex-shrink-0 px-6 pt-6 pb-2">
              <SpeciesSearchInput
                apiPath="/api/moleculoteca/especies"
                placeholder="Nombre científico o común"
                value={busqueda}
                onChange={setBusqueda}
              />
              {busqueda && (
                <p className="mt-2 text-xs text-gray-500">
                  Filtrando: &quot;{busqueda}&quot;
                </p>
              )}
            </div>

            <div className="flex flex-shrink-0 justify-end px-6 py-2">
              <Button
                className="gap-1.5 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-normal text-gray-700 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50"
                disabled={!hasFilters}
                type="button"
                variant="ghost"
                onClick={resetAll}
              >
                <RotateCcw className="h-3.5 w-3.5 shrink-0 text-black" />
                Limpiar
              </Button>
            </div>

            <div className="mt-2 max-h-[75vh] min-h-0 w-full flex-1 overflow-y-auto border-t">
              <Accordion
                className="w-full [&>[data-slot=accordion-item]]:border-b [&>[data-slot=accordion-item]]:px-6"
                defaultValue={["tipoMuestra"]}
                type="multiple"
              >
                <AccordionButtonFilter
                  apiPath="/api/moleculoteca/familias"
                  label="Familia"
                  selected={familiasFilter}
                  onChange={setFamiliasFilter}
                />
                <AccordionButtonFilter
                  apiPath="/api/moleculoteca/generos"
                  label="Género"
                  selected={generosFilter}
                  onChange={setGenerosFilter}
                />
                <AccordionItem value="tipoMuestra">
                  <AccordionTrigger className="!items-start">
                    <div className="flex flex-col items-start">
                      <span className="font-semibold">Tipo de muestra</span>
                      {activos.size > 0 && (
                        <span className="mt-1 text-xs font-normal text-gray-500">
                          {Array.from(activos)
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
                        const active = activos.has(f.key);

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
                            onClick={() => toggle(f.key)}
                          >
                            <MuestraLabel label={f.label} />
                          </Button>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {isLoading && taxa.length === 0 ? (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              {Array.from({length: 12}).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 border-b border-gray-100 px-3 py-1.5 last:border-b-0"
                >
                  <div className="min-w-0 flex-1 lg:max-w-xs">
                    <div
                      className="h-3.5 animate-pulse rounded bg-gray-100"
                      style={{width: `${String(60 + ((i * 17) % 35))}%`}}
                    />
                  </div>
                  <div className="flex flex-1 justify-around">
                    {Array.from({length: 6}).map((__, j) => (
                      <div
                        key={j}
                        className="h-3.5 w-3.5 animate-pulse rounded-sm bg-gray-100"
                      />
                    ))}
                  </div>
                  <div className="shrink-0" style={{width: "72px"}} />
                  <div className="shrink-0" style={{width: "20px"}} />
                </div>
              ))}
            </div>
          ) : taxa.length > 0 ? (
            <>
              <div
                className={`overflow-hidden rounded-lg border border-gray-200 transition-opacity duration-200 ${
                  isFetching && !isFetchingNextPage && !verTodoLoading
                    ? "opacity-60"
                    : "opacity-100"
                }`}
              >
                <div className="sticky top-0 z-10 hidden items-center gap-2 border-b border-gray-200 bg-white px-3 py-1.5 text-[10px] font-semibold tracking-wide text-gray-500 lg:flex">
                  <div className="min-w-0 flex-1 lg:max-w-xs">Especie</div>
                  <div className="flex-1">
                    <div
                      className="grid gap-0.5"
                      style={{gridTemplateColumns: `repeat(${String(MUESTRA_FIELDS.length)}, minmax(0, 1fr))`}}
                    >
                      {MUESTRA_FIELDS.map((f) => (
                        <div
                          key={f.key}
                          className="text-center break-words whitespace-normal leading-tight"
                        >
                          <MuestraLabel label={f.label} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div
                    className="shrink-0 text-center break-words whitespace-normal leading-tight"
                    style={{width: "72px"}}
                  >
                    Secuencias Genbank
                  </div>
                  <div className="shrink-0" style={{width: "20px"}} />
                </div>

                {taxa.map((t) => (
                  <div
                    key={t.taxon_id}
                    className="hover:bg-muted/30 group flex flex-col gap-2 border-b border-gray-100 px-3 py-1.5 transition-colors last:border-b-0 lg:flex-row lg:items-center"
                  >
                    <Link
                      className="block min-w-0 flex-1 no-underline lg:max-w-xs"
                      href={`/moleculoteca/${String(t.taxon_id)}`}
                    >
                      <p className="truncate leading-tight">
                        <span
                          className="text-xs font-semibold italic"
                          style={{color: "#666666"}}
                        >
                          {t.nombre_cientifico}
                        </span>
                        {t.nombre_comun && (
                          <>
                            <span className="mx-1.5 text-[11px]" style={{color: "#f07304"}}>
                              |
                            </span>
                            <span className="text-[11px]" style={{color: "#888888"}}>
                              {t.nombre_comun}
                            </span>
                          </>
                        )}
                      </p>
                    </Link>

                    <Link
                      className="block flex-1 no-underline"
                      href={`/moleculoteca/${String(t.taxon_id)}`}
                    >
                      <div
                        className="grid gap-0.5"
                        style={{gridTemplateColumns: `repeat(${String(MUESTRA_FIELDS.length)}, minmax(0, 1fr))`}}
                      >
                        {MUESTRA_FIELDS.map((field) => {
                          const value = (t as Record<string, unknown>)[field.count] as number;
                          const active = value > 0;

                          if (!active) {
                            return (
                              <div
                                key={field.key}
                                className="flex min-w-0 items-center justify-center"
                              />
                            );
                          }

                          return (
                            <TooltipProvider key={field.key} delayDuration={100}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex min-w-0 cursor-default items-center justify-center">
                                    <Check
                                      className="h-3.5 w-3.5"
                                      strokeWidth={3}
                                      style={{color: "#2d6e2d"}}
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="text-[10px]">
                                  {field.label}: {value}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          );
                        })}
                      </div>
                    </Link>

                    {t.count_genbank > 0 ? (
                      <TooltipProvider delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className="flex shrink-0 cursor-default items-center justify-center"
                              style={{width: "72px"}}
                            >
                              <Check
                                className="h-3.5 w-3.5"
                                strokeWidth={3}
                                style={{color: "#2d6e2d"}}
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="text-[10px]">
                            Secuencias GenBank: {t.count_genbank}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <div className="shrink-0" style={{width: "72px"}} />
                    )}

                    <Link
                      aria-label="Ver detalle"
                      className="moleculoteca-detail-arrow flex shrink-0 items-center justify-center no-underline"
                      href={`/moleculoteca/${String(t.taxon_id)}`}
                      style={{width: "20px"}}
                    >
                      <MoveRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-center gap-4">
                <p className="text-xs text-gray-400">
                  {`Mostrando 1 - ${taxa.length.toLocaleString()} de ${total.toLocaleString()} ${
                    total === 1 ? "especie" : "especies"
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
            <div className="bg-card rounded-lg border p-12 text-center">
              <div className="mb-4 text-4xl">🧬</div>
              <p className="text-muted-foreground text-lg">
                No hay especies que cumplan los filtros seleccionados.
              </p>
            </div>
          ) : (
            <div className="bg-card rounded-lg border p-12 text-center">
              <div className="mb-4 text-4xl">🧬</div>
              <p className="text-muted-foreground text-lg">No hay especies con muestras.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
