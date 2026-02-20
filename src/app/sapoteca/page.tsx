import getPublicacionesPaginadas, {
  getAñosPublicaciones,
} from "./get-publicaciones-paginadas";
import getTiposPublicacion from "./get-tipos-publicacion";
import ReferenciaCard from "@/components/referencia-card";
import Pagination from "@/components/pagination";
import SapotecaFiltersPanel from "@/components/sapoteca-filters-panel";
import type { FiltrosSapoteca } from "./get-publicaciones-paginadas";

interface SearchParams {
  pagina?: string;
  titulo?: string;
  años?: string;
  autor?: string;
  tipos?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function SapotecaPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const pagina = params.pagina ? Number.parseInt(params.pagina, 10) : 1;
  const itemsPorPagina = 20;

  // Construir filtros desde searchParams
  const filtros: FiltrosSapoteca = {
    titulo: params.titulo || undefined,
    años: params.años
      ? params.años.split(",").map(Number).filter((n) => !isNaN(n))
      : undefined,
    autor: params.autor || undefined,
    tiposPublicacion: params.tipos
      ? params.tipos.split(",").map(Number).filter((n) => !isNaN(n))
      : undefined,
  };

  // Obtener datos en paralelo
  const [publicacionesData, años, tiposPublicacion] = await Promise.all([
    getPublicacionesPaginadas(pagina, itemsPorPagina, filtros),
    getAñosPublicaciones(),
    getTiposPublicacion(),
  ]);

  const { publicaciones, total, totalPaginas } = publicacionesData;

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold">Biblioteca</h1>
      </div>

        {/* Layout con panel de filtros y contenido */}
        <div className="flex gap-6">
          {/* Panel de filtros - lado izquierdo */}
          <div className="w-80 flex-shrink-0">
            <SapotecaFiltersPanel tiposPublicacion={tiposPublicacion} años={años} />
          </div>

          {/* Contenido principal */}
          <div className="min-w-0 flex-1">
            {/* Información de resultados */}
            <div className="mb-6 text-sm text-muted-foreground">
              Mostrando {publicaciones.length} de {total} referencias
              {totalPaginas > 1 && ` (Página ${pagina} de ${totalPaginas})`}
            </div>

            {/* Lista de referencias */}
            {publicaciones.length > 0 ? (
              <div className="mb-8 space-y-4">
                {publicaciones.map((publicacion) => (
                  <ReferenciaCard
                    key={publicacion.id_publicacion}
                    publicacion={publicacion}
                  />
                ))}
              </div>
            ) : (
              <div className="mb-8 rounded-lg border bg-card p-8 text-center">
                <p className="text-muted-foreground">
                  No se encontraron referencias disponibles.
                </p>
              </div>
            )}

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="mt-8">
                <Pagination
                  paginaActual={pagina}
                  totalPaginas={totalPaginas}
                  baseUrl="/sapoteca"
                  searchParams={params}
                />
              </div>
            )}
          </div>
        </div>
    </main>
  );
}
