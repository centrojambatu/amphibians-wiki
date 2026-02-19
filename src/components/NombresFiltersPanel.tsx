"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {Search, X} from "lucide-react";
import Link from "next/link";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Idioma {
  id: number;
  nombre: string;
  codigo: string;
}

interface NombresFiltersPanelProps {
  idiomas: readonly Idioma[];
  idiomaActual: number;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}

export default function NombresFiltersPanel({
  idiomas,
  idiomaActual,
  searchQuery,
  onSearchQueryChange,
}: NombresFiltersPanelProps) {
  const router = useRouter();

  const handleIdiomaChange = (nuevoIdiomaId: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("idioma", nuevoIdiomaId.toString());
    router.push(`/sapopedia/nombres?${params.toString()}`);
  };

  const idiomaActualObj = idiomas.find((i) => i.id === idiomaActual) || idiomas[0];

  return (
    <div className="flex flex-col h-full min-h-0 w-full rounded-lg border bg-white shadow-sm">
      {/* Búsqueda */}
      <div className="flex-shrink-0 px-6 pb-4 pt-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Nombre científico o común"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
              onClick={() => onSearchQueryChange("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {searchQuery && (
          <p className="mt-2 text-xs text-gray-500">
            Filtrando: &quot;{searchQuery}&quot;
          </p>
        )}
      </div>

      {/* Filtros */}
      <div className="min-h-0 w-full flex-1 overflow-y-auto border-t px-6">
        <Accordion className="w-full [&>[data-slot=accordion-item]]:border-b" type="multiple" defaultValue={["idioma"]}>
          <AccordionItem value="idioma">
            <AccordionTrigger className="!items-start">
              <div className="flex flex-col items-start">
                <span className="font-semibold">Idioma</span>
                {idiomaActualObj && (
                  <span className="mt-1 text-xs font-normal text-gray-500">
                    {idiomaActualObj.nombre}
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-2">
                {idiomas.map((idioma) => {
                  const isSelected = idioma.id === idiomaActual;
                  return (
                    <Button
                      key={idioma.id}
                      className="h-auto min-h-[32px] w-full justify-start rounded-none px-2 py-1 text-left text-sm"
                      size="sm"
                      style={{
                        borderColor: isSelected ? undefined : "#e8e8e8",
                        color: isSelected ? undefined : "#2d2d2d",
                      }}
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => handleIdiomaChange(idioma.id)}
                    >
                      {idioma.nombre}
                    </Button>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
