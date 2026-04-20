"use client";

import { useEffect, useState } from "react";
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
  MediaColeccion,
  FotografiaColeccion,
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
  fotografias: FotografiaColeccion[];
  mediaColeccion: MediaColeccion[];
  especieUrl: string;
  coleccionesUrl: string;
}

const formatDate = (date: string | null | undefined): string => {
  if (!date) return "—";
  try {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = d.toLocaleDateString("es-ES", {month: "long"});
    const capitalMonth = month.charAt(0).toUpperCase() + month.slice(1);
    return `${day} ${capitalMonth} de ${d.getFullYear()}`;
  } catch {
    return "—";
  }
};

const v = (val: any): string => {
  if (val === null || val === undefined || val === "") return "—";
  if (typeof val === "boolean") return val ? "Sí" : "No";
  return String(val);
};

/** Sección colapsable */
function Section({title, children, count}: {title: string; children: React.ReactNode; count?: number}) {
  return (
    <section className="border-t pt-6">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-500">
        {title} {count != null && <span className="text-gray-400">({count})</span>}
      </h2>
      {children}
    </section>
  );
}

/** Fila label:valor — muestra todos los campos, vacíos como "—" */
function Field({label, value}: {label: string; value: string}) {
  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 py-1.5 last:border-0">
      <span className="shrink-0 text-xs text-gray-500">{label}</span>
      <span className={`text-right text-xs font-medium ${value === "—" ? "text-gray-300" : "text-gray-900"}`}>
        {value}
      </span>
    </div>
  );
}

