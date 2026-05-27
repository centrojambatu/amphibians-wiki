"use client";

import Link from "next/link";
import {ArrowLeft, RotateCcw} from "lucide-react";
import {useMemo, useState} from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {Button} from "@/components/ui/button";

import {MUESTRA_FIELDS, type MuestraField} from "../get-moleculoteca-taxa";

import type {ColeccionMuestra} from "./get-coleccion-muestras";

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
        className="hover:text-primary mb-4 inline-flex items-center gap-2 text-sm text-gray-600 no-underline"
        href="/moleculoteca"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Link>

      <h1 className="mb-1 text-2xl font-bold text-gray-900">
        Muestras biológicas de <span className="italic">{nombreCientifico}</span>
      </h1>
      <p className="text-muted-foreground mb-6 text-sm">
        {muestras.length} registros con muestras
      </p>

      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
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
                            <span className="truncate">{f.label}</span>
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

          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 text-left text-[10px] font-semibold tracking-wide text-gray-500 uppercase">
            <tr>
              <th className="px-3 py-2">Catálogo</th>
              <th className="px-3 py-2">Fecha</th>
              <th className="px-3 py-2">Localidad</th>
              <th className="px-3 py-2">Estadio / Sexo</th>
              {MUESTRA_FIELDS.map((f) => (
                <th key={f.key} className="px-2 py-2 text-center">
                  {f.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtradas.map((m, i) => {
              const cat =
                m.catalogo_museo && m.numero_museo
                  ? `${m.catalogo_museo} ${m.numero_museo}`
                  : m.numero_museo || m.num_colector || `#${String(m.id_coleccion)}`;
              const href = `/sapopedia/species/${encodeURIComponent(speciesSlug)}/colecciones/${String(m.id_coleccion)}`;
              const cellCls = "px-3 py-2 text-gray-700 group-hover:bg-blue-50/40";

              return (
                <tr
                  key={m.id_coleccion}
                  className={`group cursor-pointer transition-colors ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                  onClick={() => {
                    window.location.href = href;
                  }}
                >
                  <td className={`px-3 py-2 font-medium text-gray-900 group-hover:bg-blue-50/40`}>
                    <Link
                      className="hover:text-primary text-[#4ba24b] underline"
                      href={href}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {cat}
                    </Link>
                  </td>
                  <td className={cellCls}>{m.fecha_col || "—"}</td>
                  <td className={cellCls}>
                    <div className="line-clamp-1">{m.localidad || "—"}</div>
                    {m.provincia && <div className="text-[10px] text-gray-500">{m.provincia}</div>}
                  </td>
                  <td className={cellCls}>
                    {[m.estadio, m.sexo].filter(Boolean).join(" · ") || "—"}
                  </td>
                  {MUESTRA_FIELDS.map((f) => (
                    <td key={f.key} className="px-2 py-2 text-center group-hover:bg-blue-50/40">
                      {m[f.key] ? (
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-[10px] font-bold text-green-700">
                          ✓
                        </span>
                      ) : (
                        <span className="text-gray-300">·</span>
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
          </div>
        </div>
      </div>
    </main>
  );
}
