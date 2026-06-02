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

export async function getColeccionMuestras(taxonId: number): Promise<ColeccionMuestra[]> {
  const supabase = createServiceClient();

  const {data, error} = await supabase
    .from("coleccion")
    .select(
      `id_coleccion, taxon_id, sc, gui, numero_museo, catalogo_museo, fecha_col, colectores,
       localidad, latitud, longitud, elevacion, estadio, numero_individuos, sexo, estado, genbank,
       sangre, piel_exudado, piel_liofilizado, tejido_higado, tejido_musculo,
       esqueleto_transparentacion, esperma, heces,
       geopolitica!coleccion_provincia_id_fkey(nombre),
       personal!coleccion_personal_id_fkey(nombre, siglas),
       taxon!coleccion_taxon_id_fkey(taxon, taxonPadre:taxon_id(taxon))`,
    )
    .eq("taxon_id", taxonId)
    .eq("publicar", true)
    .or(
      "sangre.eq.true,piel_exudado.eq.true,piel_liofilizado.eq.true,tejido_higado.eq.true,tejido_musculo.eq.true,esqueleto_transparentacion.eq.true,esperma.eq.true,heces.eq.true",
    )
    .order("fecha_col", {ascending: false, nullsFirst: false});

  if (error) {
    console.error("Error al obtener muestras:", error);

    return [];
  }

  const especiesTaxonIds = Array.from(
    new Set(
      (data || [])
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

  return (data || []).map((c: any) => {
    const especie = c.taxon?.taxon as string | undefined;
    const genero = c.taxon?.taxonPadre?.taxon as string | undefined;
    const nombreFromTaxon =
      [genero, especie].filter(Boolean).join(" ") || null;
    const speciesInfo = nombreCientificoMap.get(c.taxon_id);
    const tieneMuestras = Boolean(
      c.sangre ||
        c.piel_exudado ||
        c.piel_liofilizado ||
        c.tejido_higado ||
        c.tejido_musculo ||
        c.esqueleto_transparentacion ||
        c.esperma ||
        c.heces,
    );

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
      tiene_muestras: tieneMuestras,
      tiene_multimedia: false,
      tiene_adn: Boolean(c.genbank),
      sangre: !!c.sangre,
      piel_exudado: !!c.piel_exudado,
      piel_liofilizado: !!c.piel_liofilizado,
      tejido_higado: !!c.tejido_higado,
      tejido_musculo: !!c.tejido_musculo,
      esqueleto_transparentacion: !!c.esqueleto_transparentacion,
      esperma: !!c.esperma,
      heces: !!c.heces,
    };
  });
}
