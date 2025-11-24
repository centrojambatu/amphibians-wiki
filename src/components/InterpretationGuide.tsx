"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Badge} from "@/components/ui/badge";
import {Separator} from "@/components/ui/separator";

interface InterpretationGuideProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export default function InterpretationGuide({isOpen, onClose}: InterpretationGuideProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Guía de Interpretación</DialogTitle>
          <DialogDescription>
            Comprende los símbolos y abreviaciones utilizadas en el catálogo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Sección Endémica */}
          <div>
            <h3 className="mb-3 text-lg font-semibold">Endémica (En)</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-black">✓</span>
                <span className="text-muted-foreground text-sm">Especie endémica</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-lg">-</span>
                <span className="text-muted-foreground text-sm">Especie no endémica</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Sección Lista Roja */}
          <div>
            <h3 className="mb-3 text-lg font-semibold">Lista Roja (LR)</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Badge className="bg-gray-50 text-gray-600" variant="outline">
                  LC
                </Badge>
                <span className="text-muted-foreground text-sm">Preocupación Menor</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-gray-100 text-gray-700" variant="outline">
                  NT
                </Badge>
                <span className="text-muted-foreground text-sm">Casi Amenazado</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-gray-200 text-gray-800" variant="outline">
                  VU
                </Badge>
                <span className="text-muted-foreground text-sm">Vulnerable</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-gray-300 text-gray-900" variant="outline">
                  EN
                </Badge>
                <span className="text-muted-foreground text-sm">En Peligro</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-gray-400 text-gray-950" variant="outline">
                  CR
                </Badge>
                <span className="text-muted-foreground text-sm">En Peligro Crítico</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-gray-500 text-white" variant="outline">
                  EW
                </Badge>
                <span className="text-muted-foreground text-sm">Extinto en Estado Silvestre</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-gray-700 text-white" variant="outline">
                  EX
                </Badge>
                <span className="text-muted-foreground text-sm">Extinto</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-gray-100 text-gray-400" variant="outline">
                  DD
                </Badge>
                <span className="text-muted-foreground text-sm">Datos Insuficientes</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Sección Pisos Climáticos */}
          <div>
            <h3 className="mb-3 text-lg font-semibold">Pisos Climáticos</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-4 w-6 rounded border" style={{backgroundColor: "#90EE90"}} />
                <span className="text-muted-foreground text-sm">Tropical (0-1000m)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-4 w-6 rounded border" style={{backgroundColor: "#D2B48C"}} />
                <span className="text-muted-foreground text-sm">Subtropical (1000-2000m)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-4 w-6 rounded border" style={{backgroundColor: "#CD853F"}} />
                <span className="text-muted-foreground text-sm">Templado (2000-3000m)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-4 w-6 rounded border" style={{backgroundColor: "#8B4513"}} />
                <span className="text-muted-foreground text-sm">Frío (3000-4000m)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-4 w-6 rounded border" style={{backgroundColor: "#A0522D"}} />
                <span className="text-muted-foreground text-sm">Páramo (4000-5000m)</span>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="h-4 w-6 rounded border border-gray-300"
                  style={{backgroundColor: "#FFFFFF"}}
                />
                <span className="text-muted-foreground text-sm">Nival (&gt;5000m)</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Sección Distribución */}
          <div>
            <h3 className="mb-3 text-lg font-semibold">Distribución (C/S/O)</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-sm font-semibold">C:</span>
                <span className="text-muted-foreground text-sm">Costa</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-sm font-semibold">S:</span>
                <span className="text-muted-foreground text-sm">Sierra</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-sm font-semibold">O:</span>
                <span className="text-muted-foreground text-sm">Oriente</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
