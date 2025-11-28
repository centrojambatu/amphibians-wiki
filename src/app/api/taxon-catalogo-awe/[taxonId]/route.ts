import {NextRequest, NextResponse} from "next/server";

import {createServiceClient} from "@/utils/supabase/server";

export async function PUT(request: NextRequest, {params}: {params: Promise<{taxonId: string}>}) {
  try {
    const {taxonId} = await params;
    const body = await request.json();

    const {tipo_catalogo_awe_id, catalogo_awe_ids} = body;

    if (!tipo_catalogo_awe_id || !Array.isArray(catalogo_awe_ids)) {
      return NextResponse.json(
        {error: "tipo_catalogo_awe_id y catalogo_awe_ids son requeridos"},
        {status: 400},
      );
    }

    const supabaseClient = createServiceClient();
    const taxonIdNum = Number(taxonId);

    if (Number.isNaN(taxonIdNum)) {
      return NextResponse.json({error: "taxon_id inválido"}, {status: 400});
    }

    // Obtener los IDs actuales de taxon_catalogo_awe para este taxon y tipo
    const {data: registrosActuales, error: errorActuales} = await supabaseClient
      .from("taxon_catalogo_awe")
      .select("id_taxon_catalogo_awe, catalogo_awe_id")
      .eq("taxon_id", taxonIdNum);

    if (errorActuales) {
      console.error("Error al obtener registros actuales:", errorActuales);
      return NextResponse.json({error: errorActuales.message}, {status: 500});
    }

    // Filtrar solo los que pertenecen al tipo de catálogo especificado
    // Necesitamos obtener los catalogo_awe_id que pertenecen a este tipo
    const {data: catalogosDelTipo, error: errorCatalogos} = await supabaseClient
      .from("catalogo_awe")
      .select("id_catalogo_awe")
      .eq("tipo_catalogo_awe_id", tipo_catalogo_awe_id);

    if (errorCatalogos) {
      console.error("Error al obtener catálogos del tipo:", errorCatalogos);
      return NextResponse.json({error: errorCatalogos.message}, {status: 500});
    }

    const idsCatalogosDelTipo = new Set(
      (catalogosDelTipo || []).map((c) => c.id_catalogo_awe),
    );

    // Obtener los registros actuales que pertenecen a este tipo
    const registrosDelTipo = (registrosActuales || []).filter((r) =>
      idsCatalogosDelTipo.has(r.catalogo_awe_id),
    );

    const idsActuales = new Set(registrosDelTipo.map((r) => r.catalogo_awe_id));
    const idsNuevos = new Set(catalogo_awe_ids);

    // Identificar qué eliminar y qué agregar
    const idsAEliminar = registrosDelTipo
      .filter((r) => !idsNuevos.has(r.catalogo_awe_id))
      .map((r) => r.id_taxon_catalogo_awe);

    const idsAAgregar = catalogo_awe_ids.filter((id: number) => !idsActuales.has(id));

    // Eliminar los que ya no están seleccionados
    if (idsAEliminar.length > 0) {
      const {error: errorEliminar} = await supabaseClient
        .from("taxon_catalogo_awe")
        .delete()
        .in("id_taxon_catalogo_awe", idsAEliminar);

      if (errorEliminar) {
        console.error("Error al eliminar registros:", errorEliminar);
        return NextResponse.json({error: errorEliminar.message}, {status: 500});
      }
    }

    // Agregar los nuevos
    if (idsAAgregar.length > 0) {
      const nuevosRegistros = idsAAgregar.map((catalogo_awe_id: number) => ({
        taxon_id: taxonIdNum,
        catalogo_awe_id,
      }));

      const {error: errorAgregar} = await supabaseClient
        .from("taxon_catalogo_awe")
        .insert(nuevosRegistros);

      if (errorAgregar) {
        console.error("Error al agregar registros:", errorAgregar);
        return NextResponse.json({error: errorAgregar.message}, {status: 500});
      }
    }

    return NextResponse.json({
      success: true,
      eliminados: idsAEliminar.length,
      agregados: idsAAgregar.length,
    });
  } catch (error) {
    console.error("Error en la API:", error);
    return NextResponse.json({error: "Error interno del servidor"}, {status: 500});
  }
}

