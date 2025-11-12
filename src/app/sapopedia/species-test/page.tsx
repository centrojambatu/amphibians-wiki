import Link from "next/link";

import {Card, CardHeader} from "@/components/ui/card";
import {Separator} from "@/components/ui/separator";
import {CardSpecies} from "@/components/card-species";
// import Link from "next/dist/client/link";

export default function Page() {
  return (
    <div className="bg-background min-h-screen">
      {/* Contenido de la especie */}
      <main className="min-h-screen">
        <div className="mx-auto max-w-7xl px-0 sm:px-0 lg:px-0">
          <div className="flex flex-col">
            {/* Ficha técnica científica con layout fijo + scroll */}
            <div className="overflow-hidden">
              <CardSpecies />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
