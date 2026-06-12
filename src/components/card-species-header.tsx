"use client";

import Link from "next/link";

import {processHTMLLinks} from "@/lib/process-html-links";

import {CardHeader} from "./ui/card";
import RedListStatus from "./RedListStatus";

interface CardSpeciesHeaderProps {
  fichaEspecie: any;
}

const REDLIST_BADGE_SIZE = 56;
const REDLIST_VALORES_VALIDOS = ["LC", "NT", "VU", "EN", "CR", "EW", "EX", "DD"] as const;
type RedListSigla = (typeof REDLIST_VALORES_VALIDOS)[number] | "NE";

const isPESigla = (sigla: string | null | undefined): boolean => {
  if (!sigla) return false;

  return sigla === "PE" || sigla.includes("PE") || sigla.includes("Posiblemente extinta");
};

/** Badge "gota" de Lista Roja Ecuador agrandado (56×56px). */
const renderRedListBadgeGrande = (siglaRaw: string): React.ReactNode => {
  if (isPESigla(siglaRaw)) {
    return (
      <div
        className="inline-flex items-center justify-center font-semibold"
        style={{
          backgroundColor: "#b71c1c",
          color: "#ffffff",
          borderRadius: "100% 0% 100% 100%",
          width: `${String(REDLIST_BADGE_SIZE)}px`,
          height: `${String(REDLIST_BADGE_SIZE)}px`,
          fontSize: "15px",
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.18)",
        }}
      >
        PE
      </div>
    );
  }

  const normalizado = siglaRaw.trim().toUpperCase();

  if ((REDLIST_VALORES_VALIDOS as readonly string[]).includes(normalizado)) {
    return (
      <div
        className="inline-flex"
        style={{
          transform: `scale(${String(REDLIST_BADGE_SIZE / 36)})`,
          transformOrigin: "center",
        }}
      >
        <RedListStatus showTooltip={false} status={normalizado as RedListSigla} />
      </div>
    );
  }

  return (
    <div
      className="inline-flex items-center justify-center font-semibold"
      style={{
        backgroundColor: "#d1d1c6",
        color: "#666666",
        borderRadius: "100% 0% 100% 100%",
        width: `${String(REDLIST_BADGE_SIZE)}px`,
        height: `${String(REDLIST_BADGE_SIZE)}px`,
        fontSize: "15px",
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.18)",
      }}
    >
      ?
    </div>
  );
};

const handleScrollToConservacion = (e: React.MouseEvent<HTMLAnchorElement>): void => {
  const target = document.getElementById("conservacion");

  if (!target) return;
  e.preventDefault();
  target.scrollIntoView({behavior: "smooth", block: "start"});
  if (typeof window !== "undefined") {
    window.history.replaceState(null, "", "#conservacion");
  }
};

export const CardSpeciesHeader = ({fichaEspecie}: CardSpeciesHeaderProps) => {
  const listaRojaSigla: string | null | undefined =
    fichaEspecie?.listaRojaIUCN?.catalogo_awe?.sigla;
  const nombreComun = fichaEspecie?.taxones?.[0]?.nombre_comun as string | undefined;

  return (
    <CardHeader className="sticky top-0 z-30 text-left">
      <div className="space-y-4" style={{padding: "20px 30px 30px"}}>
        {/* Título principal - Jerarquía taxonómica completa + gota de Lista Roja a la derecha */}
        <div className="relative flex flex-wrap items-baseline justify-start gap-2 pr-20">
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

          {/* Gota de Lista Roja Ecuador alineada a la derecha al nivel del nombre científico */}
          {listaRojaSigla && (
            <a
              aria-label="Ver categoría de Lista Roja en la sección de Conservación"
              className="absolute top-1/2 right-0 inline-flex -translate-y-1/2 transition-transform hover:scale-105 focus:outline-none"
              href="#conservacion"
              title="Lista Roja Ecuador"
              onClick={handleScrollToConservacion}
            >
              {renderRedListBadgeGrande(listaRojaSigla)}
            </a>
          )}
        </div>

        {/* Nombre común */}
        {nombreComun && (
          <p className="text-foreground text-xl font-semibold">{nombreComun}</p>
        )}
      </div>
    </CardHeader>
  );
};