/** Bloque con título y campos */
function FieldGroup({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <div>
      <h3 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">{title}</h3>
      <div className="rounded-lg border border-gray-200 bg-white p-3">
        {children}
      </div>
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
  fotografias,
  mediaColeccion,
  especieUrl,
  coleccionesUrl,
}: ColeccionDetailClientProps) {
  const c = coleccion;

  const catalogoLabel = (() => {
    const acronimo = c.catalogo_museo?.includes(" - ")
      ? c.catalogo_museo.split(" - ").pop()
      : c.catalogo_museo;
    return [acronimo, c.num_museo].filter(Boolean).join(" ") || null;
  })();

  const hasCoords = c.latitud != null && c.longitud != null;

  // Tab activa para datos relacionados
  const [activeTab, setActiveTab] = useState("fotografias");

  // GBIF lookup
  const acronimo = c.catalogo_museo?.includes(" - ")
    ? c.catalogo_museo.split(" - ").pop()?.trim()
    : c.catalogo_museo;
  const [gbifUrl, setGbifUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!acronimo || !c.num_museo) return;
    const fetchGbif = async () => {
      try {
        let institutionCode = acronimo;
        let catNumber = String(c.num_museo);
        let collectionCode: string | null = null;
        switch (acronimo) {
          case "KU": collectionCode = "KUH"; break;
          case "QCAZA": institutionCode = "QCAZ"; catNumber = `QCAZA${c.num_museo}`; break;
          case "QCAZ": catNumber = `QCAZA${c.num_museo}`; break;
          case "AMNH": catNumber = `A-${c.num_museo}`; break;
          case "USNM": catNumber = `USNM ${c.num_museo}`; break;
          case "DHMECN": catNumber = `DHMECN ${c.num_museo}`; break;
        }
        const params = new URLSearchParams({institutionCode, catalogNumber: catNumber, classKey: "131", limit: "1"});
        if (collectionCode) params.set("collectionCode", collectionCode);
        const res = await fetch(`https://api.gbif.org/v1/occurrence/search?${params.toString()}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.results?.length > 0) {
          setGbifUrl(`https://www.gbif.org/occurrence/${data.results[0].key}`);
        }
      } catch { /* silently fail */ }
    };
    fetchGbif();
  }, [acronimo, c.num_museo]);

  return (
    <main className="container mx-auto max-w-5xl space-y-6 px-4 py-6">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500">
        <Link className="hover:text-gray-900" href={especieUrl}>Especie</Link>
        <span>/</span>
        <Link className="hover:text-gray-900" href={coleccionesUrl}>Colecciones</Link>
        <span>/</span>
        <span className="font-medium text-gray-900">{catalogoLabel ?? "Detalle"}</span>
      </nav>

      {/* ═══ HEADER ═══ */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {catalogoLabel && (
              <h1 className="text-2xl font-bold tracking-tight">{catalogoLabel}</h1>
            )}
            {c.taxon_nombre && (
              <p className="text-sm italic" style={{color: "#f07304"}}>{c.taxon_nombre}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {c.fecha_coleccion && (
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium">{formatDate(c.fecha_coleccion)}</span>
            )}
            {c.estatus_tipo && (
              <span className="rounded border border-orange-200 bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-700">{c.estatus_tipo}</span>
            )}
            {gbifUrl && (
              <a
                href={gbifUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded border border-[#4ba24b]/30 bg-[#4ba24b]/5 px-2.5 py-1 text-xs font-semibold text-[#4ba24b] transition-colors hover:bg-[#4ba24b]/15"
              >
                <img src="/assets/references/gbif.png" alt="GBIF" className="h-4 w-auto" />
                Ver en GBIF
              </a>
            )}
          </div>
        </div>
        {/* Colectores */}
        <div className="mt-2 text-xs text-gray-600">
          <span className="font-medium">{v(c.personal_nombre)}</span>
          {(() => {
            const secundarios = coleccionPersonal
              .filter((cp) => !cp.principal && cp.personal?.nombre)
              .map((cp) => cp.personal!.nombre!);
            const colectoresTexto = secundarios.length > 0
              ? secundarios.join(", ")
              : c.colectores || c.personal_adicional_nombres || null;
            return colectoresTexto ? <span className="text-gray-400"> · {colectoresTexto}</span> : null;
          })()}
        </div>
      </div>

      {/* ═══ MAPA — full width ═══ */}
      {hasCoords && (
        <div className="overflow-hidden rounded-lg border border-gray-200" style={{height: 350}}>
          <ColeccionMiniMap
            latitud={c.latitud}
            longitud={c.longitud}
            localidad={c.campobase_localidad || c.detalle_localidad}
            provincia={c.campobase_provincia || c.provincia}
          />
        </div>
      )}

      {/* ═══ LOCALIDAD — full width, sin title ═══ */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="space-y-1">
          <p className="text-sm text-gray-900">
            {v(c.detalle_localidad || c.campobase_localidad)}{c.provincia || c.campobase_provincia ? `, ${c.provincia || c.campobase_provincia}` : ""}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
            {c.latitud != null && <span>{c.latitud}</span>}
            {c.longitud != null && <span>{c.longitud}</span>}
            {c.altitud != null && <span>{c.altitud} msnm</span>}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {c.estadio && <span className="rounded bg-gray-100 px-2 py-0.5 text-xs">{c.estadio}</span>}
            {c.sexo && <span className="rounded bg-gray-100 px-2 py-0.5 text-xs">{c.sexo}</span>}
            {c.estado && <span className="rounded bg-gray-100 px-2 py-0.5 text-xs">{c.estado}</span>}
            {c.svl != null && <span className="rounded bg-gray-100 px-2 py-0.5 text-xs">SVL: {c.svl} mm</span>}
            {c.peso != null && <span className="rounded bg-gray-100 px-2 py-0.5 text-xs">Peso: {c.peso} g</span>}
            {c.numero_individuos != null && <span className="rounded bg-gray-100 px-2 py-0.5 text-xs"># Indiv: {c.numero_individuos}</span>}
            {c.tejido_count != null && <span className="rounded bg-gray-100 px-2 py-0.5 text-xs">Tejidos: {c.tejido_count}</span>}
            {c.extrato_piel_count != null && <span className="rounded bg-gray-100 px-2 py-0.5 text-xs">Ext. piel: {c.extrato_piel_count}</span>}
            {c.estatus_identificacion && <span className="rounded bg-gray-100 px-2 py-0.5 text-xs">{c.estatus_identificacion}</span>}
            {c.num_colector && <span className="rounded bg-gray-100 px-2 py-0.5 text-xs"># Col: {c.num_colector}</span>}
          </div>
          {c.observacion && (
            <p className="mt-2 text-xs italic text-gray-500">{c.observacion}</p>
          )}
        </div>
      </div>


      {/* ═══ TABS DE DATOS RELACIONADOS ═══ */}
      {(() => {
        const tabs: {id: string; label: string; count: number}[] = [
          {id: "fotografias", label: "Fotografías", count: fotografias.length},
          {id: "cantos", label: "Cantos", count: cantos.length},
          {id: "tejidos", label: "Tejidos", count: tejidos.length},
          {id: "media", label: "Multimedia", count: mediaColeccion.length},
          {id: "identificaciones", label: "Identificaciones", count: identificaciones.length},
        ];

        return (
          <div>
            {/* Tab buttons */}
            <div className="flex gap-1 overflow-x-auto border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`shrink-0 border-b-2 px-4 py-2.5 text-xs font-medium transition-colors ${
                    activeTab === tab.id
                      ? "border-[#f07304] text-[#f07304]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label} <span className="ml-1 text-gray-400">({tab.count})</span>
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="pt-4">

              {/* Fotografías */}
              {activeTab === "fotografias" && (fotografias.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {fotografias.map((foto) => (
                    <a
                      key={foto.id_fotografia}
                      className="group overflow-hidden rounded-lg border"
                      href={foto.enlace || "#"}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <div className="aspect-square overflow-hidden bg-gray-100">
                        {foto.enlace ? (
                          <img
                            alt={foto.nombre || "Fotografía"}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            src={foto.enlace}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">Sin imagen</div>
                        )}
                      </div>
                      <div className="p-2">
                        {foto.nombre && <p className="line-clamp-1 text-xs font-medium text-gray-900">{foto.nombre}</p>}
                        {foto.autor && <p className="text-[11px] text-gray-500">{foto.autor}</p>}
                        {foto.fecha && <p className="text-[10px] text-gray-400">{formatDate(foto.fecha)}</p>}
                      </div>
                    </a>
                  ))}
                </div>
              ) : <p className="py-8 text-center text-sm text-gray-400">Sin registros</p>)}

              {/* Cantos */}
              {activeTab === "cantos" && (cantos.length > 0 ? (
                <div className="space-y-4">
                  {cantos.map((canto, i) => (
                    <div key={canto.id_canto} className="rounded-lg border p-4">
                      <p className="mb-2 text-[11px] font-bold tracking-widest text-gray-400 uppercase">Canto #{i + 1} · {canto.gui_aud ?? ""}</p>
                      <div className="grid grid-cols-1 gap-x-8 gap-y-0 sm:grid-cols-2">
                        <Field label="GUI_AUD" value={v(canto.gui_aud)} />
                        <Field label="Autor" value={v(canto.autor)} />
                        <Field label="Fecha" value={formatDate(canto.fecha)} />
                        <Field label="Hora" value={v(canto.hora)} />
                        <Field label="Equipo" value={v(canto.equipo)} />
                        <Field label="Lugar" value={v(canto.lugar)} />
                        <Field label="Temperatura" value={canto.temp != null ? `${canto.temp} °C` : "—"} />
                        <Field label="Humedad" value={canto.humedad != null ? `${canto.humedad} %` : "—"} />
                        <Field label="Nubosidad" value={canto.nubosidad != null ? `${canto.nubosidad} %` : "—"} />
                        <Field label="Dist. micrófono" value={canto.distancia_micro != null ? `${canto.distancia_micro} cm` : "—"} />
                        <Field label="Observación" value={v(canto.observacion)} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="py-8 text-center text-sm text-gray-400">Sin registros</p>)}

              {/* Tejidos */}
              {activeTab === "tejidos" && (tejidos.length > 0 ? (
                <div className="space-y-4">
                  {tejidos.map((t, i) => (
                    <div key={t.id_tejido} className="rounded-lg border p-4">
                      <p className="mb-2 text-[11px] font-bold tracking-widest text-gray-400 uppercase">Tejido #{i + 1} · {t.codtejido ?? ""}</p>
                      <div className="grid grid-cols-1 gap-x-8 gap-y-0 sm:grid-cols-2">
                        <Field label="Código" value={v(t.codtejido)} />
                        <Field label="Tipo" value={v(t.tipotejido)} />
                        <Field label="Preservación" value={v(t.preservacion)} />
                        <Field label="Fecha" value={formatDate(t.fecha)} />
                        <Field label="Estatus" value={v(t.estatus)} />
                        <Field label="Ubicación" value={v(t.ubicacion)} />
                        <Field label="Piso" value={v(t.piso)} />
                        <Field label="Rack" value={v(t.rack)} />
                        <Field label="Caja" value={v(t.caja)} />
                        <Field label="Coordenada" value={v(t.coordenada)} />
                        <Field label="Observación" value={v(t.observacion)} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="py-8 text-center text-sm text-gray-400">Sin registros</p>)}

              {/* Multimedia */}
              {activeTab === "media" && (mediaColeccion.length > 0 ? (() => {
                const tiposOrden: MediaColeccion["tipo_media"][] = ["imagen", "video", "audio", "pdf"];
                const tipoLabels: Record<string, string> = {imagen: "Imágenes", video: "Videos", audio: "Audio", pdf: "PDF"};
                return (
                  <div className="space-y-6">
                    {tiposOrden.map((tipo) => {
                      const items = mediaColeccion.filter((m) => m.tipo_media === tipo);
                      if (items.length === 0) return null;
                      return (
                        <div key={tipo}>
                          <p className="mb-3 text-[11px] font-bold tracking-widest text-gray-400 uppercase">{tipoLabels[tipo]} ({items.length})</p>
                          {tipo === "imagen" ? (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                              {items.map((m) => (
                                <a key={m.id_media_coleccion} className="group overflow-hidden rounded-lg border" href={m.url} rel="noopener noreferrer" target="_blank">
                                  <div className="aspect-square overflow-hidden bg-gray-100">
                                    <img alt={m.titulo || "Imagen"} className="h-full w-full object-cover transition-transform group-hover:scale-105" src={m.url_thumbnail || m.url} />
                                  </div>
                                </a>
                              ))}
                            </div>
                          ) : tipo === "audio" ? (
                            <div className="space-y-3">
                              {items.map((m) => (
                                <div key={m.id_media_coleccion} className="rounded-lg border p-4">
                                  {m.titulo && <p className="text-sm font-medium">{m.titulo}</p>}
                                  <audio className="mt-2 w-full" controls preload="none"><source src={m.url} /></audio>
                                </div>
                              ))}
                            </div>
                          ) : tipo === "video" ? (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              {items.map((m) => (
                                <div key={m.id_media_coleccion} className="overflow-hidden rounded-lg border">
                                  <div className="aspect-video">
                                    <video className="h-full w-full" controls poster={m.url_thumbnail || undefined} preload="none"><source src={m.url} /></video>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {items.map((m) => (
                                <a key={m.id_media_coleccion} className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50" href={m.url} rel="noopener noreferrer" target="_blank">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-red-50 text-xs font-bold text-red-600">PDF</div>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-gray-900">{m.titulo || "Documento"}</p>
                                  </div>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })() : <p className="py-8 text-center text-sm text-gray-400">Sin registros</p>)}

              {/* Identificaciones */}
              {activeTab === "identificaciones" && (identificaciones.length > 0 ? (
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
                          <TableCell className="text-sm italic">{v(ident.taxon_nombre)}</TableCell>
                          <TableCell className="text-sm">{v(ident.responsable)}</TableCell>
                          <TableCell className="text-sm">{formatDate(ident.fecha)}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{v(ident.comentario)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : <p className="py-8 text-center text-sm text-gray-400">Sin registros</p>)}

            </div>
          </div>
        );
      })()}


    </main>
  );
}
