import {notFound} from "next/navigation";

import {createClient} from "@/utils/supabase/server";

import getFichaEspecie from "../get-ficha-especie";

import SpeciesVideosClient from "./SpeciesVideosClient";
import {SpeciesVideoItem} from "./types";

interface PageProps {
  params: Promise<{id: string}>;
  searchParams: Promise<{from?: string; search?: string}>;
}

async function getVideosByTaxon(taxonId: number): Promise<SpeciesVideoItem[]> {
  const supabase = await createClient();

  const [{data: cols}, {data: extCols}] = await Promise.all([
    supabase.from("coleccion").select("id_coleccion").eq("taxon_id", taxonId),
    supabase.from("coleccion_externa").select("id").eq("taxon_id", taxonId),
  ]);

  const colIds = (cols || []).map((c: any) => c.id_coleccion);
  const extIds = (extCols || []).map((c: any) => c.id);
  const orParts: string[] = [];

  orParts.push(
    `and(coleccion_id.is.null,coleccion_externa_id.is.null,taxon_id.eq.${String(taxonId)})`,
  );
  if (colIds.length > 0) orParts.push(`coleccion_id.in.(${colIds.join(",")})`);
  if (extIds.length > 0) orParts.push(`coleccion_externa_id.in.(${extIds.join(",")})`);

  const {data, error} = await supabase
    .from("video")
    .select(
      `id_video, nombre, enlace, thumbnail, descripcion, autor, fecha,
       coleccion_id, coleccion_externa_id,
       coleccion:coleccion_id(catalogo_museo, numero_museo),
       coleccion_externa:coleccion_externa_id(catalogo_museo, numero_museo)`,
    )
    .or(orParts.join(","))
    .eq("publicar", true)
    .order("id_video", {ascending: false});

  if (error) {
    console.error("Error al obtener videos:", error);

    return [];
  }

  return (data || []).map((v: any) => {
    const fromColeccion = v.coleccion_id != null;
    const fromExterna = !fromColeccion && v.coleccion_externa_id != null;
    const item: SpeciesVideoItem = {
      id: String(v.id_video),
      nombre: v.nombre,
      enlace: v.enlace,
      thumbnail: v.thumbnail,
      descripcion: v.descripcion,
      autor: v.autor,
      fecha: v.fecha,
      fuente: fromColeccion ? "coleccion" : fromExterna ? "coleccion_externa" : "taxon",
      coleccion_id: v.coleccion_id,
      coleccion_externa_id: v.coleccion_externa_id,
      catalogo_museo: v.coleccion?.catalogo_museo ?? v.coleccion_externa?.catalogo_museo ?? null,
      museo_numero: v.coleccion?.numero_museo ?? v.coleccion_externa?.numero_museo ?? null,
    };

    return item;
  });
}

export default async function SpeciesVideosPage({params, searchParams}: PageProps) {
  const {id} = await params;
  const paramsSearch = await searchParams;

  const decodedId = decodeURIComponent(id);
  const sanitizedId = /^\d+$/.test(decodedId) ? decodedId : decodedId.replaceAll("-", " ");

  const fichaEspecie = await getFichaEspecie(sanitizedId);

  if (!fichaEspecie) notFound();

  const nombreCientifico = fichaEspecie.taxones?.[0]?.taxon
    ? `${fichaEspecie.taxones[0].taxonPadre?.taxon || ""} ${fichaEspecie.taxones[0].taxon}`.trim()
    : "";

  const lineage: any[] = (fichaEspecie as any)?.lineage ?? [];
  const ordenEntry = lineage.find((l: any) => l.rank?.rank === "Orden");
  const familiaEntry = lineage.find((l: any) => l.rank?.rank === "Familia");
  const generoEntry = lineage.find((l: any) => l.rank?.rank === "Género");
  const orden = ordenEntry?.taxon ?? null;
  const familia = familiaEntry?.taxon ?? null;
  const genero = generoEntry?.taxon ?? null;
  const ordenId = ordenEntry?.id_taxon ?? null;
  const familiaId = familiaEntry?.id_taxon ?? null;
  const generoId = generoEntry?.id_taxon ?? null;

  const especieUrl = `/sapopedia/species/${id}`;
  const fromVideoteca = paramsSearch.from === "videoteca";
  const searchQuery = paramsSearch.search || "";
  const videotecaUrl = searchQuery
    ? `/videoteca?search=${encodeURIComponent(searchQuery)}`
    : "/videoteca";

  const videos = await getVideosByTaxon(fichaEspecie.taxon_id);

  return (
    <SpeciesVideosClient
      especieUrl={especieUrl}
      familia={familia}
      familiaId={familiaId}
      fromVideoteca={fromVideoteca}
      genero={genero}
      generoId={generoId}
      nombreCientifico={nombreCientifico}
      orden={orden}
      ordenId={ordenId}
      speciesUrlId={id}
      videos={videos}
      videotecaUrl={videotecaUrl}
    />
  );
}
