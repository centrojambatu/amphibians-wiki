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
import { Card, CardContent } from "@/components/ui/card";
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

      {/* Cards de estadísticas (mismo estilo que Lista Roja: número arriba, label abajo) */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6 sm:gap-4">
        <Card className="min-w-0 overflow-visible transition-shadow hover:shadow-md">
          <CardContent className="pt-4">
            <p className="text-4xl font-bold tabular-nums text-[#f07304] sm:text-5xl">
              {estadisticas.totalCientificas.toLocaleString()}
            </p>
            <p className="break-words text-muted-foreground text-xs sm:text-sm">Publicaciones científicas</p>
          </CardContent>
        </Card>
        <Card className="min-w-0 overflow-visible transition-shadow hover:shadow-md">
          <CardContent className="pt-4">
            <p className="text-3xl font-bold tabular-nums sm:text-4xl">
              {estadisticas.totalDivulgacion.toLocaleString()}
            </p>
            <p className="break-words text-muted-foreground text-xs sm:text-sm">Publicaciones divulgación</p>
          </CardContent>
        </Card>
        <Card className="min-w-0 overflow-visible transition-shadow hover:shadow-md">
          <CardContent className="pt-4">
            <p className="text-3xl font-bold tabular-nums sm:text-4xl">
              {estadisticas.totalIndexadas.toLocaleString()}
            </p>
            <p className="break-words text-muted-foreground text-xs sm:text-sm">Publicaciones indexadas</p>
          </CardContent>
        </Card>
        <Card className="min-w-0 overflow-visible transition-shadow hover:shadow-md">
          <CardContent className="pt-4">
            <p className="text-3xl font-bold tabular-nums sm:text-4xl">
              {estadisticas.totalNoIndexadas.toLocaleString()}
            </p>
            <p className="break-words text-muted-foreground text-xs sm:text-sm">Publicaciones no indexadas</p>
          </CardContent>
        </Card>
        <Card className="min-w-0 overflow-visible transition-shadow hover:shadow-md">
          <CardContent className="pt-4">
            <p className="text-3xl font-bold tabular-nums sm:text-4xl">
              {estadisticas.promedioUltimaDecada.toLocaleString()}
            </p>
            <p className="break-words text-muted-foreground text-xs sm:text-sm">
              Promedio publicaciones (última década)
            </p>
          </CardContent>
        </Card>
        <Card className="min-w-0 overflow-visible transition-shadow hover:shadow-md">
          <CardContent className="pt-4">
            <p className="text-3xl font-bold tabular-nums sm:text-4xl">
              {estadisticas.publicacionesAnioActual.toLocaleString()}
            </p>
            <p className="break-words text-muted-foreground text-xs sm:text-sm">Publicaciones año actual</p>
          </CardContent>
        </Card>
        <Card className="min-w-0 overflow-visible transition-shadow hover:shadow-md">
          <CardContent className="pt-4">
            <p className="text-3xl font-bold tabular-nums sm:text-4xl">
              {estadisticas.totalTaxonomia.toLocaleString()}
            </p>
            <p className="break-words text-muted-foreground text-xs sm:text-sm">Taxonomía</p>
          </CardContent>
        </Card>
        <Card className="min-w-0 overflow-visible transition-shadow hover:shadow-md">
          <CardContent className="pt-4">
            <p className="text-3xl font-bold tabular-nums sm:text-4xl">
              {estadisticas.totalEvolucion.toLocaleString()}
            </p>
            <p className="break-words text-muted-foreground text-xs sm:text-sm">Evolución</p>
          </CardContent>
        </Card>
        <Card className="min-w-0 overflow-visible transition-shadow hover:shadow-md">
          <CardContent className="pt-4">
            <p className="text-3xl font-bold tabular-nums sm:text-4xl">
              {estadisticas.totalEcologia.toLocaleString()}
            </p>
            <p className="break-words text-muted-foreground text-xs sm:text-sm">Ecología</p>
          </CardContent>
        </Card>
        <Card className="min-w-0 overflow-visible transition-shadow hover:shadow-md">
          <CardContent className="pt-4">
            <p className="text-3xl font-bold tabular-nums sm:text-4xl">
              {estadisticas.totalConservacion.toLocaleString()}
            </p>
            <p className="break-words text-muted-foreground text-xs sm:text-sm">Conservación</p>
          </CardContent>
        </Card>
        {estadisticas.publicacionMasCitada && (
          <a
            href="https://scholar.google.com/citations?view_op=view_citation&hl=es&user=DuBUsasAAAAJ&citation_for_view=DuBUsasAAAAJ:mVmsd5A6BfQC"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Card className="min-w-0 cursor-pointer overflow-visible transition-shadow hover:shadow-md">
              <CardContent className="pt-4">
                <p className="text-3xl font-bold tabular-nums sm:text-4xl">
                  <span>451</span>
                  <span className="ml-1 align-baseline text-xs font-medium text-muted-foreground sm:text-sm">
                    citas
                  </span>
                </p>

                <p className="mt-1 break-words text-[10px] leading-tight text-muted-foreground sm:text-xs">
                  Publicación más citada <span className="text-[#f07304]">|</span> Autor principal ecuatoriano
                </p>
              </CardContent>
            </Card>
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
            <Card className="flex h-full min-h-[88px] min-w-0 flex-col transition-shadow hover:shadow-md">
              <CardContent className="flex flex-1 flex-col justify-between pt-4">
                <p
                  className="line-clamp-2 break-words text-xs font-medium leading-tight"
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
                <p className="mt-1 shrink-0 break-words text-muted-foreground text-[10px] sm:text-xs">
                  Publicación científica más reciente
                </p>
              </CardContent>
            </Card>
          </a>
        ) : (
          <Card className="flex h-full min-h-[88px] min-w-0 flex-col transition-shadow hover:shadow-md">
            <CardContent className="pt-4">
              <p className="break-words text-muted-foreground text-xs sm:text-sm">Publicación científica más reciente</p>
              <p className="text-muted-foreground text-xs">No disponible</p>
            </CardContent>
          </Card>
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
