import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

export interface EspecieMapoteca {
  id_taxon: number;
  nombre_cientifico: string;
  endemica: boolean | null;
  lista_roja_iucn: string | null;
  familia: string | null;
  genero: string | null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const provincia = searchParams.get("provincia");
  const especie = searchParams.get("especie");

  const supabase = await createClient();

  try {
    // Obtener ubicaciones filtradas (similar a la API principal)
    async function fetchAllUbicaciones() {
      const pageSize = 1000;
      let allData: any[] = [];
      let page = 0;
      let hasMore = true;

      while (hasMore) {
        let query = supabase
          .from("ubicacion_especie")
          .select("id_taxon")
          .not("latitud", "is", null)
          .not("longitud", "is", null)
          .range(page * pageSize, (page + 1) * pageSize - 1);

        // Filtrar por provincia si se especifica (usando el campo provincia de ubicacion_especie)
        if (provincia) {
          query = query.ilike("provincia", `%${provincia}%`);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          allData = [...allData, ...data];
          hasMore = data.length === pageSize;
          page++;
        } else {
          hasMore = false;
        }
      }

      return allData;
    }

    const ubicaciones = await fetchAllUbicaciones();

    if (!ubicaciones || ubicaciones.length === 0) {
      return NextResponse.json([]);
    }

    // Obtener taxon_ids únicos
    const taxonIds = [...new Set(ubicaciones.map((u) => u.id_taxon).filter(Boolean))];

    if (taxonIds.length === 0) {
      return NextResponse.json([]);
    }

    // Obtener información de especies desde la vista vw_ficha_especie_completa
    // Usar especie_taxon_id para obtener solo una fila por especie
    // Incluir awe_lista_roja_uicn para obtener la lista roja directamente desde la vista
    const { data: especiesData, error: especiesError } = await supabase
      .from("vw_ficha_especie_completa" as any)
      .select("especie_taxon_id, nombre_cientifico, endemica, familia, genero, awe_lista_roja_uicn")
      .in("especie_taxon_id", taxonIds)
      .not("especie_taxon_id", "is", null);

    if (especiesError) {
      console.error("Error fetching especies:", especiesError);
      return NextResponse.json(
        { error: "Error fetching especies" },
        { status: 500 }
      );
    }

    if (!especiesData || especiesData.length === 0) {
      return NextResponse.json([]);
    }

    // Eliminar duplicados basándose en especie_taxon_id (mantener solo el primero)
    const especiesUnicasMap = new Map<number, any>();
    especiesData.forEach((e: any) => {
      const taxonId = e.especie_taxon_id;
      if (taxonId && !especiesUnicasMap.has(taxonId)) {
        especiesUnicasMap.set(taxonId, e);
      }
    });

    const especiesUnicasArray = Array.from(especiesUnicasMap.values());

    // Filtrar por especie si se especifica
    let especiesFiltradas = especiesUnicasArray;
    if (especie) {
      especiesFiltradas = especiesUnicasArray.filter((e: any) =>
        e.nombre_cientifico?.toLowerCase().includes(especie.toLowerCase())
      );
    }

    // Obtener el mapeo de nombre -> sigla para categorías UICN (igual que en get-all-especies.ts)
    const { data: categoriasUICN, error: errorCategoriasUICN } = await supabase
      .from("catalogo_awe")
      .select("nombre, sigla")
      .eq("tipo_catalogo_awe_id", 10);

    if (errorCategoriasUICN) {
      console.error("Error al obtener categorías UICN:", errorCategoriasUICN);
    }

    // Crear mapa de nombre -> sigla para UICN
    const nombreASiglaMap = new Map<string, string>();
    if (categoriasUICN) {
      for (const cat of categoriasUICN) {
        if (cat.nombre && cat.sigla) {
          nombreASiglaMap.set(cat.nombre, cat.sigla);
        }
      }
    }

    // Crear mapa de lista roja por taxon_id usando awe_lista_roja_uicn de la vista
    // (igual que en get-all-especies.ts)
    const listaRojaMap = new Map<number, string>();
    for (const especie of especiesFiltradas) {
      const taxonId = especie.especie_taxon_id as number;
      const nombreUICN = especie.awe_lista_roja_uicn as string | null;

      if (taxonId && nombreUICN) {
        const sigla = nombreASiglaMap.get(nombreUICN);
        if (sigla) {
          listaRojaMap.set(taxonId, sigla);
        }
      }
    }

    // Formatear resultados - una sola especie por taxon_id
    const resultado: EspecieMapoteca[] = especiesFiltradas.map((e: any) => ({
      id_taxon: e.especie_taxon_id,
      nombre_cientifico: e.nombre_cientifico || "",
      endemica: e.endemica ?? null,
      lista_roja_iucn: listaRojaMap.get(e.especie_taxon_id) || null,
      familia: e.familia || null,
      genero: e.genero || null,
    }));

    // Ordenar por nombre científico
    resultado.sort((a, b) =>
      a.nombre_cientifico.localeCompare(b.nombre_cientifico)
    );

    return NextResponse.json(resultado);
  } catch (error) {
    console.error("Error en API de especies:", error);
    return NextResponse.json(
      { error: "Error al obtener especies" },
      { status: 500 }
    );
  }
}
