import Link from "next/link";
import {notFound} from "next/navigation";

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {mockTaxonomy} from "@/lib/mock-taxonomy";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function OrderPage({params}: PageProps) {
  const {id} = await params;

  // Obtener información del orden (mock)
  const order = mockTaxonomy.getOrderById(id);

  if (!order) {
    notFound();
  }

  // Familias del orden (mock)
  const families = mockTaxonomy.getFamiliesByOrder(id);

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

  // No se requieren badges de conservación a nivel de familia

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header del orden */}
      <div className="mb-8 text-center">
        <div className="mb-4 text-6xl">{getOrderIcon(order.name)}</div>
        <h1 className="text-primary mb-2 text-4xl font-bold">{order.name}</h1>
        <p className="text-muted-foreground mb-4 text-lg italic">{order.scientific_name}</p>
        <p className="text-muted-foreground mx-auto mb-4 max-w-2xl text-sm">{order.description}</p>
        <Badge className="px-4 py-2 text-lg" variant="outline">
          {families.length} familias
        </Badge>
      </div>

      {/* Navegación */}
      <div className="mb-6">
        <Link href="/">
          <Button variant="outline">← Volver al inicio</Button>
        </Link>
      </div>

      {/* Lista de familias */}
      <div className="mb-8">
        <h2 className="mb-6 text-2xl font-bold">Familias de {order.name}</h2>

        {families.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {families.map((family) => (
              <Link key={family.id} href={`/sapopedia/family/${family.id}`}>
                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">{family.name}</CardTitle>
                    <p className="text-muted-foreground text-sm italic">{family.scientific_name}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">
                        {family.description || "Familia de anfibios"}
                      </span>
                      <Badge variant="outline">
                        {mockTaxonomy.getGeneraByFamily(family.id).length} géneros
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No hay familias disponibles para este orden.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
