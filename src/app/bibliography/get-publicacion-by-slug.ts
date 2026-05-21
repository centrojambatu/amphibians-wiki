import {createServiceClient} from "@/utils/supabase/server";
import {generatePublicacionSlug} from "@/lib/generate-publicacion-slug";

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
 * Obtiene una publicación por su slug
 */
export default async function getPublicacionBySlug(
  slug: string,
): Promise<PublicacionCompleta | null> {
  const supabaseClient = createServiceClient();

  // Primero intentar buscar directamente en la vista por slug (exacto y flexible)
  let pubSlugData: {id_publicacion: number} | null = null;

  // Búsqueda exacta
  const {data: exactMatch, error: exactError} = await supabaseClient
    .from("vw_publicacion_slug")
    .select("id_publicacion")
    .eq("slug", slug)
    .single();

  if (!exactError && exactMatch && exactMatch.id_publicacion !== null) {
    pubSlugData = {id_publicacion: exactMatch.id_publicacion};
    if (process.env.NODE_ENV === "development") {
      console.log(
        `✅ Encontrada publicación en vista por slug exacto: ${pubSlugData.id_publicacion}`,
      );
    }
  } else {
    // Búsqueda flexible (ILIKE)
    const {data: flexibleMatch, error: flexibleError} = await supabaseClient
      .from("vw_publicacion_slug")
      .select("id_publicacion, slug")
      .ilike("slug", `%${slug}%`)
      .limit(5);

    if (!flexibleError && flexibleMatch && flexibleMatch.length > 0) {
      // Buscar la mejor coincidencia
      const normalizedSlug = slug
        .toLowerCase()
        .normalize("NFD")
        .replaceAll(/[\u0300-\u036f]/g, "");
      let bestMatch = flexibleMatch[0];
      let bestScore = 0;

      for (const match of flexibleMatch) {
        const matchSlug = match
          .slug!.toLowerCase()
          .normalize("NFD")
          .replaceAll(/[\u0300-\u036f]/g, "");
        // Calcular similitud simple
        const minLen = Math.min(normalizedSlug.length, matchSlug.length);
        const maxLen = Math.max(normalizedSlug.length, matchSlug.length);
        let commonChars = 0;

        for (let i = 0; i < minLen; i++) {
          if (normalizedSlug[i] === matchSlug[i]) commonChars++;
        }
        const score = commonChars / maxLen;

        if (score > bestScore) {
          bestScore = score;
          bestMatch = match;
        }
      }

      if (bestScore > 0.7 && bestMatch.id_publicacion !== null) {
        pubSlugData = {id_publicacion: bestMatch.id_publicacion};
        if (process.env.NODE_ENV === "development") {
          console.log(
            `✅ Encontrada publicación en vista por slug flexible: ${pubSlugData.id_publicacion} (similitud: ${bestScore.toFixed(2)})`,
          );
        }
      }
    }
  }

  if (pubSlugData) {
    if (process.env.NODE_ENV === "development") {
      console.log(`✅ Encontrada publicación en vista por slug: ${pubSlugData.id_publicacion}`);
    }

    // Buscar la publicación completa por ID
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
      .eq("id_publicacion", pubSlugData.id_publicacion)
      .single();

    if (!error && pub) {
      // Transformar los datos (mismo código que abajo)
      const enlaces =
        Array.isArray(pub.publicacion_enlace) && pub.publicacion_enlace.length > 0
          ? pub.publicacion_enlace.map((pe: any) => ({
              id_publicacion_enlace: pe.id_publicacion_enlace,
              enlace: pe.enlace,
              texto_enlace: pe.texto_enlace,
              exclusivo_cj: pe.exclusivo_cj,
            }))
          : [];

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

                // Obtener ficha_especie por separado usando la relación correcta
                const {data: fichaEspecieData} = await supabaseClient
                  .from("ficha_especie")
                  .select("id_ficha_especie")
                  .eq("taxon_id", taxonId)
                  .maybeSingle();

                let nombreCompleto = taxonData.taxon || "";

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

                const idFichaEspecie = fichaEspecieData?.id_ficha_especie || null;

                return {
                  id_taxon: taxonId,
                  taxon: taxonData.taxon || "",
                  nombre_cientifico_completo: nombreCompleto,
                  id_ficha_especie: idFichaEspecie,
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
      } as unknown as PublicacionCompleta;
    }
  }

  // Si no se encontró en la vista, continuar con la búsqueda anterior (fallback)
  if (process.env.NODE_ENV === "development") {
    console.log(`⚠️ No se encontró en vista, usando búsqueda fallback`);
  }

  // Si el slug es "publicacion-{id}", buscar directamente por ID
  if (slug.startsWith("publicacion-")) {
    const id = Number.parseInt(slug.replace("publicacion-", ""), 10);

    if (!Number.isNaN(id) && id > 0) {
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

      if (!error && pub) {
        // Transformar los datos (mismo código que abajo)
        const enlaces =
          Array.isArray(pub.publicacion_enlace) && pub.publicacion_enlace.length > 0
            ? pub.publicacion_enlace.map((pe: any) => ({
                id_publicacion_enlace: pe.id_publicacion_enlace,
                enlace: pe.enlace,
                texto_enlace: pe.texto_enlace,
                exclusivo_cj: pe.exclusivo_cj,
              }))
            : [];

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

                  // Obtener ficha_especie por separado usando la relación correcta
                  const {data: fichaEspecieData} = await supabaseClient
                    .from("ficha_especie")
                    .select("id_ficha_especie")
                    .eq("taxon_id", taxonId)
                    .maybeSingle();

                  let nombreCompleto = taxonData.taxon || "";

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

                  const idFichaEspecie = fichaEspecieData?.id_ficha_especie || null;

                  return {
                    id_taxon: taxonId,
                    taxon: taxonData.taxon || "",
                    nombre_cientifico_completo: nombreCompleto,
                    id_ficha_especie: idFichaEspecie,
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
        } as unknown as PublicacionCompleta;
      }
    }
  }

  // Buscar todas las publicaciones con relaciones y comparar slugs
  const {data: publicaciones, error} = await supabaseClient
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
    .order("id_publicacion", {ascending: true});

  if (process.env.NODE_ENV === "development") {
    // Verificar si la publicación 1333 está en la lista
    const pub1333 = publicaciones?.find((p: any) => p.id_publicacion === 1333);

    if (pub1333) {
      const año = pub1333.numero_publicacion_ano || new Date(pub1333.fecha).getFullYear();
      const slug1333 = generatePublicacionSlug(
        pub1333.cita_corta,
        año,
        pub1333.titulo,
        pub1333.id_publicacion,
      );

      console.log(`🔍 Publicación 1333 encontrada en lista:`);
      console.log(`   Cita corta: ${pub1333.cita_corta}`);
      console.log(`   Año: ${año}`);
      console.log(`   Título: ${pub1333.titulo?.substring(0, 60)}...`);
      console.log(`   Slug generado: ${slug1333}`);
      console.log(`   Slug buscado: ${slug}`);
      console.log(`   ¿Coinciden exactamente? ${slug1333 === slug}`);
    } else {
      console.warn(
        `⚠️ Publicación 1333 NO encontrada en la lista de ${publicaciones?.length || 0} publicaciones`,
      );
    }
  }

  if (error) {
    console.error("Error al obtener publicaciones:", error);

    return null;
  }

  if (!publicaciones) {
    return null;
  }

  // Función para normalizar slugs (usar la misma lógica que generatePublicacionSlug)
  const normalizeSlug = (s: string) => {
    // Primero normalizar variaciones comunes como "2002ano" -> "2002-ano"
    const normalized = s
      .toLowerCase()
      .normalize("NFD")
      .replaceAll(/(\d{4})([a-z])/g, "$1-$2") // Agregar guión entre año y letra
      .replaceAll(/[\u0300-\u036f]/g, "") // Remover acentos
      .replaceAll(/[^a-z0-9-]/g, "-") // Reemplazar caracteres especiales
      .replaceAll(/-+/g, "-") // Múltiples guiones a uno
      .replaceAll(/^[-]+|[-]+$/g, ""); // Remover guiones al inicio/final

    return normalized;
  };

  // Normalizar el slug de búsqueda
  const normalizedSearchSlug = normalizeSlug(slug);

  // Buscar la publicación que coincida con el slug
  if (process.env.NODE_ENV === "development") {
    console.log(`🔍 Buscando publicación con slug: ${slug}`);
    console.log(`📋 Total de publicaciones a revisar: ${publicaciones.length}`);

    // Verificar si la publicación 1333 está en la lista
    const index1333 = publicaciones.findIndex((p: any) => p.id_publicacion === 1333);

    if (index1333 >= 0) {
      console.log(
        `✅ Publicación 1333 encontrada en índice ${index1333} de ${publicaciones.length}`,
      );
    } else {
      console.warn(`⚠️ Publicación 1333 NO está en la lista de publicaciones`);
    }
  }

  for (const pub of publicaciones) {
    const año = pub.numero_publicacion_ano || new Date(pub.fecha).getFullYear();
    const pubSlug = generatePublicacionSlug(pub.cita_corta, año, pub.titulo, pub.id_publicacion);

    // Log específico para publicación 1333
    if (process.env.NODE_ENV === "development" && pub.id_publicacion === 1333) {
      console.log(`🔍🔍🔍 Revisando publicación 1333:`);
      console.log(`   Slug generado: "${pubSlug}"`);
      console.log(`   Slug buscado: "${slug}"`);
      console.log(`   ¿Coinciden exactamente? ${pubSlug === slug}`);
      console.log(`   Longitud generado: ${pubSlug.length}, Longitud buscado: ${slug.length}`);
      if (pubSlug !== slug) {
        console.log(`   ⚠️ DIFERENCIA DETECTADA - Comparando caracteres:`);
        for (let i = 0; i < Math.max(pubSlug.length, slug.length); i++) {
          if (pubSlug[i] !== slug[i]) {
            console.log(
              `     Pos ${i}: generado="${pubSlug[i] || "EOF"}" (${pubSlug.charCodeAt(i)}), buscado="${slug[i] || "EOF"}" (${slug.charCodeAt(i)})`,
            );
            break;
          }
        }
      }
    }

    // Comparación exacta primero
    if (pubSlug === slug) {
      if (process.env.NODE_ENV === "development") {
        console.log(`✅✅✅ ENCONTRADA publicación por comparación exacta: ${pub.id_publicacion}`);
        console.log(`   Slug generado: "${pubSlug}"`);
        console.log(`   Slug buscado: "${slug}"`);
        console.log(`   ¿Son iguales? ${pubSlug === slug}`);
        console.log(`   Longitud generado: ${pubSlug.length}, Longitud buscado: ${slug.length}`);
      }
      // Transformar los datos
      const enlaces =
        Array.isArray(pub.publicacion_enlace) && pub.publicacion_enlace.length > 0
          ? pub.publicacion_enlace.map((pe: any) => ({
              id_publicacion_enlace: pe.id_publicacion_enlace,
              enlace: pe.enlace,
              texto_enlace: pe.texto_enlace,
              exclusivo_cj: pe.exclusivo_cj,
            }))
          : [];

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

      const taxones =
        Array.isArray(pub.taxon_publicacion) && pub.taxon_publicacion.length > 0
          ? await Promise.all(
              pub.taxon_publicacion.map(async (tp: any) => {
                const taxonId = tp.taxon?.id_taxon || 0;

                if (taxonId === 0) return null;

                // Obtener el nombre científico completo y id_ficha_especie
                const {data: taxonData} = await supabaseClient
                  .from("taxon")
                  .select("id_taxon, taxon, taxon_id")
                  .eq("id_taxon", taxonId)
                  .single();

                if (!taxonData) return null;

                // Obtener ficha_especie por separado usando la relación correcta
                const {data: fichaEspecieData} = await supabaseClient
                  .from("ficha_especie")
                  .select("id_ficha_especie")
                  .eq("taxon_id", taxonId)
                  .maybeSingle();

                // Obtener el género (taxon padre)
                let nombreCompleto = taxonData.taxon || "";

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

                const idFichaEspecie = fichaEspecieData?.id_ficha_especie || null;

                return {
                  id_taxon: taxonId,
                  taxon: taxonData.taxon || "",
                  nombre_cientifico_completo: nombreCompleto,
                  id_ficha_especie: idFichaEspecie,
                  principal: tp.principal || false,
                };
              }),
            )
          : [];

      // Filtrar nulls
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
      } as unknown as PublicacionCompleta;
    }

    // Comparación flexible: normalizar ambos slugs
    const normalizedPubSlug = normalizeSlug(pubSlug);

    if (normalizedSearchSlug === normalizedPubSlug) {
      if (process.env.NODE_ENV === "development") {
        console.log(`✅ Encontrada publicación por comparación flexible: ${pub.id_publicacion}`);
        console.log(`   Slug original: ${pubSlug}`);
        console.log(`   Slug normalizado: ${normalizedPubSlug}`);
        console.log(`   Slug buscado normalizado: ${normalizedSearchSlug}`);
        console.log(
          `   ¿Por qué no coincidió exactamente? Original: "${pubSlug}" vs Buscado: "${slug}"`,
        );
      }
      // Transformar los datos (mismo código que arriba)
      const enlaces =
        Array.isArray(pub.publicacion_enlace) && pub.publicacion_enlace.length > 0
          ? pub.publicacion_enlace.map((pe: any) => ({
              id_publicacion_enlace: pe.id_publicacion_enlace,
              enlace: pe.enlace,
              texto_enlace: pe.texto_enlace,
              exclusivo_cj: pe.exclusivo_cj,
            }))
          : [];

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

                // Obtener ficha_especie por separado usando la relación correcta
                const {data: fichaEspecieData} = await supabaseClient
                  .from("ficha_especie")
                  .select("id_ficha_especie")
                  .eq("taxon_id", taxonId)
                  .maybeSingle();

                let nombreCompleto = taxonData.taxon || "";

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

                const idFichaEspecie = fichaEspecieData?.id_ficha_especie || null;

                return {
                  id_taxon: taxonId,
                  taxon: taxonData.taxon || "",
                  nombre_cientifico_completo: nombreCompleto,
                  id_ficha_especie: idFichaEspecie,
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
      } as unknown as PublicacionCompleta;
    }
  }

  // Si no se encontró, intentar búsqueda más flexible: buscar por similitud de slug
  // Esto ayuda cuando hay pequeñas diferencias en el slug (por ejemplo, año diferente)
  let mejorCoincidencia: {pub: any; similitud: number} | null = null;

  if (process.env.NODE_ENV === "development") {
    console.log(`🔍 Iniciando búsqueda por similitud para: ${slug}`);
  }

  for (const pub of publicaciones) {
    const año = pub.numero_publicacion_ano || new Date(pub.fecha).getFullYear();
    const pubSlug = generatePublicacionSlug(pub.cita_corta, año, pub.titulo, pub.id_publicacion);
    const normalizedPubSlug = normalizeSlug(pubSlug);

    if (
      process.env.NODE_ENV === "development" &&
      (pub.id_publicacion === 1333 || pub.id_publicacion === 1335)
    ) {
      console.log(`📝 Publicación ${pub.id_publicacion}:`);
      console.log(`   Slug original: ${pubSlug}`);
      console.log(`   Slug normalizado: ${normalizedPubSlug}`);
      console.log(`   Slug buscado normalizado: ${normalizedSearchSlug}`);
      console.log(`   ¿Coinciden exactamente? ${pubSlug === slug}`);
      console.log(`   ¿Coinciden normalizados? ${normalizedPubSlug === normalizedSearchSlug}`);
    }

    // Calcular similitud usando comparación de componentes del slug
    // Dividir en componentes (autor, año, título)
    const searchParts = normalizedSearchSlug.split("-");
    const pubParts = normalizedPubSlug.split("-");

    // Extraer años de ambos (puede haber múltiples años en el buscado)
    const searchAños = searchParts.filter((p) => /^\d{4}$/.test(p));
    const pubAños = pubParts.filter((p) => /^\d{4}$/.test(p));

    // Verificar si hay algún año que coincida (o esté cerca)
    const añosCoinciden = searchAños.some((sa) =>
      pubAños.some((pa) => Math.abs(Number.parseInt(sa, 10) - Number.parseInt(pa, 10)) <= 1),
    );

    // Si los años coinciden (o están cerca), calcular similitud
    let similitud = 0;

    if (añosCoinciden || (searchAños.length === 0 && pubAños.length === 0)) {
      // Comparar autor (primer componente)
      const searchAutor = searchParts[0];
      const pubAutor = pubParts[0];
      const autorMatch =
        searchAutor === pubAutor ||
        searchAutor.startsWith(pubAutor) ||
        pubAutor.startsWith(searchAutor);

      if (autorMatch) {
        // Comparar resto del slug (título) - remover años duplicados
        // Para el buscado, tomar todo después del último año
        let lastSearchAñoIndex = -1;

        for (let i = searchParts.length - 1; i >= 0; i--) {
          if (/^\d{4}$/.test(searchParts[i])) {
            lastSearchAñoIndex = i;
            break;
          }
        }
        const searchTitulo =
          lastSearchAñoIndex >= 0
            ? searchParts.slice(lastSearchAñoIndex + 1).join("-")
            : searchParts.slice(1).join("-");

        // Para el generado, tomar todo después del año
        let lastPubAñoIndex = -1;

        for (let i = pubParts.length - 1; i >= 0; i--) {
          if (/^\d{4}$/.test(pubParts[i])) {
            lastPubAñoIndex = i;
            break;
          }
        }
        const pubTitulo =
          lastPubAñoIndex >= 0
            ? pubParts.slice(lastPubAñoIndex + 1).join("-")
            : pubParts.slice(1).join("-");

        // Remover palabras comunes que pueden variar ("ano", "actual", etc.)
        const searchTituloClean = searchTitulo.replaceAll(/\b(ano|actual|the|of|a|an)\b/g, "");
        const pubTituloClean = pubTitulo.replaceAll(/\b(ano|actual|the|of|a|an)\b/g, "");

        // Calcular similitud del título usando prefijo común
        const minTituloLength = Math.min(searchTituloClean.length, pubTituloClean.length);
        let prefijoComun = 0;

        for (let i = 0; i < minTituloLength; i++) {
          if (searchTituloClean[i] === pubTituloClean[i]) {
            prefijoComun++;
          } else {
            break;
          }
        }

        // También verificar si uno contiene al otro
        const contiene =
          searchTituloClean.includes(pubTituloClean) || pubTituloClean.includes(searchTituloClean);
        const similitudTitulo = contiene
          ? 0.9
          : prefijoComun / Math.max(searchTituloClean.length, pubTituloClean.length, 1);

        // Similitud total: 0.3 autor + 0.2 año + 0.5 título
        similitud = 0.3 + 0.2 + similitudTitulo * 0.5;

        if (process.env.NODE_ENV === "development" && pub.id_publicacion === 1335) {
          console.log(`   Similitud calculada: ${similitud.toFixed(2)}`);
          console.log(`   Autor match: ${autorMatch}`);
          console.log(`   Título buscado: ${searchTitulo}`);
          console.log(`   Título generado: ${pubTitulo}`);
          console.log(`   Título limpio buscado: ${searchTituloClean}`);
          console.log(`   Título limpio generado: ${pubTituloClean}`);
        }
      }
    }

    // Si la similitud es alta (>0.3) y es mejor que la anterior, guardarla
    if (similitud > 0.3 && (!mejorCoincidencia || similitud > mejorCoincidencia.similitud)) {
      mejorCoincidencia = {pub, similitud};
      if (process.env.NODE_ENV === "development") {
        console.log(
          `✅ Nueva mejor coincidencia: id=${pub.id_publicacion}, similitud=${similitud.toFixed(2)}`,
        );
      }
    }

    // También intentar comparación más flexible siempre (no solo si similitud === 0)
    // Esto ayuda cuando la lógica de similitud no captura bien el match
    {
      // Normalizar variaciones comunes como "2002ano" -> "2002-ano"
      const searchNormalized = normalizedSearchSlug.replaceAll(/(\d{4})([a-z])/g, "$1-$2");
      const pubNormalized = normalizedPubSlug.replaceAll(/(\d{4})([a-z])/g, "$1-$2");

      // Comparar si son muy similares después de normalizar
      if (searchNormalized === pubNormalized) {
        mejorCoincidencia = {pub, similitud: 0.9};
        if (process.env.NODE_ENV === "development") {
          console.log(`✅ Coincidencia por normalización: id=${pub.id_publicacion}`);
        }
      } else if (
        searchNormalized.includes(pubNormalized) ||
        pubNormalized.includes(searchNormalized)
      ) {
        const lenMatch = Math.min(searchNormalized.length, pubNormalized.length);
        const lenTotal = Math.max(searchNormalized.length, pubNormalized.length);
        const similitudFlex = lenMatch / lenTotal;

        if (
          similitudFlex > 0.7 &&
          (!mejorCoincidencia || similitudFlex > mejorCoincidencia.similitud)
        ) {
          mejorCoincidencia = {pub, similitud: similitudFlex};
          if (process.env.NODE_ENV === "development") {
            console.log(
              `✅ Coincidencia por inclusión: id=${pub.id_publicacion}, similitud=${similitudFlex.toFixed(2)}`,
            );
          }
        }
      }
    }
  }

  // Si no encontramos coincidencia, intentar búsqueda directa por autor y año
  if (!mejorCoincidencia || mejorCoincidencia.similitud <= 0.3) {
    // Extraer autor y año del slug buscado
    const searchParts = normalizedSearchSlug.split("-");
    const searchAños = searchParts.filter((p) => /^\d{4}$/.test(p));
    const searchAutor = searchParts[0];

    if (searchAutor && searchAños.length > 0) {
      const añoBuscado = Number.parseInt(searchAños[0], 10);

      if (process.env.NODE_ENV === "development") {
        console.log(`🔍 Intentando búsqueda directa: autor=${searchAutor}, año=${añoBuscado}`);
      }

      // Buscar publicación que coincida con autor y año
      for (const pub of publicaciones) {
        const año = pub.numero_publicacion_ano || new Date(pub.fecha).getFullYear();

        if (Math.abs(año - añoBuscado) <= 1 && pub.cita_corta) {
          // Extraer autor de la cita corta
          let autor = pub.cita_corta.split("(")[0].split(",")[0].trim();

          if (autor.includes(" y ")) {
            autor = autor.split(" y ")[0].trim();
          }

          // Normalizar autor
          const autorNormalizado = autor
            .toLowerCase()
            .normalize("NFD")
            .replaceAll(/[\u0300-\u036f]/g, "")
            .replaceAll(/[^a-z0-9\s-]/g, "")
            .replaceAll(/\s+/g, "-")
            .replaceAll(/-+/g, "-")
            .replaceAll(/^[-]+|[-]+$/g, "");

          if (
            autorNormalizado === searchAutor ||
            autorNormalizado.startsWith(searchAutor) ||
            searchAutor.startsWith(autorNormalizado)
          ) {
            mejorCoincidencia = {pub, similitud: 0.7};
            if (process.env.NODE_ENV === "development") {
              console.log(
                `✅ Coincidencia por autor y año: id=${pub.id_publicacion}, autor=${autorNormalizado}`,
              );
            }
            break;
          }
        }
      }
    }
  }

  // Si encontramos una buena coincidencia, usarla (bajar el umbral a 0.3 para ser más flexible)
  if (mejorCoincidencia && mejorCoincidencia.similitud > 0.3) {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `✅ Usando mejor coincidencia: id=${mejorCoincidencia.pub.id_publicacion}, similitud=${mejorCoincidencia.similitud.toFixed(2)}`,
      );
    }
    if (process.env.NODE_ENV === "development") {
      console.log(
        `✅ Coincidencia por similitud encontrada: id=${mejorCoincidencia.pub.id_publicacion}, similitud=${mejorCoincidencia.similitud.toFixed(2)}`,
      );
    }

    const pub = mejorCoincidencia.pub;
    // Transformar los datos (código duplicado, pero necesario)
    const enlaces =
      Array.isArray(pub.publicacion_enlace) && pub.publicacion_enlace.length > 0
        ? pub.publicacion_enlace.map((pe: any) => ({
            id_publicacion_enlace: pe.id_publicacion_enlace,
            enlace: pe.enlace,
            texto_enlace: pe.texto_enlace,
            exclusivo_cj: pe.exclusivo_cj,
          }))
        : [];

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

              // Obtener ficha_especie por separado usando la relación correcta
              const {data: fichaEspecieData} = await supabaseClient
                .from("ficha_especie")
                .select("id_ficha_especie")
                .eq("taxon_id", taxonId)
                .maybeSingle();

              let nombreCompleto = taxonData.taxon || "";

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

              const idFichaEspecie = fichaEspecieData?.id_ficha_especie || null;

              return {
                id_taxon: taxonId,
                taxon: taxonData.taxon || "",
                nombre_cientifico_completo: nombreCompleto,
                id_ficha_especie: idFichaEspecie,
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
    } as unknown as PublicacionCompleta;
  }

  // Si no se encontró, log para debug
  if (process.env.NODE_ENV === "development") {
    console.warn(`⚠️ No se encontró publicación con slug: ${slug}`);
    console.log(`📋 Total de publicaciones revisadas: ${publicaciones.length}`);
    console.log(`🔍 Slug normalizado buscado: ${normalizedSearchSlug}`);

    // Mostrar algunos slugs generados para comparar
    const primerosSlugs = publicaciones.slice(0, 10).map((p) => {
      const año = p.numero_publicacion_ano || new Date(p.fecha).getFullYear();
      const genSlug = generatePublicacionSlug(p.cita_corta, año, p.titulo, p.id_publicacion);
      const normSlug = normalizeSlug(genSlug);

      return {
        id: p.id_publicacion,
        original: genSlug,
        normalizado: normSlug,
        coincide: normSlug === normalizedSearchSlug,
      };
    });

    console.log(`📝 Primeros 10 slugs generados:`, primerosSlugs);
  }

  return null;
}

/**
 * Obtiene todas las publicaciones con sus slugs para generateStaticParams
 */
export async function getAllPublicacionesWithSlugs(): Promise<
  {slug: string; id_publicacion: number}[]
> {
  const supabaseClient = createServiceClient();

  const {data: publicaciones, error} = await supabaseClient
    .from("publicacion")
    .select("id_publicacion, cita_corta, numero_publicacion_ano, fecha, titulo")
    .order("id_publicacion", {ascending: true});

  if (error || !publicaciones) {
    console.error("Error al obtener publicaciones:", error);

    return [];
  }

  return publicaciones.map((pub) => ({
    slug: generatePublicacionSlug(
      pub.cita_corta,
      pub.numero_publicacion_ano || new Date(pub.fecha).getFullYear(),
      pub.titulo,
      pub.id_publicacion,
    ),
    id_publicacion: pub.id_publicacion,
  }));
}
