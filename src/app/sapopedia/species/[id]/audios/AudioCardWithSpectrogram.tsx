"use client";

import Link from "next/link";
import {Download} from "lucide-react";

import AudioSpectrogramOscillogram from "@/components/AudioSpectrogramOscillogram";
import {useGbifOccurrence} from "@/lib/gbif";

import {SpeciesAudioItem} from "./types";

function GbifLink({
  catalogoMuseo,
  numeroMuseo,
  label,
}: {
  catalogoMuseo: string;
  numeroMuseo: string;
  label: string;
}) {
  const {data: gbifUrl, isLoading} = useGbifOccurrence(catalogoMuseo, numeroMuseo);

  if (isLoading) return <span className="text-sm font-semibold text-gray-500">{label}</span>;
  if (!gbifUrl)
    return (
      <span className="text-sm font-semibold text-gray-700" title="No encontrado en GBIF">
        {label}
      </span>
    );

  return (
    <a
      className="hover:text-primary text-sm font-semibold text-[#4ba24b] underline"
      href={gbifUrl}
      rel="noopener noreferrer"
      target="_blank"
    >
      {label}
    </a>
  );
}

function formatFechaEs(fecha: string | null | undefined): string | null {
  if (!fecha) return null;
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return null;
  const day = String(d.getUTCDate());
  const month = d.toLocaleDateString("es-ES", {month: "long", timeZone: "UTC"});
  const year = String(d.getUTCFullYear());
  return `${day} ${month} ${year}`;
}

function Field({
  label,
  value,
  colSpan = 1,
}: {
  label: string;
  value: React.ReactNode;
  colSpan?: 1 | 2 | 3;
}) {
  if (value == null || value === "") return null;

  const spanClass =
    colSpan === 3 ? "col-span-3" : colSpan === 2 ? "col-span-2" : "";

  return (
    <div className={`flex min-w-0 flex-col leading-tight ${spanClass}`}>
      {label && (
        <span className="text-[10px] font-medium tracking-wide text-gray-500 uppercase">
          {label}
        </span>
      )}
      <span
        className="text-[13px] text-gray-800"
        style={{overflowWrap: "anywhere", wordBreak: "break-word"}}
      >
        {value}
      </span>
    </div>
  );
}

export default function AudioCardWithSpectrogram({
  audio,
  speciesUrlId,
}: {
  audio: SpeciesAudioItem;
  speciesUrlId: string;
}) {

  const labelMuseo =
    audio.catalogo_museo && audio.numero_museo
      ? `${audio.catalogo_museo} ${audio.numero_museo}`
      : audio.catalogo_museo || audio.numero_museo || "Sin espécimen testigo";

  const coords =
    audio.latitud != null && audio.longitud != null
      ? `${audio.latitud.toFixed(5)}, ${audio.longitud.toFixed(5)}`
      : (null as string | null);

  return (
    <div className="rounded-md border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        {audio.gui_aud && (
          <span className="text-base font-semibold text-gray-700">{audio.gui_aud}</span>
        )}
        {audio.fuente === "coleccion" && audio.coleccion_id ? (
          <Link
            className="hover:text-primary text-[11px] font-medium text-[#4ba24b] underline"
            href={`/sapopedia/species/${speciesUrlId}/colecciones/${audio.coleccion_id}`}
          >
            · {labelMuseo}
          </Link>
        ) : audio.fuente === "coleccion_externa" && audio.catalogo_museo && audio.numero_museo ? (
          <span className="text-[11px] text-gray-600">
            ·{" "}
            <GbifLink
              catalogoMuseo={audio.catalogo_museo}
              label={labelMuseo}
              numeroMuseo={audio.numero_museo}
            />
          </span>
        ) : (
          <span className="text-[11px] text-gray-600">· {labelMuseo}</span>
        )}
        {audio.cita_corta ? (
          audio.publicacion_id ? (
            <span className="text-sm text-gray-500">
              ·{" "}
              <Link
                className="hover:text-primary text-[#4ba24b] underline"
                href={`/sapoteca?titulo=${encodeURIComponent(audio.publicacion_titulo ?? audio.cita_corta)}&back=${encodeURIComponent(`/sapopedia/species/${speciesUrlId}/audios`)}`}
              >
                {audio.cita_corta}
              </Link>
            </span>
          ) : (
            <span className="text-sm text-gray-500">· {audio.cita_corta}</span>
          )
        ) : (
          <span className="text-sm text-gray-500">· no publicado</span>
        )}
        {audio.enlace && audio.cita_corta && (
          <a
            className="ml-auto inline-flex items-center gap-1.5 rounded border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900"
            download
            href={audio.enlace}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Download className="h-3.5 w-3.5" />
            Descargar
          </a>
        )}
      </div>

      <div className="flex flex-col gap-y-1">
        <Field
          label=""
          value={(() => {
            const parts: React.ReactNode[] = [];
            const localidad =
              [audio.localidad, audio.provincia, audio.pais].filter(Boolean).join(", ") || null;
            if (localidad) parts.push(<span key="loc">{localidad}</span>);
            if (coords) parts.push(<span key="coords">{coords}</span>);
            if (audio.elevacion != null)
              parts.push(<span key="elev">{`${String(audio.elevacion)} m`}</span>);
            if (audio.temp_aire != null)
              parts.push(
                <span key="aire">
                  <span className="text-xs text-gray-500">aire</span>{" "}
                  {String(audio.temp_aire)} °C
                </span>,
              );
            if (audio.temp_agua != null)
              parts.push(
                <span key="agua">
                  <span className="text-xs text-gray-500">agua</span>{" "}
                  {String(audio.temp_agua)} °C
                </span>,
              );
            if (audio.humedad != null)
              parts.push(
                <span key="hum">
                  <span className="text-xs text-gray-500">humedad</span>{" "}
                  {String(audio.humedad)}%
                </span>,
              );
            const fechaFmt = formatFechaEs(audio.fecha);
            if (fechaFmt || audio.hora) {
              parts.push(
                <span key="fecha">
                  {fechaFmt}
                  {fechaFmt && audio.hora && (
                    <span style={{color: "#f07304", margin: "0 6px"}}>|</span>
                  )}
                  {audio.hora}
                </span>,
              );
            }
            if (audio.colector)
              parts.push(
                <span key="colector">
                  <span className="text-xs text-gray-500">grabado por</span>{" "}
                  {audio.colector}
                </span>,
              );

            if (parts.length === 0) return null;

            return parts.flatMap((p, i) =>
              i < parts.length - 1
                ? [
                    p,
                    <span key={`sep-${i}`} style={{color: "#f07304", margin: "0 6px"}}>
                      |
                    </span>,
                  ]
                : [p],
            );
          })()}
        />
      </div>

      <div className="mt-3">
        {audio.enlace ? (
          <AudioSpectrogramOscillogram src={audio.enlace} />
        ) : (
          <p className="text-sm text-gray-500">No hay enlace de audio disponible.</p>
        )}
      </div>
    </div>
  );
}
