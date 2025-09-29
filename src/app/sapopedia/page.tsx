import Link from "next/link";

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {mockTaxonomy} from "@/lib/mock-taxonomy";

export default function SapopediaPage() {
  const orders = mockTaxonomy.getOrders();

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-primary mb-4 text-4xl font-bold">SapoPedia Ecuador</h1>
        <p className="text-muted-foreground mx-auto max-w-3xl text-lg">
          Enciclopedia electrónica de anfibios de Ecuador. Explora la increíble diversidad de ranas,
          sapos, salamandras y cecilias que habitan en nuestro país.
        </p>
      </div>

      {/* Navegación rápida */}
      <div className="mb-8">
        <h2 className="mb-6 text-2xl font-bold">Explorar por Orden</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {orders.map((order) => (
            <Link key={order.id} href={`/sapopedia/order/${order.id}`}>
              <Card className="cursor-pointer transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">{order.name}</CardTitle>
                  <p className="text-muted-foreground text-sm italic">{order.scientific_name}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">{order.description}</span>
                    <Badge variant="outline">
                      {mockTaxonomy.getFamiliesByOrder(order.id).length} familias
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Especies destacadas */}
      {/* <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2"> */}
      {/* Especies endémicas */}
      {/* <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">🏔️ Especies Endémicas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4 text-sm">
              Especies que solo se encuentran en Ecuador
            </p>
            <div className="space-y-2">
              {endemicSpecies.map((specie) => (
                <div
                  key={specie.id}
                  className="flex items-center justify-between rounded bg-green-50 p-2"
                >
                  <div>
                    <p className="text-sm font-medium">{specie.common_name}</p>
                    <p className="text-muted-foreground text-xs italic">{specie.scientific_name}</p>
                  </div>
                  <Link href={`/sapopedia/species/${specie.id}`}>
                    <Button size="sm" variant="outline">
                      Ver
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/sapopedia/endemic">
                <Button className="w-full" variant="outline">
                  Ver todas las especies endémicas
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card> */}

      {/* Especies en peligro */}
      {/* <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">⚠️ Especies en Peligro</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4 text-sm">
              Especies con categorías de riesgo de extinción
            </p>
            <div className="space-y-2">
              {endangeredSpecies.map((specie) => (
                <div
                  key={specie.id}
                  className="flex items-center justify-between rounded bg-red-50 p-2"
                >
                  <div>
                    <p className="text-sm font-medium">{specie.common_name}</p>
                    <p className="text-muted-foreground text-xs italic">{specie.scientific_name}</p>
                    <Badge className="mt-1 text-xs" variant="destructive">
                      {specie.conservation_status}
                    </Badge>
                  </div>
                  <Link href={`/sapopedia/species/${specie.id}`}>
                    <Button size="sm" variant="outline">
                      Ver
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/sapopedia/endangered">
                <Button className="w-full" variant="outline">
                  Ver todas las especies en peligro
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card> */}
      {/* </div> */}

      {/* Información adicional */}
      {/* <Card>
          <CardHeader>
            <CardTitle>Acerca de SapoPedia Ecuador</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Esta enciclopedia electrónica es una iniciativa del Centro Jambatu para documentar y
              difundir el conocimiento sobre la diversidad de anfibios de Ecuador.
            </p>
            <p className="text-muted-foreground text-sm">
              Los datos presentados aquí provienen de investigaciones científicas, colecciones
              museológicas y observaciones de la comunidad científica y ciudadana.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Centro Jambatu</Badge>
              <Badge variant="outline">Fundación Otonga</Badge>
              <Badge variant="outline">Ciencia Ciudadana</Badge>
              <Badge variant="outline">Conservación</Badge>
            </div>
          </CardContent>
        </Card> */}
    </main>
  );
}
