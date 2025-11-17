import Link from "next/link";
import {notFound} from "next/navigation";

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {CardSpecies} from "@/components/card-species";

import getFichaEspecie from "./get-ficha-especie";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function SpeciesPage({params}: PageProps) {
  const {id} = await params;

  // Sanitizar el id reemplazando guiones y guiones bajos por espacios
  const sanitizedId = id.replace(/[-_]/g, " ");

  const fichaEspecie = await getFichaEspecie(sanitizedId);

  if (!fichaEspecie) {
    notFound();
  }

  console.log({
    fichaEspecie,
  });

  return (
    <div className="bg-background min-h-screen">
      {/* Contenido de la especie */}
      <main className="min-h-screen">
        <div className="mx-auto max-w-7xl px-0 sm:px-0 lg:px-0">
          <div className="flex flex-col">
            {/* Ficha técnica científica con layout fijo + scroll */}
            <div className="overflow-hidden">
              <CardSpecies fichaEspecie={fichaEspecie} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
