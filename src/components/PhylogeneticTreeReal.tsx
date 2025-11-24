"use client";

import {useEffect, useRef, useState} from "react";
import Link from "next/link";

import {OrderGroup} from "@/types/taxonomy";

interface PhylogeneticTreeRealProps {
  readonly orders: OrderGroup[];
}

interface TreeNode {
  name: string;
  id: string;
  type: "root" | "order" | "family" | "genus" | "species";
  children: TreeNode[];
  href?: string;
  x?: number;
  y?: number;
  depth?: number;
  isExpanded?: boolean;
}

export default function PhylogeneticTreeReal({orders}: PhylogeneticTreeRealProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [treeData, setTreeData] = useState<TreeNode | null>(null);

  // Construir el árbol solo una vez
  useEffect(() => {
    if (!orders || orders.length === 0) return;

    const root: TreeNode = {
      name: "Anfibios",
      id: "root",
      type: "root",
      children: orders.map((order) => ({
        name: order.name,
        id: `order-${order.id}`,
        type: "order" as const,
        href: `/sapopedia/order/${order.id}`,
        children: order.families.map((family) => ({
          name: family.name,
          id: `family-${family.id}`,
          type: "family" as const,
          href: `/sapopedia/family/${family.id}`,
          children: family.genera.map((genus) => ({
            name: genus.name,
            id: `genus-${genus.id}`,
            type: "genus" as const,
            href: `/sapopedia/genus/${genus.id}`,
            children: genus.species.map((species) => ({
              name: species.nombre_cientifico,
              id: `species-${species.id_taxon}`,
              type: "species" as const,
              href: `/sapopedia/species/${species.nombre_cientifico.replace(/ /g, "-")}`,
              children: [],
            })),
          })),
        })),
      })),
    };

    setTreeData(root);
  }, [orders]);

  // Redibujar el árbol cuando cambien los nodos expandidos
  useEffect(() => {
    if (!treeData || !svgRef.current) return;

    // Filtrar el árbol basado en nodos expandidos
    const getVisibleNodes = (node: TreeNode): TreeNode => {
      const hasChildren = node.children.length > 0;
      const isExpanded = expandedNodes.has(node.id) || node.type === "root";

      return {
        ...node,
        children: isExpanded && hasChildren ? node.children.map(getVisibleNodes) : [],
        isExpanded,
      };
    };

    const visibleTree = getVisibleNodes(treeData);

    // Calcular posiciones
    const calculateLayout = (node: TreeNode, depth = 0, startY = 0): number => {
      node.depth = depth;

      if (node.children.length === 0) {
        node.y = startY;
        return startY + 1;
      }

      let currentY = startY;
      const childYs: number[] = [];

      node.children.forEach((child) => {
        currentY = calculateLayout(child, depth + 1, currentY);
        childYs.push(child.y!);
      });

      // El nodo padre se coloca en el centro de sus hijos
      node.y = (childYs[0] + childYs[childYs.length - 1]) / 2;

      return currentY;
    };

    calculateLayout(visibleTree);

    // Encontrar el máximo de profundidad y hojas
    const getMaxDepth = (node: TreeNode): number => {
      if (node.children.length === 0) return node.depth || 0;
      return Math.max(...node.children.map(getMaxDepth));
    };

    const countLeaves = (node: TreeNode): number => {
      if (node.children.length === 0) return 1;
      return node.children.reduce((sum, child) => sum + countLeaves(child), 0);
    };

    const maxDepth = getMaxDepth(visibleTree);
    const numLeaves = countLeaves(visibleTree);

    // Dimensiones
    const margin = {top: 20, right: 200, bottom: 20, left: 100};
    const verticalSpacing = 25;
    const horizontalSpacing = 200;
    const width = (maxDepth + 1) * horizontalSpacing + margin.left + margin.right;
    const height = numLeaves * verticalSpacing + margin.top + margin.bottom;

    // Asignar coordenadas X
    const assignX = (node: TreeNode) => {
      node.x = margin.left + (node.depth || 0) * horizontalSpacing;
      node.children.forEach(assignX);
    };

    assignX(visibleTree);

    // Configurar SVG
    const svg = svgRef.current;

    svg.setAttribute("width", width.toString());
    svg.setAttribute("height", height.toString());
    svg.innerHTML = "";

    // Dibujar líneas
    const drawConnections = (node: TreeNode) => {
      if (!node.x || node.y === undefined) return;

      const y = margin.top + (node.y || 0) * verticalSpacing;

      node.children.forEach((child) => {
        if (!child.x || child.y === undefined) return;

        const childY = margin.top + child.y * verticalSpacing;

        // Línea horizontal desde el padre
        const horizontalLine = document.createElementNS("http://www.w3.org/2000/svg", "line");

        horizontalLine.setAttribute("x1", node.x.toString());
        horizontalLine.setAttribute("y1", y.toString());
        horizontalLine.setAttribute("x2", child.x.toString());
        horizontalLine.setAttribute("y2", y.toString());
        horizontalLine.setAttribute("stroke", "#9ca3af");
        horizontalLine.setAttribute("stroke-width", "2");
        svg.appendChild(horizontalLine);

        // Línea vertical al hijo
        const verticalLine = document.createElementNS("http://www.w3.org/2000/svg", "line");

        verticalLine.setAttribute("x1", child.x.toString());
        verticalLine.setAttribute("y1", y.toString());
        verticalLine.setAttribute("x2", child.x.toString());
        verticalLine.setAttribute("y2", childY.toString());
        verticalLine.setAttribute("stroke", "#9ca3af");
        verticalLine.setAttribute("stroke-width", "2");
        svg.appendChild(verticalLine);

        drawConnections(child);
      });
    };

    drawConnections(visibleTree);

    // Dibujar nodos
    const drawNodes = (node: TreeNode, originalNode: TreeNode) => {
      if (!node.x || node.y === undefined) return;

      const y = margin.top + node.y * verticalSpacing;
      const hasChildren = originalNode.children.length > 0;
      const isExpanded = expandedNodes.has(node.id);

      // Grupo para el nodo
      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");

      group.style.cursor = "pointer";

      // Círculo
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");

      circle.setAttribute("cx", node.x.toString());
      circle.setAttribute("cy", y.toString());

      let radius = 4;
      let fill = "#9ca3af";

      switch (node.type) {
        case "root":
          radius = 8;
          fill = "#000000";
          break;
        case "order":
          radius = 6;
          fill = "#dc2626";
          break;
        case "family":
          radius = 5;
          fill = "#16a34a";
          break;
        case "genus":
          radius = 4;
          fill = "#2563eb";
          break;
        case "species":
          radius = 3;
          fill = "#9333ea";
          break;
      }

      circle.setAttribute("r", radius.toString());
      circle.setAttribute("fill", fill);
      circle.setAttribute("stroke", "white");
      circle.setAttribute("stroke-width", "2");
      group.appendChild(circle);

      // Indicador de expansión (+/-)
      if (hasChildren) {
        const indicator = document.createElementNS("http://www.w3.org/2000/svg", "text");

        indicator.setAttribute("x", node.x.toString());
        indicator.setAttribute("y", y.toString());
        indicator.setAttribute("text-anchor", "middle");
        indicator.setAttribute("dominant-baseline", "middle");
        indicator.setAttribute("font-size", "10");
        indicator.setAttribute("font-weight", "bold");
        indicator.setAttribute("fill", "white");
        indicator.setAttribute("pointer-events", "none");
        indicator.textContent = isExpanded ? "−" : "+";
        group.appendChild(indicator);
      }

      // Texto
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");

      text.setAttribute("x", (node.x + 15).toString());
      text.setAttribute("y", (y + 4).toString());
      text.setAttribute("font-size", node.type === "species" ? "10" : "12");
      text.setAttribute("fill", "#374151");
      text.style.fontStyle = node.type === "genus" || node.type === "species" ? "italic" : "normal";
      text.style.fontWeight = node.type === "order" ? "bold" : "normal";
      text.textContent = node.name;

      if (hasChildren) {
        const countText = document.createElementNS("http://www.w3.org/2000/svg", "tspan");

        countText.setAttribute("fill", "#9ca3af");
        countText.setAttribute("font-size", "9");
        countText.textContent = ` (${originalNode.children.length})`;
        text.appendChild(countText);
      }

      group.appendChild(text);

      // Eventos
      group.addEventListener("click", (e) => {
        e.stopPropagation();
        if (hasChildren) {
          // Toggle expansión
          const newExpanded = new Set(expandedNodes);

          if (newExpanded.has(node.id)) {
            newExpanded.delete(node.id);
          } else {
            newExpanded.add(node.id);
          }
          setExpandedNodes(newExpanded);
        } else if (node.href) {
          // Navegar
          window.location.href = node.href;
        }
      });

      group.addEventListener("mouseenter", () => {
        circle.setAttribute("stroke", "#374151");
        circle.setAttribute("stroke-width", "3");
        if (!hasChildren) {
          text.style.textDecoration = "underline";
        }
      });

      group.addEventListener("mouseleave", () => {
        circle.setAttribute("stroke", "white");
        circle.setAttribute("stroke-width", "2");
        text.style.textDecoration = "none";
      });

      svg.appendChild(group);

      // Recursivamente dibujar hijos visibles
      node.children.forEach((child, idx) => {
        const originalChild = originalNode.children[idx];

        drawNodes(child, originalChild);
      });
    };

    // Encontrar el nodo original correspondiente para obtener el conteo real de hijos
    const findOriginalNode = (visNode: TreeNode, origTree: TreeNode): TreeNode => {
      if (visNode.id === origTree.id) return origTree;

      for (const child of origTree.children) {
        const found = findOriginalNode(visNode, child);

        if (found) return found;
      }

      return visNode; // fallback
    };

    drawNodes(visibleTree, treeData);
  }, [treeData, expandedNodes]);

  const expandAll = () => {
    if (!treeData) return;

    const allIds = new Set<string>();
    const collectIds = (node: TreeNode) => {
      allIds.add(node.id);
      node.children.forEach(collectIds);
    };

    collectIds(treeData);
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  const expandOrders = () => {
    if (!treeData) return;

    const orderIds = new Set<string>();

    treeData.children.forEach((order) => {
      orderIds.add(order.id);
    });
    setExpandedNodes(orderIds);
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <p className="text-gray-600">No hay datos disponibles para mostrar el árbol filogenético.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Título */}
      <div className="mb-6">
        <h2 className="mb-2 text-xl font-bold text-gray-800">Árbol Filogenético</h2>
        <p className="text-sm text-gray-600">
          Representación de las relaciones evolutivas entre grupos taxonómicos. Haz clic en los nodos (+) para
          expandir.
        </p>
      </div>

      {/* Leyenda */}
      <div className="mb-6 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-600"></div>
          <span>Orden</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-600"></div>
          <span>Familia</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-blue-600"></div>
          <span>Género</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-purple-600"></div>
          <span>Especie</span>
        </div>
      </div>

      {/* Controles */}
      <div className="mb-4 flex gap-2">
        <button
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
          onClick={expandOrders}
        >
          Expandir órdenes
        </button>
        <button
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
          onClick={expandAll}
        >
          Expandir todo
        </button>
        <button
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
          onClick={collapseAll}
        >
          Colapsar todo
        </button>
      </div>

      {/* SVG Container */}
      <div className="overflow-auto rounded-lg border border-gray-200 bg-white p-4">
        <svg ref={svgRef} className="block"></svg>
      </div>

      {/* Nota */}
      <div className="mt-4 rounded-lg bg-blue-50 p-4 text-sm text-gray-700">
        <p>
          <strong>Cómo usar:</strong> Haz clic en los nodos con símbolo <strong>+</strong> para expandir y
          ver los niveles inferiores. Los nodos con <strong>−</strong> se pueden colapsar. Las especies
          (nodos morados sin símbolo) son clicables para ver sus detalles.
        </p>
      </div>
    </div>
  );
}

