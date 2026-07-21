import {NextResponse} from "next/server";

import getPublicacionesPaginadas, {
  type FiltrosSapoteca,
} from "@/app/sapoteca/get-publicaciones-paginadas";

function parseNumberList(raw: string | null): number[] | undefined {
  if (!raw) return undefined;
  const arr = raw
    .split(",")
    .map((s) => Number.parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));

  return arr.length > 0 ? arr : undefined;
}

function parseBool(raw: string | null): boolean | undefined {
  if (raw === "true") return true;
  if (raw === "false") return false;

  return undefined;
}

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);

  const pagina = Math.max(1, Number.parseInt(searchParams.get("pagina") || "1", 10) || 1);
  const itemsPorPagina = Math.min(
    100,
    Math.max(1, Number.parseInt(searchParams.get("itemsPorPagina") || "20", 10) || 20),
  );

  const titulosRaw = searchParams.getAll("titulo").filter((t) => t.trim().length > 0);
  const autoresRaw = searchParams.getAll("autor").filter((a) => a.trim().length > 0);

  const filtros: FiltrosSapoteca = {
    titulos: titulosRaw.length > 0 ? titulosRaw : undefined,
    años: parseNumberList(searchParams.get("años")),
    autores: autoresRaw.length > 0 ? autoresRaw : undefined,
    tiposPublicacion: parseNumberList(searchParams.get("tipos")),
    indexada: parseBool(searchParams.get("indexada")),
    formatoImpreso: parseBool(searchParams.get("formatoImpreso")),
    publicacionId: searchParams.get("publicacion_id")
      ? Number.parseInt(searchParams.get("publicacion_id") || "", 10)
      : undefined,
  };

  try {
    const data = await getPublicacionesPaginadas(pagina, itemsPorPagina, filtros);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error en API sapoteca:", error);

    return NextResponse.json({error: "Error al obtener publicaciones"}, {status: 500});
  }
}
