import {AmphibianStats} from "@/components/amphibian-stats";
import {AmphibianOrders} from "@/components/amphibian-orders";
import {AmphibianHighlights} from "@/components/amphibian-highlights";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {amphibianService} from "@/lib/supabase-existing";

export default async function HomePage() {
  // Obtener datos de Supabase
  const [statistics, orders] = await Promise.all([
    amphibianService.getStatistics(),
    amphibianService.getOrders(),
  ]);

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-primary mb-4 text-4xl font-bold">Anfibios de Ecuador</h1>
        <p className="text-muted-foreground mx-auto max-w-3xl text-lg">
          Ecuador ocupa el cuarto lugar en el mundo con la mayor diversidad de anfibios (690
          especies, 353 endémicas), después de Brasil, Colombia y Perú.
        </p>
      </div>

      {/* Estadísticas */}
      <AmphibianStats
        dataInsufficient={statistics.data_insufficient}
        endangeredSpecies={statistics.endangered_species}
        endemicSpecies={statistics.endemic_species}
        extinctSpecies={statistics.extinct_species}
        totalSpecies={statistics.total_species}
      />

      {/* Destacados */}
      <AmphibianHighlights />

      {/* Órdenes de Anfibios */}
      <div className="mb-8">
        <h2 className="mb-6 text-center text-2xl font-bold">Órdenes de Anfibios</h2>
        <AmphibianOrders orders={orders} />
      </div>

      {/* Información adicional */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl">Sobre esta Enciclopedia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Esta publicación de Anfibios de Ecuador compila y provee una síntesis de la información
            disponible de cada una de las especies, al igual que material no publicado previamente
            (nombres comunes, fotografías, mapas, etc.).
          </p>
          <p className="text-muted-foreground text-sm">
            Las fichas que contienen sumarios de especies son continuamente actualizados por varios
            compiladores y editores e irán apareciendo en la página web cuando estén completos.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">690 especies</Badge>
            <Badge variant="outline">79 géneros</Badge>
            <Badge variant="outline">19 familias</Badge>
            <Badge variant="success">353 endémicas</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Última actualización */}
      <div className="text-muted-foreground text-center text-sm">
        <p>Última actualización: {new Date(statistics.last_updated).toLocaleDateString("es-ES")}</p>
      </div>
    </main>
  );
}
