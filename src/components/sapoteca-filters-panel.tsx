"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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

  const limpiarFiltros = () => {
    setTituloQuery("");
    setAutorQuery("");
    setRangoAños([añoMin, añoMax]);
    setFiltros({
      titulo: undefined,
      años: undefined,
      autor: undefined,
      tiposPublicacion: undefined,
    });
  };

  const tieneFiltrosActivos =
    !!filtros.titulo || (filtros.años && filtros.años.length > 0) || !!filtros.autor || (filtros.tiposPublicacion && filtros.tiposPublicacion.length > 0);

  return (
    <div className="sticky top-0 flex h-screen max-h-screen flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Filtros</h3>
          {tieneFiltrosActivos && (
            <Button variant="ghost" size="sm" onClick={limpiarFiltros}>
              Limpiar
            </Button>
          )}
        </div>
      </div>
      <div className="filters-panel-scroll flex-1 overflow-y-auto px-6 py-4">
        <Accordion type="multiple" defaultValue={["titulo", "año", "autor", "tipos"]} className="w-full">
          {/* Filtro de Título */}
          <AccordionItem value="titulo">
            <AccordionTrigger>Título</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
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
            </AccordionContent>
          </AccordionItem>

          {/* Filtro de Año */}
          <AccordionItem value="año">
            <AccordionTrigger>
              Años
              {filtros.años && filtros.años.length > 0 && (
                <span className="ml-2 text-xs text-muted-foreground">
                  {rangoAños[0]} - {rangoAños[1]}
                </span>
              )}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 px-4 py-2">
                <div className="space-y-2">
                  <div className="px-4">
                    <Slider
                      value={rangoAños}
                      onValueChange={handleRangoAñosChange}
                      min={añoMin}
                      max={añoMax}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground px-4">
                    <span>{añoMin}</span>
                    <span className="font-semibold text-foreground">
                      {rangoAños[0]} - {rangoAños[1]}
                    </span>
                    <span>{añoMax}</span>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Filtro de Autor */}
          <AccordionItem value="autor">
            <AccordionTrigger>Autor</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
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
            </AccordionContent>
          </AccordionItem>

          {/* Filtro de Tipo de Publicación */}
          <AccordionItem value="tipos">
            <AccordionTrigger>Tipo de Publicación</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {tiposPublicacion.map((tipo) => (
                  <div key={tipo.id_catalogo_awe} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`tipo-${tipo.id_catalogo_awe}`}
                      checked={filtros.tiposPublicacion?.includes(tipo.id_catalogo_awe) || false}
                      onChange={(e) =>
                        handleTipoPublicacionChange(tipo.id_catalogo_awe, e.target.checked)
                      }
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label
                      htmlFor={`tipo-${tipo.id_catalogo_awe}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {tipo.nombre}
                    </label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
