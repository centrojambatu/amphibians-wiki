import { notFound } from "next/navigation";

import { slugANombreCientifico } from "@/lib/species-slug";

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

  // Número = id_ficha_especie; si no, slug "Genero-epiteto" (ver slugANombreCientifico)
  const sanitizedId = slugANombreCientifico(decodedId);

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
