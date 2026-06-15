import {notFound} from "next/navigation";
import Link from "next/link";
import {MoveLeft} from "lucide-react";

import getFichaEspecie from "../get-ficha-especie";

import getColeccionesPaginadas from "./get-colecciones-paginadas";
import SpeciesColeccionesClient from "./species-colecciones-client";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}


export default async function ColeccionesPage({params}: PageProps) {
  const {id} = await params;

  const decodedId = decodeURIComponent(id);
  const sanitizedId = /^\d+$/.test(decodedId) ? decodedId : decodedId.replaceAll("-", " ");

  const fichaEspecie = await getFichaEspecie(sanitizedId);

  if (!fichaEspecie) {
    notFound();
  }

  const initialData = await getColeccionesPaginadas(fichaEspecie.taxon_id, 1);

  const baseUrl = `/sapopedia/species/${encodeURIComponent(id)}/colecciones`;

  // Extraer jerarquía taxonómica del lineage
  const lineage: any[] = fichaEspecie.lineage ?? [];
  const ordenEntry = lineage.find((l: any) => l.rank?.rank === "Orden") ?? null;
  const familiaEntry = lineage.find((l: any) => l.rank?.rank === "Familia") ?? null;
  const generoEntry = lineage.find((l: any) => l.rank?.rank === "Género") ?? null;
  const especieEntry = lineage.find((l: any) => l.rank?.rank === "especie") ?? null;
  const orden = ordenEntry?.taxon ?? null;
  const ordenId = ordenEntry?.id_taxon ?? null;
  const familia = familiaEntry?.taxon ?? null;
  const familiaId = familiaEntry?.id_taxon ?? null;
  const genero = generoEntry?.taxon ?? null;
  const generoId = generoEntry?.id_taxon ?? null;
  const especie = especieEntry?.taxon ?? null;

  const nombreCientifico = genero && especie ? `${genero} ${especie}` : null;
  const nombreComun = (fichaEspecie as any)?.nombresComunes?.nombre_comun_espanol ?? null;

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          aria-label="Volver"
          className="text-muted-foreground mb-4 inline-flex items-center hover:no-underline"
          href={`/sapopedia/species/${encodeURIComponent(id)}`}
        >
          <MoveLeft className="h-8 w-8" strokeWidth={1} />
        </Link>

        {/* Título estilo ficha: Orden | Familia | Género | Nombre científico */}
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          {orden && (
            <>
              <Link
                className="text-sm font-medium transition-all hover:no-underline"
                href={`/sapopedia/order/${String(ordenId ?? "")}`}
                style={{color: "#006d1b"}}
              >
                {orden}
              </Link>
              <span className="text-foreground text-sm" style={{fontWeight: "300"}}>
                |
              </span>
            </>
          )}
          {familia && (
            <>
              <Link
                className="text-sm font-medium transition-all hover:no-underline"
                href={`/sapopedia/family/${String(familiaId ?? "")}`}
                style={{color: "#006d1b"}}
              >
                {familia}
              </Link>
              <span className="text-foreground text-sm" style={{fontWeight: "300"}}>
                |
              </span>
            </>
          )}
          {genero && (
            <>
              <Link
                className="text-sm font-medium italic transition-all hover:no-underline"
                href={`/sapopedia/genus/${String(generoId ?? "")}`}
                style={{color: "#006d1b"}}
              >
                {genero}
              </Link>
              <span className="text-sm" style={{fontWeight: "300"}}>
                |
              </span>
            </>
          )}
          {nombreCientifico && (
            <span className="text-foreground text-4xl font-bold italic">
              {nombreCientifico}
            </span>
          )}
          {nombreComun && (
            <span className="text-xl font-semibold text-gray-500">{nombreComun}</span>
          )}
        </div>
      </div>

      <SpeciesColeccionesClient
        baseUrl={baseUrl}
        initialData={initialData}
        taxonId={fichaEspecie.taxon_id}
      />
    </main>
  );
}
