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

export default async function SpeciesPage({params}: PageProps) {
  const {id} = await params;
  const sp = mockTaxonomy.getSpeciesById(id);

  if (!sp) {
    notFound();
  }

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

  const getConservationStatusText = (status: string) => {
    switch (status) {
      case "CR":
        return "En Peligro Crítico";
      case "EN":
        return "En Peligro";
      case "VU":
        return "Vulnerable";
      case "NT":
        return "Casi Amenazada";
      case "LC":
        return "Preocupación Menor";
      default:
        return status;
    }
  };

  // No se requiere extraer año desde autorano en mock

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header de la especie */}
      <div className="mb-8 text-center">
        <h1 className="text-primary mb-2 text-4xl font-bold">
          {sp.common_name || sp.scientific_name}
        </h1>
        <p className="text-muted-foreground mb-4 text-2xl italic">{sp.scientific_name}</p>

        <div className="mb-4 flex justify-center gap-2">
          {sp.endemic && <Badge variant="outline">Endémica de Ecuador</Badge>}
          {sp.conservation_status && (
            <Badge variant="outline">{getConservationStatusText(sp.conservation_status)}</Badge>
          )}
        </div>
      </div>

      {/* Navegación */}
      <div className="mb-6">
        <Link href="/sapopedia">
          <Button variant="outline">← Volver a SapoPedia</Button>
        </Link>
      </div>

      {/* Información básica */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Información Básica</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h4 className="mb-2 font-semibold">Nombre Científico</h4>
              <p className="text-muted-foreground italic">{sp.scientific_name}</p>
            </div>
            <div>
              <h4 className="mb-2 font-semibold">Nombre Común</h4>
              <p className="text-muted-foreground">{sp.common_name || "No disponible"}</p>
            </div>
            <div>
              <h4 className="mb-2 font-semibold">Año de descripción</h4>
              <p className="text-muted-foreground">{sp.discovery_year ?? "No disponible"}</p>
            </div>
            <div>
              <h4 className="mb-2 font-semibold">Distribución</h4>
              <p className="text-muted-foreground">{sp.distribution || "No disponible"}</p>
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
                <Badge variant="outline">{getConservationStatusText(sp.conservation_status)}</Badge>
                <span className="text-muted-foreground text-sm">
                  Categoría UICN: {sp.conservation_status}
                </span>
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
              <h4 className="mb-1 font-semibold">En Ecuador</h4>
              <p className="text-muted-foreground text-sm">Sí</p>
            </div>
            <div>
              <h4 className="mb-1 font-semibold">Endémica</h4>
              <p className="text-muted-foreground text-sm">{sp.endemic ? "Sí" : "No"}</p>
            </div>
            <div>
              <h4 className="mb-1 font-semibold">Sinónimo</h4>
              <p className="text-muted-foreground text-sm">No</p>
            </div>
            <div>
              <h4 className="mb-1 font-semibold">Nombre Aceptado</h4>
              <p className="text-muted-foreground text-sm">Sí</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
