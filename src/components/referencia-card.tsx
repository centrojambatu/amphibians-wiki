"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
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
  const tieneEnlacesExternos = (publicacion.total_enlaces || 0) > 0;
  const primerEnlace = publicacion.primer_enlace;

  return (
    <div className="sapoteca-link relative overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md py-2 gap-2">
      <Link
        href={bibliographyUrl}
        className="group block"
      >
        {/* Ícono de enlace externo en la esquina superior derecha */}
        {tieneEnlacesExternos && primerEnlace && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.open(primerEnlace, "_blank", "noopener,noreferrer");
            }}
            className="absolute right-3 top-1 z-10 flex h-6 w-6 items-center justify-center rounded transition-all hover:bg-muted/80 hover:scale-110"
            aria-label="Abrir enlace externo"
            onMouseEnter={(e) => {
              e.stopPropagation();
            }}
          >
            <ExternalLink className="h-4 w-4 text-muted-foreground opacity-60 transition-all hover:opacity-100 hover:text-primary" />
          </button>
        )}

        {/* Título */}
        <div className="relative px-3 py-1">
          <h3
            className={`text-sm font-semibold text-[#006d1b] leading-tight ${tieneEnlacesExternos && primerEnlace ? "pr-10" : ""}`}
            dangerouslySetInnerHTML={{
              __html: processHTMLLinks(titulo),
            }}
            suppressHydrationWarning
          />
        </div>

        {/* Cita */}
        <div className="px-3 pb-0.5 pt-1">
          <p
            className="text-[10px] leading-tight text-muted-foreground"
            dangerouslySetInnerHTML={{
              __html: processHTMLLinks(citaParaMostrar),
            }}
            suppressHydrationWarning
          />
        </div>
      </Link>
    </div>
  );
}
