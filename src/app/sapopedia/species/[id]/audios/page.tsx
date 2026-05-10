import {notFound} from "next/navigation";
import getFichaEspecie from "../get-ficha-especie";
import {createClient} from "@/utils/supabase/server";
import SpeciesAudiosClient from "./SpeciesAudiosClient";
import {SpeciesAudioItem} from "./types";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    from?: string;
    search?: string;
  }>;
}

async function getCantosByTaxon(taxonId: number): Promise<SpeciesAudioItem[]> {
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
    .from("canto")
    .select(
      `id_canto, nombre, enlace, fecha, hora, colector, localidad, provincia, estado, pais,
       latitud, longitud, elevacion, temp_aire, temp_agua, humedad, nubosidad,
       observacion, especies_fondo, serie_campo,
       coleccion_id, coleccion_externa_id,
       coleccion:coleccion_id(catalogo_museo, numero_museo),
       coleccion_externa:coleccion_externa_id(catalogo_museo, numero_museo),
       publicacion:publicacion_id(cita_corta)`,
    )
    .or(orParts.join(","))
    .eq("publicar", true)
    .order("fecha", {ascending: false, nullsFirst: false});

  if (error) {
    console.error("Error al obtener cantos:", error);

    return [];
  }

  return (data || []).map((c: any) => {
    const fromColeccion = c.coleccion_id != null;
    const fromExterna = !fromColeccion && c.coleccion_externa_id != null;
    const item: SpeciesAudioItem = {
      id: String(c.id_canto),
      nombre: c.nombre,
      enlace: c.enlace,
      cita_corta: c.publicacion?.cita_corta ?? null,
      fecha: c.fecha,
      hora: c.hora,
      colector: c.colector,
      localidad: c.localidad,
      provincia: c.provincia,
      estado: c.estado,
      pais: c.pais,
      latitud: c.latitud,
      longitud: c.longitud,
      elevacion: c.elevacion,
      temp_aire: c.temp_aire,
      temp_agua: c.temp_agua,
      humedad: c.humedad,
      nubosidad: c.nubosidad,
      observacion: c.observacion,
      especies_fondo: c.especies_fondo,
      serie_campo: c.serie_campo,
      fuente: fromColeccion ? "coleccion" : fromExterna ? "coleccion_externa" : "taxon",
      coleccion_id: c.coleccion_id,
      coleccion_externa_id: c.coleccion_externa_id,
      catalogo_museo: c.coleccion?.catalogo_museo ?? c.coleccion_externa?.catalogo_museo ?? null,
      numero_museo: c.coleccion?.numero_museo ?? c.coleccion_externa?.numero_museo ?? null,
    };

    return item;
  });
}

export default async function SpeciesAudiosPage({params, searchParams}: PageProps) {
  const {id} = await params;
  const paramsSearch = await searchParams;

  const decodedId = decodeURIComponent(id);
  const sanitizedId = /^\d+$/.test(decodedId) ? decodedId : decodedId.replaceAll("-", " ");

  const fichaEspecie = await getFichaEspecie(sanitizedId);

  if (!fichaEspecie) {
    notFound();
  }

  const nombreCientifico = fichaEspecie.taxones?.[0]?.taxon
    ? `${fichaEspecie.taxones[0].taxonPadre?.taxon || ""} ${fichaEspecie.taxones[0].taxon}`.trim()
    : "";

  const especieUrl = `/sapopedia/species/${id}`;
  const fromAudioteca = paramsSearch.from === "audioteca";
  const searchQuery = paramsSearch.search || "";

  const audiotecaUrl = searchQuery
    ? `/audioteca?search=${encodeURIComponent(searchQuery)}`
    : "/audioteca";

  const audios = await getCantosByTaxon(fichaEspecie.taxon_id);

  return (
    <SpeciesAudiosClient
      audios={audios}
      audiotecaUrl={audiotecaUrl}
      especieUrl={especieUrl}
      fromAudioteca={fromAudioteca}
      nombreCientifico={nombreCientifico}
      speciesUrlId={id}
    />
  );
}
