import {createServiceClient} from "@/utils/supabase/server";

import getColeccionesEspecie from "./get-colecciones-especie";

export default async function getFichaEspecie(idFichaEspecie: string) {
  const supabaseClient = createServiceClient();

  // Buscar por id_ficha_especie o nombre científico en la vista vw_ficha_especie_completa
  const isNumber = typeof idFichaEspecie === "number" || /^\d+$/.test(idFichaEspecie);

  let vistaData;

  if (isNumber) {
    // Buscar por id_ficha_especie
    const idNum = Number(idFichaEspecie);

    const {data, error} = await supabaseClient
      .from("vw_ficha_especie_completa" as any)
      .select("*")
      .eq("id_ficha_especie", idNum)
      .single();

    if (error) {
      console.error("❌ Error al obtener datos de la vista por id:", error);

      return null;
    }

    vistaData = data;
  } else {
    // Buscar por nombre científico (búsqueda exacta primero, luego flexible)

    // Normalizar el nombre científico: trim y normalizar espacios
    const nombreNormalizado = idFichaEspecie.trim().replaceAll(/\s+/g, " ");

    // Primero intentar búsqueda exacta
    let {data, error} = await supabaseClient
      .from("vw_ficha_especie_completa" as any)
      .select("*")
      .eq("nombre_cientifico", nombreNormalizado)
      .single();

    // Si no se encuentra, intentar búsqueda case-insensitive
    if (error) {
      const {data: dataCaseInsensitive, error: errorCaseInsensitive} = await supabaseClient
        .from("vw_ficha_especie_completa" as any)
        .select("*")
        .ilike("nombre_cientifico", nombreNormalizado)
        .single();

      if (!errorCaseInsensitive && dataCaseInsensitive) {
        data = dataCaseInsensitive;
        error = null;
      } else {
        console.error(
          "❌ Error al obtener datos de la vista por nombre:",
          errorCaseInsensitive || error,
        );

        return null;
      }
    }

    vistaData = data;
  }

  if (!vistaData) {
    console.error("❌ No se encontraron datos en la vista para:", idFichaEspecie);

    return null;
  }

  // Cast explícito para evitar errores de TypeScript
  const vistaDataTyped = vistaData as any;

  const taxonId = vistaDataTyped.especie_taxon_id as number;
  const idFichaEspecieVista = vistaDataTyped.id_ficha_especie as number;

  if (!taxonId) {
    console.error("No se encontró taxon_id en los datos de la vista:", vistaData);

    return null;
  }

  if (!idFichaEspecieVista) {
    console.error("No se encontró id_ficha_especie en los datos de la vista:", vistaData);

    return null;
  }

  // Ejecutar todas las queries en paralelo para mejor performance
  const [
    {data: fichaEspecieData, error: errorFichaEspecie},
    {data: taxon_catalogo_awe_results, error: taxon_catalogo_aweError},
    {data: dataRegionBio, error: errorAweRegionBio},
    {data: geoPolitica, error: errorGeoPolitica},
    {data: publicaciones, error: errorPublicaciones},
    {data: taxones, error: errorTaxones},
    {data: lineage, error: errorLineage},
    colecciones,
  ] = await Promise.all([
    // Obtener campos adicionales de ficha_especie que no están en la vista
    // Usar tanto id_ficha_especie como taxon_id para asegurar que sea el registro correcto
    supabaseClient
      .from("ficha_especie")
      .select("*")
      .eq("id_ficha_especie", idFichaEspecieVista)
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
    supabaseClient
      .from("taxon")
      .select("*, taxonPadre:taxon_id(*, taxonPadre:taxon_id(*))")
      .eq("id_taxon", taxonId),
    supabaseClient.rpc("get_taxon_lineage", {p_id_taxon: taxonId}),
    getColeccionesEspecie(taxonId, vistaDataTyped.nombre_cientifico),
  ]);

  // Manejar errores
  if (errorFichaEspecie) {
    console.error("Error ficha_especie:", errorFichaEspecie);
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

  // Combinar datos de la vista con datos de ficha_especie
  // Asegurarse de que fichaEspecieData no sea null antes de acceder a sus propiedades
  if (!fichaEspecieData) {
    console.error(
      "No se encontraron datos de ficha_especie para id_ficha_especie:",
      idFichaEspecieVista,
      "y taxon_id:",
      taxonId,
    );
  } else {
    // Validar que el taxon_id de ficha_especie coincide con el de la vista
    if (fichaEspecieData.taxon_id !== taxonId) {
      console.error(
        "⚠️ ADVERTENCIA CRÍTICA: El taxon_id no coincide!",
        "Vista taxon_id:",
        taxonId,
        "Ficha_especie taxon_id:",
        fichaEspecieData.taxon_id,
        "id_ficha_especie:",
        idFichaEspecieVista,
        "nombre_cientifico_vista:",
        vistaDataTyped.nombre_cientifico,
      );
    }
  }
  const fichaEspecie = fichaEspecieData || ({} as any);

  // Buscar listaRojaIUCN una sola vez
  const listaRojaIUCN =
    taxon_catalogo_awe_results?.find((item) => item.catalogo_awe.tipo_catalogo_awe_id === 10) ||
    null;

  // Filtrar solo las distribuciones altitudinales (tipo_catalogo_awe_id = 5)
  // Eliminar duplicados basándose en catalogo_awe_id (combinación única de taxon_id + catalogo_awe_id)
  const distributionsSinDuplicados = taxon_catalogo_awe_results?.filter(
    (item) => item.catalogo_awe.tipo_catalogo_awe_id === 5,
  );
  // Eliminar duplicados usando un Map basado en catalogo_awe_id (mantener solo el primero encontrado)
  const distributionsMap = new Map();

  distributionsSinDuplicados?.forEach((item) => {
    const key = item.catalogo_awe_id;

    if (!distributionsMap.has(key)) {
      distributionsMap.set(key, item);
    }
  });
  const distributions = Array.from(distributionsMap.values());

  // Revisar si tiene distribución occidental/oriental basándose en awe_distribucion_altitudinal de la vista
  const distribucionAltitudinal = (vistaDataTyped.awe_distribucion_altitudinal || "").toLowerCase();
  const hasOrientalDistribution = distribucionAltitudinal.includes("oriental");
  const hasOccidentalDistribution = distribucionAltitudinal.includes("occidental");

  const altitudinalRange = {
    // Usar valores de la vista
    min: vistaDataTyped.rango_altitudinal_min ?? 0,
    max: vistaDataTyped.rango_altitudinal_max ?? 0,
    // Solo incluir occidente si tiene distribución occidental
    occidente: hasOccidentalDistribution
      ? {
          min: vistaDataTyped.rango_altitudinal_min ?? 0,
          max: vistaDataTyped.rango_altitudinal_max ?? 0,
        }
      : undefined,
    // Solo incluir oriente si tiene distribución oriental
    oriente: hasOrientalDistribution
      ? {
          min: vistaDataTyped.rango_altitudinal_min ?? 0,
          max: vistaDataTyped.rango_altitudinal_max ?? 0,
        }
      : undefined,
  };

  // Asegurar que taxones y lineage tengan al menos un elemento para evitar errores en card-species-header
  const taxonesArray = Array.isArray(taxones) && taxones.length > 0 ? taxones : [];
  const lineageArray = Array.isArray(lineage) && lineage.length > 0 ? lineage : [];

  // Filtrar publicaciones que tienen el objeto publicacion válido
  const publicacionesValidas = Array.isArray(publicaciones)
    ? publicaciones.filter((pub: any) => pub?.publicacion)
    : [];

  // Ordenar publicaciones por fecha (igual que en el editor de citas)
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

  // Función para extraer id_publicacion de referencias del formato {{id_publicacion}}
  // Busca patrones como {{123}} donde 123 es id_publicacion
  const extractReferenceIds = (text: string | null): number[] => {
    if (!text) return [];
    const referencias: number[] = [];

    // Buscar patrones como {{123}} donde 123 es id_publicacion
    const matchesBraces = text.match(/\{\{(\d+)\}\}/g) || [];

    matchesBraces.forEach((match) => {
      // Remover {{ }}
      const cleaned = match.replaceAll(/\{\{|\}\}/g, "");
      const idPublicacion = Number.parseInt(cleaned, 10);

      if (idPublicacion > 0) {
        referencias.push(idPublicacion);
      }
    });

    // Devolver referencias únicas
    return Array.from(new Set(referencias));
  };

  // Extraer referencias de todos los campos de texto de ficha_especie
  const camposTexto: (string | null)[] = [
    fichaEspecie?.descubridor ?? null,
    fichaEspecie?.etimologia ?? null,
    fichaEspecie?.taxonomia ?? null,
    fichaEspecie?.identificacion ?? null,
    fichaEspecie?.habitat_biologia ?? null,
    fichaEspecie?.informacion_adicional ?? null,
    fichaEspecie?.distribucion_global ?? null,
    fichaEspecie?.comentario_estatus_poblacional ?? null,
    fichaEspecie?.descripcion ?? null,
    fichaEspecie?.diagnosis ?? null,
    fichaEspecie?.dieta ?? null,
    fichaEspecie?.reproduccion ?? null,
    fichaEspecie?.canto ?? null,
    fichaEspecie?.larva ?? null,
    fichaEspecie?.morfometria ?? null,
    fichaEspecie?.color_en_vida ?? null,
    fichaEspecie?.color_en_preservacion ?? null,
    fichaEspecie?.sinonimia ?? null,
    fichaEspecie?.comparacion ?? null,
    fichaEspecie?.usos ?? null,
    fichaEspecie?.agradecimiento ?? null,
    fichaEspecie?.historial ?? null,
    vistaDataTyped?.distribucion_global ?? null,
  ];

  // Obtener todos los id_publicacion de referencias únicos
  const referenciasEncontradas = new Set<number>();

  camposTexto.forEach((campo) => {
    if (campo) {
      const refs = extractReferenceIds(campo);

      refs.forEach((ref) => referenciasEncontradas.add(ref));
    }
  });

  // Identificar los id_publicacion que ya tenemos en publicacionesOrdenadas
  const idsPublicacionesExistentes = new Set<number>(
    publicacionesOrdenadas
      .map((pub) => pub.publicacion?.id_publicacion)
      .filter((id): id is number => id !== undefined && id !== null)
  );

  // Identificar las referencias que NO están en las publicaciones existentes
  const referenciasFaltantes = Array.from(referenciasEncontradas).filter(
    (id) => !idsPublicacionesExistentes.has(id)
  );

  // Cargar las publicaciones faltantes directamente de la tabla publicacion
  let publicacionesAdicionales: any[] = [];
  if (referenciasFaltantes.length > 0) {
    const { data: pubsAdicionales, error: errorPubsAdicionales } = await supabaseClient
      .from("publicacion")
      .select("*")
      .in("id_publicacion", referenciasFaltantes);

    if (errorPubsAdicionales) {
      console.error("Error al cargar publicaciones adicionales:", errorPubsAdicionales);
    } else if (pubsAdicionales) {
      // Convertir al mismo formato que las publicaciones de taxon_publicacion
      publicacionesAdicionales = pubsAdicionales.map((pub) => ({
        id_taxon_publicacion: `adicional_${pub.id_publicacion}`,
        taxon_id: taxonId,
        publicacion: pub,
      }));
    }
  }

  // Combinar publicaciones existentes con las adicionales
  const todasLasPublicaciones = [...publicacionesOrdenadas, ...publicacionesAdicionales];

  // Filtrar publicaciones: solo las que están referenciadas por id_publicacion
  const publicacionesReferenciadas = todasLasPublicaciones.filter((pub) =>
    pub.publicacion?.id_publicacion
      ? referenciasEncontradas.has(pub.publicacion.id_publicacion)
      : false,
  );

  // Solo mostrar las publicaciones que están referenciadas en los textos
  // Si no hay referencias, no mostrar ninguna publicación
  const publicacionesParaMostrar = publicacionesReferenciadas;

  // Mapear datos de la vista y ficha_especie al formato esperado por card-species-content.tsx
  // Usar valores explícitos para evitar undefined
  const result = {
    // Campos de ficha_especie (prioridad a fichaEspecieData si existe)
    id_ficha_especie: idFichaEspecieVista ?? null,
    taxon_id: taxonId,
    fotografia_ficha: fichaEspecie?.fotografia_ficha ?? null,
    descubridor: fichaEspecie?.descubridor ?? null,
    colector: fichaEspecie?.colector ?? null,
    etimologia: fichaEspecie?.etimologia ?? null,
    taxonomia: fichaEspecie?.taxonomia ?? null,
    svl_macho: fichaEspecie?.svl_macho ?? null,
    svl_hembra: fichaEspecie?.svl_hembra ?? null,
    identificacion: fichaEspecie?.identificacion ?? null,
    sinonimia: fichaEspecie?.sinonimia ?? null,
    descripcion: fichaEspecie?.descripcion ?? null,
    diagnosis: fichaEspecie?.diagnosis ?? null,
    morfometria: fichaEspecie?.morfometria ?? null,
    color_en_vida: fichaEspecie?.color_en_vida ?? null,
    color_en_preservacion: fichaEspecie?.color_en_preservacion ?? null,
    comparacion: fichaEspecie?.comparacion ?? null,
    habitat_biologia: fichaEspecie?.habitat_biologia ?? null,
    reproduccion: fichaEspecie?.reproduccion ?? null,
    dieta: fichaEspecie?.dieta ?? null,
    canto: fichaEspecie?.canto ?? null,
    larva: fichaEspecie?.larva ?? null,
    usos: fichaEspecie?.usos ?? null,
    informacion_adicional: fichaEspecie?.informacion_adicional ?? null,
    distribucion: fichaEspecie?.distribucion ?? null,
    distribucion_global:
      (vistaDataTyped?.distribucion_global || fichaEspecie?.distribucion_global) ?? null,
    historial: fichaEspecie?.historial ?? null,
    agradecimiento: fichaEspecie?.agradecimiento ?? null,
    fecha_actualizacion: fichaEspecie?.fecha_actualizacion ?? null,
    rango_altitudinal: fichaEspecie?.rango_altitudinal ?? null,
    rango_altitudinal_min: vistaDataTyped?.rango_altitudinal_min ?? null,
    rango_altitudinal_max: vistaDataTyped?.rango_altitudinal_max ?? null,
    temperatura_min: fichaEspecie?.temperatura_min ?? null,
    temperatura_max: fichaEspecie?.temperatura_max ?? null,
    pluviocidad_min: fichaEspecie?.pluviocidad_min ?? null,
    pluviocidad_max: fichaEspecie?.pluviocidad_max ?? null,
    observacion_zona_altitudinal:
      (vistaDataTyped?.observacion_zona_altitudinal ||
        fichaEspecie?.observacion_zona_altitudinal) ??
      null,
    comentario_estatus_poblacional: fichaEspecie?.comentario_estatus_poblacional ?? null,
    // Links externos
    wikipedia: fichaEspecie?.wikipedia ?? null,
    aw: fichaEspecie?.aw ?? null,
    asw: fichaEspecie?.asw ?? null,
    uicn: fichaEspecie?.uicn ?? null,
    inaturalist: fichaEspecie?.inaturalist ?? null,
    genbank: fichaEspecie?.genbank ?? null,
    herpnet: fichaEspecie?.herpnet ?? null,
    morphosource: fichaEspecie?.morphosource ?? null,
    gbif: fichaEspecie?.gbif ?? null,
    // Datos relacionados - asegurar que siempre sean arrays y eliminar duplicados
    taxon_catalogo_awe_results: (() => {
      if (!Array.isArray(taxon_catalogo_awe_results)) return [];
      // Eliminar duplicados basándose en catalogo_awe_id (combinación única de taxon_id + catalogo_awe_id)
      // Mantener solo el primer registro encontrado para cada catalogo_awe_id
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
    publicacionesOrdenadas: todasLasPublicaciones, // Todas las publicaciones (incluyendo adicionales) para procesar citas
    taxones: taxonesArray,
    listaRojaIUCN: listaRojaIUCN ?? null,
    lineage: lineageArray,
    hasOrientalDistribution: hasOrientalDistribution ?? false,
    hasOccidentalDistribution: hasOccidentalDistribution ?? false,
    distributions: Array.isArray(distributions) ? distributions : [],
    altitudinalRange: altitudinalRange,
    colecciones: Array.isArray(colecciones) ? colecciones : [],
  };

  return result;
}
