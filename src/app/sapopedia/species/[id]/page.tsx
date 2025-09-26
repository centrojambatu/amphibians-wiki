import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { amphibianService } from "@/lib/supabase";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function SpeciesPage({ params }: PageProps) {
  const { id } = params;

  // Obtener información de la especie
  const supabase = await createClient();
  const { data: specie, error } = await supabase
    .from('amphibian_species')
    .select(`
      *,
      amphibian_genera!inner(
        *,
        amphibian_families!inner(
          *,
          amphibian_orders!inner(*)
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error || !specie) {
    notFound();
  }

  const getConservationBadgeVariant = (status: string) => {
    switch (status) {
      case 'CR':
        return 'destructive';
      case 'EN':
        return 'destructive';
      case 'VU':
        return 'warning';
      case 'NT':
        return 'info';
      case 'LC':
        return 'success';
      default:
        return 'outline';
    }
  };

  const getConservationStatusText = (status: string) => {
    switch (status) {
      case 'CR':
        return 'En Peligro Crítico';
      case 'EN':
        return 'En Peligro';
      case 'VU':
        return 'Vulnerable';
      case 'NT':
        return 'Casi Amenazada';
      case 'LC':
        return 'Preocupación Menor';
      default:
        return status;
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header de la especie */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">
          {specie.common_name}
        </h1>
        <p className="text-2xl text-muted-foreground italic mb-4">
          {specie.scientific_name}
        </p>

        <div className="flex justify-center gap-2 mb-4">
          {specie.endemic && (
            <Badge variant="success">Endémica de Ecuador</Badge>
          )}
          {specie.conservation_status && (
            <Badge variant={getConservationBadgeVariant(specie.conservation_status)}>
              {getConservationStatusText(specie.conservation_status)}
            </Badge>
          )}
        </div>
      </div>

      {/* Navegación */}
      <div className="mb-6">
        <Link href={`/sapopedia/order/${specie.amphibian_genera.amphibian_families.amphibian_orders.id}`}>
          <Button variant="outline">
            ← Volver a {specie.amphibian_genera.amphibian_families.amphibian_orders.name}
          </Button>
        </Link>
      </div>

      {/* Información taxonómica */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Clasificación Taxonómica</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Orden</h4>
              <p className="text-muted-foreground">
                {specie.amphibian_genera.amphibian_families.amphibian_orders.name}
                <span className="italic"> ({specie.amphibian_genera.amphibian_families.amphibian_orders.scientific_name})</span>
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Familia</h4>
              <p className="text-muted-foreground">
                {specie.amphibian_genera.amphibian_families.name}
                <span className="italic"> ({specie.amphibian_genera.amphibian_families.scientific_name})</span>
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Género</h4>
              <p className="text-muted-foreground">
                {specie.amphibian_genera.name}
                <span className="italic"> ({specie.amphibian_genera.scientific_name})</span>
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Especie</h4>
              <p className="text-muted-foreground">
                {specie.scientific_name}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información detallada */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Descubrimiento */}
        {(specie.discoverers || specie.discovery_year || specie.first_collectors) && (
          <Card>
            <CardHeader>
              <CardTitle>Descubrimiento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {specie.discoverers && (
                <div>
                  <h4 className="font-semibold mb-1">Descubridores</h4>
                  <p className="text-sm text-muted-foreground">{specie.discoverers}</p>
                </div>
              )}
              {specie.discovery_year && (
                <div>
                  <h4 className="font-semibold mb-1">Año de Descubrimiento</h4>
                  <p className="text-sm text-muted-foreground">{specie.discovery_year}</p>
                </div>
              )}
              {specie.first_collectors && (
                <div>
                  <h4 className="font-semibold mb-1">Primeros Colectores</h4>
                  <p className="text-sm text-muted-foreground">{specie.first_collectors}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Etimología */}
        {specie.etymology && (
          <Card>
            <CardHeader>
              <CardTitle>Etimología</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{specie.etymology}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Distribución y Hábitat */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {specie.distribution && (
          <Card>
            <CardHeader>
              <CardTitle>Distribución</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{specie.distribution}</p>
            </CardContent>
          </Card>
        )}

        {specie.habitat && (
          <Card>
            <CardHeader>
              <CardTitle>Hábitat y Biología</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{specie.habitat}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Conservación */}
      {specie.conservation_status && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Estado de Conservación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Badge variant={getConservationBadgeVariant(specie.conservation_status)}>
                {getConservationStatusText(specie.conservation_status)}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Categoría UICN: {specie.conservation_status}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
