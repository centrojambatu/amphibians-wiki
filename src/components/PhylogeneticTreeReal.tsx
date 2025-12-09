"use client";

import {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import { OrderGroup } from "@/types/taxonomy";

interface PhylogeneticTreeRealProps {
  readonly orders: OrderGroup[];
}

interface TreeNodeData {
  id: string;
  name: string;
  type: "root" | "order" | "family" | "genus" | "species";
  count?: number;
  href?: string;
  children?: TreeNodeData[];
}

interface PositionedNode extends TreeNodeData {
  x: number;
  y: number;
  children?: PositionedNode[];
}

const NODE_HEIGHT = 22;
const LEVEL_WIDTH = 140;
const STORAGE_KEY = "phylo-tree-expanded-nodes";
const STORAGE_SCROLL_KEY = "phylo-tree-scroll-position";

export default function PhylogeneticTreeReal({
  orders,
}: PhylogeneticTreeRealProps) {
  const router = useRouter();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cargar estado desde localStorage
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
    if (typeof globalThis.window === "undefined") return new Set(["root"]);

    try {
      const saved = globalThis.window.localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved) as string[];

        return new Set(parsed);
      }
    } catch {
      // Ignorar errores de parsing
    }

    return new Set(["root"]);
  });

  const [dimensions, setDimensions] = useState({ width: 1200, height: 400 });

  const handleNavigate = useCallback(
    (href: string) => {
      router.push(href);
    },
    [router],
  );

  const handleToggle = useCallback((nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);

      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }

      // Guardar en localStorage
      try {
        globalThis.window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(Array.from(next)),
        );
      } catch {
        // Ignorar errores de localStorage
      }

      return next;
    });
  }, []);

  // Construir datos del árbol
  const treeData: TreeNodeData = useMemo(
    () => ({
      id: "root",
      name: "Anfibios",
      type: "root",
      count: orders.reduce((sum, o) => sum + o.summary.totalSpecies, 0),
      children: orders.map((order) => ({
        id: `order-${order.id}`,
        name: order.name,
        type: "order" as const,
        count: order.summary.totalSpecies,
        href: `/sapopedia/order/${order.id}`,
        children: order.families.map((family) => ({
          id: `family-${family.id}`,
          name: family.name,
          type: "family" as const,
          count: family.summary.totalSpecies,
          href: `/sapopedia/family/${family.id}`,
          children: family.genera.map((genus) => ({
            id: `genus-${genus.id}`,
            name: genus.name,
            type: "genus" as const,
            count: genus.species.length,
            href: `/sapopedia/genus/${genus.id}`,
            children: genus.species.map((species) => ({
              id: `species-${String(species.id_taxon)}`,
              name: species.nombre_cientifico,
              type: "species" as const,
              href: `/sapopedia/species/${String(species.id_taxon)}`,
            })),
          })),
        })),
      })),
    }),
    [orders],
  );

  // Calcular posiciones de los nodos
  const { positionedTree, totalHeight } = useMemo(() => {
    const yCounter = { value: 0 };

    const positionNode = (
      node: TreeNodeData,
      level: number,
    ): PositionedNode => {
      const isExpanded = expandedNodes.has(node.id);
      const hasChildren = node.children && node.children.length > 0;

      if (!hasChildren || !isExpanded) {
        const y = yCounter.value;

        yCounter.value += NODE_HEIGHT;

        return {
          id: node.id,
          name: node.name,
          type: node.type,
          count: node.count,
          href: node.href,
          x: level * LEVEL_WIDTH,
          y,
        };
      }

      // Posicionar hijos primero
      const positionedChildren = node.children!.map((child) =>
        positionNode(child, level + 1),
      );

      // El nodo padre se posiciona en el centro vertical de sus hijos
      const firstChildY = positionedChildren[0].y;
      const lastChild = positionedChildren.at(-1);
      const lastChildY = lastChild ? lastChild.y : firstChildY;
      const centerY = (firstChildY + lastChildY) / 2;

      // Ajustar hacia arriba solo un poco para separar del primer hijo, pero mantener la forma del árbol
      const parentY = centerY - NODE_HEIGHT * 0.3;

      return {
        id: node.id,
        name: node.name,
        type: node.type,
        count: node.count,
        href: node.href,
        x: level * LEVEL_WIDTH,
        y: parentY,
        children: positionedChildren,
      };
    };

    const positioned = positionNode(treeData, 0);

    return { positionedTree: positioned, totalHeight: yCounter.value };
  }, [treeData, expandedNodes]);

  // Actualizar dimensiones
  useEffect(() => {
    const maxLevel = 5; // root, order, family, genus, species

    setDimensions({
      width: maxLevel * LEVEL_WIDTH + 200,
      height: Math.max(400, totalHeight + 40),
    });
  }, [totalHeight]);

  // Restaurar posición del scroll al montar
  useEffect(() => {
    if (containerRef.current) {
      try {
        const saved =
          globalThis.window.localStorage.getItem(STORAGE_SCROLL_KEY);

        if (saved) {
          const parsed = JSON.parse(saved) as {
            scrollLeft: number;
            scrollTop: number;
          };

          // Pequeño delay para asegurar que el contenido esté renderizado
          const timeoutId = setTimeout(() => {
            if (containerRef.current) {
              containerRef.current.scrollLeft = parsed.scrollLeft;
              containerRef.current.scrollTop = parsed.scrollTop;
            }
          }, 100);

          return () => clearTimeout(timeoutId);
        }
      } catch {
        // Ignorar errores
      }
    }
  }, [positionedTree]);

  // Guardar posición del scroll cuando cambie
  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const handleScroll = () => {
      try {
        globalThis.window.localStorage.setItem(
          STORAGE_SCROLL_KEY,
          JSON.stringify({
            scrollLeft: container.scrollLeft,
            scrollTop: container.scrollTop,
          }),
        );
      } catch {
        // Ignorar errores de localStorage
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Generar curva bezier entre dos puntos
  const generatePath = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ): string => {
    const midX = (x1 + x2) / 2;

    return `M ${String(x1)} ${String(y1)} C ${String(midX)} ${String(y1)}, ${String(midX)} ${String(y2)}, ${String(x2)} ${String(y2)}`;
  };

  // Renderizar enlaces
  const renderLinks = (node: PositionedNode): ReactNode[] => {
    const links: ReactNode[] = [];

    if (node.children) {
      node.children.forEach((child) => {
        links.push(
          <path
            key={`link-${node.id}-${child.id}`}
            d={generatePath(node.x + 6, node.y, child.x - 4, child.y)}
            fill="none"
            stroke="#bbb"
            strokeWidth={1}
          />,
        );
        const childLinks = renderLinks(child);

        childLinks.forEach((link) => links.push(link));
      });
    }

    return links;
  };

  // Calcular ancho aproximado del texto
  const estimateTextWidth = (text: string, fontSize: number): number => {
    // Aproximación más precisa: considerar ancho variable por carácter
    // Caracteres más anchos (m, w) y más estrechos (i, l)
    let width = 0;

    for (const char of text) {
      if (char === "m" || char === "w" || char === "M" || char === "W") {
        width += fontSize * 0.8;
      } else if (
        char === "i" ||
        char === "l" ||
        char === "I" ||
        char === "L" ||
        char === " " ||
        char === "."
      ) {
        width += fontSize * 0.3;
      } else {
        width += fontSize * 0.6;
      }
    }

    return width;
  };

  // Renderizar nodos
  const renderNodes = (node: PositionedNode): ReactNode[] => {
    const nodes: ReactNode[] = [];
    const hasChildren = node.children && node.children.length > 0;
    const isItalic = node.type === "genus" || node.type === "species";

    const handleClick = () => {
      if (
        hasChildren ||
        (node.children === undefined && node.type !== "species")
      ) {
        handleToggle(node.id);
      } else if (node.href) {
        handleNavigate(node.href);
      }
    };

    // Calcular ancho del texto para el subrayado
    // Solo subrayar el nombre, no el contador
    const nameWidth = estimateTextWidth(node.name, 11);
    const underlineX2 = 8 + nameWidth;

    nodes.push(
      <g
        key={node.id}
        className="tree-node-group"
        style={{ cursor: "pointer" }}
        transform={`translate(${String(node.x)}, ${String(node.y)})`}
        onClick={handleClick}
      >
        {/* Punto del nodo */}
        <circle cx={0} cy={0} fill="#888" r={3} />

        {/* Nombre del nodo */}
        <text
          className="node-text"
          dominantBaseline="middle"
          fill="#555"
          fontSize={11}
          fontStyle={isItalic ? "italic" : "normal"}
          fontWeight={400}
          x={8}
          y={0}
        >
          {node.name}
          {node.count !== undefined && (
            <tspan fill="#999" fontSize={10}>
              {" "}
              ({node.count})
            </tspan>
          )}
        </text>
        {/* Línea de subrayado (visible en hover) */}
        <line
          className="underline-line"
          stroke="#555"
          strokeWidth={1}
          x1={8}
          x2={String(underlineX2)}
          y1={5}
          y2={5}
        />
      </g>,
    );

    if (node.children) {
      node.children.forEach((child) => {
        const childNodes = renderNodes(child);

        childNodes.forEach((n) => nodes.push(n));
      });
    }

    return nodes;
  };

  // Expandir todo
  const expandAll = useCallback(() => {
    const newExpanded = new Set<string>(["root"]);

    const addAll = (node: TreeNodeData) => {
      if (node.children) {
        node.children.forEach((child) => {
          newExpanded.add(child.id);
          addAll(child);
        });
      }
    };

    addAll(treeData);
    setExpandedNodes(newExpanded);

    // Guardar en localStorage
    try {
      globalThis.window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(Array.from(newExpanded)),
      );
    } catch {
      // Ignorar errores de localStorage
    }
  }, [treeData]);

  const collapseAll = useCallback(() => {
    const newExpanded = new Set(["root"]);

    setExpandedNodes(newExpanded);

    // Guardar en localStorage
    try {
      globalThis.window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(Array.from(newExpanded)),
      );
    } catch {
      // Ignorar errores de localStorage
    }
  }, []);

  return (
    <div className="phylo-tree">
      {/* Header */}
      <div className="mb-4">
        <h2 className="mb-1 text-lg font-medium text-gray-700">
          Árbol Filogenético
        </h2>
        <p className="text-xs text-gray-400">
          Clic en los nodos para expandir/colapsar. Clic en especies para ver
          detalles.
        </p>
      </div>

      {/* Controles */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          className="tree-btn"
          disabled={!orders || orders.length === 0}
          type="button"
          onClick={expandAll}
        >
          Expandir
        </button>
        <button
          className="tree-btn"
          disabled={!orders || orders.length === 0}
          type="button"
          onClick={collapseAll}
        >
          Colapsar
        </button>
      </div>

      {/* Árbol SVG */}
      <div ref={containerRef} className="tree-container">
        {!orders || orders.length === 0 ? (
          <div className="flex h-[400px] items-center justify-center">
            <p className="text-gray-400">No hay especies disponibles.</p>
          </div>
        ) : (
          <svg
            ref={svgRef}
            height={dimensions.height}
            style={{
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
            width={dimensions.width}
          >
            <g transform="translate(20, 20)">
              {/* Enlaces primero (debajo de los nodos) */}
              {renderLinks(positionedTree)}

              {/* Nodos encima */}
              {renderNodes(positionedTree)}
            </g>
          </svg>
        )}
      </div>

      <style>{`
        .phylo-tree {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .tree-btn {
          padding: 5px 12px;
          font-size: 11px;
          color: #666;
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
        }
        .tree-btn:hover {
          background: #f5f5f5;
        }

        .tree-container {
          background: #fff;
          border: 1px solid #e5e5e5;
          border-radius: 8px;
          overflow: auto;
          min-height: 400px;
          max-height: 70vh;
        }

        .tree-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .tree-node-group:hover circle {
          fill: #666;
        }
        .tree-node-group:hover .node-text {
          fill: #333;
        }
        .underline-line {
          opacity: 0;
          transition: opacity 0.15s;
        }
        .tree-node-group:hover .underline-line {
          opacity: 1;
        }
        /* Calcular ancho aproximado del texto para el subrayado */
        .tree-node-group:hover .underline-line {
          stroke-dasharray: none;
        }
      `}</style>
    </div>
  );
}
