"use client";

import { processHTMLLinks } from "@/lib/process-html-links";

import { CardHeader } from "./ui/card";

interface CardFamiliaHeaderProps {
  fichaFamilia: any;
}

export const CardFamiliaHeader = ({ fichaFamilia }: CardFamiliaHeaderProps) => {
  return (
    <CardHeader className="sticky top-0 z-30 text-center">
      <div className="space-y-4" style={{ padding: "20px 30px 30px" }}>
        {/* Título principal - Jerarquía taxonómica completa */}
        <div className="flex flex-wrap items-baseline justify-center gap-2">
          {/* Orden - PEQUEÑO sin link (solo visual) */}
          {(() => {
            const orden = fichaFamilia.lineage?.find((item: any) => item.rank_id === 4);
            return orden?.taxon ? (
              <>
                <span className="text-sm font-medium" style={{ color: "#006d1b" }}>
                  {orden.taxon}
                </span>
                <span
                  className="text-foreground text-sm"
                  style={{ fontWeight: "300" }}
                >
                  |
                </span>
              </>
            ) : null;
          })()}

          {/* Familia - GRANDE, destacado, en cursiva (no clicable) */}
          <span className="text-foreground text-4xl font-bold italic">
            {fichaFamilia.taxon || fichaFamilia.taxones?.[0]?.taxon || ""}
          </span>

          {/* Descriptor y año - MEDIANO */}
          {fichaFamilia.autor_ano && (
            <span
              dangerouslySetInnerHTML={{
                __html: processHTMLLinks(fichaFamilia.autor_ano),
              }}
              className="autor-ano-links"
            />
          )}
        </div>

        {/* Nombre común - Comentado por el momento */}
        {/* {fichaFamilia.nombre_comun && (
          <p className="text-foreground text-xl font-semibold">
            {fichaFamilia.nombre_comun}
          </p>
        )} */}
      </div>
    </CardHeader>
  );
};
