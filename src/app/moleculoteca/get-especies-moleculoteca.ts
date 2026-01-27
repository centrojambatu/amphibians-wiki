import { createServiceClient } from "@/utils/supabase/server";

export interface EspecieMoleculoteca {
  id_taxon: number;
  id_ficha_especie: number | null;
  nombre_cientifico: string;
  nombre_comun: string | null;
  orden: string | null;
  familia: string | null;
  genero: string | null;
  fotografia_ficha: string | null;
}

export interface FiltrosMoleculoteca {
  busqueda?: string;
}

export interface ResultadoMoleculoteca {
  especies: EspecieMoleculoteca[];
  total: number;
  totalPaginas: number;
}

export default async function getEspeciesMoleculoteca(
  pagina: number = 1,
  itemsPorPagina: number = 24,
  filtros: FiltrosMoleculoteca = {},
): Promise<ResultadoMoleculoteca> {
  const supabaseClient = createServiceClient();

  // Calcular offset
  const offset = (pagina - 1) * itemsPorPagina;

  // Query base
  let query = (supabaseClient as any)
    .from("vw_ficha_especie_completa")
    .select("*", { count: "exact" })
    .order("nombre_cientifico", { ascending: true });

  // Aplicar filtro de búsqueda si existe
  if (filtros.busqueda) {
    const busqueda = filtros.busqueda.trim();
    // Buscar en nombre científico y nombre común
    query = query.or(
      `nombre_cientifico.ilike.%${busqueda}%,nombre_comun.ilike.%${busqueda}%`,
    );
  }

  // Aplicar paginación
  query = query.range(offset, offset + itemsPorPagina - 1);

  const { data: especies, error, count } = await query;

  if (error) {
    console.error("Error al obtener especies para moleculoteca:", error);
    return {
      especies: [],
      total: 0,
      totalPaginas: 0,
    };
  }

  if (!especies || especies.length === 0) {
    return {
      especies: [],
      total: 0,
      totalPaginas: 0,
    };
  }

  // Mapear datos
  const especiesFormateadas: EspecieMoleculoteca[] = especies.map(
    (especie: any) => ({
      id_taxon: especie.especie_taxon_id,
      id_ficha_especie: especie.especie_ficha_especie_id ?? null,
      nombre_cientifico: especie.nombre_cientifico,
      nombre_comun: especie.nombre_comun,
      orden: especie.orden,
      familia: especie.familia,
      genero: especie.genero,
      fotografia_ficha: especie.fotografia_ficha,
    }),
  );

  const total = count ?? 0;
  const totalPaginas = Math.ceil(total / itemsPorPagina);

  return {
    especies: especiesFormateadas,
    total,
    totalPaginas,
  };
}
