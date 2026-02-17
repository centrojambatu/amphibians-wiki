"use client";

import {useRouter, useSearchParams} from "next/navigation";
import {useTransition} from "react";
import {Globe} from "lucide-react";

import {Button} from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Idioma {
  id: number;
  nombre: string;
  codigo: string;
}

interface IdiomaSelectorProps {
  idiomas: readonly Idioma[];
  idiomaActual: number;
}

export default function IdiomaSelector({idiomas, idiomaActual}: IdiomaSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleIdiomaChange = (nuevoIdiomaId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("idioma", nuevoIdiomaId);
    
    startTransition(() => {
      router.push(`/sapopedia/nombres?${params.toString()}`);
    });
  };

  const idiomaActualObj = idiomas.find((i) => i.id === idiomaActual) || idiomas[0];

  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Globe className="h-4 w-4" />
        <span className="font-medium">Idioma:</span>
      </div>
      <Select
        value={idiomaActual.toString()}
        onValueChange={handleIdiomaChange}
        disabled={isPending}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue>
            {idiomaActualObj.nombre} ({idiomaActualObj.codigo})
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {idiomas.map((idioma) => (
            <SelectItem key={idioma.id} value={idioma.id.toString()}>
              {idioma.nombre} ({idioma.codigo})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isPending && (
        <span className="text-xs text-gray-500">Cargando...</span>
      )}
    </div>
  );
}
