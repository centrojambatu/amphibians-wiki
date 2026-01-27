"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MoleculotecaFiltersPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Inicializar búsqueda desde URL
  const busquedaInicial = searchParams.get("busqueda") || "";
  const [busqueda, setBusqueda] = useState(busquedaInicial);
  const [isInitialMount, setIsInitialMount] = useState(true);

  // Actualizar URL cuando cambie la búsqueda (con debounce)
  useEffect(() => {
    if (isInitialMount) {
      setIsInitialMount(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams();

      if (busqueda.trim()) {
        params.set("busqueda", busqueda.trim());
      }

      // Resetear a página 1 cuando cambie la búsqueda
      params.delete("pagina");

      const queryString = params.toString();
      router.push(`/moleculoteca${queryString ? `?${queryString}` : ""}`, {
        scroll: false,
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [busqueda, router, isInitialMount]);

  const limpiarBusqueda = () => {
    setBusqueda("");
  };

  return (
    <div className="w-full">
      <div className="relative">
        <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Buscar por nombre científico o común..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="pl-10 pr-10"
        />
        {busqueda && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
            onClick={limpiarBusqueda}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
