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

export default async function GenusPage({params}: PageProps) {
  const {id} = await params;
  const genus = mockTaxonomy.getGenusById(id);

  if (!genus) {
    notFound();
  }

  const family = mockTaxonomy.getFamilyById(genus.familyId);
  const species = mockTaxonomy.getSpeciesByGenus(genus.id);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-primary mb-2 text-4xl font-bold">{genus.name}</h1>
        <p className="text-muted-foreground mb-4 text-lg italic">{genus.scientific_name}</p>
        {family && <Badge variant="outline">Familia: {family.name}</Badge>}
      </div>

      <div className="mb-6">
        {family ? (
          <Link href={`/sapopedia/family/${family.id}`}>
            <Button variant="outline">← Volver a la familia</Button>
          </Link>
        ) : (
          <Link href="/sapopedia">
            <Button variant="outline">← Volver</Button>
          </Link>
        )}
      </div>

      <div className="mb-8">
        <h2 className="mb-6 text-2xl font-bold">Especies en {genus.name}</h2>
        {species.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {species.map((sp) => (
              <Link key={sp.id} href={`/sapopedia/species/${sp.id}`}>
                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {sp.common_name || sp.scientific_name}
                    </CardTitle>
                    <p className="text-muted-foreground text-sm italic">{sp.scientific_name}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      {sp.conservation_status && (
                        <Badge variant="outline">{sp.conservation_status}</Badge>
                      )}
                      {sp.endemic && <Badge variant="outline">Endémica</Badge>}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No hay especies disponibles para este género.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
