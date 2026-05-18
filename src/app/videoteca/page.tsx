"use client";

import {useState} from "react";
import Link from "next/link";
import {useQuery} from "@tanstack/react-query";
import {Video} from "lucide-react";

import SpeciesSearchInput from "@/components/SpeciesSearchInput";

interface EspecieItem {
  id: number;
  nombre_cientifico: string;
  nombre_comun: string | null;
  slug: string;
  orden?: string | null;
  familia?: string | null;
  genero?: string | null;
  video_url?: string | null;
  video_thumbnail?: string | null;
  video_nombre?: string | null;
}

export default function VideotecaPage() {
  const [searchInput, setSearchInput] = useState("");
  const search = searchInput.trim();
  const {data: especies = [], isLoading: loadingEspecies} = useQuery<EspecieItem[]>({
    queryKey: ["videoteca", "especies", search],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (search) params.set("search", search);
      const response = await fetch(`/api/videoteca/especies?${params.toString()}`);

      if (!response.ok) throw new Error("Error al cargar especies");

      return response.json();
    },
  });

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Videoteca</h1>
          <p className="mt-2 text-gray-600">Listado de especies con videos disponibles</p>
        </div>

        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Videos por Especie</h2>
            <p className="mt-1 text-sm text-gray-600">Busca una especie para ver sus videos</p>
          </div>

          <div className="mb-6">
            <SpeciesSearchInput
              apiPath="/api/videoteca/especies"
              placeholder="Buscar por nombre científico o común..."
              value={searchInput}
              onChange={setSearchInput}
            />
          </div>

          {loadingEspecies ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
              <p className="text-gray-600">Cargando especies...</p>
            </div>
          ) : especies.length > 0 ? (
            <div className="space-y-2">
              {especies.map((especie) => {
                const href = `/sapopedia/species/${especie.slug}/videos?from=videoteca${searchInput.trim() ? `&search=${encodeURIComponent(searchInput.trim())}` : ""}`;

                return (
                  <Link
                    key={especie.id}
                    className="border-border bg-card hover:border-primary flex items-center justify-between gap-3 rounded-md border px-4 py-3 no-underline transition-colors"
                    href={href}
                  >
                    <div className="min-w-0 flex-1">
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
                    {especie.video_thumbnail ? (
                      <img
                        alt={especie.video_nombre || especie.nombre_cientifico}
                        className="h-14 w-24 flex-shrink-0 rounded object-cover"
                        src={especie.video_thumbnail}
                      />
                    ) : (
                      <div className="bg-primary/10 text-primary ml-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                        <Video className="h-4 w-4" />
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          ) : searchInput.trim() ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
              <p className="text-gray-600">
                No se encontraron especies con videos para ese criterio.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
              <p className="text-gray-600">No hay especies con videos publicados.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
