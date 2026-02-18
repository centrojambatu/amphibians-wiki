"use client";

import {useState, useMemo} from "react";
import NombresAccordion from "@/components/NombresAccordion";
import NombresCompartidos from "@/components/NombresCompartidos";
import NombresFiltersPanel from "@/components/NombresFiltersPanel";
import {NombreGroup} from "@/app/sapopedia/nombres/get-taxon-nombres";
import {
  NombresCompartidosPorFamilia,
  NombresCompartidosPorGenero,
} from "@/app/sapopedia/nombres/get-nombres-compartidos";

interface Idioma {
  id: number;
  nombre: string;
  codigo: string;
}

interface NombresContentProps {
  ordenes: NombreGroup[];
  idiomas: readonly Idioma[];
  idiomaActual: number;
}

function filterBySearchQuery(ordenes: NombreGroup[], query: string): NombreGroup[] {
  if (!query.trim()) {
    return ordenes;
  }

  const queryLower = query.toLowerCase().trim();

  return ordenes
    .map((orden) => {
      const familiasFiltradas = orden.children
        ?.map((familia) => {
          const generosFiltrados = familia.children
            ?.map((genero) => {
              const nombresFiltrados = genero.nombres.filter((taxon) => {
                const nombreComun = (taxon.nombre_comun || "").toLowerCase();
                const nombreCientifico = (taxon.nombre_cientifico || "").toLowerCase();
                const taxonNombre = (taxon.taxon || "").toLowerCase();

                return (
                  nombreComun.includes(queryLower) ||
                  nombreCientifico.includes(queryLower) ||
                  taxonNombre.includes(queryLower)
                );
              });

              if (nombresFiltrados.length === 0) {
                return null;
              }

              return {
                ...genero,
                nombres: nombresFiltrados,
              };
            })
            .filter((g): g is NonNullable<typeof g> => g !== null);

          if (!generosFiltrados || generosFiltrados.length === 0) {
            return null;
          }

          return {
            ...familia,
            children: generosFiltrados,
          };
        })
        .filter((f): f is NonNullable<typeof f> => f !== null);

      if (!familiasFiltradas || familiasFiltradas.length === 0) {
        return null;
      }

      return {
        ...orden,
        children: familiasFiltradas,
      };
    })
    .filter((o): o is NonNullable<typeof o> => o !== null);
}

export default function NombresContent({
  ordenes,
  idiomas,
  idiomaActual,
}: NombresContentProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const ordenesFiltrados = useMemo(
    () => filterBySearchQuery(ordenes, searchQuery),
    [ordenes, searchQuery],
  );

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
      {/* Panel de filtros - lado izquierdo */}
      <div className="order-2 w-full flex-shrink-0 lg:order-1 lg:w-80">
        <NombresFiltersPanel
          idiomas={idiomas}
          idiomaActual={idiomaActual}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />
      </div>

      {/* Contenido principal */}
      <div className="order-1 min-w-0 flex-1 lg:order-2">
        {/* Acordeón de nombres */}
        <div className="mb-8">
          <NombresAccordion ordenes={ordenesFiltrados} />
        </div>
      </div>
    </div>
  );
}
