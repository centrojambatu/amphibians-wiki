import { notFound } from "next/navigation";

import { CardSpecies } from "@/components/card-species";

import getFichaEspecie from "./get-ficha-especie";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SpeciesPage({ params }: PageProps) {
  const { id } = await params;

  // Decodificar el id de la URL
  const decodedId = decodeURIComponent(id);

  // Si es un número (id_ficha_especie), usarlo directamente
  // Si no es un número (nombre científico con guiones), reemplazar guiones por espacios
  // Esto coincide con el formato usado en el acordeón: nombre_cientifico.replaceAll(" ", "-")
  const sanitizedId = /^\d+$/.test(decodedId)
    ? decodedId
    : decodedId.replaceAll("-", " ");

  const fichaEspecie = await getFichaEspecie(sanitizedId);

  if (!fichaEspecie) {
    notFound();
  }

  return (
    <div className="bg-background min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col">
          <div className="overflow-hidden">
            <CardSpecies fichaEspecie={fichaEspecie} />
          </div>
        </div>
      </main>
    </div>
  );
}
