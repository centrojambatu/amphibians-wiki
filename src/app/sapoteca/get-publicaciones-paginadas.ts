import {createServiceClient} from "@/utils/supabase/server";
import {generatePublicacionSlug} from "@/lib/generate-publicacion-slug";
import type {SupabaseClient} from "@supabase/supabase-js";

/** Máximo de IDs en un .in() para evitar URLs demasiado largas (fetch failed) */
const MAX_IDS_IN_QUERY = 150;

/**
 * Fallback: obtiene publicaciones desde la tabla publicacion cuando la vista no está disponible.
 */
async function getPublicacionesDesdeTabla(
  supabase: SupabaseClient,
  offset: number,
  itemsPorPagina: number,
  filtros: FiltrosSapoteca | undefined,
  idsFormato: number[] | null,
): Promise<PublicacionesPaginadas> {
  let idsFiltro: number[] | null = idsFormato && idsFormato.length > 0 ? [...idsFormato] : null;

  if (filtros?.tiposPublicacion && filtros.tiposPublicacion.length > 0) {
    const {data: idsTipo} = await supabase
      .from("publicacion_catalogo_awe")
      .select("publicacion_id")
      .in("catalogo_publicaciones_id", filtros.tiposPublicacion);
    const ids = [...new Set((idsTipo ?? []).map((r) => r.publicacion_id))];
    if (idsFiltro !== null) {
      const setF = new Set(idsFiltro);
      idsFiltro = ids.filter((id) => setF.has(id));
    } else {
      idsFiltro = ids;
    }
    if (idsFiltro.length === 0) {
      return { publicaciones: [], total: 0, pagina: Math.floor(offset / itemsPorPagina) + 1, totalPaginas: 0, itemsPorPagina };
    }
  }

  if (filtros?.años && filtros.años.length > 0) {
    const {data: pa} = await supabase.from("publicacion_ano").select("publicacion_id").in("ano", filtros.años);
    const idsAño = [...new Set((pa ?? []).map((r) => r.publicacion_id))];
    if (idsFiltro !== null) {
      const setF = new Set(idsFiltro);
      idsFiltro = idsAño.filter((id) => setF.has(id));
    } else {
      idsFiltro = idsAño;
    }
    if (idsFiltro.length === 0) {
      return { publicaciones: [], total: 0, pagina: Math.floor(offset / itemsPorPagina) + 1, totalPaginas: 0, itemsPorPagina };
    }
  }

  if (filtros?.autor) {
    const {data: autores} = await supabase.from("autor").select("id_autor").or(`nombres.ilike.%${filtros.autor}%,apellidos.ilike.%${filtros.autor}%`);
    const idsAutor = (autores ?? []).map((a) => a.id_autor);
    if (idsAutor.length === 0) {
      return { publicaciones: [], total: 0, pagina: Math.floor(offset / itemsPorPagina) + 1, totalPaginas: 0, itemsPorPagina };
    }
    const {data: pa} = await supabase.from("publicacion_autor").select("publicacion_id").in("autor_id", idsAutor);
    const idsPub = [...new Set((pa ?? []).map((r) => r.publicacion_id))];
    if (idsFiltro !== null) {
      const setF = new Set(idsFiltro);
      idsFiltro = idsPub.filter((id) => setF.has(id));
    } else {
      idsFiltro = idsPub;
    }
    if (idsFiltro.length === 0) {
      return { publicaciones: [], total: 0, pagina: Math.floor(offset / itemsPorPagina) + 1, totalPaginas: 0, itemsPorPagina };
    }
  }

  let q = supabase
    .from("publicacion")
    .select("id_publicacion, titulo, titulo_secundario, cita_corta, cita, cita_larga, numero_publicacion_ano, fecha", {
      count: "exact",
    })
    .eq("anfibios_ecuador", true);

  if (filtros?.titulo) {
    q = q.ilike("titulo", `%${filtros.titulo}%`);
  }
  if (filtros?.indexada !== undefined) {
    q = q.eq("indexada", filtros.indexada);
  }
  if (idsFiltro !== null && idsFiltro.length > 0) {
    if (idsFiltro.length <= MAX_IDS_IN_QUERY) {
      q = q.in("id_publicacion", idsFiltro);
    } else {
      const chunks: number[][] = [];
      for (let i = 0; i < idsFiltro.length; i += MAX_IDS_IN_QUERY) {
        chunks.push(idsFiltro.slice(i, i + MAX_IDS_IN_QUERY));
      }
      q = q.or(chunks.map((c) => `id_publicacion.in.(${c.join(",")})`).join(","));
    }
  }

  const {data: rows, count, error} = await q
    .order("numero_publicacion_ano", {ascending: false, nullsFirst: false})
    .order("fecha", {ascending: false})
    .range(offset, offset + itemsPorPagina - 1);

  if (error || !rows) {
    return {
      publicaciones: [],
      total: 0,
      pagina: Math.floor(offset / itemsPorPagina) + 1,
      totalPaginas: 0,
      itemsPorPagina,
    };
  }

  const total = count ?? 0;
  const totalPaginas = Math.ceil(total / itemsPorPagina);

  const publicacionIds = rows.map((r: { id_publicacion: number }) => r.id_publicacion);
  const {data: enlacesData} = await supabase
    .from("publicacion_enlace")
    .select("publicacion_id, enlace")
    .in("publicacion_id", publicacionIds)
    .neq("enlace", "http://")
    .neq("enlace", "")
    .not("enlace", "is", null)
    .order("id_publicacion_enlace", {ascending: true});

  const enlacesMap = new Map<number, string>();
  const totalEnlacesMap = new Map<number, number>();
  (enlacesData ?? []).forEach((e: { publicacion_id: number; enlace: string }) => {
    if (!enlacesMap.has(e.publicacion_id)) enlacesMap.set(e.publicacion_id, e.enlace);
    totalEnlacesMap.set(e.publicacion_id, (totalEnlacesMap.get(e.publicacion_id) ?? 0) + 1);
  });

  const publicacionesTransformadas: PublicacionSapoteca[] = rows.map((pub: Record<string, unknown>) => {
    const año = (pub.numero_publicacion_ano as number) || (pub.fecha ? new Date(pub.fecha as string).getFullYear() : null);
    return {
      id_publicacion: pub.id_publicacion as number,
      titulo: pub.titulo as string,
      titulo_secundario: pub.titulo_secundario as string | null,
      cita_corta: pub.cita_corta as string | null,
      cita: pub.cita as string | null,
      cita_larga: pub.cita_larga as string | null,
      numero_publicacion_ano: pub.numero_publicacion_ano as number | null,
      fecha:
        typeof pub.fecha === "string" ? pub.fecha : pub.fecha ? new Date(pub.fecha as string | Date).toISOString().slice(0, 10) : "",
      slug: generatePublicacionSlug(pub.cita_corta as string | null, año, pub.titulo as string, pub.id_publicacion as number),
      total_enlaces: totalEnlacesMap.get(Number(pub.id_publicacion)) ?? null,
      primer_enlace: enlacesMap.get(Number(pub.id_publicacion)) ?? null,
    };
  });

  return {
    publicaciones: publicacionesTransformadas,
    total,
    pagina: Math.floor(offset / itemsPorPagina) + 1,
    totalPaginas,
    itemsPorPagina,
  };
}

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
  /** true = impreso, false = web (campo publicacion.formato_impreso) */
  formatoImpreso?: boolean;
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

  const offset = (pagina - 1) * itemsPorPagina;

  // Impresas/web: IDs de publicaciones divulgación con ese formato
  let idsFormato: number[] | null = null;
  if (filtros?.formatoImpreso !== undefined) {
    const {data: catDivulgacion} = await supabaseClient
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- catalogo_publicaciones puede no estar en tipos generados
      .from("catalogo_publicaciones" as any)
      .select("id")
      .eq("tipo", "DIVULGACIÓN");
    const idsCatDivulgacion = (catDivulgacion ?? []).map((r: { id: number }) => r.id);

    const {data: pcaDivulgacion} = await supabaseClient
      .from("publicacion_catalogo_awe")
      .select("publicacion_id")
      .in("catalogo_publicaciones_id", idsCatDivulgacion);
    const setDivulgacion = new Set(
      (pcaDivulgacion ?? []).map((r: { publicacion_id: number }) => r.publicacion_id),
    );

    const {data: rowsFormato} = await supabaseClient
      .from("publicacion")
      .select("id_publicacion")
      .eq("anfibios_ecuador", true)
      .eq("formato_impreso", filtros.formatoImpreso);
    const idsConFormato = rowsFormato?.map((r) => r.id_publicacion) ?? [];
    idsFormato = idsConFormato.filter((id) => setDivulgacion.has(id));

    if (idsFormato.length === 0) {
      return {
        publicaciones: [],
        total: 0,
        pagina: 1,
        totalPaginas: 0,
        itemsPorPagina,
      };
    }
  }

  // Usar siempre la tabla publicacion (vista puede no estar disponible o devolver vacío)
  const resultado = await getPublicacionesDesdeTabla(
    supabaseClient,
    offset,
    itemsPorPagina,
    filtros,
    idsFormato,
  );

  return resultado;
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

  if (!error && data && data.length > 0) {
    const años = new Set<number>();
    const rows = data as { anos?: string | null }[];
    rows.forEach((pub) => {
      if (pub.anos) {
        pub.anos.split(",").map((a) => a.trim()).forEach((añoStr) => {
          const año = Number.parseInt(añoStr, 10);
          if (año && !isNaN(año) && año >= 1000 && año <= 9999) años.add(año);
        });
      }
    });
    return Array.from(años).sort((a, b) => b - a);
  }

  // Fallback: años distintos desde publicacion_ano (sin filtrar por Ecuador)
  const {data: pa} = await supabaseClient
    .from("publicacion_ano")
    .select("ano")
    .gte("ano", 1849)
    .lte("ano", new Date().getFullYear());
  const añosSet = new Set<number>();
  (pa ?? []).forEach((r: { ano: number }) => {
    if (r.ano >= 1000 && r.ano <= 9999) añosSet.add(r.ano);
  });
  return Array.from(añosSet).sort((a, b) => b - a);
}
