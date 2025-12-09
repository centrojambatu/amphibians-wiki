"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function EditorCitasSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<
    Array<{ id_taxon: number; taxon: string }>
  >([]);
  const router = useRouter();

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/search-taxon?q=${encodeURIComponent(searchTerm)}`,
      );
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error al buscar:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSelect = (result: { id_taxon: number; taxon: string }) => {
    // Convertir nombre científico a slug (reemplazar espacios por guiones)
    const slug = result.taxon.replace(/ /g, "-");
    router.push(`/sapopedia/editor-citas/${slug}`);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Buscar por nombre científico o ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Button
          onClick={handleSearch}
          disabled={isSearching || !searchTerm.trim()}
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Resultados ({results.length}):
          </p>
          <div className="max-h-60 space-y-1 overflow-y-auto rounded border border-gray-200 bg-white">
            {results.map((result) => (
              <button
                key={result.id_taxon}
                onClick={() => handleSelect(result)}
                className="w-full border-b border-gray-100 p-3 text-left transition-colors hover:bg-gray-50 last:border-b-0"
              >
                <div className="font-medium text-gray-900">{result.taxon}</div>
                <div className="text-xs text-gray-500">
                  ID: {result.id_taxon}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {results.length === 0 && searchTerm && !isSearching && (
        <p className="text-sm text-gray-500">No se encontraron resultados</p>
      )}
    </div>
  );
}
