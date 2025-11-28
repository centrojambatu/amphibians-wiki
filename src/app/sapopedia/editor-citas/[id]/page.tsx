import {notFound} from "next/navigation";

import EditorCitas from "@/components/EditorCitas";
import getFichaEspecieEditor from "../get-ficha-especie-editor";
import getPublicacionesTaxon from "../get-publicaciones-taxon";
import {getSiguienteEspecie, getAnteriorEspecie, fromSlug} from "../get-especies-navegacion";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditorCitasPage({params}: PageProps) {
  const {id} = await params;

  // El id viene como slug del nombre científico (con guiones)
  // Convertir de slug a nombre científico
  const nombreCientifico = fromSlug(id);

  // Buscar el taxon_id desde el nombre científico
  const {createServiceClient} = await import("@/utils/supabase/server");
  const supabaseClient = createServiceClient();

  const {data: taxonData} = await supabaseClient
    .from("taxon")
    .select("id_taxon, taxon")
    .eq("taxon", nombreCientifico)
    .single();

  if (!taxonData) {
    notFound();
  }

  const taxonId = taxonData.id_taxon;

  // Obtener datos en paralelo
  const [fichaEspecie, publicaciones, siguienteEspecie, anteriorEspecie] = await Promise.all([
    getFichaEspecieEditor(taxonId),
    getPublicacionesTaxon(taxonId),
    getSiguienteEspecie(taxonId),
    getAnteriorEspecie(taxonId),
  ]);

  if (!fichaEspecie) {
    notFound();
  }

  return (
    <EditorCitas
      fichaEspecie={fichaEspecie}
      publicaciones={publicaciones}
      nombreCientifico={nombreCientifico}
      taxonId={taxonId}
      siguienteEspecie={siguienteEspecie}
      anteriorEspecie={anteriorEspecie}
    />
  );
}

