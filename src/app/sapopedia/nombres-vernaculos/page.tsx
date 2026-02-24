import { ExternalLink } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import VernaculosSection from "../nombres/VernaculosSection";
import getNombresVernaculos, {getIdiomasVernaculos} from "../nombres/get-nombres-vernaculos";

interface NombresVernaculosPageProps {
  readonly searchParams: Promise<{ idiomaVernaculo?: string }>;
}

export default async function NombresVernaculosPage({ searchParams }: NombresVernaculosPageProps) {
  // Esperar searchParams antes de usarlo (requerido en Next.js 15)
  const params = await searchParams;

  // Obtener idiomas disponibles dinámicamente desde la base de datos
  const IDIOMAS_VERNACULOS = await getIdiomasVernaculos();

  // Obtener idioma vernáculo de los parámetros
  // Por defecto siempre es null (Todos los idiomas)
  const idiomaVernaculoId = params.idiomaVernaculo
    ? Number.parseInt(params.idiomaVernaculo, 10)
    : undefined;

  // Obtener TODOS los nombres vernáculos (sin filtrar por idioma) para filtrar en el cliente
  // Esto es más rápido que hacer consultas separadas por cada cambio de idioma
  const todosLosNombresVernaculos = await getNombresVernaculos();
  // Por defecto siempre mostrar todos los idiomas (null)
  const idiomaVernaculoInicial = idiomaVernaculoId ?? null;

  const totalNombres = todosLosNombresVernaculos.length;
  // Obtener IDs de idiomas conocidos (excluyendo Desconocido si existe)
  const idsIdiomasConocidosSinDesconocido = IDIOMAS_VERNACULOS.filter(
    (i) => i.nombre.toLowerCase() !== "desconocido",
  ).map((i) => i.id);
  const totalIdiomas = new Set(
    todosLosNombresVernaculos
      .map((n) => n.catalogo_awe_idioma_id)
      .filter((id) => id && idsIdiomasConocidosSinDesconocido.includes(id)),
  ).size;

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-primary mb-4 text-4xl font-bold">Nombres indígenas</h1>
        <div className="mx-auto mt-6 flex flex-nowrap justify-center gap-2 overflow-x-auto sm:gap-4">
          <Card className="min-w-0 flex-1 flex-shrink-0 transition-shadow hover:shadow-md">
            <CardContent>
              <div className="mt-3 flex flex-col gap-1.5 items-start">
                <a
                  href="https://deepskyblue-beaver-511675.hostingersite.com/nombres-indigenas-vernaculos/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary hover:no-underline"
                >
                  Nombres indígenas y vernáculos
                </a>
              </div>
            </CardContent>
          </Card>
          <Card className="min-w-0 flex-1 flex-shrink-0 transition-shadow">
            <CardContent>
              <p className="flex items-baseline gap-2">
                <span className="text-3xl font-bold sm:text-4xl">{totalNombres.toLocaleString()}</span>
                <span className="text-muted-foreground text-xs sm:text-sm">Nombres</span>
              </p>
            </CardContent>
          </Card>
          <Card className="min-w-0 flex-1 flex-shrink-0 transition-shadow">
            <CardContent>
              <p className="flex items-baseline gap-2">
                <span className="text-3xl font-bold sm:text-4xl">{totalIdiomas.toLocaleString()}</span>
                <span className="text-muted-foreground text-xs sm:text-sm">Idiomas</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contenido */}
      <VernaculosSection
        idiomas={IDIOMAS_VERNACULOS}
        nombresIniciales={todosLosNombresVernaculos}
        idiomaInicial={idiomaVernaculoInicial}
      />
    </main>
  );
}
