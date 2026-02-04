"use client";

import {useState, useEffect, useRef} from "react";
import {useRouter} from "next/navigation";
import {Save, Eye, ChevronDown, ChevronLeft, ChevronRight} from "lucide-react";
import {useEditor, EditorContent} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {FichaEspecieEditor} from "@/app/sapopedia/editor-citas/get-ficha-especie-editor";
import {Publicacion} from "@/app/sapopedia/editor-citas/get-publicaciones-taxon";
import {EspecieNavegacion, toSlug} from "@/app/sapopedia/editor-citas/get-especies-navegacion";
import {CatalogoAweOpcion} from "@/app/sapopedia/editor-citas/get-catalogo-awe-opciones";

import EditorCitasSearch from "./EditorCitasSearch";

interface EditorCitasProps {
  readonly fichaEspecie: FichaEspecieEditor;
  readonly publicaciones: Publicacion[];
  readonly nombreCientifico: string;
  readonly taxonId: number;
  readonly siguienteEspecie: EspecieNavegacion | null;
  readonly anteriorEspecie: EspecieNavegacion | null;
  readonly catalogoAweOpciones: Record<number, CatalogoAweOpcion[]>;
  readonly taxonCatalogoAwe: Record<number, number[]>;
}

// Campos editables de ficha_especie
const CAMPOS_FICHA = [
  {
    key: "informacion_adicional" as const,
    label: "Información Adicional",
    tipo: "texto" as const,
  },
  {key: "colector" as const, label: "Colector", tipo: "texto" as const},
  {key: "etimologia" as const, label: "Etimología", tipo: "texto" as const},
  {key: "taxonomia" as const, label: "Taxonomía", tipo: "texto" as const},
  {
    key: "habitat_biologia" as const,
    label: "Hábitat y Biología",
    tipo: "texto" as const,
  },
  {key: "dieta" as const, label: "Dieta", tipo: "texto" as const},
  {
    key: "reproduccion" as const,
    label: "Reproducción",
    tipo: "texto" as const,
  },
  {
    key: "identificacion" as const,
    label: "Identificación",
    tipo: "texto" as const,
  },
  {key: "descripcion" as const, label: "Descripción", tipo: "texto" as const},
  {key: "diagnosis" as const, label: "Diagnosis", tipo: "texto" as const},
  {key: "morfometria" as const, label: "Morfometría", tipo: "texto" as const},
  {
    key: "color_en_vida" as const,
    label: "Color en Vida",
    tipo: "texto" as const,
  },
  {
    key: "color_en_preservacion" as const,
    label: "Color en Preservación",
    tipo: "texto" as const,
  },
  {key: "larva" as const, label: "Larva", tipo: "texto" as const},
  {key: "canto" as const, label: "Canto", tipo: "texto" as const},
  {
    key: "distribucion" as const,
    label: "Distribución",
    tipo: "texto" as const,
  },
  {
    key: "distribucion_global" as const,
    label: "Distribución Global",
    tipo: "texto" as const,
  },
  {
    key: "observacion_zona_altitudinal" as const,
    label: "Observación Zona Altitudinal",
    tipo: "texto" as const,
  },
  {
    key: "referencia_area_protegida" as const,
    label: "Referencia Área Protegida",
    tipo: "texto" as const,
  },
  {
    key: "comentario_estatus_poblacional" as const,
    label: "Comentario Estatus Poblacional",
    tipo: "texto" as const,
  },
  {key: "sinonimia" as const, label: "Sinonimia", tipo: "texto" as const},
  {
    key: "agradecimiento" as const,
    label: "Agradecimiento",
    tipo: "texto" as const,
  },
  {key: "usos" as const, label: "Usos", tipo: "texto" as const},
  // Campos numéricos con min y max
  {
    key: "rango_altitudinal" as const,
    label: "Rango Altitudinal (Min/Max)",
    tipo: "rango" as const,
    campoMin: "rango_altitudinal_min" as const,
    campoMax: "rango_altitudinal_max" as const,
  },
  {
    key: "pluviocidad" as const,
    label: "Pluviocidad (Min/Max)",
    tipo: "rango" as const,
    campoMin: "pluviocidad_min" as const,
    campoMax: "pluviocidad_max" as const,
  },
  {
    key: "temperatura" as const,
    label: "Temperatura (Min/Max)",
    tipo: "rango" as const,
    campoMin: "temperatura_min" as const,
    campoMax: "temperatura_max" as const,
  },
  // Campo numérico simple
  {
    key: "area_distribucion" as const,
    label: "Área de distribución",
    tipo: "numero" as const,
  },
  // Campos de catálogo AWE
  {
    key: "awe_distribucion_altitudinal" as const,
    label: "Distribución Altitudinal (AWE)",
    tipo: "catalogo_awe" as const,
    tipoCatalogoId: 5,
  },
  {
    key: "awe_regiones_biogeograficas" as const,
    label: "Regiones Biogeográficas (AWE)",
    tipo: "catalogo_awe" as const,
    tipoCatalogoId: 6,
  },
  {
    key: "awe_areas_protegidas_estado" as const,
    label: "Áreas Protegidas Estado (AWE)",
    tipo: "catalogo_awe" as const,
    tipoCatalogoId: 3,
  },
  {
    key: "awe_areas_protegidas_privadas" as const,
    label: "Áreas Protegidas Privadas (AWE)",
    tipo: "catalogo_awe" as const,
    tipoCatalogoId: 4,
  },
  {
    key: "awe_ecosistemas" as const,
    label: "Ecosistemas (AWE)",
    tipo: "catalogo_awe" as const,
    tipoCatalogoId: 21,
  },
  {
    key: "awe_reservas_biosfera" as const,
    label: "Reservas Biosfera (AWE)",
    tipo: "catalogo_awe" as const,
    tipoCatalogoId: 22,
  },
  {
    key: "awe_bosques_protegidos" as const,
    label: "Bosques Protegidos (AWE)",
    tipo: "catalogo_awe" as const,
    tipoCatalogoId: 23,
  },
  {
    key: "awe_lista_roja_uicn" as const,
    label: "Lista Roja IUCN (AWE)",
    tipo: "catalogo_awe" as const,
    tipoCatalogoId: 10,
  },
  {
    key: "awe_cites" as const,
    label: "CITES (AWE)",
    tipo: "catalogo_awe" as const,
    tipoCatalogoId: 12,
  },
];

