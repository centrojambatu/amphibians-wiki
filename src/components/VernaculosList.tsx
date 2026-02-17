"use client";

import Link from "next/link";
import {TaxonNombre} from "@/app/sapopedia/nombres/get-taxon-nombres";

interface VernaculosListProps {
  nombres: TaxonNombre[];
}

export default function VernaculosList({nombres}: VernaculosListProps) {
  if (nombres.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted p-8 text-center">
        <p className="text-muted-foreground">No hay nombres vernáculos disponibles.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {nombres.map((taxon) => {
        const href = taxon.nombre_cientifico
          ? `/sapopedia/species/${taxon.nombre_cientifico.replace(/ /g, "-")}`
          : `/sapopedia/species/${taxon.id_taxon}`;

        return (
          <div
            key={`${taxon.id_taxon}-${taxon.nombre_comun}`}
            className="relative flex items-center gap-4 rounded-md border border-border bg-card px-4 py-3 transition-all hover:border-border hover:bg-muted/50"
          >
            <div className="min-w-0 flex-1">
              <Link
                className="cursor-pointer text-sm font-medium text-foreground hover:text-primary hover:underline"
                href={href}
              >
                {taxon.nombre_comun_completo || taxon.nombre_comun}
              </Link>
              {taxon.nombre_cientifico && (
                <div className="mt-1 text-xs text-muted-foreground italic">
                  {taxon.nombre_cientifico}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
