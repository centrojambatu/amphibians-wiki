"use client";

import Link from "next/link";
import {ArrowLeft, Eye} from "lucide-react";
import {useState} from "react";

import AudioCardWithSpectrogram from "./AudioCardWithSpectrogram";
import {SpeciesAudioItem} from "./types";

interface SpeciesAudiosClientProps {
  nombreCientifico: string;
  especieUrl: string;
  fromAudioteca: boolean;
  audiotecaUrl: string;
  audios: SpeciesAudioItem[];
  speciesUrlId: string;
}

export default function SpeciesAudiosClient({
  nombreCientifico,
  especieUrl,
  fromAudioteca,
  audiotecaUrl,
  audios,
  speciesUrlId,
}: SpeciesAudiosClientProps) {
  const [openId, setOpenId] = useState<string | null>(null);

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
                  Volver a Audioteca
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
            <Link
              className="audioteca-view-species-link hover:text-primary inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 no-underline transition-colors hover:bg-gray-50"
              href={especieUrl}
            >
              <Eye className="h-4 w-4" />
              Ver ficha
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Audios de <span className="italic">{nombreCientifico}</span>
          </h1>
        </div>

        {audios.length === 0 ? (
          <p className="text-sm text-gray-500">No hay audios publicados.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {audios.map((audio) => (
              <AudioCardWithSpectrogram
                key={audio.id}
                audio={audio}
                open={openId === audio.id}
                speciesUrlId={speciesUrlId}
                onToggle={() => setOpenId((v) => (v === audio.id ? null : audio.id))}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
