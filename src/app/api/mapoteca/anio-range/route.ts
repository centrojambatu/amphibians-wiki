import {NextResponse} from "next/server";

import {createServiceClient} from "@/utils/supabase/server";

const DEFAULT_MIN = 1849;

export async function GET() {
  const supabase = createServiceClient();

  try {
    const [colMin, colMax, extMin, extMax] = await Promise.all([
      supabase
        .from("coleccion")
        .select("fecha_col")
        .eq("publicar", true)
        .not("fecha_col", "is", null)
        .order("fecha_col", {ascending: true})
        .limit(1)
        .maybeSingle(),
      supabase
        .from("coleccion")
        .select("fecha_col")
        .eq("publicar", true)
        .not("fecha_col", "is", null)
        .order("fecha_col", {ascending: false})
        .limit(1)
        .maybeSingle(),
      supabase
        .from("coleccion_externa")
        .select("fecha")
        .eq("publicar", true)
        .not("fecha", "is", null)
        .order("fecha", {ascending: true})
        .limit(1)
        .maybeSingle(),
      supabase
        .from("coleccion_externa")
        .select("fecha")
        .eq("publicar", true)
        .not("fecha", "is", null)
        .order("fecha", {ascending: false})
        .limit(1)
        .maybeSingle(),
    ]);

    const candidates: number[] = [];
    const pushYear = (s: string | null | undefined) => {
      if (!s) return;
      const y = Number.parseInt(s.slice(0, 4), 10);
      if (Number.isFinite(y)) candidates.push(y);
    };

    pushYear((colMin.data as {fecha_col: string} | null)?.fecha_col);
    pushYear((colMax.data as {fecha_col: string} | null)?.fecha_col);
    pushYear((extMin.data as {fecha: string} | null)?.fecha);
    pushYear((extMax.data as {fecha: string} | null)?.fecha);

    const currentYear = new Date().getFullYear();
    const dataMin = candidates.length > 0 ? Math.min(...candidates) : DEFAULT_MIN;
    const anioMin = Math.min(dataMin, DEFAULT_MIN);
    const anioMax = candidates.length > 0 ? Math.max(...candidates) : currentYear;

    return NextResponse.json(
      {anio_min: anioMin, anio_max: anioMax},
      {headers: {"Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200"}},
    );
  } catch (error) {
    console.error("Error en /api/mapoteca/anio-range:", error);

    return NextResponse.json(
      {anio_min: DEFAULT_MIN, anio_max: new Date().getFullYear()},
      {status: 200},
    );
  }
}
