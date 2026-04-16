"use client";

import Link from "next/link";
import dynamic from "next/dynamic";

const ColeccionMiniMap = dynamic(() => import("@/components/ColeccionMiniMap"), {ssr: false});
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  Canto,
  Tejido,
  PrestamoColeccion,
  PrestamoTejido,
  ColeccionPersonal,
  Identificacion,
  CuerpoAgua,
} from "./get-coleccion-relacionados";

interface ColeccionDetailClientProps {
  coleccion: any;
  cantos: Canto[];
  tejidos: Tejido[];
  prestamosColeccion: PrestamoColeccion[];
  prestamosTejido: PrestamoTejido[];
  coleccionPersonal: ColeccionPersonal[];
  identificaciones: Identificacion[];
  cuerposAgua: CuerpoAgua[];
  especieUrl: string;
  coleccionesUrl: string;
}

const formatDateSimple = (date: string | null | undefined): string => {
  if (!date) return "—";
  try {
    return new Date(date).toLocaleDateString("es-ES");
  } catch {
    return "—";
  }
};

const val = (v: any): string => {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "boolean") return v ? "Sí" : "No";
  return String(v);
};

/** Sección con título al estilo GBIF */
function Section({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <section className="border-t pt-8">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-500">{title}</h2>
      {children}
    </section>
  );
}

/** Fila de término → valor en tabla de detalles */
function Row({label, value}: {label: string; value: string}) {
  if (value === "—") return null;
  return (
    <tr className="border-b last:border-0">
      <td className="py-2 pr-6 text-sm font-medium text-gray-600 align-top whitespace-nowrap">{label}</td>
      <td className="py-2 text-sm text-gray-900">{value}</td>
    </tr>
  );
}

function DetailTable({children}: {children: React.ReactNode}) {
  return (
    <table className="w-full">
      <tbody>{children}</tbody>
    </table>
  );
}

/** Card individual para un campo */
function FieldCard({label, value, highlight}: {label: string; value: string | null | undefined; highlight?: boolean}) {
  const display = val(value as any);
  if (display === "—") return null;
  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg border p-3"
      style={{backgroundColor: "#f9f9f9", borderColor: "#dddddd"}}
    >
      <span
        style={{
          color: "#666666",
          fontSize: "13px",
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
          fontWeight: "600",
        }}
      >
        {label}
      </span>
      <span
        className="mt-1 text-center text-sm font-semibold"
        style={{color: highlight ? "#f07304" : "#000000"}}
      >
        {display}
      </span>
    </div>
  );
}

