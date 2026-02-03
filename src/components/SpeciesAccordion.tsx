"use client";

import {useState, useEffect} from "react";
import Link from "next/link";
import {Menu} from "lucide-react";

import {OrderGroup, FamilyGroup, GenusGroup, SpeciesData} from "@/types/taxonomy";
import {processHTMLLinks} from "@/lib/process-html-links";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";

import ClimaticFloorChart from "./ClimaticFloorChart";
import RedListStatus from "./RedListStatus";
import InterpretationGuide from "./InterpretationGuide";

interface SpeciesAccordionProps {
  readonly orders: OrderGroup[];
}

export default function SpeciesAccordion({orders}: SpeciesAccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [showGuide, setShowGuide] = useState(false);

  // Cargar el estado del acordeón desde localStorage al montar
  useEffect(() => {
    const savedState = localStorage.getItem("accordionOpenItems");

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
      localStorage.setItem("accordionOpenItems", JSON.stringify(Array.from(openItems)));
    } else {
      localStorage.removeItem("accordionOpenItems");
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

  const renderSpecies = (species: SpeciesData) => (
    <div
      key={species.id_taxon}
      className="border-border bg-card hover:border-border hover:bg-muted/50 relative grid grid-cols-[minmax(0,1fr)_3rem_4rem_20rem] items-center gap-4 rounded-md border px-4 py-3 transition-all"
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
        {species.nombre_comun && (
          <div className="text-muted-foreground mt-1 text-xs">{species.nombre_comun}</div>
        )}
      </div>

      {/* Endémica */}
      <div className="flex justify-center">
        {species.endemica ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-sm font-semibold text-gray-800 cursor-help">E</span>
              </TooltipTrigger>
              <TooltipContent className="[&>*:last-child]:hidden">
                <p className="text-white font-normal">Endémica</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-sm font-semibold text-gray-500 cursor-help">NE</span>
              </TooltipTrigger>
              <TooltipContent className="[&>*:last-child]:hidden">
                <p className="text-white font-normal">No endémica</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Lista Roja */}
      <div className="flex justify-center">
        {species.lista_roja_iucn ? (
          <>
            {isPE(species.lista_roja_iucn) ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="inline-flex cursor-pointer items-center justify-center text-[11px] font-semibold"
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
                  <TooltipContent className="[&>*:last-child]:hidden">
                    <p className="text-white font-normal">Posiblemente extinta</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
                      showTooltip={true}
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
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className="inline-flex cursor-pointer items-center justify-center text-[11px] font-semibold"
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
                      </TooltipTrigger>
                      <TooltipContent className="[&>*:last-child]:hidden">
                        <p className="text-white font-normal">Valor de lista roja no válido</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })()
            )}
          </>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </div>

      {/* Pisos Climáticos — alineado a la derecha para unificar borde con el resto de cards */}
      <div className="flex items-center justify-end min-w-0">
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

  const renderGenus = (genus: GenusGroup) => (
    <div key={genus.id} className="relative">
      <div
        className="border-border bg-card relative flex w-full cursor-pointer items-center justify-between rounded-md border px-4 py-3"
        role="button"
        tabIndex={0}
        onClick={() => toggleItem(`genus-${genus.id}`)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleItem(`genus-${genus.id}`);
          }
        }}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-foreground text-sm italic">{genus.name}</span>
            {genus.nombre_comun && (
              <span className="text-muted-foreground text-xs">{genus.nombre_comun}</span>
            )}
          </div>
          <p className="text-xs text-gray-400">
            {genus.summary.totalSpecies} especie
            {genus.summary.totalSpecies !== 1 ? "s" : ""} ({genus.summary.endemicSpecies} endémica
            {genus.summary.endemicSpecies !== 1 ? "s" : ""}, {genus.summary.redListSpecies} en Lista
            Roja)
          </p>
        </div>

        {/* Icono de barras */}
        <div className="text-muted-foreground ml-3 flex-shrink-0">
          <Menu className="h-4 w-4" />
        </div>
      </div>

      {isOpen(`genus-${genus.id}`) && (
        <div className="mt-3 rounded-lg pt-4 pb-4 pl-4 pr-0">
          {/* Lista de especies — pr-0 para alinear borde derecho con el resto de cards */}
          <div className="space-y-2 pl-6">{genus.species.map((species) => renderSpecies(species))}</div>
        </div>
      )}
    </div>
  );

  const renderFamily = (family: FamilyGroup) => (
    <div key={family.id} className="relative">
      <div
        className="border-border bg-card relative flex w-full cursor-pointer items-center justify-between rounded-md border px-4 py-3"
        role="button"
        tabIndex={0}
        onClick={() => toggleItem(`family-${family.id}`)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleItem(`family-${family.id}`);
          }
        }}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{family.name}</span>
          </div>
          <p className="text-xs text-gray-400">
            {family.summary.totalSpecies} especies | {family.summary.totalGenera} géneros (
            {family.summary.endemicSpecies} endémicas, {family.summary.redListSpecies} en Lista
            Roja)
          </p>
        </div>

        {/* Icono de barras */}
        <div className="text-muted-foreground ml-3 flex-shrink-0">
          <Menu className="h-4 w-4" />
        </div>
      </div>

      {isOpen(`family-${family.id}`) && (
        <div className="mt-3 rounded-lg pt-4 pb-4 pl-4 pr-0">
          {/* Lista de géneros — pr-0 para alinear borde derecho con el resto de cards */}
          <div className="space-y-2 pl-6">{family.genera.map((genus) => renderGenus(genus))}</div>
        </div>
      )}
    </div>
  );

  const renderOrder = (order: OrderGroup) => (
    <div key={order.id} className="relative mb-4">
      <div
        className="border-border bg-card relative flex w-full cursor-pointer items-center justify-between rounded-md border px-4 py-3"
        role="button"
        tabIndex={0}
        onClick={() => toggleItem(`order-${order.id}`)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleItem(`order-${order.id}`);
          }
        }}
      >
        <div className="flex-1">
          <span className="inline-block text-sm text-gray-600">{order.name}</span>
          <p className="text-xs text-gray-400">
            {order.summary.totalSpecies} especies, {order.summary.totalFamilies} familias (
            {order.summary.endemicSpecies} endémicas, {order.summary.redListSpecies} en Lista Roja)
          </p>
        </div>

        {/* Icono de barras */}
        <div className="text-muted-foreground ml-3 flex-shrink-0">
          <Menu className="h-4 w-4" />
        </div>
      </div>

      {isOpen(`order-${order.id}`) && (
        <div className="mt-3 rounded-lg pt-4 pb-4 pl-4 pr-0">
          {/* Lista de familias — pr-0 para que el borde derecho de las cards coincida con el de orden */}
          <div className="space-y-3 pl-6">{order.families.map((family) => renderFamily(family))}</div>
        </div>
      )}
    </div>
  );

  return (
    <div className="relative w-full">
      {/* Header de órdenes */}

      <div className="space-y-4">{orders.map((order) => renderOrder(order))}</div>

      {/* Modal de Guía de Interpretación */}
      <InterpretationGuide isOpen={showGuide} onClose={() => setShowGuide(false)} />
    </div>
  );
}
