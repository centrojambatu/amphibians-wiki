"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import MapotecaHistogramaChart from "@/components/mapoteca-histograma-chart";

interface MapStats {
  provincia: { name: string; total: number };
  biogeografico: { name: string; total: number };
  ecosistema: { name: string; total: number };
  piso: { name: string; total: number };
  snap: { name: string; total: number };
  biogeograficoEndemica: { name: string; total: number; totalRegion: number; porcentaje: number };
  histogramaProvincias: { name: string; total: number }[];
  histogramaBiogeografico: { name: string; total: number }[];
  histogramaEcosistema: { name: string; total: number }[];
  histogramaPiso: { name: string; total: number }[];
  histogramaSnap: { name: string; total: number }[];
  histogramaBiogeograficoEndemica: { name: string; total: number; endemicas: number; totalSpp: number }[];
}

export default function MapotecaStats() {


  const [stats, setStats] = useState<MapStats | null>(null);
  const [histogramMode, setHistogramMode] = useState<"provincias" | "biogeografico" | "ecosistema" | "piso" | "snap" | "endemica">("provincias");
  const [histogramaProvincias, setHistogramaProvincias] = useState<{ name: string; total: number }[]>([]);
  const [histogramaBiogeografico, setHistogramaBiogeografico] = useState<{ name: string; total: number }[]>([]);
  const [histogramaEcosistema, setHistogramaEcosistema] = useState<{ name: string; total: number }[]>([]);
  const [histogramaPiso, setHistogramaPiso] = useState<{ name: string; total: number }[]>([]);
  const [histogramaSnap, setHistogramaSnap] = useState<{ name: string; total: number }[]>([]);
  const [histogramaBiogeograficoEndemica, setHistogramaBiogeograficoEndemica] = useState<{ name: string; total: number; endemicas: number; totalSpp: number }[]>([]);
  const globalHistogramaRef = useRef<{
    provincias: { name: string; total: number }[];
    biogeografico: { name: string; total: number }[];
    ecosistema: { name: string; total: number }[];
    piso: { name: string; total: number }[];
    snap: { name: string; total: number }[];
    endemica: { name: string; total: number; endemicas: number; totalSpp: number }[];
  }>({ provincias: [], biogeografico: [], ecosistema: [], piso: [], snap: [], endemica: [] });


  useEffect(() => {
    const STATS_KEY = "mapoteca_stats_v12";
    const STATS_TTL = 60 * 60 * 1000; // 1 hora

    const applyStats = (data: MapStats) => {
      setStats(data);
      const provincias = data.histogramaProvincias ?? [];
      const biogeografico = data.histogramaBiogeografico ?? [];
      const ecosistema = data.histogramaEcosistema ?? [];
      const piso = data.histogramaPiso ?? [];
      const snap = data.histogramaSnap ?? [];
      const endemica = data.histogramaBiogeograficoEndemica ?? [];
      globalHistogramaRef.current = { provincias, biogeografico, ecosistema, piso, snap, endemica };
      setHistogramaProvincias(provincias);
      setHistogramaBiogeografico(biogeografico);
      setHistogramaEcosistema(ecosistema);
      setHistogramaPiso(piso);
      setHistogramaSnap(snap);
      setHistogramaBiogeograficoEndemica(endemica);
    };

    try {
      const raw = sessionStorage.getItem(STATS_KEY);
      if (raw) {
        const { data, timestamp } = JSON.parse(raw);
        // Si falta el nuevo campo, ignorar cache y hacer fetch
        if (Date.now() - timestamp < STATS_TTL && Array.isArray(data?.histogramaEcosistema)) {
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


  const histogramaData = useMemo(() => {
    if (histogramMode === "biogeografico") return histogramaBiogeografico;
    if (histogramMode === "ecosistema") return histogramaEcosistema;
    if (histogramMode === "piso") return histogramaPiso;
    if (histogramMode === "snap") return histogramaSnap;
    if (histogramMode === "endemica") return histogramaBiogeograficoEndemica;
    return histogramaProvincias;
  }, [histogramMode, histogramaBiogeografico, histogramaProvincias, histogramaEcosistema, histogramaPiso, histogramaSnap, histogramaBiogeograficoEndemica]);

  const histogramaTitle =
    histogramMode === "biogeografico" ? "Especies por región biogeográfica" :
    histogramMode === "ecosistema" ? "Especies por ecosistema" :
    histogramMode === "piso" ? "Especies por piso altitudinal" :
    histogramMode === "snap" ? "Especies por área protegida (SNAP)" :
    histogramMode === "endemica" ? "Endémicas por región biogeográfica" :
    "Especies por provincia";

  const histogramaUnit =
    histogramMode === "biogeografico" ? "regiones" :
    histogramMode === "ecosistema" ? "ecosistemas" :
    histogramMode === "piso" ? "pisos" :
    histogramMode === "snap" ? "áreas" :
    histogramMode === "endemica" ? "regiones" :
    "provincias";

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

        <Card
          className={`min-w-0 cursor-pointer overflow-visible transition-shadow hover:shadow-md ${histogramMode === "ecosistema" ? "ring-2 ring-[#f07304]/70" : ""}`}
          onClick={() => setHistogramMode("ecosistema")}
        >
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

        <Card
          className={`min-w-0 cursor-pointer overflow-visible transition-shadow hover:shadow-md ${histogramMode === "piso" ? "ring-2 ring-[#f07304]/70" : ""}`}
          onClick={() => setHistogramMode("piso")}
        >
          <CardContent className="pt-4">
            <p className="text-3xl font-bold tabular-nums sm:text-4xl">
              {stats ? stats.piso.total.toLocaleString() : "—"}
            </p>
            <p className="text-muted-foreground text-xs break-words sm:text-sm">
              Especies en piso altitudinal más diverso
            </p>
            {stats?.piso.name && (
              <p className="text-foreground mt-0.5 line-clamp-1 text-[10px] font-medium sm:text-xs">
                {stats.piso.name}
              </p>
            )}
          </CardContent>
        </Card>

        <Card
          className={`min-w-0 cursor-pointer overflow-visible transition-shadow hover:shadow-md ${histogramMode === "snap" ? "ring-2 ring-[#f07304]/70" : ""}`}
          onClick={() => setHistogramMode("snap")}
        >
          <CardContent className="pt-4">
            <p className="text-3xl font-bold tabular-nums sm:text-4xl">
              {stats ? stats.snap.total.toLocaleString() : "—"}
            </p>
            <p className="text-muted-foreground text-xs break-words sm:text-sm">
              Especies en área SNAP más diversa
            </p>
            {stats?.snap.name && (
              <p className="text-foreground mt-0.5 line-clamp-2 text-[10px] font-medium sm:text-xs">
                {stats.snap.name}
              </p>
            )}
          </CardContent>
        </Card>

        <Card
          className={`min-w-0 cursor-pointer overflow-visible transition-shadow hover:shadow-md ${histogramMode === "endemica" ? "ring-2 ring-[#f07304]/70" : ""}`}
          onClick={() => setHistogramMode("endemica")}
        >
          <CardContent className="pt-4">
            <p className="text-3xl font-bold tabular-nums sm:text-4xl">
              {stats ? stats.biogeograficoEndemica.total.toLocaleString() : "—"}
            </p>
            {stats && stats.biogeograficoEndemica.totalRegion > 0 && (
              <p className="text-[#f07304] text-xs font-semibold tabular-nums">
                {stats.biogeograficoEndemica.porcentaje}% endémicas
              </p>
            )}
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
          onBarClick={() => {}}
          title={histogramaTitle}
          unit={histogramaUnit}
          showLabels={histogramMode === "provincias" || histogramMode === "biogeografico" || histogramMode === "endemica"}
          secondaryLabel="endémicas"
        />
      </div>
    </div>
  );
}

