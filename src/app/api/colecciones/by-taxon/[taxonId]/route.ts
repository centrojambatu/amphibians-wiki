import {NextResponse} from "next/server";

import getColeccionesPaginadas from "@/app/sapopedia/species/[id]/colecciones/get-colecciones-paginadas";

export async function GET(
  request: Request,
  {params}: {params: Promise<{taxonId: string}>},
) {
  const {taxonId} = await params;
  const id = Number(taxonId);

  if (!Number.isFinite(id)) {
    return NextResponse.json({error: "taxonId inválido"}, {status: 400});
  }

  const {searchParams} = new URL(request.url);
  const pagina = Math.max(1, Number(searchParams.get("pagina")) || 1);

  try {
    const result = await getColeccionesPaginadas(id, pagina);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error en /api/colecciones/by-taxon:", error);

    return NextResponse.json({error: "Error interno"}, {status: 500});
  }
}
