import {NextRequest, NextResponse} from "next/server";
import getNombresVernaculos from "@/app/sapopedia/nombres/get-nombres-vernaculos";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const idiomaParam = searchParams.get("idioma");

    const idiomaId = idiomaParam ? parseInt(idiomaParam, 10) : undefined;

    if (idiomaParam && isNaN(idiomaId!)) {
      return NextResponse.json({error: "Invalid idioma parameter"}, {status: 400});
    }

    const nombres = await getNombresVernaculos(idiomaId);

    return NextResponse.json(nombres);
  } catch (error) {
    console.error("Error en API nombres-vernaculos:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
