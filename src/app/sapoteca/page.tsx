import getPublicacionesPaginadas, {
  getAñosPublicaciones,
} from "./get-publicaciones-paginadas";
import getTiposPublicacion from "./get-tipos-publicacion";
import getEstadisticasSapoteca from "./get-estadisticas-sapoteca";
import getHistogramaPublicaciones from "./get-histograma-publicaciones";
import ReferenciaCard from "@/components/referencia-card";
import Pagination from "@/components/pagination";
import SapotecaContentLayout from "@/components/sapoteca-content-layout";
import SapotecaHistogramaChart from "@/components/sapoteca-histograma-chart";
import type { FiltrosSapoteca } from "./get-publicaciones-paginadas";

interface SearchParams {
  [key: string]: string | undefined;
  pagina?: string;
  titulo?: string;
  años?: string;
  autor?: string;
  tipos?: string;
  indexada?: string;
  formatoImpreso?: string;
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
    indexada: params.indexada === "true" ? true : params.indexada === "false" ? false : undefined,
    formatoImpreso:
      params.formatoImpreso === "true"
        ? true
        : params.formatoImpreso === "false"
          ? false
          : undefined,
  };

  // Obtener datos en paralelo
  const [publicacionesData, años, tiposPublicacion, estadisticas, histogramaData] =
    await Promise.all([
      getPublicacionesPaginadas(pagina, itemsPorPagina, filtros),
      getAñosPublicaciones(),
      getTiposPublicacion(),
      getEstadisticasSapoteca(),
      getHistogramaPublicaciones(),
    ]);

  const { publicaciones, total, totalPaginas } = publicacionesData;

  const idsTiposCientificas = tiposPublicacion.secciones
    .filter((s) => s.tipo === "CIENTIFICA" || s.tipo === "TESIS")
    .flatMap((s) => s.items.map((i) => i.id));

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="mb-2 text-4xl font-bold">Biblioteca</h1>
      </div>

      {/* Cards de estadísticas */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        <div className="flex flex-col items-center justify-center rounded-md border p-2" style={{ borderColor: "#dddddd" }}>
          <span className="text-3xl font-bold sm:text-4xl" style={{ color: "#f07304" }}>{estadisticas.totalCientificas.toLocaleString()}</span>
          <h4 className="mt-1 text-center" style={{ color: "#666666", fontSize: "13px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif', fontWeight: "400" }}>Publicaciones científicas</h4>
        </div>
        <div className="flex flex-col items-center justify-center rounded-md border p-2" style={{ borderColor: "#dddddd" }}>
          <span className="text-3xl font-bold sm:text-4xl" style={{ color: "#000000" }}>{estadisticas.totalDivulgacion.toLocaleString()}</span>
          <h4 className="mt-1 text-center" style={{ color: "#666666", fontSize: "13px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif', fontWeight: "400" }}>Publicaciones divulgación</h4>
        </div>
        <div className="flex flex-col items-center justify-center rounded-md border p-2" style={{ borderColor: "#dddddd" }}>
          <span className="text-3xl font-bold sm:text-4xl" style={{ color: "#000000" }}>{estadisticas.totalIndexadas.toLocaleString()}</span>
          <h4 className="mt-1 text-center" style={{ color: "#666666", fontSize: "13px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif', fontWeight: "400" }}>Publicaciones indexadas</h4>
        </div>
        <div className="flex flex-col items-center justify-center rounded-md border p-2" style={{ borderColor: "#dddddd" }}>
          <span className="text-3xl font-bold sm:text-4xl" style={{ color: "#000000" }}>{estadisticas.totalNoIndexadas.toLocaleString()}</span>
          <h4 className="mt-1 text-center" style={{ color: "#666666", fontSize: "13px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif', fontWeight: "400" }}>Publicaciones no indexadas</h4>
        </div>
        <div className="flex flex-col items-center justify-center rounded-md border p-2" style={{ borderColor: "#dddddd" }}>
          <span className="text-3xl font-bold sm:text-4xl" style={{ color: "#000000" }}>{estadisticas.promedioUltimaDecada.toLocaleString()}</span>
          <h4 className="mt-1 text-center" style={{ color: "#666666", fontSize: "13px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif', fontWeight: "400" }}>Promedio publicaciones (última década)</h4>
        </div>
        <div className="flex flex-col items-center justify-center rounded-md border p-2" style={{ borderColor: "#dddddd" }}>
          <span className="text-3xl font-bold sm:text-4xl" style={{ color: "#000000" }}>{estadisticas.publicacionesAnioActual.toLocaleString()}</span>
          <h4 className="mt-1 text-center" style={{ color: "#666666", fontSize: "13px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif', fontWeight: "400" }}>Publicaciones año actual</h4>
        </div>
        <div className="flex flex-col items-center justify-center rounded-md border p-2" style={{ borderColor: "#dddddd" }}>
          <span className="text-3xl font-bold sm:text-4xl" style={{ color: "#000000" }}>{estadisticas.totalTaxonomia.toLocaleString()}</span>
          <h4 className="mt-1 text-center" style={{ color: "#666666", fontSize: "13px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif', fontWeight: "400" }}>Taxonomía</h4>
        </div>
        <div className="flex flex-col items-center justify-center rounded-md border p-2" style={{ borderColor: "#dddddd" }}>
          <span className="text-3xl font-bold sm:text-4xl" style={{ color: "#000000" }}>{estadisticas.totalEvolucion.toLocaleString()}</span>
          <h4 className="mt-1 text-center" style={{ color: "#666666", fontSize: "13px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif', fontWeight: "400" }}>Evolución</h4>
        </div>
        <div className="flex flex-col items-center justify-center rounded-md border p-2" style={{ borderColor: "#dddddd" }}>
          <span className="text-3xl font-bold sm:text-4xl" style={{ color: "#000000" }}>{estadisticas.totalEcologia.toLocaleString()}</span>
          <h4 className="mt-1 text-center" style={{ color: "#666666", fontSize: "13px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif', fontWeight: "400" }}>Ecología</h4>
        </div>
        <div className="flex flex-col items-center justify-center rounded-md border p-2" style={{ borderColor: "#dddddd" }}>
          <span className="text-3xl font-bold sm:text-4xl" style={{ color: "#000000" }}>{estadisticas.totalConservacion.toLocaleString()}</span>
          <h4 className="mt-1 text-center" style={{ color: "#666666", fontSize: "13px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif', fontWeight: "400" }}>Conservación</h4>
        </div>
        {estadisticas.publicacionMasCitada && (
          <a
            href="https://scholar.google.com/citations?view_op=view_citation&hl=es&user=DuBUsasAAAAJ&citation_for_view=DuBUsasAAAAJ:mVmsd5A6BfQC"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className="flex h-full flex-col items-center justify-center rounded-md border p-2 cursor-pointer transition-shadow hover:shadow-md" style={{ borderColor: "#dddddd" }}>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold sm:text-4xl" style={{ color: "#000000" }}>451</span>
                <span className="text-xs font-semibold" style={{ color: "#666666" }}>citas</span>
              </div>
              <h4 className="mt-1 text-center" style={{ color: "#666666", fontSize: "13px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif', fontWeight: "400" }}>
                Publicación más citada <span style={{ color: "#f07304" }}>|</span> Autor principal ecuatoriano
              </h4>
            </div>
          </a>
        )}
        {estadisticas.publicacionCientificaMasReciente ? (
          <a
            className="block h-full"
            href={
              estadisticas.publicacionCientificaMasReciente.enlace ||
              `/bibliography/${String(estadisticas.publicacionCientificaMasReciente.idPublicacion)}`
            }
            rel={estadisticas.publicacionCientificaMasReciente.enlace ? "noopener noreferrer" : undefined}
            target={estadisticas.publicacionCientificaMasReciente.enlace ? "_blank" : undefined}
          >
            <div className="flex h-full flex-col items-center justify-center rounded-md border p-2 cursor-pointer transition-shadow hover:shadow-md" style={{ borderColor: "#dddddd" }}>
              <p
                className="line-clamp-2 break-words text-xs font-semibold leading-tight text-center"
                style={{ color: "#000000" }}
                title={estadisticas.publicacionCientificaMasReciente.titulo
                  .replace(/<[^>]*>/g, " ")
                  .replace(/\s+/g, " ")
                  .trim()}
              >
                <span
                  dangerouslySetInnerHTML={{
                    __html: estadisticas.publicacionCientificaMasReciente.titulo,
                  }}
                />
              </p>
              <h4 className="mt-1 text-center" style={{ color: "#666666", fontSize: "13px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif', fontWeight: "400" }}>
                Publicación científica más reciente
              </h4>
            </div>
          </a>
        ) : (
          <div className="flex h-full flex-col items-center justify-center rounded-md border p-2" style={{ borderColor: "#dddddd" }}>
            <h4 className="text-center" style={{ color: "#666666", fontSize: "13px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif', fontWeight: "400" }}>Publicación científica más reciente</h4>
            <span className="text-xs" style={{ color: "#666666" }}>No disponible</span>
          </div>
        )}
      </div>

      {/* Histograma de publicaciones por año */}
      <div className="mb-8">
        <SapotecaHistogramaChart data={histogramaData} idsTiposCientificas={idsTiposCientificas} />
      </div>

        {/* Layout con panel de filtros y contenido */}
        <SapotecaContentLayout tiposPublicacion={tiposPublicacion} años={años}>
          {/* Información de resultados */}
          <div className="mb-6 text-sm text-muted-foreground">
            Mostrando {publicaciones.length} de {total} referencias
            {totalPaginas > 1 && (
              <>
                {" "}
                (Página {pagina} de {totalPaginas})
              </>
            )}
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
        </SapotecaContentLayout>
    </main>
  );
}
