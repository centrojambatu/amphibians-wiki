"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix para los iconos de Leaflet en Next.js
if (globalThis.window !== undefined) {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });
}

// Datos estáticos de regiones con nombres comunes
const REGION_AREAS: {
  region: string;
  nombres: string[];
  coordinates: [number, number][]; // Latitud, Longitud para polígonos
  center: [number, number]; // Centro para el texto
}[] = [
  {
    region: "Nanal",
    nombres: ["Nanal"],
    coordinates: [
      [1.5, -78.5],
      [1.0, -78.0],
      [0.5, -78.2],
      [0.8, -78.8],
      [1.5, -78.5],
    ],
    center: [1.0, -78.3],
  },
  {
    region: "Villico",
    nombres: ["Villico"],
    coordinates: [
      [0.8, -78.0],
      [0.3, -77.5],
      [0.0, -77.8],
      [0.5, -78.3],
      [0.8, -78.0],
    ],
    center: [0.4, -77.9],
  },
  {
    region: "Dodoca",
    nombres: ["Dodoca", "Kodoka"],
    coordinates: [
      [-0.5, -79.5],
      [-1.0, -79.0],
      [-1.5, -79.3],
      [-1.2, -79.8],
      [-0.5, -79.5],
    ],
    center: [-1.0, -79.4],
  },
  {
    region: "Gusarapo",
    nombres: ["Gusarapo"],
    coordinates: [
      [-1.5, -80.5],
      [-2.5, -80.0],
      [-3.0, -80.5],
      [-2.5, -81.0],
      [-1.5, -80.5],
    ],
    center: [-2.1, -80.5],
  },
  {
    region: "Uilli-uilli",
    nombres: ["Uilli-uilli", "Güishigüishe", "Pilligalli", "Pilliguilli"],
    coordinates: [
      [-1.0, -78.5],
      [-1.5, -78.0],
      [-2.0, -78.3],
      [-1.5, -78.8],
      [-1.0, -78.5],
    ],
    center: [-1.5, -78.4],
  },
  {
    region: "Pímbalu",
    nombres: ["Pímbalu"],
    coordinates: [
      [-1.8, -78.8],
      [-2.3, -78.3],
      [-2.8, -78.6],
      [-2.3, -79.1],
      [-1.8, -78.8],
    ],
    center: [-2.3, -78.7],
  },
  {
    region: "Ultio",
    nombres: ["Ultio", "Temblor"],
    coordinates: [
      [-2.0, -79.5],
      [-2.5, -79.0],
      [-3.0, -79.3],
      [-2.5, -79.8],
      [-2.0, -79.5],
    ],
    center: [-2.5, -79.4],
  },
  {
    region: "Timbul",
    nombres: ["Timbul", "Timbal", "Tinbilín"],
    coordinates: [
      [-2.5, -78.5],
      [-3.0, -78.0],
      [-3.5, -78.3],
      [-3.0, -78.8],
      [-2.5, -78.5],
    ],
    center: [-3.0, -78.4],
  },
  {
    region: "Shugshi",
    nombres: ["Shugshi", "Chuglia", "Chuglli", "Tugllín"],
    coordinates: [
      [-3.0, -78.8],
      [-3.5, -78.3],
      [-4.0, -78.6],
      [-3.5, -79.1],
      [-3.0, -78.8],
    ],
    center: [-3.5, -78.7],
  },
  {
    region: "Jimbirico",
    nombres: ["Jimbirico", "Chimbirico", "Guiltre"],
    coordinates: [
      [-4.0, -79.5],
      [-4.5, -79.0],
      [-5.0, -79.3],
      [-4.5, -79.8],
      [-4.0, -79.5],
    ],
    center: [-4.5, -79.4],
  },
  {
    region: "Tufe",
    nombres: ["Tufe"],
    coordinates: [
      [0.5, -76.5],
      [0.0, -76.0],
      [-0.5, -76.3],
      [0.0, -76.8],
      [0.5, -76.5],
    ],
    center: [0.0, -76.4],
  },
  {
    region: "Rusu",
    nombres: ["Rusu"],
    coordinates: [
      [-0.5, -76.0],
      [-1.0, -75.5],
      [-1.5, -75.8],
      [-1.0, -76.3],
      [-0.5, -76.0],
    ],
    center: [-1.0, -75.9],
  },
  {
    region: "Kulo",
    nombres: ["Kulo"],
    coordinates: [
      [-1.5, -75.5],
      [-2.0, -75.0],
      [-2.5, -75.3],
      [-2.0, -75.8],
      [-1.5, -75.5],
    ],
    center: [-2.0, -75.4],
  },
  {
    region: "Paica",
    nombres: ["Paica", "Nenepaica"],
    coordinates: [
      [-2.0, -76.0],
      [-2.5, -75.5],
      [-3.0, -75.8],
      [-2.5, -76.3],
      [-2.0, -76.0],
    ],
    center: [-2.5, -75.9],
  },
  {
    region: "Wampuch'",
    nombres: ["Wampuch'"],
    coordinates: [
      [-3.5, -76.5],
      [-4.0, -76.0],
      [-4.5, -76.3],
      [-4.0, -76.8],
      [-3.5, -76.5],
    ],
    center: [-4.0, -76.4],
  },
];

