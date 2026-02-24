"use client";

import Link from "next/link";

import { processHTMLLinks } from "@/lib/process-html-links";

import { CardHeader } from "./ui/card";

interface CardGeneroHeaderProps {
  fichaGenero: any;
}

export const CardGeneroHeader = ({ fichaGenero }: CardGeneroHeaderProps) => {
  return (
    <CardHeader className="sticky top-0 z-30 text-center">
      <div className="space-y-4" style={{ padding: "20px 30px 30px" }}>
        {/* Título principal - Jerarquía taxonómica completa */}
        <div className="flex flex-wrap items-baseline justify-center gap-2">
          {/* Orden - PEQUEÑO sin link (solo visual) */}
          {(() => {
            const orden = fichaGenero.lineage?.find((item: any) => item.rank_id === 4);
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

          {/* Familia - PEQUEÑO con link (rank_id = 5) */}
          {(() => {
            const familia = fichaGenero.lineage?.find((item: any) => item.rank_id === 5);
            return familia?.taxon ? (
              <>
                <Link
                  className="text-sm font-medium transition-all hover:no-underline"
                  href={`/sapopedia/family/${familia.id_taxon || ""}`}
                  style={{ color: "#006d1b" }}
                >
                  {familia.taxon}
                </Link>
                <span
                  className="text-foreground text-sm"
                  style={{ fontWeight: "300" }}
                >
                  |
                </span>
              </>
            ) : null;
          })()}

          {/* Género - GRANDE, destacado, en cursiva (no clicable) */}
          <span className="text-foreground text-4xl font-bold italic">
            {fichaGenero.taxon || fichaGenero.taxones?.[0]?.taxon || ""}
          </span>

          {/* Descriptor y año - MEDIANO */}
          {fichaGenero.autor_ano && (
            <span
              dangerouslySetInnerHTML={{
                __html: processHTMLLinks(fichaGenero.autor_ano),
              }}
              className="autor-ano-links"
            />
          )}
        </div>

        {/* Nombre común - Comentado por el momento */}
        {/* {fichaGenero.nombre_comun && (
          <p className="text-foreground text-xl font-semibold">
            {fichaGenero.nombre_comun}
          </p>
        )} */}
      </div>
    </CardHeader>
  );
};
