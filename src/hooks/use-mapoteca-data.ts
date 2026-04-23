"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import type { UbicacionEspecie, MapotecaResponse } from "@/app/api/mapoteca/route";

// ── IndexedDB para persistencia (sin límite de tamaño como localStorage) ──
const IDB_DB_NAME = "mapoteca_cache";
const IDB_STORE_NAME = "points";
const IDB_KEY = "all_points";
const IDB_TTL_MS = 2 * 60 * 60 * 1000; // 2 horas

function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(IDB_STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function compress(data: UbicacionEspecie[]): any[] {
  return data.map((u) => [
    u.latitud, u.longitud, u.taxon_id, u.nombre_cientifico, u.origen,
    u.id_coleccion, u.provincia, u.localidad, u.catalogo_museo, u.numero_museo,
    u.elevacion, u.fecha_coleccion, u.colectores, u.genero, u.rank_id, u.cita_corta,
  ]);
}

function decompress(arr: any[]): UbicacionEspecie[] {
  return arr.map((r) => ({
    latitud: r[0], longitud: r[1], taxon_id: r[2], nombre_cientifico: r[3], origen: r[4],
    id_coleccion: r[5], provincia: r[6], localidad: r[7], catalogo_museo: r[8], numero_museo: r[9],
    elevacion: r[10], fecha_coleccion: r[11], colectores: r[12], genero: r[13], rank_id: r[14], cita_corta: r[15],
  }));
}

async function getFromIDB(): Promise<MapotecaResponse | null> {
  if (typeof window === "undefined") return null;
  try {
    const db = await openIDB();
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE_NAME, "readonly");
      const req = tx.objectStore(IDB_STORE_NAME).get(IDB_KEY);
      req.onsuccess = () => {
        const val = req.result;
        if (!val || !val.d || Date.now() - (val.ts ?? 0) > IDB_TTL_MS) {
          resolve(null);
          return;
        }
        resolve({ data: decompress(val.d), total: val.t });
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function saveToIDB(data: UbicacionEspecie[], total: number): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const db = await openIDB();
    const compressed = { d: compress(data), t: total, ts: Date.now() };
    const tx = db.transaction(IDB_STORE_NAME, "readwrite");
    tx.objectStore(IDB_STORE_NAME).put(compressed, IDB_KEY);
  } catch {
    // Ignorar
  }
}

// ── Query key builder ──
function buildQueryKey(filters: MapotecaFilters) {
  return ["mapoteca", filters] as const;
}

function buildSearchParams(filters: MapotecaFilters): string {
  const params = new URLSearchParams();
  if (filters.provinciaFilter?.length) params.set("provincias", filters.provinciaFilter.join(","));
  if (filters.pisoFilter?.length) params.set("pisos", filters.pisoFilter.join(","));
  if (filters.snapFilter?.length) params.set("snaps", filters.snapFilter.join(","));
  if (filters.especieFilter?.length) params.set("especies", filters.especieFilter.join("||"));
  if (filters.catalogoFilter?.length) params.set("catalogos", filters.catalogoFilter.join("||"));
  if (filters.localidadesFilter?.length) params.set("localidades", filters.localidadesFilter.join("||"));
  if (filters.elevacionMin != null) params.set("elevacion_min", String(filters.elevacionMin));
  if (filters.elevacionMax != null) params.set("elevacion_max", String(filters.elevacionMax));
  if (filters.fechaDesde) params.set("fecha_desde", filters.fechaDesde);
  if (filters.fechaHasta) params.set("fecha_hasta", filters.fechaHasta);
  return params.toString();
}

function isEmptyFilter(filters: MapotecaFilters): boolean {
  return (
    !filters.provinciaFilter?.length &&
    !filters.pisoFilter?.length &&
    !filters.snapFilter?.length &&
    !filters.especieFilter?.length &&
    !filters.catalogoFilter?.length &&
    !filters.localidadesFilter?.length &&
    filters.elevacionMin == null &&
    filters.elevacionMax == null &&
    !filters.fechaDesde &&
    !filters.fechaHasta
  );
}

// ── Tipos ──
export interface MapotecaFilters {
  provinciaFilter?: string[];
  pisoFilter?: string[];
  snapFilter?: string[];
  especieFilter?: string[];
  catalogoFilter?: string[];
  localidadesFilter?: string[];
  elevacionMin?: number;
  elevacionMax?: number;
  fechaDesde?: string;
  fechaHasta?: string;
}

// ── Hook principal ──
export function useMapotecaData(filters: MapotecaFilters = {}) {
  const empty = isEmptyFilter(filters);

  return useQuery<MapotecaResponse>({
    queryKey: buildQueryKey(filters),
    queryFn: async () => {
      // Para dataset sin filtros, intentar IndexedDB primero
      if (empty) {
        const cached = await getFromIDB();
        if (cached) return cached;
      }

      const qs = buildSearchParams(filters);
      const res = await fetch(`/api/mapoteca${qs ? `?${qs}` : ""}`);
      if (!res.ok) throw new Error("Error al cargar datos");

      const result: MapotecaResponse = await res.json();

      // Guardar en IndexedDB solo el dataset completo
      if (empty) {
        saveToIDB(result.data, result.total);
      }

      return result;
    },
    staleTime: 30 * 60 * 1000, // 30 minutos
    gcTime: 60 * 60 * 1000, // 1 hora
  });
}

// ── Prefetch (para llamar desde el Home) ──
export function usePrefetchMapoteca() {
  const queryClient = useQueryClient();

  return () => {
    const filters: MapotecaFilters = {};
    queryClient.prefetchQuery({
      queryKey: buildQueryKey(filters),
      queryFn: async () => {
        const cached = await getFromIDB();
        if (cached) return cached;

        const res = await fetch("/api/mapoteca", { priority: "low" } as any);
        if (!res.ok) throw new Error("Error al cargar datos");

        const result: MapotecaResponse = await res.json();
        saveToIDB(result.data, result.total);
        return result;
      },
      staleTime: 30 * 60 * 1000,
    });
  };
}
