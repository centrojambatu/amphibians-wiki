import Link from "next/link";
import Image from "next/image";

import type { EspecieMoleculoteca } from "@/app/moleculoteca/get-especies-moleculoteca";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface MoleculotecaSpeciesCardProps {
  species: EspecieMoleculoteca;
}

// Función para generar URL de GBIF
function getGbifUrl(nombreCientifico: string): string {
  const searchQuery = encodeURIComponent(nombreCientifico);
  return `https://www.gbif.org/species/search?q=${searchQuery}`;
}

// Función para generar URL de NCBI GenBank
function getNcbiUrl(nombreCientifico: string): string {
  const searchQuery = encodeURIComponent(nombreCientifico);
  return `https://www.ncbi.nlm.nih.gov/nuccore/?term=${searchQuery}`;
}

// Función para generar URL de iNaturalist
function getInaturalistUrl(nombreCientifico: string): string {
  const searchQuery = encodeURIComponent(nombreCientifico);
  return `https://www.inaturalist.org/taxa/search?q=${searchQuery}`;
}

export function MoleculotecaSpeciesCard({
  species,
}: MoleculotecaSpeciesCardProps) {
  const gbifUrl = getGbifUrl(species.nombre_cientifico);
  const ncbiUrl = getNcbiUrl(species.nombre_cientifico);
  const inaturalistUrl = getInaturalistUrl(species.nombre_cientifico);

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md py-2 gap-2">
      {/* Nombre científico y común */}
      <CardHeader className="px-3 py-1">
        <Link
          href={`/sapopedia/species/${species.nombre_cientifico.replace(/ /g, "-")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="no-underline transition-colors hover:text-green-700"
        >
          <CardTitle className="text-sm italic leading-tight">
            {species.nombre_cientifico}
          </CardTitle>
        </Link>
        {species.nombre_comun && (
          <p className="text-muted-foreground text-xs">
            {species.nombre_comun}
          </p>
        )}
      </CardHeader>

      {/* Información taxonómica */}
      <CardContent className="px-3 pb-0.5 pt-0 -mt-1">
        <div className="text-[10px] leading-tight">
          {species.orden && (
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Orden:</span>
              <span className="text-foreground">{species.orden}</span>
            </div>
          )}
          {species.familia && (
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Familia:</span>
              <span className="text-foreground">{species.familia}</span>
            </div>
          )}
          {species.genero && (
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Género:</span>
              <span className="text-foreground italic">{species.genero}</span>
            </div>
          )}
        </div>
      </CardContent>

      {/* Enlaces externos */}
      <div className="border-t px-3 pt-2 pb-1.5">
        <TooltipProvider>
          <div className="flex items-center justify-center gap-3">
              {/* GBIF */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={gbifUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-16 items-center justify-center rounded-md border border-gray-200 bg-white px-1 py-0.5 transition-all hover:border-green-500 hover:shadow-sm"
                  >
                    <Image
                      src="/assets/moleculoteca/gbif-icon.png"
                      alt="GBIF"
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Buscar en GBIF</p>
                </TooltipContent>
              </Tooltip>

              {/* NCBI GenBank */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={ncbiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-16 items-center justify-center rounded-md border border-gray-200 bg-white px-1 py-0.5 transition-all hover:border-blue-500 hover:shadow-sm"
                  >
                    <Image
                      src="/assets/moleculoteca/ncbi-icon.png"
                      alt="NCBI GenBank"
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Buscar en NCBI GenBank</p>
                </TooltipContent>
              </Tooltip>

              {/* iNaturalist */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={inaturalistUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-16 items-center justify-center rounded-md border border-gray-200 bg-white px-1 py-0.5 transition-all hover:border-green-600 hover:shadow-sm"
                  >
                    <Image
                      src="/assets/moleculoteca/inaturalist-icon.png"
                      alt="iNaturalist"
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Buscar en iNaturalist</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>
    </Card>
  );
}
