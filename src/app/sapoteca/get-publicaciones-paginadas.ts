import {createServiceClient} from "@/utils/supabase/server";
import {generatePublicacionSlug} from "@/lib/generate-publicacion-slug";

export interface PublicacionSapoteca {
  id_publicacion: number;
  titulo: string;
  titulo_secundario: string | null;
  cita_corta: string | null;
  cita: string | null;
  cita_larga: string | null;
  numero_publicacion_ano: number | null;
  fecha: string;
  slug: string;
  total_enlaces: number | null;
  primer_enlace: string | null;
}

export interface FiltrosSapoteca {
  titulo?: string;
  años?: number[];
  autor?: string;
  tiposPublicacion?: number[];
  indexada?: boolean;
}

export interface PublicacionesPaginadas {
  publicaciones: PublicacionSapoteca[];
  total: number;
  pagina: number;
  totalPaginas: number;
  itemsPorPagina: number;
}

/**
 * Obtiene publicaciones paginadas desde la vista vw_publicacion_completa con filtros opcionales
 */
export default async function getPublicacionesPaginadas(
  pagina: number = 1,
  itemsPorPagina: number = 20,
  filtros?: FiltrosSapoteca,
): Promise<PublicacionesPaginadas> {
  const supabaseClient = createServiceClient();

  // Calcular offset
  const offset = (pagina - 1) * itemsPorPagina;

  // Vista solo publicaciones de Ecuador (anfibios_ecuador = true)
  const vista = "vw_publicacion_completa_ecuador";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- vista no está en tipos generados
  let countQuery = supabaseClient.from(vista as any).select("*", {count: "exact", head: true});

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- vista no está en tipos generados
  let dataQuery = supabaseClient.from(vista as any)
    .select(
      "id_publicacion, titulo, titulo_secundario, cita_corta, cita, cita_larga, numero_publicacion_ano, fecha, total_enlaces",
    );

  // Aplicar filtros
  if (filtros?.titulo) {
    const tituloFilter = `%${filtros.titulo}%`;

    countQuery = countQuery.ilike("titulo", tituloFilter);
    dataQuery = dataQuery.ilike("titulo", tituloFilter);
  }

  if (filtros?.años && filtros.años.length > 0) {
    if (filtros.años.length > 50) {
      // Para rangos amplios, filtrar por publicacion_ano con rango numérico
      const añoMin = Math.min(...filtros.años);
      const añoMax = Math.max(...filtros.años);

      const {data: pubsEnRango} = await supabaseClient
        .from("publicacion_ano")
        .select("publicacion_id")
        .gte("ano", añoMin)
        .lte("ano", añoMax);

      if (pubsEnRango && pubsEnRango.length > 0) {
        const ids = [...new Set(pubsEnRango.map((r) => r.publicacion_id))];
        countQuery = countQuery.in("id_publicacion", ids);
        dataQuery = dataQuery.in("id_publicacion", ids);
      } else {
        return { publicaciones: [], total: 0, pagina: 1, totalPaginas: 0, itemsPorPagina };
      }
    } else {
      const condicionesAño = filtros.años.map((año) => `anos.ilike.%${año}%`).join(",");
      countQuery = countQuery.or(condicionesAño);
      dataQuery = dataQuery.or(condicionesAño);
    }
  }

  if (filtros?.autor) {
    const autorFilter = `%${filtros.autor}%`;

    countQuery = countQuery.ilike("autores_nombres", autorFilter);
    dataQuery = dataQuery.ilike("autores_nombres", autorFilter);
  }

  if (filtros?.indexada !== undefined) {
    countQuery = countQuery.eq("indexada", filtros.indexada);
    dataQuery = dataQuery.eq("indexada", filtros.indexada);
  }

  if (filtros?.tiposPublicacion && filtros.tiposPublicacion.length > 0) {
    // Para tipos de publicación, necesitamos filtrar por publicacion_catalogo_awe
    // Primero obtenemos las publicaciones que tienen esos tipos
    const {data: publicacionesConTipo} = await supabaseClient
      .from("publicacion_catalogo_awe")
      .select("publicacion_id")
      .in("catalogo_awe_id", filtros.tiposPublicacion);

    if (publicacionesConTipo && publicacionesConTipo.length > 0) {
      const publicacionIds = publicacionesConTipo.map((p) => p.publicacion_id);

      countQuery = countQuery.in("id_publicacion", publicacionIds);
      dataQuery = dataQuery.in("id_publicacion", publicacionIds);
    } else {
      // Si no hay publicaciones con esos tipos, retornar vacío
      return {
        publicaciones: [],
        total: 0,
        pagina: 1,
        totalPaginas: 0,
        itemsPorPagina,
      };
    }
  }

  // Obtener total de publicaciones
  const {count, error: countError} = await countQuery;

  if (countError) {
    console.error("Error al contar publicaciones:", JSON.stringify(countError, null, 2));
    console.error("Filtros aplicados:", JSON.stringify(filtros, null, 2));

    return {
      publicaciones: [],
      total: 0,
      pagina: 1,
      totalPaginas: 0,
      itemsPorPagina,
    };
  }

  const total = count || 0;
  const totalPaginas = Math.ceil(total / itemsPorPagina);

  // Obtener publicaciones paginadas
  const {data: publicaciones, error} = await dataQuery
    .order("numero_publicacion_ano", {ascending: false, nullsFirst: false})
    .order("fecha", {ascending: false})
    .range(offset, offset + itemsPorPagina - 1);

  if (error) {
    console.error("Error al obtener publicaciones:", error);

    return {
      publicaciones: [],
      total: 0,
      pagina: 1,
      totalPaginas: 0,
      itemsPorPagina,
    };
  }

  if (!publicaciones) {
    return {
      publicaciones: [],
      total: 0,
      pagina: 1,
      totalPaginas: 0,
      itemsPorPagina,
    };
  }

  // Obtener los IDs de las publicaciones que tienen enlaces
  const publicacionIds = publicaciones.map((p: any) => p.id_publicacion);
  
  // Obtener el primer enlace de cada publicación
  const {data: enlacesData} = await supabaseClient
    .from("publicacion_enlace")
    .select("publicacion_id, enlace")
    .in("publicacion_id", publicacionIds)
    .neq("enlace", "http://")
    .neq("enlace", "")
    .not("enlace", "is", null)
    .order("id_publicacion_enlace", {ascending: true});

  // Crear un mapa de publicacion_id -> primer_enlace
  const enlacesMap = new Map<number, string>();
  if (enlacesData) {
    enlacesData.forEach((enlace: any) => {
      if (!enlacesMap.has(enlace.publicacion_id)) {
        enlacesMap.set(enlace.publicacion_id, enlace.enlace);
      }
    });
  }

  // Transformar los datos
  const publicacionesTransformadas: PublicacionSapoteca[] = publicaciones.map((pub: any) => {
    const año =
      pub.numero_publicacion_ano || (pub.fecha ? new Date(pub.fecha).getFullYear() : null);

    return {
      id_publicacion: pub.id_publicacion,
      titulo: pub.titulo,
      titulo_secundario: pub.titulo_secundario,
      cita_corta: pub.cita_corta,
      cita: pub.cita,
      cita_larga: pub.cita_larga,
      numero_publicacion_ano: pub.numero_publicacion_ano,
      fecha: pub.fecha,
      slug: generatePublicacionSlug(pub.cita_corta, año, pub.titulo, pub.id_publicacion),
      total_enlaces: pub.total_enlaces || null,
      primer_enlace: enlacesMap.get(pub.id_publicacion) || null,
    };
  });

  return {
    publicaciones: publicacionesTransformadas,
    total,
    pagina,
    totalPaginas,
    itemsPorPagina,
  };
}

/**
 * Obtiene años únicos de las publicaciones de Ecuador para filtros
 */
export async function getAñosPublicaciones(): Promise<number[]> {
  const supabaseClient = createServiceClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- vista no está en tipos generados
  const {data, error} = await supabaseClient
    .from("vw_publicacion_completa_ecuador" as any)
    .select("anos")
    .not("anos", "is", null)
    .neq("anos", "");

  if ((error && Object.keys(error).length > 0) || !data) {
    return [];
  }

  const años = new Set<number>();
  const rows = data as { anos?: string | null }[];

  rows.forEach((pub) => {
    if (pub.anos) {
      // La columna anos contiene años separados por comas (ej: "2011, 2012")
      const añosString = pub.anos.split(",").map((a) => a.trim());

      añosString.forEach((añoStr) => {
        const año = Number.parseInt(añoStr, 10);

        if (año && !isNaN(año) && año >= 1000 && año <= 9999) {
          años.add(año);
        }
      });
    }
  });

  return Array.from(años).sort((a, b) => b - a);
}
