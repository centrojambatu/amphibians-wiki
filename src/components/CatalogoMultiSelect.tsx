"use client";

import {Search, X} from "lucide-react";
import {useEffect, useState} from "react";
import {useQuery} from "@tanstack/react-query";

import {Input} from "@/components/ui/input";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

function FilterCheckbox({checked}: {checked: boolean}) {
  return (
    <span
      aria-hidden
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
        checked ? "border-primary bg-primary text-primary-foreground" : "border-gray-300 bg-white"
      }`}
    >
      {checked && (
        <svg
          className="h-3 w-3"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          viewBox="0 0 24 24"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </span>
  );
}

function formatCat(cat: string): string {
  const [museo, num] = cat.split("::");
  const acr = museo?.includes(" - ") ? museo.split(" - ").pop() : museo;

  return [acr, num].filter(Boolean).join(" ");
}

interface Props {
  apiPath: string;
  selected: string[];
  onChange: (val: string[]) => void;
  placeholder?: string;
}

export default function CatalogoMultiSelect({
  apiPath,
  selected,
  onChange,
  placeholder = "CJ 10441",
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 300);

    return () => clearTimeout(id);
  }, [query]);

  const enabled = debouncedQuery.length >= 2;
  const {data: options = [], isFetching: loading} = useQuery<string[]>({
    queryKey: ["catalog-search", apiPath, debouncedQuery],
    queryFn: async () => {
      const res = await fetch(`${apiPath}?q=${encodeURIComponent(debouncedQuery)}`);

      if (!res.ok) return [];

      return res.json();
    },
    enabled,
  });

  const toggle = (cat: string) => {
    if (selected.includes(cat)) onChange(selected.filter((s) => s !== cat));
    else onChange([...selected, cat]);
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              className="w-full pl-10 text-sm"
              placeholder={placeholder}
              value={query}
              onChange={(e) => {
                const next = e.target.value;

                setQuery(next);
                setOpen(next.length >= 2);
              }}
              onFocus={() => {
                if (query.length >= 2) setOpen(true);
              }}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="z-[1100] max-h-[200px] w-[--radix-popover-trigger-width] overflow-y-auto p-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command shouldFilter={false}>
            <CommandList>
              {options.length === 0 && debouncedQuery.length >= 2 && (
                <CommandEmpty className="px-4 py-3 text-sm text-gray-400">
                  {loading ? "Buscando..." : "Sin resultados."}
                </CommandEmpty>
              )}
              {options.length > 0 && (
                <CommandGroup>
                  {options.map((cat) => (
                    <CommandItem
                      key={cat}
                      className="cursor-pointer"
                      value={cat}
                      onSelect={() => toggle(cat)}
                    >
                      <div className="flex items-center gap-2.5">
                        <FilterCheckbox checked={selected.includes(cat)} />
                        <span className="font-mono text-sm">{formatCat(cat)}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map((cat) => (
            <span
              key={cat}
              className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 font-mono text-[11px] text-gray-700"
            >
              {formatCat(cat)}
              <button type="button" onClick={() => toggle(cat)}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
