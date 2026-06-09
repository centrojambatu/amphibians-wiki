import {NextResponse} from "next/server";

import {createServiceClient} from "@/utils/supabase/server";

export async function GET() {
  const supabase = createServiceClient();

  try {
    const {data, error} = await (supabase as any)
      .from("vw_moleculoteca_taxon")
      .select(
        "count_tejido_higado, count_tejido_musculo, count_piel_exudado, count_piel_liofilizado, count_sangre, count_esperma, count_heces, count_otros, count_esqueleto_transparentacion",
      );

    if (error) throw error;

    const rows = (data || []) as any[];
    const countSpeciesWith = (key: string) =>
      rows.filter((r) => (r[key] || 0) > 0).length;

    return NextResponse.json(
      {
        total_especies: rows.length,
        especies_por_muestra: {
          tejido_higado: countSpeciesWith("count_tejido_higado"),
          tejido_musculo: countSpeciesWith("count_tejido_musculo"),
          piel_exudado: countSpeciesWith("count_piel_exudado"),
          piel_liofilizado: countSpeciesWith("count_piel_liofilizado"),
          sangre: countSpeciesWith("count_sangre"),
          esperma: countSpeciesWith("count_esperma"),
          heces: countSpeciesWith("count_heces"),
          otros: countSpeciesWith("count_otros"),
          esqueleto_transparentacion: countSpeciesWith("count_esqueleto_transparentacion"),
        },
      },
      {headers: {"Cache-Control": "public, s-maxage=300, stale-while-revalidate=600"}},
    );
  } catch (error) {
    console.error("Error en moleculoteca estadísticas:", error);

    return NextResponse.json({error: "Error al obtener estadísticas"}, {status: 500});
  }
}
