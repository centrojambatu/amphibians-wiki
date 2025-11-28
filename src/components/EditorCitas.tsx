"use client";

import {useState, useEffect} from "react";
import {useRouter} from "next/navigation";
import {Save, Eye, Plus, ChevronDown, ChevronLeft, ChevronRight} from "lucide-react";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {FichaEspecieEditor} from "@/app/sapopedia/editor-citas/get-ficha-especie-editor";
import {Publicacion} from "@/app/sapopedia/editor-citas/get-publicaciones-taxon";
import {EspecieNavegacion, toSlug} from "@/app/sapopedia/editor-citas/get-especies-navegacion";

import EditorCitasSearch from "./EditorCitasSearch";

interface EditorCitasProps {
  readonly fichaEspecie: FichaEspecieEditor;
  readonly publicaciones: Publicacion[];
  readonly nombreCientifico: string;
  readonly taxonId: number;
  readonly siguienteEspecie: EspecieNavegacion | null;
  readonly anteriorEspecie: EspecieNavegacion | null;
}

// Campos editables de ficha_especie
const CAMPOS_FICHA = [
  {key: "informacion_adicional" as const, label: "Información Adicional"},
  {key: "colector" as const, label: "Colector"},
  {key: "etimologia" as const, label: "Etimología"},
  {key: "taxonomia" as const, label: "Taxonomía"},
  {key: "habitat_biologia" as const, label: "Hábitat y Biología"},
  {key: "dieta" as const, label: "Dieta"},
  {key: "reproduccion" as const, label: "Reproducción"},
  {key: "identificacion" as const, label: "Identificación"},
  {key: "descripcion" as const, label: "Descripción"},
  {key: "diagnosis" as const, label: "Diagnosis"},
  {key: "morfometria" as const, label: "Morfometría"},
  {key: "color_en_vida" as const, label: "Color en Vida"},
  {key: "color_en_preservacion" as const, label: "Color en Preservación"},
  {key: "larva" as const, label: "Larva"},
  {key: "canto" as const, label: "Canto"},
  {key: "distribucion" as const, label: "Distribución"},
  {key: "distribucion_global" as const, label: "Distribución Global"},
  {key: "rango_altitudinal" as const, label: "Rango Altitudinal"},
  {key: "observacion_zona_altitudinal" as const, label: "Observación Zona Altitudinal"},
  {key: "referencia_area_protegida" as const, label: "Referencia Área Protegida"},
  {key: "comentario_estatus_poblacional" as const, label: "Comentario Estatus Poblacional"},
  {key: "sinonimia" as const, label: "Sinonimia"},
  {key: "agradecimiento" as const, label: "Agradecimiento"},
  {key: "usos" as const, label: "Usos"},
];

