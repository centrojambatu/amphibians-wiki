import Link from "next/link";

import NombresContent from "./NombresContent";
import getTaxonNombres from "./get-taxon-nombres";
import {
  getNombresCompartidosPorFamilia,
  getNombresCompartidosPorGenero,
} from "./get-nombres-compartidos";

// Mapa de idiomas disponibles para nombres comunes
const IDIOMAS = [
  { id: 1, nombre: "Español", codigo: "ES" },
  { id: 8, nombre: "Inglés", codigo: "EN" },
  { id: 9, nombre: "Alemán", codigo: "DE" },
  { id: 10, nombre: "Francés", codigo: "FR" },
  { id: 11, nombre: "Portugués", codigo: "PT" },
  { id: 545, nombre: "Chino Mandarín", codigo: "ZH" },
  { id: 546, nombre: "Italiano", codigo: "IT" },
  { id: 547, nombre: "Hindú", codigo: "HI" },
  { id: 548, nombre: "Árabe", codigo: "AR" },
  { id: 549, nombre: "Ruso", codigo: "RU" },
  { id: 550, nombre: "Japonés", codigo: "JA" },
  { id: 551, nombre: "Holandés", codigo: "NL" },
] as const;

interface NombresPageProps {
  readonly searchParams: Promise<{ idioma?: string }>;
}

export default async function NombresPage({ searchParams }: NombresPageProps) {
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
  } else {
    // eslint-disable-next-line no-console
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
      <div className="mb-8">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">Nombres</h1>
      </div>

      {/* Estadísticas */}
      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="flex flex-col justify-center rounded-md border p-2" style={{ borderColor: "#dddddd" }}>
          <a
            href="https://darkgray-kangaroo-476720.hostingersite.com/nombres-estandarizados/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-900"
            style={{ fontSize: "15px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif', fontWeight: "500" }}
          >
            Nombres estandarizados
          </a>
        </div>

        <div className="flex flex-col justify-center rounded-md border p-2" style={{ borderColor: "#dddddd" }}>
          <Link
            className="hover:text-gray-900"
            href="/sapopedia/nombres-vernaculos"
            style={{ fontSize: "15px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif', fontWeight: "500" }}
          >
            Nombres indígenas y vernáculos
          </Link>
          <a
            className="hover:text-gray-900"
            href="https://darkgray-kangaroo-476720.hostingersite.com/jambatu/"
            rel="noopener noreferrer"
            style={{ fontSize: "15px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif', fontWeight: "500" }}
            target="_blank"
          >
            Jambatu
          </a>
        </div>

        <div className="flex flex-col justify-center rounded-md border p-2" style={{ borderColor: "#dddddd" }}>
          <Link
            className="hover:text-gray-900"
            href="/sapopedia/nombres-renacuajos"
            style={{ fontSize: "15px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif', fontWeight: "500" }}
          >
            Nombres renacuajos
          </Link>
        </div>

        <div className="flex flex-col justify-center rounded-md border p-2" style={{ borderColor: "#dddddd" }}>
          <a
            className="hover:text-gray-900"
            href="https://darkgray-kangaroo-476720.hostingersite.com/rana-sapo/"
            rel="noopener noreferrer"
            style={{ fontSize: "15px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif', fontWeight: "500" }}
            target="_blank"
          >
            Rana o sapo
          </a>
        </div>
      </div>

      {/* Subtítulo: Nombres estándar | 12 idiomas */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Nombres estándar{" "}
          <span style={{color: "#f07304", fontWeight: 400, letterSpacing: "-0.1em"}}>|</span>{" "}
          <span className="text-base" style={{color: "#a3ac9e"}}>
            12 idiomas
          </span>
        </h2>
      </div>

      {/* Contenido con filtros y acordeón */}
      <div className="mb-8">
        <NombresContent
          ordenes={ordenes}
          idiomas={IDIOMAS}
          idiomaActual={idiomaIdFinal}
        />
      </div>
    </main>
  );
}
