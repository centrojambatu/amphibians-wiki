"use client";

import {useState} from "react";
import {CornerDownLeft, Search} from "lucide-react";

import {Input} from "@/components/ui/input";
import {Slider} from "@/components/ui/slider";

interface YearRangeFilterProps {
  yearMin: number;
  yearMax: number;
  desde: string;
  hasta: string;
  onChange: (desde: string, hasta: string) => void;
}

export default function YearRangeFilter({
  yearMin,
  yearMax,
  desde,
  hasta,
  onChange,
}: YearRangeFilterProps) {
  const [anioEspecificoInput, setAnioEspecificoInput] = useState("");

  const desdeNum = desde ? Number(desde) : yearMin;
  const hastaNum = hasta ? Number(hasta) : yearMax;
  const isActive = !!desde || !!hasta;

  const applyEspecifico = (v: string) => {
    const n = Number.parseInt(v, 10);
    if (Number.isNaN(n)) return;
    const clamped = Math.min(yearMax, Math.max(yearMin, n));
    onChange(String(clamped), String(clamped));
    setAnioEspecificoInput("");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search
            aria-hidden
            className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
          />
          <Input
            className="pl-10"
            inputMode="numeric"
            maxLength={4}
            pattern="[0-9]*"
            placeholder="Año"
            type="text"
            value={anioEspecificoInput}
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (v) applyEspecifico(v);
            }}
            onChange={(e) =>
              setAnioEspecificoInput(e.target.value.replace(/\D/g, ""))
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const v = (e.target as HTMLInputElement).value.trim();
                if (v) applyEspecifico(v);
              }
            }}
          />
        </div>
        <span className="shrink-0" title="Enter para aplicar">
          <CornerDownLeft aria-hidden className="text-muted-foreground h-4 w-4" />
        </span>
      </div>
      <div className="space-y-2 pt-2">
        <Slider
          className="w-full"
          max={yearMax}
          min={yearMin}
          step={1}
          value={[desdeNum, hastaNum]}
          onValueChange={(v) => {
            const [a, b] = v;
            onChange(String(a ?? yearMin), String(b ?? yearMax));
          }}
        />
        <div className="text-muted-foreground flex items-center justify-between text-xs">
          <span>{yearMin}</span>
          <span className="text-foreground font-semibold">
            {desdeNum} - {hastaNum}
          </span>
          <span>{yearMax}</span>
        </div>
      </div>
      {isActive && (
        <button
          className="text-[10px] text-gray-400 hover:text-gray-600"
          type="button"
          onClick={() => onChange("", "")}
        >
          Limpiar año
        </button>
      )}
    </div>
  );
}
