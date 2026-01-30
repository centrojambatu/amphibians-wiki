"use client";

import {useState, useEffect, useRef} from "react";
import Link from "next/link";
import {Menu, Search, X, ExternalLink} from "lucide-react";

import {SpeciesListItem} from "@/app/sapopedia/get-all-especies";
import {CatalogOption} from "@/app/sapopedia/get-filter-catalogs";
import {processHTMLLinks} from "@/lib/process-html-links";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";

import ClimaticFloorChart from "./ClimaticFloorChart";
import RedListStatus from "./RedListStatus";

interface RedListAccordionProps {
  readonly especies: SpeciesListItem[];
  readonly categorias: CatalogOption[];
  readonly activeCategory?: string | null;
}

export default function RedListAccordion({especies, categorias, activeCategory}: RedListAccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const categoryRefs = useRef<Map<string, HTMLDivElement>>(new Map());

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

  // Abrir y hacer scroll cuando cambia activeCategory
  useEffect(() => {
    if (activeCategory) {
      let categoryId: string;

      // Manejar grupos especiales
      if (activeCategory === "AMENAZADAS") {
        categoryId = "categoria-amenazadas";
      } else if (activeCategory === "NO_AMENAZADAS") {
        categoryId = "categoria-no-amenazadas";
      } else if (activeCategory === "PE") {
        // Buscar la categoría que contenga PE
        const peCategoria = categorias.find((c) =>
          c.sigla?.includes("PE") || c.nombre?.toLowerCase().includes("extinta")
        );
        categoryId = `categoria-${peCategoria?.sigla || "CR (PE)"}`;
      } else {
        categoryId = `categoria-${activeCategory}`;
      }

      // Abrir solo este acordeón (cerrar los demás)
      setOpenItems(new Set([categoryId]));

      // Hacer scroll al elemento
      setTimeout(() => {
        const element = categoryRefs.current.get(categoryId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
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

  const renderSpecies = (species: SpeciesListItem) => (
    <div
      key={species.id_taxon}
      className="border-border bg-card hover:border-border hover:bg-muted/50 relative flex items-center gap-4 rounded-md border px-4 py-3 transition-all"
    >
      {/* Nombre científico */}
      <div className="min-w-0 flex-1">
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
        {species.nombre_comun && (
          <div className="text-muted-foreground mt-1 text-xs">{species.nombre_comun}</div>
        )}
      </div>

      {/* Endémica */}
      <div className="w-12 text-center">
        {species.endemica ? (
          <span className="text-sm font-semibold text-gray-800">E</span>
        ) : (
          <span className="text-sm font-semibold text-gray-500">NE</span>
        )}
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
      <div className="flex w-80 items-center justify-center">
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

  const renderCategoria = (grupo: {categoria: CatalogOption; especies: SpeciesListItem[]; totalSinFiltro?: number}) => {
    const categoriaId = `categoria-${grupo.categoria.sigla || grupo.categoria.id}`;
    const especiesEndemicas = grupo.especies.filter((e) => e.endemica).length;
    const hayFiltroActivo = searchQuery.trim().length > 0;

    return (
      <div
        key={categoriaId}
        ref={(el) => {
          if (el) categoryRefs.current.set(categoriaId, el);
        }}
        className="relative"
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
              {grupo.especies.length !== 1 ? "s" : ""} ({especiesEndemicas} endémica
              {especiesEndemicas !== 1 ? "s" : ""})
            </p>
          </div>

          {/* Icono de barras */}
          <div className="ml-3 flex-shrink-0 text-gray-300">
            <Menu className="h-4 w-4" />
          </div>
        </div>

        {isOpen(categoriaId) && (
          <div className="bg-muted mt-3 rounded-lg p-4">
            {grupo.especies.length > 0 ? (
              <>
                {/* Header de la tabla */}
                <div className="mb-3 px-4 py-2">
                  <div className="text-muted-foreground mb-2 text-xs">Especies</div>
                  <div className="text-muted-foreground flex items-center gap-4 text-xs">
                    <div className="flex-1">Nombre</div>
                    <div className="w-12 text-center">En</div>
                    <div className="w-16 text-center">LR</div>
                    <div className="w-80 text-center">Distribución</div>
                  </div>
                </div>
                {/* Lista de especies */}
                <div className="space-y-2">
                  {grupo.especies.map((species) => renderSpecies(species))}
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
        className="relative"
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
          <div className="bg-muted mt-3 rounded-lg p-4">
            {/* Header de la tabla */}
            <div className="mb-3 px-4 py-2">
              <div className="text-muted-foreground mb-2 text-xs">Especies</div>
              <div className="text-muted-foreground flex items-center gap-4 text-xs">
                <div className="flex-1">Nombre</div>
                <div className="w-12 text-center">En</div>
                <div className="w-16 text-center">LR</div>
                <div className="w-80 text-center">Distribución</div>
              </div>
            </div>
            {/* Lista de especies */}
            <div className="space-y-2">
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
      {/* Panel izquierdo - Filtro y enlaces */}
      <div className="w-full lg:w-80 lg:flex-shrink-0">
        <div className="lg:sticky lg:top-4">
          <Card>
            <CardContent className="pt-4 space-y-6">
              {/* Filtro de búsqueda */}
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

              {/* Separador */}
              <div className="border-t" />

              {/* Enlaces directos */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-700">Enlaces de interés</h3>
                <div className="space-y-2">
                  <a
                    href="https://www.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Lista Roja IUCN
                  </a>
                  <a
                    href="https://www.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Libro Rojo Ecuador
                  </a>
                  <a
                    href="https://www.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    AmphibiaWeb
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Panel derecho - Acordeones */}
      <div className="flex-1 space-y-3">
        {/* Categorías individuales */}
        {especiesPorCategoria.map((grupo) => renderCategoria(grupo))}

        {/* Grupos especiales (al final, con separación) - Sin filtro */}
        {(especiesAmenazadas.length > 0 || especiesNoAmenazadas.length > 0) && (
          <div className="mt-8 space-y-3 pt-6">
            {especiesAmenazadas.length > 0 && renderGrupoEspecial("amenazadas", "Especies Amenazadas", especiesAmenazadas)}
            {especiesNoAmenazadas.length > 0 && renderGrupoEspecial("no-amenazadas", "Especies No Amenazadas", especiesNoAmenazadas)}
          </div>
        )}
      </div>
    </div>
  );
}
