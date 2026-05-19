"use client";

import Link from "next/link";
import {ChevronDown, ExternalLink} from "lucide-react";

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
      className="hover:text-primary inline-flex items-center gap-1 text-sm font-semibold text-[#4ba24b] underline"
      href={gbifUrl}
      rel="noopener noreferrer"
      target="_blank"
    >
      {label}
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}

function Field({label, value}: {label: string; value: React.ReactNode}) {
  if (value == null || value === "") return null;

  return (
    <div className="flex flex-col leading-tight">
      <span className="text-[9px] font-medium tracking-wide text-gray-500 uppercase">{label}</span>
      <span className="truncate text-xs text-gray-800">{value}</span>
    </div>
  );
}

export default function AudioCardWithSpectrogram({
  audio,
  speciesUrlId,
  open,
  onToggle,
}: {
  audio: SpeciesAudioItem;
  speciesUrlId: string;
  open: boolean;
  onToggle: () => void;
}) {

  const labelMuseo =
    audio.catalogo_museo && audio.numero_museo
      ? `${audio.catalogo_museo} ${audio.numero_museo}`
      : audio.catalogo_museo || audio.numero_museo || "Sin catálogo";

  const coords =
    audio.latitud != null && audio.longitud != null
      ? `${audio.latitud.toFixed(5)}, ${audio.longitud.toFixed(5)}`
      : (null as string | null);

  return (
    <div className="rounded-md border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        {audio.fuente === "coleccion" && audio.coleccion_id ? (
          <Link
            className="hover:text-primary text-xs font-semibold text-[#4ba24b] underline"
            href={`/sapopedia/species/${speciesUrlId}/colecciones/${audio.coleccion_id}`}
          >
            {labelMuseo}
          </Link>
        ) : audio.fuente === "coleccion_externa" && audio.catalogo_museo && audio.numero_museo ? (
          <GbifLink
            catalogoMuseo={audio.catalogo_museo}
            label={labelMuseo}
            numeroMuseo={audio.numero_museo}
          />
        ) : (
          <span className="text-xs font-semibold text-gray-700">{labelMuseo}</span>
        )}
        {audio.nombre && <span className="text-[11px] text-gray-600">· {audio.nombre}</span>}
        {audio.cita_corta && (
          <span className="text-[11px] text-gray-500 italic">· {audio.cita_corta}</span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-x-3 gap-y-1 sm:grid-cols-4 md:grid-cols-6">
        <Field label="Fecha" value={audio.fecha} />
        <Field label="Hora" value={audio.hora} />
        <Field label="Colector" value={audio.colector} />
        <Field label="Localidad" value={audio.localidad} />
        <Field label="Provincia" value={audio.provincia} />
        <Field label="País" value={audio.pais} />
        <Field label="Coordenadas" value={coords} />
        <Field
          label="Elevación"
          value={audio.elevacion != null ? `${String(audio.elevacion)} m` : null}
        />
        <Field
          label="Temp. aire"
          value={audio.temp_aire != null ? `${String(audio.temp_aire)} °C` : null}
        />
        <Field
          label="Temp. agua"
          value={audio.temp_agua != null ? `${String(audio.temp_agua)} °C` : null}
        />
        <Field
          label="Humedad"
          value={audio.humedad != null ? `${String(audio.humedad)}%` : null}
        />
        <Field
          label="Nubosidad"
          value={audio.nubosidad != null ? String(audio.nubosidad) : null}
        />
        <Field label="Especies de fondo" value={audio.especies_fondo} />
      </div>

      <button
        aria-expanded={open}
        className="mt-2 flex w-full items-center justify-between rounded bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100"
        type="button"
        onClick={onToggle}
      >
        <span>{open ? "Ocultar audio" : "Reproducir audio"}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="mt-3">
          {audio.enlace ? (
            <AudioSpectrogramOscillogram src={audio.enlace} />
          ) : (
            <p className="text-sm text-gray-500">No hay enlace de audio disponible.</p>
          )}
        </div>
      )}
    </div>
  );
}