export default function EcuadorMap() {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Crear el mapa centrado en Ecuador
    const map = L.map(mapContainerRef.current, {
      center: [-1.5, -78.5] as [number, number],
      zoom: 7,
      minZoom: 6,
      maxZoom: 10,
      zoomControl: true,
    });

    // Agregar capa de tiles (OpenStreetMap)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Agregar cada región como polígono
    REGION_AREAS.forEach((area) => {
      const polygon = L.polygon(area.coordinates, {
        color: "#3b82f6",
        weight: 2,
        fillColor: "#3b82f6",
        fillOpacity: 0.3,
        className: "region-polygon",
      }).addTo(map);

      // Tooltip con nombres comunes
      const nombresTexto = area.nombres.join(", ");

      polygon.bindTooltip(
        `<strong>${area.region}</strong><br/>${nombresTexto}`,
        {
          permanent: false,
          direction: "center",
          className: "region-tooltip",
        },
      );

      // Popup con más información
      polygon.bindPopup(
        `<div style="padding: 8px;"><strong>${area.region}</strong><br/><br/><strong>Nombres comunes:</strong><br/>${area.nombres.join("<br/>")}</div>`,
      );

      // Hover effect
      polygon.on("mouseover", function (e) {
        const layer = e.target;

        layer.setStyle({
          fillOpacity: 0.5,
          weight: 3,
        });
      });

      polygon.on("mouseout", function (e) {
        const layer = e.target;

        layer.setStyle({
          fillOpacity: 0.3,
          weight: 2,
        });
      });

      // Agregar etiqueta de texto en el centro
      const nombrePrincipal = area.nombres[0] || "";
      const cantidadRestante =
        area.nombres.length > 1 ? area.nombres.length - 1 : 0;
      const textoEtiqueta =
        cantidadRestante > 0
          ? `${nombrePrincipal} +${String(cantidadRestante)}`
          : nombrePrincipal;

      L.marker(area.center, {
        icon: L.divIcon({
          className: "region-label",
          html: `<div style="
            background: rgba(255, 255, 255, 0.9);
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 600;
            color: #1f2937;
            text-align: center;
            border: 1px solid rgba(59, 130, 246, 0.3);
            pointer-events: none;
            white-space: nowrap;
          ">${textoEtiqueta}</div>`,
          iconSize: [100, 20],
          iconAnchor: [50, 10],
        }),
      }).addTo(map);
    });

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-800">
        Distribución de Nombres Comunes
      </h3>
      <div
        ref={mapContainerRef}
        className="w-full overflow-hidden rounded-lg"
        style={{ height: "600px", minHeight: "500px" }}
      />
      <div className="mt-4 text-xs text-gray-600">
        <p>
          Haz clic en las áreas para ver los nombres comunes. Usa el zoom para
          navegar por el mapa.
        </p>
      </div>
    </div>
  );
}
