import {NextResponse} from "next/server";

import {createClient} from "@/utils/supabase/server";

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";

  if (q.length < 2) {
    return NextResponse.json([]);
  }

  const supabase = await createClient();

  try {
    let queryBuilder = (supabase as any)
      .from("mv_mapoteca_catalogos_busqueda")
      .select("catalogo_museo, numero_museo")
      .limit(50);

    if (q.includes(" ")) {
      const lastSpaceIdx = q.lastIndexOf(" ");
      const catPart = q.substring(0, lastSpaceIdx);
      const numPart = q.substring(lastSpaceIdx + 1);

      queryBuilder = queryBuilder
        .ilike("catalogo_museo", `%${catPart}%`)
        .ilike("numero_museo", `%${numPart}%`);
    } else {
      queryBuilder = queryBuilder.or(
        `catalogo_museo.ilike.%${q}%,numero_museo.ilike.%${q}%`,
      );
    }

    const {data, error} = await queryBuilder;

    if (error) throw error;

    const resultado = (data || [])
      .map((row: any) =>
        row.numero_museo
          ? `${row.catalogo_museo as string}::${row.numero_museo as string}`
          : (row.catalogo_museo as string),
      )
      .sort((a: string, b: string) => a.localeCompare(b));

    return NextResponse.json(resultado, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error en API de catalogos:", error);

    return NextResponse.json({error: "Error al obtener catalogos"}, {status: 500});
  }
}
