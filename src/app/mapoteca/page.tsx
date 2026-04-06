"use client";

import {useState, useEffect, Suspense} from "react";
import {useSearchParams} from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import {Filter, Search, X, Mountain, MapPin} from "lucide-react";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Slider} from "@/components/ui/slider";

// Cargar el mapa dinámicamente para evitar SSR con Leaflet
const MapotecaMap = dynamic(() => import("@/components/MapotecaMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] items-center justify-center rounded-lg bg-gray-100">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
        <p className="text-muted-foreground">Cargando mapa...</p>
      </div>
    </div>
  ),
});

interface ProvinciaOption {
  id: number;
  nombre: string;
  value: string;
}

// Componente interno que usa useSearchParams
function MapotecaContent() {
  const searchParams = useSearchParams();
  const especieFromUrl = searchParams.get("especie") || "";

  // Restaurar estado desde sessionStorage si existe
  const getStoredState = () => {
    if (typeof window === "undefined") return null;
    const stored = sessionStorage.getItem("mapotecaState");

    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }

    return null;
  };

  const storedState = getStoredState();

  const [provinciaFilter, setProvinciaFilter] = useState<string>(
    storedState?.provinciaFilter || "",
  );
  const [especieFilter, setEspecieFilter] = useState<string>(
    storedState?.especieFilter || especieFromUrl,
  );
  const [searchInput, setSearchInput] = useState<string>(
    storedState?.searchInput || especieFromUrl,
  );
  const [mapType, setMapType] = useState<
    "relief" | "terrain" | "provinces" | "satellite" | "streets"
  >(storedState?.mapType || "provinces");
  const [showFilters, setShowFilters] = useState<boolean>(
    storedState?.showFilters !== undefined ? storedState.showFilters : true,
  );
  const [provincias, setProvincias] = useState<ProvinciaOption[]>([]);
  const [maxPuntos, setMaxPuntos] = useState<number>(
    storedState?.maxPuntos || 1000,
  );

  // Limpiar sessionStorage después de restaurar
  useEffect(() => {
    if (storedState) {
      sessionStorage.removeItem("mapotecaState");
    }
  }, []);

  // Cargar provincias al montar el componente
  useEffect(() => {
    const fetchProvincias = async () => {
      try {
        const response = await fetch("/api/mapoteca/provincias");

        if (!response.ok) throw new Error("Error al cargar provincias");
        const data = await response.json();

        setProvincias(data);
      } catch (err) {
        console.error("Error al obtener provincias:", err);
      }
    };

    fetchProvincias();
  }, []);

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
            className="inline-flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-80"
            href={`/sapopedia/species/${speciesSlug}`}
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
                className="gap-2"
                size="sm"
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
                Filtros
              </Button>

              {hasActiveFilters && (
                <Button
                  className="gap-1 text-red-600 hover:text-red-700"
                  size="sm"
                  variant="ghost"
                  onClick={clearFilters}
                >
                  <X className="h-4 w-4" />
                  Limpiar
                </Button>
              )}
            </div>

            {/* Selector de tipo de mapa */}
            <div className="flex items-center gap-2">
              <Mountain className="text-muted-foreground h-4 w-4" />
              <Select
                value={mapType}
                onValueChange={(
                  value: "relief" | "terrain" | "provinces" | "satellite" | "streets",
                ) => setMapType(value)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Tipo de mapa" />
                </SelectTrigger>
                <SelectContent className="z-[1000]">
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
                <label className="text-sm font-medium text-gray-700">Buscar especie</label>
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    className="pl-10"
                    placeholder="Ej: Atelopus, Pristimantis..."
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </div>
              </div>

              {/* Filtro por provincia */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Provincia</label>
                <Select value={provinciaFilter} onValueChange={setProvinciaFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las provincias" />
                  </SelectTrigger>
                  <SelectContent className="z-[1000]">
                    <SelectItem value="all">Todas las provincias</SelectItem>
                    {provincias.map((provincia) => (
                      <SelectItem key={provincia.id} value={provincia.nombre}>
                        {provincia.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Slider de puntos */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  <MapPin className="mr-1 inline h-4 w-4" />
                  Puntos a mostrar: {maxPuntos.toLocaleString()}
                </label>
                <Slider
                  value={[maxPuntos]}
                  onValueChange={(value) => setMaxPuntos(value[0])}
                  min={100}
                  max={60000}
                  step={100}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>100</span>
                  <span>60,000</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mapa */}
        <MapotecaMap
          especieFilter={especieFilter}
          mapType={mapType}
          maxPuntos={maxPuntos}
          provinciaFilter={provinciaFilter === "all" ? "" : provinciaFilter}
          onNavigateToSpecies={() => {
            if (typeof window !== "undefined") {
              sessionStorage.setItem(
                "mapotecaState",
                JSON.stringify({
                  provinciaFilter,
                  especieFilter,
                  searchInput,
                  mapType,
                  showFilters,
                  maxPuntos,
                }),
              );
            }
          }}
        />
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
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
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
          <h1 className="text-3xl font-bold text-gray-900">Mapoteca</h1>
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
