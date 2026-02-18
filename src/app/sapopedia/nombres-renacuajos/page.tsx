import RenacuajosSection from "./RenacuajosSection";
import getNombresRenacuajos from "./get-nombres-renacuajos";

// Mapa de idiomas disponibles para nombres de renacuajos
const IDIOMAS_RENACUAJOS = [
  {id: 1, nombre: "Español", codigo: "ES"},
  {id: 18, nombre: "Cofán", codigo: "CF"},
  {id: 542, nombre: "Swiwiar chicham", codigo: "SW"},
  {id: 543, nombre: "Tsáfiqui", codigo: "TS"},
  {id: 552, nombre: "Kichwa Amazónico", codigo: "KA"},
  {id: 553, nombre: "Kichwa Amazónico (Quijos)", codigo: "KQ"},
  {id: 554, nombre: "Kichwa Sierra", codigo: "KS"},
  {id: 555, nombre: "Palta", codigo: "PA"},
  {id: 13, nombre: "Desconocido", codigo: "UN"},
] as const;

interface RenacuajosPageProps {
  readonly searchParams: Promise<{idioma?: string}>;
}

export default async function RenacuajosPage({searchParams}: RenacuajosPageProps) {
  // Esperar searchParams antes de usarlo (requerido en Next.js 15)
  const params = await searchParams;

  // Obtener idioma de los parámetros de búsqueda, por defecto null (todos)
  const idiomaId = params.idioma ? Number.parseInt(params.idioma, 10) : null;

  // Validar que el idioma existe si se proporciona
  const idiomaValido = idiomaId
    ? IDIOMAS_RENACUAJOS.find((i) => i.id === idiomaId) || null
    : null;
  const idiomaIdFinal = idiomaValido?.id || null;

  // Obtener todos los nombres de renacuajos (sin filtrar por idioma inicialmente)
  // para permitir filtrado en el cliente
  const todosLosNombresRenacuajos = await getNombresRenacuajos();

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
