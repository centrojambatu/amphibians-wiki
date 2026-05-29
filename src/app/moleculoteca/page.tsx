import {Dna} from "lucide-react";

import {getMoleculotecaTaxa} from "./get-moleculoteca-taxa";
import MoleculotecaListClient from "./MoleculotecaListClient";

interface SearchParams {
  busqueda?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function MoleculotecaPage({searchParams}: PageProps) {
  const params = await searchParams;
  const taxa = await getMoleculotecaTaxa(params.busqueda);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <Dna className="h-10 w-10 text-green-600" />
          <h1 className="text-4xl font-bold text-gray-900">Moleculoteca</h1>
        </div>
        <p className="text-muted-foreground max-w-3xl text-base">
          Especies con muestras biológicas (sangre, piel, tejidos, esqueleto, esperma, heces) en
          la colección.
        </p>
      </div>

      <MoleculotecaListClient taxa={taxa} />
    </main>
  );
}
