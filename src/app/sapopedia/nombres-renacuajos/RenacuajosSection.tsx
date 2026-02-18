"use client";

import {useState, useMemo, useEffect} from "react";
import {useSearchParams} from "next/navigation";
import RenacuajosContent from "./RenacuajosContent";
import {TaxonNombre} from "../nombres/get-taxon-nombres";

interface Idioma {
  id: number;
  nombre: string;
  codigo: string;
}

interface RenacuajosSectionProps {
  readonly idiomas: readonly Idioma[];
  readonly nombresIniciales: TaxonNombre[];
  readonly idiomaInicial: number | null;
}

export default function RenacuajosSection({
  idiomas,
  nombresIniciales,
  idiomaInicial,
}: RenacuajosSectionProps) {
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
    const currentIdioma = params.get("idioma");
    const expectedIdioma = idiomaActual?.toString() || null;

    // Solo actualizar la URL si es diferente a la actual
    if (currentIdioma !== expectedIdioma) {
      if (expectedIdioma === null) {
        params.delete("idioma");
      } else {
        params.set("idioma", expectedIdioma);
      }
      // Usar globalThis.history.replaceState para actualizar la URL sin recargar
      const newUrl = `/sapopedia/nombres-renacuajos?${params.toString()}`;
      globalThis.history.replaceState({...globalThis.history.state, as: newUrl, url: newUrl}, "", newUrl);
    }
  }, [idiomaActual, searchParams]);

  const handleIdiomaChange = (nuevoIdiomaId: number | null) => {
    // Actualizar estado inmediatamente sin esperar la navegación
    setIdiomaActual(nuevoIdiomaId);
  };

  return (
    <div className="mb-8">
      <RenacuajosContent
        nombres={nombres}
        idiomas={idiomas}
        idiomaActual={idiomaActual}
        onIdiomaChange={handleIdiomaChange}
      />
    </div>
  );
}
