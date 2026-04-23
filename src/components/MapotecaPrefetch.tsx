"use client";

import { useEffect, useRef } from "react";

import { usePrefetchMapoteca } from "@/hooks/use-mapoteca-data";

/**
 * Componente invisible que pre-descarga los datos de la Mapoteca en background.
 * Colócalo en la página Home/inicio para que cuando el usuario navegue a la Mapoteca,
 * los datos ya estén en cache (TanStack Query + IndexedDB).
 */
export default function MapotecaPrefetch() {
  const prefetch = usePrefetchMapoteca();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    // Esperar 2s para no competir con recursos críticos de la página
    const timer = setTimeout(() => prefetch(), 2000);
    return () => clearTimeout(timer);
  }, [prefetch]);

  return null;
}
