import {NextResponse} from "next/server";

import {createClient} from "@/utils/supabase/server";

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";

  if (q.length < 2) return NextResponse.json([]);

  const supabase = await createClient();

  try {
    // Trae los catálogos relacionados con cantos publicados (vía coleccion o coleccion_externa).
    const {data: cantos, error} = await supabase
      .from("canto")
      .select(
        `coleccion:coleccion_id(catalogo_museo, numero_museo),
         coleccion_externa:coleccion_externa_id(catalogo_museo, numero_museo)`,
      )
      .eq("publicar", true)
      .limit(50000);

    if (error) throw error;

    const set = new Set<string>();
    const lower = q.toLowerCase();
    const parts = q.includes(" ") ? q.split(/\s+/) : [];

    (cantos || []).forEach((c: any) => {
      const sources = [c.coleccion, c.coleccion_externa].filter(Boolean);

      sources.forEach((src: any) => {
        if (!src?.catalogo_museo) return;
        const key = src.numero_museo
          ? `${String(src.catalogo_museo)}::${String(src.numero_museo)}`
          : (src.catalogo_museo as string);
        const haystack = `${String(src.catalogo_museo)} ${String(src.numero_museo ?? "")}`.toLowerCase();

        const matches =
          parts.length > 1
            ? parts.every((p) => haystack.includes(p.toLowerCase()))
            : haystack.includes(lower);

        if (matches) set.add(key);
      });
    });

    const result = Array.from(set)
      .sort((a, b) => a.localeCompare(b))
      .slice(0, 50);

    return NextResponse.json(result, {
      headers: {"Cache-Control": "public, s-maxage=300, stale-while-revalidate=600"},
    });
  } catch (error) {
    console.error("Error en catalogos audioteca:", error);

    return NextResponse.json({error: "Error interno"}, {status: 500});
  }
}
