"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronDown } from "lucide-react";

import {
  OrderGroup,
  FamilyGroup,
  GenusGroup,
  SpeciesData,
} from "@/types/taxonomy";

interface PhylogeneticTreeSimpleProps {
  readonly orders: OrderGroup[];
}

export default function PhylogeneticTreeSimple({
  orders,
}: PhylogeneticTreeSimpleProps) {
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [expandedFamilies, setExpandedFamilies] = useState<Set<string>>(
    new Set(),
  );
  const [expandedGenera, setExpandedGenera] = useState<Set<string>>(new Set());

  const toggleOrder = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);

    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const toggleFamily = (familyId: string) => {
    const newExpanded = new Set(expandedFamilies);

    if (newExpanded.has(familyId)) {
      newExpanded.delete(familyId);
    } else {
      newExpanded.add(familyId);
    }
    setExpandedFamilies(newExpanded);
  };

  const toggleGenus = (genusId: string) => {
    const newExpanded = new Set(expandedGenera);

    if (newExpanded.has(genusId)) {
      newExpanded.delete(genusId);
    } else {
      newExpanded.add(genusId);
    }
    setExpandedGenera(newExpanded);
  };

  const renderSpecies = (species: SpeciesData, genusId: string) => (
    <div key={species.id_taxon} className="group flex items-center py-2 pl-16">
      <div className="mr-2 h-px w-8 bg-gray-300"></div>
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 flex-shrink-0 rounded-full bg-gray-400"></div>
        <Link
          className="text-xs italic text-gray-700 hover:text-gray-900 hover:underline"
          href={`/sapopedia/species/${species.nombre_cientifico.replace(/ /g, "-")}`}
        >
          {species.nombre_cientifico}
        </Link>
        {species.nombre_comun && (
          <span className="text-xs text-gray-500">
            ({species.nombre_comun})
          </span>
        )}
      </div>
    </div>
  );

  const renderGenus = (genus: GenusGroup, familyId: string) => {
    const isExpanded = expandedGenera.has(genus.id);

    return (
      <div key={genus.id} className="pl-8">
        <div
          className="group flex cursor-pointer items-center py-2 hover:bg-gray-50"
          onClick={() => toggleGenus(genus.id)}
          role="button"
          tabIndex={0}
        >
          <div className="mr-2 h-px w-6 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-gray-500"></div>
            {genus.species.length > 0 && (
              <span className="text-gray-400">
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </span>
            )}
            <Link
              className="text-sm font-medium italic text-gray-800 hover:text-gray-900 hover:underline"
              href={`/sapopedia/genus/${genus.id}`}
            >
              {genus.name}
            </Link>
            <span className="text-xs text-gray-500">
              ({genus.species.length} especies)
            </span>
          </div>
        </div>
        {isExpanded && (
          <div className="border-l-2 border-gray-200 pl-4">
            {genus.species.map((species) => renderSpecies(species, genus.id))}
          </div>
        )}
      </div>
    );
  };

  const renderFamily = (family: FamilyGroup, orderId: string) => {
    const isExpanded = expandedFamilies.has(family.id);

    return (
      <div key={family.id} className="pl-6">
        <div
          className="group flex cursor-pointer items-center py-2 hover:bg-gray-50"
          onClick={() => toggleFamily(family.id)}
          role="button"
          tabIndex={0}
        >
          <div className="mr-2 h-px w-6 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 flex-shrink-0 rounded-full bg-gray-600"></div>
            {family.genera.length > 0 && (
              <span className="text-gray-400">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </span>
            )}
            <Link
              className="text-sm font-semibold text-gray-800 hover:text-gray-900 hover:underline"
              href={`/sapopedia/family/${family.id}`}
            >
              {family.name}
            </Link>
            <span className="text-xs text-gray-500">
              ({family.genera.length} géneros, {family.summary.totalSpecies}{" "}
              especies)
            </span>
          </div>
        </div>
        {isExpanded && (
          <div className="border-l-2 border-gray-200 pl-4">
            {family.genera.map((genus) => renderGenus(genus, family.id))}
          </div>
        )}
      </div>
    );
  };

  const renderOrder = (order: OrderGroup) => {
    const isExpanded = expandedOrders.has(order.id);

    return (
      <div
        key={order.id}
        className="mb-6 rounded-lg border border-gray-200 bg-white"
      >
        <div
          className="flex cursor-pointer items-center gap-3 p-4 hover:bg-gray-50"
          onClick={() => toggleOrder(order.id)}
          role="button"
          tabIndex={0}
        >
          <div className="h-4 w-4 flex-shrink-0 rounded-full bg-gray-800"></div>
          {order.families.length > 0 && (
            <span className="text-gray-400">
              {isExpanded ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </span>
          )}
          <div className="flex-1">
            <Link
              className="text-lg font-bold text-gray-900 hover:text-gray-700 hover:underline"
              href={`/sapopedia/order/${order.id}`}
            >
              {order.name}
            </Link>
            <p className="mt-1 text-xs text-gray-600">
              {order.families.length} familias{" "}
              <span className="text-[#f07304]">|</span> {order.summary.totalSpecies}{" "}
              especies <span className="text-[#f07304]">|</span> {order.summary.endemicSpecies} endémicas
            </p>
          </div>
        </div>
        {isExpanded && (
          <div className="border-t border-gray-200 p-4">
            {order.families.map((family) => renderFamily(family, order.id))}
          </div>
        )}
      </div>
    );
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <p className="text-gray-600">
          No hay datos disponibles para mostrar el árbol filogenético.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Título */}
      <div className="mb-6">
        <h2 className="mb-2 text-xl font-bold text-gray-800">
          Árbol Taxonómico
        </h2>
        <p className="text-sm text-gray-600">
          Navegación jerárquica por órdenes, familias, géneros y especies (
          {orders.length} órdenes)
        </p>
      </div>

      {/* Leyenda */}
      <div className="mb-6 flex gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-gray-800"></div>
          <span>Orden</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-gray-600"></div>
          <span>Familia</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-gray-500"></div>
          <span>Género</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-gray-400"></div>
          <span>Especie</span>
        </div>
      </div>

      {/* Controles */}
      <div className="mb-4 flex gap-2">
        <button
          className="rounded-md border border-gray-300 bg-white px-3 py-1 text-xs hover:bg-gray-50"
          onClick={() => {
            const allOrderIds = orders.map((o) => o.id);

            setExpandedOrders(new Set(allOrderIds));
          }}
        >
          Expandir todo
        </button>
        <button
          className="rounded-md border border-gray-300 bg-white px-3 py-1 text-xs hover:bg-gray-50"
          onClick={() => {
            setExpandedOrders(new Set());
            setExpandedFamilies(new Set());
            setExpandedGenera(new Set());
          }}
        >
          Colapsar todo
        </button>
      </div>

      {/* Árbol */}
      <div className="space-y-4">
        {orders.map((order) => renderOrder(order))}
      </div>
    </div>
  );
}
