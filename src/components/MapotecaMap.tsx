"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip,
  useMap,
} from "react-leaflet";
import { useRouter } from "next/navigation";
import "leaflet/dist/leaflet.css";

import type { UbicacionEspecie } from "@/app/api/mapoteca/route";

// Componente para ajustar la vista del mapa
function MapBoundsAdjuster({
  ubicaciones,
}: {
  ubicaciones: UbicacionEspecie[];
}) {
  const map = useMap();

  useEffect(() => {
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
  }, [ubicaciones, map]);

  return null;
}

// Colores por familia/género para diferenciar visualmente
function getColorByGenus(genero: string): string {
  const colors: Record<string, string> = {
    Pristimantis: "#e63946",
    Atelopus: "#f4a261",
    Hyloxalus: "#2a9d8f",
    Noblella: "#e9c46a",
    Epipedobates: "#264653",
    Gastrotheca: "#9b59b6",
    Osteocephalus: "#3498db",
    Rhinella: "#27ae60",
    Dendropsophus: "#e74c3c",
    Hyalinobatrachium: "#1abc9c",
    Centrolene: "#00bcd4",
    Nymphargus: "#8e44ad",
    Agalychnis: "#2ecc71",
    Boana: "#f39c12",
  };

  return colors[genero] || "#6c757d";
}

// Generar color basado en elevación
function getColorByElevation(elevacion: number | null): string {
  if (!elevacion) return "#6c757d";

  if (elevacion < 500) return "#1a9850"; // Verde - tierras bajas
  if (elevacion < 1000) return "#91cf60"; // Verde claro
  if (elevacion < 1500) return "#d9ef8b"; // Amarillo-verde
  if (elevacion < 2000) return "#fee08b"; // Amarillo
  if (elevacion < 2500) return "#fdae61"; // Naranja
  if (elevacion < 3000) return "#f46d43"; // Naranja-rojo
  if (elevacion < 3500) return "#d73027"; // Rojo
  return "#a50026"; // Rojo oscuro - páramo
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
  provinciaFilter?: string;
  especieFilter?: string;
  colorMode?: "genus" | "elevation";
  mapType?: MapTileType;
  maxPoints?: number;
}

