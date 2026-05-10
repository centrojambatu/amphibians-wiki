"use client";

import {ExternalLink, RotateCcw} from "lucide-react";
import Link from "next/link";
import {useRouter, useSearchParams} from "next/navigation";
import {useEffect, useMemo, useState} from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {Button} from "@/components/ui/button";
import SpeciesSearchInput from "@/components/SpeciesSearchInput";

import {MUESTRA_FIELDS, type MuestraField, type MuestrasTaxon} from "./get-moleculoteca-taxa";

export default function MoleculotecaListClient({taxa}: {taxa: MuestrasTaxon[]}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [busqueda, setBusqueda] = useState(() => searchParams.get("busqueda") || "");
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [activos, setActivos] = useState<Set<MuestraField>>(new Set());

  useEffect(() => {
    if (isInitialMount) {
      setIsInitialMount(false);

      return;
    }
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams();

      if (busqueda.trim()) params.set("busqueda", busqueda.trim());
      const queryString = params.toString();

      router.push(`/moleculoteca${queryString ? `?${queryString}` : ""}`, {scroll: false});
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [busqueda, router, isInitialMount]);

  const filtrados = useMemo(() => {
    if (activos.size === 0) return taxa;

    return taxa.filter((t) =>
      Array.from(activos).every((k) => {
        const field = MUESTRA_FIELDS.find((f) => f.key === k);

        if (!field) return false;

        return (t as any)[field.count] > 0;
      }),
    );
  }, [taxa, activos]);

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
  };

  const hasFilters = activos.size > 0 || busqueda.trim().length > 0;

  return (
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
                          {f.label}
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
        <div className="text-muted-foreground mb-3 text-xs">
          {filtrados.length} {filtrados.length === 1 ? "especie" : "especies"} con muestras
        </div>

        {filtrados.length === 0 ? (
          <div className="bg-card rounded-lg border p-12 text-center">
            <div className="mb-4 text-4xl">🧬</div>
            <p className="text-muted-foreground text-lg">
              No hay especies que cumplan los filtros seleccionados.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtrados.map((t) => (
              <div
                key={t.taxon_id}
                className="bg-card hover:border-primary group flex flex-col gap-3 rounded-lg border px-4 py-2.5 transition-colors lg:flex-row lg:items-center"
              >
                <Link
                  className="block min-w-0 flex-1 no-underline lg:max-w-xs"
                  href={`/moleculoteca/${String(t.taxon_id)}`}
                >
                  <p className="group-hover:text-primary truncate text-sm font-semibold italic text-gray-900">
                    {t.nombre_cientifico}
                  </p>
                  <p className="truncate text-[11px] text-gray-500">
                    {[t.nombre_comun, t.orden, t.familia].filter(Boolean).join(" · ") || "—"}
                  </p>
                </Link>

                <Link
                  className="block flex-1 no-underline"
                  href={`/moleculoteca/${String(t.taxon_id)}`}
                >
                  <div className="grid grid-cols-4 gap-1 sm:grid-cols-8">
                    {MUESTRA_FIELDS.map((field) => {
                      const value = (t as any)[field.count] as number;
                      const active = value > 0;

                      return (
                        <div
                          key={field.key}
                          className={`flex flex-col items-center rounded px-1 py-1 text-[10px] leading-tight ${
                            active ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-400"
                          }`}
                          title={field.label}
                        >
                          <span className="truncate text-[9px] uppercase">{field.label}</span>
                          <span className="font-mono text-xs font-bold">{value}</span>
                        </div>
                      );
                    })}
                  </div>
                </Link>

                <div className="flex shrink-0 items-center gap-3 text-[11px] text-gray-500">
                  <span className="whitespace-nowrap">
                    Total: <span className="font-semibold">{t.total_registros}</span>
                  </span>
                  {t.nombre_cientifico && (
                    <a
                      className="inline-flex items-center gap-1 rounded border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-700 no-underline hover:bg-orange-100"
                      href={`https://www.morphosource.org/catalog/media?q=${encodeURIComponent(t.nombre_cientifico)}`}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      MorphoSource
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
