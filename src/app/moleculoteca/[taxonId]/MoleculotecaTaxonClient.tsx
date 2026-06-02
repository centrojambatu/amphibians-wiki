"use client";

import type {ColeccionMuestra} from "./get-coleccion-muestras";

import Link from "next/link";
import {MoveLeft, RotateCcw} from "lucide-react";
import {useMemo, useState} from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {Button} from "@/components/ui/button";
import ColeccionCard from "@/components/ColeccionCard";

import {MUESTRA_FIELDS, type MuestraField} from "../get-moleculoteca-taxa";

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

export default function MoleculotecaTaxonClient({
  muestras,
  nombreCientifico,
}: {
  muestras: ColeccionMuestra[];
  nombreCientifico: string;
}) {
  const [activos, setActivos] = useState<Set<MuestraField>>(new Set());

  const counts = useMemo(() => {
    const c = {} as Record<MuestraField, number>;

    MUESTRA_FIELDS.forEach((f) => {
      c[f.key] = muestras.filter((m) => m[f.key]).length;
    });

    return c;
  }, [muestras]);

  const filtradas = useMemo(() => {
    if (activos.size === 0) return muestras;

    return muestras.filter((m) => Array.from(activos).every((k) => m[k]));
  }, [muestras, activos]);

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

      <h1 className="mb-1 text-2xl font-bold text-gray-900">
        Muestras biológicas de <span className="italic">{nombreCientifico}</span>
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
                        const count = counts[f.key];
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
          <div className="text-muted-foreground mb-3 text-xs">
            {filtradas.length} {filtradas.length === 1 ? "registro" : "registros"}
          </div>

          <div className="flex flex-col gap-1.5">
            {filtradas.map((m) => {
              const href = `/sapopedia/species/${encodeURIComponent(speciesSlug)}/colecciones/${String(m.id_coleccion)}?from=moleculoteca&taxonId=${String(m.taxon_id)}`;

              return <ColeccionCard key={m.id_coleccion} coleccion={m} href={href} />;
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
