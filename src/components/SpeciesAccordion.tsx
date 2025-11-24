"use client";

import {useState, useEffect} from "react";
import Link from "next/link";
import {ChevronRight, ChevronDown} from "lucide-react";

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

  const renderSpecies = (species: SpeciesData) => (
    <div
      key={species.id_taxon}
      className="relative flex items-center gap-4 rounded-md border border-gray-200 bg-white px-4 py-3 transition-all hover:border-gray-300 hover:bg-gray-50"
    >
      {/* Nombre científico */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link
            className="text-sm font-medium text-gray-800 italic hover:underline"
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
          <div className="mt-1 text-xs text-gray-600">{species.nombre_comun}</div>
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
          <RedListStatus
            status={
              species.lista_roja_iucn as "LC" | "NT" | "VU" | "EN" | "CR" | "EW" | "EX" | "DD"
            }
          />
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </div>

      {/* Pisos Climáticos */}
      <div className="flex w-80 items-center justify-center">
        {species.rango_altitudinal_min !== null && species.rango_altitudinal_max !== null ? (
          <ClimaticFloorChart
            altitudinalRange={{
              min: species.rango_altitudinal_min,
              max: species.rango_altitudinal_max,
            }}
          />
        ) : (
          <span className="text-xs text-gray-400">Sin datos</span>
        )}
      </div>
    </div>
  );

  const renderGenus = (genus: GenusGroup) => (
    <div key={genus.id} className="relative bg-white">
      <div
        className="relative flex w-full cursor-pointer items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-3 transition-all hover:border-gray-300 hover:bg-gray-50"
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
        {/* Flecha de expansión */}
        <div className="mr-3 flex-shrink-0 text-gray-600">
          {isOpen(`genus-${genus.id}`) ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </div>

        <div className="flex-1 pr-4">
          <div className="mb-1 flex items-center gap-2">
            <span className="font-semibold text-gray-800 italic">{genus.name}</span>
            {genus.nombre_comun && (
              <span className="text-sm text-gray-500">{genus.nombre_comun}</span>
            )}
          </div>
          <p className="text-xs text-gray-600">
            {genus.summary.totalSpecies} especie{genus.summary.totalSpecies !== 1 ? "s" : ""} (
            {genus.summary.endemicSpecies} endémica
            {genus.summary.endemicSpecies !== 1 ? "s" : ""}, {genus.summary.redListSpecies} en Lista
            Roja)
          </p>
        </div>
      </div>

      {isOpen(`genus-${genus.id}`) && (
        <div className="mt-3 rounded-lg bg-gray-50 p-4">
          {/* Header de la tabla */}
          <div className="mb-3 rounded-md bg-white px-4 py-2 shadow-sm">
            <div className="mb-2 text-sm font-semibold text-gray-700">Especies</div>
            <div className="flex items-center gap-4 text-xs font-semibold text-gray-600">
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
    <div key={family.id} className="relative bg-white">
      <div
        className="relative flex w-full cursor-pointer items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-3 transition-all hover:border-gray-300 hover:bg-gray-50"
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
        {/* Flecha de expansión */}
        <div className="mr-3 flex-shrink-0 text-gray-600">
          {isOpen(`family-${family.id}`) ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </div>

        <div className="flex-1 pr-4">
          <div className="mb-1 flex items-center gap-2">
            <span className="font-semibold text-gray-800">{family.name}</span>
          </div>
          <p className="text-sm text-gray-600">
            {family.summary.totalSpecies} especies, {family.summary.totalGenera} géneros (
            {family.summary.endemicSpecies} endémicas, {family.summary.redListSpecies} en Lista
            Roja)
          </p>
        </div>
      </div>

      {isOpen(`family-${family.id}`) && (
        <div className="mt-3 rounded-lg bg-gray-50 p-4">
          {/* Header de géneros */}
          <div className="mb-3 rounded-md bg-white px-4 py-2 shadow-sm">
            <div className="text-sm font-semibold text-gray-700">Géneros</div>
          </div>
          {/* Lista de géneros */}
          <div className="space-y-2">{family.genera.map((genus) => renderGenus(genus))}</div>
        </div>
      )}
    </div>
  );

  const renderOrder = (order: OrderGroup) => (
    <div key={order.id} className="relative mb-4 bg-white">
      <div
        className="relative flex w-full cursor-pointer items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-3 transition-all hover:border-gray-300 hover:bg-gray-50"
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
        {/* Flecha de expansión */}
        <div className="mr-3 flex-shrink-0 text-gray-600">
          {isOpen(`order-${order.id}`) ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </div>

        <div className="flex-1 pr-4">
          <span className="inline-block text-lg font-bold text-gray-800">{order.name}</span>
          <p className="mt-1 text-sm text-gray-600">
            {order.summary.totalSpecies} especies, {order.summary.totalFamilies} familias (
            {order.summary.endemicSpecies} endémicas, {order.summary.redListSpecies} en Lista Roja)
          </p>
        </div>
      </div>

      {isOpen(`order-${order.id}`) && (
        <div className="mt-3 rounded-lg bg-gray-50 p-4">
          {/* Header de familias */}
          <div className="mb-3 rounded-md bg-white px-4 py-2 shadow-sm">
            <div className="text-sm font-semibold text-gray-700">Familias</div>
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
      <div className="mb-4 rounded-md bg-white px-4 py-3 shadow-sm">
        <div className="text-base font-bold text-gray-800">Órdenes</div>
      </div>

      <div className="space-y-4">{orders.map((order) => renderOrder(order))}</div>

      {/* Modal de Guía de Interpretación */}
      <InterpretationGuide isOpen={showGuide} onClose={() => setShowGuide(false)} />
    </div>
  );
}
