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

  // Agrupar especies por categoría de lista roja
  const especiesPorCategoria = categorias
    .map((categoria) => {
      const especiesEnCategoria = especies.filter(
        (e) => e.lista_roja_iucn === categoria.sigla,
      );

      return {
        categoria,
        especies: especiesEnCategoria,
      };
    })
    .filter((grupo) => grupo.especies.length > 0)
    .sort((a, b) => {
      // Ordenar por orden de importancia de las categorías
      const orden = ["CR", "EN", "VU", "NT", "LC", "DD", "EW", "EX"];

      const indexA = orden.indexOf(a.categoria.sigla || "");
      const indexB = orden.indexOf(b.categoria.sigla || "");

      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;

      return indexA - indexB;
    });

  const renderSpecies = (species: SpeciesListItem) => (
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
            showTooltip={false}
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
              occidente: species.has_distribucion_occidental
                ? {min: species.rango_altitudinal_min, max: species.rango_altitudinal_max}
                : undefined,
              oriente: species.has_distribucion_oriental
                ? {min: species.rango_altitudinal_min, max: species.rango_altitudinal_max}
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
          className="relative flex w-full cursor-pointer items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-3"
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
              <span className="text-sm font-semibold text-gray-800">{grupo.categoria.nombre}</span>
            </div>
            <p className="text-xs text-gray-400">
              {grupo.especies.length} especie{grupo.especies.length !== 1 ? "s" : ""} (
              {especiesEndemicas} endémica{especiesEndemicas !== 1 ? "s" : ""})
            </p>
          </div>

          {/* Icono de barras */}
          <div className="ml-3 flex-shrink-0 text-gray-300">
            <Menu className="h-4 w-4" />
          </div>
        </div>

        {isOpen(categoriaId) && (
          <div className="mt-3 rounded-lg bg-gray-50 p-4">
            {/* Header de la tabla */}
            <div className="mb-3 px-4 py-2">
              <div className="mb-2 text-xs text-gray-400">Especies</div>
              <div className="flex items-center gap-4 text-xs text-gray-400">
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
    <div className="space-y-3">
      {especiesPorCategoria.map((grupo) => renderCategoria(grupo))}
    </div>
  );
}

