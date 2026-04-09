import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const supabase = await createClient();

  try {
    let data: any[] | null = null;
    let error: any = null;

    if (q.includes(" ")) {
      // Cuando el query tiene espacio, intentar matching AND:
      // la parte antes del último espacio busca en catalogo_museo,
      // la parte después en numero_museo.
      // Ej: "CJ 6134" → catalogo_museo ILIKE %CJ% AND numero_museo ILIKE %6134%
      const lastSpaceIdx = q.lastIndexOf(" ");
      const catPart = q.substring(0, lastSpaceIdx);
      const numPart = q.substring(lastSpaceIdx + 1);

      ({ data, error } = await supabase
        .from("vw_colecciones")
        .select("catalogo_museo, numero_museo")
        .ilike("catalogo_museo", `%${catPart}%`)
        .ilike("numero_museo", `%${numPart}%`)
        .not("catalogo_museo", "is", null)
        .limit(1000));
    } else {
      ({ data, error } = await supabase
        .from("vw_colecciones")
        .select("catalogo_museo, numero_museo")
        .or(`catalogo_museo.ilike.%${q}%,numero_museo.ilike.%${q}%`)
        .not("catalogo_museo", "is", null)
        .limit(1000));
    }

    if (error) throw error;

    // Usar "::" como separador para poder recuperar los valores exactos al filtrar
    // (no conflicta con "||" que separa múltiples items en la URL)
    const catalogosSet = new Set<string>();
    for (const row of data || []) {
      if (!row.catalogo_museo) continue;
      const key = row.numero_museo
        ? `${row.catalogo_museo}::${row.numero_museo}`
        : row.catalogo_museo;
      catalogosSet.add(key);
    }

    const resultado = Array.from(catalogosSet)
      .sort((a, b) => a.localeCompare(b))
      .slice(0, 50);

    return NextResponse.json(resultado);
  } catch (error) {
    console.error("Error en API de catalogos:", error);
    return NextResponse.json(
      { error: "Error al obtener catalogos" },
      { status: 500 }
    );
  }
}
