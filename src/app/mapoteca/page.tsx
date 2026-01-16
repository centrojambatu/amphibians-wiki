"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Filter, Search, X, Mountain, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
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
    <div className="flex h-[600px] items-center justify-center rounded-lg bg-gray-100">
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

// Componente interno que usa useSearchParams
function MapotecaContent() {
  const searchParams = useSearchParams();
  const especieFromUrl = searchParams.get("especie") || "";
  
  const [provinciaFilter, setProvinciaFilter] = useState<string>("");
  const [especieFilter, setEspecieFilter] = useState<string>(especieFromUrl);
  const [searchInput, setSearchInput] = useState<string>(especieFromUrl);
  const [mapType, setMapType] = useState<"relief" | "terrain" | "provinces" | "satellite" | "streets">("provinces");
  const [showFilters, setShowFilters] = useState(true);
  // Si viene de una ficha de especie, mostrar todos los puntos de esa especie
  const [maxPoints, setMaxPoints] = useState<number>(especieFromUrl ? 11000 : 1000);

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

  // Generar link de regreso a la ficha de especie
  const speciesSlug = especieFromUrl ? especieFromUrl.replaceAll(" ", "-") : "";

  return (
    <>
      {/* Botón de regresar a la ficha (solo si viene de una ficha de especie) */}
      {especieFromUrl && (
        <div className="container mx-auto px-4 pb-4">
          <Link
            href={`/sapopedia/species/${speciesSlug}`}
            className="inline-flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-80"
            style={{
              color: "#16a34a",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
              fontWeight: "400",
              fontSize: "16px",
            }}
          >
            <span>←</span>
            <span>Volver a la ficha de la especie</span>
          </Link>
        </div>
      )}

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-6">
        {/* Panel de filtros */}
        <div className="mb-6 rounded-lg border bg-white p-4 shadow-sm">
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
          </div>

          {/* Filtros expandibles */}
          {showFilters && (
            <div className="mt-4 grid gap-4 border-t pt-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Búsqueda por especie */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
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
                <label className="text-sm font-medium text-gray-700">
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

              {/* Slider de puntos máximos */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Puntos a mostrar: <span className="font-bold text-green-600">{maxPoints.toLocaleString()}</span>
                </label>
                <Slider
                  value={[maxPoints]}
                  onValueChange={(value) => setMaxPoints(value[0])}
                  min={100}
                  max={11000}
                  step={100}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>100</span>
                  <span>11,000</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mapa */}
        <MapotecaMap
          provinciaFilter={provinciaFilter === "all" ? "" : provinciaFilter}
          especieFilter={especieFilter}
          mapType={mapType}
          maxPoints={maxPoints}
        />

        {/* Información adicional */}
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h3 className="mb-2 font-semibold text-gray-900">
              🗺️ Sobre el mapa
            </h3>
            <p className="text-sm text-gray-600">
              Este mapa muestra las ubicaciones geográficas de registros de
              anfibios en Ecuador. Cada punto representa una localidad donde se
              ha registrado una especie.
            </p>
          </div>

          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h3 className="mb-2 font-semibold text-gray-900">
              🔍 Cómo usar
            </h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Usa la rueda del mouse para hacer zoom</li>
              <li>• Arrastra para moverte por el mapa</li>
              <li>• Pasa el mouse sobre un punto para ver detalles</li>
              <li>• Haz clic en un punto para ir a la ficha de especie</li>
            </ul>
          </div>

          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h3 className="mb-2 font-semibold text-gray-900">
              📊 Datos
            </h3>
            <p className="text-sm text-gray-600">
              Los datos provienen de la colección del Centro Jambatu y
              literatura científica. Los registros incluyen coordenadas,
              elevación y vouchers de referencia.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// Componente de carga para el Suspense
function MapotecaLoading() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex h-[600px] items-center justify-center rounded-lg bg-gray-100">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
          <p className="text-muted-foreground">Cargando mapa...</p>
        </div>
      </div>
    </div>
  );
}

// Página principal que envuelve el contenido en Suspense
export default function MapotecaPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Mapoteca
          </h1>
          <p className="text-muted-foreground mt-1">
            Mapa interactivo de distribución de anfibios en Ecuador
          </p>
        </div>
      </div>

      {/* Contenido envuelto en Suspense */}
      <Suspense fallback={<MapotecaLoading />}>
        <MapotecaContent />
      </Suspense>
    </div>
  );
}
