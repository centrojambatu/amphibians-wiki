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
  /** Si se setea, se abre el acordeón de ese orden (ej. "anura", "caudata", "gymnophiona") */
  readonly activeOrderId?: string | null;
  /** Se llama después de abrir el orden para limpiar el estado en el padre */
  readonly onActiveOrderIdConsumed?: () => void;
}

export default function SpeciesAccordion({
  orders,
  activeOrderId = null,
  onActiveOrderIdConsumed,
}: SpeciesAccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [showGuide, setShowGuide] = useState(false);

  // Abrir el acordeón del orden cuando se hace clic en una card de orden (Anura, Caudata, Gymnophiona)
  useEffect(() => {
    if (activeOrderId) {
      const orderKey = `order-${activeOrderId}`;

      setOpenItems(new Set([orderKey]));
      onActiveOrderIdConsumed?.();
    }
  }, [activeOrderId, onActiveOrderIdConsumed]);

  // Cargar el estado del acordeón desde localStorage al montar (órdenes: solo uno abierto; familias y géneros: varios)
  useEffect(() => {
    const savedState = localStorage.getItem("accordionOpenItems");

    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState) as string[];

        if (parsedState.length > 0) setOpenItems(new Set(parsedState));
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
    const isOrder = itemId.startsWith("order-");

    if (openItems.has(itemId)) {
      if (isOrder) {
        setOpenItems(new Set());
      } else {
        setOpenItems((prev) => {
          const next = new Set(prev);

          next.delete(itemId);

          return next;
        });
      }
    } else {
      if (isOrder) {
        setOpenItems(new Set([itemId]));
      } else {
        setOpenItems((prev) => new Set(prev).add(itemId));
      }
    }
  };

  const isOpen = (itemId: string) => openItems.has(itemId);

  // Función helper para detectar si es PE
  const isPE = (sigla: string | null) => {
    if (!sigla) return false;

    return sigla === "PE" || sigla.includes("PE") || sigla.includes("Posiblemente extinta");
  };

  const renderRedListBadge = (listaRoja: string, size: "sm" | "md" = "md") => {
    const dim = size === "sm" ? "28px" : "36px";

    if (isPE(listaRoja)) {
      return (
        <div
          className="inline-flex items-center justify-center text-[11px] font-semibold"
          style={{
            backgroundColor: "#b71c1c",
            color: "#ffffff",
            borderRadius: "100% 0% 100% 100%",
            width: dim,
            height: dim,
            flexShrink: 0,
          }}
        >
          PE
        </div>
      );
    }

    const valorNormalizado = listaRoja.trim().toUpperCase();
    const valoresValidos: readonly string[] = ["LC", "NT", "VU", "EN", "CR", "EW", "EX", "DD"];

    if (valoresValidos.includes(valorNormalizado)) {
      return (
        <RedListStatus
          showTooltip={size === "md"}
          status={valorNormalizado as "LC" | "NT" | "VU" | "EN" | "CR" | "EW" | "EX" | "DD"}
        />
      );
    }

    console.warn(`⚠️ Valor de lista roja no válido: "${listaRoja}" para especie`);

    return (
      <div
        className="inline-flex items-center justify-center text-[11px] font-semibold"
        style={{
          backgroundColor: "#d1d1c6",
          color: "#666666",
          borderRadius: "100% 0% 100% 100%",
          width: dim,
          height: dim,
          flexShrink: 0,
        }}
      >
        ?
      </div>
    );
  };

  const renderSpecies = (species: SpeciesData) => (
    <div
      key={species.id_taxon}
      className="border-border bg-card hover:bg-muted/50 relative flex flex-col gap-1.5 rounded-md border px-4 py-3 transition-all lg:grid lg:grid-cols-[minmax(0,1fr)_9rem_3rem_4rem_20rem] lg:items-center lg:gap-4"
    >
      {/* ── Nombre científico (visible en todos los tamaños) ── */}
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <Link
            className="text-foreground text-sm font-medium italic hover:no-underline"
            href={`/sapopedia/species/${species.nombre_cientifico.replace(/ /g, "-")}`}
          >
            {species.nombre_cientifico}
          </Link>
          {/* {species.descubridor && (
            <span
              dangerouslySetInnerHTML={{
                __html: processHTMLLinks(species.descubridor),
              }}
              className="text-xs text-gray-500"
            />
          )} */}
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

        {/* Badges inline — solo en móvil/tablet (<lg) */}
        <div className="mt-2 flex flex-wrap items-center gap-2 lg:hidden">
          {/* Endémica */}
          {species.endemica ? (
            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-semibold text-gray-800">
              E
            </span>
          ) : (
            <span className="rounded bg-gray-50 px-1.5 py-0.5 text-xs font-semibold text-gray-400">
              NE
            </span>
          )}
          {/* Lista Roja */}
          {species.lista_roja_iucn ? (
            renderRedListBadge(species.lista_roja_iucn, "sm")
          ) : (
            <span className="text-muted-foreground text-xs">-</span>
          )}
          {/* Distribución km² */}
          {species.area_distribucion != null && (
            <span className="text-muted-foreground text-xs">{species.area_distribucion.toLocaleString()} km²</span>
          )}
        </div>
      </div>

      {/* ── Distribución km² — solo desktop ── */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="text-muted-foreground hidden min-w-0 cursor-help text-center text-xs lg:block">
              {species.area_distribucion != null ? `${species.area_distribucion.toLocaleString()} km²` : "—"}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Área distribución Ecuador</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* ── Endémica — solo desktop ── */}
      <div className="hidden justify-center lg:flex">
        {species.endemica ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help text-sm font-semibold text-gray-800">E</span>
              </TooltipTrigger>
              <TooltipContent className="[&>*:last-child]:hidden">
                <p className="font-normal text-white">Endémica</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help text-sm font-semibold text-gray-500">NE</span>
              </TooltipTrigger>
              <TooltipContent className="[&>*:last-child]:hidden">
                <p className="font-normal text-white">No endémica</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* ── Lista Roja — solo desktop ── */}
      <div className="hidden justify-center lg:flex">
        {species.lista_roja_iucn ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>{renderRedListBadge(species.lista_roja_iucn, "md")}</span>
              </TooltipTrigger>
              {isPE(species.lista_roja_iucn) && (
                <TooltipContent className="[&>*:last-child]:hidden">
                  <p className="font-normal text-white">Posiblemente extinta</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </div>

      {/* ── Pisos Climáticos — solo desktop ── */}
      <div className="hidden min-w-0 items-center justify-end lg:flex">
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
          <p className="text-xs text-gray-500">
            {genus.summary.totalSpecies} {genus.summary.totalSpecies === 1 ? "especie" : "especies"}
          </p>
        </div>

        {/* Icono de barras */}
        <div className="text-muted-foreground ml-3 flex-shrink-0">
          <Menu className="h-4 w-4" />
        </div>
      </div>

      {isOpen(`genus-${genus.id}`) && (
        <div className="mt-3 rounded-lg pt-4 pr-0 pb-4 pl-4">
          {/* Lista de especies — pr-0 para alinear borde derecho con el resto de cards */}
          <div className="space-y-2 pl-6">
            {genus.species.map((species) => renderSpecies(species))}
          </div>
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
            {family.nombre_comun && (
              <span className="text-muted-foreground text-xs">{family.nombre_comun}</span>
            )}
          </div>
          <p className="text-xs text-gray-500">
            {family.summary.totalSpecies}{" "}
            {family.summary.totalSpecies === 1 ? "especie" : "especies"}{" "}
            <span className="text-[#f07304]">|</span> {family.summary.totalGenera}{" "}
            {family.summary.totalGenera === 1 ? "género" : "géneros"}
          </p>
        </div>

        {/* Icono de barras */}
        <div className="text-muted-foreground ml-3 flex-shrink-0">
          <Menu className="h-4 w-4" />
        </div>
      </div>

      {isOpen(`family-${family.id}`) && (
        <div className="mt-3 rounded-lg pt-4 pr-0 pb-4 pl-4">
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
          <p className="text-xs text-gray-500">
            {order.summary.totalSpecies} {order.summary.totalSpecies === 1 ? "especie" : "especies"}{" "}
            <span className="text-[#f07304]">|</span> {order.summary.totalFamilies}{" "}
            {order.summary.totalFamilies === 1 ? "familia" : "familias"}
          </p>
        </div>

        {/* Icono de barras */}
        <div className="text-muted-foreground ml-3 flex-shrink-0">
          <Menu className="h-4 w-4" />
        </div>
      </div>

      {isOpen(`order-${order.id}`) && (
        <div className="mt-3 rounded-lg pt-4 pr-0 pb-4 pl-4">
          {/* Lista de familias — pr-0 para que el borde derecho de las cards coincida con el de orden */}
          <div className="space-y-3 pl-6">
            {order.families.map((family) => renderFamily(family))}
          </div>
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
