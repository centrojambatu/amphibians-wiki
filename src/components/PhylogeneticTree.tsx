"use client";

import {useEffect, useRef} from "react";
import * as d3 from "d3";

import {OrderGroup} from "@/types/taxonomy";

interface PhylogeneticTreeProps {
  readonly orders: OrderGroup[];
}

interface TreeNode {
  name: string;
  id: string;
  type: "order" | "family" | "genus" | "species";
  href?: string;
  children?: TreeNode[];
}

export default function PhylogeneticTree({orders}: PhylogeneticTreeProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  console.log("PhylogeneticTree - orders:", orders);
  console.log("PhylogeneticTree - orders length:", orders?.length);

  // Convertir datos a estructura jerárquica para D3
  const createHierarchy = (orders: OrderGroup[]): TreeNode[] => {
    return orders.map((order) => ({
      name: order.name,
      id: order.id,
      type: "order" as const,
      href: `/sapopedia/order/${order.id}`,
      children: order.families.map((family) => ({
        name: family.name,
        id: family.id,
        type: "family" as const,
        href: `/sapopedia/family/${family.id}`,
        children: family.genera.map((genus) => ({
          name: genus.name,
          id: genus.id,
          type: "genus" as const,
          href: `/sapopedia/genus/${genus.id}`,
          children: genus.species.map((species) => ({
            name: species.nombre_cientifico,
            id: species.id_taxon.toString(),
            type: "species" as const,
            href: `/sapopedia/species/${species.nombre_cientifico.replace(/ /g, "-")}`,
          })),
        })),
      })),
    }));
  };

  useEffect(() => {
    console.log("useEffect ejecutado - svgRef.current:", svgRef.current);
    console.log("useEffect - orders recibidos:", orders);
    
    if (!svgRef.current) return;
    if (!orders || orders.length === 0) {
      console.log("No hay datos de orders");
      return;
    }

    const data = createHierarchy(orders);
    console.log("Datos jerarquizados:", data);
    
    const rootData = {
      name: "Anfibios de Ecuador",
      id: "anfibios",
      type: "order" as const,
      children: data,
    };
    const root = d3.hierarchy(rootData);
    console.log("Root creado:", root);

    const width = 1500;
    const height = 1600;

    // Limpiar SVG anterior
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("background", "white");

    // Configurar el layout del árbol con nodeSize para control preciso del espaciado
    const verticalNodeSpacing = 80; // Espacio vertical entre nodos
    const horizontalNodeSpacing = 280; // Espacio horizontal entre niveles (padding)
    const tree = d3
      .tree()
      .nodeSize([verticalNodeSpacing, horizontalNodeSpacing]) // [vertical, horizontal]
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const treeData = tree(root as any);

    // Calcular el centro del árbol para centrarlo
    const treeBounds = treeData.descendants().reduce(
      (bounds, d) => {
        return {
          minX: Math.min(bounds.minX, d.x),
          maxX: Math.max(bounds.maxX, d.x),
          minY: Math.min(bounds.minY, d.y),
          maxY: Math.max(bounds.maxY, d.y),
        };
      },
      {minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity},
    );

    const treeWidth = treeBounds.maxY - treeBounds.minY;
    const treeHeight = treeBounds.maxX - treeBounds.minX;
    const centerX = (width - treeWidth) / 2;
    const centerY = (height - treeHeight) / 2;

    // Función para crear líneas con ángulos rectos
    const createStepLink = (d: {
      source: {x: number; y: number};
      target: {x: number; y: number};
    }) => {
      const sourceX = d.source.y + centerX; // Centrar horizontalmente
      const sourceY = d.source.x + centerY; // Centrar verticalmente
      const targetX = d.target.y + centerX; // Centrar horizontalmente
      const targetY = d.target.x + centerY; // Centrar verticalmente

      // Punto medio para el ángulo recto
      const midX = sourceX + (targetX - sourceX) / 2;

      return `M${sourceX},${sourceY} L${midX},${sourceY} L${midX},${targetY} L${targetX},${targetY}`;
    };

    // Agregar líneas de conexión con ángulos rectos
    svg
      .selectAll(".link")
      .data(treeData.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", createStepLink)
      .style("fill", "none")
      .style("stroke", "#666")
      .style("stroke-width", 2);

    // Agregar nodos
    const nodes = svg
      .selectAll(".node")
      .data(treeData.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.y + centerX},${d.x + centerY})`); // Centrar nodos

    // Agregar círculos para los nodos
    nodes
      .append("circle")
      .attr("r", (d) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        switch ((d as any).data.type) {
          case "order":
            return 8;
          case "family":
            return 6;
          case "genus":
            return 4;
          case "species":
            return 3;
          default:
            return 2;
        }
      })
      .style("fill", (d) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        switch ((d as any).data.type) {
          case "order":
            return "#1f2937";
          case "family":
            return "#4b5563";
          case "genus":
            return "#6b7280";
          case "species":
            return "#9ca3af";
          default:
            return "#d1d5db";
        }
      })
      .style("stroke", "#fff")
      .style("stroke-width", 2);

    // Agregar etiquetas de texto
    nodes
      .append("text")
      .attr("dy", "-0.5em") // Mover texto hacia arriba
      .attr("x", 20) // Separación del círculo
      .style("text-anchor", "start")
      .style("font-size", (d) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        switch ((d as any).data.type) {
          case "order":
            return "14px";
          case "family":
            return "12px";
          case "genus":
            return "10px";
          case "species":
            return "9px";
          default:
            return "8px";
        }
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .style("font-weight", (d) => ((d as any).data.type === "order" ? "bold" : "normal"))
      .style(
        "font-style",
        (d) =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (d as any).data.type === "genus" || (d as any).data.type === "species"
            ? "italic"
            : "normal",
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .text((d) => (d as any).data.name);

    // Hacer los nodos clicables
    nodes
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((d as any).data.href) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          window.location.href = (d as any).data.href;
        }
      });

    // Efecto hover
    nodes
      .on("mouseover", function () {
        d3.select(this).select("circle").style("stroke-width", 3).style("stroke", "#374151");

        d3.select(this)
          .select("text")
          .style("fill", "#374151")
          .style("text-decoration", "underline");
      })
      .on("mouseout", function () {
        d3.select(this).select("circle").style("stroke-width", 2).style("stroke", "#fff");

        d3.select(this).select("text").style("fill", "#000").style("text-decoration", "none");
      });
  }, [orders]);

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
          Relaciones evolutivas entre los grupos taxonómicos ({orders.length} órdenes)
        </p>
      </div>

      {/* Leyenda */}
      <div className="mb-4 flex gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full" style={{backgroundColor: "#1f2937"}}></div>
          <span>Orden</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full" style={{backgroundColor: "#4b5563"}}></div>
          <span>Familia</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full" style={{backgroundColor: "#6b7280"}}></div>
          <span>Género</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full" style={{backgroundColor: "#9ca3af"}}></div>
          <span>Especie</span>
        </div>
      </div>

      {/* SVG del árbol */}
      <div className="overflow-auto rounded-lg border-2 border-gray-300 bg-white p-4">
        <svg
          ref={svgRef}
          style={{
            width: "1500px",
            height: "1600px",
            display: "block",
            border: "1px solid red",
          }}
        ></svg>
      </div>
    </div>
  );
}

