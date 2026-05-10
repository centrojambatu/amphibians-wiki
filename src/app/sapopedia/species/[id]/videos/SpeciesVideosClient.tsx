"use client";

import Link from "next/link";
import {ArrowLeft, ExternalLink, Eye} from "lucide-react";

import {useGbifOccurrence} from "@/lib/gbif";

import {SpeciesVideoItem} from "./types";

interface SpeciesVideosClientProps {
  nombreCientifico: string;
  especieUrl: string;
  fromVideoteca: boolean;
  videotecaUrl: string;
  videos: SpeciesVideoItem[];
  speciesUrlId: string;
}

function GbifLink({
  catalogoMuseo,
  numeroMuseo,
}: {
  catalogoMuseo: string;
  numeroMuseo: string;
}) {
  const {data: gbifUrl} = useGbifOccurrence(catalogoMuseo, numeroMuseo);

  if (!gbifUrl) return null;

  return (
    <a
      className="hover:text-primary inline-flex items-center gap-1 text-xs font-semibold text-[#4ba24b] underline"
      href={gbifUrl}
      rel="noopener noreferrer"
      target="_blank"
    >
      Ver en GBIF
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}

function VideoCard({
  video,
  speciesUrlId,
}: {
  video: SpeciesVideoItem;
  speciesUrlId: string;
}) {
  const labelMuseo =
    video.catalogo_museo && video.museo_numero
      ? `${video.catalogo_museo} ${video.museo_numero}`
      : video.catalogo_museo || video.museo_numero || null;

  return (
    <div className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
      {video.enlace ? (
        <video
          controls
          className="aspect-video w-full bg-black"
          poster={video.thumbnail || undefined}
          preload="metadata"
          src={video.enlace}
        >
          <track kind="captions" />
          Tu navegador no soporta video.
        </video>
      ) : (
        <div className="flex aspect-video w-full items-center justify-center bg-gray-100 text-xs text-gray-400">
          Sin enlace de video
        </div>
      )}

      <div className="p-3">
        <div className="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          {labelMuseo && video.fuente === "coleccion" && video.coleccion_id ? (
            <Link
              className="hover:text-primary inline-flex items-center gap-1 text-xs font-semibold text-[#4ba24b] underline"
              href={`/sapopedia/species/${speciesUrlId}/colecciones/${String(video.coleccion_id)}`}
            >
              {labelMuseo}
            </Link>
          ) : labelMuseo &&
            video.fuente === "coleccion_externa" &&
            video.catalogo_museo &&
            video.museo_numero ? (
            <span className="text-xs font-semibold text-gray-700">
              {labelMuseo}
              <span className="ml-2">
                <GbifLink
                  catalogoMuseo={video.catalogo_museo}
                  numeroMuseo={video.museo_numero}
                />
              </span>
            </span>
          ) : null}
        </div>
        {video.nombre && (
          <h3 className="line-clamp-2 text-sm font-medium text-gray-900">{video.nombre}</h3>
        )}
        {video.autor && (
          <p className="mt-0.5 text-[11px] text-gray-500">Autor: {video.autor}</p>
        )}
        {video.descripcion && (
          <p className="mt-1 line-clamp-2 text-xs text-gray-700">{video.descripcion}</p>
        )}
      </div>
    </div>
  );
}

export default function SpeciesVideosClient({
  nombreCientifico,
  especieUrl,
  fromVideoteca,
  videotecaUrl,
  videos,
  speciesUrlId,
}: SpeciesVideosClientProps) {
  return (
    <div className="bg-background min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {fromVideoteca ? (
                <Link
                  className="hover:text-primary inline-flex items-center gap-2 text-sm text-gray-600 no-underline transition-colors"
                  href={videotecaUrl}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver a Videoteca
                </Link>
              ) : (
                <Link
                  className="hover:text-primary inline-flex items-center gap-2 text-sm text-gray-600 no-underline transition-colors"
                  href={especieUrl}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver a la ficha de la especie
                </Link>
              )}
            </div>
            <Link
              className="hover:text-primary inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 no-underline transition-colors hover:bg-gray-50"
              href={especieUrl}
            >
              <Eye className="h-4 w-4" />
              Ver ficha
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Videos de <span className="italic">{nombreCientifico}</span>
          </h1>
        </div>

        {videos.length === 0 ? (
          <p className="text-sm text-gray-500">No hay videos publicados.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <VideoCard key={video.id} speciesUrlId={speciesUrlId} video={video} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
