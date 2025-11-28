"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {Search, Loader2} from "lucide-react";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";

export default function EditorCitasSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Array<{id_taxon: number; taxon: string}>>([]);
  const router = useRouter();

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`/api/search-taxon?q=${encodeURIComponent(searchTerm)}`);
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

  const handleSelect = (taxonId: number) => {
    router.push(`/sapopedia/editor-citas/${taxonId}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Buscar por nombre científico o ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={isSearching || !searchTerm.trim()}>
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Resultados ({results.length}):</p>
          <div className="max-h-60 space-y-1 overflow-y-auto">
            {results.map((result) => (
              <button
                key={result.id_taxon}
                onClick={() => handleSelect(result.id_taxon)}
                className="w-full rounded border border-gray-200 bg-white p-3 text-left hover:bg-gray-50"
              >
                <div className="font-medium">{result.taxon}</div>
                <div className="text-xs text-gray-500">ID: {result.id_taxon}</div>
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

