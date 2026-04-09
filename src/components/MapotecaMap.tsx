"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { useRouter } from "next/navigation";
import "leaflet/dist/leaflet.css";

import type { UbicacionEspecie, MapotecaResponse } from "@/app/api/mapoteca/route";

// Canvas renderer para mejor rendimiento con miles de puntos
const canvasRenderer =
  typeof window !== "undefined" ? L.canvas({ padding: 0.5 }) : undefined;

// Caché en memoria a nivel de módulo — persiste mientras el usuario navega sin recargar
interface CacheEntry {
  data: UbicacionEspecie[];
  total: number;
  timestamp: number;
}
const dataCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutos en memoria
const SESSION_TTL_MS = 60 * 60 * 1000; // 1 hora en sessionStorage
const SESSION_STORAGE_KEY = "mapoteca_cache_v2";
// Solo cachear en sessionStorage el dataset sin filtros (el más pesado y común)
const EMPTY_FILTER_KEY = buildCacheKey({});

function buildCacheKey(filters: {
  provinciaFilter?: string[];
  pisoFilter?: string[];
  snapFilter?: string[];
  especieFilter?: string[];
  catalogoFilter?: string[];
  localidadesFilter?: string[];
  elevacionMin?: number;
  elevacionMax?: number;
}): string {
  return JSON.stringify(filters);
}

function getSessionCached(): CacheEntry | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > SESSION_TTL_MS) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
    return entry;
  } catch {
    return null;
  }
}

function setSessionCache(entry: CacheEntry) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(entry));
  } catch {
    // sessionStorage lleno — ignorar silenciosamente
  }
}

function getCached(key: string): CacheEntry | null {
  // 1. Memoria
  const mem = dataCache.get(key);
  if (mem) {
    if (Date.now() - mem.timestamp > CACHE_TTL_MS) {
      dataCache.delete(key);
    } else {
      return mem;
    }
  }
  // 2. sessionStorage (solo para dataset sin filtros)
  if (key === EMPTY_FILTER_KEY) {
    const session = getSessionCached();
    if (session) {
      dataCache.set(key, session); // restaurar en memoria
      return session;
    }
  }
  return null;
}

function setCache(key: string, data: UbicacionEspecie[], total: number) {
  const entry: CacheEntry = { data, total, timestamp: Date.now() };
  dataCache.set(key, entry);
  // Persistir en sessionStorage solo el dataset completo sin filtros
  if (key === EMPTY_FILTER_KEY) {
    setSessionCache(entry);
  }
}

// Componente para ajustar la vista del mapa
function MapBoundsAdjuster({
  ubicaciones,
  skip,
}: {
  ubicaciones: UbicacionEspecie[];
  skip?: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (skip) return;
    if (ubicaciones.length > 0) {
      const validUbicaciones = ubicaciones.filter(
        (u) => u.latitud && u.longitud
      );
      if (validUbicaciones.length > 0) {
        const bounds = validUbicaciones.map(
          (u) => [u.latitud!, u.longitud!] as [number, number]
        );
        map.fitBounds(bounds, { padding: [20, 20], maxZoom: 10 });
      }
    }
  }, [ubicaciones, map, skip]);

  return null;
}

// Componente para rastrear zoom/center del mapa
function MapStateTracker({
  stateRef,
}: {
  stateRef: React.MutableRefObject<{ center: [number, number]; zoom: number }>;
}) {
  const map = useMap();

  useEffect(() => {
    const update = () => {
      const c = map.getCenter();
      stateRef.current = {
        center: [c.lat, c.lng],
        zoom: map.getZoom(),
      };
    };
    map.on("moveend", update);
    map.on("zoomend", update);
    return () => {
      map.off("moveend", update);
      map.off("zoomend", update);
    };
  }, [map, stateRef]);

  return null;
}