export default function EditorCitas({
  fichaEspecie: initialFicha,
  publicaciones,
  nombreCientifico,
  taxonId,
  siguienteEspecie,
  anteriorEspecie,
}: EditorCitasProps) {
  const router = useRouter();
  const [fichaEspecie, setFichaEspecie] = useState<FichaEspecieEditor>(initialFicha);
  const [campoSeleccionado, setCampoSeleccionado] = useState<string>("informacion_adicional");
  const [textoEditor, setTextoEditor] = useState<string>(initialFicha.informacion_adicional || "");
  const [vistaPrevia, setVistaPrevia] = useState<string>("");
  const [mostrarVistaPrevia, setMostrarVistaPrevia] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Actualizar el texto del editor cuando cambia el campo seleccionado
  useEffect(() => {
    const valor = (fichaEspecie[campoSeleccionado as keyof FichaEspecieEditor] as string) || "";

    setTextoEditor(valor);
    setVistaPrevia("");
    setMostrarVistaPrevia(false);
  }, [campoSeleccionado, fichaEspecie]);

  // Generar vista previa reemplazando {{id_publicacion}} con cita_corta
  const generarVistaPrevia = () => {
    let preview = textoEditor;
    // Buscar patrones como {{123}} donde 123 es id_publicacion
    const citasEncontradas = textoEditor.match(/\{\{(\d+)\}\}/g) || [];

    citasEncontradas.forEach((match) => {
      const idPublicacion = Number.parseInt(match.replaceAll(/\{\{|\}\}/g, ""), 10);
      // Buscar la publicación por id_publicacion
      const publicacion = publicaciones.find((pub) => pub.id_publicacion === idPublicacion);

      if (publicacion?.cita_corta) {
        // Reemplazar {{id_publicacion}} con cita_corta en la vista previa
        preview = preview.replace(match, publicacion.cita_corta);
      }
    });

    setVistaPrevia(preview);
    setMostrarVistaPrevia(true);
  };

  // Insertar cita en el editor usando id_publicacion
  const insertarCita = (idPublicacion: number) => {
    const nuevaCita = `{{${String(idPublicacion)}}}`;

    setTextoEditor((prev) => prev + (prev ? " " : "") + nuevaCita);
  };

  // Guardar cambios
  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      // Guardar el texto tal cual, con {{id_publicacion}} ya insertado
      const textoConCitas = textoEditor;

      // Actualizar el campo en la ficha
      const fichaActualizada = {
        ...fichaEspecie,
        [campoSeleccionado]: textoConCitas,
      };

      // Logs solo en desarrollo
      if (process.env.NODE_ENV === "development") {
        console.log("Guardando campo:", campoSeleccionado);
        console.log("Valor original:", textoEditor);
        console.log("Valor con citas convertidas:", textoConCitas);
      }

      const response = await fetch(`/api/ficha-especie/${taxonId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fichaActualizada),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        console.error("Error al guardar:", errorData);
        throw new Error(errorData.error || "Error al guardar");
      }

      const data = await response.json();

      console.log("Guardado exitoso:", data);

      setFichaEspecie(fichaActualizada);
      setSaveMessage("Guardado exitosamente");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error("Error al guardar:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error al guardar. Por favor, intenta de nuevo.";

      setSaveMessage(`Error: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const campoActual = CAMPOS_FICHA.find((c) => c.key === campoSeleccionado);

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Editor de Textos con Citas</h1>
          <div className="flex items-center gap-2">
            <Button
              className="flex items-center gap-1"
              disabled={!anteriorEspecie}
              size="sm"
              variant="outline"
              onClick={() =>
                anteriorEspecie &&
                router.push(`/sapopedia/editor-citas/${toSlug(anteriorEspecie.taxon)}`)
              }
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              className="flex items-center gap-1"
              disabled={!siguienteEspecie}
              size="sm"
              variant="outline"
              onClick={() =>
                siguienteEspecie &&
                router.push(`/sapopedia/editor-citas/${toSlug(siguienteEspecie.taxon)}`)
              }
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Two Panels */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel */}
        <div className="flex w-1/2 flex-col border-r bg-white">
          {/* Especie Selector con Buscador */}
          <div className="space-y-3 border-b p-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Buscar Especie</label>
              <EditorCitasSearch />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Especie Actual
                </label>
                <Input
                  readOnly
                  className="bg-gray-50 text-gray-600"
                  type="text"
                  value={nombreCientifico}
                />
              </div>
              <div className="flex-1">
                <label className="mb-2 block text-sm font-medium text-gray-700">Taxon ID</label>
                <Input
                  readOnly
                  className="bg-gray-50 text-gray-600"
                  type="text"
                  value={taxonId.toString()}
                />
              </div>
            </div>
          </div>

          {/* Text Editor */}
          <div className="flex-1 overflow-hidden p-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">Editor de Texto</label>
            <Textarea
              className="h-full min-h-[400px] resize-none font-mono text-sm"
              placeholder="Escribe el texto aquí. Usa el botón 'Insertar' para añadir citas con {{id_publicacion}}."
              value={textoEditor}
              onChange={(e) => setTextoEditor(e.target.value)}
            />
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex w-1/2 flex-col bg-white">
          {/* Campo Selector */}
          <div className="border-b p-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">Campo</label>
            <div className="relative">
              <select
                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
                value={campoSeleccionado}
                onChange={(e) => setCampoSeleccionado(e.target.value)}
              >
                {CAMPOS_FICHA.map((campo) => (
                  <option key={campo.key} value={campo.key}>
                    {campo.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Referencias Disponibles */}
          <div className="flex-1 overflow-y-auto border-b p-4">
            <div className="mb-4 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Referencias Disponibles</label>
              <Button className="flex items-center gap-1" size="sm" variant="outline">
                <Plus className="h-4 w-4" />
                Nueva
              </Button>
            </div>

            {publicaciones.length === 0 ? (
              <p className="text-sm text-gray-500">
                No hay referencias disponibles para esta especie.
              </p>
            ) : (
              <div className="space-y-3">
                {publicaciones.map((pub, index) => {
                  const numero = index + 1;

                  // Extraer autor del título o cita_corta
                  let autor = "";

                  if (pub.cita_corta) {
                    const matchAutor = /^([^,]+)/.exec(pub.cita_corta);

                    autor = matchAutor
                      ? matchAutor[1].trim()
                      : pub.titulo.split(",")[0]?.trim() || pub.titulo.split(" ")[0] || "";
                  } else {
                    autor = pub.titulo.split(",")[0]?.trim() || pub.titulo.split(" ")[0] || "";
                  }

                  const año = pub.numero_publicacion_ano || new Date(pub.fecha).getFullYear();

                  return (
                    <div
                      key={pub.id_publicacion}
                      className="flex items-start justify-between gap-4 rounded border border-gray-200 bg-white p-4"
                    >
                      <div className="flex-1">
                        <div className="mb-1 text-sm font-semibold text-gray-900">
                          <span className="text-gray-500">[{numero}]</span> {autor} ({año})
                        </div>
                        <div className="text-sm text-gray-700">{pub.titulo}</div>
                      </div>
                      <Button
                        className="flex-shrink-0"
                        size="sm"
                        variant="default"
                        onClick={() => insertarCita(pub.id_publicacion)}
                      >
                        Insertar
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Vista Previa */}
          <div className="flex-1 overflow-y-auto p-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">Vista Previa</label>
            {mostrarVistaPrevia ? (
              <div className="rounded border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed">
                {vistaPrevia ||
                  "No hay vista previa disponible. Haz clic en 'Ver Vista Previa' para generar."}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center rounded border border-gray-200 bg-gray-50 text-sm text-gray-500">
                Haz clic en "Ver Vista Previa" para ver el texto con las citas formateadas
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          {saveMessage && (
            <span
              className={`text-sm ${saveMessage.includes("Error") ? "text-red-600" : "text-green-600"}`}
            >
              {saveMessage}
            </span>
          )}
          <Button className="flex items-center gap-2" disabled={isSaving} onClick={handleSave}>
            <Save className="h-4 w-4" />
            Guardar
          </Button>
        </div>
        <Button className="flex items-center gap-2" variant="outline" onClick={generarVistaPrevia}>
          <Eye className="h-4 w-4" />
          Ver Vista Previa
        </Button>
      </div>
    </div>
  );
}
