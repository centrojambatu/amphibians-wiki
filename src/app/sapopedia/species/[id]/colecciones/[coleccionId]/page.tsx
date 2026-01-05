import { notFound } from "next/navigation";
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

  if (isNaN(coleccionIdNum)) {
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
