"use client";

import {useState, useEffect} from "react";
import {Menu} from "lucide-react";
import Link from "next/link";

import {NombreGroup, TaxonNombre} from "@/app/sapopedia/nombres/get-taxon-nombres";

interface NombresAccordionProps {
  readonly ordenes: NombreGroup[];
}

export default function NombresAccordion({ordenes}: NombresAccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(() => new Set());

  // Cargar el estado del acordeón desde localStorage al montar
  useEffect(() => {
    const savedState = localStorage.getItem("nombresAccordionOpenItems");

    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState) as string[];

        setOpenItems(() => new Set(parsedState));
      } catch (error) {
        console.error("Error al cargar el estado del acordeón:", error);
      }
    }
  }, []);

  // Guardar el estado del acordeón en localStorage cuando cambia
  useEffect(() => {
    if (openItems.size > 0) {
      localStorage.setItem("nombresAccordionOpenItems", JSON.stringify(Array.from(openItems)));
    } else {
      localStorage.removeItem("nombresAccordionOpenItems");
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

  const renderNombre = (taxon: TaxonNombre) => {
    // Determinar la URL: usar nombre científico si está disponible, sino usar id_taxon
    const href = taxon.nombre_cientifico
      ? `/sapopedia/species/${taxon.nombre_cientifico.replace(/ /g, "-")}`
      : `/sapopedia/species/${taxon.id_taxon}`;

    return (
      <div
        key={taxon.id_taxon}
        className="relative flex items-center gap-4 rounded-md border border-border bg-card px-4 py-3 transition-all hover:border-border hover:bg-muted/50"
      >
        <div className="min-w-0 flex-1">
          <Link
            className="cursor-pointer text-sm font-medium text-foreground hover:text-primary hover:no-underline"
            href={href}
          >
            {taxon.nombre_comun_completo || taxon.nombre_comun}
          </Link>
          {taxon.nombre_cientifico && (
            <div className="mt-1 text-xs text-muted-foreground italic">{taxon.nombre_cientifico}</div>
          )}
        </div>
      </div>
    );
  };

  const renderGenero = (genero: NombreGroup) => (
    <div key={genero.id} className="relative">
      <div
        className="relative flex w-full cursor-pointer items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-3"
        role="button"
        tabIndex={0}
        onClick={() => toggleItem(genero.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleItem(genero.id);
          }
        }}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground italic">{genero.name}</span>
            {genero.nombre_comun && (
              <span className="text-xs text-muted-foreground">{genero.nombre_comun}</span>
            )}
          </div>
        </div>

        {/* Icono de barras */}
        <div className="ml-3 flex-shrink-0 text-muted-foreground">
          <Menu className="h-4 w-4" />
        </div>
      </div>

      {isOpen(genero.id) && (
        <div className="mt-3 rounded-lg bg-muted p-4">
          {/* Mostrar especies directamente, sin agrupamiento por nombre base */}
          <div className="mb-3 px-4 py-2">
            <div className="mb-2 text-xs text-muted-foreground">Especies</div>
          </div>
          <div className="space-y-2">{genero.nombres.map((taxon) => renderNombre(taxon))}</div>
        </div>
      )}
    </div>
  );

  const renderFamilia = (familia: NombreGroup) => (
    <div key={familia.id} className="relative">
      <div
        className="relative flex w-full cursor-pointer items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-3"
        role="button"
        tabIndex={0}
        onClick={() => toggleItem(familia.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleItem(familia.id);
          }
        }}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground">{familia.name}</span>
            {familia.nombre_comun && (
              <span className="text-xs text-muted-foreground">{familia.nombre_comun}</span>
            )}
          </div>
        </div>

        {/* Icono de barras */}
        <div className="ml-3 flex-shrink-0 text-muted-foreground">
          <Menu className="h-4 w-4" />
        </div>
      </div>

      {isOpen(familia.id) && (
        <div className="mt-3 rounded-lg bg-muted p-4">
          {/* Header de géneros */}
          <div className="mb-3 px-4 py-2">
            <div className="text-xs text-muted-foreground">Géneros</div>
          </div>
          {/* Lista de géneros */}
          <div className="space-y-2">{familia.children?.map((genero) => renderGenero(genero))}</div>
        </div>
      )}
    </div>
  );

  const renderOrden = (orden: NombreGroup) => (
    <div key={orden.id} className="relative mb-4">
      <div
        className="relative flex w-full cursor-pointer items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-3"
        role="button"
        tabIndex={0}
        onClick={() => toggleItem(orden.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleItem(orden.id);
          }
        }}
      >
        <div className="flex-1">
          <span className="inline-block text-sm text-foreground">{orden.name}</span>
          <p className="text-xs text-muted-foreground">{orden.children?.length || 0} familias</p>
        </div>

        {/* Icono de barras */}
        <div className="ml-3 flex-shrink-0 text-muted-foreground">
          <Menu className="h-4 w-4" />
        </div>
      </div>

      {isOpen(orden.id) && (
        <div className="mt-3 rounded-lg bg-muted p-4">
          {/* Header de familias */}
          <div className="mb-3 px-4 py-2">
            <div className="text-xs text-gray-400">Familias</div>
          </div>
          {/* Lista de familias */}
          <div className="space-y-3">
            {orden.children?.map((familia) => renderFamilia(familia))}
          </div>
        </div>
      )}
    </div>
  );

  if (ordenes.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted p-8 text-center">
        <p className="text-muted-foreground">No hay nombres comunes disponibles.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Header de órdenes */}
      <div className="mb-4 px-4 py-2">
        <div className="text-xs text-muted-foreground">Órdenes</div>
      </div>

      <div className="space-y-4">{ordenes.map((orden) => renderOrden(orden))}</div>
    </div>
  );
}
