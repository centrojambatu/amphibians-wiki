"use client";

import type {TiposPublicacionAgrupados} from "@/app/sapoteca/get-tipos-publicacion";

import {useState, useEffect, useTransition} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {Search, CornerDownLeft, RotateCcw, Check, X} from "lucide-react";

import {RANGE_DASH} from "@/lib/format-range";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Slider} from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {FiltrosSapoteca} from "@/app/sapoteca/get-publicaciones-paginadas";

interface SapotecaFiltersPanelProps {
  readonly tiposPublicacion: TiposPublicacionAgrupados;
  readonly años: number[];
  readonly onPendingChange?: (pending: boolean) => void;
}

export default function SapotecaFiltersPanel({
  tiposPublicacion,
  años,
  onPendingChange,
}: SapotecaFiltersPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    onPendingChange?.(isPending);
  }, [isPending, onPendingChange]);

  const titulosIniciales = searchParams.getAll("titulo").filter((t) => t.trim().length > 0);
  const autoresIniciales = searchParams.getAll("autor").filter((a) => a.trim().length > 0);

  const [tituloQuery, setTituloQuery] = useState("");
  const [autorQuery, setAutorQuery] = useState("");
  const [tituloOpen, setTituloOpen] = useState(false);
  const [autorOpen, setAutorOpen] = useState(false);
  const [sugerenciasTitulos, setSugerenciasTitulos] = useState<string[]>([]);
  const [sugerenciasAutores, setSugerenciasAutores] = useState<string[]>([]);

  const añoMin = años.length > 0 ? Math.min(...años) : 1970;
  const añoMax = años.length > 0 ? Math.max(...años) : new Date().getFullYear();

  const añosIniciales = searchParams
    .get("años")
    ?.split(",")
    .map(Number)
    .filter((n) => !isNaN(n));
  const rangoAñosInicial =
    añosIniciales && añosIniciales.length > 0
      ? [Math.min(...añosIniciales), Math.max(...añosIniciales)]
      : [añoMin, añoMax];

  const [rangoAños, setRangoAños] = useState<number[]>(rangoAñosInicial);
  const [añoEspecificoInput, setAñoEspecificoInput] = useState("");

  const indexadaParam = searchParams.get("indexada");
  const indexadaInicial: boolean | undefined =
    indexadaParam === "true" ? true : indexadaParam === "false" ? false : undefined;

  const formatoImpresoParam = searchParams.get("formatoImpreso");
  const formatoImpresoInicial: boolean | undefined =
    formatoImpresoParam === "true" ? true : formatoImpresoParam === "false" ? false : undefined;

  const [filtros, setFiltros] = useState<FiltrosSapoteca>({
    titulos: titulosIniciales.length > 0 ? titulosIniciales : undefined,
    años: añosIniciales || undefined,
    autores: autoresIniciales.length > 0 ? autoresIniciales : undefined,
    tiposPublicacion: searchParams.get("tipos")?.split(",").map(Number) || undefined,
    indexada: indexadaInicial,
    formatoImpreso: formatoImpresoInicial,
  });

  // Sincronizar estado del panel cuando la URL cambia (p. ej. clic en barra del histograma)
  const paramsKey = searchParams.toString();

  useEffect(() => {
    const titulos = searchParams.getAll("titulo").filter((t) => t.trim().length > 0);
    const autores = searchParams.getAll("autor").filter((a) => a.trim().length > 0);
    const añosStr = searchParams.get("años");
    const años = añosStr
      ? añosStr
          .split(",")
          .map(Number)
          .filter((n) => !isNaN(n))
      : undefined;
    const rango =
      años && años.length > 0 ? [Math.min(...años), Math.max(...años)] : [añoMin, añoMax];
    const tiposStr = searchParams.get("tipos");
    const tipos = tiposStr
      ? tiposStr
          .split(",")
          .map(Number)
          .filter((n) => !isNaN(n))
      : undefined;
    const idx = searchParams.get("indexada");
    const indexada = idx === "true" ? true : idx === "false" ? false : undefined;
    const fmt = searchParams.get("formatoImpreso");
    const formatoImpreso = fmt === "true" ? true : fmt === "false" ? false : undefined;

    setAutorQuery("");
    setRangoAños(rango);
    setFiltros({
      titulos: titulos.length > 0 ? titulos : undefined,
      años: años?.length ? años : undefined,
      autores: autores.length > 0 ? autores : undefined,
      tiposPublicacion: tipos?.length ? tipos : undefined,
      indexada,
      formatoImpreso,
    });
  }, [paramsKey, añoMin]);

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

  useEffect(() => {
    if (!filtros.años || filtros.años.length === 0) {
      const nuevoRango = [añoMin, añoMax];

      if (rangoAños[0] !== nuevoRango[0] || rangoAños[1] !== nuevoRango[1]) {
        setRangoAños(nuevoRango);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros.años?.length, añoMin, añoMax]);

  const [isInitialMount, setIsInitialMount] = useState(true);

  useEffect(() => {
    if (isInitialMount) {
      setIsInitialMount(false);

      return;
    }

    const params = new URLSearchParams();

    // Preservar params externos (no manejados por este panel): publicacion_id, back, etc.
    const PARAMS_PROPIOS = new Set([
      "titulo",
      "años",
      "autor",
      "tipos",
      "indexada",
      "formatoImpreso",
      "pagina",
    ]);

    searchParams.forEach((value, key) => {
      if (!PARAMS_PROPIOS.has(key)) params.set(key, value);
    });

    if (filtros.titulos && filtros.titulos.length > 0) {
      filtros.titulos.forEach((t) => params.append("titulo", t));
    }
    if (filtros.años && filtros.años.length > 0) params.set("años", filtros.años.join(","));
    if (filtros.autores && filtros.autores.length > 0) {
      filtros.autores.forEach((a) => params.append("autor", a));
    }
    if (filtros.tiposPublicacion && filtros.tiposPublicacion.length > 0) {
      params.set("tipos", filtros.tiposPublicacion.join(","));
    }
    if (filtros.indexada !== undefined) params.set("indexada", String(filtros.indexada));
    if (filtros.formatoImpreso !== undefined)
      params.set("formatoImpreso", String(filtros.formatoImpreso));

    params.delete("pagina");

    const queryString = params.toString();

    startTransition(() => {
      router.push(`/sapoteca${queryString ? `?${queryString}` : ""}`, {
        scroll: false,
      });
    });
  }, [filtros, router, isInitialMount]);

  const handleTituloChange = (value: string) => {
    setTituloQuery(value);
    setTituloOpen(value.length >= 2 && sugerenciasTitulos.length > 0);
  };

  const handleToggleTitulo = (titulo: string) => {
    setFiltros((prev) => {
      const actuales = prev.titulos ?? [];
      const yaSeleccionado = actuales.includes(titulo);
      const nuevos = yaSeleccionado
        ? actuales.filter((t) => t !== titulo)
        : [...actuales, titulo];

      return {...prev, titulos: nuevos.length > 0 ? nuevos : undefined};
    });
  };

  const handleQuitarTitulo = (titulo: string) => {
    setFiltros((prev) => {
      const nuevos = (prev.titulos ?? []).filter((t) => t !== titulo);

      return {...prev, titulos: nuevos.length > 0 ? nuevos : undefined};
    });
  };

  const handleRangoAñosChange = (nuevoRango: number[]) => {
    setRangoAños(nuevoRango);
    const [min, max] = nuevoRango;
    const añosEnRango: number[] = [];

    for (let año = min; año <= max; año++) {
      if (años.includes(año)) añosEnRango.push(año);
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
    setFiltros((prev) => ({...prev, años: [añoClamp]}));
    setAñoEspecificoInput("");
  };

  const handleAutorChange = (value: string) => {
    setAutorQuery(value);
    setAutorOpen(value.length >= 2 && sugerenciasAutores.length > 0);
  };

  const handleToggleAutor = (autor: string) => {
    setFiltros((prev) => {
      const actuales = prev.autores ?? [];
      const yaSeleccionado = actuales.includes(autor);
      const nuevos = yaSeleccionado
        ? actuales.filter((a) => a !== autor)
        : [...actuales, autor];

      return {...prev, autores: nuevos.length > 0 ? nuevos : undefined};
    });
  };

  const handleQuitarAutor = (autor: string) => {
    setFiltros((prev) => {
      const nuevos = (prev.autores ?? []).filter((a) => a !== autor);

      return {...prev, autores: nuevos.length > 0 ? nuevos : undefined};
    });
  };

  const handleIndexadaChange = (valor: boolean) => {
    setFiltros((prev) => ({
      ...prev,
      indexada: prev.indexada === valor ? undefined : valor,
    }));
  };

  /** Conmuta en filtros los IDs de una sección (ej. Tesis u Otro): si ya están, los quita; si no, los añade. */
  const handleTipoSeccionChange = (ids: number[]) => {
    if (ids.length === 0) return;
    setFiltros((prev) => {
      const current = prev.tiposPublicacion ?? [];
      const algunoSeleccionado = ids.some((id) => current.includes(id));
      const nuevos = algunoSeleccionado
        ? current.filter((id) => !ids.includes(id))
        : [...new Set([...current, ...ids])];

      return {
        ...prev,
        tiposPublicacion: nuevos.length > 0 ? nuevos : undefined,
      };
    });
  };

  const handleFormatoImpresoChange = (valor: boolean) => {
    setFiltros((prev) => ({
      ...prev,
      formatoImpreso: prev.formatoImpreso === valor ? undefined : valor,
    }));
  };

  const handleLimpiar = () => {
    setTituloQuery("");
    setAutorQuery("");
    setRangoAños([añoMin, añoMax]);
    setAñoEspecificoInput("");
    setFiltros({
      titulos: undefined,
      años: undefined,
      autores: undefined,
      tiposPublicacion: undefined,
      indexada: undefined,
      formatoImpreso: undefined,
    });
    // La navegación la hace el useEffect al detectar el cambio de filtros
  };

  const tieneFiltrosActivos =
    (filtros.titulos && filtros.titulos.length > 0) ||
    (filtros.años && filtros.años.length > 0) ||
    (filtros.autores && filtros.autores.length > 0) ||
    (filtros.tiposPublicacion && filtros.tiposPublicacion.length > 0) ||
    filtros.indexada !== undefined ||
    filtros.formatoImpreso !== undefined;

  const nombresTipos = (() => {
    const map = new Map<number, string>();

    for (const s of tiposPublicacion.secciones) {
      for (const item of s.items) map.set(item.id, item.nombre);
    }

    return map;
  })();

  const idsSoloCientificas = (() => {
    const ids = new Set<number>();

    for (const s of tiposPublicacion.secciones) {
      if (s.tipo === "CIENTIFICA" || s.tipo === "TESIS") {
        for (const item of s.items) ids.add(item.id);
      }
    }

    return ids;
  })();

  const esFiltroSoloCientificas =
    filtros.tiposPublicacion &&
    filtros.tiposPublicacion.length > 0 &&
    filtros.tiposPublicacion.length === idsSoloCientificas.size &&
    filtros.tiposPublicacion.every((id) => idsSoloCientificas.has(id));

  return (
    <div className="flex max-h-[80vh] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white lg:sticky lg:top-0 lg:h-screen lg:max-h-screen">
      <div className="filters-panel-scroll flex-1 overflow-y-auto py-4">
        <div className="w-full space-y-6">
          {/* Limpiar - encima de todos los filtros */}
          <div className="flex justify-end px-6">
            <Button
              className="w-auto gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-normal text-gray-700 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50"
              type="button"
              variant="ghost"
              onClick={handleLimpiar}
            >
              <RotateCcw className="h-3.5 w-3.5 shrink-0 text-black" />
              Limpiar
            </Button>
          </div>

          {tieneFiltrosActivos && (
            <div className="space-y-2 px-6">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Filtros activos
              </p>
              <ul className="text-foreground space-y-1 text-sm">
                {filtros.titulos && filtros.titulos.length > 0 && (
                  <li>
                    <span className="text-muted-foreground">Título:</span>{" "}
                    {filtros.titulos.length === 1
                      ? filtros.titulos[0]
                      : `${filtros.titulos.length} títulos seleccionados`}
                  </li>
                )}
                {filtros.años && filtros.años.length > 0 && (
                  <li>
                    <span className="text-muted-foreground">Año(s):</span>{" "}
                    {filtros.años.length <= 3
                      ? filtros.años.join(", ")
                      : `${String(filtros.años[0])}${RANGE_DASH}${String(filtros.años[filtros.años.length - 1])}`}
                  </li>
                )}
                {filtros.autores && filtros.autores.length > 0 && (
                  <li>
                    <span className="text-muted-foreground">Autor:</span>{" "}
                    {filtros.autores.length === 1
                      ? filtros.autores[0]
                      : `${filtros.autores.length} autores seleccionados`}
                  </li>
                )}
                {filtros.tiposPublicacion && filtros.tiposPublicacion.length > 0 && (
                  <li>
                    <span className="text-muted-foreground">Tipo:</span>{" "}
                    {esFiltroSoloCientificas
                      ? "Científica"
                      : filtros.tiposPublicacion.map((id) => nombresTipos.get(id) ?? id).join(", ")}
                  </li>
                )}
                {filtros.indexada === true && (
                  <li>
                    <span className="text-muted-foreground">Indexación:</span> Indexadas
                  </li>
                )}
                {filtros.indexada === false && (
                  <li>
                    <span className="text-muted-foreground">Indexación:</span> No indexadas
                  </li>
                )}
                {filtros.formatoImpreso === true && (
                  <li>
                    <span className="text-muted-foreground">Formato:</span> Impreso
                  </li>
                )}
                {filtros.formatoImpreso === false && (
                  <li>
                    <span className="text-muted-foreground">Formato:</span> Web
                  </li>
                )}
              </ul>
            </div>
          )}
          {/* Filtro de Título */}
          <div className="space-y-2 px-6">
            {filtros.titulos && filtros.titulos.length > 0 && (
              <ul className="flex flex-col gap-1">
                {filtros.titulos.map((t) => (
                  <li
                    key={t}
                    className="flex items-start gap-2 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs"
                  >
                    <span className="flex-1 break-words leading-snug" title={t}>
                      {t}
                    </span>
                    <button
                      aria-label={`Quitar ${t}`}
                      className="mt-0.5 shrink-0 text-gray-500 hover:text-gray-800"
                      type="button"
                      onClick={() => handleQuitarTitulo(t)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <Popover open={tituloOpen} onOpenChange={setTituloOpen}>
              <PopoverTrigger asChild>
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    className="pl-10"
                    placeholder="Título"
                    value={tituloQuery}
                    onChange={(e) => handleTituloChange(e.target.value)}
                    onFocus={() => {
                      if (tituloQuery.length >= 2 && sugerenciasTitulos.length > 0)
                        setTituloOpen(true);
                    }}
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
                        {sugerenciasTitulos.map((titulo) => {
                          const seleccionado = filtros.titulos?.includes(titulo) ?? false;

                          return (
                            <CommandItem
                              key={titulo}
                              className="flex items-start gap-2"
                              value={titulo}
                              onSelect={() => handleToggleTitulo(titulo)}
                            >
                              <span
                                aria-checked={seleccionado}
                                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
                                  seleccionado
                                    ? "border-black bg-black text-white"
                                    : "border-gray-400 bg-white"
                                }`}
                                role="checkbox"
                              >
                                {seleccionado && <Check className="h-3 w-3" strokeWidth={3} />}
                              </span>
                              <span
                                className="flex-1 leading-snug"
                                dangerouslySetInnerHTML={{
                                  __html: titulo.replace(
                                    new RegExp(
                                      `(${tituloQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
                                      "gi",
                                    ),
                                    "<strong>$1</strong>",
                                  ),
                                }}
                              />
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Filtro de Autor */}
          <div className="space-y-2 px-6">
            {filtros.autores && filtros.autores.length > 0 && (
              <ul className="flex flex-col gap-1">
                {filtros.autores.map((a) => (
                  <li
                    key={a}
                    className="flex items-start gap-2 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs"
                  >
                    <span className="flex-1 break-words leading-snug" title={a}>
                      {a}
                    </span>
                    <button
                      aria-label={`Quitar ${a}`}
                      className="mt-0.5 shrink-0 text-gray-500 hover:text-gray-800"
                      type="button"
                      onClick={() => handleQuitarAutor(a)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <Popover open={autorOpen} onOpenChange={setAutorOpen}>
              <PopoverTrigger asChild>
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    className="pl-10"
                    placeholder="Autor"
                    value={autorQuery}
                    onChange={(e) => handleAutorChange(e.target.value)}
                    onFocus={() => {
                      if (autorQuery.length >= 2 && sugerenciasAutores.length > 0)
                        setAutorOpen(true);
                    }}
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
                        {sugerenciasAutores.map((autor) => {
                          const seleccionado = filtros.autores?.includes(autor) ?? false;

                          return (
                            <CommandItem
                              key={autor}
                              className="flex items-start gap-2"
                              value={autor}
                              onSelect={() => handleToggleAutor(autor)}
                            >
                              <span
                                aria-checked={seleccionado}
                                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
                                  seleccionado
                                    ? "border-black bg-black text-white"
                                    : "border-gray-400 bg-white"
                                }`}
                                role="checkbox"
                              >
                                {seleccionado && <Check className="h-3 w-3" strokeWidth={3} />}
                              </span>
                              <span
                                className="flex-1 leading-snug"
                                dangerouslySetInnerHTML={{
                                  __html: autor.replace(
                                    new RegExp(
                                      `(${autorQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
                                      "gi",
                                    ),
                                    "<strong>$1</strong>",
                                  ),
                                }}
                              />
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Filtro de Años */}
          <div className="space-y-2 px-6">
            <div className="flex items-center gap-2">
              <div className="relative min-w-0 flex-1">
                <Search
                  aria-hidden
                  className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
                />
                <Input
                  className="pl-10"
                  id="año-especifico"
                  inputMode="numeric"
                  maxLength={4}
                  minLength={4}
                  pattern="[0-9]*"
                  placeholder="Año"
                  type="text"
                  value={añoEspecificoInput}
                  onBlur={(e) => {
                    const v = e.target.value.trim();

                    if (v) aplicarAñoEspecifico(v);
                  }}
                  onChange={(e) => setAñoEspecificoInput(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const v = (e.target as HTMLInputElement).value.trim();

                      if (v) aplicarAñoEspecifico(v);
                    }
                  }}
                />
              </div>
              <span className="shrink-0" title="Enter para aplicar">
                <CornerDownLeft aria-hidden className="text-muted-foreground h-4 w-4" />
              </span>
            </div>
            <div className="space-y-2 pt-2 [&_[data-slot=slider-range]]:bg-gray-400 [&_[data-slot=slider-track]]:bg-gray-300">
              <Slider
                className="w-full"
                max={añoMax}
                min={añoMin}
                step={1}
                value={rangoAños}
                onValueChange={handleRangoAñosChange}
              />
              <div className="text-muted-foreground flex items-center justify-between text-xs">
                <span>{añoMin}</span>
                <span className="text-foreground font-semibold">
                  {rangoAños[0]} - {rangoAños[1]}
                </span>
                <span>{añoMax}</span>
              </div>
            </div>
          </div>

          {/* Tipo de publicación: despliegue en "Científica", con divisiones */}
          <div className="mt-14">
          {(() => {
            const cientifica = tiposPublicacion.secciones.find((s) => s.tipo === "CIENTIFICA");
            const tesis = tiposPublicacion.secciones.find((s) => s.tipo === "TESIS");
            const divulgacion = tiposPublicacion.secciones.find((s) => s.tipo === "DIVULGACIÓN");
            const otro = tiposPublicacion.secciones.find((s) => s.tipo === "OTRO");
            const sinAsignar = tiposPublicacion.secciones.find((s) => s.tipo === "SIN_ASIGNAR");

            return (
              <>
                <Accordion
                  className="w-full [&>[data-slot=accordion-item]]:border-b"
                  type="multiple"
                >
                  {/* Científica: Indexación + Artículo / Libro científico */}
                  <AccordionItem value="cientifica">
                    <AccordionTrigger className="!items-start px-6 py-3">
                      {cientifica ? (
                        <span className="text-foreground text-sm">
                          {cientifica.titulo} <span className="text-[#f07304]">|</span>{" "}
                          <span className="text-muted-foreground tabular-nums">
                            {cientifica.totalPublicaciones.toLocaleString()}
                          </span>
                        </span>
                      ) : (
                        <span className="text-sm font-medium">Científica</span>
                      )}
                    </AccordionTrigger>
                    <AccordionContent className="px-6">
                      <div className="flex w-full flex-col gap-2 pt-1">
                        <Button
                          className="h-auto min-h-[32px] w-full justify-start rounded-none px-2 py-1 text-left text-sm"
                          size="sm"
                          style={{
                            borderColor: filtros.indexada === true ? undefined : "#e8e8e8",
                            color: filtros.indexada === true ? undefined : "#2d2d2d",
                          }}
                          type="button"
                          variant={filtros.indexada === true ? "default" : "outline"}
                          onClick={() => handleIndexadaChange(true)}
                        >
                          Indexadas
                        </Button>
                        <Button
                          className="h-auto min-h-[32px] w-full justify-start rounded-none px-2 py-1 text-left text-sm"
                          size="sm"
                          style={{
                            borderColor: filtros.indexada === false ? undefined : "#e8e8e8",
                            color: filtros.indexada === false ? undefined : "#2d2d2d",
                          }}
                          type="button"
                          variant={filtros.indexada === false ? "default" : "outline"}
                          onClick={() => handleIndexadaChange(false)}
                        >
                          No indexadas
                        </Button>
                        {cientifica &&
                          (() => {
                            const articuloItem = cientifica.items.find(
                              (i) =>
                                i.nombre.toLowerCase() === "artículo" ||
                                i.nombre.toLowerCase() === "articulo",
                            );
                            const libroCientificoItem = cientifica.items.find(
                              (i) =>
                                i.nombre.toLowerCase().includes("libro científico") ||
                                i.nombre.toLowerCase().includes("libro cientifico"),
                            );
                            const articuloSelected = articuloItem
                              ? filtros.tiposPublicacion?.includes(articuloItem.id)
                              : false;
                            const libroCientificoSelected = libroCientificoItem
                              ? filtros.tiposPublicacion?.includes(libroCientificoItem.id)
                              : false;

                            if (!articuloItem && !libroCientificoItem) return null;

                            return (
                              <div className="mt-4 flex flex-col gap-2 pt-4">
                                {articuloItem && (
                                  <Button
                                    className="h-auto min-h-[32px] w-full justify-start rounded-none px-2 py-1 text-left text-sm"
                                    size="sm"
                                    style={{
                                      borderColor: articuloSelected ? undefined : "#e8e8e8",
                                      color: articuloSelected ? undefined : "#2d2d2d",
                                    }}
                                    type="button"
                                    variant={articuloSelected ? "default" : "outline"}
                                    onClick={() => handleTipoSeccionChange([articuloItem.id])}
                                  >
                                    Artículo
                                  </Button>
                                )}
                                {libroCientificoItem && (
                                  <Button
                                    className="h-auto min-h-[32px] w-full justify-start rounded-none px-2 py-1 text-left text-sm"
                                    size="sm"
                                    style={{
                                      borderColor: libroCientificoSelected ? undefined : "#e8e8e8",
                                      color: libroCientificoSelected ? undefined : "#2d2d2d",
                                    }}
                                    type="button"
                                    variant={libroCientificoSelected ? "default" : "outline"}
                                    onClick={() =>
                                      handleTipoSeccionChange([libroCientificoItem.id])
                                    }
                                  >
                                    Libro científico
                                  </Button>
                                )}
                              </div>
                            );
                          })()}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {divulgacion &&
                    (() => {
                      const libroItem = divulgacion.items.find((i) =>
                        i.nombre.toLowerCase().includes("libro"),
                      );
                      const guiaItem = divulgacion.items.find(
                        (i) =>
                          i.nombre.toLowerCase().includes("guía") ||
                          i.nombre.toLowerCase().includes("guia"),
                      );
                      const libroSelected = libroItem
                        ? filtros.tiposPublicacion?.includes(libroItem.id)
                        : false;
                      const guiaSelected = guiaItem
                        ? filtros.tiposPublicacion?.includes(guiaItem.id)
                        : false;

                      return (
                        <AccordionItem value="divulgacion">
                          <AccordionTrigger className="!items-start px-6 py-3">
                            <span className="text-foreground text-sm">
                              {divulgacion.titulo} <span className="text-[#f07304]">|</span>{" "}
                              <span className="text-muted-foreground tabular-nums">
                                {divulgacion.totalPublicaciones.toLocaleString()}
                              </span>
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="space-y-2 px-6">
                            <div>
                              <div className="flex flex-col gap-2">
                                <Button
                                  className="h-auto min-h-[32px] w-full justify-start rounded-none px-2 py-1 text-left text-sm"
                                  size="sm"
                                  style={{
                                    borderColor:
                                      filtros.formatoImpreso === true ? undefined : "#e8e8e8",
                                    color: filtros.formatoImpreso === true ? undefined : "#2d2d2d",
                                  }}
                                  type="button"
                                  variant={filtros.formatoImpreso === true ? "default" : "outline"}
                                  onClick={() => handleFormatoImpresoChange(true)}
                                >
                                  Impresa
                                </Button>
                                <Button
                                  className="h-auto min-h-[32px] w-full justify-start rounded-none px-2 py-1 text-left text-sm"
                                  size="sm"
                                  style={{
                                    borderColor:
                                      filtros.formatoImpreso === false ? undefined : "#e8e8e8",
                                    color: filtros.formatoImpreso === false ? undefined : "#2d2d2d",
                                  }}
                                  type="button"
                                  variant={filtros.formatoImpreso === false ? "default" : "outline"}
                                  onClick={() => handleFormatoImpresoChange(false)}
                                >
                                  Web
                                </Button>
                              </div>
                            </div>
                            <div className="mt-4 flex flex-col gap-2 pt-4">
                              {libroItem && (
                                <Button
                                  className="h-auto min-h-[32px] w-full justify-start rounded-none px-2 py-1 text-left text-sm"
                                  size="sm"
                                  style={{
                                    borderColor: libroSelected ? undefined : "#e8e8e8",
                                    color: libroSelected ? undefined : "#2d2d2d",
                                  }}
                                  type="button"
                                  variant={libroSelected ? "default" : "outline"}
                                  onClick={() => handleTipoSeccionChange([libroItem.id])}
                                >
                                  Libros
                                </Button>
                              )}
                              {guiaItem && (
                                <Button
                                  className="h-auto min-h-[32px] w-full justify-start rounded-none px-2 py-1 text-left text-sm"
                                  size="sm"
                                  style={{
                                    borderColor: guiaSelected ? undefined : "#e8e8e8",
                                    color: guiaSelected ? undefined : "#2d2d2d",
                                  }}
                                  type="button"
                                  variant={guiaSelected ? "default" : "outline"}
                                  onClick={() => handleTipoSeccionChange([guiaItem.id])}
                                >
                                  Guías
                                </Button>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })()}

                  {tesis &&
                    (() => {
                      const tesisIds: number[] = tesis.items.map((i) => i.id);
                      const tesisSelected = tesisIds.some((id) =>
                        filtros.tiposPublicacion?.includes(id),
                      );

                      return (
                        <AccordionItem value="tesis">
                          <AccordionTrigger className="!items-start px-6 py-3">
                            <span className="text-foreground text-sm">
                              {tesis.titulo} <span className="text-[#f07304]">|</span>{" "}
                              <span className="text-muted-foreground tabular-nums">
                                {tesis.totalPublicaciones.toLocaleString()}
                              </span>
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="px-6">
                            <Button
                              className="h-auto min-h-[32px] w-full justify-start rounded-none px-2 py-1 text-left text-sm"
                              size="sm"
                              style={{
                                borderColor: tesisSelected ? undefined : "#e8e8e8",
                                color: tesisSelected ? undefined : "#2d2d2d",
                              }}
                              type="button"
                              variant={tesisSelected ? "default" : "outline"}
                              onClick={() => handleTipoSeccionChange(tesisIds)}
                            >
                              Tesis
                            </Button>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })()}

                  {otro &&
                    (() => {
                      const otroIds: number[] = otro.items.map((i) => i.id);
                      const otroSelected = otroIds.some((id) =>
                        filtros.tiposPublicacion?.includes(id),
                      );

                      return (
                        <AccordionItem value="otro">
                          <AccordionTrigger className="!items-start px-6 py-3">
                            <span className="text-foreground text-sm">
                              {otro.titulo} <span className="text-[#f07304]">|</span>{" "}
                              <span className="text-muted-foreground tabular-nums">
                                {otro.totalPublicaciones.toLocaleString()}
                              </span>
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="px-6">
                            <Button
                              className="h-auto min-h-[32px] w-full justify-start rounded-none px-2 py-1 text-left text-sm"
                              size="sm"
                              style={{
                                borderColor: otroSelected ? undefined : "#e8e8e8",
                                color: otroSelected ? undefined : "#2d2d2d",
                              }}
                              type="button"
                              variant={otroSelected ? "default" : "outline"}
                              onClick={() => handleTipoSeccionChange(otroIds)}
                            >
                              Otros
                            </Button>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })()}
                </Accordion>

                {sinAsignar && (
                  <div className="border-b px-6 py-3">
                    <p className="text-foreground text-sm">
                      {sinAsignar.titulo} <span className="text-[#f07304]">|</span>{" "}
                      <span className="text-muted-foreground tabular-nums">
                        {sinAsignar.totalPublicaciones.toLocaleString()}
                      </span>
                    </p>
                  </div>
                )}
              </>
            );
          })()}
          </div>
        </div>
      </div>
    </div>
  );
}
