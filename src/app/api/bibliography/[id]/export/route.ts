import { NextRequest, NextResponse } from "next/server";

import getPublicacionById from "@/app/bibliography/get-publicacion-by-id";
import { toBibtex, toRis } from "@/lib/export-bibliography";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const idNumber = Number.parseInt(id, 10);
    if (Number.isNaN(idNumber) || idNumber <= 0) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const format = (searchParams.get("format") ?? "bibtex").toLowerCase();

    if (format !== "bibtex" && format !== "ris") {
      return NextResponse.json(
        { error: "Formato no válido. Use format=bibtex o format=ris" },
        { status: 400 },
      );
    }

    const publicacion = await getPublicacionById(idNumber);
    if (!publicacion) {
      return NextResponse.json({ error: "Publicación no encontrada" }, { status: 404 });
    }

    const payload = {
      id_publicacion: publicacion.id_publicacion,
      titulo: publicacion.titulo,
      titulo_secundario: publicacion.titulo_secundario,
      numero_publicacion_ano: publicacion.numero_publicacion_ano,
      fecha: publicacion.fecha,
      editorial: publicacion.editorial,
      volumen: publicacion.volumen,
      numero: publicacion.numero,
      pagina: publicacion.pagina,
      palabras_clave: publicacion.palabras_clave,
      resumen: publicacion.resumen,
      autores: publicacion.autores,
      enlaces: publicacion.enlaces.map((e) => ({ enlace: e.enlace })),
    };

    const content = format === "ris" ? toRis(payload) : toBibtex(payload);
    const filename =
      format === "ris"
        ? `publicacion-${idNumber}.ris`
        : `publicacion-${idNumber}.bib`;
    const mime =
      format === "ris" ? "application/x-research-info-systems" : "application/x-bibtex";

    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": `${mime}; charset=utf-8`,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exportando publicación:", error);
    return NextResponse.json(
      { error: "Error al exportar" },
      { status: 500 },
    );
  }
}
