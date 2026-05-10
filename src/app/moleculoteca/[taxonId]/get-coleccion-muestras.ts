import {createServiceClient} from "@/utils/supabase/server";

export interface ColeccionMuestra {
  id_coleccion: number;
  numero_museo: string | null;
  catalogo_museo: string | null;
  num_colector: string | null;
  fecha_col: string | null;
  localidad: string | null;
  estadio: string | null;
  sexo: string | null;
  estado: string | null;
  sangre: boolean;
  piel_exudado: boolean;
  piel_liofilizado: boolean;
  tejido_higado: boolean;
  tejido_musculo: boolean;
  esqueleto_transparentacion: boolean;
  esperma: boolean;
  heces: boolean;
  taxon_nombre: string | null;
  provincia: string | null;
}

export async function getColeccionMuestras(taxonId: number): Promise<ColeccionMuestra[]> {
  const supabase = createServiceClient();

  const {data, error} = await supabase
    .from("coleccion")
    .select(
      `id_coleccion, numero_museo, catalogo_museo, num_colector, fecha_col, localidad,
       estadio, sexo, estado,
       sangre, piel_exudado, piel_liofilizado, tejido_higado, tejido_musculo,
       esqueleto_transparentacion, esperma, heces,
       taxon!coleccion_taxon_id_fkey(taxon, taxonPadre:taxon_id(taxon)),
       geopolitica!coleccion_provincia_id_fkey(nombre)`,
    )
    .eq("taxon_id", taxonId)
    .or(
      "sangre.eq.true,piel_exudado.eq.true,piel_liofilizado.eq.true,tejido_higado.eq.true,tejido_musculo.eq.true,esqueleto_transparentacion.eq.true,esperma.eq.true,heces.eq.true",
    )
    .order("fecha_col", {ascending: false, nullsFirst: false});

  if (error) {
    console.error("Error al obtener muestras:", error);

    return [];
  }

  return (data || []).map((c: any) => {
    const especie = c.taxon?.taxon as string | undefined;
    const genero = c.taxon?.taxonPadre?.taxon as string | undefined;
    const nombreCientifico = [genero, especie].filter(Boolean).join(" ") || null;

    return {
    id_coleccion: c.id_coleccion,
    numero_museo: c.numero_museo,
    catalogo_museo: c.catalogo_museo,
    num_colector: c.num_colector,
    fecha_col: c.fecha_col,
    localidad: c.localidad,
    estadio: c.estadio,
    sexo: c.sexo,
    estado: c.estado,
    sangre: !!c.sangre,
    piel_exudado: !!c.piel_exudado,
    piel_liofilizado: !!c.piel_liofilizado,
    tejido_higado: !!c.tejido_higado,
    tejido_musculo: !!c.tejido_musculo,
    esqueleto_transparentacion: !!c.esqueleto_transparentacion,
    esperma: !!c.esperma,
    heces: !!c.heces,
    taxon_nombre: nombreCientifico,
    provincia: c.geopolitica?.nombre ?? null,
    };
  });
}
