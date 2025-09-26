import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { amphibianService } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function OrderPage({ params }: PageProps) {
  const { id } = params;

  // Obtener información del orden
  const orders = await amphibianService.getOrders();
  const order = orders.find(o => o.id === id);

  if (!order) {
    notFound();
  }

  // Obtener especies del orden
  const species = await amphibianService.getSpeciesByOrder(id, 20);

  const getOrderIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'anura':
        return '🐸';
      case 'caudata':
        return '🦎';
      case 'gymnophiona':
        return '🐍';
      default:
        return '🐸';
    }
  };

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

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header del orden */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">{getOrderIcon(order.name)}</div>
        <h1 className="text-4xl font-bold text-primary mb-2">
          {order.name}
        </h1>
        <p className="text-lg text-muted-foreground italic mb-4">
          {order.scientific_name}
        </p>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto mb-4">
          {order.description}
        </p>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {order.species_count} especies
        </Badge>
      </div>

      {/* Navegación */}
      <div className="mb-6">
        <Link href="/">
          <Button variant="outline">
            ← Volver al inicio
          </Button>
        </Link>
      </div>

      {/* Lista de especies */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">
          Especies de {order.name}
        </h2>

        {species.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {species.map((specie) => (
              <Card key={specie.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {specie.common_name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground italic">
                        {specie.scientific_name}
                      </p>
                    </div>
                    {specie.endemic && (
                      <Badge variant="success" className="text-xs">
                        Endémica
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {specie.conservation_status && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Estado:</span>
                        <Badge
                          variant={getConservationBadgeVariant(specie.conservation_status)}
                          className="text-xs"
                        >
                          {specie.conservation_status}
                        </Badge>
                      </div>
                    )}

                    {specie.discovery_year && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Descubierta:</span>
                        <span className="text-xs font-medium">{specie.discovery_year}</span>
                      </div>
                    )}

                    {specie.distribution && (
                      <div>
                        <span className="text-xs text-muted-foreground">Distribución:</span>
                        <p className="text-xs mt-1">{specie.distribution}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <Link href={`/sapopedia/species/${specie.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        Ver detalles
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                No hay especies disponibles para este orden.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
