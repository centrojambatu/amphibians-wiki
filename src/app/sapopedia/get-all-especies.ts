import { createServiceClient } from "@/utils/supabase/server";

export interface SpeciesListItem {
  id_taxon: number;
  id_ficha_especie: number | null;
  nombre_cientifico: string;
  nombre_comun: string | null;
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

  // Obtener el mapeo de nombre -> sigla para categorías UICN
  const { data: categoriasUICN, error: errorCategoriasUICN } = await supabaseClient
    .from("catalogo_awe")
    .select("nombre, sigla")
    .eq("tipo_catalogo_awe_id", TIPO_LISTA_ROJA);

  if (errorCategoriasUICN) {
    console.error("Error al obtener categorías UICN:", errorCategoriasUICN);
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
  console.log(`📊 Mapeo UICN creado: ${nombreASiglaMap.size} categorías`);

  // Obtener catálogos que faltan en la vista (sin provincias y sin Lista Roja, que viene de awe_lista_roja_uicn)
  const { data: catalogosData, error: errorCatalogos } = await supabaseClient
    .from("taxon_catalogo_awe")
    .select("taxon_id, catalogo_awe(nombre, sigla, tipo_catalogo_awe_id)")
    .in("taxon_id", taxonIds)
    .in("catalogo_awe.tipo_catalogo_awe_id", [
      TIPO_ECOSISTEMAS,
      TIPO_RESERVAS_BIOSFERA,
      TIPO_BOSQUES_PROTEGIDOS,
    ]);

  // Obtener provincias desde taxon_geopolitica
  const { data: provinciasData, error: errorProvincias } = await supabaseClient
    .from("taxon_geopolitica")
    .select(
      "taxon_id, geopolitica(id_geopolitica, nombre, rank_geopolitica_id)",
    )
    .in("taxon_id", taxonIds)
    .eq("geopolitica.rank_geopolitica_id", RANK_PROVINCIAS);

  if (errorCatalogos) {
    console.error("Error al obtener catálogos:", errorCatalogos);
  }

  if (errorProvincias) {
    console.error("Error al obtener provincias:", errorProvincias);
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
      } else {
        console.warn(`⚠️ No se encontró sigla para categoría UICN: "${nombreUICN}"`);
      }
    }
  }
  console.log(`📊 Especies con categoría UICN mapeadas desde la vista: ${especiesConUICN}`);

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

      const fichaEspecieId = especie.especie_ficha_especie_id ?? null;

      return {
        id_taxon: taxonId,
        id_ficha_especie: fichaEspecieId,
        nombre_cientifico: especie.nombre_cientifico,
        nombre_comun: especie.nombre_comun,
        descubridor: especie.especie_autor,
        orden: especie.orden,
        familia: especie.familia,
        genero: especie.genero,
        fotografia_ficha: especie.fotografia_ficha,
        en_ecuador: especie.en_ecuador,
        endemica: especie.endemica,
        rango_altitudinal_min: especie.rango_altitudinal_min,
        rango_altitudinal_max: especie.rango_altitudinal_max,
        lista_roja_iucn: listaRojaMap.get(taxonId) || null,
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
  console.log(`📊 Total especies formateadas: ${especiesFormateadas.length}`);
  console.log(`📊 Especies con categoría UICN final: ${especiesConUICNFinal}`);
  console.log(`📊 Tamaño del mapa listaRojaMap: ${listaRojaMap.size}`);

  return especiesFormateadas;
}
