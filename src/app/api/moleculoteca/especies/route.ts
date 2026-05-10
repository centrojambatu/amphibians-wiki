import {NextResponse} from "next/server";

import {getMoleculotecaTaxa} from "@/app/moleculoteca/get-moleculoteca-taxa";

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const search = searchParams.get("search") || "";

  try {
    const taxa = await getMoleculotecaTaxa(search);
    const result = taxa.map((t) => ({
      id: t.taxon_id,
      nombre_cientifico: t.nombre_cientifico,
      nombre_comun: t.nombre_comun,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error al obtener especies moleculoteca:", error);

    return NextResponse.json({error: "Error interno"}, {status: 500});
  }
}
