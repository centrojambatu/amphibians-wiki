"use client";

import {useState, useMemo, useEffect} from "react";
import {useSearchParams} from "next/navigation";
import VernaculosContent from "./VernaculosContent";
import {TaxonNombre} from "./get-taxon-nombres";

interface Idioma {
  id: number;
  nombre: string;
  codigo: string;
}

interface VernaculosSectionProps {
  readonly idiomas: readonly Idioma[];
  readonly nombresIniciales: TaxonNombre[];
  readonly idiomaInicial: number | null;
}

export default function VernaculosSection({
  idiomas,
  nombresIniciales,
  idiomaInicial,
}: VernaculosSectionProps) {
  const searchParams = useSearchParams();
  const [idiomaActual, setIdiomaActual] = useState<number | null>(idiomaInicial);

  // Filtrar nombres por idioma en el cliente con useMemo para mejor rendimiento
  const nombres = useMemo(() => {
    if (idiomaActual === null) return nombresIniciales;
    return nombresIniciales.filter(
      (nombre) => nombre.catalogo_awe_idioma_id === idiomaActual
    );
  }, [nombresIniciales, idiomaActual]);

  // Actualizar URL de forma asíncrona sin recargar la página
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const currentIdiomaVernaculo = params.get("idiomaVernaculo");
    const expectedIdiomaVernaculo = idiomaActual?.toString() || null;

    // Solo actualizar la URL si es diferente a la actual
    if (currentIdiomaVernaculo !== expectedIdiomaVernaculo) {
      if (expectedIdiomaVernaculo === null) {
        params.delete("idiomaVernaculo");
      } else {
        params.set("idiomaVernaculo", expectedIdiomaVernaculo);
      }
      // Usar globalThis.history.replaceState para actualizar la URL sin recargar
      const newUrl = `/sapopedia/nombres-vernaculos?${params.toString()}`;
      globalThis.history.replaceState({...globalThis.history.state, as: newUrl, url: newUrl}, "", newUrl);
    }
  }, [idiomaActual, searchParams]);

  const handleIdiomaChange = (nuevoIdiomaId: number | null) => {
    // Actualizar estado inmediatamente sin esperar la navegación
    setIdiomaActual(nuevoIdiomaId);
  };

  return (
    <VernaculosContent
      nombres={nombres}
      idiomas={idiomas}
      idiomaActual={idiomaActual}
      onIdiomaChange={handleIdiomaChange}
    />
  );
}
