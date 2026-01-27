import Link from "next/link";
import Image from "next/image";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface EspecieCompacta {
  id: number;
  nombre_cientifico: string;
  nombre_comun: string | null;
  slug: string;
  orden?: string | null;
  familia?: string | null;
  genero?: string | null;
}

interface CompactSpeciesCardProps {
  especie: EspecieCompacta;
  href: string;
  icon?: React.ReactNode;
  iconPosition?: "top-right" | "bottom";
  imageUrl?: string | null;
}

export function CompactSpeciesCard({
  especie,
  href,
  icon,
  iconPosition = "bottom",
  imageUrl,
}: CompactSpeciesCardProps) {
  const hasTopRightContent = (icon && iconPosition === "top-right") || imageUrl;
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md py-2 gap-2">
      {/* Nombre científico y común */}
      <CardHeader className="relative px-3 py-1">
        {imageUrl && (
          <div className="absolute right-3 top-1 h-12 w-12 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
            <img
              alt={especie.nombre_cientifico}
              className="h-full w-full object-cover"
              src={imageUrl}
            />
          </div>
        )}
        {icon && iconPosition === "top-right" && !imageUrl && (
          <div className="absolute right-3 top-1">{icon}</div>
        )}
        <Link
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`no-underline transition-colors hover:text-green-700 ${hasTopRightContent ? "pr-16" : ""}`}
        >
          <CardTitle className="text-sm italic leading-tight">
            {especie.nombre_cientifico}
          </CardTitle>
        </Link>
        {especie.nombre_comun && (
          <p className={`text-muted-foreground text-xs ${hasTopRightContent ? "mt-1" : ""}`}>
            {especie.nombre_comun}
          </p>
        )}
      </CardHeader>

      {/* Información taxonómica */}
      {(especie.orden || especie.familia || especie.genero) && (
        <CardContent className="px-3 pb-0.5 pt-0 -mt-1">
          <div className="text-[10px] leading-tight">
            {especie.orden && (
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Orden:</span>
                <span className="text-foreground">{especie.orden}</span>
              </div>
            )}
            {especie.familia && (
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Familia:</span>
                <span className="text-foreground">{especie.familia}</span>
              </div>
            )}
            {especie.genero && (
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Género:</span>
                <span className="text-foreground italic">{especie.genero}</span>
              </div>
            )}
          </div>
        </CardContent>
      )}

      {/* Icono o acción */}
      {icon && iconPosition === "bottom" && (
        <div className="border-t px-3 pt-2 pb-1.5">
          <div className="flex items-center justify-center">{icon}</div>
        </div>
      )}
    </Card>
  );
}
