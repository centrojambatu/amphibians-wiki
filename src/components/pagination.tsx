import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  paginaActual: number;
  totalPaginas: number;
  baseUrl?: string;
  searchParams?: Record<string, string | undefined>;
}

export default function Pagination({
  paginaActual,
  totalPaginas,
  baseUrl = "/sapoteca",
  searchParams = {},
}: PaginationProps) {
  // Calcular páginas a mostrar
  const paginasAMostrar = [];
  const maxPaginas = 7; // Mostrar máximo 7 páginas

  let inicio = Math.max(1, paginaActual - Math.floor(maxPaginas / 2));
  let fin = Math.min(totalPaginas, inicio + maxPaginas - 1);

  // Ajustar inicio si estamos cerca del final
  if (fin - inicio < maxPaginas - 1) {
    inicio = Math.max(1, fin - maxPaginas + 1);
  }

  for (let i = inicio; i <= fin; i++) {
    paginasAMostrar.push(i);
  }

  const urlPagina = (pagina: number) => {
    const params = new URLSearchParams();

    // Preservar todos los parámetros de búsqueda excepto la página
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key !== "pagina" && value) {
        params.set(key, value);
      }
    });

    // Agregar página solo si no es la primera
    if (pagina > 1) {
      params.set("pagina", pagina.toString());
    }

    const queryString = params.toString();
    return `${baseUrl}${queryString ? `?${queryString}` : ""}`;
  };

  return (
    <div className="flex items-center justify-center gap-2">
      {/* Botón anterior */}
      {paginaActual > 1 ? (
        <Link href={urlPagina(paginaActual - 1)}>
          <Button variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
        </Link>
      ) : (
        <Button variant="outline" size="sm" disabled>
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
      )}

      {/* Páginas */}
      {inicio > 1 && (
        <>
          <Link href={urlPagina(1)}>
            <Button variant={paginaActual === 1 ? "default" : "outline"} size="sm">
              1
            </Button>
          </Link>
          {inicio > 2 && <span className="px-2 text-muted-foreground">...</span>}
        </>
      )}

      {paginasAMostrar.map((pagina) => (
        <Link key={pagina} href={urlPagina(pagina)}>
          <Button
            variant={paginaActual === pagina ? "default" : "outline"}
            size="sm"
          >
            {pagina}
          </Button>
        </Link>
      ))}

      {fin < totalPaginas && (
        <>
          {fin < totalPaginas - 1 && (
            <span className="px-2 text-muted-foreground">...</span>
          )}
          <Link href={urlPagina(totalPaginas)}>
            <Button
              variant={paginaActual === totalPaginas ? "default" : "outline"}
              size="sm"
            >
              {totalPaginas}
            </Button>
          </Link>
        </>
      )}

      {/* Botón siguiente */}
      {paginaActual < totalPaginas ? (
        <Link href={urlPagina(paginaActual + 1)}>
          <Button variant="outline" size="sm">
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      ) : (
        <Button variant="outline" size="sm" disabled>
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
