import {notFound} from "next/navigation";

import getFichaEspecie from "../../get-ficha-especie";
import getColeccionById from "./get-coleccion-by-id";
import {
  getCantosByColeccion,
  getTejidosByColeccion,
  getPrestamosColeccion,
  getPrestamosTejidoByColeccion,
  getColeccionPersonal,
  getIdentificacionesByColeccion,
  getCuerposAguaByColeccion,
  getMediaByColeccion,
} from "./get-coleccion-relacionados";
import ColeccionDetailClient from "./coleccion-detail-client";

interface PageProps {
  params: Promise<{
    id: string;
    coleccionId: string;
  }>;
}

export default async function ColeccionDetailPage({params}: PageProps) {
  const {id, coleccionId} = await params;

  const coleccionIdNum = Number.parseInt(coleccionId, 10);

  if (isNaN(coleccionIdNum)) {
    notFound();
  }

  // Decodificar el id de la URL (puede ser número o nombre científico)
  const decodedId = decodeURIComponent(id);
  const sanitizedId = /^\d+$/.test(decodedId) ? decodedId : decodedId.replaceAll("-", " ");

  // Obtener la ficha de especie para validar y obtener datos (solo si parece ser una especie)
  // Registros a nivel de género/familia/orden tienen ambas palabras capitalizadas (e.g. "Amphibia Anura")
  const looksLikeSpecies = / [a-z]/.test(sanitizedId) || /^\d+$/.test(sanitizedId);
  const fichaEspecie = looksLikeSpecies ? await getFichaEspecie(sanitizedId) : null;

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
    mediaColeccion,
  ] = await Promise.all([
    getColeccionById(coleccionIdNum),
    getCantosByColeccion(coleccionIdNum),
    getTejidosByColeccion(coleccionIdNum),
    getPrestamosColeccion(coleccionIdNum),
    getPrestamosTejidoByColeccion(coleccionIdNum),
    getColeccionPersonal(coleccionIdNum),
    getIdentificacionesByColeccion(coleccionIdNum),
    getCuerposAguaByColeccion(coleccionIdNum),
    getMediaByColeccion(coleccionIdNum),
  ]);

  if (!coleccion) {
    notFound();
  }

  // Validar que la colección pertenece al taxón indicado en la URL (solo si hay ficha de especie)
  if (fichaEspecie) {
    const taxonIdNum = fichaEspecie.taxon_id;
    const nombreCientificoCompleto = fichaEspecie.taxones?.[0]?.taxonPadre?.taxon
      ? `${fichaEspecie.taxones[0].taxonPadre.taxon} ${fichaEspecie.taxones[0].taxon}`
      : fichaEspecie.taxones?.[0]?.taxon || "";

    const taxonIdCoincide = coleccion.taxon_id === taxonIdNum;

    if (!taxonIdCoincide) {
      const coleccionTaxonNombre = coleccion.taxon_nombre?.toLowerCase().trim() || "";
      const nombreCientificoLower = nombreCientificoCompleto.toLowerCase().trim();

      const nombresCoinciden =
        coleccionTaxonNombre &&
        (coleccionTaxonNombre.includes(nombreCientificoLower) ||
          nombreCientificoLower.includes(coleccionTaxonNombre));

      if (!nombresCoinciden) {
        notFound();
      }
    }
  }

  // Construir URLs de navegación
  const especieUrl = `/sapopedia/species/${encodeURIComponent(id)}`;
  const coleccionesUrl = `${especieUrl}/colecciones`;

  return (
    <ColeccionDetailClient
      cantos={cantos}
      coleccion={coleccion}
      coleccionPersonal={coleccionPersonal}
      coleccionesUrl={coleccionesUrl}
      cuerposAgua={cuerposAgua}
      especieUrl={especieUrl}
      identificaciones={identificaciones}
      mediaColeccion={mediaColeccion}
      prestamosColeccion={prestamosColeccion}
      prestamosTejido={prestamosTejido}
      tejidos={tejidos}
    />
  );
}
