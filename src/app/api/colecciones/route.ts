import {NextResponse} from "next/server";

import {createServiceClient} from "@/utils/supabase/server";

function parseList(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split("||")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseNumber(raw: string | null): number | null {
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

const ITEMS_POR_PAGINA = 40;

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);

  const familias = parseList(searchParams.get("familias"));
  const generos = parseList(searchParams.get("generos"));
  const especies = parseList(searchParams.get("especies"));
  const estadios = parseList(searchParams.get("estadios"));
  const sexos = parseList(searchParams.get("sexos"));
  const estados = parseList(searchParams.get("estados"));
  const colectores = parseList(searchParams.get("colectores"));
  const localidades = parseList(searchParams.get("localidades"));
  const catalogos = parseList(searchParams.get("catalogos"));
  const sc = searchParams.get("sc")?.trim() || "";
  const anioEspecifico = parseNumber(searchParams.get("anio"));
  const anioDesde = parseNumber(searchParams.get("anio_desde"));
  const anioHasta = parseNumber(searchParams.get("anio_hasta"));
  const elevMin = parseNumber(searchParams.get("elev_min"));
  const elevMax = parseNumber(searchParams.get("elev_max"));
  const pagina = Math.max(1, parseNumber(searchParams.get("pagina")) || 1);

  const supabase = createServiceClient();

  try {
    // 1) Resolver taxon_ids si hay filtro taxonómico
    let taxonIdsFiltrados: number[] | null = null;

    if (familias.length > 0 || generos.length > 0 || especies.length > 0) {
      let q = supabase
        .from("vw_lista_spp")
        .select("id_especie, familia, genero, nombre_cientifico");
      if (familias.length > 0) q = q.in("familia", familias);
      if (generos.length > 0) q = q.in("genero", generos);
      if (especies.length > 0) q = q.in("nombre_cientifico", especies);

      const {data: tax, error: taxErr} = await q.limit(100000);
      if (taxErr) {
        console.error("Error filtrando taxonomía:", taxErr);
        return NextResponse.json({error: "Error filtrando taxonomía"}, {status: 500});
      }
      taxonIdsFiltrados = Array.from(
        new Set(
          (tax || [])
            .map((r: any) => r.id_especie)
            .filter((id: number | null) => id != null),
        ),
      ) as number[];
      if (taxonIdsFiltrados.length === 0) {
        return NextResponse.json({
          colecciones: [],
          total: 0,
          totalPaginas: 0,
          paginaActual: 1,
        });
      }
    }

    // 2) Resolver personal_id si hay filtro de colectores (combinado: campo libre + personal.nombre)
    let personalIdsFiltrados: number[] | null = null;
    if (colectores.length > 0) {
      const {data: pers, error: persErr} = await supabase
        .from("personal")
        .select("id_personal, nombre")
        .in("nombre", colectores)
        .limit(100000);
      if (persErr) {
        console.error("Error resolviendo personal:", persErr);
      }
      personalIdsFiltrados = (pers || []).map((p: any) => p.id_personal as number);
    }

    // 3) Construir query principal
    let query = supabase
      .from("coleccion")
      .select(
        `id_coleccion, taxon_id, sc, gui, numero_museo, catalogo_museo,
         estadio, numero_individuos, sexo, estado,
         fecha_col, colectores, localidad, latitud, longitud, elevacion, personal_id, provincia_id,
         sangre, piel_exudado, piel_liofilizado, tejido_higado, tejido_musculo,
         esqueleto_transparentacion, esperma, heces, genbank,
         geopolitica!coleccion_provincia_id_fkey(nombre),
         personal!coleccion_personal_id_fkey(nombre, siglas),
         taxon!coleccion_taxon_id_fkey(taxon)`,
        {count: "exact"},
      )
      .eq("publicar", true);

    if (taxonIdsFiltrados) query = query.in("taxon_id", taxonIdsFiltrados);
    if (estadios.length > 0) query = query.in("estadio", estadios);
    if (sexos.length > 0) query = query.in("sexo", sexos);
    if (estados.length > 0) query = query.in("estado", estados);

    if (colectores.length > 0) {
      // OR: colectores (texto) IN list OR personal_id IN ids
      const orParts: string[] = [];
      for (const c of colectores) {
        const esc = c.replace(/[%,()*]/g, "");
        if (esc) orParts.push(`colectores.ilike.%${esc}%`);
      }
      if (personalIdsFiltrados && personalIdsFiltrados.length > 0) {
        orParts.push(`personal_id.in.(${personalIdsFiltrados.join(",")})`);
      }
      if (orParts.length > 0) query = query.or(orParts.join(","));
    }

    if (localidades.length > 0) {
      // localidad es texto libre + provincia (geopolitica.nombre) - filtramos por localidad o por provincia_id
      const provincias: string[] = [];
      const detalles: string[] = [];
      for (const loc of localidades) {
        // si la cadena no contiene coma, asumimos provincia
        if (loc.includes(",")) detalles.push(loc);
        else provincias.push(loc);
      }
      let provinciaIds: number[] = [];
      if (provincias.length > 0) {
        const {data: geo} = await supabase
          .from("geopolitica")
          .select("id_geopolitica, nombre")
          .in("nombre", provincias)
          .limit(10000);
        provinciaIds = (geo || []).map((g: any) => g.id_geopolitica as number);
      }
      const orParts: string[] = [];
      for (const d of detalles) {
        const esc = d.replace(/[%,()*]/g, "");
        if (esc) orParts.push(`localidad.ilike.%${esc}%`);
      }
      if (provinciaIds.length > 0) {
        orParts.push(`provincia_id.in.(${provinciaIds.join(",")})`);
      }
      if (orParts.length > 0) query = query.or(orParts.join(","));
    }

    if (catalogos.length > 0) {
      // Cada entrada es `catalogo_museo::numero_museo` o solo `catalogo_museo`
      const orParts: string[] = [];
      for (const cat of catalogos) {
        const [c, n] = cat.split("::");
        const escC = (c || "").replace(/[%,()*]/g, "");
        const escN = (n || "").replace(/[%,()*]/g, "");
        if (escC && escN) {
          orParts.push(`and(catalogo_museo.eq.${escC},numero_museo.eq.${escN})`);
        } else if (escC) {
          orParts.push(`catalogo_museo.eq.${escC}`);
        }
      }
      if (orParts.length > 0) query = query.or(orParts.join(","));
    }

    if (sc) {
      query = query.ilike("sc", `%${sc.replace(/[%,()*]/g, "")}%`);
    }

    if (anioEspecifico != null) {
      query = query
        .gte("fecha_col", `${anioEspecifico}-01-01`)
        .lte("fecha_col", `${anioEspecifico}-12-31`);
    } else {
      if (anioDesde != null) query = query.gte("fecha_col", `${anioDesde}-01-01`);
      if (anioHasta != null) query = query.lte("fecha_col", `${anioHasta}-12-31`);
    }

    if (elevMin != null) query = query.gte("elevacion", elevMin);
    if (elevMax != null) query = query.lte("elevacion", elevMax);

    const from = (pagina - 1) * ITEMS_POR_PAGINA;
    const to = from + ITEMS_POR_PAGINA - 1;

    const {data, error, count} = await query
      .order("fecha_col", {ascending: false, nullsFirst: false})
      .order("id_coleccion", {ascending: false})
      .range(from, to);

    if (error) {
      console.error("Error en colecciones:", error);
      return NextResponse.json({error: "Error al obtener colecciones"}, {status: 500});
    }

    // 4) Lookup de multimedia (video/foto/canto) para los colecciones devueltos
    const coleccionIds = Array.from(
      new Set((data || []).map((r: any) => r.id_coleccion).filter((v: any) => v != null)),
    ) as number[];
    const multimediaSet = new Set<number>();
    if (coleccionIds.length > 0) {
      const [{data: vids}, {data: fotos}, {data: cantos}] = await Promise.all([
        supabase.from("video").select("coleccion_id").in("coleccion_id", coleccionIds).limit(100000),
        supabase
          .from("fotografia")
          .select("coleccion_id")
          .in("coleccion_id", coleccionIds)
          .limit(100000),
        supabase.from("canto").select("coleccion_id").in("coleccion_id", coleccionIds).limit(100000),
      ]);
      (vids || []).forEach((v: any) => {
        if (v.coleccion_id != null) multimediaSet.add(v.coleccion_id as number);
      });
      (fotos || []).forEach((f: any) => {
        if (f.coleccion_id != null) multimediaSet.add(f.coleccion_id as number);
      });
      (cantos || []).forEach((c: any) => {
        if (c.coleccion_id != null) multimediaSet.add(c.coleccion_id as number);
      });
    }

    // 5) Lookup de nombre_cientifico por taxon_id usando vw_lista_spp
    const taxonIds = Array.from(
      new Set((data || []).map((r: any) => r.taxon_id).filter((t: any) => t != null)),
    ) as number[];
    let nombreCientificoMap = new Map<number, {nombre_cientifico: string | null; nombre_comun: string | null}>();
    if (taxonIds.length > 0) {
      const {data: spp} = await supabase
        .from("vw_lista_spp")
        .select("id_especie, nombre_cientifico, nombre_comun")
        .in("id_especie", taxonIds)
        .limit(100000);
      (spp || []).forEach((s: any) => {
        if (s.id_especie != null && !nombreCientificoMap.has(s.id_especie)) {
          nombreCientificoMap.set(s.id_especie, {
            nombre_cientifico: s.nombre_cientifico ?? null,
            nombre_comun: s.nombre_comun ?? null,
          });
        }
      });
    }

    const colecciones = (data || []).map((c: any) => {
      const speciesInfo = nombreCientificoMap.get(c.taxon_id);
      const tieneMuestras = Boolean(
        c.sangre ||
          c.piel_exudado ||
          c.piel_liofilizado ||
          c.tejido_higado ||
          c.tejido_musculo ||
          c.esqueleto_transparentacion ||
          c.esperma ||
          c.heces,
      );
      return {
        fuente: "coleccion" as const,
        id_coleccion: c.id_coleccion,
        taxon_id: c.taxon_id,
        sc: c.sc,
        gui: c.gui,
        num_museo: c.numero_museo,
        catalogo_museo: c.catalogo_museo ?? null,
        fecha_coleccion: c.fecha_col ?? null,
        colectores: c.colectores,
        personal_nombre: c.personal?.nombre ?? null,
        personal_siglas: c.personal?.siglas ?? null,
        provincia: c.geopolitica?.nombre ?? null,
        detalle_localidad: c.localidad,
        latitud: c.latitud,
        longitud: c.longitud,
        altitud: c.elevacion,
        estadio: c.estadio,
        numero_individuos: c.numero_individuos,
        sexo: c.sexo,
        estado: c.estado,
        nombre_cientifico:
          speciesInfo?.nombre_cientifico ?? c.taxon?.taxon ?? null,
        nombre_comun: speciesInfo?.nombre_comun ?? null,
        tiene_muestras: tieneMuestras,
        tiene_multimedia: multimediaSet.has(c.id_coleccion),
        tiene_adn: Boolean(c.genbank),
      };
    });

    const total = count ?? colecciones.length;
    const totalPaginas = Math.max(1, Math.ceil(total / ITEMS_POR_PAGINA));

    return NextResponse.json({
      colecciones,
      total,
      totalPaginas,
      paginaActual: pagina,
    });
  } catch (error) {
    console.error("Error en API colecciones:", error);
    return NextResponse.json({error: "Error interno"}, {status: 500});
  }
}
