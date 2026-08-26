import {createServiceClient} from "@/utils/supabase/server";
import {generatePublicacionSlug} from "@/lib/generate-publicacion-slug";
import type {SupabaseClient} from "@supabase/supabase-js";

/** Máximo de IDs en un .in() para evitar URLs demasiado largas (fetch failed) */
const MAX_IDS_IN_QUERY = 150;

/** PostgREST corta la respuesta en 1.000 filas; los filtros por IDs hay que paginarlos. */
const PAGE_SIZE_IDS = 1000;

/**
 * Recorre una query paginando hasta agotarla y devuelve todos los IDs.
 * Sin esto un filtro con más de 1.000 coincidencias se trunca en silencio y el
 * listado muestra menos publicaciones de las que anuncia el contador del panel.
 */
async function recolectarIds(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- el builder de Supabase no está tipado aquí
  crearQuery: () => any,
  columna: "id_publicacion" | "publicacion_id" = "id_publicacion",
): Promise<number[]> {
  const ids: number[] = [];
  let offset = 0;

  for (;;) {
    const {data} = await crearQuery()
      .order(columna, {ascending: true})
      .range(offset, offset + PAGE_SIZE_IDS - 1);
    const filas = (data ?? []) as Record<string, number | null>[];

    for (const fila of filas) {
      const id = fila[columna];

      if (id != null) ids.push(id);
    }

    if (filas.length < PAGE_SIZE_IDS) return ids;
    offset += PAGE_SIZE_IDS;
  }
}

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

  const tiposSeleccionados = filtros?.tiposPublicacion ?? [];
  const añosSeleccionados = filtros?.años ?? [];
  const tieneFiltroTipo = tiposSeleccionados.length > 0;
  const tieneFiltroAño = añosSeleccionados.length > 0;

  // Tipo y autores son las dos consultas auxiliares; el resto de filtros se
  // resuelven como condiciones SQL en la query principal.
  const [tiposDeCatalogo, idsAutores] = await Promise.all([
    tieneFiltroTipo
      ? (async () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- catalogo_publicaciones puede no estar en tipos generados
          const {data} = await supabase
            .from("catalogo_publicaciones" as any)
            .select("tipo")
            .in("id", tiposSeleccionados);

          return [
            ...new Set(
              ((data ?? []) as unknown as {tipo: string | null}[]).map((r) =>
                (r.tipo ?? "OTRO").trim(),
              ),
            ),
          ];
        })()
      : Promise.resolve(null),
    // Filtro autores (múltiples vía checkbox).
    // Se busca en `vw_publicacion_completa.autores_nombres` con `ilike` — un autor coincide
    // si cualquiera de los términos seleccionados aparece en el string de autores.
    filtros?.autores && filtros.autores.length > 0
      ? (async () => {
          const terminos = (filtros.autores ?? [])
            .map((a) => a.trim())
            .filter((a) => a.length > 0);

          if (terminos.length === 0) return null;

          // Ejecutar una ilike por autor y unir los IDs (semántica OR).
          const resultados = await Promise.all(
            terminos.map((termino) =>
              recolectarIds(() =>
                // eslint-disable-next-line @typescript-eslint/no-explicit-any -- la vista no está en los tipos generados
                (supabase.from("vw_publicacion_completa" as any) as any)
                  .select("id_publicacion")
                  .ilike("autores_nombres", `%${termino}%`),
              ),
            ),
          );

          return [...new Set(resultados.flat())];
        })()
      : Promise.resolve(null),
  ]);

  // "Indexada" describe solo al universo científico (CIENTIFICA/TESIS), igual que
  // la card de estadísticas; se cruza con los tipos marcados en el panel.
  let tiposValores = tiposDeCatalogo;

  if (filtros?.indexada !== undefined) {
    const cientificos = ["CIENTIFICA", "TESIS"];

    tiposValores =
      tiposValores === null
        ? cientificos
        : tiposValores.filter((t) => cientificos.includes(t));
  }
  if (tiposValores !== null && tiposValores.length === 0) return emptyResult;

  // Intersectar los conjuntos de IDs que sí hay que resolver aparte
  let idsFiltro: number[] | null = null;

  for (const ids of [idsFormato, idsAutores]) {
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

  // Query principal paginada sobre la vista: tiene las mismas columnas que la
  // tabla más `tipo`, así que tipo/año/indexada se filtran en SQL en vez de con
  // listas de IDs (PostgREST las truncaba en 1.000 y el listado mentía).
  let q = supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- la vista no está en los tipos generados
    .from("vw_publicacion_anfibios_ecuador" as any)
    .select(
      "id_publicacion, titulo, titulo_secundario, cita_corta, cita, cita_larga, numero_publicacion_ano, fecha, tipo",
      { count: "exact" },
    );

  if (tiposValores !== null) q = q.in("tipo", tiposValores);
  if (tieneFiltroAño) {
    const años = añosSeleccionados;
    // Si los años son contiguos (rango del slider), usar BETWEEN para evitar IN gigante.
    const ordenados = [...años].sort((a, b) => a - b);
    const esContiguo =
      ordenados.length > 1 &&
      ordenados.every((y, i) => i === 0 || y === ordenados[i - 1] + 1);

    if (esContiguo) {
      q = q
        .gte("numero_publicacion_ano", ordenados[0])
        .lte("numero_publicacion_ano", ordenados[ordenados.length - 1]);
    } else {
      q = q.in("numero_publicacion_ano", años);
    }
  }
  if (filtros?.titulos && filtros.titulos.length > 0) {
    q = q.in("titulo", filtros.titulos);
  }
  if (filtros?.publicacionId !== undefined) q = q.eq("id_publicacion", filtros.publicacionId);
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

  // El tipo ya viene en cada fila de la vista; solo faltan los enlaces.
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
      tipo: (pub.tipo as string | null) ?? undefined,
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
  /** Lista de títulos (exact match) seleccionados vía checkbox */
  titulos?: string[];
  años?: number[];
  /** Lista de autores (nombre completo) seleccionados vía checkbox */
  autores?: string[];
  tiposPublicacion?: number[];
  indexada?: boolean;
  /** true = impreso, false = web (campo publicacion.formato_impreso) */
  formatoImpreso?: boolean;
  /** Filtrar por id_publicacion específico */
  publicacionId?: number;
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
  const formatoImpreso = filtros?.formatoImpreso;

  if (formatoImpreso !== undefined) {
    const {data: catDivulgacion} = await supabaseClient
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- catalogo_publicaciones puede no estar en tipos generados
      .from("catalogo_publicaciones" as any)
      .select("id")
      .eq("tipo", "DIVULGACIÓN");
    const idsCatDivulgacion = ((catDivulgacion ?? []) as unknown as { id: number }[]).map(
      (r) => r.id,
    );

    const [idsDivulgacion, idsConFormato] = await Promise.all([
      recolectarIds(
        () =>
          supabaseClient
            .from("publicacion_catalogo_awe")
            .select("publicacion_id")
            .in("catalogo_publicaciones_id", idsCatDivulgacion),
        "publicacion_id",
      ),
      recolectarIds(() =>
        supabaseClient
          .from("publicacion")
          .select("id_publicacion")
          .eq("anfibios_ecuador", true)
          .eq("formato_impreso", formatoImpreso),
      ),
    ]);
    const setDivulgacion = new Set(idsDivulgacion);

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
