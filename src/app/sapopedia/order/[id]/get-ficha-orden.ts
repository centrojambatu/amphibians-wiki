import {createServiceClient} from "@/utils/supabase/server";

export default async function getFichaOrden(idFichaOrden: string) {
  const supabaseClient = createServiceClient();

  console.log("🔍 getFichaOrden llamado con:", idFichaOrden);

  // Buscar por taxon_id, id_ficha_orden o nombre del taxon
  const isNumber = typeof idFichaOrden === "number" || /^\d+$/.test(idFichaOrden);

  let taxonId: number | null = null;
  let idFichaOrdenNum: number | null = null;

  if (isNumber) {
    const idNum = Number(idFichaOrden);

    // Primero intentar buscar si es un taxon_id de un orden
    console.log("🔢 Buscando por taxon_id:", idNum);
    const {data: taxonData, error: errorTaxon} = await supabaseClient
      .from("taxon")
      .select("id_taxon")
      .eq("id_taxon", idNum)
      .eq("rank_id", 4) // Orden
      .single();

    if (!errorTaxon && taxonData) {
      // Es un taxon_id válido de orden
      taxonId = taxonData.id_taxon;
      console.log("✅ Encontrado como taxon_id de orden:", taxonId);

      // Buscar la ficha_orden por taxon_id
      const {data: fichaData, error: errorFicha} = await supabaseClient
        .from("ficha_orden")
        .select("id_ficha_orden")
        .eq("taxon_id", taxonId)
        .single();

      if (!errorFicha && fichaData) {
        idFichaOrdenNum = fichaData.id_ficha_orden;
      } else {
        console.error("❌ No se encontró ficha_orden para taxon_id:", taxonId);
        return null;
      }
    } else {
      // Intentar buscar por id_ficha_orden
      console.log("🔢 Buscando por id_ficha_orden:", idNum);
      const {data: fichaData, error: errorFicha} = await supabaseClient
        .from("ficha_orden")
        .select("*, taxon(*)")
        .eq("id_ficha_orden", idNum)
        .single();

      if (errorFicha || !fichaData) {
        console.error("❌ Error al obtener datos de ficha_orden por id:", errorFicha);
        return null;
      }

      taxonId = fichaData.taxon_id;
      idFichaOrdenNum = fichaData.id_ficha_orden;
    }
  } else {
    // Buscar por nombre del taxon
    console.log("📝 Buscando por nombre del taxon:", idFichaOrden);

    // Normalizar el nombre: trim y normalizar espacios
    const nombreNormalizado = idFichaOrden.trim().replaceAll(/\s+/g, " ");

    // Primero buscar el taxon
    let {data: taxonData, error: errorTaxon} = await supabaseClient
      .from("taxon")
      .select("id_taxon")
      .eq("taxon", nombreNormalizado)
      .eq("rank_id", 4) // Orden
      .single();

    // Si no se encuentra, intentar case-insensitive
    if (errorTaxon) {
      console.log("⚠️ Búsqueda exacta falló, intentando case-insensitive...");
      const {data: taxonDataCI, error: errorTaxonCI} = await supabaseClient
        .from("taxon")
        .select("id_taxon")
        .ilike("taxon", nombreNormalizado)
        .eq("rank_id", 4) // Orden
        .single();

      if (!errorTaxonCI && taxonDataCI) {
        taxonData = taxonDataCI;
        errorTaxon = null;
        console.log("✅ Taxón encontrado con búsqueda case-insensitive");
      } else {
        console.error(
          "❌ Error al obtener taxon por nombre:",
          errorTaxonCI || errorTaxon,
        );

        return null;
      }
    }

    if (!taxonData?.id_taxon) {
      console.error("❌ No se encontró taxon_id para:", nombreNormalizado);

      return null;
    }

    taxonId = taxonData.id_taxon;

    // Buscar la ficha_orden por taxon_id
    const {data: fichaData, error: errorFicha} = await supabaseClient
      .from("ficha_orden")
      .select("id_ficha_orden")
      .eq("taxon_id", taxonId)
      .single();

    if (errorFicha || !fichaData) {
      console.error("❌ Error al obtener ficha_orden por taxon_id:", errorFicha);

      return null;
    }

    idFichaOrdenNum = fichaData.id_ficha_orden;
  }

  if (!taxonId || !idFichaOrdenNum) {
    console.error("❌ No se pudo obtener taxon_id o id_ficha_orden");

    return null;
  }

  // Ejecutar todas las queries en paralelo para mejor performance
  const [
    {data: fichaOrdenData, error: errorFichaOrden},
    {data: taxon_catalogo_awe_results, error: taxon_catalogo_aweError},
    {data: dataRegionBio, error: errorAweRegionBio},
    {data: geoPolitica, error: errorGeoPolitica},
    {data: publicaciones, error: errorPublicaciones},
    {data: taxones, error: errorTaxones},
    {data: lineage, error: errorLineage},
  ] = await Promise.all([
    // Obtener todos los campos de ficha_orden
    supabaseClient
      .from("ficha_orden")
      .select("*")
      .eq("id_ficha_orden", idFichaOrdenNum)
      .eq("taxon_id", taxonId)
      .single(),
    supabaseClient
      .from("taxon_catalogo_awe")
      .select("*, catalogo_awe(*, tipo_catalogo_awe(*))")
      .eq("taxon_id", taxonId),
    supabaseClient
      .from("taxon_catalogo_awe_region_biogeografica")
      .select(
        `
      *,
      catalogo_awe!inner(*, tipo_catalogo_awe(*))
    `,
      )
      .eq("taxon_id", taxonId)
      .eq("catalogo_awe.tipo_catalogo_awe_id", 6),
    supabaseClient.rpc("get_taxon_geopolitica_hierarchy", {
      _taxon_id: taxonId,
    }),
    supabaseClient.from("taxon_publicacion").select("*, publicacion(*)").eq("taxon_id", taxonId),
    supabaseClient.from("taxon").select("*, taxonPadre:taxon_id(*)").eq("id_taxon", taxonId),
    supabaseClient.rpc("get_taxon_lineage", {p_id_taxon: taxonId}),
  ]);

  // Manejar errores
  if (errorFichaOrden) {
    console.error("Error ficha_orden:", errorFichaOrden);
  }
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

  const fichaOrden = fichaOrdenData || ({} as any);

  // Buscar listaRojaIUCN
  const listaRojaIUCN =
    taxon_catalogo_awe_results?.find((item) => item.catalogo_awe.tipo_catalogo_awe_id === 10) ||
    null;

  // Filtrar distribuciones altitudinales
  const distributionsSinDuplicados = taxon_catalogo_awe_results?.filter(
    (item) => item.catalogo_awe.tipo_catalogo_awe_id === 5,
  );
  const distributionsMap = new Map();

  distributionsSinDuplicados?.forEach((item) => {
    const key = item.catalogo_awe_id;

    if (!distributionsMap.has(key)) {
      distributionsMap.set(key, item);
    }
  });
  const distributions = Array.from(distributionsMap.values());

  // Asegurar que taxones y lineage tengan al menos un elemento
  const taxonesArray = Array.isArray(taxones) && taxones.length > 0 ? taxones : [];
  const lineageArray = Array.isArray(lineage) && lineage.length > 0 ? lineage : [];

  // Filtrar publicaciones válidas
  const publicacionesValidas = Array.isArray(publicaciones)
    ? publicaciones.filter((pub: any) => pub?.publicacion)
    : [];

  // Ordenar publicaciones por fecha
  const publicacionesOrdenadas = publicacionesValidas.sort((a: any, b: any) => {
    const fechaA =
      a.publicacion?.numero_publicacion_ano ||
      (a.publicacion?.fecha
        ? new Date(a.publicacion.fecha as string | number | Date).getFullYear()
        : 0);
    const fechaB =
      b.publicacion?.numero_publicacion_ano ||
      (b.publicacion?.fecha
        ? new Date(b.publicacion.fecha as string | number | Date).getFullYear()
        : 0);

    return fechaB - fechaA;
  });

  // Función para extraer id_publicacion de referencias
  const extractReferenceIds = (text: string | null): number[] => {
    if (!text) return [];
    const referencias: number[] = [];

    const matchesBraces = text.match(/\{\{(\d+)\}\}/g) || [];

    matchesBraces.forEach((match) => {
      const cleaned = match.replaceAll(/\{\{|\}\}/g, "");
      const idPublicacion = Number.parseInt(cleaned, 10);

      if (idPublicacion > 0) {
        referencias.push(idPublicacion);
      }
    });

    return Array.from(new Set(referencias));
  };

  // Extraer referencias de todos los campos de texto
  const camposTexto: (string | null)[] = [
    fichaOrden?.sinonimia ?? null,
    fichaOrden?.etimologia ?? null,
    fichaOrden?.definicion ?? null,
    fichaOrden?.contenido ?? null,
    fichaOrden?.distribucion ?? null,
    fichaOrden?.observaciones ?? null,
    fichaOrden?.agradecimientos ?? null,
  ];

  // Obtener todos los id_publicacion de referencias únicos
  const referenciasEncontradas = new Set<number>();

  camposTexto.forEach((campo) => {
    if (campo) {
      const refs = extractReferenceIds(campo);

      refs.forEach((ref) => referenciasEncontradas.add(ref));
    }
  });

  // Filtrar publicaciones referenciadas
  const publicacionesReferenciadas = publicacionesOrdenadas.filter((pub) =>
    pub.publicacion?.id_publicacion
      ? referenciasEncontradas.has(pub.publicacion.id_publicacion)
      : false,
  );

  const publicacionesParaMostrar = publicacionesReferenciadas;

  // Mapear datos al formato esperado
  const result = {
    // Campos de ficha_orden
    id_ficha_orden: idFichaOrdenNum ?? null,
    taxon_id: taxonId,
    sinonimia: fichaOrden?.sinonimia ?? null,
    etimologia: fichaOrden?.etimologia ?? null,
    definicion: fichaOrden?.definicion ?? null,
    contenido: fichaOrden?.contenido ?? null,
    distribucion: fichaOrden?.distribucion ?? null,
    observaciones: fichaOrden?.observaciones ?? null,
    agradecimientos: fichaOrden?.agradecimientos ?? null,
    // Campos de taxon
    taxon: taxonesArray[0]?.taxon ?? null,
    autor_ano: taxonesArray[0]?.autor_ano ?? null,
    nombre_comun: taxonesArray[0]?.nombre_comun ?? null,
    en_ecuador: taxonesArray[0]?.en_ecuador ?? null,
    endemica: taxonesArray[0]?.endemica ?? null,
    // Datos relacionados
    taxon_catalogo_awe_results: (() => {
      if (!Array.isArray(taxon_catalogo_awe_results)) return [];
      const uniqueMap = new Map();

      taxon_catalogo_awe_results.forEach((item) => {
        const key = item.catalogo_awe_id;

        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, item);
        }
      });

      return Array.from(uniqueMap.values());
    })(),
    dataRegionBio: Array.isArray(dataRegionBio) ? dataRegionBio : [],
    geoPolitica: Array.isArray(geoPolitica) ? geoPolitica : [],
    publicaciones: publicacionesParaMostrar,
    publicacionesOrdenadas: publicacionesOrdenadas,
    taxones: taxonesArray,
    listaRojaIUCN: listaRojaIUCN ?? null,
    lineage: lineageArray,
    distributions: Array.isArray(distributions) ? distributions : [],
  };

  console.log("📊 Datos retornados ficha_orden:", {
    id_ficha_orden: result.id_ficha_orden,
    taxon_id: result.taxon_id,
    tiene_taxones: result.taxones.length,
    tiene_lineage: result.lineage.length,
    tiene_publicaciones: result.publicaciones.length,
  });

  return result;
}
