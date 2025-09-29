import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {notFound} from "next/navigation";
import {mockTaxonomy} from "@/lib/mock-taxonomy";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function SpeciesPage({params}: PageProps) {
  const {id} = await params;
  const sp = mockTaxonomy.getSpeciesById(id);
  if (!sp) {
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

  // No se requiere extraer año desde autorano en mock

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header de la especie */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">{sp.common_name || sp.scientific_name}</h1>
        <p className="text-2xl text-muted-foreground italic mb-4">{sp.scientific_name}</p>

        <div className="flex justify-center gap-2 mb-4">
          {sp.endemic && (
            <Badge variant="success">Endémica de Ecuador</Badge>
          )}
          {sp.conservation_status && (
            <Badge variant="outline">{getConservationStatusText(sp.conservation_status)}</Badge>
          )}
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
              <p className="text-muted-foreground italic">{sp.scientific_name}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Nombre Común</h4>
              <p className="text-muted-foreground">{sp.common_name || 'No disponible'}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Año de descripción</h4>
              <p className="text-muted-foreground">{sp.discovery_year ?? 'No disponible'}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Distribución</h4>
              <p className="text-muted-foreground">{sp.distribution || 'No disponible'}</p>
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
            {sp.conservation_status && (
              <>
                <Badge variant="success">{getConservationStatusText(sp.conservation_status)}</Badge>
                <span className="text-sm text-muted-foreground">Categoría UICN: {sp.conservation_status}</span>
              </>
            )}
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
                {'Sí'}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Endémica</h4>
              <p className="text-sm text-muted-foreground">
                {sp.endemic ? 'Sí' : 'No'}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Sinónimo</h4>
              <p className="text-sm text-muted-foreground">
                {'No'}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Nombre Aceptado</h4>
              <p className="text-sm text-muted-foreground">
                {'Sí'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
