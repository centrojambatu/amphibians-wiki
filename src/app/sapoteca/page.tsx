import {getAñosPublicaciones} from "./get-publicaciones-paginadas";
import getTiposPublicacion from "./get-tipos-publicacion";
import getEstadisticasSapoteca from "./get-estadisticas-sapoteca";
import getHistogramaPublicaciones from "./get-histograma-publicaciones";
import SapotecaContentLayout from "@/components/sapoteca-content-layout";
import SapotecaHistogramaChart from "@/components/sapoteca-histograma-chart";
import SapotecaPublicacionesList from "@/components/sapoteca-publicaciones-list";
import Link from "next/link";
import {MoveLeft} from "lucide-react";

interface SearchParams {
  [key: string]: string | string[] | undefined;
  pagina?: string;
  titulo?: string | string[];
  años?: string;
  autor?: string;
  tipos?: string;
  indexada?: string;
  formatoImpreso?: string;
  publicacion_id?: string;
  back?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function SapotecaPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Obtener datos en paralelo (lista de publicaciones se carga client-side via /api/sapoteca)
  const [años, tiposPublicacion, estadisticas, histogramaData] = await Promise.all([
    getAñosPublicaciones(),
    getTiposPublicacion(),
    getEstadisticasSapoteca(),
    getHistogramaPublicaciones(),
  ]);

  const idsTiposCientificas = tiposPublicacion.secciones
    .filter((s) => s.tipo === "CIENTIFICA" || s.tipo === "TESIS")
    .flatMap((s) => s.items.map((i) => i.id));

  // Validar URL de back (solo permitir rutas internas)
  const backUrl =
    params.back && params.back.startsWith("/") && !params.back.startsWith("//")
      ? params.back
      : null;

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Botón de regreso si viene de otra vista */}
      {backUrl && (
        <div className="mb-4">
          <Link
            aria-label="Volver"
            className="text-muted-foreground inline-flex items-center hover:no-underline"
            href={backUrl}
          >
            <MoveLeft className="h-8 w-8" strokeWidth={1} />
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-2 text-4xl font-bold text-gray-900">Biblioteca</h1>
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
              `/sapoteca?publicacion_id=${String(estadisticas.publicacionCientificaMasReciente.idPublicacion)}`
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
          <SapotecaPublicacionesList />
        </SapotecaContentLayout>
    </main>
  );
}
