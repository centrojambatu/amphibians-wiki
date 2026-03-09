"use client";

import type {PublicacionSapoteca} from "@/app/sapoteca/get-publicaciones-paginadas";

import {processHTMLLinks} from "@/lib/process-html-links";

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
  "inline-flex cursor-pointer items-center justify-center rounded border border-gray-300 bg-white px-2 py-1 text-[10px] font-medium uppercase !text-gray-700 no-underline transition-[color,background-color,border-color] hover:!text-gray-900 hover:border-gray-400 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50";

const COLOR_TITULO_CIENTIFICA = "#f07304";
const COLOR_TITULO_RESTO = "#006d1b";

const LABEL_TIPO: Record<string, string> = {
  TESIS: "Tesis",
  DIVULGACIÓN: "Divulgación",
  OTRO: "Otro",
  SIN_ASIGNAR: "Sin asignar",
};

export default function ReferenciaCard({publicacion}: ReferenciaCardProps) {
  const citaLargaRaw = publicacion.cita_larga || "Cita no disponible";
  const titulo = publicacion.titulo?.trim() || "";
  const soloCientifica = publicacion.tipo === "CIENTIFICA";
  const colorTitulo = soloCientifica ? COLOR_TITULO_CIENTIFICA : COLOR_TITULO_RESTO;
  const citaLarga =
    titulo && citaLargaRaw.includes(titulo)
      ? citaLargaRaw.replace(
          titulo,
          `<span class="font-semibold" style="color:${colorTitulo}">${escapeHtml(titulo)}</span>`,
        )
      : citaLargaRaw;

  const tieneEnlacesExternos = (publicacion.total_enlaces || 0) > 0;
  const primerEnlace = publicacion.primer_enlace;
  const id = String(publicacion.id_publicacion);
  const exportBibtexUrl = `/api/bibliography/${id}/export?format=bibtex`;
  const exportRisUrl = `/api/bibliography/${id}/export?format=ris`;

  const mostrarCapsulaTipo = publicacion.tipo && publicacion.tipo !== "CIENTIFICA";
  const labelTipo = publicacion.tipo ? (LABEL_TIPO[publicacion.tipo] ?? publicacion.tipo) : "";

  return (
    <div className="bg-card overflow-hidden rounded-xl border py-2 shadow-sm transition-all hover:shadow-md">
      <div className="px-3 py-1">
        <div className="flex items-start gap-2">
          <p
            dangerouslySetInnerHTML={{
              __html: processHTMLLinks(citaLarga),
            }}
            suppressHydrationWarning
            className="min-w-0 flex-1 text-sm leading-relaxed text-gray-700"
          />
          {mostrarCapsulaTipo && (
            <span
              aria-label={`Tipo: ${labelTipo}`}
              className="bg-muted/80 shrink-0 rounded-full border border-gray-200 px-2 py-0.5 text-[10px] font-medium tracking-wide text-gray-600 uppercase"
            >
              {labelTipo}
            </span>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {tieneEnlacesExternos && primerEnlace && (
            <button
              className={btnBase}
              type="button"
              onClick={() => window.open(primerEnlace, "_blank", "noopener,noreferrer")}
            >
              ENLACE
            </button>
          )}
          <button aria-disabled disabled className={btnBase} type="button">
            PDF
          </button>
          <a className={btnBase} href={exportBibtexUrl} rel="noopener noreferrer" target="_blank">
            BIBTEX
          </a>
          <a className={btnBase} href={exportRisUrl} rel="noopener noreferrer" target="_blank">
            RIS
          </a>
        </div>
      </div>
    </div>
  );
}
