import {createServiceClient} from "@/utils/supabase/server";

export interface PublicacionCompleta {
  id_publicacion: number;
  titulo: string;
  titulo_secundario: string | null;
  cita: string | null;
  cita_corta: string | null;
  cita_larga: string | null;
  numero_publicacion_ano: number | null;
  fecha: string;
  editorial: string | null;
  volumen: string | null;
  numero: string | null;
  pagina: string | null;
  palabras_clave: string | null;
  resumen: string | null;
  observaciones: string | null;
  publicacion_cj: boolean;
  publica_en_web: boolean;
  categoria: boolean;
  noticia: boolean;
  editor: boolean;
  enlaces: {
    id_publicacion_enlace: number;
    enlace: string;
    texto_enlace: string;
    exclusivo_cj: boolean;
  }[];
  autores: {
    id_autor: number;
    nombres: string | null;
    apellidos: string;
    orden_autor: number;
  }[];
  taxones: {
    id_taxon: number;
    taxon: string;
    nombre_cientifico_completo: string | null;
    id_ficha_especie: number | null;
    principal: boolean;
  }[];
}

/**
 * Obtiene una publicación por su ID
 */
export default async function getPublicacionById(
  id: number,
): Promise<PublicacionCompleta | null> {
  const supabaseClient = createServiceClient();

  const {data: pub, error} = await supabaseClient
    .from("publicacion")
    .select(
      `
      *,
      publicacion_enlace(
        id_publicacion_enlace,
        enlace,
        texto_enlace,
        exclusivo_cj
      ),
      publicacion_autor(
        autor:autor_id(
          id_autor,
          nombres,
          apellidos
        ),
        orden_autor
      ),
      taxon_publicacion(
        taxon:taxon_id(
          id_taxon,
          taxon,
          taxon_id
        ),
        principal
      )
    `,
    )
    .eq("id_publicacion", id)
    .single();

  if (error || !pub) {
    console.error("Error al obtener publicación:", error);
    return null;
  }

  // Transformar enlaces
  const enlaces =
    Array.isArray(pub.publicacion_enlace) && pub.publicacion_enlace.length > 0
      ? pub.publicacion_enlace.map((pe: any) => ({
          id_publicacion_enlace: pe.id_publicacion_enlace,
          enlace: pe.enlace,
          texto_enlace: pe.texto_enlace,
          exclusivo_cj: pe.exclusivo_cj,
        }))
      : [];

  // Transformar autores
  const autores =
    Array.isArray(pub.publicacion_autor) && pub.publicacion_autor.length > 0
      ? pub.publicacion_autor
          .map((pa: any) => ({
            id_autor: pa.autor?.id_autor || 0,
            nombres: pa.autor?.nombres || null,
            apellidos: pa.autor?.apellidos || "",
            orden_autor: pa.orden_autor || 0,
          }))
          .sort((a: any, b: any) => a.orden_autor - b.orden_autor)
      : [];

  // Transformar taxones
  const taxones =
    Array.isArray(pub.taxon_publicacion) && pub.taxon_publicacion.length > 0
      ? await Promise.all(
          pub.taxon_publicacion.map(async (tp: any) => {
            const taxonId = tp.taxon?.id_taxon || 0;

            if (taxonId === 0) return null;

            const {data: taxonData} = await supabaseClient
              .from("taxon")
              .select("id_taxon, taxon, taxon_id")
              .eq("id_taxon", taxonId)
              .single();

            if (!taxonData) return null;

            // Obtener ficha_especie
            const {data: fichaEspecieData} = await supabaseClient
              .from("ficha_especie")
              .select("id_ficha_especie")
              .eq("taxon_id", taxonId)
              .maybeSingle();

            let nombreCompleto = taxonData.taxon || "";

            // Obtener el género (taxon padre)
            if (taxonData.taxon_id) {
              const {data: generoData} = await supabaseClient
                .from("taxon")
                .select("taxon")
                .eq("id_taxon", taxonData.taxon_id)
                .single();

              if (generoData?.taxon) {
                nombreCompleto = `${generoData.taxon} ${nombreCompleto}`;
              }
            }

            return {
              id_taxon: taxonId,
              taxon: taxonData.taxon || "",
              nombre_cientifico_completo: nombreCompleto,
              id_ficha_especie: fichaEspecieData?.id_ficha_especie || null,
              principal: tp.principal || false,
            };
          }),
        )
      : [];

  const taxonesFiltrados = taxones.filter((t) => t !== null) as {
    id_taxon: number;
    taxon: string;
    nombre_cientifico_completo: string | null;
    id_ficha_especie: number | null;
    principal: boolean;
  }[];

  return {
    ...pub,
    enlaces,
    autores,
    taxones: taxonesFiltrados,
  } as PublicacionCompleta;
}

/**
 * Obtiene todos los IDs de publicaciones para generateStaticParams
 */
export async function getAllPublicacionIds(): Promise<{id: string}[]> {
  const supabaseClient = createServiceClient();

  const {data: publicaciones, error} = await supabaseClient
    .from("publicacion")
    .select("id_publicacion")
    .order("id_publicacion", {ascending: true});

  if (error || !publicaciones) {
    console.error("Error al obtener publicaciones:", error);
    return [];
  }

  return publicaciones.map((pub) => ({
    id: String(pub.id_publicacion),
  }));
}
