"use client";

import { processHTMLLinks } from "@/lib/process-html-links";

import { CardHeader } from "./ui/card";

interface CardOrdenHeaderProps {
  fichaOrden: any;
}

export const CardOrdenHeader = ({ fichaOrden }: CardOrdenHeaderProps) => {
  return (
    <CardHeader className="sticky top-0 z-30 text-center">
      <div className="space-y-4" style={{ padding: "20px 30px 30px" }}>
        {/* Título principal - Jerarquía taxonómica completa */}
        <div className="flex flex-wrap items-baseline justify-center gap-2">
          {/* Clase - PEQUEÑO sin link (solo visual) */}
          {(() => {
            const clase = fichaOrden.lineage?.find((item: any) => item.rank_id === 3);
            return clase?.taxon ? (
              <>
                <span className="text-sm font-medium" style={{ color: "#006d1b" }}>
                  {clase.taxon}
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

          {/* Orden - GRANDE, destacado, en cursiva (no clicable) */}
          <span className="text-foreground text-4xl font-bold italic">
            {fichaOrden.taxon || fichaOrden.taxones?.[0]?.taxon || ""}
          </span>

          {/* Descriptor y año - MEDIANO */}
          {fichaOrden.autor_ano && (
            <span
              dangerouslySetInnerHTML={{
                __html: processHTMLLinks(fichaOrden.autor_ano),
              }}
              className="autor-ano-links"
            />
          )}
        </div>

        {/* Nombre común */}
        {fichaOrden.nombre_comun && (
          <p className="text-foreground text-xl font-semibold">
            {fichaOrden.nombre_comun}
          </p>
        )}
      </div>
    </CardHeader>
  );
};
