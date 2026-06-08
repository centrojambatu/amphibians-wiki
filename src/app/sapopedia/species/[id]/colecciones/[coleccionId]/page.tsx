import {notFound} from "next/navigation";

import getFichaEspecie from "../../get-ficha-especie";
import getColeccionById from "./get-coleccion-by-id";
import {
  getCantosByColeccion,
  getTejidosByColeccion,
  getEspermasByColeccion,
  getHecesByColeccion,
  getExtractosPielByColeccion,
  getPrestamosColeccion,
  getPrestamosTejidoByColeccion,
  getColeccionPersonal,
  getIdentificacionesByColeccion,
  getCuerposAguaByColeccion,
  getFotografiasByColeccion,
  getVideosByColeccion,
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
    espermas,
    heces,
    extractosPiel,
    prestamosColeccion,
    prestamosTejido,
    coleccionPersonal,
    identificaciones,
    cuerposAgua,
    fotografias,
    videos,
  ] = await Promise.all([
    getColeccionById(coleccionIdNum),
    getCantosByColeccion(coleccionIdNum),
    getTejidosByColeccion(coleccionIdNum),
    getEspermasByColeccion(coleccionIdNum),
    getHecesByColeccion(coleccionIdNum),
    getExtractosPielByColeccion(coleccionIdNum),
    getPrestamosColeccion(coleccionIdNum),
    getPrestamosTejidoByColeccion(coleccionIdNum),
    getColeccionPersonal(coleccionIdNum),
    getIdentificacionesByColeccion(coleccionIdNum),
    getCuerposAguaByColeccion(coleccionIdNum),
    getFotografiasByColeccion(coleccionIdNum),
    getVideosByColeccion(coleccionIdNum),
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

  // Extraer taxonomía del lineage
  const lineage: any[] = (fichaEspecie as any)?.lineage ?? [];
  const orden = lineage.find((l: any) => l.rank?.rank === "Orden")?.taxon ?? null;
  const familia = lineage.find((l: any) => l.rank?.rank === "Familia")?.taxon ?? null;
  const genero = lineage.find((l: any) => l.rank?.rank === "Género")?.taxon ?? null;
  const especie = lineage.find((l: any) => l.rank?.rank === "especie")?.taxon ?? null;
  const nombreCientifico = genero && especie ? `${String(genero)} ${String(especie)}` : null;
  const nombreComun = (fichaEspecie as any)?.nombresComunes?.nombre_comun_espanol ?? null;

  return (
    <ColeccionDetailClient
      cantos={cantos}
      coleccion={coleccion}
      coleccionPersonal={coleccionPersonal}
      coleccionesUrl={coleccionesUrl}
      cuerposAgua={cuerposAgua}
      espermas={espermas}
      especieUrl={especieUrl}
      extractosPiel={extractosPiel}
      familia={familia}
      genero={genero}
      heces={heces}
      identificaciones={identificaciones}
      fotografias={fotografias}
      nombreCientifico={nombreCientifico}
      nombreComun={nombreComun}
      orden={orden}
      prestamosColeccion={prestamosColeccion}
      prestamosTejido={prestamosTejido}
      tejidos={tejidos}
      videos={videos}
    />
  );
}
