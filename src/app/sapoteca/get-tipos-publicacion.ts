import { createServiceClient } from "@/utils/supabase/server";

export interface TipoPublicacion {
  id: number;
  nombre: string;
  tipo: string;
}

/** Una sección de filtros: un valor de tipo (ej. CIENTIFICA) con título, ítems y total de publicaciones Ecuador */
export interface SeccionTipoPublicacion {
  tipo: string;
  titulo: string;
  items: TipoPublicacion[];
  totalPublicaciones: number;
}

/** Tipos agrupados por sección para el panel de filtros (una sección por valor de tipo) */
export interface TiposPublicacionAgrupados {
  secciones: SeccionTipoPublicacion[];
}

/** Orden y título en UI para cada valor de catalogo_publicaciones.tipo. SIN_ASIGNAR = publicaciones sin tipo. */
const ORDEN_Y_TITULO_TIPO: Record<string, { orden: number; titulo: string }> = {
  CIENTIFICA: { orden: 0, titulo: "Científica" },
  TESIS: { orden: 1, titulo: "Tesis" },
  DIVULGACIÓN: { orden: 2, titulo: "Divulgación" },
  OTRO: { orden: 3, titulo: "Otro" },
  SIN_ASIGNAR: { orden: 4, titulo: "Sin asignar" },
};

/** Prioridad para asignar cada publicación a una sola categoría (la de mayor prioridad que tenga). */
const PRIORIDAD_TIPO = ["CIENTIFICA", "TESIS", "DIVULGACIÓN", "OTRO"];

/**
 * Obtiene los tipos de publicación desde catalogo_publicaciones,
 * agrupados en secciones por la columna tipo (una sección por valor: Científica, Tesis, Divulgación, Otro).
 */
export default async function getTiposPublicacion(): Promise<TiposPublicacionAgrupados> {
  const supabaseClient = createServiceClient();

  const { data, error } = await supabaseClient
    .from("catalogo_publicaciones")
    .select("id, nombre, tipo")
    .order("nombre", { ascending: true });

  if ((error && Object.keys(error).length > 0) || !data) {
    console.error("Error al obtener tipos de publicación:", error);
    return { secciones: [] };
  }

  const tipos: TipoPublicacion[] = (data as { id: number; nombre: string; tipo: string | null }[]).map(
    (item) => ({
      id: item.id,
      nombre: item.nombre,
      tipo: item.tipo ?? "OTRO",
    }),
  );

  const porTipo = new Map<string, TipoPublicacion[]>();
  for (const t of tipos) {
    const lista = porTipo.get(t.tipo) ?? [];
    lista.push(t);
    porTipo.set(t.tipo, lista);
  }

  // Por cada publicación Ecuador, obtener los tipos que tiene (vía publicacion_catalogo_awe).
  // PostgREST/Supabase limita por defecto (~1000 filas); paginamos para traer todas.
  type PcaRow = {
    publicacion_id: number;
    catalogo_publicaciones: { tipo: string | null } | null;
    publicacion: { anfibios_ecuador: boolean | null } | null;
  };
  const tiposPorPublicacion = new Map<number, Set<string>>();
  const pageSize = 1000;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data: pcaPage } = await supabaseClient
      .from("publicacion_catalogo_awe")
      .select("publicacion_id, catalogo_publicaciones(tipo), publicacion(anfibios_ecuador)")
      .not("catalogo_publicaciones_id", "is", null)
      .range(offset, offset + pageSize - 1);

    const rows = (pcaPage ?? []) as unknown as PcaRow[];
    for (const r of rows) {
      if (r.publicacion?.anfibios_ecuador !== true) continue;
      const tipo = (r.catalogo_publicaciones?.tipo ?? "OTRO").trim();
      const set = tiposPorPublicacion.get(r.publicacion_id) ?? new Set<string>();
      set.add(tipo);
      tiposPorPublicacion.set(r.publicacion_id, set);
    }
    hasMore = rows.length === pageSize;
    offset += pageSize;
  }

  // Total publicaciones Ecuador (para asignar "Sin asignar" a las que no tienen tipo)
  const { count: totalEcuador } = await supabaseClient
    .from("publicacion")
    .select("*", { count: "exact", head: true })
    .eq("anfibios_ecuador", true);
  const total = totalEcuador ?? 0;

  // Asignar cada publicación a una sola categoría por prioridad (para que los conteos sumen el total)
  const countsPorTipo = new Map<string, number>();
  for (const tipo of [...PRIORIDAD_TIPO, "SIN_ASIGNAR"]) {
    countsPorTipo.set(tipo, 0);
  }
  const publicacionesAsignadas = new Set<number>();
  for (const [publicacionId, tipos] of tiposPorPublicacion) {
    let asignado: string = "SIN_ASIGNAR";
    for (const tipo of PRIORIDAD_TIPO) {
      if (tipos.has(tipo)) {
        asignado = tipo;
        break;
      }
    }
    countsPorTipo.set(asignado, (countsPorTipo.get(asignado) ?? 0) + 1);
    publicacionesAsignadas.add(publicacionId);
  }
  const sinTipo = total - publicacionesAsignadas.size;
  countsPorTipo.set("SIN_ASIGNAR", (countsPorTipo.get("SIN_ASIGNAR") ?? 0) + sinTipo);

  const secciones: SeccionTipoPublicacion[] = Array.from(porTipo.entries())
    .map(([tipo, items]) => ({
      tipo,
      titulo: ORDEN_Y_TITULO_TIPO[tipo]?.titulo ?? tipo,
      items,
      totalPublicaciones: countsPorTipo.get(tipo) ?? 0,
    }))
    .sort((a, b) => {
      const ordenA = ORDEN_Y_TITULO_TIPO[a.tipo]?.orden ?? 99;
      const ordenB = ORDEN_Y_TITULO_TIPO[b.tipo]?.orden ?? 99;
      return ordenA - ordenB;
    });

  // Añadir sección "Sin asignar" si hay publicaciones sin tipo (para que la suma = total)
  if (sinTipo > 0) {
    secciones.push({
      tipo: "SIN_ASIGNAR",
      titulo: ORDEN_Y_TITULO_TIPO.SIN_ASIGNAR.titulo,
      items: [],
      totalPublicaciones: sinTipo,
    });
    secciones.sort((a, b) => {
      const ordenA = ORDEN_Y_TITULO_TIPO[a.tipo]?.orden ?? 99;
      const ordenB = ORDEN_Y_TITULO_TIPO[b.tipo]?.orden ?? 99;
      return ordenA - ordenB;
    });
  }

  return { secciones };
}
