import {createServiceClient} from "@/utils/supabase/server";
import {generatePublicacionSlug} from "@/lib/generate-publicacion-slug";

export interface PublicacionConRelaciones {
  id_publicacion: number;
  titulo: string;
  titulo_secundario: string | null;
  cita_corta: string | null;
  cita: string | null;
  cita_larga: string | null;
  numero_publicacion_ano: number | null;
  fecha: string;
  editorial: string | null;
  volumen: string | null;
  numero: string | null;
  pagina: string | null;
  publicacion_cj: boolean;
  publica_en_web: boolean;
  categoria: boolean;
  noticia: boolean;
  slug: string;
  num_taxones: number;
  num_autores: number;
  num_enlaces: number;
  enlaces: Array<{
    id_publicacion_enlace: number;
    enlace: string;
    texto_enlace: string;
    exclusivo_cj: boolean;
  }>;
  autores: Array<{
    id_autor: number;
    nombres: string | null;
    apellidos: string;
    orden_autor: number;
  }>;
}

/**
 * Obtiene todas las publicaciones con sus relaciones
 */
export default async function getAllPublicaciones(
  filtros?: {
    año?: number;
    autor?: string;
    categoria?: boolean;
    publicacion_cj?: boolean;
    search?: string;
  },
): Promise<PublicacionConRelaciones[]> {
  const supabaseClient = createServiceClient();

  // Construir query base
  let query = supabaseClient
    .from("publicacion")
    .select(
      `
      *,
      taxon_publicacion(count),
      publicacion_autor(
        autor:autor_id(
          id_autor,
          nombres,
          apellidos
        ),
        orden_autor
      ),
      publicacion_enlace(
        id_publicacion_enlace,
        enlace,
        texto_enlace,
        exclusivo_cj
      )
    `,
    )
    .order("numero_publicacion_ano", {ascending: false, nullsFirst: false})
    .order("fecha", {ascending: false});

  // Aplicar filtros
  if (filtros?.año) {
    query = query.eq("numero_publicacion_ano", filtros.año);
  }

  if (filtros?.categoria !== undefined) {
    query = query.eq("categoria", filtros.categoria);
  }

  if (filtros?.publicacion_cj !== undefined) {
    query = query.eq("publicacion_cj", filtros.publicacion_cj);
  }

  if (filtros?.search) {
    query = query.or(
      `titulo.ilike.%${filtros.search}%,cita_corta.ilike.%${filtros.search}%,cita.ilike.%${filtros.search}%`,
    );
  }

  const {data: publicaciones, error} = await query;

  if (error) {
    console.error("Error al obtener publicaciones:", error);
    return [];
  }

  if (!publicaciones) {
    return [];
  }

  // Transformar los datos
  const publicacionesTransformadas = publicaciones.map((pub: any) => {
    const año =
      pub.numero_publicacion_ano || new Date(pub.fecha).getFullYear();

    // Contar taxones
    const numTaxones =
      Array.isArray(pub.taxon_publicacion) && pub.taxon_publicacion.length > 0
        ? pub.taxon_publicacion.length
        : typeof pub.taxon_publicacion === "object" && pub.taxon_publicacion !== null
          ? pub.taxon_publicacion[0]?.count || 0
          : 0;

    // Obtener autores ordenados
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

    // Obtener enlaces
    const enlaces =
      Array.isArray(pub.publicacion_enlace) && pub.publicacion_enlace.length > 0
        ? pub.publicacion_enlace.map((pe: any) => ({
            id_publicacion_enlace: pe.id_publicacion_enlace,
            enlace: pe.enlace,
            texto_enlace: pe.texto_enlace,
            exclusivo_cj: pe.exclusivo_cj,
          }))
        : [];

    // Filtrar por autor si se especifica
    if (filtros?.autor) {
      const tieneAutor = autores.some(
        (a: any) =>
          a.apellidos.toLowerCase().includes(filtros.autor!.toLowerCase()) ||
          (a.nombres && a.nombres.toLowerCase().includes(filtros.autor!.toLowerCase())),
      );

      if (!tieneAutor) {
        return null;
      }
    }

    return {
      id_publicacion: pub.id_publicacion,
      titulo: pub.titulo,
      titulo_secundario: pub.titulo_secundario,
      cita_corta: pub.cita_corta,
      cita: pub.cita,
      cita_larga: pub.cita_larga,
      numero_publicacion_ano: pub.numero_publicacion_ano,
      fecha: pub.fecha,
      editorial: pub.editorial,
      volumen: pub.volumen,
      numero: pub.numero,
      pagina: pub.pagina,
      publicacion_cj: pub.publicacion_cj,
      publica_en_web: pub.publica_en_web,
      categoria: pub.categoria,
      noticia: pub.noticia,
      slug: generatePublicacionSlug(pub.cita_corta, año, pub.titulo, pub.id_publicacion),
      num_taxones: numTaxones,
      num_autores: autores.length,
      num_enlaces: enlaces.length,
      enlaces,
      autores,
    };
  });

  // Filtrar nulls (de filtros de autor)
  return publicacionesTransformadas.filter((p) => p !== null) as PublicacionConRelaciones[];
}

/**
 * Obtiene años únicos de las publicaciones para filtros
 */
export async function getAñosPublicaciones(): Promise<number[]> {
  const supabaseClient = createServiceClient();

  const {data, error} = await supabaseClient
    .from("publicacion")
    .select("numero_publicacion_ano, fecha")
    .not("numero_publicacion_ano", "is", null)
    .order("numero_publicacion_ano", {ascending: false});

  if (error || !data) {
    return [];
  }

  const años = new Set<number>();

  data.forEach((pub) => {
    if (pub.numero_publicacion_ano) {
      años.add(pub.numero_publicacion_ano);
    }
  });

  return Array.from(años).sort((a, b) => b - a);
}

