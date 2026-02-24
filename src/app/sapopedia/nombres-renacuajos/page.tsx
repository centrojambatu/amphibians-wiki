import { Card, CardContent } from "@/components/ui/card";
import RenacuajosSection from "./RenacuajosSection";
import getNombresRenacuajos, { getIdiomasRenacuajos } from "./get-nombres-renacuajos";

interface RenacuajosPageProps {
  readonly searchParams: Promise<{ idioma?: string }>;
}

export default async function RenacuajosPage({ searchParams }: RenacuajosPageProps) {
  const params = await searchParams;

  // Idiomas disponibles dinámicamente desde la base de datos
  const IDIOMAS_RENACUAJOS = await getIdiomasRenacuajos();

  const idiomaId = params.idioma ? Number.parseInt(params.idioma, 10) : null;
  const idiomaValido = idiomaId
    ? IDIOMAS_RENACUAJOS.find((i) => i.id === idiomaId) || null
    : null;
  const idiomaIdFinal = idiomaValido?.id ?? null;

  const todosLosNombresRenacuajos = await getNombresRenacuajos();

  const totalNombres = todosLosNombresRenacuajos.length;
  const idsIdiomasConocidosSinDesconocido = IDIOMAS_RENACUAJOS.filter(
    (i) => i.nombre.toLowerCase() !== "desconocido",
  ).map((i) => i.id);
  const totalIdiomas = new Set(
    todosLosNombresRenacuajos
      .map((n) => n.catalogo_awe_idioma_id)
      .filter((id) => id && idsIdiomasConocidosSinDesconocido.includes(id)),
  ).size;

  // Debug: verificar que hay datos
  if (todosLosNombresRenacuajos.length === 0) {
    // eslint-disable-next-line no-console
    console.warn("⚠️ No se encontraron nombres de renacuajos");
  } else {
    // eslint-disable-next-line no-console
    console.log(`✅ Se encontraron ${String(todosLosNombresRenacuajos.length)} nombres de renacuajos`);
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-primary mb-4 text-4xl font-bold">Nombres de renacuajos</h1>
        <div className="mx-auto mt-6 flex flex-nowrap justify-center gap-2 overflow-x-auto sm:gap-4">
          <Card className="min-w-0 flex-1 flex-shrink-0 transition-shadow hover:shadow-md">
            <CardContent>
              <div className="mt-3 flex flex-col gap-1.5 items-start">
                <a
                  href="https://deepskyblue-beaver-511675.hostingersite.com/renacuajos/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary hover:no-underline"
                >
                  Nombres de renacuajos
                </a>
              </div>
            </CardContent>
          </Card>
          <Card className="min-w-0 flex-1 flex-shrink-0 transition-shadow hover:shadow-md">
            <CardContent>
              <div className="mt-3 flex flex-col gap-1.5 items-start">
                <a
                  href="https://deepskyblue-beaver-511675.hostingersite.com/wp-content/uploads/2026/02/Mapa-Nombres-renacuajos-scaled.jpg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary hover:no-underline"
                >
                  Mapa
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

      {/* Contenido con filtros y lista */}
      <RenacuajosSection
        idiomas={IDIOMAS_RENACUAJOS}
        nombresIniciales={todosLosNombresRenacuajos}
        idiomaInicial={idiomaIdFinal}
      />
    </main>
  );
}
