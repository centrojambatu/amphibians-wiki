"use client";

import Link from "next/link";
import {ArrowLeft, Eye} from "lucide-react";

import {AudioData} from "@/app/audioteca/audios-data";

import AudioCardWithSpectrogram from "./AudioCardWithSpectrogram";

interface SpeciesAudiosClientProps {
  nombreCientifico: string;
  especieUrl: string;
  fromAudioteca: boolean;
  audiotecaUrl: string;
  audiosExternos: AudioData[];
  audiosPropios: AudioData[];
}

export default function SpeciesAudiosClient({
  nombreCientifico,
  especieUrl,
  fromAudioteca,
  audiotecaUrl,
  audiosExternos,
  audiosPropios,
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

        <section className="mb-12">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Audios externos</h2>
            <p className="mt-1 text-sm text-gray-600">
              Audios de fuentes externas relacionadas con esta especie
            </p>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {audiosExternos.map((audio) => (
              <AudioCardWithSpectrogram key={audio.id} audio={audio} />
            ))}
          </div>
        </section>

        <section className="mb-12">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Audios propios</h2>
            <p className="mt-1 text-sm text-gray-600">Audios producidos por el Centro Jambatu</p>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {audiosPropios.map((audio) => (
              <AudioCardWithSpectrogram key={audio.id} audio={audio} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
