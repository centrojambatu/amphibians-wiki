import { createServiceClient } from "@/utils/supabase/server";

export interface Publicacion {
  id_publicacion: number;
  titulo: string;
  titulo_secundario: string | null;
  editor: boolean;
  numero_publicacion_ano: number | null;
  editorial: string | null;
  volumen: string | null;
  numero: string | null;
  pagina: string | null;
  palabras_clave: string | null;
  resumen: string | null;
  observaciones: string | null;
  fecha: string;
  publicacion_cj: boolean;
  publica_en_web: boolean;
  cita: string | null;
  cita_corta: string | null;
  cita_larga: string | null;
  categoria: boolean;
  noticia: boolean;
  principal: boolean; // Desde taxon_publicacion
  svl_macho: boolean; // Desde taxon_publicacion
  svl_hembra: boolean; // Desde taxon_publicacion
}

// Función para obtener todas las publicaciones relacionadas con un taxon
export default async function getPublicacionesTaxon(
  taxonId: number,
): Promise<Publicacion[]> {
  const supabaseClient = createServiceClient();

  // Usar el mismo enfoque que en get-ficha-especie.ts
  const { data, error } = await supabaseClient
    .from("taxon_publicacion")
    .select("*, publicacion(*)")
    .eq("taxon_id", taxonId);

  if (error) {
    console.error("Error al obtener publicaciones:", error);
    console.error("Detalles del error:", JSON.stringify(error, null, 2));

    return [];
  }

  if (!data || data.length === 0) {
    console.log(`No se encontraron publicaciones para taxon_id: ${taxonId}`);

    return [];
  }

  // Transformar los datos para incluir los campos de taxon_publicacion
  const publicaciones = data
    .map((item: any) => {
      if (!item.publicacion) {
        console.warn("Publicación nula encontrada:", item);

        return null;
      }

      return {
        ...item.publicacion,
        principal: item.principal,
        svl_macho: item.svl_macho,
        svl_hembra: item.svl_hembra,
      };
    })
    .filter((pub: Publicacion | null) => pub !== null) as Publicacion[];

  // Ordenar por fecha (de la publicacion) de forma descendente
  return publicaciones.sort((a, b) => {
    const fechaA = a.numero_publicacion_ano || new Date(a.fecha).getFullYear();
    const fechaB = b.numero_publicacion_ano || new Date(b.fecha).getFullYear();

    return fechaB - fechaA;
  });
}
