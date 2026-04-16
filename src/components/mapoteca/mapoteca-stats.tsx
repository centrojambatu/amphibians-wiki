"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
    histogramMode === "biogeografico" ? "Especies por sector biogeográfico" :
    histogramMode === "ecosistema" ? "Especies por ecosistema" :
    histogramMode === "piso" ? "Especies por piso altitudinal" :
    histogramMode === "snap" ? "Especies por área protegida (SNAP)" :
    histogramMode === "endemica" ? "Endémicas por sector biogeográfico" :
    "Especies por provincia";

  const histogramaUnit =
    histogramMode === "biogeografico" ? "regiones" :
    histogramMode === "ecosistema" ? "ecosistemas" :
    histogramMode === "piso" ? "pisos" :
    histogramMode === "snap" ? "áreas" :
    histogramMode === "endemica" ? "regiones" :
    "provincias";

  return (
    <div className="pb-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {/* Provincia */}
        <button
          type="button"
          className={`flex flex-col items-center justify-center rounded-md border p-2 cursor-pointer transition-shadow hover:shadow-md ${histogramMode === "provincias" ? "ring-2 ring-[#f07304]/70" : ""}`}
          style={{ borderColor: "#dddddd" }}
          onClick={() => setHistogramMode("provincias")}
        >
          <span className="text-center text-3xl font-bold sm:text-4xl" style={{ color: "#000000" }}>
            {stats ? stats.provincia.total.toLocaleString() : "—"}
          </span>
          <h4 className="mt-1 text-center" style={{ color: "#666666", fontSize: "13px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif', fontWeight: "400" }}>
            Especies en provincia más diversa
          </h4>
          {stats?.provincia.name && (
            <span className="text-center text-xs font-semibold" style={{ color: "#000000" }}>{stats.provincia.name}</span>
          )}
        </button>

        {/* Biogeográfico */}
        <button
          type="button"
          className={`flex flex-col items-center justify-center rounded-md border p-2 cursor-pointer transition-shadow hover:shadow-md ${histogramMode === "biogeografico" ? "ring-2 ring-[#f07304]/70" : ""}`}
          style={{ borderColor: "#dddddd" }}
          onClick={() => setHistogramMode("biogeografico")}
        >
          <span className="text-center text-3xl font-bold sm:text-4xl" style={{ color: "#000000" }}>
            {stats ? stats.biogeografico.total.toLocaleString() : "—"}
          </span>
          <h4 className="mt-1 text-center" style={{ color: "#666666", fontSize: "13px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif', fontWeight: "400" }}>
            Especies en sector biogeográfico más diverso
          </h4>
          {stats?.biogeografico.name && (
            <span className="text-center text-xs font-semibold" style={{ color: "#000000" }}>{stats.biogeografico.name}</span>
          )}
        </button>

        {/* Ecosistema */}
        <button
          type="button"
          className={`flex flex-col items-center justify-center rounded-md border p-2 cursor-pointer transition-shadow hover:shadow-md ${histogramMode === "ecosistema" ? "ring-2 ring-[#f07304]/70" : ""}`}
          style={{ borderColor: "#dddddd" }}
          onClick={() => setHistogramMode("ecosistema")}
        >
          <span className="text-center text-3xl font-bold sm:text-4xl" style={{ color: "#000000" }}>
            {stats ? stats.ecosistema.total.toLocaleString() : "—"}
          </span>
          <h4 className="mt-1 text-center" style={{ color: "#666666", fontSize: "13px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif', fontWeight: "400" }}>
            Especies en ecosistema más diverso
          </h4>
          {stats?.ecosistema.name && (
            <span className="text-center text-xs font-semibold" style={{ color: "#000000" }}>{stats.ecosistema.name}</span>
          )}
        </button>

        {/* Piso altitudinal */}
        <button
          type="button"
          className={`flex flex-col items-center justify-center rounded-md border p-2 cursor-pointer transition-shadow hover:shadow-md ${histogramMode === "piso" ? "ring-2 ring-[#f07304]/70" : ""}`}
          style={{ borderColor: "#dddddd" }}
          onClick={() => setHistogramMode("piso")}
        >
          <span className="text-center text-3xl font-bold sm:text-4xl" style={{ color: "#000000" }}>
            {stats ? stats.piso.total.toLocaleString() : "—"}
          </span>
          <h4 className="mt-1 text-center" style={{ color: "#666666", fontSize: "13px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif', fontWeight: "400" }}>
            Especies en piso altitudinal más diverso
          </h4>
          {stats?.piso.name && (
            <span className="text-center text-xs font-semibold" style={{ color: "#000000" }}>{stats.piso.name}</span>
          )}
        </button>

        {/* SNAP */}
        <button
          type="button"
          className={`flex flex-col items-center justify-center rounded-md border p-2 cursor-pointer transition-shadow hover:shadow-md ${histogramMode === "snap" ? "ring-2 ring-[#f07304]/70" : ""}`}
          style={{ borderColor: "#dddddd" }}
          onClick={() => setHistogramMode("snap")}
        >
          <span className="text-center text-3xl font-bold sm:text-4xl" style={{ color: "#000000" }}>
            {stats ? stats.snap.total.toLocaleString() : "—"}
          </span>
          <h4 className="mt-1 text-center" style={{ color: "#666666", fontSize: "13px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif', fontWeight: "400" }}>
            Especies en área SNAP más diversa
          </h4>
          {stats?.snap.name && (
            <span className="text-center text-xs font-semibold" style={{ color: "#000000" }}>{stats.snap.name}</span>
          )}
        </button>

        {/* Endémicas biogeográfico */}
        <button
          type="button"
          className={`flex flex-col items-center justify-center rounded-md border p-2 cursor-pointer transition-shadow hover:shadow-md ${histogramMode === "endemica" ? "ring-2 ring-[#f07304]/70" : ""}`}
          style={{ borderColor: "#dddddd" }}
          onClick={() => setHistogramMode("endemica")}
        >
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold sm:text-4xl" style={{ color: "#000000" }}>
              {stats ? stats.biogeograficoEndemica.total.toLocaleString() : "—"}
            </span>
            {stats && stats.biogeograficoEndemica.totalRegion > 0 && (
              <span className="text-xs font-semibold" style={{ color: "#f07304" }}>
                {stats.biogeograficoEndemica.porcentaje}%
              </span>
            )}
          </div>
          <h4 className="mt-1 text-center" style={{ color: "#666666", fontSize: "13px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif', fontWeight: "400" }}>
            Endémicas en sector biogeográfico más endémico
          </h4>
          {stats?.biogeograficoEndemica.name && (
            <span className="text-center text-xs font-semibold" style={{ color: "#000000" }}>{stats.biogeograficoEndemica.name}</span>
          )}
        </button>
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

