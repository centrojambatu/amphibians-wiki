import {NextResponse} from "next/server";

import getMapotecaStats from "@/app/sapopedia/get-mapoteca-stats";

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const pisosParam = searchParams.get("pisos");
  const pisos = pisosParam
    ? pisosParam.split(",").map((p) => p.trim()).filter(Boolean)
    : null;
  const snapsParam = searchParams.get("snaps");
  const snaps = snapsParam
    ? snapsParam.split(",").map((s) => s.trim()).filter(Boolean)
    : null;

  const stats = await getMapotecaStats({pisos, snaps});

  if (!stats) {
    return NextResponse.json({error: "Error al obtener estadísticas"}, {status: 500});
  }

  return NextResponse.json(stats);
}
