import NombresContent from "./NombresContent";
import getTaxonNombres from "./get-taxon-nombres";
import {
  getNombresCompartidosPorFamilia,
  getNombresCompartidosPorGenero,
} from "./get-nombres-compartidos";

// Mapa de idiomas disponibles para nombres comunes
const IDIOMAS = [
  {id: 1, nombre: "Español", codigo: "ES"},
  {id: 8, nombre: "Inglés", codigo: "EN"},
  {id: 9, nombre: "Alemán", codigo: "DE"},
  {id: 10, nombre: "Francés", codigo: "FR"},
  {id: 11, nombre: "Portugués", codigo: "PT"},
  {id: 545, nombre: "Chino Mandarín", codigo: "ZH"},
  {id: 546, nombre: "Italiano", codigo: "IT"},
  {id: 547, nombre: "Hindú", codigo: "HI"},
  {id: 548, nombre: "Árabe", codigo: "AR"},
  {id: 549, nombre: "Ruso", codigo: "RU"},
  {id: 550, nombre: "Japonés", codigo: "JA"},
  {id: 551, nombre: "Holandés", codigo: "NL"},
] as const;

interface NombresPageProps {
  readonly searchParams: Promise<{idioma?: string}>;
}

export default async function NombresPage({searchParams}: NombresPageProps) {
  // Esperar searchParams antes de usarlo (requerido en Next.js 15)
  const params = await searchParams;

  // Obtener idioma de los parámetros de búsqueda, por defecto español (1)
  const idiomaId = params.idioma ? Number.parseInt(params.idioma, 10) : 1;

  // Validar que el idioma existe
  const idiomaValido = IDIOMAS.find((i) => i.id === idiomaId) || IDIOMAS[0];
  const idiomaIdFinal = idiomaValido.id;

  const ordenes = await getTaxonNombres(idiomaIdFinal);

  // Debug: verificar que hay datos
  if (ordenes.length === 0) {
    // eslint-disable-next-line no-console
    console.warn(`⚠️ No se encontraron órdenes para idioma ${String(idiomaIdFinal)}`);
  } else {
    // eslint-disable-next-line no-console
    console.log(`✅ Se encontraron ${String(ordenes.length)} órdenes`);
  }

  // Calcular estadísticas
  const totalNombres = ordenes.reduce(
    (sum, orden) =>
      sum +
      (orden.children?.reduce(
        (s, familia) =>
          s + (familia.children?.reduce((g, genero) => g + genero.nombres.length, 0) || 0),
        0,
      ) || 0),
    0,
  );

  const totalOrdenes = ordenes.length;
  const totalFamilias = ordenes.reduce((sum, orden) => sum + (orden.children?.length || 0), 0);
  const totalGeneros = ordenes.reduce(
    (sum, orden) =>
      sum + (orden.children?.reduce((s, familia) => s + (familia.children?.length || 0), 0) || 0),
    0,
  );

  // Obtener nombres compartidos directamente de la vista (filtrar por idioma seleccionado)
  const nombresPorFamilia = await getNombresCompartidosPorFamilia(idiomaIdFinal);
  const nombresPorGenero = await getNombresCompartidosPorGenero(idiomaIdFinal);

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-primary mb-4 text-4xl font-bold">Nombres comunes estándar</h1>
      </div>

      {/* Estadísticas */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-800">Total de Nombres</h3>
          <p className="text-4xl font-bold">{totalNombres}</p>
          <p className="text-muted-foreground text-sm">Nombres estándar</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-800">Órdenes</h3>
          <p className="text-4xl font-bold">{totalOrdenes}</p>
          <p className="text-muted-foreground text-sm">Órdenes taxonómicos</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-800">Familias</h3>
          <p className="text-4xl font-bold">{totalFamilias}</p>
          <p className="text-muted-foreground text-sm">Familias taxonómicas</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-800">Géneros</h3>
          <p className="text-4xl font-bold">{totalGeneros}</p>
          <p className="text-muted-foreground text-sm">Géneros taxonómicos</p>
        </div>
      </div>

      {/* Contenido con filtros y acordeón */}
      <div className="mb-8">
        <h2 className="mb-6 text-2xl font-bold">Nombres estándar</h2>
        <NombresContent
          ordenes={ordenes}
          idiomas={IDIOMAS}
          idiomaActual={idiomaIdFinal}
          nombresPorFamilia={nombresPorFamilia}
          nombresPorGenero={nombresPorGenero}
        />
      </div>
    </main>
  );
}
