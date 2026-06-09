"use client";

import type {ColeccionMuestra} from "./get-coleccion-muestras";

import Link from "next/link";
import {MoveLeft, RotateCcw} from "lucide-react";
import {useMemo, useState} from "react";
import {useInfiniteQuery} from "@tanstack/react-query";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {Button} from "@/components/ui/button";
import ColeccionCard from "@/components/ColeccionCard";

import {MUESTRA_FIELDS, type MuestraField} from "../get-moleculoteca-taxa";

interface MuestrasResponse {
  muestras: ColeccionMuestra[];
  counts: Record<MuestraField, number>;
  nombreCientifico: string;
  total: number;
  totalPaginas: number;
  paginaActual: number;
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

export default function MoleculotecaTaxonClient({taxonId}: {taxonId: number}) {
  const [activos, setActivos] = useState<Set<MuestraField>>(() => new Set());
  const [verTodoLoading, setVerTodoLoading] = useState(false);

  const queryParams = useMemo(() => {
    const p = new URLSearchParams();

    if (activos.size) p.set("tipos_muestra", Array.from(activos).join("||"));

    return p.toString();
  }, [activos]);

  const {data, isLoading, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage} =
    useInfiniteQuery<MuestrasResponse>({
      queryKey: ["moleculoteca-taxon", taxonId, queryParams],
      initialPageParam: 1,
      queryFn: async ({pageParam}) => {
        const params = new URLSearchParams(queryParams);

        params.set("pagina", String(pageParam));
        const res = await fetch(`/api/moleculoteca/${String(taxonId)}?${params.toString()}`);

        if (!res.ok) throw new Error("Error al cargar muestras");

        return res.json();
      },
      getNextPageParam: (lastPage) =>
        lastPage.paginaActual < lastPage.totalPaginas ? lastPage.paginaActual + 1 : undefined,
    });

  const muestras = useMemo<ColeccionMuestra[]>(
    () => data?.pages.flatMap((p) => p.muestras) ?? [],
    [data],
  );
  const total = data?.pages[0]?.total ?? 0;
  const counts = data?.pages[0]?.counts;
  const nombreCientifico = data?.pages[0]?.nombreCientifico ?? "Especie";

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

  const speciesSlug = nombreCientifico.replaceAll(" ", "-");

  return (
    <main className="container mx-auto px-4 py-6">
      <Link
        aria-label="Volver"
        className="text-muted-foreground mb-4 inline-flex items-center hover:no-underline"
        href="/moleculoteca"
      >
        <MoveLeft className="h-8 w-8" strokeWidth={1} />
      </Link>

      <h1 className="mb-1 text-2xl font-bold" style={{color: "#666666"}}>
        Muestras{" "}
        <span className="italic" style={{color: "#2d6e2d"}}>
          {nombreCientifico}
        </span>
      </h1>

      <div className="flex flex-col gap-4 pt-6 lg:flex-row lg:gap-6">
        <aside className="lg:w-80 lg:flex-shrink-0">
          <div className="sticky top-4 flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-shrink-0 justify-end px-6 pt-6 pb-2">
              <Button
                className="gap-1.5 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-normal text-gray-700 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50"
                disabled={activos.size === 0}
                type="button"
                variant="ghost"
                onClick={() => setActivos(new Set())}
              >
                <RotateCcw className="h-3.5 w-3.5 shrink-0 text-black" />
                Limpiar
              </Button>
            </div>
            <div className="mt-2 max-h-[75vh] min-h-0 w-full flex-1 overflow-y-auto border-t px-6">
              <Accordion
                className="w-full [&>[data-slot=accordion-item]]:border-b"
                defaultValue={["tipoMuestra"]}
                type="multiple"
              >
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
                        const count = counts?.[f.key] ?? 0;
                        const disabled = count === 0;

                        return (
                          <Button
                            key={f.key}
                            aria-pressed={active}
                            className="h-auto min-h-[32px] w-full justify-between rounded-md px-2 py-1 text-left text-sm break-words whitespace-normal"
                            disabled={disabled}
                            size="sm"
                            style={{
                              borderColor: active ? undefined : "#e8e8e8",
                              color: active ? undefined : disabled ? "#d1d5db" : "#2d2d2d",
                            }}
                            variant={active ? "default" : "outline"}
                            onClick={() => toggle(f.key)}
                          >
                            <span className="truncate">
                              <MuestraLabel label={f.label} />
                            </span>
                            <span className="ml-2 font-mono text-xs opacity-70">{count}</span>
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
          {isLoading && muestras.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
              <p className="text-gray-600">Cargando muestras...</p>
            </div>
          ) : muestras.length > 0 ? (
            <>
              <div
                className={`flex flex-col gap-1.5 transition-opacity duration-200 ${
                  isFetching && !isFetchingNextPage && !verTodoLoading
                    ? "opacity-60"
                    : "opacity-100"
                }`}
              >
                {muestras.map((m) => {
                  const href = `/sapopedia/species/${encodeURIComponent(speciesSlug)}/colecciones/${String(m.id_coleccion)}?from=moleculoteca&taxonId=${String(m.taxon_id)}`;

                  return <ColeccionCard key={m.id_coleccion} coleccion={m} href={href} />;
                })}
              </div>

              <div className="mt-6 flex items-center justify-center gap-4">
                <p className="text-xs text-gray-400">
                  {`Mostrando 1 - ${muestras.length.toLocaleString()} de ${total.toLocaleString()} ${
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
          ) : activos.size > 0 ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
              <p className="text-gray-600">No hay registros con esos filtros.</p>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
              <p className="text-gray-600">No hay muestras para esta especie.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
