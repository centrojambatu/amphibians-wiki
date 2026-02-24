"use client";

import Link from "next/link";
import {TaxonNombre} from "@/app/sapopedia/nombres/get-taxon-nombres";

interface Idioma {
  id: number;
  nombre: string;
  codigo: string;
}

interface VernaculosListProps {
  nombres: TaxonNombre[];
  idiomas?: readonly Idioma[];
}

export default function VernaculosList({nombres, idiomas = []}: VernaculosListProps) {
  if (nombres.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted p-8 text-center">
        <p className="text-muted-foreground">No hay nombres vernáculos disponibles.</p>
      </div>
    );
  }

  // Función para construir la URL según el rank taxonómico
  const getTaxonUrl = (taxon: TaxonNombre): string => {
    const rankId = taxon.rank_id;

    // rank_id: 4=Orden, 5=Familia, 6=Género, 7=Especie
    switch (rankId) {
      case 4: // Orden
        return `/sapopedia/order/${taxon.id_taxon}`;
      case 5: // Familia
        return `/sapopedia/family/${taxon.id_taxon}`;
      case 6: // Género
        return `/sapopedia/genus/${taxon.id_taxon}`;
      case 7: // Especie
        if (taxon.nombre_cientifico) {
          return `/sapopedia/species/${taxon.nombre_cientifico.replace(/ /g, "-")}`;
        }
        return `/sapopedia/species/${taxon.id_taxon}`;
      default:
        // Fallback: asumir especie si no hay rank_id
        if (taxon.nombre_cientifico) {
          return `/sapopedia/species/${taxon.nombre_cientifico.replace(/ /g, "-")}`;
        }
        return `/sapopedia/species/${taxon.id_taxon}`;
    }
  };

  return (
    <div className="space-y-2">
      {nombres.map((taxon) => {
        const href = getTaxonUrl(taxon);

        return (
          <div
            key={`${taxon.id_taxon}-${taxon.nombre_comun}`}
            className="relative flex items-center gap-4 rounded-md border border-border bg-card px-4 py-3 transition-all hover:border-border hover:bg-muted/50"
          >
            <div className="min-w-0 flex-1">
              <Link
                className="cursor-pointer text-sm font-medium text-foreground hover:text-primary hover:no-underline"
                href={href}
              >
                {taxon.nombre_comun_completo || taxon.nombre_comun}
                {taxon.catalogo_awe_idioma_id && idiomas.length > 0 && (
                  <>
                    <span className="mx-2" style={{color: "#f07304"}}>|</span>
                    <span className="text-xs font-normal text-gray-500">
                      {idiomas.find((i) => i.id === taxon.catalogo_awe_idioma_id)?.nombre ||
                        ""}
                    </span>
                  </>
                )}
              </Link>
              {/* Especie: nombre científico; Orden/Familia/Género: nombre del taxon */}
              {(taxon.rank_id === 7 ? taxon.nombre_cientifico : taxon.taxon) && (
                <div className="mt-1 text-xs text-muted-foreground italic">
                  {taxon.rank_id === 7 ? taxon.nombre_cientifico : taxon.taxon}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
