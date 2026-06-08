import {NextResponse} from "next/server";

import {createServiceClient} from "@/utils/supabase/server";

interface RegistroBase {
  id_coleccion: number;
  taxon_id: number | null;
  colectores: string | null;
  personal_id: number | null;
  provincia_id: number | null;
  localidad: string | null;
  fecha_col: string | null;
  esqueleto_transparentacion: boolean | null;
  microfotografia: boolean | null;
}

export async function GET() {
  const supabase = createServiceClient();

  try {
    const {count: totalRegistros} = await supabase
      .from("coleccion")
      .select("id_coleccion", {count: "exact", head: true})
      .eq("publicar", true);

    const PAGE_SIZE = 1000;
    const allRows: RegistroBase[] = [];
    let offset = 0;

    while (true) {
      const {data, error} = await supabase
        .from("coleccion")
        .select(
          "id_coleccion, taxon_id, colectores, personal_id, provincia_id, localidad, fecha_col, esqueleto_transparentacion, microfotografia",
        )
        .eq("publicar", true)
        .range(offset, offset + PAGE_SIZE - 1);

      if (error) throw error;
      if (!data || data.length === 0) break;
      allRows.push(...(data as RegistroBase[]));
      if (data.length < PAGE_SIZE) break;
      offset += PAGE_SIZE;
    }

    // Mapa coleccion_id → taxon_id para cruzar contra las tablas de muestras
    const taxonByColeccion = new Map<number, number>();

    allRows.forEach((r) => {
      if (r.id_coleccion != null && r.taxon_id != null) {
        taxonByColeccion.set(r.id_coleccion, r.taxon_id);
      }
    });

    // Set de taxon_ids por muestra (cruzando tablas reales)
    const fetchTaxonesPorMuestra = async (
      tabla: "tejido" | "sangre" | "esperma" | "heces" | "extracto_piel",
    ): Promise<Set<number>> => {
      const taxones = new Set<number>();
      const PAGE = 1000;
      let off = 0;

      while (true) {
        const {data, error} = await supabase
          .from(tabla)
          .select("coleccion_id")
          .range(off, off + PAGE - 1);

        if (error) {
          console.error(`Error leyendo ${tabla}:`, error);
          break;
        }
        if (!data || data.length === 0) break;
        (data as {coleccion_id: number}[]).forEach((r) => {
          const t = taxonByColeccion.get(r.coleccion_id);

          if (t != null) taxones.add(t);
        });
        if (data.length < PAGE) break;
        off += PAGE;
      }

      return taxones;
    };

    const [taxonConTejidoSet, taxonConPielSet, taxonConEspermaSet] = await Promise.all([
      fetchTaxonesPorMuestra("tejido"),
      fetchTaxonesPorMuestra("extracto_piel"),
      fetchTaxonesPorMuestra("esperma"),
    ]);

    const taxonSet = new Set<number>();
    const taxonConDiafanizadoSet = new Set<number>();
    const taxonConMicrofotografiaSet = new Set<number>();
    const colectorSet = new Set<string>();
    const personalIds = new Set<number>();
    const localidadSet = new Set<string>();
    const provinciaIds = new Set<number>();
    let yearMin: number | null = null;
    let yearMax: number | null = null;

    allRows.forEach((r) => {
      if (r.taxon_id != null) {
        taxonSet.add(r.taxon_id);
        if (r.esqueleto_transparentacion === true) {
          taxonConDiafanizadoSet.add(r.taxon_id);
        }
        if (r.microfotografia === true) {
          taxonConMicrofotografiaSet.add(r.taxon_id);
        }
      }
      if (r.colectores) colectorSet.add(r.colectores.trim());
      if (r.personal_id != null) personalIds.add(r.personal_id);
      if (r.localidad) localidadSet.add(r.localidad.trim());
      if (r.provincia_id != null) provinciaIds.add(r.provincia_id);
      if (r.fecha_col) {
        const y = Number(r.fecha_col.slice(0, 4));
        if (Number.isFinite(y)) {
          if (yearMin == null || y < yearMin) yearMin = y;
          if (yearMax == null || y > yearMax) yearMax = y;
        }
      }
    });

    // Filtrar taxon_ids a solo nivel de especie (rank_id = 7)
    const especiesSet = new Set<number>();
    const especiesValidasSet = new Set<number>();

    if (taxonSet.size > 0) {
      const taxonArr = Array.from(taxonSet);
      const CHUNK = 500;
      for (let i = 0; i < taxonArr.length; i += CHUNK) {
        const chunk = taxonArr.slice(i, i + CHUNK);
        const {data: taxa} = await supabase
          .from("taxon")
          .select("id_taxon")
          .eq("rank_id", 7)
          .in("id_taxon", chunk);
        (taxa || []).forEach((t: {id_taxon: number}) => {
          especiesSet.add(t.id_taxon);
          especiesValidasSet.add(t.id_taxon);
        });
      }
    }

    // Cruzar especies con taxa que tienen tejido (hígado o músculo)
    const especiesConTejidoSet = new Set<number>();

    taxonConTejidoSet.forEach((id) => {
      if (especiesValidasSet.has(id)) especiesConTejidoSet.add(id);
    });

    // Cruzar especies con taxa que tienen piel (exudado o liofilizado)
    const especiesConPielSet = new Set<number>();

    taxonConPielSet.forEach((id) => {
      if (especiesValidasSet.has(id)) especiesConPielSet.add(id);
    });

    // Cruzar especies con taxa que tienen ejemplar diafanizado
    const especiesConDiafanizadoSet = new Set<number>();

    taxonConDiafanizadoSet.forEach((id) => {
      if (especiesValidasSet.has(id)) especiesConDiafanizadoSet.add(id);
    });

    // Cruzar especies con taxa que tienen esperma
    const especiesConEspermaSet = new Set<number>();

    taxonConEspermaSet.forEach((id) => {
      if (especiesValidasSet.has(id)) especiesConEspermaSet.add(id);
    });

    // Cruzar especies con taxa que tienen microfotografía
    const especiesConMicrofotografiaSet = new Set<number>();

    taxonConMicrofotografiaSet.forEach((id) => {
      if (especiesValidasSet.has(id)) especiesConMicrofotografiaSet.add(id);
    });

    // Sumar nombres de personal a colectores únicos (paginado por si hay > 1000 personal_ids)
    if (personalIds.size > 0) {
      const personalArr = Array.from(personalIds);
      const CHUNK = 500;
      for (let i = 0; i < personalArr.length; i += CHUNK) {
        const chunk = personalArr.slice(i, i + CHUNK);
        const {data: pers} = await supabase
          .from("personal")
          .select("nombre")
          .in("id_personal", chunk);
        (pers || []).forEach((p: {nombre: string | null}) => {
          if (p.nombre) colectorSet.add(p.nombre.trim());
        });
      }
    }

    // Sumar nombres de provincia a localidades únicas
    if (provinciaIds.size > 0) {
      const {data: provs} = await supabase
        .from("geopolitica")
        .select("nombre")
        .in("id_geopolitica", Array.from(provinciaIds));
      (provs || []).forEach((p: {nombre: string | null}) => {
        if (p.nombre) localidadSet.add(p.nombre.trim());
      });
    }

    return NextResponse.json(
      {
        total_registros: totalRegistros ?? 0,
        total_especies: especiesSet.size,
        total_especies_con_tejido: especiesConTejidoSet.size,
        total_especies_con_piel: especiesConPielSet.size,
        total_especies_con_diafanizado: especiesConDiafanizadoSet.size,
        total_especies_con_esperma: especiesConEspermaSet.size,
        total_especies_con_microfotografia: especiesConMicrofotografiaSet.size,
        total_colectores: colectorSet.size,
        total_localidades: localidadSet.size,
        anio_min: yearMin,
        anio_max: yearMax,
      },
      {headers: {"Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200"}},
    );
  } catch (error) {
    console.error("Error en estadisticas colecciones:", error);
    return NextResponse.json({error: "Error al obtener estadísticas"}, {status: 500});
  }
}
