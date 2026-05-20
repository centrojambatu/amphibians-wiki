"use client";

import {useGbifOccurrence} from "@/lib/gbif";

interface Props {
  catalogoMuseo: string | null;
  numeroMuseo: string | null;
  children: React.ReactNode;
}

/**
 * Envuelve un card de coleccion_externa con un enlace a GBIF resuelto vía API.
 * - Mientras carga: link no clickable (cursor wait)
 * - Si GBIF resolvió la ocurrencia: <a> con la URL específica de la ocurrencia
 * - Si no se encuentra: fallback a búsqueda libre en GBIF por catálogo+número
 */
export default function ExternalGbifWrapper({catalogoMuseo, numeroMuseo, children}: Props) {
  const {data: gbifUrl, isLoading} = useGbifOccurrence(catalogoMuseo, numeroMuseo);

  if (isLoading) {
    return <div className="block w-full cursor-wait opacity-80">{children}</div>;
  }

  const fallbackSearchHref = `https://www.gbif.org/occurrence/search?q=${encodeURIComponent(
    [catalogoMuseo, numeroMuseo].filter(Boolean).join(" ").trim(),
  )}`;

  const href = gbifUrl ?? fallbackSearchHref;

  return (
    <a
      className="block w-full no-underline"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {children}
    </a>
  );
}
