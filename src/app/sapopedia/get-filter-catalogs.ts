import {createServiceClient} from "@/utils/supabase/server";

export interface CatalogOption {
  id: number;
  nombre: string;
  sigla: string | null;
  value: string; // slug para usar en filtros
}

export interface FilterCatalogs {
  provincias: CatalogOption[];
  listaRoja: CatalogOption[];
  ecosistemas: CatalogOption[];
  regionesBiogeograficas: CatalogOption[];
  reservasBiosfera: CatalogOption[];
  bosquesProtegidos: CatalogOption[];
  areasProtegidasEstado: CatalogOption[];
  areasProtegidasPrivadas: CatalogOption[];
}

// IDs de los tipos de catálogo según la base de datos
const CATALOG_TYPE_IDS = {
  PROVINCIAS: 1, // Verificar el ID correcto en la base de datos
  LISTA_ROJA_UICN: 10,
  ECOSISTEMAS: 21,
  REGIONES_BIOGEOGRAFICAS: 6,
  RESERVAS_BIOSFERA: 22,
  BOSQUES_PROTEGIDOS: 23,
  AREAS_PROTEGIDAS_ESTADO: 3,
  AREAS_PROTEGIDAS_PRIVADAS: 4,
};

// Función para convertir nombre a slug
function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remover acentos
    .replace(/[^a-z0-9\s-]/g, "") // Solo letras, números, espacios y guiones
    .replace(/\s+/g, "-") // Espacios a guiones
    .replace(/-+/g, "-") // Múltiples guiones a uno
    .trim();
}

async function getCatalogByType(
  supabaseClient: ReturnType<typeof createServiceClient>,
  tipoId: number,
  useSiglaAsValue = false,
): Promise<CatalogOption[]> {
  const {data, error} = await supabaseClient
    .from("catalogo_awe")
    .select("id_catalogo_awe, nombre, sigla")
    .eq("tipo_catalogo_awe_id", tipoId)
    .order("nombre", {ascending: true});

  if (error) {
    console.error(`Error al obtener catálogo tipo ${tipoId}:`, error);

    return [];
  }

  return (data || []).map((item) => ({
    id: item.id_catalogo_awe,
    nombre: item.nombre,
    sigla: item.sigla,
    // Para Lista Roja, usar la sigla como value porque es lo que tienen las especies
    value: useSiglaAsValue && item.sigla ? item.sigla : toSlug(item.nombre),
  }));
}

export default async function getFilterCatalogs(): Promise<FilterCatalogs> {
  const supabaseClient = createServiceClient();

  // Ejecutar todas las consultas en paralelo
  const [
    provincias,
    listaRoja,
    ecosistemas,
    regionesBiogeograficas,
    reservasBiosfera,
    bosquesProtegidos,
    areasProtegidasEstado,
    areasProtegidasPrivadas,
  ] = await Promise.all([
    getCatalogByType(supabaseClient, CATALOG_TYPE_IDS.PROVINCIAS),
    getCatalogByType(supabaseClient, CATALOG_TYPE_IDS.LISTA_ROJA_UICN, true), // Usar sigla como value
    getCatalogByType(supabaseClient, CATALOG_TYPE_IDS.ECOSISTEMAS),
    getCatalogByType(supabaseClient, CATALOG_TYPE_IDS.REGIONES_BIOGEOGRAFICAS),
    getCatalogByType(supabaseClient, CATALOG_TYPE_IDS.RESERVAS_BIOSFERA),
    getCatalogByType(supabaseClient, CATALOG_TYPE_IDS.BOSQUES_PROTEGIDOS),
    getCatalogByType(supabaseClient, CATALOG_TYPE_IDS.AREAS_PROTEGIDAS_ESTADO),
    getCatalogByType(supabaseClient, CATALOG_TYPE_IDS.AREAS_PROTEGIDAS_PRIVADAS),
  ]);

  return {
    provincias,
    listaRoja,
    ecosistemas,
    regionesBiogeograficas,
    reservasBiosfera,
    bosquesProtegidos,
    areasProtegidasEstado,
    areasProtegidasPrivadas,
  };
}
