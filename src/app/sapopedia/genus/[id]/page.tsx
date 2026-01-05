import { notFound } from "next/navigation";

import { CardGenero } from "@/components/card-genero";

import getFichaGenero from "./get-ficha-genero";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function GenusPage({ params }: PageProps) {
  const { id } = await params;

  // Decodificar el id de la URL
  const decodedId = decodeURIComponent(id);

  // Si es un número (id_ficha_genero), usarlo directamente
  // Si no es un número (nombre del taxon con guiones), reemplazar guiones por espacios
  const sanitizedId = /^\d+$/.test(decodedId)
    ? decodedId
    : decodedId.replaceAll("-", " ");

  const fichaGenero = await getFichaGenero(sanitizedId);

  if (!fichaGenero) {
    notFound();
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Contenido del género */}
      <main className="min-h-screen">
        <div className="mx-auto max-w-7xl px-0 sm:px-0 lg:px-0">
          <div className="flex flex-col">
            {/* Ficha técnica científica con layout fijo + scroll */}
            <div className="overflow-hidden">
              <CardGenero fichaGenero={fichaGenero} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
