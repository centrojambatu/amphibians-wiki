"use client";

import { useState, useCallback, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import SapotecaFiltersPanel from "./sapoteca-filters-panel";
import type { TiposPublicacionAgrupados } from "@/app/sapoteca/get-tipos-publicacion";

interface SapotecaContentLayoutProps {
  tiposPublicacion: TiposPublicacionAgrupados;
  años: number[];
  children: ReactNode;
}

export default function SapotecaContentLayout({
  tiposPublicacion,
  años,
  children,
}: SapotecaContentLayoutProps) {
  const [isPending, setIsPending] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const handlePendingChange = useCallback((p: boolean) => setIsPending(p), []);

  // Conteo de filtros activos (leídos de la URL, fuente de verdad del panel)
  const searchParams = useSearchParams();
  const activeFilterCount = [
    searchParams.getAll("titulo").filter((t) => t.trim().length > 0).length > 0,
    (searchParams.get("autor") || "").trim().length > 0,
    (searchParams.get("años") || "").length > 0,
    (searchParams.get("tipos") || "").length > 0,
    searchParams.get("indexada") != null,
    searchParams.get("formatoImpreso") != null,
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Sidebar de filtros — solo desktop */}
      <div className="hidden flex-shrink-0 lg:block lg:w-80">
        <SapotecaFiltersPanel
          tiposPublicacion={tiposPublicacion}
          años={años}
          onPendingChange={handlePendingChange}
        />
      </div>

      <div
        className="min-w-0 flex-1 transition-opacity duration-200"
        style={{ opacity: isPending ? 0.5 : 1 }}
      >
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

        {isPending && (
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
            Cargando resultados…
          </div>
        )}
        {children}
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
            style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
            type="button"
            onClick={() => setShowMobileFilters(false)}
          />
          <div
            className="absolute right-0 bottom-0 left-0 flex flex-col rounded-t-2xl bg-white shadow-2xl"
            style={{ maxHeight: "90vh" }}
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
            <div className="min-h-0 flex-1 overflow-y-auto">
              <SapotecaFiltersPanel
                tiposPublicacion={tiposPublicacion}
                años={años}
                onPendingChange={handlePendingChange}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
