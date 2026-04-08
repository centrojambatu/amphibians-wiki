"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import RedListStatus from "@/components/RedListStatus";
import type { EspecieTabla } from "@/app/api/mapoteca/tabla/route";

const PAGE_SIZE = 20;

const VALID_RL = ["LC", "NT", "VU", "EN", "CR", "EW", "EX", "DD"] as const;
type RLStatus = (typeof VALID_RL)[number];

const NOMBRE_A_SIGLA: Record<string, RLStatus> = {
  "preocupación menor": "LC",
  "casi amenazada": "NT",
  "vulnerable": "VU",
  "en peligro": "EN",
  "peligro crítico": "CR",
  "posiblemente extinta": "CR",
  "extinto en estado silvestre": "EW",
  "extinto": "EX",
  "datos insuficientes": "DD",
};

function parseListaRoja(raw: string | null): RLStatus | null {
  if (!raw) return null;
  const nombre = raw.split(",")[0].trim().toLowerCase();
  if (nombre in NOMBRE_A_SIGLA) return NOMBRE_A_SIGLA[nombre];
  // fallback: intentar sigla directa
  const sigla = nombre.toUpperCase();
  return VALID_RL.includes(sigla as RLStatus) ? (sigla as RLStatus) : null;
}

interface MapotecaTablaProps {
  provinciaFilter?: string[];
  pisoFilter?: string[];
  snapFilter?: string[];
  especieFilter?: string[];
  catalogoFilter?: string[];
  localidadesFilter?: string[];
  elevacionMin?: number;
  elevacionMax?: number;
}

export default function MapotecaTabla({
  provinciaFilter,
  pisoFilter,
  snapFilter,
  especieFilter,
  catalogoFilter,
  localidadesFilter,
  elevacionMin,
  elevacionMax,
}: MapotecaTablaProps) {
  const [especies, setEspecies] = useState<EspecieTabla[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const buildParams = useCallback(() => {
    const params = new URLSearchParams();
    if (provinciaFilter && provinciaFilter.length > 0) params.set("provincias", provinciaFilter.join(","));
    if (pisoFilter && pisoFilter.length > 0) params.set("pisos", pisoFilter.join(","));
    if (snapFilter && snapFilter.length > 0) params.set("snaps", snapFilter.join(","));
    if (especieFilter && especieFilter.length > 0) params.set("especies", especieFilter.join("||"));
    if (catalogoFilter && catalogoFilter.length > 0) params.set("catalogos", catalogoFilter.join("||"));
    if (localidadesFilter && localidadesFilter.length > 0) params.set("localidades", localidadesFilter.join(","));
    if (elevacionMin != null) params.set("elevacion_min", String(elevacionMin));
    if (elevacionMax != null) params.set("elevacion_max", String(elevacionMax));
    return params;
  }, [provinciaFilter, pisoFilter, snapFilter, especieFilter, catalogoFilter, localidadesFilter, elevacionMin, elevacionMax]);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    const params = buildParams();
    fetch(`/api/mapoteca/tabla?${params.toString()}`)
      .then((r) => r.json())
      .then((json) => setEspecies(json.data ?? []))
      .catch(() => setEspecies([]))
      .finally(() => setLoading(false));
  }, [buildParams]);

  const totalPages = Math.ceil(especies.length / PAGE_SIZE);
  const paginated = especies.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <p className="text-lg font-semibold text-gray-800">
          Especies{" "}
          <span className="text-[#f07304]">|</span>{" "}
          <span className="text-gray-500 text-base font-normal">
            {loading ? "cargando..." : `${especies.length} registros`}
          </span>
        </p>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3">Orden</th>
              <th className="px-4 py-3">Familia</th>
              <th className="px-4 py-3">Género</th>
              <th className="px-4 py-3">Especie</th>
              <th className="px-4 py-3">Nombre común</th>
              <th className="px-4 py-3 text-center">Lista Roja</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#f07304] border-t-transparent" />
                    Cargando especies...
                  </div>
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No se encontraron especies con los filtros aplicados.
                </td>
              </tr>
            ) : (
              paginated.map((sp, i) => {
                const slug = sp.nombre_cientifico.replaceAll(" ", "-");
                const rl = parseListaRoja(sp.lista_roja);
                return (
                  <tr
                    key={sp.taxon_id}
                    className={`border-b border-gray-50 transition-colors hover:bg-orange-50/40 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}
                  >
                    <td className="px-4 py-2.5 text-gray-600">{sp.orden ?? "—"}</td>
                    <td className="px-4 py-2.5 text-gray-600">{sp.familia ?? "—"}</td>
                    <td className="px-4 py-2.5 italic text-gray-700">{sp.genero ?? "—"}</td>
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/sapopedia/species/${slug}`}
                        className="italic text-gray-800 underline-offset-2 hover:underline hover:text-[#f07304] transition-colors"
                      >
                        {sp.nombre_cientifico}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-gray-600">{sp.nombre_comun ?? "—"}</td>
                    <td className="px-4 py-2.5 text-center">
                      {rl ? (
                        <RedListStatus status={rl} showTooltip />
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3">
          <p className="text-xs text-gray-500">
            Página {page} de {totalPages} — {especies.length} especies
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-30"
            >
              ← Anterior
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p = totalPages <= 7 ? i + 1 : page <= 4 ? i + 1 : page >= totalPages - 3 ? totalPages - 6 + i : page - 3 + i;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${p === page ? "bg-[#f07304] text-white" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-30"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
