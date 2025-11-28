import {createServiceClient} from "@/utils/supabase/server";

export interface NombrePorRegion {
  region: string;
  nombres: string[];
  id_geopolitica?: number;
}

// Función para obtener nombres comunes agrupados por región geográfica
export default async function getNombresPorRegion(): Promise<NombrePorRegion[]> {
  const supabaseClient = createServiceClient();

  // Obtener todos los taxones con nombres comunes y su distribución geopolítica
  const {data: taxones, error} = await supabaseClient
    .from("vw_nombres_comunes")
    .select("id_taxon, nombre_comun_especie, nombre_cientifico")
    .not("nombre_comun_especie", "is", null);

  if (error) {
    console.error("Error al obtener nombres comunes:", error);

    return [];
  }

  if (!taxones || taxones.length === 0) {
    return [];
  }

  // Obtener la distribución geopolítica para cada taxón
  const taxonIds = taxones.map((t: any) => t.id_taxon);
  const RANK_PROVINCIAS = 3;

  const {data: geopoliticaData, error: errorGeopolitica} = await supabaseClient
    .from("taxon_geopolitica")
    .select("taxon_id, geopolitica(id_geopolitica, nombre, rank_geopolitica_id)")
    .in("taxon_id", taxonIds)
    .eq("geopolitica.rank_geopolitica_id", RANK_PROVINCIAS);

  if (errorGeopolitica) {
    console.error("Error al obtener geopolítica:", errorGeopolitica);
  }

  // Agrupar nombres comunes por región
  const regionesMap = new Map<string, Set<string>>();

  taxones.forEach((taxon: any) => {
    const nombreComun = taxon.nombre_comun_especie;

    if (!nombreComun) return;

    // Obtener las provincias para este taxón
    const provincias = geopoliticaData?.filter(
      (g: any) => g.taxon_id === taxon.id_taxon && g.geopolitica?.rank_geopolitica_id === RANK_PROVINCIAS,
    ) || [];

    if (provincias.length === 0) {
      // Si no tiene provincia específica, agregar a "Sin región específica"
      if (!regionesMap.has("Sin región específica")) {
        regionesMap.set("Sin región específica", new Set());
      }
      regionesMap.get("Sin región específica")!.add(nombreComun);
    } else {
      // Agregar el nombre común a cada provincia donde se encuentra
      provincias.forEach((provincia: any) => {
        const nombreRegion = provincia.geopolitica?.nombre || "Sin región específica";

        if (!regionesMap.has(nombreRegion)) {
          regionesMap.set(nombreRegion, new Set());
        }
        regionesMap.get(nombreRegion)!.add(nombreComun);
      });
    }
  });

  // Convertir a array y ordenar
  const regiones: NombrePorRegion[] = Array.from(regionesMap.entries())
    .map(([region, nombresSet]) => ({
      region,
      nombres: Array.from(nombresSet).sort(),
    }))
    .sort((a, b) => a.region.localeCompare(b.region));

  return regiones;
}

