"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Calendar, CornerDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { TipoPublicacion } from "@/app/sapoteca/get-tipos-publicacion";
import { FiltrosSapoteca } from "@/app/sapoteca/get-publicaciones-paginadas";

interface SapotecaFiltersPanelProps {
  readonly tiposPublicacion: TipoPublicacion[];
  readonly años: number[];
}

export default function SapotecaFiltersPanel({
  tiposPublicacion,
  años,
}: SapotecaFiltersPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Inicializar filtros desde URL
  const tituloInicial = searchParams.get("titulo") || "";
  const autorInicial = searchParams.get("autor") || "";

  // Estados para autocomplete
  const [tituloQuery, setTituloQuery] = useState(tituloInicial);
  const [autorQuery, setAutorQuery] = useState(autorInicial);
  const [tituloOpen, setTituloOpen] = useState(false);
  const [autorOpen, setAutorOpen] = useState(false);
  const [sugerenciasTitulos, setSugerenciasTitulos] = useState<string[]>([]);
  const [sugerenciasAutores, setSugerenciasAutores] = useState<string[]>([]);

  // Calcular rango de años disponible
  const añoMin = años.length > 0 ? Math.min(...años) : 1970;
  const añoMax = años.length > 0 ? Math.max(...años) : new Date().getFullYear();

  // Inicializar rango de años desde URL o usar el rango completo
  const añosIniciales = searchParams.get("años")?.split(",").map(Number).filter((n) => !isNaN(n));
  const rangoAñosInicial = añosIniciales && añosIniciales.length > 0
    ? [Math.min(...añosIniciales), Math.max(...añosIniciales)]
    : [añoMin, añoMax];

  const [rangoAños, setRangoAños] = useState<number[]>(rangoAñosInicial);
  const [añoEspecificoInput, setAñoEspecificoInput] = useState("");

  const [filtros, setFiltros] = useState<FiltrosSapoteca>({
    titulo: tituloInicial || undefined,
    años: añosIniciales || undefined,
    autor: autorInicial || undefined,
    tiposPublicacion: searchParams.get("tipos")?.split(",").map(Number) || undefined,
  });

  // Cargar sugerencias de títulos
  useEffect(() => {
    if (tituloQuery.length >= 2) {
      fetch(`/api/sapoteca/sugerencias-titulos?q=${encodeURIComponent(tituloQuery)}`)
        .then((res) => res.json())
        .then(setSugerenciasTitulos)
        .catch(() => setSugerenciasTitulos([]));
    } else {
      setSugerenciasTitulos([]);
    }
  }, [tituloQuery]);

  // Cargar sugerencias de autores
  useEffect(() => {
    if (autorQuery.length >= 2) {
      fetch(`/api/sapoteca/sugerencias-autores?q=${encodeURIComponent(autorQuery)}`)
        .then((res) => res.json())
        .then(setSugerenciasAutores)
        .catch(() => setSugerenciasAutores([]));
    } else {
      setSugerenciasAutores([]);
    }
  }, [autorQuery]);

  // Sincronizar rango de años cuando se limpien los filtros
  useEffect(() => {
    if (!filtros.años || filtros.años.length === 0) {
      const nuevoRango = [añoMin, añoMax];
      if (rangoAños[0] !== nuevoRango[0] || rangoAños[1] !== nuevoRango[1]) {
        setRangoAños(nuevoRango);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros.años?.length, añoMin, añoMax]);

  // Actualizar URL cuando cambien los filtros (evitar en montaje inicial)
  const [isInitialMount, setIsInitialMount] = useState(true);

  useEffect(() => {
    if (isInitialMount) {
      setIsInitialMount(false);
      return;
    }

    const params = new URLSearchParams();

    if (filtros.titulo) {
      params.set("titulo", filtros.titulo);
    }
    if (filtros.años && filtros.años.length > 0) {
      params.set("años", filtros.años.join(","));
    }
    if (filtros.autor) {
      params.set("autor", filtros.autor);
    }
    if (filtros.tiposPublicacion && filtros.tiposPublicacion.length > 0) {
      params.set("tipos", filtros.tiposPublicacion.join(","));
    }

    // Resetear a página 1 cuando cambien los filtros
    params.delete("pagina");

    const queryString = params.toString();
    router.push(`/sapoteca${queryString ? `?${queryString}` : ""}`, { scroll: false });
  }, [filtros, router, isInitialMount]);

  const handleTituloChange = (value: string) => {
    setTituloQuery(value);
    setFiltros((prev) => ({
      ...prev,
      titulo: value || undefined,
    }));
    setTituloOpen(value.length >= 2 && sugerenciasTitulos.length > 0);
  };

  const handleSelectTitulo = (titulo: string) => {
    setTituloQuery(titulo);
    setFiltros((prev) => ({
      ...prev,
      titulo,
    }));
    setTituloOpen(false);
  };

  const handleRangoAñosChange = (nuevoRango: number[]) => {
    setRangoAños(nuevoRango);

    // Generar array de años en el rango seleccionado
    const [min, max] = nuevoRango;
    const añosEnRango: number[] = [];
    for (let año = min; año <= max; año++) {
      if (años.includes(año)) {
        añosEnRango.push(año);
      }
    }

    setFiltros((prev) => ({
      ...prev,
      años: añosEnRango.length > 0 ? añosEnRango : undefined,
    }));
  };

  const aplicarAñoEspecifico = (valor: string) => {
    const año = Number.parseInt(valor, 10);
    if (Number.isNaN(año)) return;
    const añoClamp = Math.min(añoMax, Math.max(añoMin, año));
    setRangoAños([añoClamp, añoClamp]);
    setFiltros((prev) => ({
      ...prev,
      años: [añoClamp],
    }));
    setAñoEspecificoInput("");
  };

  const handleAutorChange = (value: string) => {
    setAutorQuery(value);
    setFiltros((prev) => ({
      ...prev,
      autor: value || undefined,
    }));
    setAutorOpen(value.length >= 2 && sugerenciasAutores.length > 0);
  };

  const handleSelectAutor = (autor: string) => {
    setAutorQuery(autor);
    setFiltros((prev) => ({
      ...prev,
      autor,
    }));
    setAutorOpen(false);
  };

  const handleTipoPublicacionChange = (tipoId: number, checked: boolean) => {
    setFiltros((prev) => {
      const tiposActuales = prev.tiposPublicacion || [];
      let nuevosTipos: number[];

      if (checked) {
        nuevosTipos = [...tiposActuales, tipoId];
      } else {
        nuevosTipos = tiposActuales.filter((id) => id !== tipoId);
      }

      return {
        ...prev,
        tiposPublicacion: nuevosTipos.length > 0 ? nuevosTipos : undefined,
      };
    });
  };

  return (
    <div className="sticky top-0 flex h-screen max-h-screen flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="filters-panel-scroll flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-6 w-full">
          {/* Filtro de Título */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Título</h4>
            <Popover open={tituloOpen} onOpenChange={setTituloOpen}>
              <PopoverTrigger asChild>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Título"
                    value={tituloQuery || filtros.titulo || ""}
                    onChange={(e) => handleTituloChange(e.target.value)}
                    onFocus={() => {
                      if (tituloQuery.length >= 2 && sugerenciasTitulos.length > 0) {
                        setTituloOpen(true);
                      }
                    }}
                    className="pl-10"
                  />
                </div>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="w-[--radix-popover-trigger-width] p-0"
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <Command>
                  <CommandList>
                    {sugerenciasTitulos.length === 0 && tituloQuery.length >= 2 && (
                      <CommandEmpty>No se encontraron títulos</CommandEmpty>
                    )}
                    {sugerenciasTitulos.length > 0 && (
                      <CommandGroup>
                        {sugerenciasTitulos.map((titulo) => (
                          <CommandItem
                            key={titulo}
                            value={titulo}
                            onSelect={() => handleSelectTitulo(titulo)}
                          >
                            <span
                              dangerouslySetInnerHTML={{
                                __html: titulo.replace(
                                  new RegExp(`(${tituloQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"),
                                  "<strong>$1</strong>",
                                ),
                              }}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Filtro de Autor */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Autor</h4>
            <Popover open={autorOpen} onOpenChange={setAutorOpen}>
              <PopoverTrigger asChild>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Autor"
                    value={autorQuery || filtros.autor || ""}
                    onChange={(e) => handleAutorChange(e.target.value)}
                    onFocus={() => {
                      if (autorQuery.length >= 2 && sugerenciasAutores.length > 0) {
                        setAutorOpen(true);
                      }
                    }}
                    className="pl-10"
                  />
                </div>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="w-[--radix-popover-trigger-width] p-0"
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <Command>
                  <CommandList>
                    {sugerenciasAutores.length === 0 && autorQuery.length >= 2 && (
                      <CommandEmpty>No se encontraron autores</CommandEmpty>
                    )}
                    {sugerenciasAutores.length > 0 && (
                      <CommandGroup>
                        {sugerenciasAutores.map((autor) => (
                          <CommandItem
                            key={autor}
                            value={autor}
                            onSelect={() => handleSelectAutor(autor)}
                          >
                            <span
                              dangerouslySetInnerHTML={{
                                __html: autor.replace(
                                  new RegExp(`(${autorQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"),
                                  "<strong>$1</strong>",
                                ),
                              }}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Filtro de Años */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">
              Años
              {filtros.años && filtros.años.length > 0 && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  {rangoAños[0]} - {rangoAños[1]}
                </span>
              )}
            </h4>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 min-w-0">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input
                  id="año-especifico"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  minLength={4}
                  maxLength={4}
                  placeholder="Año"
                  value={añoEspecificoInput}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "");
                    setAñoEspecificoInput(v);
                  }}
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (v) aplicarAñoEspecifico(v);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const v = (e.target as HTMLInputElement).value.trim();
                      if (v) aplicarAñoEspecifico(v);
                    }
                  }}
                  className="pl-10"
                />
              </div>
              <span className="shrink-0" title="Enter para aplicar">
                <CornerDownLeft className="h-4 w-4 text-muted-foreground" aria-hidden />
              </span>
            </div>
            <div className="space-y-2 pt-2">
              <Slider
                value={rangoAños}
                onValueChange={handleRangoAñosChange}
                min={añoMin}
                max={añoMax}
                step={1}
                className="w-full"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{añoMin}</span>
                <span className="font-semibold text-foreground">
                  {rangoAños[0]} - {rangoAños[1]}
                </span>
                <span>{añoMax}</span>
              </div>
            </div>
          </div>

          {/* Filtro de Tipo de Publicación */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Tipo de Publicación</h4>
            <div className="flex flex-col gap-2">
              {tiposPublicacion.map((tipo) => {
                const isSelected = filtros.tiposPublicacion?.includes(tipo.id_catalogo_awe) ?? false;
                return (
                  <Button
                    key={tipo.id_catalogo_awe}
                    type="button"
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    className="h-auto min-h-[32px] w-full justify-start rounded-none px-2 py-1 text-left text-sm break-words whitespace-normal"
                    style={{
                      borderColor: isSelected ? undefined : "#e8e8e8",
                      color: isSelected ? undefined : "#2d2d2d",
                    }}
                    onClick={() => handleTipoPublicacionChange(tipo.id_catalogo_awe, !isSelected)}
                  >
                    {tipo.nombre}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
