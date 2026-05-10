"use client";

import {Search, X} from "lucide-react";
import {useEffect, useRef, useState} from "react";
import {useQuery} from "@tanstack/react-query";

import {Button} from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {Input} from "@/components/ui/input";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";

interface EspecieResult {
  id: number | string;
  nombre_cientifico: string;
  nombre_comun?: string | null;
}

interface Props {
  value: string;
  onChange: (next: string) => void;
  apiPath: string;
  placeholder?: string;
  className?: string;
}

export default function SpeciesSearchInput({
  value,
  onChange,
  apiPath,
  placeholder = "Nombre científico o común",
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const search = value.trim();
  const enabled = search.length >= 2;

  const {data: especies = []} = useQuery<EspecieResult[]>({
    queryKey: ["species-search", apiPath, search],
    queryFn: async () => {
      const params = new URLSearchParams();

      params.set("search", search);
      const res = await fetch(`${apiPath}?${params.toString()}`);

      if (!res.ok) return [];

      return res.json();
    },
    enabled,
  });

  useEffect(() => {
    if (!enabled) setOpen(false);
  }, [enabled]);

  const handleSelect = (name: string) => {
    onChange(name);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 shrink-0 -translate-y-1/2" />
            <Input
              className="w-full pr-10 pl-10"
              placeholder={placeholder}
              type="text"
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
                setOpen(e.target.value.trim().length >= 2);
              }}
              onFocus={() => {
                if (enabled) setOpen(true);
              }}
            />
            {value && (
              <Button
                className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 p-0"
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                  setOpen(false);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[--radix-popover-trigger-width] p-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command shouldFilter={false}>
            <CommandList>
              {especies.length === 0 && enabled ? (
                <CommandEmpty className="px-4 py-6">No se encontraron especies.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {especies.slice(0, 20).map((e) => (
                    <CommandItem
                      key={`${apiPath}-${String(e.id)}`}
                      className="cursor-pointer"
                      value={e.nombre_cientifico}
                      onSelect={() => handleSelect(e.nombre_cientifico)}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium italic">{e.nombre_cientifico}</span>
                        {e.nombre_comun && (
                          <span className="text-muted-foreground text-xs">{e.nombre_comun}</span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