export default function EditorCitas({
  fichaEspecie: initialFicha,
  publicaciones,
  nombreCientifico,
  taxonId,
  siguienteEspecie,
  anteriorEspecie,
  catalogoAweOpciones,
  taxonCatalogoAwe,
}: EditorCitasProps) {
  const router = useRouter();
  const [fichaEspecie, setFichaEspecie] = useState<FichaEspecieEditor>(initialFicha);
  const [campoSeleccionado, setCampoSeleccionado] = useState<string>("informacion_adicional");
  const [textoEditor, setTextoEditor] = useState<string>(initialFicha.informacion_adicional || "");
  const [vistaPrevia, setVistaPrevia] = useState<string>("");
  const [mostrarVistaPrevia, setMostrarVistaPrevia] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  // Estado para el diálogo de enlace
  const [mostrarDialogoEnlace, setMostrarDialogoEnlace] = useState(false);
  const [urlEnlace, setUrlEnlace] = useState<string>("");
  // Guardar la última posición del cursor para insertar citas
  const ultimaPosicionCursor = useRef<{from: number; to: number} | null>(null);

  // Configuración del editor Tiptap solo para texto (sin imágenes ni multimedia)
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Asegurar que las listas estén habilitadas
        bulletList: {
          HTMLAttributes: {
            class: "list-disc pl-6",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal pl-6",
          },
        },
        listItem: {
          HTMLAttributes: {
            class: "my-1",
          },
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline hover:text-primary/80",
        },
      }),
    ],
    content: textoEditor,
    immediatelyRender: false,
    onUpdate: ({editor: editorInstance}) => {
      setTextoEditor(editorInstance.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4 prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground prose-a:text-primary",
      },
    },
    onSelectionUpdate: ({editor: editorInstance}) => {
      // Guardar la posición del cursor cada vez que cambia

      const {from, to} = editorInstance.state.selection;

      ultimaPosicionCursor.current = {from, to};
    },
  });

  // Actualizar el editor cuando cambia el campo seleccionado
  useEffect(() => {
    if (!editor) return;

    const campo = CAMPOS_FICHA.find((c) => c.key === campoSeleccionado);

    if (
      campo?.tipo === "catalogo_awe" ||
      (campo?.tipo === "rango" && "campoMin" in campo && "campoMax" in campo) ||
      campo?.tipo === "numero"
    ) {
      // Para campos de catálogo AWE, rango o número, no hay texto editor
      editor.commands.setContent("");
    } else {
      const valor = (fichaEspecie[campoSeleccionado as keyof FichaEspecieEditor] as string) || "";

      if (editor.getHTML() !== valor) {
        editor.commands.setContent(valor);
      }
    }
  }, [campoSeleccionado, fichaEspecie, editor]);
  // Estado para campos de catálogo AWE (array de IDs seleccionados)
  const [catalogoAweSeleccionados, setCatalogoAweSeleccionados] = useState<
    Record<string, number[]>
  >({});
  // Estado para campos numéricos
  const [valoresNumericos, setValoresNumericos] = useState<
    Record<string, {min: number | null; max: number | null; valor: number | null}>
  >({});

  // Inicializar valores de catálogo AWE desde props
  useEffect(() => {
    const valoresIniciales: Record<string, number[]> = {};

    CAMPOS_FICHA.forEach((campo) => {
      if (campo.tipo === "catalogo_awe" && campo.tipoCatalogoId) {
        valoresIniciales[campo.key] = taxonCatalogoAwe[campo.tipoCatalogoId] || [];
      }
    });

    setCatalogoAweSeleccionados(valoresIniciales);
  }, [taxonCatalogoAwe]);

  // Inicializar valores numéricos desde fichaEspecie
  useEffect(() => {
    const valoresIniciales: Record<
      string,
      {min: number | null; max: number | null; valor: number | null}
    > = {};

    CAMPOS_FICHA.forEach((campo) => {
      if (campo.tipo === "rango" && "campoMin" in campo && "campoMax" in campo) {
        valoresIniciales[campo.key] = {
          min: (fichaEspecie[campo.campoMin as keyof FichaEspecieEditor] as number) || null,
          max: (fichaEspecie[campo.campoMax as keyof FichaEspecieEditor] as number) || null,
          valor: null,
        };
      } else if (campo.tipo === "numero") {
        valoresIniciales[campo.key] = {
          min: null,
          max: null,
          valor: (fichaEspecie[campo.key as keyof FichaEspecieEditor] as number) || null,
        };
      }
    });

    setValoresNumericos(valoresIniciales);
  }, [fichaEspecie]);

  // Actualizar el texto del editor cuando cambia el campo seleccionado
  useEffect(() => {
    const campo = CAMPOS_FICHA.find((c) => c.key === campoSeleccionado);

    if (campo?.tipo === "catalogo_awe" || campo?.tipo === "rango" || campo?.tipo === "numero") {
      // Para campos de catálogo AWE, rango o número, no hay texto editor
      setTextoEditor("");
    } else {
      const valor = (fichaEspecie[campoSeleccionado as keyof FichaEspecieEditor] as string) || "";

      setTextoEditor(valor);
    }

    setVistaPrevia("");
    setMostrarVistaPrevia(false);
  }, [campoSeleccionado, fichaEspecie]);

  // Generar vista previa reemplazando {{id_publicacion}} con cita_corta
  const generarVistaPrevia = () => {
    const campo = CAMPOS_FICHA.find((c) => c.key === campoSeleccionado);

    if (campo?.tipo === "catalogo_awe" && campo.tipoCatalogoId) {
      // Para campos de catálogo AWE, mostrar los nombres de los seleccionados
      const seleccionados = catalogoAweSeleccionados[campoSeleccionado] || [];
      const opciones = catalogoAweOpciones[campo.tipoCatalogoId] || [];

      const nombresSeleccionados = seleccionados
        .map((id) => {
          const opcion = opciones.find((o) => o.id_catalogo_awe === id);

          return opcion?.nombre || `ID: ${String(id)}`;
        })
        .join(", ");

      setVistaPrevia(nombresSeleccionados || "No hay opciones seleccionadas");
      setMostrarVistaPrevia(true);

      return;
    }

    if (campo?.tipo === "rango" && "campoMin" in campo && "campoMax" in campo) {
      // Para campos de rango, mostrar min y max
      const valores = valoresNumericos[campoSeleccionado] || {
        min: null,
        max: null,
        valor: null,
      };

      const minStr = valores.min !== null ? String(valores.min) : "No definido";
      const maxStr = valores.max !== null ? String(valores.max) : "No definido";

      setVistaPrevia(`Mínimo: ${minStr} | Máximo: ${maxStr}`);
      setMostrarVistaPrevia(true);

      return;
    }

    if (campo?.tipo === "numero") {
      // Para campos numéricos simples
      const valor = valoresNumericos[campoSeleccionado]?.valor ?? null;
      const valorStr = valor !== null ? String(valor) : "No definido";

      setVistaPrevia(`Valor: ${valorStr}`);
      setMostrarVistaPrevia(true);

      return;
    }

    // Para campos de texto, reemplazar {{id_publicacion}} con cita_corta
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

    if (editor) {
      // Intentar obtener la posición actual del cursor
      const seleccionActual = editor.state.selection;
      const posicion = ultimaPosicionCursor.current || {
        from: seleccionActual.from,
        to: seleccionActual.to,
      };
      const tieneSeleccion = posicion.from !== posicion.to;

      // Enfocar el editor primero
      editor.chain().focus().run();

      // Insertar la cita en la posición guardada del cursor
      if (tieneSeleccion) {
        // Hay texto seleccionado, reemplazarlo con la cita
        editor
          .chain()
          .setTextSelection({from: posicion.from, to: posicion.to})
          .deleteSelection()
          .insertContent(nuevaCita)
          .focus()
          .run();
      } else {
        // No hay texto seleccionado, insertar en la posición del cursor
        editor.chain().setTextSelection(posicion.from).insertContent(nuevaCita).focus().run();
      }
    } else {
      // Fallback: agregar al final si no hay editor
      setTextoEditor((prev) => prev + (prev ? " " : "") + nuevaCita);
    }
  };

  // Guardar cambios
  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const campo = CAMPOS_FICHA.find((c) => c.key === campoSeleccionado);

      if (campo?.tipo === "rango" && "campoMin" in campo && "campoMax" in campo) {
        // Guardar campos de rango (min y max)
        const valores = valoresNumericos[campoSeleccionado] || {
          min: null,
          max: null,
          valor: null,
        };

        const fichaActualizada = {
          ...fichaEspecie,
          [campo.campoMin]: valores.min,
          [campo.campoMax]: valores.max,
        };

        const response = await fetch(`/api/ficha-especie/${String(taxonId)}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(fichaActualizada),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          const errorMessage =
            typeof errorData === "object" && errorData !== null && "error" in errorData
              ? String(errorData.error)
              : "Error al guardar";

          throw new Error(errorMessage);
        }

        const data = await response.json();

        console.log("Guardado exitoso:", data);

        setFichaEspecie(fichaActualizada);
        setSaveMessage("Guardado exitosamente");
        setTimeout(() => setSaveMessage(null), 3000);
      } else if (campo?.tipo === "numero") {
        // Guardar campo numérico simple
        const valor = valoresNumericos[campoSeleccionado]?.valor ?? null;

        const fichaActualizada = {
          ...fichaEspecie,
          [campoSeleccionado]: valor,
        };

        const response = await fetch(`/api/ficha-especie/${String(taxonId)}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(fichaActualizada),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          const errorMessage =
            typeof errorData === "object" && errorData !== null && "error" in errorData
              ? String(errorData.error)
              : "Error al guardar";

          throw new Error(errorMessage);
        }

        const data = await response.json();

        console.log("Guardado exitoso:", data);

        setFichaEspecie(fichaActualizada);
        setSaveMessage("Guardado exitosamente");
        setTimeout(() => setSaveMessage(null), 3000);
      } else if (campo?.tipo === "catalogo_awe" && campo.tipoCatalogoId) {
        // Guardar catálogo AWE
        const idsSeleccionados = catalogoAweSeleccionados[campoSeleccionado] || [];

        const response = await fetch(`/api/taxon-catalogo-awe/${String(taxonId)}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tipo_catalogo_awe_id: campo.tipoCatalogoId,
            catalogo_awe_ids: idsSeleccionados,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          const errorMessage =
            typeof errorData === "object" && errorData !== null && "error" in errorData
              ? String(errorData.error)
              : "Error al guardar";

          throw new Error(errorMessage);
        }

        const data = await response.json();

        console.log("Catálogo AWE guardado exitosamente:", data);
        setSaveMessage("Guardado exitosamente");
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        // Guardar campo de texto
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

        const response = await fetch(`/api/ficha-especie/${String(taxonId)}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(fichaActualizada),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          const errorMessage =
            typeof errorData === "object" && errorData !== null && "error" in errorData
              ? String(errorData.error)
              : "Error al guardar";

          throw new Error(errorMessage);
        }

        const data = await response.json();

        console.log("Guardado exitoso:", data);

        setFichaEspecie(fichaActualizada);
        setSaveMessage("Guardado exitosamente");
        setTimeout(() => setSaveMessage(null), 3000);
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error al guardar. Por favor, intenta de nuevo.";

      setSaveMessage(`Error: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-4">
        <div className="flex h-[calc(100vh-2rem)] max-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-lg border border-border bg-card shadow-lg">
          {/* Header */}
          <div className="flex-shrink-0 border-b bg-card px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground">Editor de Textos con Citas</h1>
              <div className="flex items-center gap-2">
                <Button
                  className="flex items-center gap-1"
                  disabled={!anteriorEspecie}
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (anteriorEspecie) {
                      router.push(`/sapopedia/editor-citas/${toSlug(anteriorEspecie.taxon)}`);
                    }
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  className="flex items-center gap-1"
                  disabled={!siguienteEspecie}
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (siguienteEspecie) {
                      router.push(`/sapopedia/editor-citas/${toSlug(siguienteEspecie.taxon)}`);
                    }
                  }}
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
            <div className="flex w-1/2 flex-col overflow-hidden border-r bg-card">
              {/* Especie Selector con Buscador */}
              <div className="flex-shrink-0 space-y-3 border-b p-4">
                <div>
                  <div className="mb-2 block text-sm font-medium text-foreground">Buscar Especie</div>
                  <EditorCitasSearch />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label
                      className="mb-2 block text-sm font-medium text-foreground"
                      htmlFor="especie-actual"
                    >
                      Especie Actual
                    </label>
                    <div
                      className="border-input flex h-9 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground"
                      id="especie-actual"
                    >
                      {(() => {
                        console.log("🔍 nombreCientifico recibido:", nombreCientifico);
                        console.log("🔍 tipo:", typeof nombreCientifico);
                        console.log("🔍 longitud:", nombreCientifico?.length);
                        console.log(
                          "🔍 partes al dividir por espacio:",
                          nombreCientifico?.split(" "),
                        );

                        return (
                          <span className="italic" style={{fontStyle: "italic"}}>
                            {nombreCientifico}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="flex-1">
                    <label
                      className="mb-2 block text-sm font-medium text-foreground"
                      htmlFor="taxon-id"
                    >
                      Taxon ID
                    </label>
                    <Input
                      readOnly
                      className="bg-muted text-muted-foreground"
                      id="taxon-id"
                      type="text"
                      value={taxonId.toString()}
                    />
                  </div>
                </div>
              </div>

              {/* Text Editor, Selector de Catálogo AWE o Campos Numéricos */}
              <div className="flex-1 overflow-hidden p-4">
                {(() => {
                  const campo = CAMPOS_FICHA.find((c) => c.key === campoSeleccionado);

                  if (campo?.tipo === "rango" && "campoMin" in campo && "campoMax" in campo) {
                    // Campos de rango (min y max)
                    const valores = valoresNumericos[campoSeleccionado] || {
                      min: null,
                      max: null,
                      valor: null,
                    };

                    return (
                      <div className="flex h-full flex-col space-y-4">
                        <div className="text-sm font-medium text-gray-700">{campo.label}</div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label
                              className="mb-2 block text-sm font-medium text-foreground"
                              htmlFor={`${campo.key}-min`}
                            >
                              Mínimo
                            </label>
                            <Input
                              className="w-full"
                              id={`${campo.key}-min`}
                              placeholder="Mínimo"
                              type="number"
                              value={valores.min ?? ""}
                              onChange={(e) => {
                                const nuevoValor =
                                  e.target.value === "" ? null : Number.parseFloat(e.target.value);

                                setValoresNumericos({
                                  ...valoresNumericos,
                                  [campoSeleccionado]: {
                                    ...valores,
                                    min: Number.isNaN(nuevoValor) ? null : nuevoValor,
                                  },
                                });
                              }}
                            />
                          </div>
                          <div>
                            <label
                              className="mb-2 block text-sm font-medium text-gray-700"
                              htmlFor={`${campo.key}-max`}
                            >
                              Máximo
                            </label>
                            <Input
                              className="w-full"
                              id={`${campo.key}-max`}
                              placeholder="Máximo"
                              type="number"
                              value={valores.max ?? ""}
                              onChange={(e) => {
                                const nuevoValor =
                                  e.target.value === "" ? null : Number.parseFloat(e.target.value);

                                setValoresNumericos({
                                  ...valoresNumericos,
                                  [campoSeleccionado]: {
                                    ...valores,
                                    max: Number.isNaN(nuevoValor) ? null : nuevoValor,
                                  },
                                });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (campo?.tipo === "numero") {
                    // Campo numérico simple
                    const valor = valoresNumericos[campoSeleccionado]?.valor ?? null;

                    return (
                      <div className="flex h-full flex-col">
                        <label
                          className="mb-2 block text-sm font-medium text-foreground"
                          htmlFor={`${campo.key}-valor`}
                        >
                          {campo.label}
                        </label>
                        <Input
                          className="w-full"
                          id={`${campo.key}-valor`}
                          placeholder="Valor"
                          type="number"
                          value={valor ?? ""}
                          onChange={(e) => {
                            const nuevoValor =
                              e.target.value === "" ? null : Number.parseFloat(e.target.value);

                            setValoresNumericos({
                              ...valoresNumericos,
                              [campoSeleccionado]: {
                                min: null,
                                max: null,
                                valor: Number.isNaN(nuevoValor) ? null : nuevoValor,
                              },
                            });
                          }}
                        />
                      </div>
                    );
                  }

                  if (campo?.tipo === "catalogo_awe" && campo.tipoCatalogoId) {
                    const opciones = catalogoAweOpciones[campo.tipoCatalogoId] || [];
                    const seleccionados = catalogoAweSeleccionados[campoSeleccionado] || [];

                    return (
                      <div className="flex h-full flex-col overflow-hidden">
                        <div className="mb-2 block text-sm font-medium text-foreground">
                          Seleccionar Opciones
                        </div>
                        <div className="flex-1 space-y-2 overflow-y-auto">
                          {opciones.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No hay opciones disponibles</p>
                          ) : (
                            opciones.map((opcion) => (
                              <label
                                key={opcion.id_catalogo_awe}
                                className="flex items-center gap-2 rounded border border-border bg-card p-3 hover:bg-muted/50 transition-colors"
                              >
                                <input
                                  checked={seleccionados.includes(opcion.id_catalogo_awe)}
                                  className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
                                  type="checkbox"
                                  onChange={(e) => {
                                    const nuevosSeleccionados = e.target.checked
                                      ? [...seleccionados, opcion.id_catalogo_awe]
                                      : seleccionados.filter((id) => id !== opcion.id_catalogo_awe);

                                    setCatalogoAweSeleccionados({
                                      ...catalogoAweSeleccionados,
                                      [campoSeleccionado]: nuevosSeleccionados,
                                    });
                                  }}
                                />
                                <span className="text-sm text-foreground">{opcion.nombre}</span>
                                {opcion.sigla && (
                                  <span className="ml-auto text-xs text-muted-foreground">
                                    ({opcion.sigla})
                                  </span>
                                )}
                              </label>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="flex h-full flex-col">
                      <label
                        className="mb-2 block text-sm font-medium text-foreground"
                        htmlFor="texto-editor"
                      >
                        Editor de Texto
                      </label>
                      <div className="flex flex-1 flex-col overflow-hidden rounded-md border border-border">
                        {/* Toolbar */}
                        <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted p-2">
                          <button
                            className={`rounded px-2 py-1 text-sm transition-colors ${
                              editor?.isActive("bold")
                                ? "bg-muted font-bold text-foreground"
                                : "hover:bg-muted/50 text-foreground"
                            }`}
                            disabled={!editor?.can().chain().focus().toggleBold().run()}
                            type="button"
                            onClick={() => editor?.chain().focus().toggleBold().run()}
                          >
                            <strong>B</strong>
                          </button>
                          <button
                            className={`rounded px-2 py-1 text-sm transition-colors ${
                              editor?.isActive("italic")
                                ? "bg-muted italic text-foreground"
                                : "hover:bg-muted/50 text-foreground"
                            }`}
                            disabled={!editor?.can().chain().focus().toggleItalic().run()}
                            type="button"
                            onClick={() => editor?.chain().focus().toggleItalic().run()}
                          >
                            <em>I</em>
                          </button>
                          <button
                            className={`rounded px-2 py-1 text-sm transition-colors ${
                              editor?.isActive("strike")
                                ? "bg-muted line-through text-foreground"
                                : "hover:bg-muted/50 text-foreground"
                            }`}
                            disabled={!editor?.can().chain().focus().toggleStrike().run()}
                            type="button"
                            onClick={() => editor?.chain().focus().toggleStrike().run()}
                          >
                            <s>S</s>
                          </button>
                          <div className="mx-1 h-6 w-px bg-border" />
                          <button
                            className={`rounded px-2 py-1 text-sm transition-colors ${
                              editor?.isActive("heading", {level: 1})
                                ? "bg-muted text-foreground"
                                : "hover:bg-muted/50 text-foreground"
                            }`}
                            type="button"
                            onClick={() => editor?.chain().focus().toggleHeading({level: 1}).run()}
                          >
                            H1
                          </button>
                          <button
                            className={`rounded px-2 py-1 text-sm transition-colors ${
                              editor?.isActive("heading", {level: 2})
                                ? "bg-muted text-foreground"
                                : "hover:bg-muted/50 text-foreground"
                            }`}
                            type="button"
                            onClick={() => editor?.chain().focus().toggleHeading({level: 2}).run()}
                          >
                            H2
                          </button>
                          <button
                            className={`rounded px-2 py-1 text-sm transition-colors ${
                              editor?.isActive("heading", {level: 3})
                                ? "bg-muted text-foreground"
                                : "hover:bg-muted/50 text-foreground"
                            }`}
                            type="button"
                            onClick={() => editor?.chain().focus().toggleHeading({level: 3}).run()}
                          >
                            H3
                          </button>
                          <div className="mx-1 h-6 w-px bg-border" />
                          <button
                            className={`rounded px-2 py-1 text-sm transition-colors ${
                              editor?.isActive("bulletList") ? "bg-muted text-foreground" : "hover:bg-muted/50 text-foreground"
                            }`}
                            type="button"
                            onClick={() => editor?.chain().focus().toggleBulletList().run()}
                          >
                            • Lista
                          </button>
                          <button
                            className={`rounded px-2 py-1 text-sm transition-colors ${
                              editor?.isActive("orderedList") ? "bg-muted text-foreground" : "hover:bg-muted/50 text-foreground"
                            }`}
                            type="button"
                            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                          >
                            1. Lista
                          </button>
                          <div className="mx-1 h-6 w-px bg-border" />
                          <button
                            className={`rounded px-2 py-1 text-sm transition-colors ${
                              editor?.isActive("link") ? "bg-muted text-foreground" : "hover:bg-muted/50 text-foreground"
                            }`}
                            type="button"
                            onClick={() => {
                              if (editor?.isActive("link")) {
                                // Si ya hay un enlace, obtener su URL y abrir el diálogo para editarlo
                                const attrs = editor.getAttributes("link");
                                const href = typeof attrs.href === "string" ? attrs.href : "";

                                setUrlEnlace(href);
                                setMostrarDialogoEnlace(true);
                              } else {
                                // Si no hay enlace, abrir el diálogo para crear uno nuevo
                                setUrlEnlace("");
                                setMostrarDialogoEnlace(true);
                              }
                            }}
                          >
                            🔗 Link
                          </button>
                          <button
                            className="rounded px-2 py-1 text-sm hover:bg-muted/50 disabled:opacity-50 text-foreground transition-colors"
                            disabled={!editor?.isActive("link")}
                            type="button"
                            onClick={() => editor?.chain().focus().unsetLink().run()}
                          >
                            🔗✕
                          </button>
                        </div>
                        {/* Editor Content */}
                        <div className="flex-1 overflow-y-auto">
                          <style>{`
                            .ProseMirror {
                              color: hsl(var(--foreground));
                            }
                            .ProseMirror ul,
                            .ProseMirror ol {
                              padding-left: 1.5rem;
                              margin: 0.5rem 0;
                            }
                            .ProseMirror ul {
                              list-style-type: disc;
                            }
                            .ProseMirror ol {
                              list-style-type: decimal;
                            }
                            .ProseMirror li {
                              margin: 0.25rem 0;
                              color: hsl(var(--foreground));
                            }
                            .ProseMirror ul[data-type="taskList"] {
                              list-style: none;
                              padding: 0;
                            }
                            .ProseMirror ul[data-type="taskList"] li {
                              display: flex;
                              align-items: flex-start;
                            }
                            .ProseMirror ul[data-type="taskList"] li > label {
                              flex: 0 0 auto;
                              margin-right: 0.5rem;
                              user-select: none;
                            }
                            .ProseMirror ul[data-type="taskList"] li > div {
                              flex: 1 1 auto;
                            }
                            .ProseMirror a {
                              color: hsl(var(--primary));
                            }
                            .ProseMirror a:hover {
                              color: hsl(var(--primary) / 0.8);
                            }
                          `}</style>
                          {editor ? (
                            <EditorContent className="h-full" editor={editor} />
                          ) : (
                            <div className="h-full p-4 text-muted-foreground">Cargando editor...</div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Right Panel */}
            <div className="flex w-1/2 flex-col overflow-hidden bg-card">
              {/* Campo Selector */}
              <div className="flex-shrink-0 border-b p-4">
                <label
                  className="mb-2 block text-sm font-medium text-foreground"
                  htmlFor="campo-selector"
                >
                  Campo
                </label>
                <div className="relative">
                  <select
                    className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
                    id="campo-selector"
                    value={campoSeleccionado}
                    onChange={(e) => setCampoSeleccionado(e.target.value)}
                  >
                    {CAMPOS_FICHA.map((campo) => (
                      <option key={campo.key} value={campo.key}>
                        {campo.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              {/* Referencias Disponibles */}
              <div className="flex flex-1 flex-col overflow-hidden border-b">
                <div className="flex-shrink-0 border-b bg-card p-4">
                  <div className="mb-4">
                    <div className="text-sm font-medium text-foreground">Referencias Disponibles</div>
                  </div>
                </div>

                {publicaciones.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center p-4">
                    <p className="text-sm text-muted-foreground">
                      No hay referencias disponibles para esta especie.
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 space-y-2 overflow-y-auto p-4 pb-6">
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
                          className="flex items-start justify-between gap-2 rounded border border-border bg-card p-2 hover:bg-muted/50 transition-colors"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="mb-0.5 text-xs font-semibold text-foreground">
                              <span className="text-muted-foreground">[{numero}]</span> {autor} ({año})
                            </div>
                            <div className="line-clamp-2 text-xs text-foreground">{pub.titulo}</div>
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
              <div className="flex flex-1 flex-col overflow-hidden p-4">
                <div className="mb-2 block text-sm font-medium text-foreground">Vista Previa</div>
                {mostrarVistaPrevia ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html:
                        vistaPrevia ||
                        "No hay vista previa disponible. Haz clic en 'Ver Vista Previa' para generar.",
                    }}
                    className="flex-1 overflow-y-auto rounded border border-border bg-muted p-4 text-sm leading-relaxed text-foreground"
                  />
                ) : (
                  <div className="flex flex-1 items-center justify-center rounded border border-border bg-muted text-sm text-muted-foreground">
                    Haz clic en &quot;Ver Vista Previa&quot; para ver el texto con las citas
                    formateadas
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Diálogo para agregar/editar enlace */}
          <Dialog open={mostrarDialogoEnlace} onOpenChange={setMostrarDialogoEnlace}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Enlace</DialogTitle>
                <DialogDescription>
                  Ingresa la URL del enlace. Si hay texto seleccionado, se convertirá en un enlace.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Input
                  placeholder="https://ejemplo.com"
                  value={urlEnlace}
                  onChange={(e) => setUrlEnlace(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (urlEnlace.trim()) {
                        const url = urlEnlace.trim();
                        // Asegurar que la URL tenga protocolo
                        const urlConProtocolo =
                          url.startsWith("http://") || url.startsWith("https://")
                            ? url
                            : `https://${url}`;

                        editor?.chain().focus().setLink({href: urlConProtocolo}).run();
                        setMostrarDialogoEnlace(false);
                        setUrlEnlace("");
                      }
                    }
                  }}
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setMostrarDialogoEnlace(false);
                    setUrlEnlace("");
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    if (urlEnlace.trim()) {
                      const url = urlEnlace.trim();
                      // Asegurar que la URL tenga protocolo
                      const urlConProtocolo =
                        url.startsWith("http://") || url.startsWith("https://")
                          ? url
                          : `https://${url}`;

                      editor?.chain().focus().setLink({href: urlConProtocolo}).run();
                      setMostrarDialogoEnlace(false);
                      setUrlEnlace("");
                    }
                  }}
                >
                  Aplicar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Footer */}
          <div className="relative z-50 flex min-h-[64px] flex-shrink-0 items-center justify-between border-t bg-card px-6 py-4 shadow-lg">
            <div className="flex items-center gap-4">
              {saveMessage && (
                <span
                  className={`text-sm font-medium ${saveMessage.includes("Error") ? "text-destructive" : "text-green-600"}`}
                >
                  {saveMessage}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button
                className="flex items-center gap-2"
                variant="outline"
                onClick={() => {
                  generarVistaPrevia();
                }}
              >
                <Eye className="h-4 w-4" />
                Ver Vista Previa
              </Button>
              <Button
                className="!bg-blue-600 !text-white hover:!bg-blue-700 disabled:!opacity-50"
                disabled={isSaving}
                size="lg"
                style={{
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                }}
                type="button"
                onClick={() => {
                  void handleSave();
                }}
              >
                <Save className="h-5 w-5" />
                {isSaving ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