// Componente para restaurar el estado del mapa (zoom, center, popup)
function MapStateRestorer({
  center,
  zoom,
  popupKey,
  markerRefs,
}: {
  center: [number, number];
  zoom: number;
  popupKey: string | null;
  markerRefs: React.MutableRefObject<Map<string, L.CircleMarker>>;
}) {
  const map = useMap();
  const restored = useRef(false);

  useEffect(() => {
    if (restored.current) return;
    restored.current = true;

    map.setView(center, zoom, { animate: false });

    if (popupKey) {
      // Small delay to ensure markers are rendered
      setTimeout(() => {
        const marker = markerRefs.current.get(popupKey);
        if (marker) {
          marker.openPopup();
        }
      }, 300);
    }
  }, [map, center, zoom, popupKey, markerRefs]);

  return null;
}

// Link a la ocurrencia en GBIF para colecciones externas
function GbifLink({
  catalogoMuseo,
  numeroMuseo,
}: {
  catalogoMuseo: string;
  numeroMuseo: string;
}) {
  const [gbifUrl, setGbifUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGbif = async () => {
      try {
        // Mapeo de códigos de institución y catálogo para GBIF
        let institutionCode = catalogoMuseo;
        let catNumber = numeroMuseo;
        let collectionCode: string | null = null;
        switch (catalogoMuseo) {
          case "KU":
            collectionCode = "KUH";
            break;
          case "QCAZA":
            institutionCode = "QCAZ";
            catNumber = `QCAZA${numeroMuseo}`;
            break;
          case "QCAZ":
            catNumber = `QCAZA${numeroMuseo}`;
            break;
          case "AMNH":
            catNumber = `A-${numeroMuseo}`;
            break;
          case "USNM":
            catNumber = `USNM ${numeroMuseo}`;
            break;
          case "DHMECN":
            catNumber = `DHMECN ${numeroMuseo}`;
            break;
        }
        const params = new URLSearchParams({
          institutionCode,
          catalogNumber: catNumber,
          classKey: "131",
          limit: "1",
        });
        if (collectionCode) {
          params.set("collectionCode", collectionCode);
        }
        const res = await fetch(
          `https://api.gbif.org/v1/occurrence/search?${params.toString()}`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          setGbifUrl(
            `https://www.gbif.org/occurrence/${data.results[0].key}`
          );
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchGbif();
  }, [catalogoMuseo, numeroMuseo]);

  if (loading) {
    return (
      <span className="text-[10px] text-gray-400">
        Buscando en GBIF...
      </span>
    );
  }

  if (!gbifUrl) return null;

  return (
    <a
      href={gbifUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[10px] font-semibold text-[#4ba24b] underline hover:text-[#397a39]"
      onClick={(e) => e.stopPropagation()}
    >
      GBIF ↗
    </a>
  );
}

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function formatFecha(fecha: string): string {
  // fecha puede ser "YYYY-MM-DD" o "YYYY-MM" o "YYYY"
  const partes = fecha.split("-");
  const anio = partes[0];
  const mes = partes[1] ? parseInt(partes[1], 10) : null;
  const dia = partes[2] ? parseInt(partes[2], 10) : null;

  if (dia && mes) {
    return `${String(dia).padStart(2, "0")} ${MESES[mes - 1]} ${anio}`;
  }
  if (mes) {
    return `${MESES[mes - 1]} ${anio}`;
  }
  return anio;
}

// Contenido compacto de un registro
function RegistroInfo({
  u,
  onSpeciesClick,
  onColeccionClick,
}: {
  u: UbicacionEspecie;
  onSpeciesClick?: (u: UbicacionEspecie) => void;
  onColeccionClick?: (u: UbicacionEspecie) => void;
}) {
  const isExterna = u.origen === "coleccion_externa";
  const isCJ = u.origen === "coleccion";
  const isSpeciesLevel = u.rank_id === 7;
  // Navegable si tiene rank_id conocido (4=orden, 5=familia, 6=género, 7=especie)
  const canNavigate = onSpeciesClick && u.rank_id != null && u.rank_id >= 4;

  // Etiqueta y nombre según el nivel taxonómico
  const rankLabel = u.rank_id === 4 ? "Orden" : u.rank_id === 5 ? "Familia" : u.rank_id === 6 ? "Género" : "Especie";
  // Para especie: "Género especie"; para otros niveles: solo el nombre del taxón (segunda palabra)
  const displayName = isSpeciesLevel
    ? u.nombre_cientifico
    : u.nombre_cientifico.split(" ").pop() || u.nombre_cientifico;

  return (
    <div className="text-[11px]" style={{ lineHeight: "1.2" }}>
      {(u.catalogo_museo || u.numero_museo) && (
        <span className="font-bold text-[#2a6496]">
          {[u.catalogo_museo, u.numero_museo].filter(Boolean).join(" ").replace(/Fundación/g, "Centro")}
        </span>
      )}
      {(u.catalogo_museo || u.numero_museo) && <br />}
      {canNavigate ? (
        <i
          className="cursor-pointer text-[#4ba24b] hover:text-[#397a39]"
          onClick={(e) => {
            e.stopPropagation();
            onSpeciesClick(u);
          }}
        >
          {displayName}
        </i>
      ) : (
        <i>{displayName}</i>
      )}
      <br />
      {[u.localidad, u.provincia].filter(Boolean).join(", ")}
      <br />
      {u.latitud}, {u.longitud}
      {u.elevacion != null && <>{" "}<span className="text-[#f97315] font-bold">|</span> {u.elevacion} msnm</>}
      <br />
      {u.fecha_coleccion
        ? formatFecha(u.fecha_coleccion)
        : <span className="text-gray-400 italic">Sin fecha</span>
      }
      {u.colectores && (
        <>
          <br />
          <span className="text-gray-500">{u.colectores}</span>
        </>
      )}
      {isCJ && u.id_coleccion && onColeccionClick && (
        <>
          <br />
          <span
            className="cursor-pointer text-[10px] font-semibold text-[#4ba24b] hover:text-[#397a39]"
            onClick={(e) => {
              e.stopPropagation();
              onColeccionClick(u);
            }}
          >
            Ver más →
          </span>
        </>
      )}
      {isExterna && u.catalogo_museo && u.numero_museo && (
        <>
          <br />
          <GbifLink
            catalogoMuseo={u.catalogo_museo}
            numeroMuseo={u.numero_museo}
          />
        </>
      )}
    </div>
  );
}

// Tipos de mapas base disponibles
const MAP_TILES = {
  relief: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Source: Esri",
    name: "Relieve",
  },
  terrain: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    name: "Topográfico",
  },
  provinces: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    name: "Provincias",
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    name: "Satélite",
  },
  streets: {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    name: "Calles",
  },
};

type MapTileType = keyof typeof MAP_TILES;

interface MapotecaMapProps {
  provinciaFilter?: string[];
  pisoFilter?: string[];
  snapFilter?: string[];
  especieFilter?: string[];
  catalogoFilter?: string[];
  localidadesFilter?: string[];
  elevacionMin?: number;
  elevacionMax?: number;
  mapType?: MapTileType;
  onNavigateToSpecies?: () => void;
}

export default function MapotecaMap({
  provinciaFilter,
  pisoFilter,
  snapFilter,
  especieFilter,
  catalogoFilter,
  localidadesFilter,
  elevacionMin,
  elevacionMax,
  mapType = "provinces",
  onNavigateToSpecies,
}: MapotecaMapProps) {
  const [ubicaciones, setUbicaciones] = useState<UbicacionEspecie[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false);
  // ID incremental: cada fetch guarda su ID; si al completar no coincide con el actual, descarta el resultado
  const fetchIdRef = useRef(0);
  const router = useRouter();
  // Track current filters to know when to reset
  const filtersRef = useRef({ provinciaFilter, pisoFilter, snapFilter, especieFilter, catalogoFilter, localidadesFilter, elevacionMin, elevacionMax });

  // Build query params from all filters
  const buildFilterParams = useCallback((limit: number, cjOffset = 0, extOffset = 0) => {
    const params = new URLSearchParams();
    if (provinciaFilter && provinciaFilter.length > 0) params.set("provincias", provinciaFilter.join(","));
    if (pisoFilter && pisoFilter.length > 0) params.set("pisos", pisoFilter.join(","));
    if (snapFilter && snapFilter.length > 0) params.set("snaps", snapFilter.join(","));
    if (especieFilter && especieFilter.length > 0) params.set("especies", especieFilter.join("||"));
    if (catalogoFilter && catalogoFilter.length > 0) params.set("catalogos", catalogoFilter.join("||"));
    if (localidadesFilter && localidadesFilter.length > 0) params.set("localidades", localidadesFilter.join(","));
    if (elevacionMin != null) params.set("elevacion_min", String(elevacionMin));
    if (elevacionMax != null) params.set("elevacion_max", String(elevacionMax));
    params.set("limit", String(limit));
    params.set("cj_offset", String(cjOffset));
    params.set("ext_offset", String(extOffset));
    return params;
  }, [provinciaFilter, pisoFilter, snapFilter, especieFilter, catalogoFilter, localidadesFilter, elevacionMin, elevacionMax]);

  // Map state tracking
  const mapStateRef = useRef<{ center: [number, number]; zoom: number }>({
    center: [-1.8312, -78.1834],
    zoom: 7,
  });
  const markerRefs = useRef<Map<string, L.CircleMarker>>(new Map());

  // Restore saved map state from sessionStorage
  const [savedMapState] = useState<{
    center: [number, number];
    zoom: number;
    popupKey: string | null;
  } | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = sessionStorage.getItem("mapotecaMapState");
    if (stored) {
      sessionStorage.removeItem("mapotecaMapState");
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Reset y carga cuando cambian los filtros
  useEffect(() => {
    const prev = filtersRef.current;
    const filtersChanged =
      prev.provinciaFilter !== provinciaFilter ||
      prev.pisoFilter !== pisoFilter ||
      prev.snapFilter !== snapFilter ||
      prev.especieFilter !== especieFilter ||
      prev.catalogoFilter !== catalogoFilter ||
      prev.elevacionMin !== elevacionMin ||
      prev.elevacionMax !== elevacionMax ||
      JSON.stringify(prev.localidadesFilter) !== JSON.stringify(localidadesFilter);

    filtersRef.current = { provinciaFilter, pisoFilter, snapFilter, especieFilter, catalogoFilter, localidadesFilter, elevacionMin, elevacionMax };

    const fetchInitial = async () => {
      const myFetchId = ++fetchIdRef.current;

      const cacheKey = buildCacheKey({ provinciaFilter, pisoFilter, snapFilter, especieFilter, catalogoFilter, localidadesFilter, elevacionMin, elevacionMax });
      const cached = getCached(cacheKey);
      if (cached) {
        if (myFetchId !== fetchIdRef.current) return;
        setUbicaciones(cached.data);
        setTotal(cached.total);
        setLoading(false);
        return;
      }

      fetchingRef.current = true;
      setLoading(true);
      setError(null);
      setUbicaciones([]);

      try {
        const params = buildFilterParams(5000, 0, 0);
        const response = await fetch(`/api/mapoteca?${params.toString()}`);
        if (!response.ok) throw new Error("Error al cargar datos");

        const result: MapotecaResponse = await response.json();
        if (myFetchId !== fetchIdRef.current) return;
        setUbicaciones(result.data);
        setTotal(result.total);
      } catch (err) {
        if (myFetchId !== fetchIdRef.current) return;
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        if (myFetchId === fetchIdRef.current) {
          fetchingRef.current = false;
          setLoading(false);
        }
      }
    };

    if (filtersChanged) {
      fetchInitial();
    }
  }, [provinciaFilter, pisoFilter, snapFilter, especieFilter, catalogoFilter, localidadesFilter, elevacionMin, elevacionMax, buildFilterParams]);

  // Carga inicial al montar
  useEffect(() => {
    const fetchInitial = async () => {
      const myFetchId = ++fetchIdRef.current;

      const cacheKey = buildCacheKey({ provinciaFilter, pisoFilter, snapFilter, especieFilter, catalogoFilter, localidadesFilter, elevacionMin, elevacionMax });
      const cached = getCached(cacheKey);
      if (cached) {
        if (myFetchId !== fetchIdRef.current) return;
        setUbicaciones(cached.data);
        setTotal(cached.total);
        setLoading(false);
        return;
      }

      fetchingRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const params = buildFilterParams(5000, 0, 0);
        const response = await fetch(`/api/mapoteca?${params.toString()}`);
        if (!response.ok) throw new Error("Error al cargar datos");

        const result: MapotecaResponse = await response.json();
        if (myFetchId !== fetchIdRef.current) return;
        setUbicaciones(result.data);
        setTotal(result.total);
      } catch (err) {
        if (myFetchId !== fetchIdRef.current) return;
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        if (myFetchId === fetchIdRef.current) {
          fetchingRef.current = false;
          setLoading(false);
        }
      }
    };

    fetchInitial();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cargar más datos en batches hasta completar los 60,000
  useEffect(() => {
    if (loading || fetchingRef.current) return;
    if (ubicaciones.length >= total) return;
    if (total === 0) return;

    let cancelled = false;

    const fetchMore = async () => {
      fetchingRef.current = true;
      setLoadingMore(true);
      try {
        const cjLoaded = ubicaciones.filter((u) => u.origen === "coleccion").length;
        const extLoaded = ubicaciones.filter((u) => u.origen === "coleccion_externa").length;
        const params = buildFilterParams(5000, cjLoaded, extLoaded);
        const response = await fetch(`/api/mapoteca?${params.toString()}`);
        if (!response.ok) throw new Error("Error al cargar más datos");

        const result: MapotecaResponse = await response.json();
        if (!cancelled) {
          setUbicaciones((prev) => {
            const updated = [...prev, ...result.data];
            if (updated.length >= result.total && result.total > 0) {
              const cacheKey = buildCacheKey({ provinciaFilter, pisoFilter, snapFilter, especieFilter, catalogoFilter, localidadesFilter, elevacionMin, elevacionMax });
              setCache(cacheKey, updated, result.total);
            }
            return updated;
          });
          setTotal(result.total);
        }
      } catch (err) {
        console.error("Error cargando más puntos:", err);
      } finally {
        fetchingRef.current = false;
        if (!cancelled) setLoadingMore(false);
      }
    };

    fetchMore();

    return () => { cancelled = true; fetchingRef.current = false; };
  }, [loading, ubicaciones.length, total, buildFilterParams]);

  const ubicacionesVisibles = useMemo(() => ubicaciones, [ubicaciones]);

  // Rango de fechas para el gradiente
  const { minDate, maxDate } = useMemo(() => {
    const timestamps = ubicaciones
      .map((u) => u.fecha_coleccion)
      .filter(Boolean)
      .map((d) => new Date(d!).getTime())
      .filter((t) => !isNaN(t));
    if (timestamps.length === 0) return { minDate: null, maxDate: null };
    return { minDate: Math.min(...timestamps), maxDate: Math.max(...timestamps) };
  }, [ubicaciones]);

  // Púrpura oscuro (antiguo) → Naranja (reciente); gris claro si no hay fecha
  const getColorForDate = useCallback(
    (fecha: string | null): string => {
      if (!fecha || minDate === null || maxDate === null) return "#d4d4d4";
      const t = new Date(fecha).getTime();
      if (isNaN(t)) return "#d4d4d4";
      const ratio = maxDate === minDate ? 1 : (t - minDate) / (maxDate - minDate);
      // Interpolación RGB: #4c1d95 → #fb923c
      const r = Math.round(0x4c + ratio * (0xfb - 0x4c));
      const g = Math.round(0x1d + ratio * (0x92 - 0x1d));
      const b = Math.round(0x95 + ratio * (0x3c - 0x95));
      return `rgb(${r}, ${g}, ${b})`;
    },
    [minDate, maxDate]
  );

  // Agrupar por ubicación para evitar sobreposición
  const groupedUbicaciones = useMemo(() => {
    const groups = new Map<string, UbicacionEspecie[]>();

    ubicacionesVisibles.forEach((u) => {
      const key = `${u.latitud?.toFixed(4)}_${u.longitud?.toFixed(4)}`;
      const existing = groups.get(key) || [];
      groups.set(key, [...existing, u]);
    });

    return groups;
  }, [ubicacionesVisibles]);

  // Guardar estado del mapa antes de navegar
  const saveMapState = useCallback(
    (ubicacion: UbicacionEspecie) => {
      const popupKey = ubicacion.latitud && ubicacion.longitud
        ? `${ubicacion.latitud.toFixed(4)}_${ubicacion.longitud.toFixed(4)}`
        : null;
      sessionStorage.setItem(
        "mapotecaMapState",
        JSON.stringify({
          center: mapStateRef.current.center,
          zoom: mapStateRef.current.zoom,
          popupKey,
        })
      );
      if (onNavigateToSpecies) {
        onNavigateToSpecies();
      }
    },
    [onNavigateToSpecies]
  );

  // Obtener la ruta de la ficha según el rank_id
  // rank_id: 4=Orden, 5=Familia, 6=Género, 7=especie
  const getTaxonRoute = useCallback((ubicacion: UbicacionEspecie): string | null => {
    const parts = ubicacion.nombre_cientifico.split(" ");
    // Para especie: slug es "Género-especie"
    // Para otros: el nombre del taxon es la segunda palabra (el taxon directo)
    switch (ubicacion.rank_id) {
      case 7: // especie
        return `/sapopedia/species/${ubicacion.nombre_cientifico.replaceAll(" ", "-")}`;
      case 6: // género - segunda palabra es el género
        return parts[1] ? `/sapopedia/genus/${parts[1]}` : null;
      case 5: // familia - segunda palabra es la familia
        return parts[1] ? `/sapopedia/family/${parts[1]}` : null;
      case 4: // orden - segunda palabra es el orden
        return parts[1] ? `/sapopedia/order/${parts[1]}` : null;
      default:
        return null;
    }
  }, []);

  // Navegar a la ficha del taxón (especie, género, familia u orden)
  const handleTaxonClick = useCallback(
    (ubicacion: UbicacionEspecie) => {
      const route = getTaxonRoute(ubicacion);
      if (!route) return;
      saveMapState(ubicacion);
      router.push(route);
    },
    [router, saveMapState, getTaxonRoute]
  );

  // Navegar a la vista de colección CJ
  const handleColeccionClick = useCallback(
    (ubicacion: UbicacionEspecie) => {
      if (!ubicacion.id_coleccion) return;
      saveMapState(ubicacion);
      const slug = ubicacion.nombre_cientifico.replaceAll(" ", "-");
      router.push(`/sapopedia/species/${slug}/colecciones/${ubicacion.id_coleccion}`);
    },
    [router, saveMapState]
  );

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-220px)] items-center justify-center rounded-lg bg-gray-100">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
          <p className="text-muted-foreground">
            Cargando ubicaciones de especies...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-220px)] items-center justify-center rounded-lg bg-red-50">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  // Centro de Ecuador (o restaurado)
  const ecuadorCenter: [number, number] = savedMapState?.center ?? [-1.8312, -78.1834];
  const initialZoom = savedMapState?.zoom ?? 7;

  return (
    <div className="relative h-[calc(100vh-220px)] w-full overflow-hidden rounded-lg border shadow-lg">
      {loadingMore && (
        <div className="absolute bottom-14 left-1/2 z-[1000] -translate-x-1/2 flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-gray-700 shadow-lg">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
          Añadiendo puntos...
        </div>
      )}
      <MapContainer
        center={ecuadorCenter}
        zoom={initialZoom}
        className="h-full w-full"
        scrollWheelZoom={true}
        renderer={canvasRenderer}
        preferCanvas={true}
      >
        <TileLayer
          attribution={MAP_TILES[mapType].attribution}
          url={MAP_TILES[mapType].url}
        />

        <MapStateTracker stateRef={mapStateRef} />

        {savedMapState && (
          <MapStateRestorer
            center={savedMapState.center}
            zoom={savedMapState.zoom}
            popupKey={savedMapState.popupKey}
            markerRefs={markerRefs}
          />
        )}

        {ubicacionesVisibles.length > 0 && (
          <MapBoundsAdjuster ubicaciones={ubicacionesVisibles} skip={!!savedMapState} />
        )}

        {Array.from(groupedUbicaciones.entries()).map(([key, group]) => {
          const first = group[0];
          if (!first.latitud || !first.longitud) return null;

          const isMultiple = group.length > 1;
          const groupDates = group.map((u) => u.fecha_coleccion).filter(Boolean).sort();
          const representativeDate = groupDates[groupDates.length - 1] ?? null;
          const color = getColorForDate(representativeDate);
          const radius = isMultiple ? 7 : 5;

          const popupContent = (
            <div className="max-w-[280px] text-gray-800">
              {isMultiple && (
                <p className="mb-1 pb-1 border-b text-[10px] font-semibold text-gray-400">
                  {group.length} registros
                </p>
              )}
              <div
                style={{
                  maxHeight: isMultiple ? "220px" : "none",
                  overflowY: isMultiple ? "auto" : "visible",
                }}
              >
                {group.map((u, i) => (
                  <div
                    key={i}
                    className={`py-1 ${
                      i > 0 ? "border-t border-gray-100 mt-1 pt-1" : ""
                    }`}
                  >
                    <RegistroInfo
                      u={u}
                      onSpeciesClick={handleTaxonClick}
                      onColeccionClick={u.origen === "coleccion" ? handleColeccionClick : undefined}
                    />
                  </div>
                ))}
              </div>
            </div>
          );

          return (
            <CircleMarker
              key={key}
              ref={(ref) => {
                if (ref) {
                  markerRefs.current.set(key, ref as unknown as L.CircleMarker);
                } else {
                  markerRefs.current.delete(key);
                }
              }}
              center={[first.latitud, first.longitud]}
              radius={radius}
              pathOptions={{
                fillColor: color,
                fillOpacity: representativeDate ? 0.9 : 0.8,
                color: representativeDate ? "#fff" : "#666",
                weight: 1,
              }}
            >
              <Popup
                offset={[0, -5]}
                className="mapoteca-popup"
                maxWidth={300}
                minWidth={200}
                autoPan={true}
              >
                {popupContent}
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>


      {/* Leyenda de gradiente por fecha */}
      {minDate !== null && maxDate !== null && (
        <div className="absolute bottom-14 right-3 z-[1000] rounded-lg bg-white/95 px-3 py-2 shadow-lg">
          <p className="mb-1 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Fecha colección</p>
          <div
            className="h-2 w-32 rounded-full"
            style={{ background: "linear-gradient(to right, #4c1d95, #fb923c)", border: "1px solid #e5e7eb" }}
          />
          <div className="mt-0.5 flex justify-between text-[9px] text-gray-400">
            <span>{new Date(minDate).getFullYear()}</span>
            <span>{new Date(maxDate).getFullYear()}</span>
          </div>
          <div className="mt-0.5 flex items-center gap-1 text-[9px] text-gray-400">
            <div className="h-2 w-2 rounded-full" style={{ background: "#d4d4d4", border: "1px solid #bbb" }} />
            <span>Sin fecha</span>
          </div>
        </div>
      )}

      {/* Contador de registros */}
      <div className="absolute bottom-3 left-3 z-[1000] rounded-lg bg-white/95 px-3 py-2 text-sm shadow-lg">
        <span className="font-semibold text-green-700">
          {ubicacionesVisibles.length.toLocaleString()}
        </span>
        <span className="text-gray-600">
          {total > ubicacionesVisibles.length
            ? ` / ${total.toLocaleString()} registros`
            : " registros"}
        </span>
        {loadingMore && (
          <span className="ml-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
        )}
      </div>
    </div>
  );
}
