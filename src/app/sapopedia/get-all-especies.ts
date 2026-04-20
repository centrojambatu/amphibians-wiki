import { createServiceClient } from "@/utils/supabase/server";

export interface SpeciesListItem {
  id_taxon: number;
  id_ficha_especie: number | null;
  nombre_cientifico: string;
  nombre_comun: string | null;
  /** Nombre común en inglés (desde vw_nombres_comunes, igual que en la página de nombres) */
  nombre_comun_ingles: string | null;
  descubridor: string | null;
  orden: string | null;
  familia: string | null;
  genero: string | null;
  fotografia_ficha: string | null;
  en_ecuador: boolean | null;
  endemica: boolean | null;
  rango_altitudinal_min: number | null;
  rango_altitudinal_max: number | null;
  lista_roja_iucn: string | null;
  /** Fecha último avistamiento (ISO date, ej. para posiblemente extintas) */
  ultimo_avistamiento: string | null;
  area_distribucion: number | null;
  pluviocidad_min: number | null;
  pluviocidad_max: number | null;
  temperatura_min: number | null;
  temperatura_max: number | null;
  has_distribucion_occidental: boolean;
  has_distribucion_oriental: boolean;
  // Catálogos para filtrado (slugs)
  catalogos: {
    regiones_biogeograficas: string[];
    ecosistemas: string[];
    reservas_biosfera: string[];
    bosques_protegidos: string[];
    areas_protegidas_estado: string[];
    areas_protegidas_privadas: string[];
    provincias: string[];
  };
}

// Función para convertir nombre a slug
function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Función para parsear string de catálogos separados por coma a array de slugs
function parseCatalogString(catalogString: string | null): string[] {
  if (!catalogString) return [];

  return catalogString
    .split(",")
    .map((item) => toSlug(item.trim()))
    .filter((slug) => slug.length > 0);
}

const CHUNK_SIZE = 200;

/**
 * Ejecuta una query con .in(field, ids) por chunks en paralelo y une resultados.
 * Evita requests muy grandes y planes ineficientes (supabase-postgres-best-practices).
 */
async function fetchInChunks<T>(
  ids: number[],
  chunkSize: number,
  run: (chunk: number[]) => Promise<{ data: T[] | null; error: unknown }>,
): Promise<{ data: T[]; error: unknown }> {
  if (ids.length === 0) return { data: [], error: null };
  if (ids.length <= chunkSize) {
    const r = await run(ids);
    return { data: r.data ?? [], error: r.error };
  }
  const chunks: number[][] = [];
  for (let i = 0; i < ids.length; i += chunkSize) {
    chunks.push(ids.slice(i, i + chunkSize));
  }
  const results = await Promise.all(chunks.map((c) => run(c)));
  const firstError = results.find((r) => r.error)?.error ?? null;
  if (firstError) console.error("Error en consulta por chunks:", firstError);
  return {
    data: results.flatMap((r) => r.data ?? []),
    error: firstError,
  };
}

