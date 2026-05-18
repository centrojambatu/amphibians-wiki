import {NextResponse} from "next/server";

import {createClient} from "@/utils/supabase/server";

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";

  const supabase = await createClient();

  try {
    const {data, error} = await (supabase as any).rpc("get_fototeca_autores", {p_q: q});

    if (error) throw error;

    const resultado = (data || []).map((r: any) => r.autor as string);

    return NextResponse.json(resultado, {
      headers: {"Cache-Control": "public, s-maxage=300, stale-while-revalidate=600"},
    });
  } catch (error) {
    console.error("Error en API de autores fototeca:", error);

    return NextResponse.json({error: "Error al obtener autores"}, {status: 500});
  }
}
