import { notFound } from "next/navigation";
import { createServiceClient } from "@/utils/supabase/server";
import getColeccionById from "./get-coleccion-by-id";
import {
  getCantosByColeccion,
  getTejidosByColeccion,
  getPrestamosColeccion,
  getPrestamosTejidoByColeccion,
  getColeccionPersonal,
  getIdentificacionesByColeccion,
  getCuerposAguaByColeccion,
} from "./get-coleccion-relacionados";
import ColeccionDetailClient from "./coleccion-detail-client";

interface PageProps {
  params: Promise<{
    id: string;
    coleccionId: string;
  }>;
}

export default async function ColeccionDetailPage({ params }: PageProps) {
  const { id, coleccionId } = await params;

  const coleccionIdNum = Number.parseInt(coleccionId, 10);
  const taxonIdNum = Number.parseInt(id, 10);

  if (isNaN(coleccionIdNum) || isNaN(taxonIdNum)) {
    notFound();
  }

  // Fetch colección y todos los datos relacionados en paralelo
  const [
    coleccion,
    cantos,
    tejidos,
    prestamosColeccion,
    prestamosTejido,
    coleccionPersonal,
    identificaciones,
    cuerposAgua,
  ] = await Promise.all([
    getColeccionById(coleccionIdNum),
    getCantosByColeccion(coleccionIdNum),
    getTejidosByColeccion(coleccionIdNum),
    getPrestamosColeccion(coleccionIdNum),
    getPrestamosTejidoByColeccion(coleccionIdNum),
    getColeccionPersonal(coleccionIdNum),
    getIdentificacionesByColeccion(coleccionIdNum),
    getCuerposAguaByColeccion(coleccionIdNum),
  ]);

  if (!coleccion) {
    notFound();
  }

  // Validar que la colección pertenece a la especie indicada en la URL
  // Como taxon_id está NULL en todas las colecciones, validamos por taxon_nombre
  // que contiene el nombre científico completo de la especie
  const supabaseClient = createServiceClient();
  
  // Obtener el nombre científico completo de la especie (género + especie)
  const { data: taxonData, error: taxonError } = await supabaseClient
    .from("taxon")
    .select("taxon, taxon_id")
    .eq("id_taxon", taxonIdNum)
    .single();

  if (taxonError || !taxonData) {
    notFound();
  }

  // Obtener el género (taxon padre)
  let nombreCientificoCompleto = taxonData.taxon || "";
  if (taxonData.taxon_id) {
    const { data: generoData } = await supabaseClient
      .from("taxon")
      .select("taxon")
      .eq("id_taxon", taxonData.taxon_id)
      .single();

    if (generoData?.taxon) {
      nombreCientificoCompleto = `${generoData.taxon} ${nombreCientificoCompleto}`;
    }
  }

  // Validar que el taxon_nombre de la colección coincida con el nombre científico
  // Primero verificar si taxon_id coincide (por si acaso se llena en el futuro)
  const taxonIdCoincide = coleccion.taxon_id === taxonIdNum;
  
  // Si taxon_id no coincide, validar por taxon_nombre usando comparación flexible
  // (case-insensitive, parcial) como en getColeccionesEspecie
  if (!taxonIdCoincide) {
    const coleccionTaxonNombre = coleccion.taxon_nombre?.toLowerCase().trim() || "";
    const nombreCientificoLower = nombreCientificoCompleto.toLowerCase().trim();
    
    // Verificar coincidencia: el taxon_nombre debe contener el nombre científico o viceversa
    const nombresCoinciden =
      coleccionTaxonNombre &&
      (coleccionTaxonNombre.includes(nombreCientificoLower) ||
        nombreCientificoLower.includes(coleccionTaxonNombre));
    
    if (!nombresCoinciden) {
      notFound();
    }
  }

  // Construir URLs de navegación
  const especieUrl = `/sapopedia/species/${encodeURIComponent(id)}`;
  const coleccionesUrl = `${especieUrl}/colecciones`;

  return (
    <ColeccionDetailClient
      coleccion={coleccion}
      cantos={cantos}
      tejidos={tejidos}
      prestamosColeccion={prestamosColeccion}
      prestamosTejido={prestamosTejido}
      coleccionPersonal={coleccionPersonal}
      identificaciones={identificaciones}
      cuerposAgua={cuerposAgua}
      especieUrl={especieUrl}
      coleccionesUrl={coleccionesUrl}
    />
  );
}
