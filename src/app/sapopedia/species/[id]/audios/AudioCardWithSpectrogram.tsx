"use client";

import {useEffect, useRef, useState} from "react";

import {AudioData} from "@/app/fonoteca/audios-data";
import AudioSpectrogram from "@/components/AudioSpectrogram";

export default function AudioCardWithSpectrogram({audio}: {audio: AudioData}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audioEl = audioRef.current;

    if (audioEl) {
      // Esperar a que el audio esté listo
      const handleCanPlay = () => {
        setAudioElement(audioEl);
      };

      if (audioEl.readyState >= 2) {
        // Si ya está cargado, establecer inmediatamente
        setAudioElement(audioEl);
      } else {
        audioEl.addEventListener("canplay", handleCanPlay);
      }

      return () => {
        audioEl.removeEventListener("canplay", handleCanPlay);
      };
    }
  }, []);

  return (
    <div className="flex-shrink-0" style={{width: "320px"}}>
      <div className="group hover:border-primary relative overflow-hidden rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-md">
        {/* Reproductor de audio */}
        <div className="mb-3">
          <audio
            ref={audioRef}
            controls
            className="w-full"
            crossOrigin="anonymous"
            preload="metadata"
            src={audio.url}
          >
            Tu navegador no soporta el elemento de audio.
          </audio>
        </div>

        {/* Espectrograma */}
        <div className="mb-3">
          <AudioSpectrogram audioElement={audioElement} height={150} width={288} />
        </div>

        {/* Información del audio */}
        <div>
          <h3 className="group-hover:text-primary line-clamp-2 text-sm font-medium text-gray-900">
            {audio.title}
          </h3>
          <p className="mt-1 text-xs text-gray-600">{audio.source}</p>
          {audio.species && <p className="mt-1 text-xs text-gray-500 italic">{audio.species}</p>}
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
            {audio.duration && <span>Duración: {audio.duration}</span>}
            {audio.location && <span>• {audio.location}</span>}
            {audio.date && <span>• {audio.date}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
