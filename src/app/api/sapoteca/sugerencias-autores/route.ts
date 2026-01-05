import { NextRequest, NextResponse } from "next/server";
import { getSugerenciasAutores } from "@/app/sapoteca/get-sugerencias";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q") || "";

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const sugerencias = await getSugerenciasAutores(query, 10);
    return NextResponse.json(sugerencias);
  } catch (error) {
    console.error("Error al obtener sugerencias de autores:", error);
    return NextResponse.json([], { status: 500 });
  }
}
