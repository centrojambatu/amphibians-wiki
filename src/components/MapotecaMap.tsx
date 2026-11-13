"use client";

import { useEffect, useState, useMemo, useCallback, useRef, memo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

import type { UbicacionEspecie } from "@/app/api/mapoteca/route";
import type { MapotecaFilters } from "@/hooks/use-mapoteca-data";
import { useGbifOccurrence } from "@/lib/gbif";

// Componente para ajustar la vista del mapa (evita fitBounds con miles de puntos)
// Rastrea zoom/center para persistirlos al navegar
function MapStateTracker({
  stateRef,
}: {
  stateRef: React.MutableRefObject<{ center: [number, number]; zoom: number }>;
}) {
  const map = useMap();

  useEffect(() => {
    const update = () => {
      const c = map.getCenter();
      stateRef.current = { center: [c.lat, c.lng], zoom: map.getZoom() };
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

interface MapViewport {
  south: number;
  north: number;
  west: number;
  east: number;
  zoom: number;
}

function MapViewportTracker({ onChange }: { onChange: (viewport: MapViewport) => void }) {
  const map = useMap();

  useEffect(() => {
    const update = () => {
      const bounds = map.getBounds();
      const lower = (value: number) => Math.floor(value * 1000) / 1000;
      const upper = (value: number) => Math.ceil(value * 1000) / 1000;
      onChange({
        south: lower(bounds.getSouth()),
        north: upper(bounds.getNorth()),
        west: lower(bounds.getWest()),
        east: upper(bounds.getEast()),
        zoom: map.getZoom(),
      });
    };
    update();
    map.on("moveend", update);
    map.on("zoomend", update);
    return () => {
      map.off("moveend", update);
      map.off("zoomend", update);
    };
  }, [map, onChange]);

  return null;
}

// Restaura zoom/center; abre popup del marker si es visible (o zoomToShowLayer si está clusterizado)
function MapStateRestorer({
  center,
  zoom,
  popupKey,
  loading,
  markerRefs,
  clusterRef,
}: {
  center: [number, number];
  zoom: number;
  popupKey: string | null;
  loading: boolean;
  markerRefs: React.MutableRefObject<Map<string, L.Marker>>;
  clusterRef: React.MutableRefObject<any>;
}) {
  const map = useMap();
  const restored = useRef(false);

  useEffect(() => {
    if (restored.current) return;
    restored.current = true;

    map.setView(center, zoom, { animate: false });
  }, [map, center, zoom]);

  useEffect(() => {
    if (loading || !popupKey) return;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;
    const openPopup = () => {
      const marker = markerRefs.current.get(popupKey);
      if (!marker && attempts++ < 20) {
        timer = setTimeout(openPopup, 150);
        return;
      }
      if (!marker) return;
      const cluster = clusterRef.current;
      if (cluster && typeof cluster.zoomToShowLayer === "function") {
        cluster.zoomToShowLayer(marker, () => marker.openPopup());
      } else {
        marker.openPopup();
      }
    };
    timer = setTimeout(openPopup, 0);
    return () => clearTimeout(timer);
  }, [loading, popupKey, markerRefs, clusterRef]);

  return null;
}

function GbifLink({
  catalogoMuseo,
  numeroMuseo,
}: {
  catalogoMuseo: string;
  numeroMuseo: string;
}) {
  const { data: gbifUrl, isLoading } = useGbifOccurrence(catalogoMuseo, numeroMuseo);

  if (isLoading) {
    return (
      <span className="text-[10px] text-gray-400">Buscando en GBIF...</span>
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
  const partes = fecha.split("-");
  const anio = partes[0];
  const mes = partes[1] ? parseInt(partes[1], 10) : null;
  const dia = partes[2] ? parseInt(partes[2], 10) : null;

  if (dia && mes) return `${String(dia).padStart(2, "0")} ${MESES[mes - 1]} ${anio}`;
  if (mes) return `${MESES[mes - 1]} ${anio}`;
  return anio;
}

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
  const canNavigate = onSpeciesClick && u.rank_id != null && u.rank_id >= 4;
  const displayName = isSpeciesLevel
    ? u.nombre_cientifico
    : u.nombre_cientifico.split(" ").pop() || u.nombre_cientifico;

  return (
    <div className="text-[11px]" style={{ lineHeight: "1.2" }}>
      {(u.catalogo_museo || u.numero_museo) && (
        <span className="font-bold text-[#2a6496]">
          {[u.catalogo_museo?.includes(" - ") ? u.catalogo_museo.split(" - ").pop() : u.catalogo_museo, u.numero_museo].filter(Boolean).join(" ")}
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
      {u.fecha_coleccion && (
        <>
          <br />
          {formatFecha(u.fecha_coleccion)}
        </>
      )}
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

// Contenido del popup — se monta solo cuando el popup se abre por primera vez
function PopupBody({
  group,
  onSpeciesClick,
  onColeccionClick,
}: {
  group: UbicacionEspecie[];
  onSpeciesClick: (u: UbicacionEspecie) => void;
  onColeccionClick: (u: UbicacionEspecie) => void;
}) {
  const isMultiple = group.length > 1;
  return (
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
            className={`py-1 ${i > 0 ? "border-t border-gray-100 mt-1 pt-1" : ""}`}
          >
            <RegistroInfo
              u={u}
              onSpeciesClick={onSpeciesClick}
              onColeccionClick={u.origen === "coleccion" ? onColeccionClick : undefined}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Marker + Popup con render diferido y memoización
const ClusteredMarker = memo(function ClusteredMarker({
  markerKey,
  group,
  icon,
  markerRefs,
  onSpeciesClick,
  onColeccionClick,
}: {
  markerKey: string;
  group: UbicacionEspecie[];
  icon: L.DivIcon;
  markerRefs: React.MutableRefObject<Map<string, L.Marker>>;
  onSpeciesClick: (u: UbicacionEspecie) => void;
  onColeccionClick: (u: UbicacionEspecie) => void;
}) {
  const [opened, setOpened] = useState(false);
  const first = group[0];
  const groupSize = group.length;

  const setRef = useCallback(
    (ref: L.Marker | null) => {
      if (ref) {
        markerRefs.current.set(markerKey, ref);
        // Attach group size to marker options so iconCreateFunction can sum registros (not markers)
        (ref.options as L.MarkerOptions & { groupSize?: number }).groupSize = groupSize;
      } else {
        markerRefs.current.delete(markerKey);
      }
    },
    [markerKey, markerRefs, groupSize],
  );

  const eventHandlers = useMemo(
    () => ({
      popupopen: () => setOpened(true),
    }),
    [],
  );

  return (
    <Marker
      ref={setRef}
      position={[first.latitud!, first.longitud!]}
      icon={icon}
      eventHandlers={eventHandlers}
    >
      <Popup
        offset={[0, -5]}
        className="mapoteca-popup"
        maxWidth={300}
        minWidth={200}
        autoPan={true}
      >
        {opened ? (
          <PopupBody
            group={group}
            onSpeciesClick={onSpeciesClick}
            onColeccionClick={onColeccionClick}
          />
        ) : null}
      </Popup>
    </Marker>
  );
});

interface MapotecaCluster {
  latitud: number;
  longitud: number;
  registros: number;
}

const AggregateMarker = memo(function AggregateMarker({
  cell,
}: {
  cell: MapotecaCluster;
}) {
  const map = useMap();
  const setRef = useCallback((marker: L.Marker | null) => {
    if (marker) {
      (marker.options as L.MarkerOptions & { groupSize?: number }).groupSize = cell.registros;
    }
  }, [cell.registros]);
  const icon = useMemo(() => {
    const label = cell.registros >= 1000 ? `${(cell.registros / 1000).toFixed(1)}k` : String(cell.registros);
    const size = cell.registros >= 100 ? 38 : 32;
    return L.divIcon({
      html: `<div class="mapoteca-cell-marker"><span>${label}</span></div>`,
      className: "mapoteca-cell-icon",
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  }, [cell.registros]);

  return (
    <Marker
      ref={setRef}
      position={[cell.latitud, cell.longitud]}
      icon={icon}
      eventHandlers={{
        click: () => map.flyTo([cell.latitud, cell.longitud], Math.max(10, map.getZoom() + 2)),
      }}
    />
  );
});

// Icon del cluster que suma los registros (no los markers). Los markers marcan
// `options.groupSize` con la cantidad de registros que representan.
function createClusterIcon(cluster: L.MarkerCluster): L.DivIcon {
  const markers = cluster.getAllChildMarkers() as (L.Marker & {
    options: L.MarkerOptions & { groupSize?: number };
  })[];
  let total = 0;
  for (const m of markers) total += m.options.groupSize ?? 1;

  let size: number;
  let cls: string;
  if (total < 100) {
    size = 40;
    cls = "marker-cluster-small";
  } else if (total < 1000) {
    size = 44;
    cls = "marker-cluster-medium";
  } else {
    size = 48;
    cls = "marker-cluster-large";
  }

  return L.divIcon({
    html: `<div><span>${total.toLocaleString()}</span></div>`,
    className: `marker-cluster ${cls}`,
    iconSize: L.point(size, size),
  });
}

// Cache de iconos por color+radio para no crear un divIcon por marker
const iconCache = new Map<string, L.DivIcon>();
function getDotIcon(color: string, radius: number, hasDate: boolean): L.DivIcon {
  const key = `${color}-${radius}-${String(hasDate)}`;
  const cached = iconCache.get(key);
  if (cached) return cached;
  const size = radius * 2;
  const border = hasDate ? "#fff" : "#666";
  const opacity = hasDate ? 0.9 : 0.8;
  const icon = L.divIcon({
    className: "mapoteca-dot",
    html: `<div style="width:${String(size)}px;height:${String(size)}px;border-radius:50%;background:${color};opacity:${String(opacity)};border:1px solid ${border};box-sizing:border-box;"></div>`,
    iconSize: [size, size],
    iconAnchor: [radius, radius],
  });
  iconCache.set(key, icon);
  return icon;
}

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
  fechaDesde?: string;
  fechaHasta?: string;
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
  fechaDesde,
  fechaHasta,
  mapType = "provinces",
  onNavigateToSpecies,
}: MapotecaMapProps) {
  const filters: MapotecaFilters = {
    provinciaFilter, pisoFilter, snapFilter, especieFilter,
    catalogoFilter, localidadesFilter, elevacionMin, elevacionMax,
    fechaDesde, fechaHasta,
  };
  const [viewport, setViewport] = useState<MapViewport | null>(null);
  const onViewportChange = useCallback((next: MapViewport) => setViewport(next), []);
  const viewMode = viewport && viewport.zoom >= 10 ? "points" : "clusters";
  const viewQuery = useQuery<{
    mode: "clusters" | "points";
    data: MapotecaCluster[] | UbicacionEspecie[];
    total: number;
    truncated?: boolean;
  }>({
    queryKey: ["mapoteca", "vista", viewMode, filters, viewport],
    enabled: viewport !== null,
    queryFn: async ({ signal }) => {
      const response = await fetch("/api/mapoteca/vista", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: viewMode, filters, viewport, zoom: viewport?.zoom ?? 7 }),
        signal,
      });
      if (!response.ok) throw new Error("Error al cargar datos del mapa");
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: (previous) => previous,
  });

  const queryData = viewQuery.data;
  const puntos = queryData?.mode === "points" ? queryData.data as UbicacionEspecie[] : [];
  const clusters = queryData?.mode === "clusters" ? queryData.data as MapotecaCluster[] : [];
  const ubicaciones = puntos;
  const loading = viewQuery.isFetching;
  const error = viewQuery.error instanceof Error ? viewQuery.error.message : null;

  const router = useRouter();

  const mapStateRef = useRef<{ center: [number, number]; zoom: number }>({
    center: [-1.8312, -78.1834],
    zoom: 7,
  });
  const markerRefs = useRef<Map<string, L.Marker>>(new Map());
  const clusterRef = useRef<any>(null);

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

  // Rango de fechas para el gradiente
  const { minDate, maxDate } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    for (const u of ubicaciones) {
      if (!u.fecha_coleccion) continue;
      const t = new Date(u.fecha_coleccion).getTime();
      if (isNaN(t)) continue;
      if (t < min) min = t;
      if (t > max) max = t;
    }
    if (min === Infinity) return { minDate: null, maxDate: null };
    return { minDate: min, maxDate: max };
  }, [ubicaciones]);

  const getColorForDate = useCallback(
    (fecha: string | null): string => {
      if (!fecha || minDate === null || maxDate === null) return "#d4d4d4";
      const t = new Date(fecha).getTime();
      if (isNaN(t)) return "#d4d4d4";
      const ratio = maxDate === minDate ? 1 : (t - minDate) / (maxDate - minDate);
      const r = Math.round(0x4c + ratio * (0xfb - 0x4c));
      const g = Math.round(0x1d + ratio * (0x92 - 0x1d));
      const b = Math.round(0x95 + ratio * (0x3c - 0x95));
      return `rgb(${r}, ${g}, ${b})`;
    },
    [minDate, maxDate],
  );

  // Agrupar los registros visibles por coordenada y preparar sus marcadores.
  const groups = useMemo(() => {
    const map = new Map<string, UbicacionEspecie[]>();

    for (const u of ubicaciones) {
      if (u.latitud == null || u.longitud == null) continue;
      const key = `${u.latitud.toFixed(4)}_${u.longitud.toFixed(4)}`;
      const existing = map.get(key);
      if (existing) existing.push(u);
      else map.set(key, [u]);
    }

    const groupsArr: {
      key: string;
      group: UbicacionEspecie[];
      icon: L.DivIcon;
    }[] = [];
    for (const [key, group] of map) {
      let latestDate: string | null = null;
      for (const u of group) {
        if (u.fecha_coleccion && (!latestDate || u.fecha_coleccion > latestDate)) {
          latestDate = u.fecha_coleccion;
        }
      }
      const color = getColorForDate(latestDate);
      const radius = group.length > 1 ? 7 : 5;
      groupsArr.push({ key, group, icon: getDotIcon(color, radius, !!latestDate) });
    }

    return groupsArr;
  }, [ubicaciones, getColorForDate]);

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
        }),
      );
      if (onNavigateToSpecies) onNavigateToSpecies();
    },
    [onNavigateToSpecies],
  );

  const getTaxonRoute = useCallback((ubicacion: UbicacionEspecie): string | null => {
    const parts = ubicacion.nombre_cientifico.split(" ");
    switch (ubicacion.rank_id) {
      case 7: return `/sapopedia/species/${ubicacion.nombre_cientifico.replaceAll(" ", "-")}`;
      case 6: return parts[1] ? `/sapopedia/genus/${parts[1]}` : null;
      case 5: return parts[1] ? `/sapopedia/family/${parts[1]}` : null;
      case 4: return parts[1] ? `/sapopedia/order/${parts[1]}` : null;
      default: return null;
    }
  }, []);

  const handleTaxonClick = useCallback(
    (ubicacion: UbicacionEspecie) => {
      const route = getTaxonRoute(ubicacion);
      if (!route) return;
      saveMapState(ubicacion);
      router.push(route);
    },
    [router, saveMapState, getTaxonRoute],
  );

  const handleColeccionClick = useCallback(
    (ubicacion: UbicacionEspecie) => {
      if (!ubicacion.id_coleccion) return;
      saveMapState(ubicacion);
      const slug = ubicacion.nombre_cientifico.replaceAll(" ", "-");
      const params = new URLSearchParams({ from: "mapoteca" });
      if (typeof window !== "undefined") {
        const currentEspecie = new URLSearchParams(window.location.search).get("especie");
        if (currentEspecie) params.set("mapotecaEspecie", currentEspecie);
      }
      router.push(
        `/sapopedia/species/${slug}/colecciones/${ubicacion.id_coleccion}?${params.toString()}`,
      );
    },
    [router, saveMapState],
  );

  if (error) {
    return (
      <div className="flex h-[calc(100vh-220px)] items-center justify-center rounded-lg bg-red-50">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  const ecuadorCenter: [number, number] = savedMapState?.center ?? [-1.8312, -78.1834];
  const initialZoom = savedMapState?.zoom ?? 7;

  return (
    <div className="relative h-[calc(100vh-220px)] w-full overflow-hidden rounded-lg border shadow-lg">
      {loading && (
        <div className="absolute top-0 right-0 left-0 z-[1000]">
          <div className="h-1.5 w-full overflow-hidden bg-gray-200">
            <div
              className="h-full w-full animate-pulse rounded-r-full"
              style={{ backgroundColor: "#f07304" }}
            />
          </div>
          <div className="absolute top-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/95 px-4 py-1.5 text-xs font-medium text-gray-600 shadow-md">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "#f07304", borderTopColor: "transparent" }} />
            Cargando puntos...
          </div>
        </div>
      )}
      <MapContainer
        center={ecuadorCenter}
        zoom={initialZoom}
        className="h-full w-full"
        scrollWheelZoom={true}
        preferCanvas={true}
      >
        <TileLayer
          key={mapType}
          attribution={MAP_TILES[mapType].attribution}
          className={mapType === "satellite" ? "" : "grayscale"}
          url={MAP_TILES[mapType].url}
        />

        <MapStateTracker stateRef={mapStateRef} />
        <MapViewportTracker onChange={onViewportChange} />

        {savedMapState && (
          <MapStateRestorer
            center={savedMapState.center}
            zoom={savedMapState.zoom}
            popupKey={savedMapState.popupKey}
            loading={loading}
            markerRefs={markerRefs}
            clusterRef={clusterRef}
          />
        )}

        <MarkerClusterGroup
          ref={clusterRef}
          chunkedLoading
          showCoverageOnHover={false}
          spiderfyOnMaxZoom={true}
          removeOutsideVisibleBounds={true}
          disableClusteringAtZoom={14}
          maxClusterRadius={50}
          iconCreateFunction={createClusterIcon}
        >
          {queryData?.mode === "clusters"
            ? clusters.map((cell) => (
                <AggregateMarker
                  key={`${cell.latitud.toFixed(4)}_${cell.longitud.toFixed(4)}`}
                  cell={cell}
                />
              ))
            : groups.map(({ key, group, icon }) => (
                <ClusteredMarker
                  key={key}
                  markerKey={key}
                  group={group}
                  icon={icon}
                  markerRefs={markerRefs}
                  onSpeciesClick={handleTaxonClick}
                  onColeccionClick={handleColeccionClick}
                />
              ))}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Leyenda de gradiente por fecha */}
      {queryData?.mode === "points" && minDate !== null && maxDate !== null && (
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
            {(queryData?.total ?? 0).toLocaleString()}
        </span>
        <span className="text-gray-600"> registros en esta vista</span>
      </div>
      {queryData?.truncated && (
        <div className="absolute right-3 bottom-3 z-[1000] rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 shadow-lg">
          Acerca más el mapa para ver todos los registros de esta zona.
        </div>
      )}
    </div>
  );
}
