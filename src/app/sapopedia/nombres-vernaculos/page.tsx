import VernaculosSection from "../nombres/VernaculosSection";
import getNombresVernaculos from "../nombres/get-nombres-vernaculos";

// Mapa de idiomas disponibles para nombres vernáculos
const IDIOMAS_VERNACULOS = [
  {id: 2, nombre: "Kichwa", codigo: "QU"},
  {id: 3, nombre: "Quechua", codigo: "QU"},
  {id: 5, nombre: "Shuar", codigo: "SH"},
  {id: 542, nombre: "Swiwiar chicham", codigo: "SW"},
  {id: 543, nombre: "Tsáfiqui", codigo: "TS"},
  {id: 544, nombre: "Wao Terero", codigo: "WA"},
  {id: 13, nombre: "Desconocido", codigo: "UN"},
] as const;

interface NombresVernaculosPageProps {
  readonly searchParams: Promise<{idiomaVernaculo?: string}>;
}

export default async function NombresVernaculosPage({searchParams}: NombresVernaculosPageProps) {
  // Esperar searchParams antes de usarlo (requerido en Next.js 15)
  const params = await searchParams;

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

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-primary mb-4 text-4xl font-bold">Nombres indígenas y vernáculos</h1>
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
