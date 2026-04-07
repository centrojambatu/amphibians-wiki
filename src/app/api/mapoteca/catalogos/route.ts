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
    // Search catalogo_museo and numero_museo
    const { data, error } = await supabase
      .from("vw_colecciones")
      .select("catalogo_museo, numero_museo")
      .or(`catalogo_museo.ilike.%${q}%,numero_museo.ilike.%${q}%`)
      .not("catalogo_museo", "is", null)
      .limit(1000);

    if (error) throw error;

    // Build distinct "catalogo_museo numero_museo" strings
    const catalogosSet = new Set<string>();
    for (const row of data || []) {
      const parts = [row.catalogo_museo, row.numero_museo].filter(Boolean);
      if (parts.length > 0) {
        catalogosSet.add(parts.join(" "));
      }
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
