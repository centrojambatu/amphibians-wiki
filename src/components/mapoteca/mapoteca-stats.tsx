"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import MapotecaHistogramaChart from "@/components/mapoteca-histograma-chart";

interface MapStats {
  provincia: { name: string; total: number };
  biogeografico: { name: string; total: number };
  ecosistema: { name: string; total: number };
  piso: { name: string; total: number };
  snap: { name: string; total: number };
  biogeograficoEndemica: { name: string; total: number };
  histogramaProvincias: { name: string; total: number }[];
  histogramaBiogeografico: { name: string; total: number }[];
}

export default function MapotecaStats() {
  const [activePisos, setActivePisos] = useState<string[]>([]);
  const [activeSnaps, setActiveSnaps] = useState<string[]>([]);
  const [, startTransition] = useTransition();

  const [stats, setStats] = useState<MapStats | null>(null);
  const [histogramMode, setHistogramMode] = useState<"provincias" | "biogeografico">("provincias");
  const [histogramaProvincias, setHistogramaProvincias] = useState<{ name: string; total: number }[]>([]);
  const [histogramaBiogeografico, setHistogramaBiogeografico] = useState<{ name: string; total: number }[]>([]);
  const globalHistogramaRef = useRef<{
    provincias: { name: string; total: number }[];
    biogeografico: { name: string; total: number }[];
  }>({ provincias: [], biogeografico: [] });

  const onProvinciaClick = (name: string) => {
    // Click sin selección persistente (solo acción momentánea)
    void name;
  };

  const onPisoClick = (name: string) => {
    startTransition(() => {
      setActivePisos((prev) => (prev.includes(name) ? [] : [name]));
      setActiveSnaps([]);
    });
  };

  const onSnapClick = (name: string) => {
    startTransition(() => {
      setActiveSnaps((prev) => (prev.includes(name) ? [] : [name]));
      setActivePisos([]);
    });
  };

  useEffect(() => {
    const STATS_KEY = "mapoteca_stats_v3";
    const STATS_TTL = 60 * 60 * 1000; // 1 hora

    const applyStats = (data: MapStats) => {
      setStats(data);
      const provincias = data.histogramaProvincias ?? [];
      const biogeografico = data.histogramaBiogeografico ?? [];
      globalHistogramaRef.current = { provincias, biogeografico };
      setHistogramaProvincias(provincias);
      setHistogramaBiogeografico(biogeografico);
    };

    try {
      const raw = sessionStorage.getItem(STATS_KEY);
      if (raw) {
        const { data, timestamp } = JSON.parse(raw);
        // Si falta el nuevo campo, ignorar cache y hacer fetch
        if (Date.now() - timestamp < STATS_TTL && Array.isArray(data?.histogramaBiogeografico)) {
          applyStats(data);
          return;
        }
      }
    } catch {
      /* ignorar */
    }

    fetch("/api/mapoteca/estadisticas")
      .then((r) => r.json())
      .then((data: MapStats) => {
        applyStats(data);
        try {
          sessionStorage.setItem(STATS_KEY, JSON.stringify({ data, timestamp: Date.now() }));
        } catch {
          /* ignorar */
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (activePisos.length > 0) params.set("pisos", activePisos.join(","));
    if (activeSnaps.length > 0) params.set("snaps", activeSnaps.join(","));
    const qs = params.toString();

    if (!qs) {
      setHistogramaProvincias(globalHistogramaRef.current.provincias);
      setHistogramaBiogeografico(globalHistogramaRef.current.biogeografico);
      return;
    }

    fetch(`/api/mapoteca/estadisticas?${qs}`)
      .then((r) => r.json())
      .then((data: MapStats) => {
        setHistogramaProvincias(data.histogramaProvincias ?? []);
        setHistogramaBiogeografico(data.histogramaBiogeografico ?? []);
      })
      .catch(() => {});
  }, [activePisos, activeSnaps]);

  const histogramaData = useMemo(() => {
    return histogramMode === "biogeografico" ? histogramaBiogeografico : histogramaProvincias;
  }, [histogramMode, histogramaBiogeografico, histogramaProvincias]);

  const histogramaTitle = histogramMode === "biogeografico" ? "Especies por región biogeográfica" : "Especies por provincia";

  return (
    <div className="container mx-auto px-4 pb-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-7">
        <Card
          className={`min-w-0 cursor-pointer overflow-visible transition-shadow hover:shadow-md ${histogramMode === "provincias" ? "ring-2 ring-[#f07304]/70" : ""}`}
          onClick={() => setHistogramMode("provincias")}
        >
          <CardContent className="pt-4">
            <p className="text-3xl font-bold tabular-nums sm:text-4xl">
              {stats ? stats.provincia.total.toLocaleString() : "—"}
            </p>
            <p className="text-muted-foreground text-xs break-words sm:text-sm">
              Especies en provincia más diversa
            </p>
            {stats?.provincia.name && (
              <p className="text-foreground mt-0.5 line-clamp-1 text-[10px] font-medium sm:text-xs">
                {stats.provincia.name}
              </p>
            )}
          </CardContent>
        </Card>

        <Card
          className={`min-w-0 cursor-pointer overflow-visible transition-shadow hover:shadow-md ${histogramMode === "biogeografico" ? "ring-2 ring-[#f07304]/70" : ""}`}
          onClick={() => setHistogramMode("biogeografico")}
        >
          <CardContent className="pt-4">
            <p className="text-3xl font-bold tabular-nums sm:text-4xl">
              {stats ? stats.biogeografico.total.toLocaleString() : "—"}
            </p>
            <p className="text-muted-foreground text-xs break-words sm:text-sm">
              Especies en región biogeográfica más diversa
            </p>
            {stats?.biogeografico.name && (
              <p className="text-foreground mt-0.5 line-clamp-2 text-[10px] font-medium sm:text-xs">
                {stats.biogeografico.name}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0 overflow-visible transition-shadow hover:shadow-md">
          <CardContent className="pt-4">
            <p className="text-3xl font-bold tabular-nums sm:text-4xl">
              {stats ? stats.ecosistema.total.toLocaleString() : "—"}
            </p>
            <p className="text-muted-foreground text-xs break-words sm:text-sm">
              Especies en ecosistema más diverso
            </p>
            {stats?.ecosistema.name && (
              <p className="text-foreground mt-0.5 line-clamp-2 text-[10px] font-medium sm:text-xs">
                {stats.ecosistema.name}
              </p>
            )}
          </CardContent>
        </Card>

        {stats?.piso.name ? (
          <Card
            className={`min-w-0 cursor-pointer overflow-visible transition-shadow hover:shadow-md ${activePisos.includes(stats.piso.name) ? "bg-orange-50 ring-2 ring-[#f07304]" : ""}`}
            onClick={() => onPisoClick(stats.piso.name)}
          >
            <CardContent className="pt-4">
              <p className="text-3xl font-bold tabular-nums sm:text-4xl">
                {stats.piso.total.toLocaleString()}
              </p>
              <p className="text-muted-foreground text-xs break-words sm:text-sm">
                Especies en piso altitudinal más diverso
              </p>
              <p className="text-foreground mt-0.5 line-clamp-1 text-[10px] font-medium sm:text-xs">
                {stats.piso.name}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="min-w-0 overflow-visible transition-shadow hover:shadow-md">
            <CardContent className="pt-4">
              <p className="text-3xl font-bold tabular-nums sm:text-4xl">—</p>
              <p className="text-muted-foreground text-xs break-words sm:text-sm">
                Especies en piso altitudinal más diverso
              </p>
            </CardContent>
          </Card>
        )}

        {stats?.snap.name ? (
          <Card
            className={`min-w-0 cursor-pointer overflow-visible transition-shadow hover:shadow-md ${activeSnaps.includes(stats.snap.name) ? "bg-orange-50 ring-2 ring-[#f07304]" : ""}`}
            onClick={() => onSnapClick(stats.snap.name)}
          >
            <CardContent className="pt-4">
              <p className="text-3xl font-bold tabular-nums sm:text-4xl">
                {stats.snap.total.toLocaleString()}
              </p>
              <p className="text-muted-foreground text-xs break-words sm:text-sm">
                Especies en área SNAP más diversa
              </p>
              <p className="text-foreground mt-0.5 line-clamp-2 text-[10px] font-medium sm:text-xs">
                {stats.snap.name}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="min-w-0 overflow-visible transition-shadow hover:shadow-md">
            <CardContent className="pt-4">
              <p className="text-3xl font-bold tabular-nums sm:text-4xl">—</p>
              <p className="text-muted-foreground text-xs break-words sm:text-sm">
                Especies en área SNAP más diversa
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="min-w-0 overflow-visible transition-shadow hover:shadow-md">
          <CardContent className="pt-4">
            <p className="text-3xl font-bold tabular-nums sm:text-4xl">
              {stats ? stats.biogeograficoEndemica.total.toLocaleString() : "—"}
            </p>
            <p className="text-muted-foreground text-xs break-words sm:text-sm">
              Endémicas en región biogeográfica más endémica
            </p>
            {stats?.biogeograficoEndemica.name && (
              <p className="text-foreground mt-0.5 line-clamp-2 text-[10px] font-medium sm:text-xs">
                {stats.biogeograficoEndemica.name}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4">
        <MapotecaHistogramaChart
          activeProvincias={[]}
          data={histogramaData}
          onBarClick={onProvinciaClick}
          title={histogramaTitle}
          unit={histogramMode === "biogeografico" ? "regiones" : "provincias"}
        />
      </div>
    </div>
  );
}

