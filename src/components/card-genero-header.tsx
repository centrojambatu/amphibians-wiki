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
          {/* Orden - PEQUEÑO con link */}
          {fichaGenero.lineage?.[3]?.taxon && (
            <>
              <Link
                className="text-sm font-medium transition-all hover:underline"
                href="/TODO-ORDER-LINK"
                style={{ color: "#006d1b" }}
              >
                {fichaGenero.lineage[3].taxon}
              </Link>
              <span
                className="text-foreground text-sm"
                style={{ fontWeight: "300" }}
              >
                |
              </span>
            </>
          )}

          {/* Familia - PEQUEÑO con link */}
          {fichaGenero.lineage?.[2]?.taxon && (
            <>
              <Link
                className="text-sm font-medium transition-all hover:underline"
                href={`/sapopedia/family/${fichaGenero.lineage[2].id_taxon || ""}`}
                style={{ color: "#006d1b" }}
              >
                {fichaGenero.lineage[2].taxon}
              </Link>
              <span
                className="text-foreground text-sm"
                style={{ fontWeight: "300" }}
              >
                |
              </span>
            </>
          )}

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

        {/* Nombre común */}
        {fichaGenero.nombre_comun && (
          <p className="text-foreground text-xl font-semibold">
            {fichaGenero.nombre_comun}
          </p>
        )}
      </div>
    </CardHeader>
  );
};
