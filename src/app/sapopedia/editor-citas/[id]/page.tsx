import { notFound } from "next/navigation";

import EditorCitas from "@/components/EditorCitas";
import EditorAuthWrapper from "@/components/EditorAuthWrapper";

import getFichaEspecieEditor from "../get-ficha-especie-editor";
import getPublicacionesTaxon from "../get-publicaciones-taxon";
import {
  getSiguienteEspecie,
  getAnteriorEspecie,
  fromSlug,
} from "../get-especies-navegacion";
import { getAllCatalogoAweOpciones } from "../get-catalogo-awe-opciones";
import { getAllTaxonCatalogoAwe } from "../get-taxon-catalogo-awe";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditorCitasPage({ params }: PageProps) {
  const { id } = await params;

  // El id viene como slug del nombre científico (con guiones)
  // Convertir de slug a nombre científico
  const nombreCientifico = fromSlug(id);

  // Buscar el taxon_id desde el nombre científico usando la vista vw_ficha_especie_completa
  // para asegurar consistencia con el visor de especies
  const { createServiceClient } = await import("@/utils/supabase/server");
  const supabaseClient = createServiceClient();

  // Primero intentar buscar en la vista vw_ficha_especie_completa por nombre científico
  // Buscar tanto por nombre completo como por solo especie (por si el slug solo tiene la especie)
  const { data: vistaData, error: errorVista } = await (supabaseClient as any)
    .from("vw_ficha_especie_completa")
    .select(
      "especie_taxon_id, id_ficha_especie, nombre_cientifico, genero, especie",
    )
    .or(
      `nombre_cientifico.eq.${nombreCientifico},especie.eq.${nombreCientifico}`,
    )
    .single();

  let taxonId: number | null = null;
  let idFichaEspecie: number | null = null;
  let nombreCientificoCompleto: string = nombreCientifico;

  if (!errorVista && vistaData) {
    taxonId = vistaData.especie_taxon_id as number;
    idFichaEspecie = vistaData.id_ficha_especie as number;
    // Usar el nombre_cientifico completo de la vista (género + especie)
    nombreCientificoCompleto = vistaData.nombre_cientifico || nombreCientifico;
    console.log("✅ Datos encontrados en vista:", {
      nombre_cientifico: vistaData.nombre_cientifico,
      genero: vistaData.genero,
      especie: vistaData.especie,
      taxon_id: taxonId,
      id_ficha_especie: idFichaEspecie,
    });
  } else {
    // Fallback: buscar en la tabla taxon directamente
    console.warn("⚠️ No se encontró en vista, buscando en taxon directamente");
    const { data: taxonData } = await supabaseClient
      .from("taxon")
      .select("id_taxon, taxon")
      .eq("taxon", nombreCientifico)
      .single();

    if (!taxonData) {
      console.error("❌ No se encontró taxon para:", nombreCientifico);
      notFound();
    }

    taxonId = taxonData.id_taxon;
    nombreCientificoCompleto = taxonData.taxon || nombreCientifico;
  }

  if (!taxonId) {
    console.error("❌ No se pudo obtener taxon_id para:", nombreCientifico);
    notFound();
  }

  // Obtener datos en paralelo
  const [
    fichaEspecie,
    publicaciones,
    siguienteEspecie,
    anteriorEspecie,
    catalogoAweOpciones,
    taxonCatalogoAwe,
  ] = await Promise.all([
    getFichaEspecieEditor(taxonId, idFichaEspecie),
    getPublicacionesTaxon(taxonId),
    getSiguienteEspecie(taxonId),
    getAnteriorEspecie(taxonId),
    getAllCatalogoAweOpciones(),
    getAllTaxonCatalogoAwe(taxonId),
  ]);

  if (!fichaEspecie) {
    notFound();
  }

  return (
    <EditorAuthWrapper>
      <EditorCitas
        anteriorEspecie={anteriorEspecie}
        catalogoAweOpciones={catalogoAweOpciones}
        fichaEspecie={fichaEspecie}
        nombreCientifico={nombreCientificoCompleto}
        publicaciones={publicaciones}
        siguienteEspecie={siguienteEspecie}
        taxonCatalogoAwe={taxonCatalogoAwe}
        taxonId={taxonId}
      />
    </EditorAuthWrapper>
  );
}
