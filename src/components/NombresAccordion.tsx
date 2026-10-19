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

  // Especies bajo un grupo (género: sus nombres; familia/orden: suma de los hijos)
  const contarEspecies = (grupo: NombreGroup): number =>
    grupo.children?.length
      ? grupo.children.reduce((total, hijo) => total + contarEspecies(hijo), 0)
      : grupo.nombres.length;

  const plural = (n: number, singular: string, pluralForm: string) =>
    `${n} ${n === 1 ? singular : pluralForm}`;

  const renderNombre = (taxon: TaxonNombre) => {
    // Determinar la URL: usar nombre científico si está disponible, sino usar id_taxon
    const href = taxon.nombre_cientifico
      ? `/sapopedia/species/${taxon.nombre_cientifico.replace(/ /g, "-")}`
      : `/sapopedia/species/${taxon.id_taxon}`;

    return (
      <div
        key={taxon.id_taxon}
        className="border-border bg-card hover:bg-muted/50 relative flex items-center gap-4 rounded-md border px-4 py-3 transition-all"
      >
        <div className="min-w-0 flex-1">
          <Link
            className="text-foreground text-sm font-medium hover:no-underline"
            href={href}
          >
            {taxon.nombre_comun_completo || taxon.nombre_comun}
          </Link>
          {taxon.nombre_cientifico && (
            <div className="text-muted-foreground mt-1 text-xs italic">{taxon.nombre_cientifico}</div>
          )}
        </div>
      </div>
    );
  };

  const renderGenero = (genero: NombreGroup) => (
    <div key={genero.id} className="relative">
      <div
        className="border-border bg-card relative flex w-full cursor-pointer items-center justify-between rounded-md border px-4 py-3"
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
            <span className="text-foreground text-sm italic">{genero.name}</span>
            {genero.nombre_comun && (
              <span className="text-muted-foreground text-xs">{genero.nombre_comun}</span>
            )}
          </div>
          <p className="text-xs text-gray-500">
            {plural(contarEspecies(genero), "especie", "especies")}
          </p>
        </div>

        {/* Icono de barras */}
        <div className="text-muted-foreground ml-3 flex-shrink-0">
          <Menu className="h-4 w-4" />
        </div>
      </div>

      {isOpen(genero.id) && (
        <div className="mt-3 rounded-lg pt-4 pr-0 pb-4 pl-4">
          {/* Lista de especies — pr-0 para alinear borde derecho con el resto de cards */}
          <div className="space-y-2 pl-6">{genero.nombres.map((taxon) => renderNombre(taxon))}</div>
        </div>
      )}
    </div>
  );

  const renderFamilia = (familia: NombreGroup) => (
    <div key={familia.id} className="relative">
      <div
        className="border-border bg-card relative flex w-full cursor-pointer items-center justify-between rounded-md border px-4 py-3"
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
            <span className="text-sm text-gray-600">{familia.name}</span>
            {familia.nombre_comun && (
              <span className="text-muted-foreground text-xs">{familia.nombre_comun}</span>
            )}
          </div>
          <p className="text-xs text-gray-500">
            {plural(contarEspecies(familia), "especie", "especies")}{" "}
            <span className="text-[#f07304]">|</span>{" "}
            {plural(familia.children?.length || 0, "género", "géneros")}
          </p>
        </div>

        {/* Icono de barras */}
        <div className="text-muted-foreground ml-3 flex-shrink-0">
          <Menu className="h-4 w-4" />
        </div>
      </div>

      {isOpen(familia.id) && (
        <div className="mt-3 rounded-lg pt-4 pr-0 pb-4 pl-4">
          {/* Lista de géneros — pr-0 para alinear borde derecho con el resto de cards */}
          <div className="space-y-2 pl-6">
            {familia.children?.map((genero) => renderGenero(genero))}
          </div>
        </div>
      )}
    </div>
  );

  const renderOrden = (orden: NombreGroup) => (
    <div key={orden.id} className="relative mb-4">
      <div
        className="border-border bg-card relative flex w-full cursor-pointer items-center justify-between rounded-md border px-4 py-3"
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
          <span className="inline-block text-sm text-gray-600">{orden.name}</span>
          <p className="text-xs text-gray-500">
            {plural(contarEspecies(orden), "especie", "especies")}{" "}
            <span className="text-[#f07304]">|</span>{" "}
            {plural(orden.children?.length || 0, "familia", "familias")}
          </p>
        </div>

        {/* Icono de barras */}
        <div className="text-muted-foreground ml-3 flex-shrink-0">
          <Menu className="h-4 w-4" />
        </div>
      </div>

      {isOpen(orden.id) && (
        <div className="mt-3 rounded-lg pt-4 pr-0 pb-4 pl-4">
          {/* Lista de familias — pr-0 para que el borde derecho de las cards coincida con el de orden */}
          <div className="space-y-3 pl-6">
            {orden.children?.map((familia) => renderFamilia(familia))}
          </div>
        </div>
      )}
    </div>
  );

  if (ordenes.length === 0) {
    return (
      <div className="border-border bg-card rounded-lg border p-8 text-center">
        <p className="text-muted-foreground">No hay nombres comunes disponibles.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div className="space-y-4">{ordenes.map((orden) => renderOrden(orden))}</div>
    </div>
  );
}
