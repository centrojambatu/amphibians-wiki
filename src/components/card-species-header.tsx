"use client";

import Link from "next/link";

import {processHTMLLinks} from "@/lib/process-html-links";

import {CardHeader} from "./ui/card";

interface CardSpeciesHeaderProps {
  fichaEspecie: any;
}

export const CardSpeciesHeader = ({fichaEspecie}: CardSpeciesHeaderProps) => {
  return (
    <CardHeader className="sticky top-0 z-30 text-center">
      <div className="space-y-4" style={{padding: "20px 30px 30px"}}>
        {/* Título principal - Jerarquía taxonómica completa */}
        <div className="flex flex-wrap items-baseline justify-center gap-2">
          {/* Orden - PEQUEÑO con link (rank_id = 4) */}
          {(() => {
            const orden = fichaEspecie.lineage?.find((item: any) => item.rank_id === 4);

            return orden?.taxon ? (
              <>
                <Link
                  className="text-sm font-medium transition-all hover:no-underline"
                  href={`/sapopedia/order/${orden.id_taxon || ""}`}
                  style={{color: "#006d1b"}}
                >
                  {orden.taxon}
                </Link>
                <span className="text-foreground text-sm" style={{fontWeight: "300"}}>
                  |
                </span>
              </>
            ) : null;
          })()}

          {/* Familia - PEQUEÑO con link (rank_id = 5) */}
          {(() => {
            const familia = fichaEspecie.lineage?.find((item: any) => item.rank_id === 5);

            return familia?.taxon ? (
              <>
                <Link
                  className="text-sm font-medium transition-all hover:no-underline"
                  href={`/sapopedia/family/${familia.id_taxon || ""}`}
                  style={{color: "#006d1b"}}
                >
                  {familia.taxon}
                </Link>
                <span className="text-foreground text-sm" style={{fontWeight: "300"}}>
                  |
                </span>
              </>
            ) : null;
          })()}

          {/* Género - PEQUEÑO e itálica con link (rank_id = 6) */}
          {(() => {
            const genero = fichaEspecie.lineage?.find((item: any) => item.rank_id === 6);

            return genero?.taxon ? (
              <>
                <Link
                  className="text-sm font-medium italic transition-all hover:no-underline"
                  href={`/sapopedia/genus/${genero.id_taxon || ""}`}
                  style={{color: "#006d1b"}}
                >
                  {genero.taxon}
                </Link>
                <span className="text-sm" style={{fontWeight: "300"}}>
                  |
                </span>
              </>
            ) : null;
          })()}

          {/* Especie - GRANDE, destacado, en cursiva (no clicable) */}
          <span className="text-foreground text-4xl font-bold italic">{`${fichaEspecie.taxones?.[0]?.taxonPadre?.taxon || ""} ${fichaEspecie.taxones?.[0]?.taxon || ""}`}</span>

          {/* Descriptor y año - MEDIANO */}
          {fichaEspecie.taxones?.[0]?.autor_ano && (
            <span
              dangerouslySetInnerHTML={{
                __html: processHTMLLinks(fichaEspecie.taxones[0].autor_ano),
              }}
              className="autor-ano-links"
            />
          )}
        </div>

        {/* Nombre común */}
        {fichaEspecie.taxones?.[0]?.nombre_comun && (
          <p className="text-foreground text-xl font-semibold">
            {fichaEspecie.taxones[0].nombre_comun}
          </p>
        )}
      </div>
    </CardHeader>
  );
};
