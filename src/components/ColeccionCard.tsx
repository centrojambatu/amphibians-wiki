import Link from "next/link";
import {Check, ExternalLink} from "lucide-react";

import {Card, CardContent} from "@/components/ui/card";

export interface ColeccionCardData {
  id_coleccion: number;
  taxon_id: number;
  fuente?: "coleccion" | "coleccion_externa";
  sc: string | null;
  gui: string | null;
  num_museo: string | null;
  catalogo_museo: string | null;
  fecha_coleccion: string | null;
  colectores: string | null;
  personal_nombre: string | null;
  personal_siglas: string | null;
  provincia: string | null;
  detalle_localidad: string | null;
  latitud: number | null;
  longitud: number | null;
  altitud: number | null;
  estadio: string | null;
  numero_individuos: number | null;
  sexo: string | null;
  estado: string | null;
  publicacion_id?: number | null;
  cita_corta?: string | null;
  nombre_cientifico?: string | null;
  nombre_comun?: string | null;
  tiene_muestras?: boolean;
  tiene_multimedia?: boolean;
  tiene_adn?: boolean;
}

interface ColeccionCardProps {
  coleccion: ColeccionCardData;
  href?: string;
  showChevron?: boolean;
}

export default function ColeccionCard({
  coleccion,
  href,
  showChevron = true,
}: ColeccionCardProps) {
  const isExterna = coleccion.fuente === "coleccion_externa";

  const fecha = coleccion.fecha_coleccion
    ? (() => {
        const d = new Date(coleccion.fecha_coleccion);
        const day = String(d.getDate()).padStart(2, "0");
        const month = d.toLocaleDateString("es-ES", {month: "long"});
        return `${day} ${month} ${d.getFullYear()}`;
      })()
    : null;

  const acronimo = coleccion.catalogo_museo?.includes(" - ")
    ? coleccion.catalogo_museo.split(" - ").pop()
    : coleccion.catalogo_museo;
  const numeroDisplay = coleccion.num_museo || coleccion.sc || null;
  const catalogoLabel = [acronimo, numeroDisplay].filter(Boolean).join(" ");

  const localidad = [coleccion.detalle_localidad, coleccion.provincia]
    .filter(Boolean)
    .join(", ");

  const colectorLabel =
    coleccion.colectores ||
    [
      coleccion.personal_nombre,
      coleccion.personal_siglas && `(${coleccion.personal_siglas})`,
    ]
      .filter(Boolean)
      .join(" ") ||
    null;

  const fields: {key: string; node: React.ReactNode}[] = [];

  if (catalogoLabel) {
    fields.push({
      key: "catalogo",
      node: <span className="font-semibold text-gray-900">{catalogoLabel}</span>,
    });
  }
  if (coleccion.nombre_cientifico) {
    fields.push({
      key: "nombre_cientifico",
      node: <span className="italic text-gray-800">{coleccion.nombre_cientifico}</span>,
    });
  }
  if (localidad) {
    fields.push({key: "localidad", node: <span>{localidad}</span>});
  }
  if (coleccion.altitud != null) {
    fields.push({
      key: "altitud",
      node: <span>{`${coleccion.altitud} m`}</span>,
    });
  }
  if (fecha) {
    fields.push({key: "fecha", node: <span>{fecha}</span>});
  }
  if (colectorLabel) {
    fields.push({key: "colector", node: <span>{colectorLabel}</span>});
  }
  const checkIcon = (
    <Check className="h-3.5 w-3.5" strokeWidth={3} style={{color: "#2d6e2d"}} />
  );

  if (coleccion.tiene_muestras) {
    fields.push({
      key: "muestras",
      node: (
        <span className="inline-flex items-center gap-1">
          Muestras biológicas {checkIcon}
        </span>
      ),
    });
  }
  if (coleccion.tiene_multimedia) {
    fields.push({
      key: "multimedia",
      node: (
        <span className="inline-flex items-center gap-1">
          Multimedia {checkIcon}
        </span>
      ),
    });
  }
  if (coleccion.tiene_adn) {
    fields.push({
      key: "adn",
      node: (
        <span className="inline-flex items-center gap-1">
          GenBank {checkIcon}
        </span>
      ),
    });
  }

  const cardInner = (
    <Card className="hover:bg-muted/30 w-full cursor-pointer gap-0 border py-0 transition-colors">
      <CardContent className="flex w-full items-baseline gap-x-2 px-3 py-2 text-[12px] text-gray-700">
        <div className="flex flex-1 flex-wrap items-baseline gap-x-2 gap-y-1 leading-snug">
          {fields.map((f, i) => (
            <span key={f.key} className="inline-flex items-baseline gap-x-2">
              {i > 0 && (
                <span className="font-semibold" style={{color: "#f07304"}}>
                  |
                </span>
              )}
              {f.node}
            </span>
          ))}
        </div>
        {showChevron && (
          <span className="text-gray-400">
            {isExterna ? <ExternalLink className="h-3.5 w-3.5" /> : "›"}
          </span>
        )}
      </CardContent>
    </Card>
  );

  if (!href) return cardInner;

  return (
    <Link className="block w-full no-underline" href={href}>
      {cardInner}
    </Link>
  );
}
