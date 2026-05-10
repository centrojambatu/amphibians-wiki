import {createServiceClient} from "@/utils/supabase/server";

export interface MuestrasTaxon {
  taxon_id: number;
  total_registros: number;
  count_sangre: number;
  count_piel_exudado: number;
  count_piel_liofilizado: number;
  count_tejido_higado: number;
  count_tejido_musculo: number;
  count_esqueleto_transparentacion: number;
  count_esperma: number;
  count_heces: number;
  nombre_cientifico: string | null;
  nombre_comun: string | null;
  orden: string | null;
  familia: string | null;
  genero: string | null;
}

export const MUESTRA_FIELDS = [
  {key: "sangre", label: "Sangre", count: "count_sangre"},
  {key: "piel_exudado", label: "Piel exudado", count: "count_piel_exudado"},
  {key: "piel_liofilizado", label: "Piel liofilizado", count: "count_piel_liofilizado"},
  {key: "tejido_higado", label: "Tejido hígado", count: "count_tejido_higado"},
  {key: "tejido_musculo", label: "Tejido músculo", count: "count_tejido_musculo"},
  {
    key: "esqueleto_transparentacion",
    label: "Esqueleto",
    count: "count_esqueleto_transparentacion",
  },
  {key: "esperma", label: "Esperma", count: "count_esperma"},
  {key: "heces", label: "Heces", count: "count_heces"},
] as const;

export type MuestraField = (typeof MUESTRA_FIELDS)[number]["key"];

export async function getMoleculotecaTaxa(busqueda?: string): Promise<MuestrasTaxon[]> {
  const supabase = createServiceClient();

  const {data: agregados, error} = await (supabase as any)
    .from("vw_moleculoteca_taxon")
    .select("*");

  if (error || !agregados) {
    console.error("Error al obtener moleculoteca:", error);

    return [];
  }

  const taxonIds = agregados.map((a: any) => a.taxon_id);

  if (taxonIds.length === 0) return [];

  let query = supabase
    .from("vw_ficha_especie_completa")
    .select("especie_taxon_id, nombre_cientifico, nombre_comun, orden, familia, genero")
    .in("especie_taxon_id", taxonIds);

  if (busqueda?.trim()) {
    query = query.or(
      `nombre_cientifico.ilike.%${busqueda.trim()}%,nombre_comun.ilike.%${busqueda.trim()}%`,
    );
  }

  const {data: especies} = await query;
  const especieMap = new Map<number, any>();

  (especies || []).forEach((e: any) => {
    if (e.especie_taxon_id != null && !especieMap.has(e.especie_taxon_id)) {
      especieMap.set(e.especie_taxon_id, e);
    }
  });

  const result: MuestrasTaxon[] = agregados
    .filter((a: any) => especieMap.has(a.taxon_id))
    .map((a: any) => {
      const e = especieMap.get(a.taxon_id);

      return {
        ...a,
        nombre_cientifico: e?.nombre_cientifico ?? null,
        nombre_comun: e?.nombre_comun ?? null,
        orden: e?.orden ?? null,
        familia: e?.familia ?? null,
        genero: e?.genero ?? null,
      };
    });

  result.sort((a, b) => (a.nombre_cientifico || "").localeCompare(b.nombre_cientifico || ""));

  return result;
}
