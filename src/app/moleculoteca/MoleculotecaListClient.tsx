"use client";

import {ExternalLink, RotateCcw} from "lucide-react";
import Link from "next/link";
import {useRouter, useSearchParams} from "next/navigation";
import {useEffect, useMemo, useState} from "react";
import {useQuery} from "@tanstack/react-query";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {Button} from "@/components/ui/button";
import SpeciesSearchInput from "@/components/SpeciesSearchInput";

import {MUESTRA_FIELDS, type MuestraField, type MuestrasTaxon} from "./get-moleculoteca-taxa";

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

export default function MoleculotecaListClient({taxa}: {taxa: MuestrasTaxon[]}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [busqueda, setBusqueda] = useState(() => searchParams.get("busqueda") || "");
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [activos, setActivos] = useState<Set<MuestraField>>(new Set());
  const [familiasFilter, setFamiliasFilter] = useState<string[]>([]);
  const [generosFilter, setGenerosFilter] = useState<string[]>([]);

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
    return taxa.filter((t) => {
      if (activos.size > 0) {
        const allMuestras = Array.from(activos).every((k) => {
          const field = MUESTRA_FIELDS.find((f) => f.key === k);

          if (!field) return false;

          return (t as any)[field.count] > 0;
        });

        if (!allMuestras) return false;
      }
      if (familiasFilter.length > 0 && !(t.familia && familiasFilter.includes(t.familia))) {
        return false;
      }
      if (generosFilter.length > 0 && !(t.genero && generosFilter.includes(t.genero))) {
        return false;
      }

      return true;
    });
  }, [taxa, activos, familiasFilter, generosFilter]);

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
                  <div className="flex items-center gap-2">
                    <p className="group-hover:text-primary truncate text-sm font-semibold italic text-gray-900">
                      {t.nombre_cientifico}
                    </p>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                      <span className="font-mono text-[11px] font-semibold text-gray-800">
                        {t.total_registros}
                      </span>
                      {t.total_registros === 1 ? "registro" : "registros"}
                    </span>
                  </div>
                  {t.nombre_comun && (
                    <p className="truncate text-[11px] text-gray-600">{t.nombre_comun}</p>
                  )}
                  {(t.orden || t.familia || t.genero) && (
                    <p className="mt-0.5 truncate text-[10px] text-gray-400">
                      {[t.orden, t.familia, t.genero].filter(Boolean).join(" · ")}
                    </p>
                  )}
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
                          className={`flex min-w-0 flex-col items-center justify-center rounded px-1 py-1 text-[10px] leading-tight ${
                            active ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-400"
                          }`}
                          title={field.label}
                        >
                          <span className="w-full text-center text-[9px] leading-tight break-words whitespace-normal uppercase">
                            {field.label}
                          </span>
                          <span className="mt-0.5 font-mono text-xs font-bold">{value}</span>
                        </div>
                      );
                    })}
                  </div>
                </Link>

                <div className="flex shrink-0 flex-col items-stretch gap-1 text-[11px] text-gray-500">
                  {t.nombre_cientifico && (
                    <>
                      <a
                        className="inline-flex items-center justify-between gap-1 rounded-md border border-gray-200 px-2.5 py-1 text-[11px] font-medium text-gray-600 no-underline transition-colors hover:bg-gray-50 hover:text-gray-900"
                        href={`https://www.morphosource.org/catalog/media?q=${(t.nombre_cientifico || "").split(/\s+/).map(encodeURIComponent).join("+")}`}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        MorphoSource
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      <a
                        className="inline-flex items-center justify-between gap-1 rounded-md border border-gray-200 px-2.5 py-1 text-[11px] font-medium text-gray-600 no-underline transition-colors hover:bg-gray-50 hover:text-gray-900"
                        href={`https://www.ncbi.nlm.nih.gov/search/all/?term=${(t.nombre_cientifico || "").split(/\s+/).map(encodeURIComponent).join("+")}`}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        GenBank
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </>
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
