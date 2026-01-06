"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Filter, Layers, Search, X, Mountain } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Cargar el mapa dinámicamente para evitar SSR con Leaflet
const MapotecaMap = dynamic(() => import("@/components/MapotecaMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
        <p className="text-muted-foreground">Cargando mapa...</p>
      </div>
    </div>
  ),
});

// Lista de provincias de Ecuador
const PROVINCIAS = [
  "Azuay",
  "Bolívar",
  "Cañar",
  "Carchi",
  "Chimborazo",
  "Cotopaxi",
  "El Oro",
  "Esmeraldas",
  "Galápagos",
  "Guayas",
  "Imbabura",
  "Loja",
  "Los Ríos",
  "Manabí",
  "Morona Santiago",
  "Napo",
  "Orellana",
  "Pastaza",
  "Pichincha",
  "Santa Elena",
  "Santo Domingo",
  "Sucumbíos",
  "Tungurahua",
  "Zamora Chinchipe",
];

export default function MapotecaPage() {
  const searchParams = useSearchParams();
  const especieFromUrl = searchParams.get("especie") || "";
  
  const [provinciaFilter, setProvinciaFilter] = useState<string>("");
  const [especieFilter, setEspecieFilter] = useState<string>(especieFromUrl);
  const [searchInput, setSearchInput] = useState<string>(especieFromUrl);
  const [colorMode, setColorMode] = useState<"genus" | "elevation">("elevation");
  const [mapType, setMapType] = useState<"relief" | "terrain" | "provinces" | "satellite" | "streets">("provinces");
  const [showFilters, setShowFilters] = useState(true);

  // Debounce para búsqueda de especie
  useEffect(() => {
    const timer = setTimeout(() => {
      setEspecieFilter(searchInput);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const clearFilters = () => {
    setProvinciaFilter("");
    setSearchInput("");
    setEspecieFilter("");
  };

  const hasActiveFilters = provinciaFilter || especieFilter;

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Mapoteca
          </h1>
          <p className="text-muted-foreground mt-1">
            Mapa interactivo de distribución de anfibios en Ecuador
          </p>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-6">
        {/* Panel de filtros */}
        <div className="mb-6 rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-900">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant={showFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Filtros
              </Button>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="gap-1 text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                  Limpiar
                </Button>
              )}
            </div>

            {/* Selector de tipo de mapa */}
            <div className="flex items-center gap-2">
              <Mountain className="h-4 w-4 text-muted-foreground" />
              <Select
                value={mapType}
                onValueChange={(value: "relief" | "terrain" | "provinces" | "satellite" | "streets") =>
                  setMapType(value)
                }
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Tipo de mapa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relief">Relieve</SelectItem>
                  <SelectItem value="terrain">Topográfico</SelectItem>
                  <SelectItem value="provinces">Provincias</SelectItem>
                  <SelectItem value="satellite">Satélite</SelectItem>
                  <SelectItem value="streets">Calles</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Selector de modo de color */}
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <Select
                value={colorMode}
                onValueChange={(value: "genus" | "elevation") =>
                  setColorMode(value)
                }
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Colorear por..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="genus">Por género</SelectItem>
                  <SelectItem value="elevation">Por elevación</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filtros expandibles */}
          {showFilters && (
            <div className="mt-4 grid gap-4 border-t pt-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Búsqueda por especie */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Buscar especie
                </label>
                <div className="relative">
                  <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                  <Input
                    type="text"
                    placeholder="Ej: Atelopus, Pristimantis..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filtro por provincia */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Provincia
                </label>
                <Select
                  value={provinciaFilter}
                  onValueChange={setProvinciaFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las provincias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las provincias</SelectItem>
                    {PROVINCIAS.map((provincia) => (
                      <SelectItem key={provincia} value={provincia}>
                        {provincia}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Estadísticas rápidas */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Información
                </label>
                <div className="rounded-lg bg-green-50 p-3 text-sm dark:bg-green-900/20">
                  <p className="text-green-800 dark:text-green-200">
                    <strong>Tip:</strong> Pasa el mouse sobre los puntos para
                    ver detalles. Haz clic para ir a la ficha de la especie.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mapa */}
        <Suspense
          fallback={
            <div className="flex h-[600px] items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
              <div className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
                <p className="text-muted-foreground">Cargando mapa...</p>
              </div>
            </div>
          }
        >
          <MapotecaMap
            provinciaFilter={provinciaFilter === "all" ? "" : provinciaFilter}
            especieFilter={especieFilter}
            colorMode={colorMode}
            mapType={mapType}
          />
        </Suspense>

        {/* Información adicional */}
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-900">
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
              🗺️ Sobre el mapa
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Este mapa muestra las ubicaciones geográficas de registros de
              anfibios en Ecuador. Cada punto representa una localidad donde se
              ha registrado una especie.
            </p>
          </div>

          <div className="rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-900">
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
              🔍 Cómo usar
            </h3>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>• Usa la rueda del mouse para hacer zoom</li>
              <li>• Arrastra para moverte por el mapa</li>
              <li>• Pasa el mouse sobre un punto para ver detalles</li>
              <li>• Haz clic en un punto para ir a la ficha de especie</li>
            </ul>
          </div>

          <div className="rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-900">
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
              📊 Datos
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Los datos provienen de la colección del Centro Jambatu y
              literatura científica. Los registros incluyen coordenadas,
              elevación y vouchers de referencia.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
