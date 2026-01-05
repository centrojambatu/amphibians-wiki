"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

// Función helper para formatear valores
const formatValue = (value: any): string => {
  if (value === null || value === undefined || value === "") {
    return "No disponible";
  }
  if (typeof value === "boolean") {
    return value ? "Sí" : "No";
  }
  if (typeof value === "number") {
    return value.toString();
  }
  return String(value);
};

// Función helper para formatear fechas
const formatDateSimple = (date: string | null | undefined): string => {
  if (!date) return "No disponible";
  try {
    return new Date(date).toLocaleDateString("es-ES");
  } catch {
    return "No disponible";
  }
};

// Componente para mostrar un campo con label
const Field = ({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) => (
  <div className={className}>
    <span className="text-muted-foreground text-xs font-semibold">{label}:</span>{" "}
    <span className="text-sm">{value}</span>
  </div>
);

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
  // Separar colectores principales y secundarios
  const colectorPrincipal = coleccionPersonal.find((cp) => cp.principal);
  const colectoresSecundarios = coleccionPersonal.filter((cp) => !cp.principal);

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-2 text-sm">
          <Link href={especieUrl} className="text-muted-foreground hover:underline">
            ← Ficha de la especie
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link href={coleccionesUrl} className="text-muted-foreground hover:underline">
            Colecciones
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium">Detalle</span>
        </div>
        <h1 className="mb-2 text-4xl font-bold">Colección</h1>
        <p className="text-muted-foreground text-lg">
          {coleccion.campobase_nombre && coleccion.fecha_col
            ? `${new Date(coleccion.fecha_col).getFullYear()}: ${coleccion.campobase_nombre}`
            : coleccion.campobase_nombre || `ID: ${coleccion.id_coleccion}`}
          {coleccion.gui && ` - ${coleccion.gui}`}
        </p>
      </div>

      {/* Información básica en dos columnas */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Información General</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Columna izquierda */}
            <div className="space-y-4">
              {/* Serie de campo */}
              <div className="rounded-lg border bg-muted/30 p-3">
                <h4 className="mb-2 text-sm font-semibold">Serie de Campo</h4>
                <div className="grid grid-cols-3 gap-2">
                  <Field label="SC" value={formatValue(coleccion.sc)} />
                  <Field label="GUI" value={formatValue(coleccion.gui)} />
                  <Field label="# Museo" value={formatValue(coleccion.num_museo)} />
                </div>
                <div className="mt-2">
                  <Field label="# Colector" value={formatValue(coleccion.num_colector)} />
                </div>
              </div>

              {/* Identificación */}
              <div className="rounded-lg border bg-muted/30 p-3">
                <h4 className="mb-2 text-sm font-semibold">Identificación</h4>
                <div className="space-y-1">
                  <Field label="Especie" value={formatValue(coleccion.taxon_nombre)} />
                  <Field label="Estatus" value={formatValue(coleccion.estatus_identificacion)} />
                  <Field label="Posible ID" value={formatValue(coleccion.identificacion_posible)} />
                  <Field label="Identificado por" value={formatValue(coleccion.identificado_por)} />
                  <Field label="Fecha ID" value={formatDateSimple(coleccion.fecha_identifica)} />
                </div>
              </div>

              {/* Datos biológicos */}
              <div className="rounded-lg border bg-muted/30 p-3">
                <h4 className="mb-2 text-sm font-semibold">Datos Biológicos</h4>
                <div className="grid grid-cols-3 gap-2">
                  <Field label="Estadío" value={formatValue(coleccion.estadio)} />
                  <Field label="# Indiv." value={formatValue(coleccion.numero_individuos)} />
                  <Field label="Sexo" value={formatValue(coleccion.sexo)} />
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <Field label="SVL (mm)" value={formatValue(coleccion.svl)} />
                  <Field label="Peso (g)" value={formatValue(coleccion.peso)} />
                  <Field label="Estatus Tipo" value={formatValue(coleccion.estatus_tipo)} />
                </div>
              </div>

              {/* Colección */}
              <div className="rounded-lg border bg-muted/30 p-3">
                <h4 className="mb-2 text-sm font-semibold">Colección</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Fecha" value={formatDateSimple(coleccion.fecha_col)} />
                  <Field label="Hora" value={formatValue(coleccion.hora)} />
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Field label="Estado" value={formatValue(coleccion.estado)} />
                  <Field label="Permiso" value={formatValue(coleccion.permiso_npicmpf)} />
                </div>
              </div>
            </div>

            {/* Columna derecha */}
            <div className="space-y-4">
              {/* Localidad */}
              <div className="rounded-lg border bg-muted/30 p-3">
                <h4 className="mb-2 text-sm font-semibold">Localidad</h4>
                <div className="space-y-1">
                  <Field label="Campo Base" value={formatValue(coleccion.campobase_nombre)} />
                  <Field
                    label="Provincia"
                    value={formatValue(coleccion.campobase_provincia || coleccion.provincia)}
                  />
                  <Field
                    label="Localidad"
                    value={formatValue(
                      coleccion.campobase_localidad || coleccion.detalle_localidad
                    )}
                  />
                </div>
              </div>

              {/* Coordenadas */}
              <div className="rounded-lg border bg-muted/30 p-3">
                <h4 className="mb-2 text-sm font-semibold">Coordenadas Geográficas</h4>
                <div className="grid grid-cols-3 gap-2">
                  <Field label="Latitud" value={formatValue(coleccion.latitud)} />
                  <Field label="Longitud" value={formatValue(coleccion.longitud)} />
                  <Field
                    label="Altitud"
                    value={
                      coleccion.altitud !== null ? `${coleccion.altitud} m` : "No disponible"
                    }
                  />
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Field label="Sist. Coord." value={formatValue(coleccion.sistema_coordenadas)} />
                  <Field label="Fuente" value={formatValue(coleccion.fuente_coord)} />
                </div>
                <div className="mt-2">
                  <span className="text-muted-foreground text-xs font-semibold">GBIF:</span>{" "}
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${
                      coleccion.gbif
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {coleccion.gbif ? "Sí" : "No"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="principal" className="w-full">
        <TabsList className="mb-4 w-full justify-start">
          <TabsTrigger value="principal">Principal</TabsTrigger>
          <TabsTrigger value="canto">Canto ({cantos.length})</TabsTrigger>
          <TabsTrigger value="tejido">Tejido & Extracto ({tejidos.length})</TabsTrigger>
          <TabsTrigger value="prestamos">
            Préstamos ({prestamosColeccion.length + prestamosTejido.length})
          </TabsTrigger>
          <TabsTrigger value="miscelaneos">Misceláneos</TabsTrigger>
        </TabsList>

        {/* Tab Principal */}
        <TabsContent value="principal">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Columna izquierda */}
            <div className="space-y-4">
              {/* Colectores */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Colectores</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Field
                    label="Colector Principal"
                    value={
                      colectorPrincipal?.personal?.nombre ||
                      coleccion.personal_nombre ||
                      coleccion.colectores ||
                      "No disponible"
                    }
                  />
                  {(colectoresSecundarios.length > 0 ||
                    coleccion.personal_adicional_nombres) && (
                    <div>
                      <span className="text-muted-foreground text-xs font-semibold">
                        Colectores secundarios:
                      </span>
                      <div className="mt-1 max-h-24 overflow-y-auto rounded border bg-muted/30 p-2">
                        {colectoresSecundarios.length > 0 ? (
                          colectoresSecundarios.map((cp) => (
                            <div key={cp.id_coleccionpersonal} className="text-sm">
                              {cp.personal?.nombre || "Sin nombre"}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm">{coleccion.personal_adicional_nombres}</p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Extracto y Tejido */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Muestras</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Field
                      label="Extracto de piel"
                      value={coleccion.extrato_piel_count ? "Sí" : "No"}
                    />
                    <Field label="Tejido" value={tejidos.length > 0 ? "Sí" : "No"} />
                  </div>
                </CardContent>
              </Card>

              {/* Fotos */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Fotos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Foto in-situ" value={formatValue(coleccion.foto_insitu)} />
                    <Field label="Autor" value={formatValue(coleccion.autor_foto_is)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Foto ex-situ" value={formatValue(coleccion.foto_exsitu)} />
                    <Field label="Autor" value={formatValue(coleccion.autor_foto_es)} />
                  </div>
                  {coleccion.nota_foto && (
                    <div className="mt-2">
                      <span className="text-muted-foreground text-xs font-semibold">
                        Nota foto:
                      </span>
                      <p className="mt-1 whitespace-pre-wrap text-sm">{coleccion.nota_foto}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Columna derecha */}
            <div className="space-y-4">
              {/* Hábitat */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Hábitat</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm">
                    {formatValue(coleccion.habitat)}
                  </p>
                </CardContent>
              </Card>

              {/* Datos ambientales */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Datos Ambientales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <Field
                      label="Temp."
                      value={
                        coleccion.temperatura
                          ? `${coleccion.temperatura} °C`
                          : "No disponible"
                      }
                    />
                    <Field
                      label="Humedad"
                      value={
                        coleccion.humedad ? `${coleccion.humedad} %` : "No disponible"
                      }
                    />
                    <Field label="pH" value={formatValue(coleccion.ph)} />
                  </div>
                </CardContent>
              </Card>

              {/* Métodos */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Preservación</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Field
                    label="Método de preservación"
                    value={formatValue(coleccion.metodo_preservacion)}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Field
                      label="Método de fijación"
                      value={formatValue(coleccion.metodo_fijacion)}
                    />
                    <Field label="Fecha" value={formatDateSimple(coleccion.fecha_fijacion)} />
                  </div>
                </CardContent>
              </Card>

              {/* Observación */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Observación</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm">
                    {formatValue(coleccion.observacion)}
                  </p>
                </CardContent>
              </Card>

              {/* Responsable */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Registro</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Field
                      label="Responsable ingreso"
                      value={formatValue(coleccion.responsable_ingreso)}
                    />
                    <Field
                      label="No. cuaderno campo"
                      value={formatValue(coleccion.numero_cuadernocampo)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab Canto */}
        <TabsContent value="canto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cantos ({cantos.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {cantos.length > 0 ? (
                <div className="space-y-6">
                  {cantos.map((canto, index) => (
                    <div
                      key={canto.id_canto}
                      className={`rounded-lg border bg-muted/30 p-4 ${index > 0 ? "mt-4" : ""}`}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-primary">
                          Canto #{index + 1} - {formatValue(canto.gui_aud)}
                        </h4>
                        <span className="text-muted-foreground text-xs">
                          ID: {canto.id_canto}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Columna izquierda */}
                        <div className="space-y-2">
                          <Field label="GUI_AUD" value={formatValue(canto.gui_aud)} />
                          <Field label="AUTOR" value={formatValue(canto.autor)} />
                          <div className="grid grid-cols-2 gap-2">
                            <Field label="FECHA" value={formatDateSimple(canto.fecha)} />
                            <Field label="HORA" value={formatValue(canto.hora)} />
                          </div>
                          <Field label="EQUIPO" value={formatValue(canto.equipo)} />
                          <Field label="LUGAR" value={formatValue(canto.lugar)} />
                        </div>
                        {/* Columna derecha */}
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <Field
                              label="TEMP"
                              value={
                                canto.temp ? `${canto.temp} °C` : "No disponible"
                              }
                            />
                            <Field
                              label="HUMEDAD"
                              value={
                                canto.humedad ? `${canto.humedad} %` : "No disponible"
                              }
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Field
                              label="NUBOSIDAD"
                              value={
                                canto.nubosidad
                                  ? `${canto.nubosidad} %`
                                  : "No disponible"
                              }
                            />
                            <Field
                              label="DISTANCIA_MICRO"
                              value={
                                canto.distancia_micro
                                  ? `${canto.distancia_micro} cm`
                                  : "No disponible"
                              }
                            />
                          </div>
                          {canto.observacion && (
                            <div>
                              <span className="text-muted-foreground text-xs font-semibold">
                                OBSERVACIÓN:
                              </span>
                              <p className="mt-1 whitespace-pre-wrap text-sm">
                                {canto.observacion}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground py-8 text-center">
                  No hay cantos registrados para esta colección
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Tejido & Extracto */}
        <TabsContent value="tejido">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tejidos & Extracto ({tejidos.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {tejidos.length > 0 ? (
                <div className="space-y-6">
                  {tejidos.map((tejido, index) => (
                    <div
                      key={tejido.id_tejido}
                      className={`rounded-lg border bg-muted/30 p-4 ${index > 0 ? "mt-4" : ""}`}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-primary">
                          Tejido #{index + 1} - {formatValue(tejido.codtejido)}
                        </h4>
                        <span className="text-muted-foreground text-xs">
                          ID: {tejido.id_tejido}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Columna izquierda */}
                        <div className="space-y-2">
                          <Field label="CODTEJIDO" value={formatValue(tejido.codtejido)} />
                          <Field label="TIPOTEJIDO" value={formatValue(tejido.tipotejido)} />
                          <Field label="PRESERVACION" value={formatValue(tejido.preservacion)} />
                          <Field label="FECHA" value={formatDateSimple(tejido.fecha)} />
                          <Field label="ESTATUS" value={formatValue(tejido.estatus)} />
                        </div>
                        {/* Columna derecha - Ubicación */}
                        <div className="space-y-2">
                          <Field label="UBICACION" value={formatValue(tejido.ubicacion)} />
                          <div className="grid grid-cols-2 gap-2">
                            <Field label="PISO" value={formatValue(tejido.piso)} />
                            <Field label="RACK" value={formatValue(tejido.rack)} />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Field label="CAJA" value={formatValue(tejido.caja)} />
                            <Field label="COORDENADA" value={formatValue(tejido.coordenada)} />
                          </div>
                          {tejido.observacion && (
                            <div>
                              <span className="text-muted-foreground text-xs font-semibold">
                                OBSERVACIÓN:
                              </span>
                              <p className="mt-1 whitespace-pre-wrap text-sm">
                                {tejido.observacion}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground py-8 text-center">
                  No hay tejidos registrados para esta colección
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Préstamos */}
        <TabsContent value="prestamos">
          <div className="space-y-6">
            {/* Préstamos de Colección */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Préstamos de Colección ({prestamosColeccion.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {prestamosColeccion.length > 0 ? (
                  <div className="space-y-6">
                    {prestamosColeccion.map((pc, index) => (
                      <div
                        key={pc.id_prestamocoleccion}
                        className={`rounded-lg border bg-muted/30 p-4 ${index > 0 ? "mt-4" : ""}`}
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-primary">
                            Préstamo #{index + 1} - {formatValue(pc.prestamo?.numero_prestamo)}
                          </h4>
                          <span
                            className={`rounded px-2 py-0.5 text-xs font-medium ${
                              pc.prestamo?.estado === "Devuelto"
                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                : pc.prestamo?.estado === "Pendiente"
                                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {formatValue(pc.prestamo?.estado)}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          {/* Columna izquierda - Beneficiario */}
                          <div className="space-y-2">
                            <Field
                              label="NUMERO_PRESTAMO"
                              value={formatValue(pc.prestamo?.numero_prestamo)}
                            />
                            <Field
                              label="BENEFICIARIO"
                              value={formatValue(pc.prestamo?.beneficiario)}
                            />
                            <Field label="CARGO" value={formatValue(pc.prestamo?.cargo)} />
                            <Field
                              label="INSTITUCION"
                              value={formatValue(pc.prestamo?.institucion)}
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <Field
                                label="TELEFONO"
                                value={formatValue(pc.prestamo?.telefono)}
                              />
                              <Field label="EMAIL" value={formatValue(pc.prestamo?.email)} />
                            </div>
                            {pc.prestamo?.web && (
                              <Field label="WEB" value={formatValue(pc.prestamo?.web)} />
                            )}
                          </div>
                          {/* Columna derecha - Fechas y Estado */}
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <Field
                                label="FECHA_PRESTAMO"
                                value={formatDateSimple(pc.prestamo?.fecha_prestamo)}
                              />
                              <Field
                                label="FECHA_DEVOLUCION"
                                value={formatDateSimple(pc.prestamo?.fecha_devolucion)}
                              />
                            </div>
                            <Field label="ESTADO" value={formatValue(pc.prestamo?.estado)} />
                            <Field
                              label="MATERIAL"
                              value={formatValue(pc.prestamo?.material)}
                            />
                            {(pc.observacion || pc.prestamo?.observacion) && (
                              <div>
                                <span className="text-muted-foreground text-xs font-semibold">
                                  OBSERVACIÓN:
                                </span>
                                <p className="mt-1 whitespace-pre-wrap text-sm">
                                  {pc.observacion || pc.prestamo?.observacion}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground py-4 text-center">
                    No hay préstamos de colección registrados
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Préstamos de Tejido */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Préstamos de Tejido ({prestamosTejido.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {prestamosTejido.length > 0 ? (
                  <div className="space-y-6">
                    {prestamosTejido.map((pt, index) => (
                      <div
                        key={pt.id_prestamotejido}
                        className={`rounded-lg border bg-muted/30 p-4 ${index > 0 ? "mt-4" : ""}`}
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-primary">
                            Préstamo Tejido #{index + 1} -{" "}
                            {formatValue(pt.prestamo?.numero_prestamo)}
                          </h4>
                          <span
                            className={`rounded px-2 py-0.5 text-xs font-medium ${
                              pt.prestamo?.estado === "Devuelto"
                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                : pt.prestamo?.estado === "Pendiente"
                                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {formatValue(pt.prestamo?.estado)}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          {/* Columna izquierda - Tejido y Beneficiario */}
                          <div className="space-y-2">
                            <div className="rounded border bg-background/50 p-2">
                              <span className="text-muted-foreground text-xs font-semibold">
                                Tejido prestado:
                              </span>
                              <div className="mt-1">
                                <Field
                                  label="CODTEJIDO"
                                  value={formatValue(pt.tejido?.codtejido)}
                                />
                                <Field
                                  label="TIPOTEJIDO"
                                  value={formatValue(pt.tejido?.tipotejido)}
                                />
                              </div>
                            </div>
                            <Field
                              label="NUMERO_PRESTAMO"
                              value={formatValue(pt.prestamo?.numero_prestamo)}
                            />
                            <Field
                              label="BENEFICIARIO"
                              value={formatValue(pt.prestamo?.beneficiario)}
                            />
                            <Field label="CARGO" value={formatValue(pt.prestamo?.cargo)} />
                            <Field
                              label="INSTITUCION"
                              value={formatValue(pt.prestamo?.institucion)}
                            />
                          </div>
                          {/* Columna derecha - Contacto y Fechas */}
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <Field
                                label="TELEFONO"
                                value={formatValue(pt.prestamo?.telefono)}
                              />
                              <Field label="EMAIL" value={formatValue(pt.prestamo?.email)} />
                            </div>
                            {pt.prestamo?.web && (
                              <Field label="WEB" value={formatValue(pt.prestamo?.web)} />
                            )}
                            <div className="grid grid-cols-2 gap-2">
                              <Field
                                label="FECHA_PRESTAMO"
                                value={formatDateSimple(pt.prestamo?.fecha_prestamo)}
                              />
                              <Field
                                label="FECHA_DEVOLUCION"
                                value={formatDateSimple(pt.prestamo?.fecha_devolucion)}
                              />
                            </div>
                            <Field label="ESTADO" value={formatValue(pt.prestamo?.estado)} />
                            <Field
                              label="MATERIAL"
                              value={formatValue(pt.prestamo?.material)}
                            />
                            {(pt.observacion || pt.prestamo?.observacion) && (
                              <div>
                                <span className="text-muted-foreground text-xs font-semibold">
                                  OBSERVACIÓN:
                                </span>
                                <p className="mt-1 whitespace-pre-wrap text-sm">
                                  {pt.observacion || pt.prestamo?.observacion}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground py-4 text-center">
                    No hay préstamos de tejido registrados
                  </p>
                )}

                {/* Nota informativa */}
                <p className="text-muted-foreground mt-4 border-t pt-4 text-xs">
                  Si la fecha del préstamo, devolución, plazo y estado se encuentran en rojo, el
                  especimen no podrá ser incluido en un nuevo préstamo hasta normalizar el estado
                  del especimen.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Misceláneos */}
        <TabsContent value="miscelaneos">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Columna izquierda */}
            <div className="space-y-4">
              {/* Histórico de identificaciones */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Histórico de Identificaciones</CardTitle>
                </CardHeader>
                <CardContent>
                  {identificaciones.length > 0 ? (
                    <div className="space-y-4">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Taxon</TableHead>
                              <TableHead>Responsable</TableHead>
                              <TableHead>Fecha</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {identificaciones.map((ident) => (
                              <TableRow key={ident.id_identificacion}>
                                <TableCell className="italic">
                                  {formatValue(ident.taxon_nombre)}
                                </TableCell>
                                <TableCell>{formatValue(ident.responsable)}</TableCell>
                                <TableCell>{formatDateSimple(ident.fecha)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      {identificaciones[0]?.comentario && (
                        <div>
                          <span className="text-muted-foreground text-xs font-semibold">
                            Comentario:
                          </span>
                          <p className="mt-1 text-sm">{identificaciones[0].comentario}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground py-4 text-center">
                      No hay identificaciones registradas
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Permiso/Contrato */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Permiso/Contrato</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Field label="NPICMPF" value={formatValue(coleccion.permiso_npicmpf)} />
                  <Field
                    label="Tipo autorización"
                    value={formatValue(coleccion.permiso_tipo_autorizacion)}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Field
                      label="Fecha inicio"
                      value={formatDateSimple(coleccion.permiso_fecha_ini)}
                    />
                    <Field
                      label="Fecha fin"
                      value={formatDateSimple(coleccion.permiso_fecha_fin)}
                    />
                  </div>
                  <Field label="Estado" value={formatValue(coleccion.permiso_estado)} />
                  {coleccion.permiso_observacion && (
                    <div>
                      <span className="text-muted-foreground text-xs font-semibold">
                        Observación:
                      </span>
                      <p className="mt-1 text-sm">{coleccion.permiso_observacion}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Columna derecha */}
            <div className="space-y-4">
              {/* Cuerpos de agua - Usando relación directa */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Cuerpos de Agua ({cuerposAgua.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {cuerposAgua.length > 0 ? (
                    <div className="max-h-96 space-y-6 overflow-y-auto p-6">
                      {cuerposAgua.map((ca, index) => (
                        <div
                          key={ca.id_cuerpoagua}
                          className="rounded-lg border bg-muted/30 p-4 shadow-sm"
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-primary">
                              Cuerpo de Agua #{index + 1}
                            </h4>
                            <span className="text-muted-foreground rounded bg-muted px-2 py-0.5 text-xs">
                              ID: {ca.id_cuerpoagua}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* Columna izquierda */}
                            <div className="space-y-2">
                              <Field label="NOMBRE" value={formatValue(ca.nombre)} />
                              <div className="grid grid-cols-2 gap-2">
                                <Field
                                  label="TEMPERATURA_AMBIENTE"
                                  value={
                                    ca.temperatura_ambiente
                                      ? `${ca.temperatura_ambiente} °C`
                                      : "No disponible"
                                  }
                                />
                                <Field
                                  label="OXIGENO_DISUELTO"
                                  value={
                                    ca.oxigeno_disuelto
                                      ? `${ca.oxigeno_disuelto} ppm`
                                      : "No disponible"
                                  }
                                />
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                <Field label="µS/tm" value={formatValue(ca.ustm)} />
                                <Field label="µS/tmᴬ" value={formatValue(ca.ustma)} />
                                <Field label="MΩ•cm" value={formatValue(ca.mocm)} />
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                <Field label="FNU" value={formatValue(ca.fnu)} />
                                <Field
                                  label="TEMP"
                                  value={ca.temp ? `${ca.temp}` : "No disponible"}
                                />
                                <Field label="PSI" value={formatValue(ca.psi)} />
                              </div>
                              {ca.nota && (
                                <div>
                                  <span className="text-muted-foreground text-xs font-semibold">
                                    NOTA:
                                  </span>
                                  <p className="mt-1 text-sm">{ca.nota}</p>
                                </div>
                              )}
                            </div>

                            {/* Columna derecha */}
                            <div className="space-y-2">
                              <Field
                                label="ID_CAMPOBASE"
                                value={formatValue(coleccion.campobase_nombre)}
                              />
                              <Field label="TIPO" value={formatValue(ca.tipo)} />
                              <div className="grid grid-cols-3 gap-2">
                                <Field label="mV_PH" value={formatValue(ca.mv_ph)} />
                                <Field label="PH" value={formatValue(ca.ph)} />
                                <Field label="MVORP" value={formatValue(ca.mvorp)} />
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                <Field label="ppmTd" value={formatValue(ca.ppmtd)} />
                                <Field label="PSU" value={formatValue(ca.psu)} />
                                <Field label="Ot" value={formatValue(ca.ot)} />
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                <Field label="LATITUD" value={formatValue(ca.lat)} />
                                <Field label="LONGITUD" value={formatValue(ca.lon)} />
                                <Field label="DATUM" value={formatValue(ca.datum)} />
                              </div>
                              <Field
                                label="COD_LOTE_DATOS"
                                value={formatValue(ca.cod_lote_datos)}
                              />
                              <Field label="EQUIPO" value={formatValue(ca.equipo)} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground p-6 text-center">
                      No hay cuerpos de agua registrados para este campo base
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Nombre común */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Nombre Común</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Field label="Nombre" value={formatValue(coleccion.nombre_comun)} />
                  <Field label="Idioma" value={formatValue(coleccion.idioma_nc)} />
                  <Field label="Fuente" value={formatValue(coleccion.fuente_nombrecomun)} />
                </CardContent>
              </Card>

              {/* Clasificación taxonómica */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Clasificación Taxonómica</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Field label="Clase" value="Amphibia" />
                  <Field label="Orden" value={formatValue(coleccion.taxon_orden) || "Anura"} />
                  <Field label="Familia" value={formatValue(coleccion.taxon_familia)} />
                  <Field label="Género" value={formatValue(coleccion.taxon_genero)} />
                  <Field label="Especie" value={formatValue(coleccion.taxon_nombre)} />
                </CardContent>
              </Card>

              {/* Información adicional */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información Adicional</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Field label="Rango" value={formatValue(coleccion.rango)} />
                  <div className="grid grid-cols-3 gap-4">
                    <Field label="SC Acrónimo" value={formatValue(coleccion.sc_acronimo)} />
                    <Field label="SC Número" value={formatValue(coleccion.sc_numero)} />
                    <Field label="SC Sufijo" value={formatValue(coleccion.sc_sufijo)} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
