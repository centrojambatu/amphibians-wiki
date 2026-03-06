"use client";

import { processHTMLLinks } from "@/lib/process-html-links";
import type { PublicacionSapoteca } from "@/app/sapoteca/get-publicaciones-paginadas";

interface ReferenciaCardProps {
  publicacion: PublicacionSapoteca;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const btnBase =
  "inline-flex items-center justify-center rounded border border-gray-300 bg-white px-2 py-1 text-[10px] font-medium uppercase text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50";

export default function ReferenciaCard({ publicacion }: ReferenciaCardProps) {
  const citaLargaRaw = publicacion.cita_larga || "Cita no disponible";
  const titulo = publicacion.titulo?.trim() || "";
  const citaLarga =
    titulo && citaLargaRaw.includes(titulo)
      ? citaLargaRaw.replace(
          titulo,
          `<span class="font-semibold text-[#006d1b]">${escapeHtml(titulo)}</span>`,
        )
      : citaLargaRaw;

  const tieneEnlacesExternos = (publicacion.total_enlaces || 0) > 0;
  const primerEnlace = publicacion.primer_enlace;
  const id = String(publicacion.id_publicacion);
  const exportBibtexUrl = `/api/bibliography/${id}/export?format=bibtex`;
  const exportRisUrl = `/api/bibliography/${id}/export?format=ris`;

  return (
    <div className="relative overflow-hidden rounded-xl border bg-card py-2 shadow-sm transition-all hover:shadow-md">
      <div className="px-3 py-1">
        <p
          className="text-sm leading-tight text-gray-700"
          dangerouslySetInnerHTML={{
            __html: processHTMLLinks(citaLarga),
          }}
          suppressHydrationWarning
        />

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {tieneEnlacesExternos && primerEnlace && (
            <button
              type="button"
              className={btnBase}
              onClick={() => window.open(primerEnlace, "_blank", "noopener,noreferrer")}
            >
              ENLACE
            </button>
          )}
          <button type="button" className={btnBase} disabled aria-disabled>
            PDF
          </button>
          <a
            href={exportBibtexUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={btnBase}
          >
            BIBTEX
          </a>
          <a
            href={exportRisUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={btnBase}
          >
            RIS
          </a>
        </div>
      </div>
    </div>
  );
}
