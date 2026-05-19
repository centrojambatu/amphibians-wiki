import {NextResponse} from "next/server";

import {createClient} from "@/utils/supabase/server";

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";

  const supabase = await createClient();

  try {
    let query = supabase
      .from("canto")
      .select("colector")
      .eq("publicar", true)
      .not("colector", "is", null)
      .limit(100000);

    if (q.length >= 2) {
      query = query.ilike("colector", `%${q}%`);
    }

    const {data, error} = await query;

    if (error) throw error;

    const colectores = Array.from(
      new Set((data || []).map((r: any) => r.colector as string).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b));

    return NextResponse.json(colectores, {
      headers: {"Cache-Control": "public, s-maxage=300, stale-while-revalidate=600"},
    });
  } catch (error) {
    console.error("Error en autores audioteca:", error);

    return NextResponse.json({error: "Error al obtener colectores"}, {status: 500});
  }
}
