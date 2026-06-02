"use client";

import Link from "next/link";
import {MoveLeft} from "lucide-react";

import {useGbifOccurrence} from "@/lib/gbif";

import {SpeciesVideoItem} from "./types";

function formatFechaEs(fecha: string | null | undefined): string | null {
  if (!fecha) return null;
  const d = new Date(fecha);

  if (Number.isNaN(d.getTime())) return null;
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = d.toLocaleDateString("es-ES", {month: "long", timeZone: "UTC"});
  const monthCap = month.charAt(0).toUpperCase() + month.slice(1);
  const year = String(d.getUTCFullYear());

  return `${day} ${monthCap} ${year}`;
}

interface SpeciesVideosClientProps {
  nombreCientifico: string;
  orden?: string | null;
  ordenId?: number | null;
  familia?: string | null;
  familiaId?: number | null;
  genero?: string | null;
  generoId?: number | null;
  especieUrl: string;
  fromVideoteca: boolean;
  videotecaUrl: string;
  videos: SpeciesVideoItem[];
  speciesUrlId: string;
}

function CatalogoGbif({
  catalogoMuseo,
  numeroMuseo,
  label,
}: {
  catalogoMuseo: string;
  numeroMuseo: string;
  label: string;
}) {
  const {data: gbifUrl} = useGbifOccurrence(catalogoMuseo, numeroMuseo);

  if (!gbifUrl) {
    return <span className="text-xs font-semibold text-gray-700">{label}</span>;
  }

  return (
    <a
      className="hover:text-primary text-xs font-semibold text-[#4ba24b] underline"
      href={gbifUrl}
      rel="noopener noreferrer"
      target="_blank"
    >
      {label}
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
              className="hover:text-primary text-xs font-semibold text-[#4ba24b] underline"
              href={`/sapopedia/species/${speciesUrlId}/colecciones/${String(video.coleccion_id)}`}
            >
              {labelMuseo}
            </Link>
          ) : labelMuseo &&
            video.fuente === "coleccion_externa" &&
            video.catalogo_museo &&
            video.museo_numero ? (
            <CatalogoGbif
              catalogoMuseo={video.catalogo_museo}
              label={labelMuseo}
              numeroMuseo={video.museo_numero}
            />
          ) : null}
        </div>
        {video.descripcion && (
          <p className="mt-1 line-clamp-2 text-xs text-gray-700">{video.descripcion}</p>
        )}
        {(video.autor || formatFechaEs(video.fecha)) && (
          <p className="mt-0.5 flex flex-wrap items-baseline gap-x-2 text-[11px] text-gray-500">
            {video.autor && <span>{video.autor}</span>}
            {video.autor && formatFechaEs(video.fecha) && (
              <span style={{color: "#f07304"}}>|</span>
            )}
            {formatFechaEs(video.fecha) && <span>{formatFechaEs(video.fecha)}</span>}
          </p>
        )}
      </div>
    </div>
  );
}

export default function SpeciesVideosClient({
  nombreCientifico,
  orden,
  ordenId,
  familia,
  familiaId,
  genero,
  generoId,
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
              <Link
                aria-label="Volver"
                className="text-muted-foreground inline-flex items-center hover:no-underline"
                href={fromVideoteca ? videotecaUrl : especieUrl}
              >
                <MoveLeft className="h-8 w-8" strokeWidth={1} />
              </Link>
            </div>
          </div>
          <h1 className="flex flex-wrap items-baseline gap-x-3 text-3xl font-bold text-gray-900">
            {orden && (
              <>
                <Link
                  className="text-base font-medium"
                  href={`/sapopedia/order/${String(ordenId ?? "")}`}
                  style={{color: "#006d1b"}}
                >
                  {orden}
                </Link>
                <span className="text-base text-gray-300">|</span>
              </>
            )}
            {familia && (
              <>
                <Link
                  className="text-base font-medium"
                  href={`/sapopedia/family/${String(familiaId ?? "")}`}
                  style={{color: "#006d1b"}}
                >
                  {familia}
                </Link>
                <span className="text-base text-gray-300">|</span>
              </>
            )}
            {genero && (
              <>
                <Link
                  className="text-base font-medium italic"
                  href={`/sapopedia/genus/${String(generoId ?? "")}`}
                  style={{color: "#006d1b"}}
                >
                  {genero}
                </Link>
                <span className="text-base text-gray-300">|</span>
              </>
            )}
            <Link className="italic" href={especieUrl} style={{color: "inherit"}}>
              {nombreCientifico}
            </Link>
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
