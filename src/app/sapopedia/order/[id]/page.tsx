import { notFound } from "next/navigation";

import { CardOrden } from "@/components/card-orden";

import getFichaOrden from "./get-ficha-orden";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OrderPage({ params }: PageProps) {
  const { id } = await params;

  // Decodificar el id de la URL
  const decodedId = decodeURIComponent(id);

  // Si es un número (id_ficha_orden o taxon_id), usarlo directamente
  // Si no es un número (nombre del taxon con guiones), reemplazar guiones por espacios
  const sanitizedId = /^\d+$/.test(decodedId)
    ? decodedId
    : decodedId.replaceAll("-", " ");

  const fichaOrden = await getFichaOrden(sanitizedId);

  if (!fichaOrden) {
    notFound();
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Contenido del orden */}
      <main className="min-h-screen">
        <div className="mx-auto max-w-7xl px-0 sm:px-0 lg:px-0">
          <div className="flex flex-col">
            {/* Ficha técnica científica con layout fijo + scroll */}
            <div className="overflow-hidden">
              <CardOrden fichaOrden={fichaOrden} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
