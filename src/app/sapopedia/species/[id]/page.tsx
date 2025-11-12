import Link from "next/link";
import {notFound} from "next/navigation";

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";

import getFichaEspecie from "./get-ficha-especie";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function SpeciesPage({params}: PageProps) {
  const {id} = await params;

  const fichaEspecie = await getFichaEspecie(Number(id));

  if (!fichaEspecie) {
    notFound();
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header de la especie */}
      <div className="mb-8 text-center">
        <h1 className="text-primary mb-2 text-4xl font-bold">
          {fichaEspecie.taxones[0].nombre_comun}
        </h1>
        <p className="text-muted-foreground mb-4 text-2xl italic">
          {fichaEspecie.taxones[0]?.taxonPadre?.taxon} {fichaEspecie.taxones[0]?.taxon}
        </p>

        <div className="mb-4 flex justify-center gap-2">
          {true && <Badge variant="outline">TODO Endémica de Ecuador</Badge>}
          {true && <Badge variant="outline">TODO</Badge>}
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
            {fichaEspecie.taxon_catalogo_awe_results.map((categoria) => (
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
            {fichaEspecie.dataRegionBio.map((region) => (
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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-1">
            {fichaEspecie.geoPolitica?.map((region) => (
              <div key={region.rank_geopolitica_id} className="flex items-center justify-between">
                <span>{region.rank_nombre}</span>
                <span className="text-muted-foreground text-sm">{region.nombre}</span>
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
          {fichaEspecie.publicaciones && fichaEspecie.publicaciones.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-1">
              {fichaEspecie.publicaciones.map((pub) => (
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