export default function MapotecaMap({
  provinciaFilter,
  especieFilter,
  colorMode = "elevation",
  mapType = "provinces",
  maxPoints = 11000,
}: MapotecaMapProps) {
  const [ubicaciones, setUbicaciones] = useState<UbicacionEspecie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch datos
  useEffect(() => {
    const fetchUbicaciones = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (provinciaFilter) params.set("provincia", provinciaFilter);
        if (especieFilter) params.set("especie", especieFilter);
        params.set("limit", "15000"); // Asegurar que se envíe el límite

        const response = await fetch(`/api/mapoteca?${params.toString()}`);
        if (!response.ok) throw new Error("Error al cargar datos");

        const data = await response.json();
        setUbicaciones(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchUbicaciones();
  }, [provinciaFilter, especieFilter]);

  // Limitar ubicaciones según maxPoints
  const limitedUbicaciones = useMemo(() => {
    return ubicaciones.slice(0, maxPoints);
  }, [ubicaciones, maxPoints]);

  // Agrupar por ubicación para evitar sobreposición
  const groupedUbicaciones = useMemo(() => {
    const groups = new Map<string, UbicacionEspecie[]>();

    limitedUbicaciones.forEach((u) => {
      // Redondear coordenadas para agrupar puntos muy cercanos
      const key = `${u.latitud?.toFixed(4)}_${u.longitud?.toFixed(4)}`;
      const existing = groups.get(key) || [];
      groups.set(key, [...existing, u]);
    });

    return groups;
  }, [limitedUbicaciones]);

  // Navegar a la ficha de especie
  const handleSpeciesClick = useCallback(
    (ubicacion: UbicacionEspecie) => {
      const speciesSlug = ubicacion.nombre_cientifico.replaceAll(" ", "-");
      router.push(`/sapopedia/species/${speciesSlug}`);
    },
    [router]
  );

  if (loading) {
    return (
      <div className="flex h-[600px] items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
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
      <div className="flex h-[600px] items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Error: {error}</p>
        </div>
      </div>
    );
  }

  // Centro de Ecuador
  const ecuadorCenter: [number, number] = [-1.8312, -78.1834];

  return (
    <div className="relative h-[600px] w-full overflow-hidden rounded-lg border shadow-lg">
      <MapContainer
        center={ecuadorCenter}
        zoom={7}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution={MAP_TILES[mapType].attribution}
          url={MAP_TILES[mapType].url}
        />

        {limitedUbicaciones.length > 0 && (
          <MapBoundsAdjuster ubicaciones={limitedUbicaciones} />
        )}

        {Array.from(groupedUbicaciones.entries()).map(([key, group]) => {
          const firstUbicacion = group[0];
          if (!firstUbicacion.latitud || !firstUbicacion.longitud) return null;

          const color =
            colorMode === "elevation"
              ? getColorByElevation(firstUbicacion.elevacion)
              : getColorByGenus(firstUbicacion.genero);

          // Si hay múltiples especies en el mismo punto
          const isMultiple = group.length > 1;
          const radius = isMultiple ? 8 : 6;

          return (
            <CircleMarker
              key={key}
              center={[firstUbicacion.latitud, firstUbicacion.longitud]}
              radius={radius}
              pathOptions={{
                fillColor: color,
                fillOpacity: 0.8,
                color: "#fff",
                weight: 2,
              }}
              eventHandlers={{
                click: () => {
                  if (group.length === 1) {
                    handleSpeciesClick(firstUbicacion);
                  }
                },
              }}
            >
              <Tooltip
                direction="top"
                offset={[0, -10]}
                opacity={1}
                className="mapoteca-tooltip"
              >
                <div className="min-w-[200px] max-w-[280px]">
                  {group.length === 1 ? (
                    <>
                      <p className="font-semibold italic text-green-700">
                        {firstUbicacion.nombre_cientifico}
                      </p>
                      <div className="mt-1 space-y-0.5 text-xs text-gray-600">
                        {firstUbicacion.provincia && (
                          <p>
                            <span className="font-medium">Provincia:</span>{" "}
                            {firstUbicacion.provincia}
                          </p>
                        )}
                        {firstUbicacion.localidad && (
                          <p className="break-words">
                            <span className="font-medium">Localidad:</span>{" "}
                            <span className="break-words">{firstUbicacion.localidad}</span>
                          </p>
                        )}
                        {firstUbicacion.elevacion && (
                          <p>
                            <span className="font-medium">Elevación:</span>{" "}
                            {firstUbicacion.elevacion} m
                          </p>
                        )}
                        {firstUbicacion.voucher && (
                          <p className="break-words">
                            <span className="font-medium">Voucher:</span>{" "}
                            <span className="break-words">{firstUbicacion.voucher}</span>
                          </p>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-gray-500 italic">
                        Presiona el punto para ver la ficha
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="mb-1 font-semibold text-gray-800">
                        {group.length} registros en esta ubicación
                      </p>
                      <div className="max-h-[150px] space-y-1 overflow-y-auto">
                        {group.slice(0, 5).map((u, i) => (
                          <p
                            key={i}
                            className="cursor-pointer text-xs italic text-green-700 hover:underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSpeciesClick(u);
                            }}
                          >
                            • {u.nombre_cientifico}
                          </p>
                        ))}
                        {group.length > 5 && (
                          <p className="text-xs text-gray-500">
                            ... y {group.length - 5} más
                          </p>
                        )}
                      </div>
                      {firstUbicacion.elevacion && (
                        <p className="mt-1 text-xs text-gray-600">
                          <span className="font-medium">Elevación:</span>{" "}
                          {firstUbicacion.elevacion} m
                        </p>
                      )}
                    </>
                  )}
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Leyenda */}
      <div className="absolute right-3 top-3 z-[1000] rounded-lg bg-white/95 p-3 text-xs shadow-lg dark:bg-gray-800/95">
        <p className="mb-2 font-semibold text-gray-700 dark:text-gray-200">
          {colorMode === "elevation" ? "Elevación (m)" : "Por género"}
        </p>
        {colorMode === "elevation" ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: "#1a9850" }}
              ></span>
              <span>&lt; 500</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: "#91cf60" }}
              ></span>
              <span>500 - 1000</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: "#fee08b" }}
              ></span>
              <span>1500 - 2000</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: "#f46d43" }}
              ></span>
              <span>2500 - 3000</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: "#a50026" }}
              ></span>
              <span>&gt; 3500</span>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {[
              { name: "Pristimantis", color: "#e63946" },
              { name: "Atelopus", color: "#f4a261" },
              { name: "Hyloxalus", color: "#2a9d8f" },
              { name: "Centrolene", color: "#00bcd4" },
              { name: "Otros", color: "#6c757d" },
            ].map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></span>
                <span className="italic">{item.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contador de registros */}
      <div className="absolute bottom-3 left-3 z-[1000] rounded-lg bg-white/95 px-3 py-2 text-sm shadow-lg dark:bg-gray-800/95">
        <span className="font-semibold text-green-700 dark:text-green-400">
          {limitedUbicaciones.length.toLocaleString()}
        </span>
        {ubicaciones.length > limitedUbicaciones.length && (
          <span className="text-gray-500 dark:text-gray-400">
            {" / "}
            {ubicaciones.length.toLocaleString()}
          </span>
        )}
        <span className="text-gray-600 dark:text-gray-300">
          {" "}registros{ubicaciones.length > limitedUbicaciones.length ? "" : " mostrados"}
        </span>
      </div>
    </div>
  );
}
