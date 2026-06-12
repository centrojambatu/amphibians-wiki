"use client";

import { useState, useCallback, type ReactNode } from "react";
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
  const handlePendingChange = useCallback((p: boolean) => setIsPending(p), []);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="w-full flex-shrink-0 lg:w-80">
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
        {isPending && (
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
            Cargando resultados…
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
