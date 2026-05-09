"use client";

import Link from "next/link";
import {ExternalLink} from "lucide-react";
import {useEffect, useState} from "react";

import {SpeciesFotoItem} from "./types";

function GbifLink({
  catalogoMuseo,
  numeroMuseo,
  label,
}: {
  catalogoMuseo: string;
  numeroMuseo: string;
  label: string;
}) {
  const [gbifUrl, setGbifUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        let institutionCode = catalogoMuseo;
        let catNumber = numeroMuseo;
        let collectionCode: string | null = null;

        switch (catalogoMuseo) {
          case "KU":
            collectionCode = "KUH";
            break;
          case "QCAZA":
            institutionCode = "QCAZ";
            catNumber = `QCAZA${String(numeroMuseo)}`;
            break;
          case "QCAZ":
            catNumber = `QCAZA${String(numeroMuseo)}`;
            break;
          case "AMNH":
            catNumber = `A-${String(numeroMuseo)}`;
            break;
          case "USNM":
            catNumber = `USNM ${String(numeroMuseo)}`;
            break;
          case "DHMECN":
            catNumber = `DHMECN ${String(numeroMuseo)}`;
            break;
        }
        const params = new URLSearchParams({
          institutionCode,
          catalogNumber: catNumber,
          classKey: "131",
          limit: "1",
        });

        if (collectionCode) params.set("collectionCode", collectionCode);
        const res = await fetch(`https://api.gbif.org/v1/occurrence/search?${params.toString()}`);

        if (!res.ok) return;
        const data = await res.json();

        if (data.results?.length > 0) {
          setGbifUrl(`https://www.gbif.org/occurrence/${data.results[0].key}`);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [catalogoMuseo, numeroMuseo]);

  if (loading) return <span className="text-xs font-semibold text-gray-500">{label}</span>;
  if (!gbifUrl)
    return (
      <span className="text-xs font-semibold text-gray-700" title="No encontrado en GBIF">
        {label}
      </span>
    );

  return (
    <a
      className="hover:text-primary inline-flex items-center gap-1 text-xs font-semibold text-[#4ba24b] underline"
      href={gbifUrl}
      rel="noopener noreferrer"
      target="_blank"
    >
      {label}
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}

function Field({label, value}: {label: string; value: React.ReactNode}) {
  if (value == null || value === "") return null;

  return (
    <div className="flex flex-col leading-tight">
      <span className="text-[9px] font-medium tracking-wide text-gray-500 uppercase">{label}</span>
      <span className="truncate text-xs text-gray-800">{value}</span>
    </div>
  );
}

export default function FotoCard({
  foto,
  speciesUrlId,
  onImageClick,
}: {
  foto: SpeciesFotoItem;
  speciesUrlId: string;
  onImageClick: () => void;
}) {
  const labelMuseo =
    foto.catalogo_museo && foto.numero_museo
      ? `${foto.catalogo_museo} ${foto.numero_museo}`
      : foto.catalogo_museo || foto.numero_museo || "Sin catálogo";

  const coords =
    foto.latitud != null && foto.longitud != null
      ? `${foto.latitud.toFixed(5)}, ${foto.longitud.toFixed(5)}`
      : (null as string | null);

  return (
    <div className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {foto.enlace ? (
        <button
          aria-label="Ver foto en grande"
          className="group relative block aspect-square w-full cursor-zoom-in overflow-hidden bg-gray-100"
          type="button"
          onClick={onImageClick}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={foto.nombre || "Fotografía"}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            src={foto.enlace}
          />
          <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/15" />
        </button>
      ) : (
        <div className="flex aspect-square w-full items-center justify-center bg-gray-100 text-xs text-gray-400">
          Sin imagen
        </div>
      )}

      <div className="p-2">
        <div className="mb-1 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
          {foto.fuente === "coleccion" && foto.coleccion_id ? (
            <Link
              className="hover:text-primary text-[11px] font-semibold text-[#4ba24b] underline"
              href={`/sapopedia/species/${speciesUrlId}/colecciones/${foto.coleccion_id}`}
            >
              {labelMuseo}
            </Link>
          ) : foto.fuente === "coleccion_externa" && foto.catalogo_museo && foto.numero_museo ? (
            <GbifLink
              catalogoMuseo={foto.catalogo_museo}
              label={labelMuseo}
              numeroMuseo={foto.numero_museo}
            />
          ) : (
            <span className="text-[11px] font-semibold text-gray-700">{labelMuseo}</span>
          )}
          {foto.cita_corta && (
            <span className="text-[10px] text-gray-500 italic">· {foto.cita_corta}</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
          <Field label="Fecha" value={foto.fecha} />
          <Field label="Autor" value={foto.autor} />
          <Field label="Localidad" value={foto.localidad} />
          <Field label="Licencia" value={foto.tipo_licencia} />
        </div>

        {foto.descripcion && (
          <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-gray-700">
            {foto.descripcion}
          </p>
        )}
      </div>
    </div>
  );
}
