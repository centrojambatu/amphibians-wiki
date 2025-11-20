import {createServiceClient} from "@/utils/supabase/server";

export default async function getFichaEspecie(idFichaEspecie: string) {
  const supabaseClient = createServiceClient();

  // busqueda por Ficha Especie ID

  const isNumber = typeof idFichaEspecie === "number" || /^\d+$/.test(idFichaEspecie);

  let fichaEspecies;

  if (isNumber) {
    const {data: fichaEspeciesData, error} = await supabaseClient
      .from("ficha_especie")
      .select("*")
      .eq("id_ficha_especie", Number(idFichaEspecie));

    if (error) {
      console.error(error);
    }

    if (!fichaEspeciesData || fichaEspeciesData.length === 0) {
      return null;
    }

    fichaEspecies = fichaEspeciesData;
  } else {
    // busqueda por nombre cientifco
    // 1st buscar en vw_lista_especies por nombre cientifico

    const {data: vwListaEspecies, error: errorVwListaEspecies} = await supabaseClient
      .from("vw_lista_especies")
      .select("*")
      .eq("nombre_cientifico", idFichaEspecie);

    if (errorVwListaEspecies) {
      console.error(errorVwListaEspecies);
    }

    if (vwListaEspecies && vwListaEspecies.length > 0) {
      const taxonId = vwListaEspecies[0].id_taxon;

      const {data: fichaEspeciesByTaxonId, error: errorFichaByTaxonId} = await supabaseClient
        .from("ficha_especie")
        .select("*")
        .eq("taxon_id", taxonId!);

      if (errorFichaByTaxonId) {
        console.error(errorFichaByTaxonId);
      }

      fichaEspecies = fichaEspeciesByTaxonId;
    }
  }

  if (!fichaEspecies || fichaEspecies.length === 0) {
    return null;
  }

  const fichaEspecie = fichaEspecies[0];

  // Ejecutar todas las queries en paralelo para mejor performance
  const [
    {data: taxon_catalogo_awe_results, error: taxon_catalogo_aweError},
    {data: dataRegionBio, error: errorAweRegionBio},
    {data: geoPolitica, error: errorGeoPolitica},
    {data: publicaciones, error: errorPublicaciones},
    {data: taxones, error: errorTaxones},
    {data: lineage, error: errorLineage},
  ] = await Promise.all([
    supabaseClient
      .from("taxon_catalogo_awe")
      .select("*, catalogo_awe(*, tipo_catalogo_awe(*))")
      .eq("taxon_id", fichaEspecie.taxon_id),
    supabaseClient
      .from("taxon_catalogo_awe_region_biogeografica")
      .select(
        `
      *,
      catalogo_awe!inner(*, tipo_catalogo_awe(*))
    `,
      )
      .eq("taxon_id", fichaEspecie.taxon_id)
      .eq("catalogo_awe.tipo_catalogo_awe_id", 6),
    supabaseClient.rpc("get_taxon_geopolitica_hierarchy", {
      _taxon_id: fichaEspecie.taxon_id,
    }),
    supabaseClient
      .from("taxon_publicacion")
      .select("*, publicacion(*)")
      .eq("taxon_id", fichaEspecie.taxon_id),
    supabaseClient
      .from("taxon")
      .select("*, taxonPadre:taxon_id(*)")
      .eq("id_taxon", fichaEspecie.taxon_id),
    supabaseClient.rpc("get_taxon_lineage", {p_id_taxon: fichaEspecie.taxon_id}),
  ]);

  // Manejar errores
  if (taxon_catalogo_aweError) {
    console.error("Error taxon_catalogo_awe:", taxon_catalogo_aweError);
  }
  if (errorAweRegionBio) {
    console.error("Error dataRegionBio:", errorAweRegionBio);
  }
  if (errorGeoPolitica) {
    console.error("Error geoPolitica:", errorGeoPolitica);
  }
  if (errorPublicaciones) {
    console.error("Error publicaciones:", errorPublicaciones);
  }
  if (errorTaxones) {
    console.error("Error taxones:", errorTaxones);
  }
  if (errorLineage) {
    console.error("Error lineage:", errorLineage);
  }

  // Buscar listaRojaIUCN una sola vez
  const listaRojaIUCN =
    taxon_catalogo_awe_results?.find((item) => item.catalogo_awe.tipo_catalogo_awe_id === 10) ||
    null;

  // revisar si tiene distribucion oriental
  const hasOrientalDistribution = taxon_catalogo_awe_results?.some((item) =>
    item.catalogo_awe.nombre?.toLowerCase().includes("oriental"),
  );

  const hasOccidentalDistribution = taxon_catalogo_awe_results?.some((item) =>
    item.catalogo_awe.nombre?.toLowerCase().includes("occidental"),
  );

  const distributions = taxon_catalogo_awe_results?.filter(
    (item) => item.catalogo_awe.tipo_catalogo_awe_id === 5,
  );

  const altitudinalRange = {
    min:
      hasOccidentalDistribution === false || hasOrientalDistribution === false
        ? null
        : fichaEspecie.rango_altitudinal_min,
    max:
      hasOccidentalDistribution === false || hasOrientalDistribution === false
        ? null
        : fichaEspecie.rango_altitudinal_max,
    occidente: {
      min: hasOccidentalDistribution === false ? null : fichaEspecie.rango_altitudinal_min,
      max: hasOccidentalDistribution === false ? null : fichaEspecie.rango_altitudinal_max,
    },
    oriente: {
      min: hasOrientalDistribution === false ? null : fichaEspecie.rango_altitudinal_min,
      max: hasOrientalDistribution === false ? null : fichaEspecie.rango_altitudinal_max,
    },
  };

  console.log("altitudinalRange", altitudinalRange);

  return {
    ...fichaEspecie,
    taxon_catalogo_awe_results: taxon_catalogo_awe_results || [],
    dataRegionBio: dataRegionBio || [],
    geoPolitica: geoPolitica || [],
    publicaciones: publicaciones || [],
    taxones: taxones || [],
    listaRojaIUCN,
    lineage: lineage || [],
    hasOrientalDistribution,
    hasOccidentalDistribution,
    distributions,
    altitudinalRange: altitudinalRange,
  };
}
