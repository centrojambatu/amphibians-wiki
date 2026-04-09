"use client";

import { useCallback, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface ColeccionMiniMapProps {
  latitud: number;
  longitud: number;
  localidad?: string | null;
  provincia?: string | null;
}

// Botón de centrar que vive dentro del contexto del mapa
function CenterButton({ latitud, longitud }: { latitud: number; longitud: number }) {
  const map = useMap();
  return (
    <button
      type="button"
      onClick={() => map.setView([latitud, longitud], 10, { animate: true })}
      title="Centrar"
      className="absolute bottom-2 right-2 z-[1000] flex h-7 w-7 items-center justify-center rounded-md border border-gray-300 bg-white shadow-sm hover:bg-gray-50 transition-colors"
      style={{ lineHeight: 1 }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-gray-600">
        <circle cx="12" cy="12" r="3" />
        <line x1="12" y1="2" x2="12" y2="6" />
        <line x1="12" y1="18" x2="12" y2="22" />
        <line x1="2" y1="12" x2="6" y2="12" />
        <line x1="18" y1="12" x2="22" y2="12" />
      </svg>
    </button>
  );
}

export default function ColeccionMiniMap({ latitud, longitud, localidad, provincia }: ColeccionMiniMapProps) {
  return (
    <div className="relative mt-3 overflow-hidden rounded-lg border border-gray-200" style={{ height: 200 }}>
      <MapContainer
        center={[latitud, longitud]}
        zoom={10}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        scrollWheelZoom={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
        <CircleMarker
          center={[latitud, longitud]}
          radius={7}
          pathOptions={{
            fillColor: "#f07304",
            fillOpacity: 0.95,
            color: "#fff",
            weight: 2,
          }}
        >
          <Popup offset={[0, -5]} minWidth={160} maxWidth={220}>
            <div className="text-[11px] text-gray-800 space-y-0.5" style={{ lineHeight: "1.4" }}>
              {(localidad || provincia) && (
                <p className="font-medium">
                  {[localidad, provincia].filter(Boolean).join(", ")}
                </p>
              )}
              <p className="text-gray-500">{latitud}, {longitud}</p>
            </div>
          </Popup>
        </CircleMarker>
        <CenterButton latitud={latitud} longitud={longitud} />
      </MapContainer>
    </div>
  );
}
