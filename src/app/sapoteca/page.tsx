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

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="mb-2 text-4xl font-bold">Biblioteca</h1>
      </div>

      {/* Cards de estadísticas */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Publicaciones científicas</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {estadisticas.totalCientificas.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Publicaciones divulgación</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {estadisticas.totalDivulgacion.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Publicaciones indexadas</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {estadisticas.totalIndexadas.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Publicaciones no indexadas</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {estadisticas.totalNoIndexadas.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">
              Promedio publicaciones (última década)
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {estadisticas.promedioUltimaDecada.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Publicaciones año actual</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {estadisticas.publicacionesAnioActual.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Taxonomía</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {estadisticas.totalTaxonomia.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Evolución</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {estadisticas.totalEvolucion.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Ecología</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {estadisticas.totalEcologia.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Conservación</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {estadisticas.totalConservacion.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        {estadisticas.publicacionMasCitada && (
          <a
            href={estadisticas.publicacionMasCitada.enlace ?? `/bibliography/${estadisticas.publicacionMasCitada.idPublicacion}`}
            target={estadisticas.publicacionMasCitada.enlace ? "_blank" : undefined}
            rel={estadisticas.publicacionMasCitada.enlace ? "noopener noreferrer" : undefined}
            className="block"
          >
            <Card className="transition-colors hover:bg-gray-50">
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-sm">Publicación más citada</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  {estadisticas.publicacionMasCitada.contadorCitas.toLocaleString()}
                </p>
                <p className="mt-1 text-[10px] leading-tight text-gray-500">
                  {estadisticas.publicacionMasCitada.titulo}
                </p>
              </CardContent>
            </Card>
          </a>
        )}
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Autores en publicaciones Anfibios Ecuador</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {estadisticas.totalAutoresEcuador.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Histograma de publicaciones por año */}
      <div className="mb-8">
        <SapotecaHistogramaChart data={histogramaData} />
      </div>

        {/* Layout con panel de filtros y contenido */}
        <SapotecaContentLayout tiposPublicacion={tiposPublicacion} años={años}>
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
        </SapotecaContentLayout>
    </main>
  );
}
