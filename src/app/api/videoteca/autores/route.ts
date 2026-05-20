import {NextResponse} from "next/server";

import {createClient} from "@/utils/supabase/server";

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";

  const supabase = await createClient();

  try {
    let query = supabase
      .from("video")
      .select("autor")
      .eq("publicar", true)
      .not("autor", "is", null)
      .limit(100000);

    if (q.length >= 2) {
      query = query.ilike("autor", `%${q}%`);
    }

    const {data, error} = await query;

    if (error) throw error;

    const autores = Array.from(
      new Set((data || []).map((r: any) => r.autor as string).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b));

    return NextResponse.json(autores, {
      headers: {"Cache-Control": "public, s-maxage=300, stale-while-revalidate=600"},
    });
  } catch (error) {
    console.error("Error en autores videoteca:", error);

    return NextResponse.json({error: "Error al obtener autores"}, {status: 500});
  }
}
