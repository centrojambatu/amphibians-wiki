import {notFound} from "next/navigation";

import {CardSpecies} from "@/components/card-species";

import getFichaEspecie from "../species/[id]/get-ficha-especie";

export default async function Page() {
  //  const fichaEspecie = await getFichaEspecie(Number(id));
  const fichaEspecie = await getFichaEspecie(5);

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
