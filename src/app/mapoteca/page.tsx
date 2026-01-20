"use client";

import type {EspecieMapoteca} from "@/app/api/mapoteca/especies/route";

import {useState, useEffect, Suspense} from "react";
import {useSearchParams} from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import {Filter, Search, X, Mountain, ArrowLeft} from "lucide-react";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Slider} from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import RedListStatus from "@/components/RedListStatus";

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
  const [maxPoints, setMaxPoints] = useState<number>(
    storedState?.maxPoints || (especieFromUrl ? 11000 : 1000),
  );
  const [especies, setEspecies] = useState<EspecieMapoteca[]>([]);
  const [loadingEspecies, setLoadingEspecies] = useState(false);
  const [provincias, setProvincias] = useState<ProvinciaOption[]>([]);

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

  // Obtener especies cuando cambian los filtros
  useEffect(() => {
    const fetchEspecies = async () => {
      setLoadingEspecies(true);
      try {
        const params = new URLSearchParams();

        if (provinciaFilter && provinciaFilter !== "all") {
          params.set("provincia", provinciaFilter);
        }
        if (especieFilter) {
          params.set("especie", especieFilter);
        }

        const response = await fetch(`/api/mapoteca/especies?${params.toString()}`);

        if (!response.ok) throw new Error("Error al cargar especies");

        const data = await response.json();

        setEspecies(data);
      } catch (err) {
        console.error("Error al obtener especies:", err);
        setEspecies([]);
      } finally {
        setLoadingEspecies(false);
      }
    };

    fetchEspecies();
  }, [provinciaFilter, especieFilter]);

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

              {/* Slider de puntos máximos */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Puntos a mostrar:{" "}
                  <span className="font-bold text-green-600">{maxPoints.toLocaleString()}</span>
                </label>
                <Slider
                  className="w-full"
                  max={11000}
                  min={100}
                  step={100}
                  value={[maxPoints]}
                  onValueChange={(value) => setMaxPoints(value[0])}
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
          especieFilter={especieFilter}
          mapType={mapType}
          maxPoints={maxPoints}
          provinciaFilter={provinciaFilter === "all" ? "" : provinciaFilter}
          onNavigateToSpecies={() => {
            // Guardar estado completo antes de navegar
            if (typeof window !== "undefined") {
              sessionStorage.setItem(
                "mapotecaState",
                JSON.stringify({
                  provinciaFilter,
                  especieFilter,
                  searchInput,
                  mapType,
                  showFilters,
                  maxPoints,
                }),
              );
            }
          }}
        />

        {/* Tabla de especies */}
        <div className="mt-6 rounded-lg border bg-white shadow-sm">
          <div className="border-b p-4">
            <h2 className="text-xl font-semibold text-gray-900">Especies en el mapa</h2>
            <p className="mt-1 text-sm text-gray-600">
              {loadingEspecies
                ? "Cargando..."
                : `${especies.length} especie${especies.length !== 1 ? "s" : ""} encontrada${especies.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          {loadingEspecies ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
            </div>
          ) : especies.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Nombre Científico</TableHead>
                    <TableHead className="w-[15%]">Género</TableHead>
                    <TableHead className="w-[15%]">Familia</TableHead>
                    <TableHead className="w-[15%] text-center">Endémica</TableHead>
                    <TableHead className="w-[15%] text-center">Lista Roja</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {especies.map((especie) => (
                    <TableRow key={especie.id_taxon}>
                      <TableCell className="font-medium">
                        <Link
                          className="text-green-600 italic hover:text-green-700 hover:underline"
                          href={`/sapopedia/species/${especie.nombre_cientifico.replaceAll(" ", "-")}`}
                          onClick={() => {
                            // Guardar estado antes de navegar
                            if (typeof window !== "undefined") {
                              sessionStorage.setItem(
                                "mapotecaState",
                                JSON.stringify({
                                  provinciaFilter,
                                  especieFilter,
                                  searchInput,
                                  mapType,
                                  showFilters,
                                  maxPoints,
                                }),
                              );
                            }
                          }}
                        >
                          {especie.nombre_cientifico}
                        </Link>
                      </TableCell>
                      <TableCell className="italic">{especie.genero || "-"}</TableCell>
                      <TableCell>{especie.familia || "-"}</TableCell>
                      <TableCell className="text-center">
                        {especie.endemica !== null ? (
                          <span className="text-xs font-semibold text-gray-600">
                            {especie.endemica ? "E" : "NE"}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {especie.lista_roja_iucn
                          ? (() => {
                              const sigla = especie.lista_roja_iucn.trim().toUpperCase();
                              const isPE =
                                sigla === "PE" ||
                                sigla.includes("PE") ||
                                sigla.includes("POSIBLEMENTE EXTINTA");

                              if (isPE) {
                                return (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div
                                          className="inline-flex cursor-pointer items-center justify-center text-[11px] font-semibold transition-all duration-200 hover:scale-105"
                                          style={{
                                            backgroundColor: "#b71c1c",
                                            color: "#ffffff",
                                            borderRadius: "100% 0% 100% 100%",
                                            width: "36px",
                                            height: "36px",
                                            padding: "4px 9px",
                                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.15)",
                                          }}
                                        >
                                          PE
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="font-semibold">Posiblemente Extinta</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                );
                              }

                              // Validar que sea un status válido para RedListStatus
                              const validStatuses = [
                                "LC",
                                "NT",
                                "VU",
                                "EN",
                                "CR",
                                "EW",
                                "EX",
                                "DD",
                              ];

                              if (validStatuses.includes(sigla)) {
                                return (
                                  <RedListStatus
                                    showTooltip={true}
                                    status={
                                      sigla as "LC" | "NT" | "VU" | "EN" | "CR" | "EW" | "EX" | "DD"
                                    }
                                  />
                                );
                              }

                              return <span className="text-gray-500">-</span>;
                            })()
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              No se encontraron especies con los filtros aplicados.
            </div>
          )}
        </div>

        {/* Información adicional */}
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h3 className="mb-2 font-semibold text-gray-900">🗺️ Sobre el mapa</h3>
            <p className="text-sm text-gray-600">
              Este mapa muestra las ubicaciones geográficas de registros de anfibios en Ecuador.
              Cada punto representa una localidad donde se ha registrado una especie.
            </p>
          </div>

          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h3 className="mb-2 font-semibold text-gray-900">🔍 Cómo usar</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Usa la rueda del mouse para hacer zoom</li>
              <li>• Arrastra para moverte por el mapa</li>
              <li>• Pasa el mouse sobre un punto para ver detalles</li>
              <li>• Haz clic en un punto para ir a la ficha de especie</li>
            </ul>
          </div>

          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h3 className="mb-2 font-semibold text-gray-900">📊 Datos</h3>
            <p className="text-sm text-gray-600">
              Los datos provienen de la colección del Centro Jambatu y literatura científica. Los
              registros incluyen coordenadas, elevación y vouchers de referencia.
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
