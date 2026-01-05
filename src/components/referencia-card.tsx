import Link from "next/link";
import { processHTMLLinks } from "@/lib/process-html-links";
import { getBibliographyUrl } from "@/lib/get-bibliography-url";
import type { PublicacionSapoteca } from "@/app/sapoteca/get-publicaciones-paginadas";

interface ReferenciaCardProps {
  publicacion: PublicacionSapoteca;
}

export default function ReferenciaCard({ publicacion }: ReferenciaCardProps) {
  // Construir la cita para mostrar
  const citaParaMostrar =
    publicacion.cita_larga ||
    publicacion.cita ||
    publicacion.cita_corta ||
    "Cita no disponible";

  // Generar URL de la bibliografía
  const año =
    publicacion.numero_publicacion_ano ||
    (publicacion.fecha
      ? new Date(publicacion.fecha).getFullYear()
      : null);
  const bibliographyUrl = getBibliographyUrl(
    publicacion.cita_corta || null,
    año,
    publicacion.titulo || null,
    publicacion.id_publicacion || 0,
  );

  const titulo = publicacion.titulo || "Sin título";

  return (
    <Link
      href={bibliographyUrl}
      className="sapoteca-link group block rounded-lg border bg-card p-4 transition-colors hover:bg-muted"
    >
      {/* Título */}
      <h3
        className="mb-2 text-base font-semibold text-[#006d1b]"
        dangerouslySetInnerHTML={{
          __html: processHTMLLinks(titulo),
        }}
      />

      {/* Cita */}
      <p
        className="text-sm text-muted-foreground"
        dangerouslySetInnerHTML={{
          __html: processHTMLLinks(citaParaMostrar),
        }}
      />
    </Link>
  );
}
