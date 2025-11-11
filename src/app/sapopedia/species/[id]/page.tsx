import Link from "next/link";
import {notFound} from "next/navigation";

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {mockTaxonomy} from "@/lib/mock-taxonomy";
import SpeciesContent from "@/components/SpeciesContent";
import SpeciesTechnicalSheet from "@/components/SpeciesTechnicalSheet";
import {createServiceClient} from "@/utils/supabase/server";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function SpeciesPage({params}: PageProps) {
  const {id} = await params;
  const sp = mockTaxonomy.getSpeciesById(id);

  // if (!sp) {
  //   notFound();
  // }

  const supabaseClient = createServiceClient();
  const {data: ficha_especies, error} = await supabaseClient
    .from("ficha_especie")
    .select("*")
    .eq("id_ficha_especie", Number(id));

  if (error) {
    console.error(error);
  }

  console.log({
    ficha_especies,
  });

  if (!ficha_especies || ficha_especies.length === 0) {
    notFound();
  }

  const fichaEspecie = ficha_especies[0];

  const {data: taxon_catalogo_awe_results, error: taxon_catalogo_aweError} = await supabaseClient
    .from("taxon_catalogo_awe")
    .select("*, catalogo_awe(*, tipo_catalogo_awe(*))")
    .eq("taxon_id", fichaEspecie.taxon_id);

  // if (!fichaEspecie.publicar) {
  //   return <p>Esta especie no está publicada actualmente.</p>;
  // }

  // console.log(ficha_especies);

  if (taxon_catalogo_aweError) {
    console.error(taxon_catalogo_aweError);
  }

  console.log({
    taxon_catalogo_awe_results,
  });

  const {data: dataRegionBio, error: errorAweRegionBio} = await supabaseClient
    .from("taxon_catalogo_awe_region_biogeografica")
    .select(
      `
    *,
    catalogo_awe!inner(*, tipo_catalogo_awe(*))
  `,
    )
    .eq("taxon_id", fichaEspecie.taxon_id)
    .eq("catalogo_awe.tipo_catalogo_awe_id", 6); // filtro en la tabla relacionada

  if (errorAweRegionBio) {
    console.error(errorAweRegionBio);
  } else {
    console.log({dataRegionBio});
  }

  const {data: geoPolitica, error: errorGeoPolitica} = await supabaseClient
    .from("taxon_geopolitica")
    .select("*, geopolitica(*, rank_geopolitica(*))")
    .eq("taxon_id", fichaEspecie.taxon_id);

  const {data: publicaciones, error: errorPublicaciones} = await supabaseClient
    .from("taxon_publicacion")
    .select("*, publicacion(*)")
    .eq("taxon_id", fichaEspecie.taxon_id);

  if (errorGeoPolitica) {
    console.error(errorGeoPolitica);
  }

  const {data: taxones, error: errorTaxones} = await supabaseClient
    .from("taxon")
    .select("*, taxonPadre:taxon_id(*)")
    .eq("id_taxon", fichaEspecie.taxon_id);

  if (errorTaxones) {
    console.error(errorTaxones);
  }

  console.log({
    taxones,
  });

  const getConservationBadgeVariant = (status: string) => {
    switch (status) {
      case "CR":
        return "destructive";
      case "EN":
        return "destructive";
      case "VU":
        return "warning";
      case "NT":
        return "info";
      case "LC":
        return "success";
      default:
        return "outline";
    }
  };

  const getConservationStatusText = (status: string) => {
    switch (status) {
      case "CR":
        return "En Peligro Crítico";
      case "EN":
        return "En Peligro";
      case "VU":
        return "Vulnerable";
      case "NT":
        return "Casi Amenazada";
      case "LC":
        return "Preocupación Menor";
      default:
        return status;
    }
  };

  console.log({
    geoPolitica,
  });

  // No se requiere extraer año desde autorano en mock

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header de la especie */}
      <div className="mb-8 text-center">
        <h1 className="text-primary mb-2 text-4xl font-bold">{taxones[0].nombre_comun}</h1>
        <p className="text-muted-foreground mb-4 text-2xl italic">
          {taxones[0]?.taxonPadre?.taxon} {taxones[0]?.taxon}
        </p>

        <div className="mb-4 flex justify-center gap-2">
          {true && <Badge variant="outline">TODO Endémica de Ecuador</Badge>}
          {true && <Badge variant="outline">{"TODO " + getConservationStatusText("CR")}</Badge>}
        </div>
      </div>
      {/* Navegación */}
      <div className="mb-6">
        <Link href="/sapopedia">
          <Button variant="outline">← Volver a SapoPedia</Button>
        </Link>
      </div>
      {/* Información básica */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Información Básica</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
            <div>
              <h4 className="mb-2 font-semibold">Primeros colectores</h4>
              <p className="text-muted-foreground italic">TODO</p>
            </div>
            <div>
              <h4 className="mb-2 font-semibold">Etimología</h4>
              <p className="text-muted-foreground">{fichaEspecie.etimologia || "No disponible"}</p>
            </div>
            <div>
              <h4 className="mb-2 font-semibold">Distribución</h4>
              <p className="text-muted-foreground">
                grafico TODO : {fichaEspecie.rango_altitudinal || "No disponible"}
              </p>
            </div>
            <div>
              <h4 className="mb-2 font-semibold">Distribución Altitudinal nombre</h4>
              <p className="text-muted-foreground">
                grafico TODO : {fichaEspecie.rango_altitudinal || "No disponible"}
              </p>
            </div>
            {/* <div>
              <h4 className="mb-2 font-semibold">Etimología</h4>
              <p className="text-muted-foreground">{sp.common_name || "No disponible"}</p>
            </div>
            <div>
              <h4 className="mb-2 font-semibold">Año de descripción</h4>
              <p className="text-muted-foreground">{sp.discovery_year ?? "No disponible"}</p>
            </div>
            <div>
              <h4 className="mb-2 font-semibold">Distribución</h4>
              <p className="text-muted-foreground">{sp.distribution || "No disponible"}</p>
            </div> */}
          </div>
        </CardContent>
      </Card>
      {/* Catalogo Awe */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Categorías en Catálogos AWE</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-2">
            {taxon_catalogo_awe_results?.map((categoria) => (
              <div
                key={categoria.id_taxon_catalogo_awe}
                className="flex items-center justify-between"
              >
                <span>{categoria.catalogo_awe.tipo_catalogo_awe?.nombre}</span>
                <span className="text-muted-foreground text-sm">
                  {categoria.catalogo_awe.nombre}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Ecoregion */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Regiones Biogeográficas AWE</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-2">
            {dataRegionBio?.map((region) => (
              <div
                key={region.id_taxon_catalogo_awe_region_biogeografica}
                className="flex items-center justify-between"
              >
                <span>{region.catalogo_awe.tipo_catalogo_awe?.nombre}</span>
                <span className="text-muted-foreground text-sm">
                  {region.catalogo_awe.nombre} ({region.catalogo_awe.descripcion})
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Geopolítica */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Distribución Geopolítica</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-2">
            {geoPolitica?.map((region) => (
              <div key={region.id_taxon_geopolitica} className="flex items-center justify-between">
                <span>{region.geopolitica?.rank_geopolitica.nombre}</span>
                <span className="text-muted-foreground text-sm">{region.geopolitica?.nombre}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* {Identificacion} */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Identificación</CardTitle>
        </CardHeader>
        <CardContent>
          {fichaEspecie.identificacion ? (
            fichaEspecie.identificacion
          ) : (
            <p className="text-muted-foreground">No disponible</p>
          )}
        </CardContent>
      </Card>

      {/* { Publicaciones } */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Publicaciones</CardTitle>
        </CardHeader>
        <CardContent>
          {publicaciones && publicaciones.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-1">
              {publicaciones.map((pub) => (
                <div key={pub.id_taxon_publicacion} className="flex items-center justify-between">
                  <span>{pub.publicacion?.titulo || "Título no disponible"}</span>
                  <span className="text-muted-foreground text-sm">
                    {pub.publicacion?.cita_corta || "Cita corta no disponible"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No hay publicaciones disponibles</p>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Historial de la ficha</CardTitle>
          <CardContent>
            {fichaEspecie.historial ? (
              <span className="text-muted-foreground">{fichaEspecie.historial}</span>
            ) : (
              <p className="text-muted-foreground">No disponible</p>
            )}
          </CardContent>
        </CardHeader>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Fecha Actualizacion</CardTitle>
          <CardContent>
            {fichaEspecie.fecha_actualizacion ? (
              <span className="text-muted-foreground">{fichaEspecie.fecha_actualizacion}</span>
            ) : (
              <p className="text-muted-foreground">No disponible</p>
            )}
          </CardContent>
        </CardHeader>
      </Card>
    </main>
  );
}
