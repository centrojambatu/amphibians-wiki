"use client";

import {TaxonNombre} from "@/app/sapopedia/nombres/get-taxon-nombres";

interface RenacuajosListProps {
  nombres: TaxonNombre[];
}

export default function RenacuajosList({nombres}: RenacuajosListProps) {
  if (nombres.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted p-8 text-center">
        <p className="text-muted-foreground">No hay nombres de renacuajos disponibles.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {nombres.map((taxon, index) => {
        // Como los renacuajos no tienen taxon_id asociado, usamos el índice como key
        const key = taxon.id_taxon && taxon.id_taxon !== 0 
          ? `${taxon.id_taxon}-${taxon.nombre_comun}-${index}`
          : `renacuajo-${index}-${taxon.nombre_comun}`;

        return (
          <div
            key={key}
            className="relative flex items-center gap-4 rounded-md border border-border bg-card px-4 py-3 transition-all hover:border-border hover:bg-muted/50"
          >
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-foreground">
                {taxon.nombre_comun_completo || taxon.nombre_comun}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
