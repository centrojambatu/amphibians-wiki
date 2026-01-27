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

  // Obtener la ficha de especie para validar y obtener datos
  const fichaEspecie = await getFichaEspecie(sanitizedId);

  if (!fichaEspecie) {
    notFound();
  }

  const taxonIdNum = fichaEspecie.taxon_id;

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

  // Obtener el nombre científico completo de la especie
  const nombreCientificoCompleto = fichaEspecie.taxones?.[0]?.taxonPadre?.taxon
    ? `${fichaEspecie.taxones[0].taxonPadre.taxon} ${fichaEspecie.taxones[0].taxon}`
    : fichaEspecie.taxones?.[0]?.taxon || "";

  // Validar que la colección pertenece a la especie indicada en la URL
  // Primero verificar si taxon_id coincide
  const taxonIdCoincide = coleccion.taxon_id === taxonIdNum;

  // Si taxon_id no coincide, validar por taxon_nombre usando comparación flexible
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
      cantos={cantos}
      coleccion={coleccion}
      coleccionPersonal={coleccionPersonal}
      coleccionesUrl={coleccionesUrl}
      cuerposAgua={cuerposAgua}
      especieUrl={especieUrl}
      identificaciones={identificaciones}
      prestamosColeccion={prestamosColeccion}
      prestamosTejido={prestamosTejido}
      tejidos={tejidos}
    />
  );
}
