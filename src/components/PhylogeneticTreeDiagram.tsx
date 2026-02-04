"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";

import {
  OrderGroup,
  FamilyGroup,
  GenusGroup,
  SpeciesData,
} from "@/types/taxonomy";

interface PhylogeneticTreeDiagramProps {
  readonly orders: OrderGroup[];
}

export default function PhylogeneticTreeDiagram({
  orders,
}: PhylogeneticTreeDiagramProps) {
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

  const renderSpecies = (species: SpeciesData) => (
    <div key={species.id_taxon} className="tree-node species-node">
      <Link
        className="node-content"
        href={`/sapopedia/species/${species.nombre_cientifico.replace(/ /g, "-")}`}
      >
        <div className="node-circle bg-purple-400"></div>
        <div className="node-label">
          <span className="text-xs italic">{species.nombre_cientifico}</span>
          {species.nombre_comun && (
            <span className="text-xs text-gray-500">
              ({species.nombre_comun})
            </span>
          )}
        </div>
      </Link>
    </div>
  );

  const renderGenus = (genus: GenusGroup) => {
    const isExpanded = expandedGenera.has(genus.id);
    const hasSpecies = genus.species.length > 0;

    return (
      <div key={genus.id} className="tree-branch">
        <div className="tree-node genus-node">
          <div
            className="node-content cursor-pointer"
            onClick={() => hasSpecies && toggleGenus(genus.id)}
            role="button"
            tabIndex={0}
          >
            <div className="node-circle bg-blue-500"></div>
            <div className="node-label">
              <Link
                className="font-medium italic hover:underline"
                href={`/sapopedia/genus/${genus.id}`}
              >
                {genus.name}
              </Link>
              {hasSpecies && (
                <span className="ml-2">
                  {isExpanded ? (
                    <ChevronDown className="inline h-3 w-3" />
                  ) : (
                    <ChevronRight className="inline h-3 w-3" />
                  )}
                </span>
              )}
              <span className="text-xs text-gray-500">
                ({genus.species.length} sp.)
              </span>
            </div>
          </div>
        </div>
        {isExpanded && hasSpecies && (
          <div className="tree-children">
            <div className="tree-children-grid">
              {genus.species.map((species) => renderSpecies(species))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFamily = (family: FamilyGroup) => {
    const isExpanded = expandedFamilies.has(family.id);
    const hasGenera = family.genera.length > 0;

    return (
      <div key={family.id} className="tree-branch">
        <div className="tree-node family-node">
          <div
            className="node-content cursor-pointer"
            onClick={() => hasGenera && toggleFamily(family.id)}
            role="button"
            tabIndex={0}
          >
            <div className="node-circle bg-green-600"></div>
            <div className="node-label">
              <Link
                className="font-semibold hover:underline"
                href={`/sapopedia/family/${family.id}`}
              >
                {family.name}
              </Link>
              {hasGenera && (
                <span className="ml-2">
                  {isExpanded ? (
                    <ChevronDown className="inline h-4 w-4" />
                  ) : (
                    <ChevronRight className="inline h-4 w-4" />
                  )}
                </span>
              )}
              <span className="text-xs text-gray-500">
                ({family.genera.length} gen., {family.summary.totalSpecies} sp.)
              </span>
            </div>
          </div>
        </div>
        {isExpanded && hasGenera && (
          <div className="tree-children">
            <div className="tree-children-grid">
              {family.genera.map((genus) => renderGenus(genus))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderOrder = (order: OrderGroup) => {
    const isExpanded = expandedOrders.has(order.id);
    const hasFamilies = order.families.length > 0;

    return (
      <div key={order.id} className="tree-order mb-8">
        <div className="tree-node order-node">
          <div
            className="node-content cursor-pointer"
            onClick={() => hasFamilies && toggleOrder(order.id)}
            role="button"
            tabIndex={0}
          >
            <div className="node-circle bg-red-600"></div>
            <div className="node-label">
              <Link
                className="text-lg font-bold hover:underline"
                href={`/sapopedia/order/${order.id}`}
              >
                {order.name}
              </Link>
              {hasFamilies && (
                <span className="ml-2">
                  {isExpanded ? (
                    <ChevronDown className="inline h-5 w-5" />
                  ) : (
                    <ChevronRight className="inline h-5 w-5" />
                  )}
                </span>
              )}
              <div className="text-xs text-gray-600">
                {order.families.length} familias{" "}
                <span className="text-[#f07304]">|</span> {order.summary.totalSpecies}{" "}
                especies <span className="text-[#f07304]">|</span> {order.summary.endemicSpecies} endémicas
              </div>
            </div>
          </div>
        </div>
        {isExpanded && hasFamilies && (
          <div className="tree-children">
            <div className="tree-children-grid">
              {order.families.map((family) => renderFamily(family))}
            </div>
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
      <style jsx>{`
        .tree-node {
          position: relative;
          display: inline-block;
        }

        .node-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 0.5rem;
          transition: all 0.2s;
          min-width: 150px;
          text-align: center;
        }

        .node-content:hover {
          border-color: #9ca3af;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          transform: translateY(-2px);
        }

        .node-circle {
          width: 1.5rem;
          height: 1.5rem;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .species-node .node-circle {
          width: 1rem;
          height: 1rem;
        }

        .node-label {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          align-items: center;
        }

        .tree-children {
          position: relative;
          margin-top: 2rem;
          padding-top: 2rem;
        }

        .tree-children::before {
          content: "";
          position: absolute;
          top: 0;
          left: 50%;
          width: 2px;
          height: 2rem;
          background: #d1d5db;
          transform: translateX(-50%);
        }

        .tree-children-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 2rem;
          justify-content: center;
          position: relative;
        }

        .tree-children-grid::before {
          content: "";
          position: absolute;
          top: -2rem;
          left: 0;
          right: 0;
          height: 2px;
          background: #d1d5db;
        }

        .tree-branch {
          position: relative;
        }

        .tree-branch::before {
          content: "";
          position: absolute;
          top: -2rem;
          left: 50%;
          width: 2px;
          height: 2rem;
          background: #d1d5db;
          transform: translateX(-50%);
        }

        .tree-order {
          background: #f9fafb;
          border: 2px solid #e5e7eb;
          border-radius: 1rem;
          padding: 2rem;
        }

        .order-node .node-content {
          background: #fef2f2;
          border-color: #fca5a5;
        }

        .family-node .node-content {
          background: #f0fdf4;
          border-color: #86efac;
        }

        .genus-node .node-content {
          background: #eff6ff;
          border-color: #93c5fd;
        }

        .species-node .node-content {
          background: #faf5ff;
          border-color: #d8b4fe;
          min-width: 120px;
        }
      `}</style>

      {/* Título */}
      <div className="mb-6">
        <h2 className="mb-2 text-xl font-bold text-gray-800">
          Árbol Taxonómico
        </h2>
        <p className="text-sm text-gray-600">
          Diagrama jerárquico de la clasificación taxonómica ({orders.length}{" "}
          órdenes)
        </p>
      </div>

      {/* Leyenda */}
      <div className="mb-6 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-red-600"></div>
          <span>Orden</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-green-600"></div>
          <span>Familia</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-blue-500"></div>
          <span>Género</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-purple-400"></div>
          <span>Especie</span>
        </div>
      </div>

      {/* Controles */}
      <div className="mb-6 flex gap-2">
        <button
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
          onClick={() => {
            const allOrderIds = orders.map((o) => o.id);

            setExpandedOrders(new Set(allOrderIds));
          }}
        >
          Expandir órdenes
        </button>
        <button
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
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
      <div className="space-y-6">
        {orders.map((order) => renderOrder(order))}
      </div>
    </div>
  );
}