export default function ColeccionDetailClient({
  coleccion,
  cantos,
  tejidos,
  prestamosColeccion,
  prestamosTejido,
  coleccionPersonal,
  identificaciones,
  cuerposAgua,
  especieUrl,
  coleccionesUrl,
}: ColeccionDetailClientProps) {
  const catalogoLabel = (() => {
    const acronimo = coleccion.catalogo_museo?.includes(" - ")
      ? coleccion.catalogo_museo.split(" - ").pop()
      : coleccion.catalogo_museo;
    return [acronimo, coleccion.num_museo].filter(Boolean).join(" ") || null;
  })();

  const hasCoords = coleccion.latitud != null && coleccion.longitud != null;

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8 space-y-10">

      {/* Breadcrumb */}
      <nav className="text-muted-foreground flex items-center gap-2 text-xs">
        <Link href={especieUrl} className="hover:no-underline hover:text-foreground">
          Ficha de la especie
        </Link>
        <span>/</span>
        <Link href={coleccionesUrl} className="hover:no-underline hover:text-foreground">
          Colecciones
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{catalogoLabel ?? "Detalle"}</span>
      </nav>

      {/* Cards de resumen — todos los campos de la colección */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {/* Identificación */}
        <FieldCard label="Catálogo" value={catalogoLabel} highlight />
        <FieldCard label="Taxon" value={coleccion.taxon_nombre} highlight />
        <FieldCard label="Fecha colección" value={formatDateSimple(coleccion.fecha_coleccion)} />
        <FieldCard label="Estadio" value={coleccion.estadio} />
        <FieldCard label="Sexo" value={coleccion.sexo} />
        <FieldCard label="Estatus tipo" value={coleccion.estatus_tipo} />

        {/* Espécimen */}
        <FieldCard label="SVL" value={coleccion.svl != null ? `${coleccion.svl} mm` : null} />
        <FieldCard label="Peso" value={coleccion.peso != null ? `${coleccion.peso} g` : null} />
        <FieldCard label="Individuos" value={coleccion.numero_individuos} />
        <FieldCard label="Estado" value={coleccion.estado} />
        <FieldCard label="Colector principal" value={coleccion.personal_nombre} />
        <FieldCard label="Colectores" value={coleccion.colectores} />
        <FieldCard label="Hábitat" value={coleccion.habitat} />
        <FieldCard label="Hora" value={coleccion.hora} />
        <FieldCard label="Estatus identificación" value={coleccion.estatus_identificacion} />
        <FieldCard label="Identificado por" value={coleccion.identificado_por} />
        <FieldCard label="Fecha identificación" value={formatDateSimple(coleccion.fecha_identifica)} />

        {/* Localidad */}
        <FieldCard label="Localidad" value={coleccion.detalle_localidad || coleccion.campobase_localidad} />
        <FieldCard label="Provincia" value={coleccion.provincia || coleccion.campobase_provincia} />
        <FieldCard label="Latitud" value={coleccion.latitud != null ? String(coleccion.latitud) : null} />
        <FieldCard label="Longitud" value={coleccion.longitud != null ? String(coleccion.longitud) : null} />
        <FieldCard label="Altitud" value={coleccion.altitud != null ? `${coleccion.altitud} msnm` : null} />
        <FieldCard label="Campo base" value={coleccion.campobase_nombre} />
        <FieldCard label="Temperatura" value={coleccion.temperatura != null ? `${coleccion.temperatura} °C` : null} />
        <FieldCard label="Humedad" value={coleccion.humedad != null ? `${coleccion.humedad} %` : null} />
        <FieldCard label="pH" value={coleccion.ph != null ? String(coleccion.ph) : null} />
        <FieldCard label="Observación" value={coleccion.observacion} />

        {/* Códigos */}
        <FieldCard label="SC Acrónimo" value={coleccion.sc_acronimo} />
        <FieldCard label="SC Número" value={coleccion.sc_numero} />
        <FieldCard label="SC Sufijo" value={coleccion.sc_sufijo} />
        <FieldCard label="GUI" value={coleccion.gui} />
        <FieldCard label="SC" value={coleccion.sc} />
        <FieldCard label="Num. colector" value={coleccion.num_colector} />
        <FieldCard label="Nombre común" value={coleccion.nombre_comun} />
        <FieldCard label="Idioma" value={coleccion.idioma_nc} />
        <FieldCard label="Fuente nombre común" value={coleccion.fuente_nombrecomun} />

        {/* Permiso / Contrato */}
        <FieldCard label="NPICMPF" value={coleccion.permiso_npicmpf} />
        <FieldCard label="Tipo autorización" value={coleccion.permiso_tipo_autorizacion} />
        <FieldCard label="Fecha inicio permiso" value={formatDateSimple(coleccion.permiso_fecha_ini)} />
        <FieldCard label="Fecha fin permiso" value={formatDateSimple(coleccion.permiso_fecha_fin)} />
        <FieldCard label="Estado permiso" value={coleccion.permiso_estado} />
        <FieldCard label="Obs. permiso" value={coleccion.permiso_observacion} />
      </div>

      {/* Mapa */}
      {hasCoords && (
        <div className="rounded-xl overflow-hidden border" style={{height: 320}}>
          <ColeccionMiniMap
            latitud={coleccion.latitud}
            longitud={coleccion.longitud}
            localidad={coleccion.campobase_localidad || coleccion.detalle_localidad}
            provincia={coleccion.campobase_provincia || coleccion.provincia}
          />
        </div>
      )}

      {/* Cantos */}
      {cantos.length > 0 && (
        <Section title={`Cantos (${cantos.length})`}>
          <div className="space-y-6">
            {cantos.map((canto, index) => (
              <div key={canto.id_canto} className="rounded-lg border bg-muted/20 p-5">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
                  Canto #{index + 1} · {canto.gui_aud ?? ""}
                </p>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <DetailTable>
                    <Row label="GUI_AUD" value={val(canto.gui_aud)} />
                    <Row label="Autor" value={val(canto.autor)} />
                    <Row label="Fecha" value={formatDateSimple(canto.fecha)} />
                    <Row label="Hora" value={val(canto.hora)} />
                    <Row label="Equipo" value={val(canto.equipo)} />
                    <Row label="Lugar" value={val(canto.lugar)} />
                  </DetailTable>
                  <DetailTable>
                    <Row label="Temperatura" value={canto.temp != null ? `${canto.temp} °C` : "—"} />
                    <Row label="Humedad" value={canto.humedad != null ? `${canto.humedad} %` : "—"} />
                    <Row label="Nubosidad" value={canto.nubosidad != null ? `${canto.nubosidad} %` : "—"} />
                    <Row label="Distancia micrófono" value={canto.distancia_micro != null ? `${canto.distancia_micro} cm` : "—"} />
                    <Row label="Observación" value={val(canto.observacion)} />
                  </DetailTable>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Tejidos */}
      {tejidos.length > 0 && (
        <Section title={`Tejidos & Extracto (${tejidos.length})`}>
          <div className="space-y-6">
            {tejidos.map((tejido, index) => (
              <div key={tejido.id_tejido} className="rounded-lg border bg-muted/20 p-5">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
                  Tejido #{index + 1} · {tejido.codtejido ?? ""}
                </p>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <DetailTable>
                    <Row label="Código" value={val(tejido.codtejido)} />
                    <Row label="Tipo" value={val(tejido.tipotejido)} />
                    <Row label="Preservación" value={val(tejido.preservacion)} />
                    <Row label="Fecha" value={formatDateSimple(tejido.fecha)} />
                    <Row label="Estatus" value={val(tejido.estatus)} />
                  </DetailTable>
                  <DetailTable>
                    <Row label="Ubicación" value={val(tejido.ubicacion)} />
                    <Row label="Piso" value={val(tejido.piso)} />
                    <Row label="Rack" value={val(tejido.rack)} />
                    <Row label="Caja" value={val(tejido.caja)} />
                    <Row label="Coordenada" value={val(tejido.coordenada)} />
                    <Row label="Observación" value={val(tejido.observacion)} />
                  </DetailTable>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Préstamos de Colección */}
      {prestamosColeccion.length > 0 && (
        <Section title={`Préstamos de Colección (${prestamosColeccion.length})`}>
          <div className="space-y-6">
            {prestamosColeccion.map((pc, index) => (
              <div key={pc.id_prestamocoleccion} className="rounded-lg border bg-muted/20 p-5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    Préstamo #{index + 1} · {pc.prestamo?.numero_prestamo ?? ""}
                  </p>
                  {pc.prestamo?.estado && (
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                      pc.prestamo.estado === "Devuelto"
                        ? "bg-green-100 text-green-700"
                        : pc.prestamo.estado === "Pendiente"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-muted text-muted-foreground"
                    }`}>
                      {pc.prestamo.estado}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <DetailTable>
                    <Row label="Beneficiario" value={val(pc.prestamo?.beneficiario)} />
                    <Row label="Cargo" value={val(pc.prestamo?.cargo)} />
                    <Row label="Institución" value={val(pc.prestamo?.institucion)} />
                    <Row label="Email" value={val(pc.prestamo?.email)} />
                    <Row label="Teléfono" value={val(pc.prestamo?.telefono)} />
                  </DetailTable>
                  <DetailTable>
                    <Row label="Fecha préstamo" value={formatDateSimple(pc.prestamo?.fecha_prestamo)} />
                    <Row label="Fecha devolución" value={formatDateSimple(pc.prestamo?.fecha_devolucion)} />
                    <Row label="Material" value={val(pc.prestamo?.material)} />
                    <Row label="Observación" value={val(pc.observacion || pc.prestamo?.observacion)} />
                  </DetailTable>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Préstamos de Tejido */}
      {prestamosTejido.length > 0 && (
        <Section title={`Préstamos de Tejido (${prestamosTejido.length})`}>
          <div className="space-y-6">
            {prestamosTejido.map((pt, index) => (
              <div key={pt.id_prestamotejido} className="rounded-lg border bg-muted/20 p-5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    Préstamo tejido #{index + 1} · {pt.prestamo?.numero_prestamo ?? ""}
                  </p>
                  {pt.prestamo?.estado && (
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                      pt.prestamo.estado === "Devuelto"
                        ? "bg-green-100 text-green-700"
                        : pt.prestamo.estado === "Pendiente"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-muted text-muted-foreground"
                    }`}>
                      {pt.prestamo.estado}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <DetailTable>
                    <Row label="Tejido (código)" value={val(pt.tejido?.codtejido)} />
                    <Row label="Tipo tejido" value={val(pt.tejido?.tipotejido)} />
                    <Row label="Beneficiario" value={val(pt.prestamo?.beneficiario)} />
                    <Row label="Institución" value={val(pt.prestamo?.institucion)} />
                  </DetailTable>
                  <DetailTable>
                    <Row label="Fecha préstamo" value={formatDateSimple(pt.prestamo?.fecha_prestamo)} />
                    <Row label="Fecha devolución" value={formatDateSimple(pt.prestamo?.fecha_devolucion)} />
                    <Row label="Estado" value={val(pt.prestamo?.estado)} />
                    <Row label="Observación" value={val(pt.observacion || pt.prestamo?.observacion)} />
                  </DetailTable>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Histórico de Identificaciones */}
      {identificaciones.length > 0 && (
        <Section title="Histórico de Identificaciones">
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Taxon</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Comentario</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {identificaciones.map((ident) => (
                  <TableRow key={ident.id_identificacion}>
                    <TableCell className="italic text-sm">{val(ident.taxon_nombre)}</TableCell>
                    <TableCell className="text-sm">{val(ident.responsable)}</TableCell>
                    <TableCell className="text-sm">{formatDateSimple(ident.fecha)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{val(ident.comentario)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Section>
      )}

      {/* Cuerpos de Agua */}
      {cuerposAgua.length > 0 && (
        <Section title={`Cuerpos de Agua (${cuerposAgua.length})`}>
          <div className="space-y-6">
            {cuerposAgua.map((ca, index) => (
              <div key={ca.id_cuerpoagua} className="rounded-lg border bg-muted/20 p-5">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
                  Cuerpo de agua #{index + 1} {ca.nombre ? `· ${ca.nombre}` : ""}
                </p>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <DetailTable>
                    <Row label="Nombre" value={val(ca.nombre)} />
                    <Row label="Tipo" value={val(ca.tipo)} />
                    <Row label="Temp. ambiente" value={ca.temperatura_ambiente != null ? `${ca.temperatura_ambiente} °C` : "—"} />
                    <Row label="Oxígeno disuelto" value={ca.oxigeno_disuelto != null ? `${ca.oxigeno_disuelto} ppm` : "—"} />
                    <Row label="pH" value={val(ca.ph)} />
                    <Row label="Temp." value={val(ca.temp)} />
                    <Row label="Nota" value={val(ca.nota)} />
                  </DetailTable>
                  <DetailTable>
                    <Row label="µS/tm" value={val(ca.ustm)} />
                    <Row label="µS/tmᴬ" value={val(ca.ustma)} />
                    <Row label="MΩ•cm" value={val(ca.mocm)} />
                    <Row label="FNU" value={val(ca.fnu)} />
                    <Row label="PSI" value={val(ca.psi)} />
                    <Row label="PSU" value={val(ca.psu)} />
                    <Row label="Latitud" value={val(ca.lat)} />
                    <Row label="Longitud" value={val(ca.lon)} />
                    <Row label="Equipo" value={val(ca.equipo)} />
                  </DetailTable>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

    </main>
  );
}
