"use client";

import {useState, useTransition} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import VernaculosContent from "./VernaculosContent";
import {TaxonNombre} from "./get-taxon-nombres";

interface Idioma {
  id: number;
  nombre: string;
  codigo: string;
}

interface VernaculosSectionProps {
  idiomas: readonly Idioma[];
  nombresIniciales: TaxonNombre[];
  idiomaInicial: number | null;
}

export default function VernaculosSection({
  idiomas,
  nombresIniciales,
  idiomaInicial,
}: VernaculosSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [idiomaActual, setIdiomaActual] = useState<number | null>(idiomaInicial);

  // Filtrar nombres por idioma en el cliente (mucho más rápido)
  const nombres = nombresIniciales.filter((nombre) => {
    // Si no hay idioma seleccionado, mostrar todos
    if (idiomaActual === null) return true;
    // Filtrar por idioma usando catalogo_awe_idioma_id
    return nombre.catalogo_awe_idioma_id === idiomaActual;
  });

  const handleIdiomaChange = (nuevoIdiomaId: number | null) => {
    setIdiomaActual(nuevoIdiomaId);

    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (nuevoIdiomaId === null) {
        params.delete("idiomaVernaculo");
      } else {
        params.set("idiomaVernaculo", nuevoIdiomaId.toString());
      }
      router.push(`/sapopedia/nombres?${params.toString()}`);
    });
  };

  return (
    <div className="mb-8">
      <h2 className="mb-6 text-2xl font-bold">Nombres Vernáculos</h2>
      {isPending ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Actualizando...</p>
        </div>
      ) : (
        <VernaculosContent
          nombres={nombres}
          idiomas={idiomas}
          idiomaActual={idiomaActual}
          onIdiomaChange={handleIdiomaChange}
        />
      )}
    </div>
  );
}
