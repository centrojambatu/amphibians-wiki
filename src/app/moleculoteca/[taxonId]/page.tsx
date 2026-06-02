import {notFound} from "next/navigation";

import {getColeccionMuestras} from "./get-coleccion-muestras";
import MoleculotecaTaxonClient from "./MoleculotecaTaxonClient";

interface PageProps {
  params: Promise<{taxonId: string}>;
}

export default async function MoleculotecaTaxonPage({params}: PageProps) {
  const {taxonId} = await params;
  const taxonIdNum = Number.parseInt(taxonId, 10);

  if (isNaN(taxonIdNum)) notFound();

  const muestras = await getColeccionMuestras(taxonIdNum);

  if (muestras.length === 0) notFound();

  const nombreCientifico = muestras[0]?.nombre_cientifico || "Especie";

  return <MoleculotecaTaxonClient muestras={muestras} nombreCientifico={nombreCientifico} />;
}
