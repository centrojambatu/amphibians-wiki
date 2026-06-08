import {createServiceClient} from "@/utils/supabase/server";

import type {ColeccionCardData} from "@/components/ColeccionCard";

export interface ColeccionMuestra extends ColeccionCardData {
  sangre: boolean;
  piel_exudado: boolean;
  piel_liofilizado: boolean;
  tejido_higado: boolean;
  tejido_musculo: boolean;
  esqueleto_transparentacion: boolean;
  esperma: boolean;
  heces: boolean;
}

const CATALOGO_TEJIDO_HIGADO = 597;
const CATALOGO_TEJIDO_MUSCULO = 596;
const CATALOGO_TEJIDO_MUSCULO_E_HIGADO = 609;
const CATALOGO_PIEL_LIOFILIZADO = 641;
const CATALOGO_PIEL_EXUDADO = 642;
const TEJIDO_HIGADO_IDS = new Set([CATALOGO_TEJIDO_HIGADO, CATALOGO_TEJIDO_MUSCULO_E_HIGADO]);
const TEJIDO_MUSCULO_IDS = new Set([CATALOGO_TEJIDO_MUSCULO, CATALOGO_TEJIDO_MUSCULO_E_HIGADO]);

export async function getColeccionMuestras(taxonId: number): Promise<ColeccionMuestra[]> {
  const supabase = createServiceClient();

  const {data, error} = await supabase
    .from("coleccion")
    .select(
      `id_coleccion, taxon_id, sc, gui, numero_museo, catalogo_museo, fecha_col, colectores,
       localidad, latitud, longitud, elevacion, estadio, numero_individuos, sexo, estado, genbank,
       esqueleto_transparentacion,
       geopolitica!coleccion_provincia_id_fkey(nombre),
       personal!coleccion_personal_id_fkey(nombre, siglas),
       taxon!coleccion_taxon_id_fkey(taxon, taxonPadre:taxon_id(taxon))`,
    )
    .eq("taxon_id", taxonId)
    .eq("publicar", true)
    .order("fecha_col", {ascending: false, nullsFirst: false});

  if (error) {
    console.error("Error al obtener muestras:", error);

    return [];
  }

  // Lookup paralelo de presencia de muestras en las tablas reales
  const coleccionIds = (data || []).map((c: any) => c.id_coleccion as number);
  const presencia = {
    sangre: new Set<number>(),
    esperma: new Set<number>(),
    heces: new Set<number>(),
    tejAny: new Set<number>(),
    tejHigado: new Set<number>(),
    tejMusculo: new Set<number>(),
    pielLiof: new Set<number>(),
    pielExud: new Set<number>(),
  };

  if (coleccionIds.length > 0) {
    const [sang, esp, hec, tej, ep] = await Promise.all([
      supabase.from("sangre").select("coleccion_id").in("coleccion_id", coleccionIds),
      supabase.from("esperma").select("coleccion_id").in("coleccion_id", coleccionIds),
      supabase.from("heces").select("coleccion_id").in("coleccion_id", coleccionIds),
      supabase
        .from("tejido")
        .select("coleccion_id, tipo_tejido_id")
        .in("coleccion_id", coleccionIds),
      supabase
        .from("extracto_piel")
        .select("coleccion_id, tipo_extracto_piel_id")
        .in("coleccion_id", coleccionIds),
    ]);

    (sang.data || []).forEach((r: any) => presencia.sangre.add(r.coleccion_id));
    (esp.data || []).forEach((r: any) => presencia.esperma.add(r.coleccion_id));
    (hec.data || []).forEach((r: any) => presencia.heces.add(r.coleccion_id));
    (tej.data || []).forEach((r: any) => {
      presencia.tejAny.add(r.coleccion_id);
      if (TEJIDO_HIGADO_IDS.has(r.tipo_tejido_id)) presencia.tejHigado.add(r.coleccion_id);
      if (TEJIDO_MUSCULO_IDS.has(r.tipo_tejido_id)) presencia.tejMusculo.add(r.coleccion_id);
    });
    (ep.data || []).forEach((r: any) => {
      if (r.tipo_extracto_piel_id === CATALOGO_PIEL_LIOFILIZADO)
        presencia.pielLiof.add(r.coleccion_id);
      if (r.tipo_extracto_piel_id === CATALOGO_PIEL_EXUDADO)
        presencia.pielExud.add(r.coleccion_id);
    });
  }

  // Filtrar solo colecciones que tengan al menos una muestra (cualquier tejido cuenta)
  const filtrado = (data || []).filter((c: any) => {
    const id = c.id_coleccion as number;

    return (
      presencia.sangre.has(id) ||
      presencia.esperma.has(id) ||
      presencia.heces.has(id) ||
      presencia.tejAny.has(id) ||
      presencia.pielLiof.has(id) ||
      presencia.pielExud.has(id) ||
      c.esqueleto_transparentacion === true
    );
  });

  const especiesTaxonIds = Array.from(
    new Set(
      filtrado
        .map((c: any) => c.taxon_id as number | null)
        .filter((v): v is number => v != null),
    ),
  );

  let nombreCientificoMap = new Map<
    number,
    {nombre_cientifico: string | null; nombre_comun: string | null}
  >();
  if (especiesTaxonIds.length > 0) {
    const {data: spp} = await supabase
      .from("vw_lista_spp")
      .select("id_especie, nombre_cientifico, nombre_comun")
      .in("id_especie", especiesTaxonIds);
    (spp || []).forEach((s: any) => {
      if (s.id_especie != null && !nombreCientificoMap.has(s.id_especie)) {
        nombreCientificoMap.set(s.id_especie, {
          nombre_cientifico: s.nombre_cientifico ?? null,
          nombre_comun: s.nombre_comun ?? null,
        });
      }
    });
  }

  return filtrado.map((c: any) => {
    const id = c.id_coleccion as number;
    const especie = c.taxon?.taxon as string | undefined;
    const genero = c.taxon?.taxonPadre?.taxon as string | undefined;
    const nombreFromTaxon = [genero, especie].filter(Boolean).join(" ") || null;
    const speciesInfo = nombreCientificoMap.get(c.taxon_id);
    const flags = {
      sangre: presencia.sangre.has(id),
      piel_exudado: presencia.pielExud.has(id),
      piel_liofilizado: presencia.pielLiof.has(id),
      tejido_higado: presencia.tejHigado.has(id),
      tejido_musculo: presencia.tejMusculo.has(id),
      esqueleto_transparentacion: c.esqueleto_transparentacion === true,
      esperma: presencia.esperma.has(id),
      heces: presencia.heces.has(id),
    };

    return {
      fuente: "coleccion" as const,
      id_coleccion: c.id_coleccion,
      taxon_id: c.taxon_id,
      sc: c.sc,
      gui: c.gui,
      num_museo: c.numero_museo,
      catalogo_museo: c.catalogo_museo ?? null,
      fecha_coleccion: c.fecha_col ?? null,
      colectores: c.colectores,
      personal_nombre: c.personal?.nombre ?? null,
      personal_siglas: c.personal?.siglas ?? null,
      provincia: c.geopolitica?.nombre ?? null,
      detalle_localidad: c.localidad,
      latitud: c.latitud,
      longitud: c.longitud,
      altitud: c.elevacion,
      estadio: c.estadio,
      numero_individuos: c.numero_individuos,
      sexo: c.sexo,
      estado: c.estado,
      nombre_cientifico: speciesInfo?.nombre_cientifico ?? nombreFromTaxon,
      nombre_comun: speciesInfo?.nombre_comun ?? null,
      tiene_muestras: true,
      tiene_multimedia: false,
      tiene_adn: Boolean(c.genbank),
      ...flags,
    };
  });
}
