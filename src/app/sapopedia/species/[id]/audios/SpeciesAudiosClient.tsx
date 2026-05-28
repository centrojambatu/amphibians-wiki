"use client";

import Link from "next/link";
import {ArrowLeft, Eye} from "lucide-react";

import AudioCardWithSpectrogram from "./AudioCardWithSpectrogram";
import {SpeciesAudioItem} from "./types";

interface SpeciesAudiosClientProps {
  nombreCientifico: string;
  orden?: string | null;
  ordenId?: number | null;
  familia?: string | null;
  familiaId?: number | null;
  genero?: string | null;
  generoId?: number | null;
  especieUrl: string;
  fromAudioteca: boolean;
  audiotecaUrl: string;
  audios: SpeciesAudioItem[];
  speciesUrlId: string;
}

export default function SpeciesAudiosClient({
  nombreCientifico,
  orden,
  ordenId,
  familia,
  familiaId,
  genero,
  generoId,
  especieUrl,
  fromAudioteca,
  audiotecaUrl,
  audios,
  speciesUrlId,
}: SpeciesAudiosClientProps) {

  return (
    <div className="bg-background min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {fromAudioteca ? (
                <Link
                  className="audioteca-back-link hover:text-primary inline-flex items-center gap-2 text-sm text-gray-600 no-underline transition-colors"
                  href={audiotecaUrl}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver
                </Link>
              ) : (
                <Link
                  className="audioteca-back-link hover:text-primary inline-flex items-center gap-2 text-sm text-gray-600 no-underline transition-colors"
                  href={especieUrl}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver a la ficha de la especie
                </Link>
              )}
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

        {audios.length === 0 ? (
          <p className="text-sm text-gray-500">No hay audios publicados.</p>
        ) : (
          <div className="flex flex-col gap-[28px]">
            {audios.map((audio) => (
              <AudioCardWithSpectrogram
                key={audio.id}
                audio={audio}
                speciesUrlId={speciesUrlId}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
