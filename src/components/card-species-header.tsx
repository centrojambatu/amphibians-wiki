import Link from "next/link";

import {CardHeader} from "./ui/card";
import {Separator} from "./ui/separator";

export const CardSpeciesHeader = () => {
  return (
    <CardHeader className="sticky top-0 z-30 text-center">
      <div className="space-y-4" style={{padding: "40px 30px 30px"}}>
        {/* Título principal - Jerarquía taxonómica completa */}
        <div className="flex flex-wrap items-baseline justify-center gap-2">
          {/* Orden - PEQUEÑO con link */}
          <Link
            className="text-foreground text-sm font-medium transition-all hover:underline"
            href="/TODO-ORDER-LINK"
            style={{
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
            }}
          >
            TODO order
          </Link>
          <span className="text-foreground text-sm" style={{fontWeight: "300"}}>
            |
          </span>

          {/* Familia - PEQUEÑO con link */}
          <Link
            className="text-foreground text-sm font-medium transition-all hover:underline"
            href="/family/TODO familyId"
            style={{
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
            }}
          >
            TODO family
          </Link>
          <span className="text-foreground text-sm" style={{fontWeight: "300"}}>
            |
          </span>

          {/* Género - PEQUEÑO e itálica con link */}
          <Link
            className="text-foreground text-sm font-medium italic transition-all hover:underline"
            href="/genus/TODO genusId"
            style={{
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
            }}
          >
            TODO genus
          </Link>
          <span className="text-sm" style={{fontWeight: "300"}}>
            |
          </span>

          {/* Especie - GRANDE, destacado, en cursiva (no clicable) */}
          <h1 className="text-4xl font-bold italic dark:text-white">TODO scientificName</h1>

          {/* Descriptor y año - MEDIANO */}
          <span
            className="text-foreground text-lg font-normal"
            style={{
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
            }}
          >
            (TODO collectors)
          </span>
        </div>

        {/* Nombre común */}
        <p
          className="text-foreground text-xl font-semibold"
          style={{
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
            marginTop: "12px",
          }}
        >
          TODO commonName
        </p>
      </div>

      {/* Línea divisoria horizontal - extremo a extremo */}
      <Separator className="bg-foreground" style={{margin: "0"}} />
    </CardHeader>
  );
};
