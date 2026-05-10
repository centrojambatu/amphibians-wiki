"use client";

import {useState} from "react";
import Link from "next/link";
import {useQuery} from "@tanstack/react-query";
import {RotateCcw, Volume2} from "lucide-react";

import {Button} from "@/components/ui/button";
import CatalogoMultiSelect from "@/components/CatalogoMultiSelect";
import SpeciesSearchInput from "@/components/SpeciesSearchInput";

interface EspecieItem {
  id: number;
  nombre_cientifico: string;
  nombre_comun: string | null;
  slug: string;
  orden?: string | null;
  familia?: string | null;
  genero?: string | null;
}

export default function AudiotecaPage() {
  const [searchInput, setSearchInput] = useState("");
  const [catalogos, setCatalogos] = useState<string[]>([]);
  const search = searchInput.trim();
  const catKey = catalogos.join("||");

  const {data: especies = [], isLoading: loadingEspecies} = useQuery<EspecieItem[]>({
    queryKey: ["audioteca", "especies", search, catKey],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (search) params.set("search", search);
      if (catKey) params.set("catalogos", catKey);
      const response = await fetch(`/api/audioteca/especies?${params.toString()}`);

      if (!response.ok) throw new Error("Error al cargar especies");

      return response.json();
    },
  });

  const hasFilters = catalogos.length > 0 || searchInput.trim().length > 0;

  const reset = () => {
    setSearchInput("");
    setCatalogos([]);
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Audioteca</h1>
          <p className="mt-2 text-gray-600">Listado de especies con cantos disponibles</p>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
          <aside className="lg:w-80 lg:flex-shrink-0">
            <div className="sticky top-4 flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="flex-shrink-0 px-6 pt-6 pb-2">
                <SpeciesSearchInput
                  apiPath="/api/audioteca/especies"
                  placeholder="Nombre científico o común"
                  value={searchInput}
                  onChange={setSearchInput}
                />
              </div>

              <div className="flex flex-shrink-0 justify-end px-6 py-2">
                <Button
                  className="gap-1.5 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-normal text-gray-700 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50"
                  disabled={!hasFilters}
                  type="button"
                  variant="ghost"
                  onClick={reset}
                >
                  <RotateCcw className="h-3.5 w-3.5 shrink-0 text-black" />
                  Limpiar
                </Button>
              </div>

              <div className="mt-2 min-h-0 w-full flex-1 space-y-3 border-t px-6 py-4">
                <div>
                  <p className="mb-2 text-sm font-semibold">Catálogo / Número de museo</p>
                  <CatalogoMultiSelect
                    apiPath="/api/audioteca/catalogos"
                    placeholder="KU 10441"
                    selected={catalogos}
                    onChange={setCatalogos}
                  />
                </div>
              </div>
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="text-muted-foreground mb-3 text-xs">
              {loadingEspecies
                ? "Cargando..."
                : `${String(especies.length)} ${especies.length === 1 ? "especie" : "especies"}`}
            </div>

            {loadingEspecies ? (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
                <p className="text-gray-600">Cargando especies...</p>
              </div>
            ) : especies.length > 0 ? (
              <div className="space-y-2">
                {especies.map((especie) => {
                  const params = new URLSearchParams({from: "audioteca"});

                  if (search) params.set("search", search);
                  const href = `/sapopedia/species/${especie.slug}/audios?${params.toString()}`;

                  return (
                    <Link
                      key={especie.id}
                      className="border-border bg-card hover:border-primary flex items-center justify-between rounded-md border px-4 py-3 no-underline transition-colors"
                      href={href}
                    >
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-foreground text-sm italic">
                            {especie.nombre_cientifico}
                          </span>
                          {especie.nombre_comun && (
                            <span className="text-muted-foreground text-xs">
                              {especie.nombre_comun}
                            </span>
                          )}
                        </div>
                        {(especie.orden || especie.familia || especie.genero) && (
                          <p className="mt-0.5 text-xs text-gray-500">
                            {[especie.orden, especie.familia, especie.genero]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}
                      </div>
                      <div className="bg-primary/10 text-primary ml-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                        <Volume2 className="h-4 w-4" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
                <p className="text-gray-600">
                  {hasFilters
                    ? "No se encontraron especies con esos filtros."
                    : "No hay especies con cantos publicados."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
