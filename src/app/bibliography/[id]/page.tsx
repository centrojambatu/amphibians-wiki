import {notFound} from "next/navigation";
import Link from "next/link";
import {ArrowLeft, Download, FileText} from "lucide-react";

import {Button} from "@/components/ui/button";
import CopyButton from "@/components/copy-button";
import {toBibtex, toRis} from "@/lib/export-bibliography";

import getPublicacionById, {getAllPublicacionIds} from "../get-publicacion-by-id";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

// Revalidar cada 24 horas
export const revalidate = 86400;

// Generar parámetros estáticos para todas las publicaciones
export async function generateStaticParams() {
  try {
    const publicaciones = await getAllPublicacionIds();

    // Limitar a las primeras 100 en desarrollo para evitar builds lentos
    const limit = process.env.NODE_ENV === "development" ? 100 : undefined;
    const publicacionesLimitadas = limit ? publicaciones.slice(0, limit) : publicaciones;

    return publicacionesLimitadas;
  } catch (error) {
    console.error("Error en generateStaticParams:", error);

    return [];
  }
}

export default async function BibliographyPage({params}: PageProps) {
  const {id} = await params;
  const idNumber = Number.parseInt(id, 10);

  if (Number.isNaN(idNumber) || idNumber <= 0) {
    notFound();
  }

  const publicacion = await getPublicacionById(idNumber);

  if (!publicacion) {
    notFound();
  }

  const payloadExport = {
    id_publicacion: publicacion.id_publicacion,
    titulo: publicacion.titulo,
    titulo_secundario: publicacion.titulo_secundario,
    numero_publicacion_ano: publicacion.numero_publicacion_ano,
    fecha: publicacion.fecha,
    editorial: publicacion.editorial,
    volumen: publicacion.volumen,
    numero: publicacion.numero,
    pagina: publicacion.pagina,
    palabras_clave: publicacion.palabras_clave,
    resumen: publicacion.resumen,
    autores: publicacion.autores,
    enlaces: publicacion.enlaces.map((e) => ({enlace: e.enlace})),
  };
  const bibtexPreview = toBibtex(payloadExport);
  const risPreview = toRis(payloadExport);

  return (
    <div className="bg-background min-h-screen">
      <main className="container mx-auto px-4 py-8">
        {/* Botón de regreso */}
        <div className="mb-6">
          <Link href="/sapoteca">
            <Button className="gap-2" variant="ghost">
              <ArrowLeft className="h-4 w-4" />
              Volver a la Biblioteca
            </Button>
          </Link>
        </div>

        <article className="prose prose-lg max-w-none">
          {/* Título principal */}
          <h1 className="mb-2 text-2xl font-bold">
            {publicacion.titulo ? (
              <span dangerouslySetInnerHTML={{__html: publicacion.titulo}} />
            ) : (
              <span className="text-muted-foreground">No disponible</span>
            )}
          </h1>

          <h2 className="text-muted-foreground mb-4 text-base">
            {publicacion.titulo_secundario ? (
              <span
                dangerouslySetInnerHTML={{
                  __html: publicacion.titulo_secundario,
                }}
              />
            ) : (
              <span>No disponible</span>
            )}
          </h2>

          {/* Exportar BibTeX / RIS */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-sm">Exportar:</span>
            <Button variant="outline" size="sm" asChild>
              <a
                className="gap-1.5"
                download
                href={`/api/bibliography/${id}/export?format=bibtex`}
              >
                <FileText className="h-4 w-4" />
                BibTeX
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a
                className="gap-1.5"
                download
                href={`/api/bibliography/${id}/export?format=ris`}
              >
                <Download className="h-4 w-4" />
                RIS
              </a>
            </Button>
          </div>

          {/* Previsualización BibTeX y RIS */}
          <div className="mb-6 grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            <div className="overflow-hidden rounded-xl border bg-muted/30">
              <div className="flex items-center justify-between border-b bg-muted/50 px-3 py-2">
                <span className="text-sm font-medium">BibTeX</span>
                <CopyButton text={bibtexPreview} />
              </div>
              <pre className="max-h-[280px] overflow-auto p-3 text-left font-mono text-xs leading-relaxed">
                <code className="whitespace-pre break-words">{bibtexPreview}</code>
              </pre>
            </div>
            <div className="overflow-hidden rounded-xl border bg-muted/30">
              <div className="flex items-center justify-between border-b bg-muted/50 px-3 py-2">
                <span className="text-sm font-medium">RIS</span>
                <CopyButton text={risPreview} />
              </div>
              <pre className="max-h-[280px] overflow-auto p-3 text-left font-mono text-xs leading-relaxed">
                <code className="whitespace-pre break-words">{risPreview}</code>
              </pre>
            </div>
          </div>

          {/* Cita completa */}
          <div className="bg-muted mb-4 gap-2 overflow-hidden rounded-xl border py-2 shadow-sm">
            <div className="flex items-center justify-between px-3 py-1">
              <h2 className="text-base font-semibold">Cita completa</h2>
              {(publicacion.cita_larga || publicacion.cita) && (
                <CopyButton text={publicacion.cita_larga || publicacion.cita || ""} />
              )}
            </div>
            <div className="px-3 pt-1 pb-0.5">
              {publicacion.cita_larga ? (
                <div
                  dangerouslySetInnerHTML={{__html: publicacion.cita_larga}}
                  className="text-xs leading-relaxed"
                />
              ) : publicacion.cita ? (
                <div
                  dangerouslySetInnerHTML={{__html: publicacion.cita}}
                  className="text-xs leading-relaxed"
                />
              ) : (
                <p className="text-muted-foreground text-xs">Cita no disponible</p>
              )}
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}
