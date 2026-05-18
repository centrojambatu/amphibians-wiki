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
    const {data, error} = await (supabase as any).rpc("get_fototeca_catalogos", {p_q: q});

    if (error) throw error;

    const resultado = (data || [])
      .map((row: any) =>
        row.numero_museo
          ? `${row.catalogo_museo as string}::${row.numero_museo as string}`
          : (row.catalogo_museo as string),
      )
      .sort((a: string, b: string) => a.localeCompare(b));

    return NextResponse.json(resultado, {
      headers: {"Cache-Control": "public, s-maxage=300, stale-while-revalidate=600"},
    });
  } catch (error) {
    console.error("Error en API de catalogos fototeca:", error);

    return NextResponse.json({error: "Error al obtener catalogos"}, {status: 500});
  }
}
