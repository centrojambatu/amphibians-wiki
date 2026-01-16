"use client";

import {useState, useEffect} from "react";
import Link from "next/link";
import {Menu} from "lucide-react";

import {SpeciesListItem} from "@/app/sapopedia/get-all-especies";
import {CatalogOption} from "@/app/sapopedia/get-filter-catalogs";
import {processHTMLLinks} from "@/lib/process-html-links";

import ClimaticFloorChart from "./ClimaticFloorChart";
import RedListStatus from "./RedListStatus";

interface RedListAccordionProps {
  readonly especies: SpeciesListItem[];
  readonly categorias: CatalogOption[];
}

export default function RedListAccordion({especies, categorias}: RedListAccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

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

  // Agrupar especies por categoría de lista roja
  const especiesPorCategoria = categorias
    .map((categoria) => {
      const especiesEnCategoria = especies.filter((e) => e.lista_roja_iucn === categoria.sigla);

      return {
        categoria,
        especies: especiesEnCategoria,
      };
    })
    .filter((grupo) => grupo.especies.length > 0)
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

  const renderCategoria = (grupo: {categoria: CatalogOption; especies: SpeciesListItem[]}) => {
    const categoriaId = `categoria-${grupo.categoria.sigla || grupo.categoria.id}`;
    const especiesEndemicas = grupo.especies.filter((e) => e.endemica).length;

    return (
      <div key={categoriaId} className="relative">
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
    <div className="space-y-3">{especiesPorCategoria.map((grupo) => renderCategoria(grupo))}</div>
  );
}
