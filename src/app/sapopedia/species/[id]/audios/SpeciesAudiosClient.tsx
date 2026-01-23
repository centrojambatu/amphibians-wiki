"use client";

import Link from "next/link";
import {ArrowLeft, Eye} from "lucide-react";
import {AudioData} from "@/app/fonoteca/audios-data";
import AudioCardWithSpectrogram from "./AudioCardWithSpectrogram";

interface SpeciesAudiosClientProps {
  nombreCientifico: string;
  especieUrl: string;
  fromFonoteca: boolean;
  fonotecaUrl: string;
  audiosExternos: AudioData[];
  audiosPropios: AudioData[];
}

export default function SpeciesAudiosClient({
  nombreCientifico,
  especieUrl,
  fromFonoteca,
  fonotecaUrl,
  audiosExternos,
  audiosPropios,
}: SpeciesAudiosClientProps) {
  return (
    <div className="bg-background min-h-screen">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {fromFonoteca ? (
                <Link
                  className="fonoteca-back-link inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-primary no-underline"
                  href={fonotecaUrl}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver a Fonoteca
                </Link>
              ) : (
                <Link
                  className="fonoteca-back-link inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-primary no-underline"
                  href={especieUrl}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver a la ficha de la especie
                </Link>
              )}
            </div>
            <Link
              className="fonoteca-view-species-link inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-primary no-underline"
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

        {/* Sección Audios Externos */}
        <section className="mb-12">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Audios externos</h2>
            <p className="mt-1 text-sm text-gray-600">Audios de fuentes externas relacionadas con esta especie</p>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {audiosExternos.map((audio) => (
              <AudioCardWithSpectrogram key={audio.id} audio={audio} />
            ))}
          </div>
        </section>

        {/* Sección Audios Propios */}
        <section className="mb-12">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Audios propios</h2>
            <p className="mt-1 text-sm text-gray-600">Audios producidos por el Centro Jambatu</p>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {audiosPropios.map((audio) => (
              <AudioCardWithSpectrogram key={audio.id} audio={audio} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
