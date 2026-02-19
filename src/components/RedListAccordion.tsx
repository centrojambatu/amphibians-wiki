"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, Search, X, ExternalLink } from "lucide-react";

import { SpeciesListItem } from "@/app/sapopedia/get-all-especies";
import { CatalogOption, FilterCatalogs } from "@/app/sapopedia/get-filter-catalogs";
import type { FiltersState } from "./FiltersPanel";
import FiltersPanel from "./FiltersPanel";
import { processHTMLLinks } from "@/lib/process-html-links";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import ClimaticFloorChart from "./ClimaticFloorChart";
import RedListStatus from "./RedListStatus";

const MESES_ES: string[] = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function formatUltimoAvistamiento(isoDate: string): string {
  const m = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return isoDate;
  const [, year, month, day] = m;
  const monthIdx = parseInt(month, 10) - 1;
  const dayNum = parseInt(day, 10);
  return `${dayNum} ${MESES_ES[monthIdx] ?? month} ${year}`;
}

interface RedListAccordionProps {
  readonly especies: SpeciesListItem[];
  readonly categorias: CatalogOption[];
  readonly activeCategory?: string | null;
  readonly speciesSearchQuery?: string;
  readonly onSpeciesSearchChange?: (query: string) => void;
  readonly filters?: FiltersState;
  readonly onFiltersChange?: (filters: FiltersState) => void;
  readonly filterCatalogs?: FilterCatalogs;
  readonly especiesFull?: SpeciesListItem[];
}

