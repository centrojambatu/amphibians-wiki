"use client";

import {useState} from "react";
import {useSearchParams} from "next/navigation";
import {useInfiniteQuery} from "@tanstack/react-query";

import ReferenciaCard from "@/components/referencia-card";
import type {
  PublicacionSapoteca,
  PublicacionesPaginadas,
} from "@/app/sapoteca/get-publicaciones-paginadas";

const ITEMS_POR_PAGINA = 100;

export default function SapotecaPublicacionesList() {
  const searchParams = useSearchParams();
  const [verTodoLoading, setVerTodoLoading] = useState(false);

  const queryParams = (() => {
    const p = new URLSearchParams();
    const titulo = searchParams.get("titulo");
    const años = searchParams.get("años");
    const autor = searchParams.get("autor");
    const tipos = searchParams.get("tipos");
    const indexada = searchParams.get("indexada");
    const formatoImpreso = searchParams.get("formatoImpreso");
    const publicacionId = searchParams.get("publicacion_id");

    if (titulo) p.set("titulo", titulo);
    if (años) p.set("años", años);
    if (autor) p.set("autor", autor);
    if (tipos) p.set("tipos", tipos);
    if (indexada) p.set("indexada", indexada);
    if (formatoImpreso) p.set("formatoImpreso", formatoImpreso);
    if (publicacionId) p.set("publicacion_id", publicacionId);
    p.set("itemsPorPagina", String(ITEMS_POR_PAGINA));

    return p.toString();
  })();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery<PublicacionesPaginadas>({
    queryKey: ["sapoteca", "publicaciones", queryParams],
    initialPageParam: 1,
    queryFn: async ({pageParam}) => {
      const params = new URLSearchParams(queryParams);

      params.set("pagina", String(pageParam));
      const res = await fetch(`/api/sapoteca?${params.toString()}`);

      if (!res.ok) throw new Error("Error al cargar publicaciones");

      return res.json();
    },
    getNextPageParam: (lastPage) =>
      lastPage.pagina < lastPage.totalPaginas ? lastPage.pagina + 1 : undefined,
  });

  const handleVerTodo = async () => {
    setVerTodoLoading(true);
    try {
      let res = await fetchNextPage();

      while (res.hasNextPage) {
        res = await fetchNextPage();
      }
    } finally {
      setVerTodoLoading(false);
    }
  };

  const publicaciones: PublicacionSapoteca[] =
    data?.pages.flatMap((p) => p.publicaciones) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  if (isLoading && publicaciones.length === 0) {
    return (
      <div className="mb-8 rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">Cargando publicaciones...</p>
      </div>
    );
  }

  if (publicaciones.length === 0) {
    return (
      <div className="mb-8 rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">
          No se encontraron referencias disponibles.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 space-y-4">
        {publicaciones.map((publicacion) => (
          <ReferenciaCard key={publicacion.id_publicacion} publicacion={publicacion} />
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <p className="text-xs text-gray-400">
          {`Mostrando 1 - ${publicaciones.length.toLocaleString()} de ${total.toLocaleString()} ${
            total === 1 ? "referencia" : "referencias"
          }`}
        </p>
        {hasNextPage && (
          <>
            <button
              className="rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-medium tracking-wide text-gray-700 transition-colors hover:border-gray-400 hover:text-gray-900 disabled:opacity-50"
              disabled={isFetchingNextPage || verTodoLoading}
              type="button"
              onClick={() => {
                void fetchNextPage();
              }}
            >
              {isFetchingNextPage ? "Cargando..." : "Cargar más"}
            </button>
            <button
              className="rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-medium tracking-wide text-gray-700 transition-colors hover:border-gray-400 hover:text-gray-900 disabled:opacity-50"
              disabled={isFetchingNextPage || verTodoLoading}
              type="button"
              onClick={() => {
                void handleVerTodo();
              }}
            >
              {verTodoLoading ? "Cargando todo..." : "Ver todo"}
            </button>
          </>
        )}
      </div>
    </>
  );
}
