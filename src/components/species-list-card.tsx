import Link from "next/link";

import {SpeciesListItem} from "@/app/sapopedia/get-all-especies";
import {processHTMLLinks} from "@/lib/process-html-links";

import {Card, CardContent, CardHeader, CardTitle} from "./ui/card";
import {Badge} from "./ui/badge";

interface SpeciesListCardProps {
  species: SpeciesListItem;
}

export function SpeciesListCard({species}: SpeciesListCardProps) {
  return (
    <Link href={`/sapopedia/species/${species.nombre_cientifico.replace(/ /g, "-")}`}>
      <Card className="cursor-pointer transition-all hover:shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="text-lg italic">{species.nombre_cientifico}</CardTitle>
              {species.nombre_comun && (
                <p className="text-muted-foreground mt-1 text-sm">{species.nombre_comun}</p>
              )}
            </div>
            {species.fotografia_ficha && (
              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded border">
                <img
                  alt={species.nombre_cientifico}
                  className="h-full w-full object-cover grayscale transition-all duration-500 hover:grayscale-0"
                  src={species.fotografia_ficha}
                />
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Taxonomía */}
          <div className="space-y-1 text-sm">
            {species.orden && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium">Orden:</span>
                <span className="text-foreground">{species.orden}</span>
              </div>
            )}
            {species.familia && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium">Familia:</span>
                <span className="text-foreground">{species.familia}</span>
              </div>
            )}
            {species.genero && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium">Género:</span>
                <span className="text-foreground italic">{species.genero}</span>
              </div>
            )}
          </div>

          {/* Descubridor */}
          {species.descubridor && (
            <div className="border-t pt-3">
              <p className="text-muted-foreground mb-1 text-xs font-medium">Descubridor(es):</p>
              <div
                dangerouslySetInnerHTML={{
                  __html: processHTMLLinks(species.descubridor),
                }}
                className="text-muted-foreground text-xs"
              />
            </div>
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {species.en_ecuador && (
              <Badge className="text-xs" variant="outline">
                En Ecuador
              </Badge>
            )}
            {species.endemica && (
              <Badge className="bg-green-600 text-xs" variant="default">
                Endémica
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
