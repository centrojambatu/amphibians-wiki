import {useQuery} from "@tanstack/react-query";

export function buildGbifSearchUrl(catalogoMuseo: string, numeroMuseo: string): string {
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

  return `https://api.gbif.org/v1/occurrence/search?${params.toString()}`;
}

async function fetchGbifOccurrenceUrl(
  catalogoMuseo: string,
  numeroMuseo: string,
): Promise<string | null> {
  const res = await fetch(buildGbifSearchUrl(catalogoMuseo, numeroMuseo));

  if (!res.ok) return null;
  const data = await res.json();

  if (data.results?.length > 0) {
    return `https://www.gbif.org/occurrence/${String(data.results[0].key)}`;
  }

  return null;
}

/**
 * Hook que resuelve la URL de la ocurrencia en GBIF a partir del catálogo y
 * número de museo. El resultado se cachea persistentemente (localStorage).
 */
export function useGbifOccurrence(catalogoMuseo: string | null, numeroMuseo: string | null) {
  return useQuery({
    queryKey: ["gbif", catalogoMuseo, numeroMuseo],
    queryFn: () => fetchGbifOccurrenceUrl(catalogoMuseo!, numeroMuseo!),
    enabled: Boolean(catalogoMuseo && numeroMuseo),
    staleTime: Infinity,
    gcTime: 7 * 24 * 60 * 60 * 1000,
  });
}
