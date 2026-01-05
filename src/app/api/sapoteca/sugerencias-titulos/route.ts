import { NextRequest, NextResponse } from "next/server";
import { getSugerenciasTitulos } from "@/app/sapoteca/get-sugerencias";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q") || "";

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const sugerencias = await getSugerenciasTitulos(query, 10);
    return NextResponse.json(sugerencias);
  } catch (error) {
    console.error("Error al obtener sugerencias de títulos:", error);
    return NextResponse.json([], { status: 500 });
  }
}
