"use client";

import {useRef, useState, type SyntheticEvent} from "react";
import {Play, Pause} from "lucide-react";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);

  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface CardAudioPlayerProps {
  src: string;
  onPlay?: (e: SyntheticEvent<HTMLAudioElement>) => void;
}

export default function CardAudioPlayer({src, onPlay}: CardAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  const toggle = () => {
    const el = audioRef.current;

    if (!el) return;
    if (el.paused) void el.play();
    else el.pause();
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = audioRef.current;

    if (!el || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));

    el.currentTime = pct * duration;
    setCurrent(el.currentTime);
  };

  const pct = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div className="flex w-full flex-col items-center gap-1.5">
      <button
        aria-label={playing ? "Pausar" : "Reproducir"}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-500 text-white transition-colors hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
        type="button"
        onClick={toggle}
      >
        {playing ? (
          <Pause className="h-3.5 w-3.5" fill="currentColor" />
        ) : (
          <Play className="h-3.5 w-3.5 translate-x-[1px]" fill="currentColor" />
        )}
      </button>
      <div
        aria-label="Barra de reproducción"
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={Math.round(pct)}
        className="relative h-1.5 w-full cursor-pointer rounded-full bg-gray-300"
        role="progressbar"
        onClick={seek}
      >
        <div
          className="h-full rounded-full bg-gray-600 transition-[width] duration-100"
          style={{width: `${pct}%`}}
        />
      </div>
      <div className="flex w-full justify-between text-[10px] tabular-nums text-gray-500">
        <span>{formatTime(current)}</span>
        <span>{formatTime(duration)}</span>
      </div>
      <audio
        ref={audioRef}
        preload="metadata"
        src={src}
        onEnded={() => setPlaying(false)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onPause={() => setPlaying(false)}
        onPlay={(e) => {
          setPlaying(true);
          onPlay?.(e);
        }}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
      />
    </div>
  );
}