export default function RedListAccordion({
  especies,
  categorias,
  activeCategory,
  speciesSearchQuery: controlledSearchQuery,
  onSpeciesSearchChange,
  filters,
  onFiltersChange,
  filterCatalogs,
  especiesFull,
}: RedListAccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const categoryRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const searchQuery =
    onSpeciesSearchChange != null && controlledSearchQuery !== undefined
      ? controlledSearchQuery
      : internalSearchQuery;
  const setSearchQuery =
    onSpeciesSearchChange != null ? onSpeciesSearchChange : setInternalSearchQuery;
  const hasSearchFromParent = onSpeciesSearchChange != null;

  // Función para normalizar texto (quitar acentos y convertir a minúsculas)
  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  // Filtrar especies por nombre común o científico
  const filterSpecies = (speciesList: SpeciesListItem[]) => {
    if (!searchQuery.trim()) return speciesList;

    const normalizedQuery = normalizeText(searchQuery);
    return speciesList.filter((species) => {
      const nombreCientifico = normalizeText(species.nombre_cientifico || "");
      const nombreComun = normalizeText(species.nombre_comun || "");
      return nombreCientifico.includes(normalizedQuery) || nombreComun.includes(normalizedQuery);
    });
  };

  // Cargar el estado del acordeón desde localStorage al montar
  useEffect(() => {
    const savedState = localStorage.getItem("redListAccordionOpenItems");

    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState) as string[];

        setOpenItems(new Set(parsedState));
      } catch (error) {
        console.error("Error al cargar el estado del acordeón:", error);
      }
    }
  }, []);

  // Guardar el estado del acordeón en localStorage cuando cambia
  useEffect(() => {
    if (openItems.size > 0) {
      localStorage.setItem("redListAccordionOpenItems", JSON.stringify(Array.from(openItems)));
    } else {
      localStorage.removeItem("redListAccordionOpenItems");
    }
  }, [openItems]);

  // Categorías amenazadas y no amenazadas (para mapear click de cards a primera categoría del grupo)
  const categoriasAmenazadasIds = ["PE", "CR", "EN", "VU"];
  const categoriasNoAmenazadasIds = ["NT", "LC"];

  // Abrir y hacer scroll cuando cambia activeCategory
  useEffect(() => {
    if (activeCategory) {
      let idsToOpen: Set<string>;

      // Cards Amenazadas: abrir todos los acordeones del grupo (PE, CR, EN, VU)
      if (activeCategory === "AMENAZADAS") {
        const ids = categorias
          .filter(
            (c) =>
              categoriasAmenazadasIds.includes(c.sigla ?? "") || isPE(c.sigla ?? ""),
          )
          .map((c) => `categoria-${c.sigla}`);
        idsToOpen = new Set(ids);
      } else if (activeCategory === "NO_AMENAZADAS") {
        // Card No amenazadas: abrir todos los acordeones del grupo (NT, LC)
        const ids = categorias
          .filter((c) => categoriasNoAmenazadasIds.includes(c.sigla ?? ""))
          .map((c) => `categoria-${c.sigla}`);
        idsToOpen = new Set(ids);
      } else if (activeCategory === "PE") {
        const peCategoria = categorias.find(
          (c) =>
            c.sigla?.includes("PE") || c.nombre?.toLowerCase().includes("extinta"),
        );
        idsToOpen = new Set([`categoria-${peCategoria?.sigla || "CR (PE)"}`]);
      } else {
        idsToOpen = new Set([`categoria-${activeCategory}`]);
      }

      setOpenItems(idsToOpen);

      // Scroll al primer acordeón abierto del grupo
      const firstId = idsToOpen.values().next().value as string | undefined;
      if (firstId) {
        setTimeout(() => {
          const element = categoryRefs.current.get(firstId);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 100);
      }
    }
  }, [activeCategory, categorias]);

  const toggleItem = (itemId: string) => {
    const newOpenItems = new Set(openItems);

    if (newOpenItems.has(itemId)) {
      newOpenItems.delete(itemId);
    } else {
      newOpenItems.add(itemId);
    }
    setOpenItems(newOpenItems);
  };

  const isOpen = (itemId: string) => openItems.has(itemId);

  // Función helper para detectar si es PE
  const isPE = (sigla: string | null) => {
    if (!sigla) return false;

    return sigla === "PE" || sigla.includes("PE") || sigla.includes("Posiblemente extinta");
  };

  // Categorías amenazadas y no amenazadas
  const categoriasAmenazadas = ["PE", "CR", "EN", "VU"];
  const categoriasNoAmenazadas = ["NT", "LC"];

  // Especies amenazadas (PE, CR, EN, VU)
  const especiesAmenazadas = especies.filter((e) => {
    const sigla = e.lista_roja_iucn;
    if (!sigla) return false;
    if (isPE(sigla)) return true;
    return categoriasAmenazadas.includes(sigla);
  });

  // Especies no amenazadas (NT, LC)
  const especiesNoAmenazadas = especies.filter((e) => {
    const sigla = e.lista_roja_iucn;
    if (!sigla) return false;
    return categoriasNoAmenazadas.includes(sigla);
  });

  // Agrupar especies por categoría de lista roja (con filtro aplicado)
  const especiesPorCategoria = categorias
    .map((categoria) => {
      const especiesEnCategoria = especies.filter((e) => e.lista_roja_iucn === categoria.sigla);
      // Aplicar filtro de búsqueda
      const especiesFiltradas = filterSpecies(especiesEnCategoria);

      return {
        categoria,
        especies: especiesFiltradas,
        totalSinFiltro: especiesEnCategoria.length,
      };
    })
    .filter((grupo) => grupo.especies.length > 0 || (searchQuery && grupo.totalSinFiltro > 0))
    .sort((a, b) => {
      // Ordenar por orden de importancia de las categorías
      // PE (Posiblemente extinta) debe ser la primera, siempre
      const siglaA = a.categoria.sigla || "";
      const siglaB = b.categoria.sigla || "";

      // PE siempre primero
      if (isPE(siglaA) && !isPE(siglaB)) return -1;
      if (!isPE(siglaA) && isPE(siglaB)) return 1;

      const orden = ["CR", "EN", "VU", "NT", "LC", "DD", "EW", "EX"];

      const indexA = orden.indexOf(siglaA);
      const indexB = orden.indexOf(siglaB);

      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;

      return indexA - indexB;
    });

  const renderSpecies = (species: SpeciesListItem, showUltimoAvistamiento = false) => (
    <div
      key={species.id_taxon}
      className={`border-border bg-card hover:border-border hover:bg-muted/50 relative grid w-full min-w-0 items-center gap-4 rounded-md border pl-4 pr-0 py-3 transition-all ${showUltimoAvistamiento ? "grid-cols-[minmax(0,1fr)_11rem_9rem_3rem_4rem_20rem]" : "grid-cols-[minmax(0,1fr)_9rem_3rem_4rem_20rem]"}`}
    >
      {/* Nombre científico */}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Link
            className="text-foreground text-sm font-medium italic hover:underline"
            href={`/sapopedia/species/${species.nombre_cientifico.replace(/ /g, "-")}`}
          >
            {species.nombre_cientifico}
          </Link>
          {species.descubridor && (
            <span
              dangerouslySetInnerHTML={{
                __html: processHTMLLinks(species.descubridor),
              }}
              className="text-xs text-gray-500"
            />
          )}
        </div>
        {(species.nombre_comun || species.nombre_comun_ingles) && (
          <div className="text-muted-foreground mt-1 text-xs">
            {species.nombre_comun}
            {species.nombre_comun && species.nombre_comun_ingles && (
              <span className="text-[#f07304]"> | </span>
            )}
            {species.nombre_comun_ingles}
          </div>
        )}
      </div>

      {/* Último avistamiento (solo categoría Posiblemente extinta) */}
      {showUltimoAvistamiento && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-muted-foreground min-w-0 cursor-help text-center text-xs">
                {species.ultimo_avistamiento
                  ? formatUltimoAvistamiento(species.ultimo_avistamiento)
                  : "—"}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-white font-normal">Último avistamiento</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Distribución (área km²) — por ahora valor de prueba hasta cargar de base */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="text-muted-foreground min-w-0 cursor-help text-center text-xs">
              240000 km²
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Área de distribución</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Endémica */}
      <div className="w-12 text-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={`cursor-help text-sm font-semibold ${species.endemica ? "text-gray-800" : "text-gray-500"}`}
              >
                {species.endemica ? "E" : "NE"}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{species.endemica ? "Endémica" : "No endémica"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Lista Roja */}
      <div className="w-16 text-center">
        {species.lista_roja_iucn ? (
          <>
            {isPE(species.lista_roja_iucn) ? (
              <div
                className="inline-flex items-center justify-center text-[11px] font-semibold"
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
            ) : (
              (() => {
                // Normalizar el valor: trim y uppercase
                const valorNormalizado = species.lista_roja_iucn.trim().toUpperCase();
                // Lista de valores válidos
                const valoresValidos: readonly string[] = [
                  "LC",
                  "NT",
                  "VU",
                  "EN",
                  "CR",
                  "EW",
                  "EX",
                  "DD",
                ];

                // Verificar si el valor está en la lista de válidos
                if (valoresValidos.includes(valorNormalizado)) {
                  return (
                    <RedListStatus
                      showTooltip={false}
                      status={
                        valorNormalizado as "LC" | "NT" | "VU" | "EN" | "CR" | "EW" | "EX" | "DD"
                      }
                    />
                  );
                }

                // Si no es válido, mostrar warning y badge con "?"
                console.warn(
                  `⚠️ Valor de lista roja no válido: "${species.lista_roja_iucn}" (normalizado: "${valorNormalizado}") para especie ${species.nombre_cientifico}`,
                );

                return (
                  <div
                    className="inline-flex items-center justify-center text-[11px] font-semibold"
                    style={{
                      backgroundColor: "#d1d1c6",
                      color: "#666666",
                      borderRadius: "100% 0% 100% 100%",
                      width: "36px",
                      height: "36px",
                      padding: "4px 9px",
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.15)",
                    }}
                  >
                    ?
                  </div>
                );
              })()
            )}
          </>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </div>

      {/* Pisos Climáticos */}
      <div className="flex min-w-0 items-center justify-end">
        {species.rango_altitudinal_min !== null && species.rango_altitudinal_max !== null ? (
          <ClimaticFloorChart
            altitudinalRange={{
              min: species.rango_altitudinal_min,
              max: species.rango_altitudinal_max,
              occidente: species.has_distribucion_occidental
                ? {
                  min: species.rango_altitudinal_min,
                  max: species.rango_altitudinal_max,
                }
                : undefined,
              oriente: species.has_distribucion_oriental
                ? {
                  min: species.rango_altitudinal_min,
                  max: species.rango_altitudinal_max,
                }
                : undefined,
            }}
          />
        ) : (
          <span className="text-xs text-gray-400">Sin datos</span>
        )}
      </div>
    </div>
  );

  const renderCategoria = (grupo: { categoria: CatalogOption; especies: SpeciesListItem[]; totalSinFiltro?: number }) => {
    const categoriaId = `categoria-${grupo.categoria.sigla || grupo.categoria.id}`;
    const especiesEndemicas = grupo.especies.filter((e) => e.endemica).length;
    const hayFiltroActivo = searchQuery.trim().length > 0;

    return (
      <div
        key={categoriaId}
        ref={(el) => {
          if (el) categoryRefs.current.set(categoriaId, el);
        }}
        className="relative w-full"
      >
        <div
          className="border-border bg-card relative flex w-full cursor-pointer items-center justify-between rounded-md border px-4 py-3"
          role="button"
          tabIndex={0}
          onClick={() => toggleItem(categoriaId)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggleItem(categoriaId);
            }
          }}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-foreground text-sm font-semibold">
                {grupo.categoria.nombre}
              </span>
              {hayFiltroActivo && grupo.totalSinFiltro && grupo.totalSinFiltro !== grupo.especies.length && (
                <span className="text-xs text-gray-400">
                  ({grupo.especies.length} de {grupo.totalSinFiltro})
                </span>
              )}
            </div>
            <p className="text-muted-foreground text-xs">
              {grupo.especies.length} especie
              {grupo.especies.length !== 1 ? "s" : ""}{" "}
              <span className="text-[#f07304]">|</span> {especiesEndemicas} endémica
              {especiesEndemicas !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Icono de barras */}
          <div className="ml-3 flex-shrink-0 text-gray-300">
            <Menu className="h-4 w-4" />
          </div>
        </div>

        {isOpen(categoriaId) && (
          <div className="mt-3 w-full rounded-lg pt-4 pb-4 pl-4 pr-0">
            {/* pr-0 para alinear borde derecho de las cards hijas con el card padre */}
            {grupo.especies.length > 0 ? (
              <>
                {/* Lista de especies */}
                <div className="w-full space-y-2">
                  {grupo.especies.map((species) =>
                    renderSpecies(species, isPE(grupo.categoria.sigla ?? null))
                  )}
                </div>
              </>
            ) : (
              <p className="text-center text-sm text-gray-500 py-4">
                No se encontraron especies con el filtro actual
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  // Renderizar grupo especial (amenazadas/no amenazadas)
  const renderGrupoEspecial = (
    id: string,
    nombre: string,
    especiesGrupo: SpeciesListItem[]
  ) => {
    const categoriaId = `categoria-${id}`;
    const especiesEndemicas = especiesGrupo.filter((e) => e.endemica).length;

    return (
      <div
        key={categoriaId}
        ref={(el) => {
          if (el) categoryRefs.current.set(categoriaId, el);
        }}
        className="relative w-full"
      >
        <div
          className="border-border bg-card relative flex w-full cursor-pointer items-center justify-between rounded-md border px-4 py-3"
          role="button"
          tabIndex={0}
          onClick={() => toggleItem(categoriaId)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggleItem(categoriaId);
            }
          }}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-foreground text-sm font-semibold">
                {nombre}
              </span>
            </div>
            <p className="text-muted-foreground text-xs">
              {especiesGrupo.length} especie
              {especiesGrupo.length !== 1 ? "s" : ""} ({especiesEndemicas} endémica
              {especiesEndemicas !== 1 ? "s" : ""})
            </p>
          </div>

          {/* Icono de barras */}
          <div className="ml-3 flex-shrink-0 text-gray-300">
            <Menu className="h-4 w-4" />
          </div>
        </div>

        {isOpen(categoriaId) && (
          <div className="bg-muted mt-3 w-full rounded-lg pt-4 pb-4 pl-4 pr-0">
            {/* pr-0 para alinear borde derecho de las cards hijas con el card padre */}
            {/* Header de la tabla */}
            <div className="mb-3 py-2">
              <div className="text-muted-foreground mb-2 text-xs">Especies</div>
              <div className="text-muted-foreground grid grid-cols-[minmax(0,1fr)_9rem_3rem_4rem_20rem] items-center gap-4 text-xs">
                <div>Nombre</div>
                <div />
                <div className="text-center">En</div>
                <div className="text-center">LR</div>
                <div className="text-center">Distribución</div>
              </div>
            </div>
            {/* Lista de especies */}
            <div className="w-full space-y-2">
              {especiesGrupo.map((species) => renderSpecies(species))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (especiesPorCategoria.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <p className="text-gray-500">No hay especies con categoría de Lista Roja asignada.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Panel izquierdo al lado del acordeón: búsqueda por especie + enlaces (Lista Roja) o solo búsqueda (sin filterCatalogs) */}
      {hasSearchFromParent ? (
        <div className="w-full lg:w-80 lg:flex-shrink-0">
          <div className="lg:sticky lg:top-4">
            <Card className="overflow-x-hidden">
              <CardContent className="pt-2 space-y-6">
                {filterCatalogs && filters != null && onFiltersChange ? (
                  <div className="min-h-0 -mx-6 w-[calc(100%+3rem)]">
                    <FiltersPanel
                      especies={especiesFull ?? especies}
                      catalogs={filterCatalogs}
                      onFiltersChange={onFiltersChange}
                      excludeFilters={["pluviocidad", "temperatura", "listaRoja"]}
                      filters={filters}
                      embedded
                      searchQuery={searchQuery}
                      onSearchQueryChange={setSearchQuery}
                    />
                  </div>
                ) : (
                  <div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Nombre científico o común"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-10"
                      />
                      {searchQuery && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                          onClick={() => setSearchQuery("")}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {searchQuery && (
                      <p className="mt-2 text-xs text-gray-500">
                        Filtrando: &quot;{searchQuery}&quot;
                      </p>
                    )}
                  </div>
                )}
                <div />
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="flex-shrink-0 lg:hidden">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Nombre científico o común"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {searchQuery && (
            <p className="mt-2 text-xs text-gray-500">
              Filtrando: &quot;{searchQuery}&quot;
            </p>
          )}
        </div>
      )}

      {/* Acordeones */}
      <div className="flex min-w-0 flex-1 flex-col space-y-3">
        {especiesPorCategoria.map((grupo) => renderCategoria(grupo))}
      </div>
    </div>
  );
}
