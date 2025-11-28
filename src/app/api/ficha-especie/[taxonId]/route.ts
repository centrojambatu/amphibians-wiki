import {NextRequest, NextResponse} from "next/server";

import {createServiceClient} from "@/utils/supabase/server";

export async function PUT(request: NextRequest, {params}: {params: Promise<{taxonId: string}>}) {
  try {
    const {taxonId} = await params;
    const body = await request.json();

    const supabaseClient = createServiceClient();

    // Campos editables que se pueden actualizar (excluir id_ficha_especie, taxon_id, y otros campos del sistema)
    const camposEditables = [
      "colector",
      "etimologia",
      "taxonomia",
      "habitat_biologia",
      "dieta",
      "reproduccion",
      "informacion_adicional",
      "comentario_estatus_poblacional",
      "distribucion",
      "distribucion_global",
      "observacion_zona_altitudinal",
      "rango_altitudinal",
      "referencia_area_protegida",
      "sinonimia",
      "identificacion",
      "descripcion",
      "color_en_vida",
      "color_en_preservacion",
      "diagnosis",
      "morfometria",
      "larva",
      "svl_macho",
      "svl_hembra",
      "canto",
      "usos",
      "agradecimiento",
      // Campos numéricos
      "rango_altitudinal_min",
      "rango_altitudinal_max",
      "area_distribucion",
      "pluviocidad_min",
      "pluviocidad_max",
      "temperatura_min",
      "temperatura_max",
    ];

    // Filtrar solo los campos editables del body
    const datosActualizar: Record<string, any> = {};

    camposEditables.forEach((campo) => {
      if (campo in body) {
        datosActualizar[campo] = body[campo];
      }
    });

    // Agregar fecha de actualización
    datosActualizar.fecha_actualizacion = new Date().toISOString().split("T")[0]; // Formato YYYY-MM-DD para date

    const taxonIdNum = Number(taxonId);

    if (Number.isNaN(taxonIdNum)) {
      console.error("❌ taxon_id inválido:", taxonId);

      return NextResponse.json({error: "taxon_id inválido"}, {status: 400});
    }

    console.log("🔍 Validación antes de actualizar:", {
      taxon_id: taxonIdNum,
      campos_a_actualizar: Object.keys(datosActualizar),
    });

    // Verificar que existe un registro con ese taxon_id antes de actualizar
    const {data: registroExistente, error: errorVerificacion} = await supabaseClient
      .from("ficha_especie")
      .select("id_ficha_especie, taxon_id")
      .eq("taxon_id", taxonIdNum)
      .single();

    if (errorVerificacion || !registroExistente) {
      console.error("❌ No se encontró ficha_especie con taxon_id:", taxonIdNum);

      return NextResponse.json(
        {error: `No se encontró ficha de especie con taxon_id: ${String(taxonIdNum)}`},
        {status: 404},
      );
    }

    console.log("✅ Registro encontrado:", {
      id_ficha_especie: registroExistente.id_ficha_especie,
      taxon_id: registroExistente.taxon_id,
    });

    // Actualizar la ficha de especie usando taxon_id (hay un índice único en taxon_id)
    const {data, error} = await supabaseClient
      .from("ficha_especie")
      .update(datosActualizar)
      .eq("taxon_id", taxonIdNum)
      .select()
      .single();

    if (error) {
      console.error("❌ Error al actualizar ficha de especie:", error);
      console.error("Detalles del error:", JSON.stringify(error, null, 2));

      return NextResponse.json({error: error.message}, {status: 500});
    }

    // Validar que el registro actualizado corresponde al taxon_id correcto
    if (data && data.taxon_id !== taxonIdNum) {
      console.error(
        "⚠️ ADVERTENCIA: El taxon_id del registro actualizado no coincide:",
        "Esperado:",
        taxonIdNum,
        "Obtenido:",
        data.taxon_id,
      );
    } else {
      console.log("✅ Ficha actualizada exitosamente:", {
        id_ficha_especie: data?.id_ficha_especie,
        taxon_id: data?.taxon_id,
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error en la API:", error);

    return NextResponse.json({error: "Error interno del servidor"}, {status: 500});
  }
}
