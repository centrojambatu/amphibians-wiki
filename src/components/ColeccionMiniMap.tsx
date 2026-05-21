"use client";

import { useCallback, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface ColeccionMiniMapProps {
  latitud: number;
  longitud: number;
  localidad?: string | null;
  provincia?: string | null;
  elevacion?: number | null;
  nombreCientifico?: string | null;
  nombreComun?: string | null;
}

// Botón de centrar que vive dentro del contexto del mapa
function CenterButton({ latitud, longitud }: { latitud: number; longitud: number }) {
  const map = useMap();
  return (
    <button
      type="button"
      onClick={() => map.setView([latitud, longitud], 7, { animate: true })}
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

export default function ColeccionMiniMap({ latitud, longitud, localidad, provincia, elevacion, nombreCientifico, nombreComun }: ColeccionMiniMapProps) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <MapContainer
        center={[latitud, longitud]}
        zoom={7}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
        scrollWheelZoom={true}
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
          <Popup
            className="coleccion-mini-popup"
            closeButton={false}
            maxWidth={240}
            minWidth={140}
            offset={[0, -4]}
          >
            <div className="text-[10px] text-gray-800 [&_p]:my-0" style={{ lineHeight: "1.35" }}>
              {nombreCientifico && (
                <p className="font-semibold italic" style={{ color: "#f07304" }}>
                  {nombreCientifico}
                </p>
              )}
              {nombreComun && <p className="text-gray-600">{nombreComun}</p>}
              {(localidad || provincia) && (
                <p className="font-medium">
                  {[localidad, provincia].filter(Boolean).join(", ")}
                </p>
              )}
              <p className="font-mono text-gray-500">
                {latitud}, {longitud}
                {elevacion != null && (
                  <>
                    <span className="mx-1.5 font-semibold" style={{ color: "#f07304" }}>
                      |
                    </span>
                    {elevacion} msnm
                  </>
                )}
              </p>
            </div>
          </Popup>
        </CircleMarker>
        <CenterButton latitud={latitud} longitud={longitud} />
      </MapContainer>
    </div>
  );
}
