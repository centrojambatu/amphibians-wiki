"use client";

import {useState, useMemo} from "react";
import VernaculosList from "@/components/VernaculosList";
import VernaculosFiltersPanel from "@/components/VernaculosFiltersPanel";
import {TaxonNombre} from "./get-taxon-nombres";

interface Idioma {
  id: number;
  nombre: string;
  codigo: string;
}

interface VernaculosContentProps {
  nombres: TaxonNombre[];
  idiomas: readonly Idioma[];
  idiomaActual: number | null;
  onIdiomaChange: (idiomaId: number | null) => void;
}

function filterBySearchQuery(nombres: TaxonNombre[], query: string): TaxonNombre[] {
  if (!query.trim()) {
    return nombres;
  }

  const queryLower = query.toLowerCase().trim();

  return nombres.filter((taxon) => {
    const nombreComun = (taxon.nombre_comun || "").toLowerCase();
    const nombreCientifico = (taxon.nombre_cientifico || "").toLowerCase();

    return nombreComun.includes(queryLower) || nombreCientifico.includes(queryLower);
  });
}

export default function VernaculosContent({
  nombres,
  idiomas,
  idiomaActual,
  onIdiomaChange,
}: VernaculosContentProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const nombresFiltrados = useMemo(
    () => filterBySearchQuery(nombres, searchQuery),
    [nombres, searchQuery],
  );

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
      {/* Panel de filtros - lado izquierdo */}
      <div className="order-2 w-full flex-shrink-0 lg:order-1 lg:w-80">
        <VernaculosFiltersPanel
          idiomas={idiomas}
          idiomaActual={idiomaActual}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onIdiomaChange={onIdiomaChange}
        />
      </div>

      {/* Contenido principal */}
      <div className="order-1 min-w-0 flex-1 lg:order-2">
        <VernaculosList nombres={nombresFiltrados} idiomas={idiomas} />
      </div>
    </div>
  );
}
