"use client";

import {useState, useEffect} from "react";
import Link from "next/link";
import {Menu} from "lucide-react";

import {OrderGroup, FamilyGroup, GenusGroup, SpeciesData} from "@/types/taxonomy";
import {processHTMLLinks} from "@/lib/process-html-links";

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
      className="relative flex items-center gap-4 rounded-md border border-border bg-card px-4 py-3 transition-all hover:border-border hover:bg-muted/50"
    >
      {/* Nombre científico */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link
            className="text-sm font-medium text-foreground italic hover:underline"
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
          <div className="mt-1 text-xs text-muted-foreground">{species.nombre_comun}</div>
        )}
      </div>

      {/* Endémica */}
      <div className="w-12 text-center">
        {species.endemica ? (
          <span className="text-lg text-gray-800">✓</span>
        ) : (
          <span className="text-lg text-gray-400">-</span>
        )}
      </div>

      {/* Lista Roja */}
      <div className="w-16 text-center">
        {species.lista_roja_iucn ? (
          <>
            {isPE(species.lista_roja_iucn) ? (
              <div
                className="inline-flex items-center justify-center px-2 py-1 text-[10px] font-semibold"
                style={{
                  backgroundColor: "#b71c1c",
                  color: "#ffffff",
                  borderRadius: "100% 0% 100% 100%",
                  minWidth: "32px",
                  minHeight: "32px",
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
                    className="inline-flex items-center justify-center px-2 py-1 text-[10px] font-semibold"
                    style={{
                      backgroundColor: "#d1d1c6",
                      color: "#666666",
                      borderRadius: "100% 0% 100% 100%",
                      minWidth: "32px",
                      minHeight: "32px",
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

  const renderGenus = (genus: GenusGroup) => (
    <div key={genus.id} className="relative">
      <div
        className="relative flex w-full cursor-pointer items-center justify-between rounded-md border border-border bg-card px-4 py-3"
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
            <span className="text-sm text-foreground italic">{genus.name}</span>
            {genus.nombre_comun && (
              <span className="text-xs text-muted-foreground">{genus.nombre_comun}</span>
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
        <div className="ml-3 flex-shrink-0 text-muted-foreground">
          <Menu className="h-4 w-4" />
        </div>
      </div>

      {isOpen(`genus-${genus.id}`) && (
        <div className="mt-3 rounded-lg bg-muted p-4">
          {/* Header de la tabla */}
          <div className="mb-3 px-4 py-2">
            <div className="mb-2 text-xs text-muted-foreground">Especies</div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex-1">Nombre</div>
              <div className="w-12 text-center">En</div>
              <div className="w-16 text-center">LR</div>
              <div className="w-80 text-center">Distribución</div>
            </div>
          </div>
          {/* Lista de especies */}
          <div className="space-y-2">{genus.species.map((species) => renderSpecies(species))}</div>
        </div>
      )}
    </div>
  );

  const renderFamily = (family: FamilyGroup) => (
    <div key={family.id} className="relative">
      <div
        className="relative flex w-full cursor-pointer items-center justify-between rounded-md border border-border bg-card px-4 py-3"
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
            {family.summary.totalSpecies} especies, {family.summary.totalGenera} géneros (
            {family.summary.endemicSpecies} endémicas, {family.summary.redListSpecies} en Lista
            Roja)
          </p>
        </div>

        {/* Icono de barras */}
        <div className="ml-3 flex-shrink-0 text-muted-foreground">
          <Menu className="h-4 w-4" />
        </div>
      </div>

      {isOpen(`family-${family.id}`) && (
        <div className="mt-3 rounded-lg bg-muted p-4">
          {/* Header de géneros */}
          <div className="mb-3 px-4 py-2">
            <div className="text-xs text-muted-foreground">Géneros</div>
          </div>
          {/* Lista de géneros */}
          <div className="space-y-2">{family.genera.map((genus) => renderGenus(genus))}</div>
        </div>
      )}
    </div>
  );

  const renderOrder = (order: OrderGroup) => (
    <div key={order.id} className="relative mb-4">
      <div
        className="relative flex w-full cursor-pointer items-center justify-between rounded-md border border-border bg-card px-4 py-3"
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
        <div className="ml-3 flex-shrink-0 text-muted-foreground">
          <Menu className="h-4 w-4" />
        </div>
      </div>

      {isOpen(`order-${order.id}`) && (
        <div className="mt-3 rounded-lg bg-muted p-4">
          {/* Header de familias */}
          <div className="mb-3 px-4 py-2">
            <div className="text-xs text-gray-400">Familias</div>
          </div>
          {/* Lista de familias */}
          <div className="space-y-3">{order.families.map((family) => renderFamily(family))}</div>
        </div>
      )}
    </div>
  );

  return (
    <div className="relative w-full">
      {/* Header de órdenes */}
      <div className="mb-4 px-4 py-2">
        <div className="text-xs text-muted-foreground">Órdenes</div>
      </div>

      <div className="space-y-4">{orders.map((order) => renderOrder(order))}</div>

      {/* Modal de Guía de Interpretación */}
      <InterpretationGuide isOpen={showGuide} onClose={() => setShowGuide(false)} />
    </div>
  );
}
