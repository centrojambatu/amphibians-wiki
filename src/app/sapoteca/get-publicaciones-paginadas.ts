import {createServiceClient} from "@/utils/supabase/server";
import {generatePublicacionSlug} from "@/lib/generate-publicacion-slug";
import type {SupabaseClient} from "@supabase/supabase-js";

/** Máximo de IDs en un .in() para evitar URLs demasiado largas (fetch failed) */
const MAX_IDS_IN_QUERY = 150;

/**
 * Obtiene publicaciones paginadas con filtros.
 * Optimizado: queries de filtros en paralelo, luego query principal.
 */
async function getPublicacionesDesdeTabla(
  supabase: SupabaseClient,
  offset: number,
  itemsPorPagina: number,
  filtros: FiltrosSapoteca | undefined,
  idsFormato: number[] | null,
): Promise<PublicacionesPaginadas> {
  const emptyResult: PublicacionesPaginadas = {
    publicaciones: [], total: 0, pagina: Math.floor(offset / itemsPorPagina) + 1, totalPaginas: 0, itemsPorPagina,
  };

  // Ejecutar todos los filtros que generan IDs en paralelo
  const filterPromises: Promise<number[] | null>[] = [];

  // Filtro formato (ya resuelto como idsFormato)
  filterPromises.push(Promise.resolve(idsFormato));

  // Filtro tipo + año
  const tieneFiltroTipo = filtros?.tiposPublicacion && filtros.tiposPublicacion.length > 0;
  const tieneFiltroAño = filtros?.años && filtros.años.length > 0;
  if (tieneFiltroTipo || tieneFiltroAño) {
    filterPromises.push((async () => {
      let tiposValores: string[] = [];
      if (tieneFiltroTipo) {
        const { data: catData } = await supabase
          .from("catalogo_publicaciones" as any)
          .select("tipo")
          .in("id", filtros!.tiposPublicacion!);
        tiposValores = [...new Set((catData ?? []).map((r: { tipo: string | null }) => (r.tipo ?? "OTRO").trim()))];
      }
      let qVista = supabase.from("vw_publicacion_anfibios_ecuador" as any).select("id_publicacion");
      if (tiposValores.length > 0) qVista = qVista.in("tipo", tiposValores);
      if (tieneFiltroAño) qVista = qVista.in("numero_publicacion_ano", filtros!.años!);
      const { data } = await qVista;
      return (data ?? []).map((r: { id_publicacion: number }) => r.id_publicacion);
    })());
  } else {
    filterPromises.push(Promise.resolve(null));
  }

  // Filtro indexada
  if (filtros?.indexada !== undefined) {
    filterPromises.push((async () => {
      let q = supabase.from("vw_publicacion_cientifica_ecuador" as any).select("id_publicacion");
      if (filtros!.indexada) q = q.eq("indexada", true);
      else q = q.or("indexada.eq.false,indexada.is.null");
      const { data } = await q;
      return (data ?? []).map((r: { id_publicacion: number }) => r.id_publicacion);
    })());
  } else {
    filterPromises.push(Promise.resolve(null));
  }

  // Filtro autor
  if (filtros?.autor) {
    filterPromises.push((async () => {
      const {data: autores} = await supabase.from("autor").select("id_autor").or(`nombres.ilike.%${filtros!.autor}%,apellidos.ilike.%${filtros!.autor}%`);
      const idsAutor = (autores ?? []).map((a) => a.id_autor);
      if (idsAutor.length === 0) return [];
      const {data: pa} = await supabase.from("publicacion_autor").select("publicacion_id").in("autor_id", idsAutor);
      return [...new Set((pa ?? []).map((r) => r.publicacion_id))];
    })());
  } else {
    filterPromises.push(Promise.resolve(null));
  }

  // Ejecutar todos los filtros en paralelo
  const filterResults = await Promise.all(filterPromises);

  // Intersectar todos los conjuntos de IDs
  let idsFiltro: number[] | null = null;
  for (const ids of filterResults) {
    if (ids === null) continue;
    if (ids.length === 0) return emptyResult;
    if (idsFiltro === null) {
      idsFiltro = ids;
    } else {
      const setF = new Set(ids);
      idsFiltro = idsFiltro.filter((id) => setF.has(id));
      if (idsFiltro.length === 0) return emptyResult;
    }
  }

  // Query principal paginada
  let q = supabase
    .from("publicacion")
    .select("id_publicacion, titulo, titulo_secundario, cita_corta, cita, cita_larga, numero_publicacion_ano, fecha", { count: "exact" })
    .eq("anfibios_ecuador", true);

  if (filtros?.titulo) q = q.ilike("titulo", `%${filtros.titulo}%`);
  if (filtros?.indexada !== undefined) {
    if (filtros.indexada) q = q.eq("indexada", true);
    else q = q.or("indexada.eq.false,indexada.is.null");
  }
  if (idsFiltro !== null && idsFiltro.length > 0) {
    if (idsFiltro.length <= MAX_IDS_IN_QUERY) {
      q = q.in("id_publicacion", idsFiltro);
    } else {
      const chunks: number[][] = [];
      for (let i = 0; i < idsFiltro.length; i += MAX_IDS_IN_QUERY) chunks.push(idsFiltro.slice(i, i + MAX_IDS_IN_QUERY));
      q = q.or(chunks.map((c) => `id_publicacion.in.(${c.join(",")})`).join(","));
    }
  }

  const {data: rows, count, error} = await q
    .order("numero_publicacion_ano", {ascending: false, nullsFirst: false})
    .order("fecha", {ascending: false})
    .range(offset, offset + itemsPorPagina - 1);

  if (error || !rows) return emptyResult;

  const total = count ?? 0;
  const totalPaginas = Math.ceil(total / itemsPorPagina);
  const publicacionIds = rows.map((r: { id_publicacion: number }) => r.id_publicacion);

  // Obtener tipos y enlaces en paralelo
  const [tipoData, enlacesData] = await Promise.all([
    publicacionIds.length > 0
      ? supabase.from("vw_publicacion_anfibios_ecuador" as any).select("id_publicacion, tipo").in("id_publicacion", publicacionIds.slice(0, MAX_IDS_IN_QUERY)).then((r) => r.data)
      : Promise.resolve(null),
    supabase.from("publicacion_enlace").select("publicacion_id, enlace").in("publicacion_id", publicacionIds).neq("enlace", "http://").neq("enlace", "").not("enlace", "is", null).order("id_publicacion_enlace", {ascending: true}).then((r) => r.data),
  ]);

  const tipoMap = new Map<number, string>();
  (tipoData ?? []).forEach((r: { id_publicacion: number; tipo: string }) => tipoMap.set(r.id_publicacion, r.tipo));

  const enlacesMap = new Map<number, string>();
  const totalEnlacesMap = new Map<number, number>();
  ((enlacesData ?? []) as { publicacion_id: number; enlace: string }[]).forEach((e) => {
    if (!enlacesMap.has(e.publicacion_id)) enlacesMap.set(e.publicacion_id, e.enlace);
    totalEnlacesMap.set(e.publicacion_id, (totalEnlacesMap.get(e.publicacion_id) ?? 0) + 1);
  });

  const publicaciones: PublicacionSapoteca[] = rows.map((pub: Record<string, unknown>) => {
    const año = (pub.numero_publicacion_ano as number) || (pub.fecha ? new Date(pub.fecha as string).getFullYear() : null);
    return {
      id_publicacion: pub.id_publicacion as number,
      titulo: pub.titulo as string,
      titulo_secundario: pub.titulo_secundario as string | null,
      cita_corta: pub.cita_corta as string | null,
      cita: pub.cita as string | null,
      cita_larga: pub.cita_larga as string | null,
      numero_publicacion_ano: pub.numero_publicacion_ano as number | null,
      fecha: typeof pub.fecha === "string" ? pub.fecha : pub.fecha ? new Date(pub.fecha as string | Date).toISOString().slice(0, 10) : "",
      slug: generatePublicacionSlug(pub.cita_corta as string | null, año, pub.titulo as string, pub.id_publicacion as number),
      total_enlaces: totalEnlacesMap.get(Number(pub.id_publicacion)) ?? null,
      primer_enlace: enlacesMap.get(Number(pub.id_publicacion)) ?? null,
      tipo: tipoMap.get(Number(pub.id_publicacion)) ?? undefined,
    };
  });

  return { publicaciones, total, pagina: Math.floor(offset / itemsPorPagina) + 1, totalPaginas, itemsPorPagina };
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
  /** CIENTIFICA | TESIS | DIVULGACIÓN | OTRO | SIN_ASIGNAR (para color del título en card) */
  tipo?: string;
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
 * Obtiene años únicos de las publicaciones de Ecuador usando RPC (1 query SQL).
 */
export async function getAñosPublicaciones(): Promise<number[]> {
  const supabaseClient = createServiceClient();

  const {data, error} = await supabaseClient.rpc("get_anos_publicaciones_ecuador");

  if (!error && data && data.length > 0) {
    return (data as {ano: number}[]).map((r) => r.ano);
  }

  return [];
}
