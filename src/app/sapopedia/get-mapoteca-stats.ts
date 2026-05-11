import {createClient} from "@/utils/supabase/server";

type Row = {
  nombre_cientifico: string;
  ubicaciones_geopoliticas: string | null;
  awe_regiones_biogeograficas: string | null;
  awe_distribucion_altitudinal: string | null;
  awe_ecosistemas: string | null;
  awe_areas_protegidas_estado: string | null;
  endemica: boolean | null;
};

export interface MapotecaStatsData {
  provincia: {name: string; total: number};
  biogeografico: {name: string; total: number};
  ecosistema: {name: string; total: number};
  piso: {name: string; total: number};
  snap: {name: string; total: number};
  biogeograficoEndemica: {name: string; total: number; totalRegion: number; porcentaje: number};
  histogramaProvincias: {name: string; total: number}[];
  histogramaBiogeografico: {name: string; total: number}[];
  histogramaEcosistema: {name: string; total: number}[];
  histogramaPiso: {name: string; total: number}[];
  histogramaSnap: {name: string; total: number}[];
  histogramaBiogeograficoEndemica: {
    name: string;
    total: number;
    endemicas: number;
    totalSpp: number;
  }[];
}

function splitField(value: string | null): string[] {
  if (!value) return [];

  return value
    .split(",")
    .map((s) => s.replace(/\*/g, "").trim())
    .filter(Boolean);
}

function allEntries(rows: Row[], field: keyof Row): {name: string; total: number}[] {
  const counts: Record<string, Set<string>> = {};

  for (const row of rows) {
    for (const part of splitField(row[field] as string | null)) {
      if (!counts[part]) counts[part] = new Set();
      counts[part].add(row.nombre_cientifico);
    }
  }

  return Object.entries(counts)
    .map(([name, set]) => ({name, total: set.size}))
    .sort((a, b) => b.total - a.total);
}

export default async function getMapotecaStats(options?: {
  pisos?: string[] | null;
  snaps?: string[] | null;
}): Promise<MapotecaStatsData | null> {
  const supabase = await createClient();

  const {data, error} = await supabase
    .from("vw_ficha_especie_completa")
    .select(
      "nombre_cientifico, ubicaciones_geopoliticas, awe_regiones_biogeograficas, awe_distribucion_altitudinal, awe_ecosistemas, awe_areas_protegidas_estado, endemica",
    )
    .limit(2000);

  if (error || !data) {
    console.error("Error fetching estadisticas:", error);

    return null;
  }

  let rows = data as Row[];
  const {pisos, snaps} = options ?? {};

  if (pisos && pisos.length > 0) {
    rows = rows.filter((row) =>
      splitField(row.awe_distribucion_altitudinal).some((v) => pisos.includes(v)),
    );
  }
  if (snaps && snaps.length > 0) {
    rows = rows.filter((row) =>
      splitField(row.awe_areas_protegidas_estado).some((v) => snaps.includes(v)),
    );
  }

  const endemicRows = rows.filter((r) => r.endemica === true);
  const ECOSISTEMA_EXCLUDE = ["Intervencion", "Agua Dulce"];

  const histogramaProvincias = allEntries(rows, "ubicaciones_geopoliticas");
  const histogramaBiogeografico = allEntries(rows, "awe_regiones_biogeograficas");
  const histogramaEcosistema = allEntries(rows, "awe_ecosistemas").filter(
    (e) => !ECOSISTEMA_EXCLUDE.includes(e.name),
  );
  const histogramaPiso = allEntries(rows, "awe_distribucion_altitudinal");
  const histogramaSnap = allEntries(rows, "awe_areas_protegidas_estado").filter(
    (e) => e.name !== "No registrada",
  );

  const endemicosByRegion = allEntries(endemicRows, "awe_regiones_biogeograficas");
  const endemicosByPorcentaje = endemicosByRegion
    .map((e) => {
      const totalRegion = histogramaBiogeografico.find((r) => r.name === e.name)?.total ?? 0;
      const porcentaje = totalRegion > 0 ? Math.round((e.total / totalRegion) * 100) : 0;

      return {name: e.name, total: e.total, totalRegion, porcentaje};
    })
    .sort((a, b) => b.porcentaje - a.porcentaje);
  const topEndemica =
    endemicosByPorcentaje[0] ?? {name: "", total: 0, totalRegion: 0, porcentaje: 0};

  return {
    provincia: histogramaProvincias[0] ?? {name: "", total: 0},
    biogeografico: histogramaBiogeografico[0] ?? {name: "", total: 0},
    ecosistema: histogramaEcosistema[0] ?? {name: "", total: 0},
    piso: histogramaPiso[0] ?? {name: "", total: 0},
    snap: histogramaSnap[0] ?? {name: "", total: 0},
    biogeograficoEndemica: topEndemica,
    histogramaProvincias,
    histogramaBiogeografico,
    histogramaEcosistema,
    histogramaPiso,
    histogramaSnap,
    histogramaBiogeograficoEndemica: histogramaBiogeografico
      .map((r) => {
        const endemicas = endemicosByRegion.find((e) => e.name === r.name)?.total ?? 0;
        const porcentaje = r.total > 0 ? Math.round((endemicas / r.total) * 100) : 0;

        return {name: r.name, total: porcentaje, endemicas, totalSpp: r.total};
      })
      .filter((r) => r.endemicas > 0)
      .sort((a, b) => b.total - a.total),
  };
}