export default async function getAllEspecies(
  familia?: string,
): Promise<SpeciesListItem[]> {
  const supabaseClient = createServiceClient();

  // Obtener todas las especies publicadas desde la vista completa
  let query = (supabaseClient as any)
    .from("vw_ficha_especie_completa")
    .select("*")
    // .eq("publicar", true) // ⚠️ Filtro comentado temporalmente para ver todas las especies
    .order("nombre_cientifico", { ascending: true });

  // Filtrar por familia si se proporciona
  if (familia) {
    query = query.eq("familia", familia);
  }

  const { data: especies, error: errorEspecies } = await query;

  if (errorEspecies) {
    console.error("Error al obtener especies:", errorEspecies);

    return [];
  }

  if (!especies || especies.length === 0) {
    return [];
  }

  // Obtener los taxon_ids de la vista (especie_taxon_id se usa con taxon_id para lo general a lo particular)
  const taxonIds: number[] = especies
    .map((e: any) => e.especie_taxon_id as number)
    .filter((id: number | null): id is number => id != null);

  // IDs de tipos de catálogo que necesitamos obtener por separado
  const TIPO_LISTA_ROJA = 10;
  const TIPO_ECOSISTEMAS = 21; // No está en la vista
  const TIPO_RESERVAS_BIOSFERA = 22; // No está en la vista
  const TIPO_BOSQUES_PROTEGIDOS = 23; // No está en la vista

  // Rank de geopolitica para provincias
  const RANK_PROVINCIAS = 3;

  const fichaEspecieIds: number[] = especies
    .map((e: any) => e.id_ficha_especie as number)
    .filter((id: number | null | undefined): id is number => id != null);

  // Consultas auxiliares en paralelo; listas grandes se fragmentan en chunks (data-n-plus-one / evitar .in() enorme)
  const [
    { data: categoriasUICN, error: errorCategoriasUICN },
    catalogosResult,
    provinciasResult,
    fichasResult,
    nombresResult,
  ] = await Promise.all([
    supabaseClient
      .from("catalogo_awe")
      .select("nombre, sigla")
      .eq("tipo_catalogo_awe_id", TIPO_LISTA_ROJA),
    fetchInChunks(
      taxonIds,
      CHUNK_SIZE,
      (chunk) =>
        Promise.resolve(
          supabaseClient
            .from("taxon_catalogo_awe")
            .select("taxon_id, catalogo_awe(nombre, sigla, tipo_catalogo_awe_id)")
            .in("taxon_id", chunk)
            .in("catalogo_awe.tipo_catalogo_awe_id", [
              TIPO_ECOSISTEMAS,
              TIPO_RESERVAS_BIOSFERA,
              TIPO_BOSQUES_PROTEGIDOS,
            ]),
        ).then((r: { data: unknown[] | null; error: unknown }) => r),
    ),
    fetchInChunks(
      taxonIds,
      CHUNK_SIZE,
      (chunk) =>
        Promise.resolve(
          supabaseClient
            .from("taxon_geopolitica")
            .select(
              "taxon_id, geopolitica(id_geopolitica, nombre, rank_geopolitica_id)",
            )
            .in("taxon_id", chunk)
            .eq("geopolitica.rank_geopolitica_id", RANK_PROVINCIAS),
        ).then((r: { data: unknown[] | null; error: unknown }) => r),
    ),
    fetchInChunks(fichaEspecieIds, CHUNK_SIZE, (chunk) =>
      Promise.resolve(
        supabaseClient
          .from("ficha_especie")
          .select("id_ficha_especie, descubridor, pluviocidad_min, pluviocidad_max, temperatura_min, temperatura_max")
          .in("id_ficha_especie", chunk),
      ).then((r: { data: unknown[] | null; error: unknown }) => r),
    ),
    fetchInChunks(taxonIds, CHUNK_SIZE, (chunk) =>
      Promise.resolve(
        (supabaseClient as any)
          .from("vw_nombres_comunes")
          .select("id_taxon, nombre_comun_ingles")
          .in("id_taxon", chunk),
      ).then((r: { data: unknown[] | null; error: unknown }) => r),
    ),
  ]);

  const catalogosData = catalogosResult.data;
  const provinciasData = provinciasResult.data;
  const fichasData = fichasResult.data;
  const nombresData = nombresResult.data;
  const errorCatalogos = catalogosResult.error;
  const errorProvincias = provinciasResult.error;
  const errorFichas = fichasResult.error;
  const errorNombres = nombresResult.error;

  if (errorCategoriasUICN) {
    console.error("Error al obtener categorías UICN:", errorCategoriasUICN);
  }
  if (errorCatalogos) {
    console.error("Error al obtener catálogos:", errorCatalogos);
  }
  if (errorProvincias) {
    console.error("Error al obtener provincias:", errorProvincias);
  }

  // Crear mapa de nombre -> sigla para UICN
  const nombreASiglaMap = new Map<string, string>();
  if (categoriasUICN) {
    for (const cat of categoriasUICN) {
      if (cat.nombre && cat.sigla) {
        nombreASiglaMap.set(cat.nombre, cat.sigla);
      }
    }
  }

  // Crear mapas de taxon_id -> catálogos
  const listaRojaMap = new Map<number, string>();
  const catalogosExtraMap = new Map<
    number,
    {
      ecosistemas: string[];
      reservas_biosfera: string[];
      bosques_protegidos: string[];
      provincias: string[];
    }
  >();

  // Inicializar el mapa para cada taxon_id
  for (const taxonId of taxonIds) {
    catalogosExtraMap.set(taxonId, {
      ecosistemas: [],
      reservas_biosfera: [],
      bosques_protegidos: [],
      provincias: [],
    });
  }

  // Procesar Lista Roja UICN directamente desde la vista (awe_lista_roja_uicn)
  // Esto es más eficiente y evita problemas con límites de .in()
  let especiesConUICN = 0;
  for (const especie of especies as any[]) {
    const taxonId = especie.especie_taxon_id as number;
    const nombreUICN = especie.awe_lista_roja_uicn as string | null;

    if (taxonId && nombreUICN) {
      const sigla = nombreASiglaMap.get(nombreUICN);
      if (sigla) {
        listaRojaMap.set(taxonId, sigla);
        especiesConUICN++;
      }
    }
  }

  // Procesar otros catálogos desde taxon_catalogo_awe
  if (catalogosData) {
    for (const item of catalogosData as any[]) {
      const taxonId = item.taxon_id as number;
      const catalogo = item.catalogo_awe;

      if (!catalogo || typeof taxonId !== "number") continue;

      const tipoId = catalogo.tipo_catalogo_awe_id;
      const nombre = catalogo.nombre as string;
      const slug = toSlug(nombre);

      // Otros catálogos usan slug (Lista Roja ya se procesó desde la vista)
      const especieCatalogos = catalogosExtraMap.get(taxonId);

      if (especieCatalogos) {
        switch (tipoId) {
          case TIPO_ECOSISTEMAS:
            especieCatalogos.ecosistemas.push(slug);
            break;
          case TIPO_RESERVAS_BIOSFERA:
            especieCatalogos.reservas_biosfera.push(slug);
            break;
          case TIPO_BOSQUES_PROTEGIDOS:
            especieCatalogos.bosques_protegidos.push(slug);
            break;
        }
      }
    }
  }

  // Procesar provincias desde taxon_geopolitica
  if (provinciasData) {
    for (const item of provinciasData as any[]) {
      const taxonId = item.taxon_id as number;
      const geopolitica = item.geopolitica;

      if (!geopolitica || typeof taxonId !== "number") continue;

      const nombre = geopolitica.nombre as string;
      const slug = toSlug(nombre);

      const especieCatalogos = catalogosExtraMap.get(taxonId);

      if (especieCatalogos) {
        especieCatalogos.provincias.push(slug);
      }
    }
  }

  interface FichaExtra {
    descubridor: string | null;
    pluviocidad_min: number | null;
    pluviocidad_max: number | null;
    temperatura_min: number | null;
    temperatura_max: number | null;
  }
  const fichaExtraMap = new Map<number, FichaExtra>();
  if (errorFichas) {
    console.error("Error al obtener datos de ficha_especie:", errorFichas);
  } else if (fichasData.length > 0) {
    const fichas = fichasData as (FichaExtra & { id_ficha_especie: number })[];
    for (const ficha of fichas) {
      fichaExtraMap.set(ficha.id_ficha_especie, {
        descubridor: ficha.descubridor ?? null,
        pluviocidad_min: ficha.pluviocidad_min ?? null,
        pluviocidad_max: ficha.pluviocidad_max ?? null,
        temperatura_min: ficha.temperatura_min ?? null,
        temperatura_max: ficha.temperatura_max ?? null,
      });
    }
  }

  const nombreComunInglesMap = new Map<number, string | null>();
  if (!errorNombres && nombresData) {
    for (const row of nombresData as {
      id_taxon: number;
      nombre_comun_ingles: string | null;
    }[]) {
      if (
        row.id_taxon != null &&
        row.nombre_comun_ingles != null &&
        row.nombre_comun_ingles.trim() !== ""
      ) {
        nombreComunInglesMap.set(row.id_taxon, row.nombre_comun_ingles.trim());
      }
    }
  }

  // Mapear los datos de la vista a nuestro tipo SpeciesListItem
  const especiesFormateadas: SpeciesListItem[] = especies.map(
    (especie: any) => {
      // Usar el campo awe_distribucion_altitudinal de la vista para determinar occidental/oriental
      const distribucionAltitudinal = (
        especie.awe_distribucion_altitudinal || ""
      ).toLowerCase();
      const hasOccidental = distribucionAltitudinal.includes("occidental");
      const hasOriental = distribucionAltitudinal.includes("oriental");
      const taxonId = especie.especie_taxon_id as number;

      // Obtener catálogos extra (los que no están en la vista) usando taxon_id
      const catalogosExtra = catalogosExtraMap.get(taxonId) || {
        ecosistemas: [],
        reservas_biosfera: [],
        bosques_protegidos: [],
        provincias: [],
      };

      // Parsear catálogos que SÍ vienen en la vista como strings
      const regionesBiogeograficas = parseCatalogString(
        especie.awe_regiones_biogeograficas,
      );
      const areasProtegidasEstado = parseCatalogString(
        especie.awe_areas_protegidas_estado,
      );
      const areasProtegidasPrivadas = parseCatalogString(
        especie.awe_areas_protegidas_privadas,
      );

      const fichaEspecieId = especie.id_ficha_especie ?? null;

      return {
        id_taxon: taxonId,
        id_ficha_especie: fichaEspecieId,
        nombre_cientifico: especie.nombre_cientifico,
        nombre_comun: especie.nombre_comun,
        nombre_comun_ingles: nombreComunInglesMap.get(taxonId) ?? null,
        descubridor: fichaEspecieId
          ? fichaExtraMap.get(fichaEspecieId)?.descubridor ?? null
          : null,
        orden: especie.orden,
        familia: especie.familia,
        genero: especie.genero,
        fotografia_ficha: especie.fotografia_ficha,
        en_ecuador: especie.en_ecuador,
        endemica: especie.endemica,
        rango_altitudinal_min: especie.rango_altitudinal_min,
        rango_altitudinal_max: especie.rango_altitudinal_max,
        lista_roja_iucn: listaRojaMap.get(taxonId) || null,
        ultimo_avistamiento: especie.ultimo_avistamiento ?? null,
        area_distribucion: especie.area_distribucion ?? null,
        pluviocidad_min: fichaEspecieId ? fichaExtraMap.get(fichaEspecieId)?.pluviocidad_min ?? null : null,
        pluviocidad_max: fichaEspecieId ? fichaExtraMap.get(fichaEspecieId)?.pluviocidad_max ?? null : null,
        temperatura_min: fichaEspecieId ? fichaExtraMap.get(fichaEspecieId)?.temperatura_min ?? null : null,
        temperatura_max: fichaEspecieId ? fichaExtraMap.get(fichaEspecieId)?.temperatura_max ?? null : null,
        has_distribucion_occidental: hasOccidental,
        has_distribucion_oriental: hasOriental,
        catalogos: {
          // Catálogos que vienen de la vista (parseados de string a array)
          regiones_biogeograficas: regionesBiogeograficas,
          areas_protegidas_estado: areasProtegidasEstado,
          areas_protegidas_privadas: areasProtegidasPrivadas,
          // Catálogos que vienen de la query extra
          ecosistemas: catalogosExtra.ecosistemas,
          reservas_biosfera: catalogosExtra.reservas_biosfera,
          bosques_protegidos: catalogosExtra.bosques_protegidos,
          provincias: catalogosExtra.provincias,
        },
      };
    },
  );

  // Debug: Verificar cuántas especies tienen categoría UICN
  const especiesConUICNFinal = especiesFormateadas.filter((e) => e.lista_roja_iucn).length;

  return especiesFormateadas;
}
