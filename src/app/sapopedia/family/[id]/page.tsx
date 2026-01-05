import { notFound } from "next/navigation";

import { CardFamilia } from "@/components/card-familia";

import getFichaFamilia from "./get-ficha-familia";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function FamilyPage({ params }: PageProps) {
  const { id } = await params;

  // Decodificar el id de la URL
  const decodedId = decodeURIComponent(id);

  // Si es un número (id_ficha_familia), usarlo directamente
  // Si no es un número (nombre del taxon con guiones), reemplazar guiones por espacios
  const sanitizedId = /^\d+$/.test(decodedId)
    ? decodedId
    : decodedId.replaceAll("-", " ");

  const fichaFamilia = await getFichaFamilia(sanitizedId);

  if (!fichaFamilia) {
    notFound();
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Contenido de la familia */}
      <main className="min-h-screen">
        <div className="mx-auto max-w-7xl px-0 sm:px-0 lg:px-0">
          <div className="flex flex-col">
            {/* Ficha técnica científica con layout fijo + scroll */}
            <div className="overflow-hidden">
              <CardFamilia fichaFamilia={fichaFamilia} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
