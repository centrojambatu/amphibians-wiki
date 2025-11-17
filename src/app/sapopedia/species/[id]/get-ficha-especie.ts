import {createServiceClient} from "@/utils/supabase/server";

export default async function getFichaEspecie(idFichaEspecie: number) {
  const supabaseClient = createServiceClient();

  const {data: fichaEspecies, error} = await supabaseClient
    .from("ficha_especie")
    .select("*")
    .eq("id_ficha_especie", idFichaEspecie);

  if (error) {
    console.error(error);
  }

  if (!fichaEspecies || fichaEspecies.length === 0) {
    return null;
  }

  const fichaEspecie = fichaEspecies[0];

  const {data: taxon_catalogo_awe_results, error: taxon_catalogo_aweError} = await supabaseClient
    .from("taxon_catalogo_awe")
    .select("*, catalogo_awe(*, tipo_catalogo_awe(*))")
    .eq("taxon_id", fichaEspecie.taxon_id);

  if (taxon_catalogo_aweError) {
    console.error(taxon_catalogo_aweError);
  }

  console.log({
    taxon_catalogo_awe_results,
  });

  const {data: dataRegionBio, error: errorAweRegionBio} = await supabaseClient
    .from("taxon_catalogo_awe_region_biogeografica")
    .select(
      `
    *,
    catalogo_awe!inner(*, tipo_catalogo_awe(*))
  `,
    )
    .eq("taxon_id", fichaEspecie.taxon_id)
    .eq("catalogo_awe.tipo_catalogo_awe_id", 6); // filtro en la tabla relacionada

  if (errorAweRegionBio) {
    console.error(errorAweRegionBio);
  }

  // const {data: geoPolitica, error: errorGeoPolitica} = await supabaseClient
  //   .from("taxon_geopolitica")
  //   .select("*, geopolitica(*, rank_geopolitica(*))")
  //   .eq("taxon_id", fichaEspecie.taxon_id);

  const {data: geoPolitica, error: errorGeoPolitica} = await supabaseClient.rpc(
    "get_taxon_geopolitica_hierarchy",
    {_taxon_id: fichaEspecie.taxon_id},
  );

  if (errorGeoPolitica) {
    console.error(errorGeoPolitica);
  } else {
    console.log(geoPolitica);
    // data viene ordenado por depth (0 = nivel más específico)
  }

  if (errorGeoPolitica) {
    console.error(errorGeoPolitica);
  }

  const {data: publicaciones, error: errorPublicaciones} = await supabaseClient
    .from("taxon_publicacion")
    .select("*, publicacion(*)")
    .eq("taxon_id", fichaEspecie.taxon_id);

  if (errorPublicaciones) {
    console.error(errorPublicaciones);
  }

  const {data: taxones, error: errorTaxones} = await supabaseClient
    .from("taxon")
    .select("*, taxonPadre:taxon_id(*)")
    .eq("id_taxon", fichaEspecie.taxon_id);

  if (errorTaxones) {
    console.error(errorTaxones);
  }

  return {
    ...fichaEspecie,
    taxon_catalogo_awe_results: taxon_catalogo_awe_results || [],
    dataRegionBio: dataRegionBio || [],
    geoPolitica: geoPolitica || [],
    publicaciones: publicaciones || [],
    taxones: taxones || [],
  };
}
