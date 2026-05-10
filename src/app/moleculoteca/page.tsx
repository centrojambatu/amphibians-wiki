import {Dna} from "lucide-react";
import Link from "next/link";

import MoleculotecaFiltersPanel from "@/components/moleculoteca-filters-panel";

import {getMoleculotecaTaxa, MUESTRA_FIELDS} from "./get-moleculoteca-taxa";

interface SearchParams {
  busqueda?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function MoleculotecaPage({searchParams}: PageProps) {
  const params = await searchParams;
  const taxa = await getMoleculotecaTaxa(params.busqueda);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <div className="mb-3 flex items-center justify-center gap-3">
          <Dna className="h-10 w-10 text-green-600" />
          <h1 className="text-4xl font-bold">Moleculoteca</h1>
        </div>
        <p className="text-muted-foreground mx-auto max-w-3xl text-base">
          Especies con muestras biológicas (sangre, piel, tejidos, esqueleto, esperma, heces) en
          la colección.
        </p>
      </div>

      <div className="mb-8">
        <div className="mx-auto max-w-2xl">
          <MoleculotecaFiltersPanel />
        </div>
      </div>

      <div className="text-muted-foreground mb-4 text-center text-sm">
        {taxa.length} especies con muestras
      </div>

      {taxa.length === 0 ? (
        <div className="bg-card rounded-lg border p-12 text-center">
          <div className="mb-4 text-4xl">🧬</div>
          <p className="text-muted-foreground text-lg">
            No se encontraron especies con muestras biológicas.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {taxa.map((t) => (
            <Link
              key={t.taxon_id}
              className="group bg-card hover:border-primary block rounded-lg border p-4 no-underline transition-colors"
              href={`/moleculoteca/${String(t.taxon_id)}`}
            >
              <div className="mb-3">
                <p className="group-hover:text-primary text-sm font-semibold italic text-gray-900">
                  {t.nombre_cientifico}
                </p>
                {t.nombre_comun && (
                  <p className="text-xs text-gray-600">{t.nombre_comun}</p>
                )}
                {(t.orden || t.familia || t.genero) && (
                  <p className="mt-0.5 text-[11px] text-gray-500">
                    {[t.orden, t.familia, t.genero].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {MUESTRA_FIELDS.map((field) => {
                  const value = (t as any)[field.count] as number;
                  const active = value > 0;

                  return (
                    <div
                      key={field.key}
                      className={`flex items-center justify-between rounded px-2 py-1 text-[11px] ${
                        active ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-400"
                      }`}
                    >
                      <span className="truncate">{field.label}</span>
                      <span className="font-mono font-semibold">{value}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 border-t border-gray-100 pt-2 text-[11px] text-gray-500">
                Total registros: <span className="font-semibold">{t.total_registros}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
