import {createServiceClient} from "@/utils/supabase/server";

export default async function getFichaGenero(idFichaGenero: string) {
  const supabaseClient = createServiceClient();

  console.log("🔍 getFichaGenero llamado con:", idFichaGenero);

  // Buscar por id_ficha_genero o nombre del taxon
  const isNumber = typeof idFichaGenero === "number" || /^\d+$/.test(idFichaGenero);

  let taxonId: number | null = null;
  let idFichaGeneroNum: number | null = null;

  if (isNumber) {
    // Buscar por id_ficha_genero
    const idNum = Number(idFichaGenero);

    console.log("🔢 Buscando por id_ficha_genero:", idNum);
    const {data: fichaData, error: errorFicha} = await supabaseClient
      .from("ficha_genero")
      .select("*, taxon(*)")
      .eq("id_ficha_genero", idNum)
      .single();

    if (errorFicha || !fichaData) {
      console.error("❌ Error al obtener datos de ficha_genero por id:", errorFicha);

      return null;
    }

    taxonId = fichaData.taxon_id;
    idFichaGeneroNum = fichaData.id_ficha_genero;
  } else {
    // Buscar por nombre del taxon
    console.log("📝 Buscando por nombre del taxon:", idFichaGenero);

    // Normalizar el nombre: trim y normalizar espacios
    const nombreNormalizado = idFichaGenero.trim().replaceAll(/\s+/g, " ");

    // Primero buscar el taxon
    let {data: taxonData, error: errorTaxon} = await supabaseClient
      .from("taxon")
      .select("id_taxon")
      .eq("taxon", nombreNormalizado)
      .eq("rank_id", 6) // Género
      .single();

    // Si no se encuentra, intentar case-insensitive
    if (errorTaxon) {
      console.log("⚠️ Búsqueda exacta falló, intentando case-insensitive...");
      const {data: taxonDataCI, error: errorTaxonCI} = await supabaseClient
        .from("taxon")
        .select("id_taxon")
        .ilike("taxon", nombreNormalizado)
        .eq("rank_id", 6) // Género
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

    // Buscar la ficha_genero por taxon_id
    const {data: fichaData, error: errorFicha} = await supabaseClient
      .from("ficha_genero")
      .select("id_ficha_genero")
      .eq("taxon_id", taxonId)
      .single();

    if (errorFicha || !fichaData) {
      console.error("❌ Error al obtener ficha_genero por taxon_id:", errorFicha);

      return null;
    }

    idFichaGeneroNum = fichaData.id_ficha_genero;
  }

  if (!taxonId || !idFichaGeneroNum) {
    console.error("❌ No se pudo obtener taxon_id o id_ficha_genero");

    return null;
  }

  // Ejecutar todas las queries en paralelo para mejor performance
  const [
    {data: fichaGeneroData, error: errorFichaGenero},
    {data: taxon_catalogo_awe_results, error: taxon_catalogo_aweError},
    {data: dataRegionBio, error: errorAweRegionBio},
    {data: geoPolitica, error: errorGeoPolitica},
    {data: publicaciones, error: errorPublicaciones},
    {data: taxones, error: errorTaxones},
    {data: lineage, error: errorLineage},
  ] = await Promise.all([
    // Obtener todos los campos de ficha_genero
    supabaseClient
      .from("ficha_genero")
      .select("*")
      .eq("id_ficha_genero", idFichaGeneroNum)
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
  if (errorFichaGenero) {
    console.error("Error ficha_genero:", errorFichaGenero);
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

  const fichaGenero = fichaGeneroData || ({} as any);

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
    fichaGenero?.sinonimia ?? null,
    fichaGenero?.etimologia ?? null,
    fichaGenero?.definicion ?? null,
    fichaGenero?.contenido ?? null,
    fichaGenero?.distribucion ?? null,
    fichaGenero?.observaciones ?? null,
    fichaGenero?.agradecimientos ?? null,
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
    // Campos de ficha_genero
    id_ficha_genero: idFichaGeneroNum ?? null,
    taxon_id: taxonId,
    sinonimia: fichaGenero?.sinonimia ?? null,
    etimologia: fichaGenero?.etimologia ?? null,
    definicion: fichaGenero?.definicion ?? null,
    contenido: fichaGenero?.contenido ?? null,
    distribucion: fichaGenero?.distribucion ?? null,
    observaciones: fichaGenero?.observaciones ?? null,
    agradecimientos: fichaGenero?.agradecimientos ?? null,
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

  console.log("📊 Datos retornados ficha_genero:", {
    id_ficha_genero: result.id_ficha_genero,
    taxon_id: result.taxon_id,
    tiene_taxones: result.taxones.length,
    tiene_lineage: result.lineage.length,
    tiene_publicaciones: result.publicaciones.length,
  });

  return result;
}
