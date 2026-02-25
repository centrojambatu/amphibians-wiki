import { createServiceClient } from "@/utils/supabase/server";

export interface TipoPublicacion {
  id_catalogo_awe: number;
  nombre: string;
  sigla: string | null;
  orden: number | null;
}

export interface TiposPublicacionAgrupados {
  cientificos: TipoPublicacion[];
  divulgacion: TipoPublicacion[];
}

const IDS_CIENTIFICOS = new Set([147, 150, 152, 155, 162, 166]);

/**
 * Obtiene los tipos de publicación desde catalogo_awe (tipo_catalogo_awe_id = 9)
 * agrupados en científico y divulgación.
 */
export default async function getTiposPublicacion(): Promise<TiposPublicacionAgrupados> {
  const supabaseClient = createServiceClient();

  const { data, error } = await supabaseClient
    .from("catalogo_awe")
    .select("id_catalogo_awe, nombre, sigla, orden")
    .eq("tipo_catalogo_awe_id", 9)
    .order("orden", { ascending: true, nullsFirst: false });

  if ((error && Object.keys(error).length > 0) || !data) {
    console.error("Error al obtener tipos de publicación:", error);
    return { cientificos: [], divulgacion: [] };
  }

  const tipos: TipoPublicacion[] = data.map((item) => ({
    id_catalogo_awe: item.id_catalogo_awe,
    nombre: item.nombre,
    sigla: item.sigla,
    orden: item.orden,
  }));

  return {
    cientificos: tipos.filter((t) => IDS_CIENTIFICOS.has(t.id_catalogo_awe)),
    divulgacion: tipos.filter((t) => !IDS_CIENTIFICOS.has(t.id_catalogo_awe)),
  };
}
