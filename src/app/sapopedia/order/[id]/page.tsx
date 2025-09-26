import Link from "next/link";
import {notFound} from "next/navigation";

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {amphibianService} from "@/lib/supabase-existing";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function OrderPage({params}: PageProps) {
  const {id} = params;

  // Obtener información del orden
  const orders = await amphibianService.getOrders();
  const order = orders.find((o) => o.id === id);

  if (!order) {
    notFound();
  }

  // Obtener especies del orden
  const species = await amphibianService.getSpeciesByOrder(id, 20);

  const getOrderIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "anura":
        return "🐸";
      case "caudata":
        return "🦎";
      case "gymnophiona":
        return "🐍";
      default:
        return "🐸";
    }
  };

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

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header del orden */}
      <div className="mb-8 text-center">
        <div className="mb-4 text-6xl">{getOrderIcon(order.name)}</div>
        <h1 className="text-primary mb-2 text-4xl font-bold">{order.name}</h1>
        <p className="text-muted-foreground mb-4 text-lg italic">{order.scientific_name}</p>
        <p className="text-muted-foreground mx-auto mb-4 max-w-2xl text-sm">{order.description}</p>
        <Badge className="px-4 py-2 text-lg" variant="outline">
          {order.species_count} especies
        </Badge>
      </div>

      {/* Navegación */}
      <div className="mb-6">
        <Link href="/">
          <Button variant="outline">← Volver al inicio</Button>
        </Link>
      </div>

      {/* Lista de especies */}
      <div className="mb-8">
        <h2 className="mb-6 text-2xl font-bold">Especies de {order.name}</h2>

        {species.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {species.map((specie) => (
              <Card key={specie.id} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{specie.common_name}</CardTitle>
                      <p className="text-muted-foreground text-sm italic">
                        {specie.scientific_name}
                      </p>
                    </div>
                    {specie.endemic && (
                      <Badge className="text-xs" variant="success">
                        Endémica
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {specie.conservation_status && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs">Estado:</span>
                        <Badge
                          className="text-xs"
                          variant={getConservationBadgeVariant(specie.conservation_status)}
                        >
                          {specie.conservation_status}
                        </Badge>
                      </div>
                    )}

                    {specie.discovery_year && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs">Descubierta:</span>
                        <span className="text-xs font-medium">{specie.discovery_year}</span>
                      </div>
                    )}

                    {specie.distribution && (
                      <div>
                        <span className="text-muted-foreground text-xs">Distribución:</span>
                        <p className="mt-1 text-xs">{specie.distribution}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <Link href={`/sapopedia/species/${specie.id}`}>
                      <Button className="w-full" size="sm" variant="outline">
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
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No hay especies disponibles para este orden.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
