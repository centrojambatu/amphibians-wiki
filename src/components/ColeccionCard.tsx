import Link from "next/link";
import {ExternalLink} from "lucide-react";

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
}

interface ColeccionCardProps {
  coleccion: ColeccionCardData;
  href?: string;
  showEspecie?: boolean;
  showChevron?: boolean;
}

export default function ColeccionCard({
  coleccion,
  href,
  showEspecie = false,
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

  const coordenadas =
    coleccion.latitud != null && coleccion.longitud != null
      ? `${coleccion.latitud}, ${coleccion.longitud}`
      : null;

  const colectorLabel =
    coleccion.colectores ||
    [
      coleccion.personal_nombre,
      coleccion.personal_siglas && `(${coleccion.personal_siglas})`,
    ]
      .filter(Boolean)
      .join(" ") ||
    null;

  const metaParts = [
    coleccion.estadio,
    coleccion.numero_individuos != null
      ? `${String(coleccion.numero_individuos)} indiv.`
      : null,
    coleccion.sexo,
    coleccion.estado,
  ].filter(Boolean) as string[];

  const cardInner = (
    <Card className="hover:bg-muted/30 w-full cursor-pointer gap-0 border py-0 transition-colors">
      <CardContent className="flex w-full flex-col gap-0.5 px-3 py-2">
        {/* Fila 0: fecha arriba */}
        {fecha && (
          <p className="text-[11px] font-semibold whitespace-nowrap text-gray-600">
            {fecha}
          </p>
        )}

        {/* Especie (solo en listados globales) */}
        {showEspecie && coleccion.nombre_cientifico && (
          <p className="text-[13px] leading-tight italic text-gray-800">
            {coleccion.nombre_cientifico}
            {coleccion.nombre_comun && (
              <span className="ml-2 text-[11px] not-italic text-gray-500">
                {coleccion.nombre_comun}
              </span>
            )}
          </p>
        )}

        {/* Fila 1: catálogo + N° Campo + GUI · chevron */}
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          {catalogoLabel && (
            <p className="text-[13px] font-bold leading-tight">{catalogoLabel}</p>
          )}
          {coleccion.sc && (
            <p className="text-[11px] leading-tight text-gray-500">
              N° Campo: <span className="font-medium text-gray-700">{coleccion.sc}</span>
            </p>
          )}
          {coleccion.gui && (
            <p className="text-[11px] leading-tight text-gray-500">
              GUI:{" "}
              <span className="font-mono font-medium text-gray-700">{coleccion.gui}</span>
            </p>
          )}
          {showChevron && (
            <span className="ml-auto text-gray-400">
              {isExterna ? <ExternalLink className="h-3.5 w-3.5" /> : "›"}
            </span>
          )}
        </div>

        {/* Fila 1b: cita_corta enlace a biblioteca */}
        {coleccion.cita_corta && (
          <p className="text-[11px] italic text-gray-500">
            {coleccion.publicacion_id != null ? (
              <a
                className="hover:underline"
                href={`/bibliography/${String(coleccion.publicacion_id)}`}
                style={{color: "#f07304"}}
              >
                {coleccion.cita_corta}
              </a>
            ) : (
              coleccion.cita_corta
            )}
          </p>
        )}

        {/* Fila 2: localidad · coordenadas | altitud */}
        {(localidad || coordenadas || coleccion.altitud != null) && (
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[12px] leading-snug text-gray-700">
            {localidad && <span>{localidad}</span>}
            {(coordenadas || coleccion.altitud != null) && (
              <span className="font-mono text-[10px] text-gray-400">
                {coordenadas}
                {coordenadas && coleccion.altitud != null && (
                  <span className="mx-1.5 font-semibold" style={{color: "#f07304"}}>
                    |
                  </span>
                )}
                {coleccion.altitud != null && `${coleccion.altitud} msnm`}
              </span>
            )}
          </div>
        )}

        {/* Fila 3: colectores · estadio · n. indiv · sexo · estado */}
        {(colectorLabel || metaParts.length > 0) && (
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[11px] text-gray-500">
            {colectorLabel && (
              <span>
                <span className="text-gray-400">Colector:</span>{" "}
                <span className="text-gray-700">{colectorLabel}</span>
              </span>
            )}
            {metaParts.length > 0 && (
              <span className="text-gray-500">{metaParts.join(" · ")}</span>
            )}
          </div>
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
