import {notFound} from "next/navigation";

import MoleculotecaTaxonClient from "./MoleculotecaTaxonClient";

interface PageProps {
  params: Promise<{taxonId: string}>;
}

export default async function MoleculotecaTaxonPage({params}: PageProps) {
  const {taxonId} = await params;
  const taxonIdNum = Number.parseInt(taxonId, 10);

  if (isNaN(taxonIdNum)) notFound();

  return <MoleculotecaTaxonClient taxonId={taxonIdNum} />;
}
