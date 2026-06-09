"use client";

import {Pause, Play, Volume2, VolumeX} from "lucide-react";
import {useEffect, useRef, useState} from "react";

interface Props {
  src: string;
  height?: number;
}

const WS_PLAY_EVENT = "wavesurfer-play";
let wsPlayCounter = 0;

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);

  return `${String(m)}:${String(s).padStart(2, "0")}`;
}

export default function AudioSpectrogramOscillogram({src, height = 80}: Props) {
  const waveformContainerRef = useRef<HTMLDivElement>(null);
  const spectrogramContainerRef = useRef<HTMLDivElement>(null);
  const tintOverlayRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let ws: any = null;
    const instanceId = ++wsPlayCounter;
    const onOtherPlay = (e: Event) => {
      const detail = (e as CustomEvent<{id: number}>).detail;
      if (detail?.id !== instanceId && ws) {
        try {
          ws.pause();
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener(WS_PLAY_EVENT, onOtherPlay);

    const init = async () => {
      const waveformEl = waveformContainerRef.current;
      const spectrogramEl = spectrogramContainerRef.current;

      if (!waveformEl || !spectrogramEl) return;

      try {
        const [{default: WaveSurfer}, spectrogramMod] = await Promise.all([
          import("wavesurfer.js"),
          import("wavesurfer.js/dist/plugins/spectrogram.esm.js"),
        ]);

        if (cancelled) return;
        const Spectrogram = spectrogramMod.default;

        const spectrogramPlugin = Spectrogram.create({
          container: spectrogramEl,
          labels: false,
          height,
          splitChannels: false,
          scale: "mel",
          fftSamples: 1024,
          gainDB: 30,
          rangeDB: 70,
          useWebWorker: true,
        });

        ws = WaveSurfer.create({
          container: waveformEl,
          waveColor: "#39ff14",
          progressColor: "#ff6a00",
          cursorColor: "#fff",
          height,
          normalize: true,
          url: src,
          plugins: [spectrogramPlugin],
        });

        ws.on("error", (err: unknown) => {
          const msg = err instanceof Error ? err.message : String(err);

          setError(msg);
        });

        const updateClip = (progress: number) => {
          const overlay = tintOverlayRef.current;

          if (!overlay) return;
          const clamped = Math.max(0, Math.min(1, progress));
          const hiddenPct = (1 - clamped) * 100;

          overlay.style.clipPath = `inset(0 ${String(hiddenPct)}% 0 0)`;
        };

        const onReady = () => {
          updateClip(0);
          setDuration(ws.getDuration());
          setLoading(false);
        };
        const onAudioProcess = () => {
          const dur = ws.getDuration();

          if (!dur) return;
          const t = ws.getCurrentTime();

          updateClip(t / dur);
          setCurrentTime(t);
        };
        const onFinish = () => {
          updateClip(1);
          setIsPlaying(false);
        };

        ws.on("ready", onReady);
        ws.on("audioprocess", onAudioProcess);
        ws.on("seeking", onAudioProcess);
        ws.on("timeupdate", onAudioProcess);
        ws.on("finish", onFinish);
        ws.on("play", () => {
          setIsPlaying(true);
          // Avisar a otras instancias para que se pausen
          window.dispatchEvent(
            new CustomEvent(WS_PLAY_EVENT, {detail: {id: instanceId}}),
          );
        });
        ws.on("pause", () => setIsPlaying(false));

        const overlay = tintOverlayRef.current;

        if (overlay) {
          overlay.style.transition = "clip-path 0.05s linear";
        }
        updateClip(0);

        wavesurferRef.current = ws;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error al cargar visualización";

        if (!cancelled) setError(msg);
      }
    };

    void init();

    return () => {
      cancelled = true;
      window.removeEventListener(WS_PLAY_EVENT, onOtherPlay);
      if (ws) {
        try {
          ws.destroy();
        } catch {
          // ignore
        }
      }
      wavesurferRef.current = null;
    };
  }, [src, height]);

  const togglePlay = () => {
    const ws = wavesurferRef.current;

    if (!ws) return;
    ws.playPause();
  };

  const toggleMute = () => {
    const ws = wavesurferRef.current;

    if (!ws) return;
    const next = !muted;

    setMuted(next);
    ws.setMuted(next);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center rounded-md bg-gray-100 px-3 py-4 text-xs text-gray-500">
        {error}
      </div>
    );
  }

  const grayFilterStyle = {
    filter: isPlaying ? "grayscale(0)" : "grayscale(1)",
    transition: "filter 700ms ease-in-out",
  } as const;

  return (
    <div className="space-y-2">
      <div>
        <p className="mb-1 text-sm font-medium tracking-wide text-gray-600">
          Oscilograma
        </p>
        <div
          ref={waveformContainerRef}
          className="overflow-hidden rounded-md bg-black"
          style={grayFilterStyle}
        />
      </div>
      <div>
        <p className="mb-1 text-sm font-medium tracking-wide text-gray-600">
          Espectrograma
        </p>
        <div
          className="relative overflow-hidden rounded-md bg-black"
          style={{minHeight: height, ...grayFilterStyle}}
        >
          <div ref={spectrogramContainerRef} />
          <div
            ref={tintOverlayRef}
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundColor: "#39ff14",
              mixBlendMode: "hue",
              clipPath: "inset(0 100% 0 0)",
            }}
          />
          {loading && (
            <div
              aria-hidden
              className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900"
            />
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white">
        <button
          aria-label={isPlaying ? "Pausar" : "Reproducir"}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black transition-colors hover:bg-gray-200"
          type="button"
          onClick={togglePlay}
        >
          {isPlaying ? (
            <Pause className="h-3.5 w-3.5" fill="currentColor" />
          ) : (
            <Play className="h-3.5 w-3.5 translate-x-[1px]" fill="currentColor" />
          )}
        </button>
        <span className="font-mono tabular-nums text-gray-300">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
        <button
          aria-label={muted ? "Activar audio" : "Silenciar"}
          className="ml-auto flex h-6 w-6 items-center justify-center rounded text-gray-300 hover:text-white"
          type="button"
          onClick={toggleMute}
        >
          {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}
