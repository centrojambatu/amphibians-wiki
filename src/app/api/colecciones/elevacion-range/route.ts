import {NextResponse} from "next/server";

import {createServiceClient} from "@/utils/supabase/server";

export async function GET() {
  const supabase = createServiceClient();

  try {
    const [{data: minRow}, {data: maxRow}] = await Promise.all([
      supabase
        .from("coleccion")
        .select("elevacion")
        .eq("publicar", true)
        .not("elevacion", "is", null)
        .order("elevacion", {ascending: true})
        .limit(1)
        .maybeSingle(),
      supabase
        .from("coleccion")
        .select("elevacion")
        .eq("publicar", true)
        .not("elevacion", "is", null)
        .order("elevacion", {ascending: false})
        .limit(1)
        .maybeSingle(),
    ]);

    const min = minRow?.elevacion ?? 0;
    const max = maxRow?.elevacion ?? 6000;

    return NextResponse.json(
      {min, max},
      {headers: {"Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200"}},
    );
  } catch (error) {
    console.error("Error en elevacion-range:", error);
    return NextResponse.json({min: 0, max: 6000});
  }
}
