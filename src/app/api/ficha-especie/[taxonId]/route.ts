import {NextRequest, NextResponse} from "next/server";

import {createServiceClient} from "@/utils/supabase/server";

export async function PUT(request: NextRequest, {params}: {params: Promise<{taxonId: string}>}) {
  try {
    const {taxonId} = await params;
    const body = await request.json();

    const supabaseClient = createServiceClient();

    // Actualizar la ficha de especie
    const {data, error} = await supabaseClient
      .from("ficha_especie")
      .update({
        ...body,
        fecha_actualizacion: new Date().toISOString(),
      })
      .eq("taxon_id", Number(taxonId))
      .select()
      .single();

    if (error) {
      console.error("Error al actualizar ficha de especie:", error);

      return NextResponse.json({error: error.message}, {status: 500});
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error en la API:", error);

    return NextResponse.json({error: "Error interno del servidor"}, {status: 500});
  }
}

