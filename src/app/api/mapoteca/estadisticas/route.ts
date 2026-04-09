import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

type Row = {
  nombre_cientifico: string;
  ubicaciones_geopoliticas: string | null;
  awe_regiones_biogeograficas: string | null;
  awe_distribucion_altitudinal: string | null;
  awe_ecosistemas: string | null;
  awe_areas_protegidas_estado: string | null;
};

function splitField(value: string | null): string[] {
  if (!value) return [];
  return value.split(",").map((s) => s.replace(/\*/g, "").trim()).filter(Boolean);
}

function topEntry(rows: Row[], field: keyof Row, exclude?: string[]): { name: string; total: number } {
  const counts: Record<string, Set<string>> = {};
  for (const row of rows) {
    for (const part of splitField(row[field] as string | null)) {
      if (exclude?.includes(part)) continue;
      if (!counts[part]) counts[part] = new Set();
      counts[part].add(row.nombre_cientifico);
    }
  }
  let best = { name: "", total: 0 };
  for (const [name, set] of Object.entries(counts)) {
    if (set.size > best.total) best = { name, total: set.size };
  }
  return best;
}

function allEntries(rows: Row[], field: keyof Row): { name: string; total: number }[] {
  const counts: Record<string, Set<string>> = {};
  for (const row of rows) {
    for (const part of splitField(row[field] as string | null)) {
      if (!counts[part]) counts[part] = new Set();
      counts[part].add(row.nombre_cientifico);
    }
  }
  return Object.entries(counts)
    .map(([name, set]) => ({ name, total: set.size }))
    .sort((a, b) => b.total - a.total);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pisosParam = searchParams.get("pisos");
  const pisos = pisosParam ? pisosParam.split(",").map((p) => p.trim()).filter(Boolean) : null;
  const snapsParam = searchParams.get("snaps");
  const snaps = snapsParam ? snapsParam.split(",").map((s) => s.trim()).filter(Boolean) : null;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("vw_ficha_especie_completa")
    .select(
      "nombre_cientifico, ubicaciones_geopoliticas, awe_regiones_biogeograficas, awe_distribucion_altitudinal, awe_ecosistemas, awe_areas_protegidas_estado"
    )
    .limit(2000);

  if (error || !data) {
    console.error("Error fetching estadisticas:", error);
    return NextResponse.json({ error: "Error al obtener estadísticas" }, { status: 500 });
  }

  let rows = data as Row[];

  // Filtrar por pisos y/o snaps activos (exact element match)
  if (pisos && pisos.length > 0) {
    rows = rows.filter((row) =>
      splitField(row.awe_distribucion_altitudinal).some((v) => pisos.includes(v))
    );
  }
  if (snaps && snaps.length > 0) {
    rows = rows.filter((row) =>
      splitField(row.awe_areas_protegidas_estado).some((v) => snaps.includes(v))
    );
  }

  return NextResponse.json({
    provincia: topEntry(rows, "ubicaciones_geopoliticas"),
    biogeografico: topEntry(rows, "awe_regiones_biogeograficas"),
    piso: topEntry(rows, "awe_distribucion_altitudinal"),
    ecosistema: topEntry(rows, "awe_ecosistemas", ["Intervencion", "Agua Dulce"]),
    snap: topEntry(rows, "awe_areas_protegidas_estado", ["No registrada"]),
    histogramaProvincias: allEntries(rows, "ubicaciones_geopoliticas"),
  });
}
