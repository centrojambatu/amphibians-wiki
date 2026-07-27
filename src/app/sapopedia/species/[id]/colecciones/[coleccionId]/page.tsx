import {notFound} from "next/navigation";

import {createServiceClient} from "@/utils/supabase/server";

import getFichaEspecie from "../../get-ficha-especie";
import getColeccionById from "./get-coleccion-by-id";
import {
  getCantosByColeccion,
  getTejidosByColeccion,
  getEspermasByColeccion,
  getHecesByColeccion,
  getExtractosPielByColeccion,
  getSwabsByColeccion,
  getSecuenciasByColeccion,
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

// La colección se identifica de forma única por su id. El slug del URL solo
// se usa para el breadcrumb / back link. Si el slug no corresponde al taxón
// real de la colección, buscamos la ficha correcta por `especie_taxon_id`.
async function resolveFichaEspecie(
  urlSlug: string,
  coleccionTaxonId: number | null,
) {
  const decoded = decodeURIComponent(urlSlug);
  const sanitized = /^\d+$/.test(decoded) ? decoded : decoded.replaceAll("-", " ");
  const looksLikeSpecies = / [a-z]/.test(sanitized) || /^\d+$/.test(sanitized);

  const fichaFromUrl = looksLikeSpecies ? await getFichaEspecie(sanitized) : null;

  if (fichaFromUrl && (!coleccionTaxonId || fichaFromUrl.taxon_id === coleccionTaxonId)) {
    return fichaFromUrl;
  }

  if (!coleccionTaxonId) return fichaFromUrl;

  const supabase = createServiceClient();
  const {data: match} = await (supabase as any)
    .from("vw_ficha_especie_completa")
    .select("nombre_cientifico")
    .eq("especie_taxon_id", coleccionTaxonId)
    .maybeSingle();

  if (match?.nombre_cientifico) {
    const alt = await getFichaEspecie(match.nombre_cientifico as string);
    if (alt) return alt;
  }

  return fichaFromUrl;
}

export default async function ColeccionDetailPage({params}: PageProps) {
  const {id, coleccionId} = await params;

  const coleccionIdNum = Number.parseInt(coleccionId, 10);

  if (isNaN(coleccionIdNum)) {
    notFound();
  }

  const coleccion = await getColeccionById(coleccionIdNum);

  if (!coleccion) {
    notFound();
  }

  const fichaEspecie = await resolveFichaEspecie(id, coleccion.taxon_id ?? null);

  const [
    cantos,
    tejidos,
    espermas,
    heces,
    extractosPiel,
    swabs,
    secuencias,
    prestamosColeccion,
    prestamosTejido,
    coleccionPersonal,
    identificaciones,
    cuerposAgua,
    fotografias,
    videos,
  ] = await Promise.all([
    getCantosByColeccion(coleccionIdNum),
    getTejidosByColeccion(coleccionIdNum),
    getEspermasByColeccion(coleccionIdNum),
    getHecesByColeccion(coleccionIdNum),
    getExtractosPielByColeccion(coleccionIdNum),
    getSwabsByColeccion(coleccionIdNum),
    getSecuenciasByColeccion(coleccionIdNum),
    getPrestamosColeccion(coleccionIdNum),
    getPrestamosTejidoByColeccion(coleccionIdNum),
    getColeccionPersonal(coleccionIdNum),
    getIdentificacionesByColeccion(coleccionIdNum),
    getCuerposAguaByColeccion(coleccionIdNum),
    getFotografiasByColeccion(coleccionIdNum),
    getVideosByColeccion(coleccionIdNum),
  ]);

  // Extraer taxonomía del lineage
  const lineage: any[] = (fichaEspecie as any)?.lineage ?? [];
  const orden = lineage.find((l: any) => l.rank?.rank === "Orden")?.taxon ?? null;
  const familia = lineage.find((l: any) => l.rank?.rank === "Familia")?.taxon ?? null;
  const genero = lineage.find((l: any) => l.rank?.rank === "Género")?.taxon ?? null;
  const especie = lineage.find((l: any) => l.rank?.rank === "especie")?.taxon ?? null;
  const nombreCientifico = genero && especie ? `${String(genero)} ${String(especie)}` : null;
  const nombreComun = (fichaEspecie as any)?.nombresComunes?.nombre_comun_espanol ?? null;

  // URL slug preferido: nombre científico real de la ficha; fallback al slug del URL.
  const especieSlug = nombreCientifico
    ? nombreCientifico.replaceAll(" ", "-")
    : id;
  const especieUrl = `/sapopedia/species/${encodeURIComponent(especieSlug)}`;
  const coleccionesUrl = `${especieUrl}/colecciones`;

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
      secuencias={secuencias}
      swabs={swabs}
      tejidos={tejidos}
      videos={videos}
    />
  );
}
