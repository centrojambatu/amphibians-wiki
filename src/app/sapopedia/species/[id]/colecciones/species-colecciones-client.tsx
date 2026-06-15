"use client";

import {useMemo, useState} from "react";
import {useInfiniteQuery} from "@tanstack/react-query";

import ColeccionCard from "@/components/ColeccionCard";
import {RANGE_DASH} from "@/lib/format-range";

import type {ColeccionItem, ColeccionesPaginadas} from "./get-colecciones-paginadas";

interface Props {
  taxonId: number;
  baseUrl: string;
  initialData: ColeccionesPaginadas;
}

export default function SpeciesColeccionesClient({taxonId, baseUrl, initialData}: Props) {
  const [verTodoLoading, setVerTodoLoading] = useState(false);

  const {data, isFetchingNextPage, fetchNextPage, hasNextPage} = useInfiniteQuery<ColeccionesPaginadas>({
    queryKey: ["species-colecciones", taxonId],
    initialPageParam: 1,
    initialData: {
      pages: [initialData],
      pageParams: [1],
    },
    queryFn: async ({pageParam}) => {
      const res = await fetch(`/api/colecciones/by-taxon/${taxonId}?pagina=${String(pageParam)}`);

      if (!res.ok) throw new Error("Error al cargar colecciones");

      return res.json();
    },
    getNextPageParam: (lastPage) =>
      lastPage.paginaActual < lastPage.totalPaginas ? lastPage.paginaActual + 1 : undefined,
  });

  const colecciones = useMemo<ColeccionItem[]>(
    () => data?.pages.flatMap((p) => p.colecciones) ?? [],
    [data],
  );
  const total = data?.pages[0]?.total ?? 0;

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

  if (colecciones.length === 0) {
    return (
      <div className="bg-card mb-8 rounded-lg border p-8 text-center">
        <p className="text-muted-foreground">No hay colecciones disponibles para esta especie.</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 flex flex-col gap-1.5">
        {colecciones.map((coleccion) => {
          const coleccionUrl = `${baseUrl}/${coleccion.id_coleccion}`;

          const cardData = {
            id_coleccion: coleccion.id_coleccion,
            taxon_id: coleccion.taxon_id,
            fuente: coleccion.fuente,
            sc: coleccion.sc,
            gui: coleccion.gui,
            num_museo: coleccion.num_museo,
            catalogo_museo: coleccion.catalogo_museo,
            fecha_coleccion: coleccion.fecha_coleccion,
            colectores: coleccion.colectores,
            personal_nombre: coleccion.personal_nombre,
            personal_siglas: coleccion.personal_siglas,
            provincia: coleccion.provincia,
            detalle_localidad: coleccion.detalle_localidad,
            latitud: coleccion.latitud,
            longitud: coleccion.longitud,
            altitud: coleccion.altitud,
            estadio: coleccion.estadio,
            numero_individuos: coleccion.numero_individuos,
            sexo: coleccion.sexo,
            estado: coleccion.estado,
            publicacion_id: coleccion.publicacion_id,
            cita_corta: coleccion.cita_corta,
            tiene_muestras: coleccion.tiene_muestras,
            tiene_multimedia: coleccion.tiene_multimedia,
            tiene_adn: coleccion.tiene_adn,
          };

          return (
            <ColeccionCard
              key={coleccion.id_coleccion}
              coleccion={cardData}
              href={coleccionUrl}
            />
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <p className="text-xs text-gray-400">
          {`Mostrando 1${RANGE_DASH}${colecciones.length.toLocaleString()} de ${total.toLocaleString()} ${
            total === 1 ? "registro" : "registros"
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
