"use client";

import Link from "next/link";
import {ArrowLeft} from "lucide-react";
import {useMemo, useState} from "react";

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

  return (
    <main className="container mx-auto px-4 py-6">
      <Link
        className="hover:text-primary mb-4 inline-flex items-center gap-2 text-sm text-gray-600 no-underline"
        href="/moleculoteca"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a Moleculoteca
      </Link>

      <h1 className="mb-1 text-2xl font-bold text-gray-900">
        Muestras biológicas de <span className="italic">{nombreCientifico}</span>
      </h1>
      <p className="text-muted-foreground mb-6 text-sm">
        {muestras.length} registros con muestras
      </p>

      <div className="mb-6">
        <h2 className="mb-2 text-xs font-semibold tracking-widest text-gray-500 uppercase">
          Filtrar por tipo de muestra
        </h2>
        <div className="flex flex-wrap gap-2">
          {MUESTRA_FIELDS.map((f) => {
            const active = activos.has(f.key);
            const count = counts[f.key];
            const disabled = count === 0;

            return (
              <button
                key={f.key}
                aria-pressed={active}
                className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                  active
                    ? "border-green-600 bg-green-100 text-green-800"
                    : disabled
                      ? "border-gray-200 bg-gray-50 text-gray-300"
                      : "border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100"
                }`}
                disabled={disabled}
                type="button"
                onClick={() => toggle(f.key)}
              >
                {f.label} <span className="ml-1 font-mono">{count}</span>
              </button>
            );
          })}
          {activos.size > 0 && (
            <button
              className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
              type="button"
              onClick={() => setActivos(new Set())}
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

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

              return (
                <tr key={m.id_coleccion} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                  <td className="px-3 py-2 font-medium text-gray-900">{cat}</td>
                  <td className="px-3 py-2 text-gray-700">{m.fecha_col || "—"}</td>
                  <td className="px-3 py-2 text-gray-700">
                    <div className="line-clamp-1">{m.localidad || "—"}</div>
                    {m.provincia && <div className="text-[10px] text-gray-500">{m.provincia}</div>}
                  </td>
                  <td className="px-3 py-2 text-gray-700">
                    {[m.estadio, m.sexo].filter(Boolean).join(" · ") || "—"}
                  </td>
                  {MUESTRA_FIELDS.map((f) => (
                    <td key={f.key} className="px-2 py-2 text-center">
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
    </main>
  );
}
