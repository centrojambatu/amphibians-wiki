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

  // Resolver IDs de catálogo a valores de tipo (CIENTIFICA, TESIS, DIVULGACIÓN, OTRO) para la vista
  let tiposValores: string[] = [];
  if (filtros?.tiposPublicacion && filtros.tiposPublicacion.length > 0) {
    const { data: catData } = await supabase
      .from("catalogo_publicaciones" as any)
      .select("tipo")
      .in("id", filtros.tiposPublicacion);
    tiposValores = [
      ...new Set(
        (catData ?? []).map((r: { tipo: string | null }) => (r.tipo ?? "OTRO").trim()),
      ),
    ];
  }

  // Una sola fuente: vista vw_publicacion_anfibios_ecuador (tipo + numero_publicacion_ano)
  const tieneFiltroTipo = tiposValores.length > 0;
  const tieneFiltroAño = filtros?.años && filtros.años.length > 0;
  if (tieneFiltroTipo || tieneFiltroAño) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- vista no está en tipos generados
    let qVista = supabase
      .from("vw_publicacion_anfibios_ecuador" as any)
      .select("id_publicacion");
    if (tieneFiltroTipo) qVista = qVista.in("tipo", tiposValores);
    if (tieneFiltroAño) qVista = qVista.in("numero_publicacion_ano", filtros.años!);
    const { data: rowsVista } = await qVista;
    const idsVista = (rowsVista ?? []) as { id_publicacion: number }[];
    const idsList = idsVista.map((r) => r.id_publicacion);
    if (idsFiltro !== null) {
      const setF = new Set(idsFiltro);
      idsFiltro = idsList.filter((id) => setF.has(id));
    } else {
      idsFiltro = idsList;
    }
    if (idsFiltro.length === 0) {
      return {
        publicaciones: [],
        total: 0,
        pagina: Math.floor(offset / itemsPorPagina) + 1,
        totalPaginas: 0,
        itemsPorPagina,
      };
    }
  }

  // Indexada / no indexada: solo publicaciones científicas (igual que las tarjetas)
  if (filtros?.indexada !== undefined) {
    let qCientificas = supabase
      .from("vw_publicacion_cientifica_ecuador" as any)
      .select("id_publicacion");
    if (filtros.indexada) {
      qCientificas = qCientificas.eq("indexada", true);
    } else {
      qCientificas = qCientificas.or("indexada.eq.false,indexada.is.null");
    }
    const { data: rowsCient } = await qCientificas;
    const idsCientificas = (rowsCient ?? []) as { id_publicacion: number }[];
    const idsListCient = idsCientificas.map((r) => r.id_publicacion);
    if (idsFiltro !== null) {
      const setF = new Set(idsFiltro);
      idsFiltro = idsListCient.filter((id) => setF.has(id));
    } else {
      idsFiltro = idsListCient;
    }
    if (idsFiltro.length === 0) {
      return {
        publicaciones: [],
        total: 0,
        pagina: Math.floor(offset / itemsPorPagina) + 1,
        totalPaginas: 0,
        itemsPorPagina,
      };
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
    if (filtros.indexada) {
      q = q.eq("indexada", true);
    } else {
      q = q.or("indexada.eq.false,indexada.is.null");
    }
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
  const tipoMap = new Map<number, string>();
  if (publicacionIds.length > 0) {
    const idsForTipo = publicacionIds.length <= MAX_IDS_IN_QUERY
      ? publicacionIds
      : publicacionIds.slice(0, MAX_IDS_IN_QUERY);
    const { data: tipoData } = await supabase
      .from("vw_publicacion_anfibios_ecuador" as any)
      .select("id_publicacion, tipo")
      .in("id_publicacion", idsForTipo);
    (tipoData ?? []).forEach((r: { id_publicacion: number; tipo: string }) => {
      tipoMap.set(r.id_publicacion, r.tipo);
    });
  }
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
      tipo: tipoMap.get(Number(pub.id_publicacion)) ?? undefined,
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

/** Límite inferior razonable para años. El mínimo real es el de la publicación más antigua. */
const AÑO_MIN_SANE = 1000;

/**
 * Obtiene años únicos de las publicaciones de Ecuador para filtros.
 * El año mínimo es el de la publicación más antigua (igual que el histograma).
 */
export async function getAñosPublicaciones(): Promise<number[]> {
  const supabaseClient = createServiceClient();
  const añoActual = new Date().getFullYear();

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
          if (
            año &&
            !isNaN(año) &&
            año >= AÑO_MIN_SANE &&
            año <= añoActual
          ) {
            años.add(año);
          }
        });
      }
    });
    return Array.from(años).sort((a, b) => b - a);
  }

  // Fallback: años desde publicacion_ano
  const {data: pa} = await supabaseClient
    .from("publicacion_ano")
    .select("ano")
    .gte("ano", AÑO_MIN_SANE)
    .lte("ano", añoActual);
  const añosSet = new Set<number>();
  (pa ?? []).forEach((r: { ano: number }) => {
    if (r.ano >= AÑO_MIN_SANE && r.ano <= añoActual) añosSet.add(r.ano);
  });
  return Array.from(añosSet).sort((a, b) => b - a);
}
