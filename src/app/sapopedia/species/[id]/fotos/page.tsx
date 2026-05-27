import {notFound} from "next/navigation";

import {createClient} from "@/utils/supabase/server";

import getFichaEspecie from "../get-ficha-especie";

import SpeciesFotosClient from "./SpeciesFotosClient";
import {SpeciesFotoItem} from "./types";

interface PageProps {
  params: Promise<{id: string}>;
  searchParams: Promise<{[key: string]: string | string[] | undefined}>;
}

async function getFotosByTaxon(taxonId: number): Promise<SpeciesFotoItem[]> {
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
    .from("fotografia")
    .select(
      `id_fotografia, nombre, enlace, "descripción", fecha, autor, localidad,
       latitud, longitud, tipo_licencia, observaciones, in_situ,
       coleccion_id, coleccion_externa_id, catalogo_awe_id,
       coleccion:coleccion_id(catalogo_museo, numero_museo),
       coleccion_externa:coleccion_externa_id(catalogo_museo, numero_museo),
       publicacion:publicacion_id(cita_corta),
       catalogo_awe:catalogo_awe_id(nombre)`,
    )
    .or(orParts.join(","))
    .eq("publicar", true)
    .order("fecha", {ascending: false, nullsFirst: false});

  if (error) {
    console.error("Error al obtener fotografías:", error);

    return [];
  }

  return (data || []).map((f: any) => {
    const fromColeccion = f.coleccion_id != null;
    const fromExterna = !fromColeccion && f.coleccion_externa_id != null;
    const item: SpeciesFotoItem = {
      id: String(f.id_fotografia),
      nombre: f.nombre,
      enlace: f.enlace,
      descripcion: f["descripción"] ?? null,
      cita_corta: f.publicacion?.cita_corta ?? null,
      fecha: f.fecha,
      autor: f.autor,
      localidad: f.localidad,
      latitud: f.latitud,
      longitud: f.longitud,
      tipo_licencia: f.tipo_licencia,
      observaciones: f.observaciones,
      fuente: fromColeccion ? "coleccion" : fromExterna ? "coleccion_externa" : "taxon",
      coleccion_id: f.coleccion_id,
      coleccion_externa_id: f.coleccion_externa_id,
      catalogo_museo: f.coleccion?.catalogo_museo ?? f.coleccion_externa?.catalogo_museo ?? null,
      numero_museo: f.coleccion?.numero_museo ?? f.coleccion_externa?.numero_museo ?? null,
      categoria_id: f.catalogo_awe_id ?? null,
      categoria: f.catalogo_awe?.nombre ?? null,
      in_situ: f.in_situ ?? null,
    };

    return item;
  });
}

export default async function SpeciesFotosPage({params, searchParams}: PageProps) {
  const {id} = await params;
  const searchParamsResolved = await searchParams;
  const fromFototeca = searchParamsResolved.from === "fototeca";
  const search = searchParamsResolved.search as string | undefined;

  const decodedId = decodeURIComponent(id);
  const sanitizedId = /^\d+$/.test(decodedId) ? decodedId : decodedId.replaceAll("-", " ");

  const fichaEspecie = await getFichaEspecie(sanitizedId);

  if (!fichaEspecie) {
    notFound();
  }

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
  const fototecaUrl = search ? `/fototeca?search=${encodeURIComponent(search)}` : "/fototeca";

  const fotos = await getFotosByTaxon(fichaEspecie.taxon_id);

  return (
    <SpeciesFotosClient
      especieUrl={especieUrl}
      familia={familia}
      familiaId={familiaId}
      fotos={fotos}
      fototecaUrl={fototecaUrl}
      fromFototeca={fromFototeca}
      genero={genero}
      generoId={generoId}
      nombreCientifico={nombreCientifico}
      orden={orden}
      ordenId={ordenId}
      speciesUrlId={id}
    />
  );
}
