import {NextResponse} from "next/server";

import {createServiceClient} from "@/utils/supabase/server";

const ITEMS_POR_PAGINA = 50;

const CATALOGO_TEJIDO_HIGADO = 597;
const CATALOGO_TEJIDO_MUSCULO = 596;
const CATALOGO_TEJIDO_MUSCULO_E_HIGADO = 609;
const CATALOGO_PIEL_LIOFILIZADO = 641;
const CATALOGO_PIEL_EXUDADO = 642;
const TEJIDO_HIGADO_IDS = new Set([CATALOGO_TEJIDO_HIGADO, CATALOGO_TEJIDO_MUSCULO_E_HIGADO]);
const TEJIDO_MUSCULO_IDS = new Set([CATALOGO_TEJIDO_MUSCULO, CATALOGO_TEJIDO_MUSCULO_E_HIGADO]);

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

export async function GET(
  request: Request,
  {params}: {params: Promise<{taxonId: string}>},
) {
  const {taxonId} = await params;
  const taxonIdNum = Number.parseInt(taxonId, 10);

  if (isNaN(taxonIdNum)) {
    return NextResponse.json({error: "taxonId inválido"}, {status: 400});
  }

  const {searchParams} = new URL(request.url);
  const tiposMuestra = parseList(searchParams.get("tipos_muestra"));
  const pagina = Math.max(1, parseNumber(searchParams.get("pagina")) || 1);

  const supabase = createServiceClient();

  try {
    const {data, error} = await supabase
      .from("coleccion")
      .select(
        `id_coleccion, taxon_id, sc, gui, numero_museo, catalogo_museo, fecha_col, colectores,
         localidad, latitud, longitud, elevacion, estadio, numero_individuos, sexo, estado, genbank,
         esqueleto_transparentacion,
         geopolitica!coleccion_provincia_id_fkey(nombre),
         personal!coleccion_personal_id_fkey(nombre, siglas),
         taxon!coleccion_taxon_id_fkey(taxon, taxonPadre:taxon_id(taxon))`,
      )
      .eq("taxon_id", taxonIdNum)
      .eq("publicar", true)
      .order("fecha_col", {ascending: false, nullsFirst: false})
      .limit(100000);

    if (error) throw error;

    const coleccionIds = (data || []).map((c: any) => c.id_coleccion as number);
    const presencia = {
      sangre: new Set<number>(),
      esperma: new Set<number>(),
      heces: new Set<number>(),
      tejAny: new Set<number>(),
      tejHigado: new Set<number>(),
      tejMusculo: new Set<number>(),
      pielLiof: new Set<number>(),
      pielExud: new Set<number>(),
    };

    if (coleccionIds.length > 0) {
      const [sang, esp, hec, tej, ep] = await Promise.all([
        supabase.from("sangre").select("coleccion_id").in("coleccion_id", coleccionIds),
        supabase.from("esperma").select("coleccion_id").in("coleccion_id", coleccionIds),
        supabase.from("heces").select("coleccion_id").in("coleccion_id", coleccionIds),
        supabase
          .from("tejido")
          .select("coleccion_id, tipo_tejido_id")
          .in("coleccion_id", coleccionIds),
        supabase
          .from("extracto_piel")
          .select("coleccion_id, tipo_extracto_piel_id")
          .in("coleccion_id", coleccionIds),
      ]);

      (sang.data || []).forEach((r: any) => presencia.sangre.add(r.coleccion_id));
      (esp.data || []).forEach((r: any) => presencia.esperma.add(r.coleccion_id));
      (hec.data || []).forEach((r: any) => presencia.heces.add(r.coleccion_id));
      (tej.data || []).forEach((r: any) => {
        presencia.tejAny.add(r.coleccion_id);
        if (TEJIDO_HIGADO_IDS.has(r.tipo_tejido_id)) presencia.tejHigado.add(r.coleccion_id);
        if (TEJIDO_MUSCULO_IDS.has(r.tipo_tejido_id)) presencia.tejMusculo.add(r.coleccion_id);
      });
      (ep.data || []).forEach((r: any) => {
        if (r.tipo_extracto_piel_id === CATALOGO_PIEL_LIOFILIZADO)
          presencia.pielLiof.add(r.coleccion_id);
        if (r.tipo_extracto_piel_id === CATALOGO_PIEL_EXUDADO)
          presencia.pielExud.add(r.coleccion_id);
      });
    }

    let filtrado = (data || []).filter((c: any) => {
      const id = c.id_coleccion as number;

      return (
        presencia.sangre.has(id) ||
        presencia.esperma.has(id) ||
        presencia.heces.has(id) ||
        presencia.tejAny.has(id) ||
        presencia.pielLiof.has(id) ||
        presencia.pielExud.has(id) ||
        c.esqueleto_transparentacion === true
      );
    });

    if (tiposMuestra.length > 0) {
      filtrado = filtrado.filter((c: any) => {
        const id = c.id_coleccion as number;

        return tiposMuestra.every((k) => {
          switch (k) {
            case "sangre":
              return presencia.sangre.has(id);
            case "esperma":
              return presencia.esperma.has(id);
            case "heces":
              return presencia.heces.has(id);
            case "tejido_higado":
              return presencia.tejHigado.has(id);
            case "tejido_musculo":
              return presencia.tejMusculo.has(id);
            case "piel_liofilizado":
              return presencia.pielLiof.has(id);
            case "piel_exudado":
              return presencia.pielExud.has(id);
            case "esqueleto_transparentacion":
              return c.esqueleto_transparentacion === true;
            default:
              return true;
          }
        });
      });
    }

    // Counts por tipo de muestra (no filtrado por tiposMuestra, sino sobre el universo del taxon)
    const universoIds = (data || []).map((c: any) => c.id_coleccion as number);
    const countWith = (set: Set<number>) =>
      universoIds.filter((id) => set.has(id)).length;
    const counts = {
      sangre: countWith(presencia.sangre),
      esperma: countWith(presencia.esperma),
      heces: countWith(presencia.heces),
      tejido_higado: countWith(presencia.tejHigado),
      tejido_musculo: countWith(presencia.tejMusculo),
      piel_liofilizado: countWith(presencia.pielLiof),
      piel_exudado: countWith(presencia.pielExud),
      esqueleto_transparentacion: (data || []).filter(
        (c: any) => c.esqueleto_transparentacion === true,
      ).length,
    };

    // Lookup nombre científico una sola vez
    const {data: spp} = await supabase
      .from("vw_lista_spp")
      .select("id_especie, nombre_cientifico, nombre_comun")
      .eq("id_especie", taxonIdNum)
      .maybeSingle();

    const speciesInfo = spp as
      | {nombre_cientifico: string | null; nombre_comun: string | null}
      | null;
    const fallbackName =
      filtrado[0]?.taxon
        ? [filtrado[0].taxon.taxonPadre?.taxon, filtrado[0].taxon.taxon]
            .filter(Boolean)
            .join(" ") || null
        : null;
    const nombreCientifico =
      speciesInfo?.nombre_cientifico ?? fallbackName ?? "Especie";

    const total = filtrado.length;
    const totalPaginas = Math.max(1, Math.ceil(total / ITEMS_POR_PAGINA));
    const inicio = (pagina - 1) * ITEMS_POR_PAGINA;
    const slice = filtrado.slice(inicio, inicio + ITEMS_POR_PAGINA);

    const muestras = slice.map((c: any) => {
      const id = c.id_coleccion as number;
      const flags = {
        sangre: presencia.sangre.has(id),
        piel_exudado: presencia.pielExud.has(id),
        piel_liofilizado: presencia.pielLiof.has(id),
        tejido_higado: presencia.tejHigado.has(id),
        tejido_musculo: presencia.tejMusculo.has(id),
        esqueleto_transparentacion: c.esqueleto_transparentacion === true,
        esperma: presencia.esperma.has(id),
        heces: presencia.heces.has(id),
      };

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
        nombre_cientifico: speciesInfo?.nombre_cientifico ?? fallbackName,
        nombre_comun: speciesInfo?.nombre_comun ?? null,
        tiene_muestras: true,
        tiene_multimedia: false,
        tiene_adn: Boolean(c.genbank),
        ...flags,
      };
    });

    return NextResponse.json({
      muestras,
      counts,
      nombreCientifico,
      total,
      totalPaginas,
      paginaActual: pagina,
    });
  } catch (error) {
    console.error("Error en moleculoteca/[taxonId]:", error);

    return NextResponse.json({error: "Error al obtener muestras"}, {status: 500});
  }
}
