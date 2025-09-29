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

export default async function FamilyPage({params}: PageProps) {
  const {id} = await params;
  const family = mockTaxonomy.getFamilyById(id);

  if (!family) {
    notFound();
  }

  const order = mockTaxonomy.getOrderById(family.orderId);
  const genera = mockTaxonomy.getGeneraByFamily(family.id);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-primary mb-2 text-4xl font-bold">{family.name}</h1>
        <p className="text-muted-foreground mb-4 text-lg italic">{family.scientific_name}</p>
        {order && <Badge variant="outline">Orden: {order.name}</Badge>}
      </div>

      <div className="mb-6">
        <Link href={`/sapopedia/order/${family.orderId}`}>
          <Button variant="outline">← Volver al orden</Button>
        </Link>
      </div>

      <div className="mb-8">
        <h2 className="mb-6 text-2xl font-bold">Géneros en {family.name}</h2>
        {genera.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {genera.map((genus) => (
              <Link key={genus.id} href={`/sapopedia/genus/${genus.id}`}>
                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">{genus.name}</CardTitle>
                    <p className="text-muted-foreground text-sm italic">{genus.scientific_name}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Género de {family.name}</span>
                      <Badge variant="outline">
                        {mockTaxonomy.getSpeciesByGenus(genus.id).length} especies
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
              <p className="text-muted-foreground">No hay géneros disponibles para esta familia.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
