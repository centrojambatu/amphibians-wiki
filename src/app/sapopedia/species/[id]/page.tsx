import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function SpeciesPage({ params }: PageProps) {
  const { id } = await params;

  // Obtener información de la especie desde las tablas existentes
  const supabase = await createClient();
  const { data: specie, error } = await supabase
    .from('taxon')
    .select('*')
    .eq('idtaxon', parseInt(id))
    .eq('enecuador', true)
    .eq('rank_idrank', 7) // especie
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

  const extractYear = (autorano: string | null): number | null => {
    if (!autorano) return null;
    const match = /\d{4}/.exec(autorano);
    return match ? parseInt(match[0]) : null;
  };

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header de la especie */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">
          {specie.nombrecomun || specie.taxon}
        </h1>
        <p className="text-2xl text-muted-foreground italic mb-4">
          {specie.taxon}
        </p>

        <div className="flex justify-center gap-2 mb-4">
          {specie.endemica && (
            <Badge variant="success">Endémica de Ecuador</Badge>
          )}
          <Badge variant="outline">Preocupación Menor</Badge>
        </div>
      </div>

      {/* Navegación */}
      <div className="mb-6">
        <Link href="/sapopedia">
          <Button variant="outline">
            ← Volver a SapoPedia
          </Button>
        </Link>
      </div>

      {/* Información básica */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Información Básica</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Nombre Científico</h4>
              <p className="text-muted-foreground italic">{specie.taxon}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Nombre Común</h4>
              <p className="text-muted-foreground">{specie.nombrecomun || 'No disponible'}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Autor y Año</h4>
              <p className="text-muted-foreground">{specie.autorano || 'No disponible'}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Publicación</h4>
              <p className="text-muted-foreground">{specie.publicacion || 'No disponible'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estado de conservación */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Estado de Conservación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Badge variant="success">
              Preocupación Menor
            </Badge>
            <span className="text-sm text-muted-foreground">
              Categoría UICN: LC
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Información adicional */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Información Adicional</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold mb-1">En Ecuador</h4>
              <p className="text-sm text-muted-foreground">
                {specie.enecuador ? 'Sí' : 'No'}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Endémica</h4>
              <p className="text-sm text-muted-foreground">
                {specie.endemica ? 'Sí' : 'No'}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Sinónimo</h4>
              <p className="text-sm text-muted-foreground">
                {specie.sinonimo ? 'Sí' : 'No'}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Nombre Aceptado</h4>
              <p className="text-sm text-muted-foreground">
                {specie.nombreaceptado ? 'Sí' : 'No'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
