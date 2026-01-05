import getColeccionesEspecie from "../get-colecciones-especie";

const ITEMS_POR_PAGINA = 20;

export interface ColeccionesPaginadas {
  colecciones: Awaited<ReturnType<typeof getColeccionesEspecie>>;
  total: number;
  totalPaginas: number;
  paginaActual: number;
}

/**
 * Obtiene las colecciones paginadas de una especie
 */
export default async function getColeccionesPaginadas(
  taxonId: number,
  nombreCientifico: string | undefined,
  pagina: number = 1,
): Promise<ColeccionesPaginadas> {
  // Obtener todas las colecciones
  const todasLasColecciones = await getColeccionesEspecie(taxonId, nombreCientifico);

  const total = todasLasColecciones.length;
  const totalPaginas = Math.ceil(total / ITEMS_POR_PAGINA);

  // Calcular índices para la paginación
  const inicio = (pagina - 1) * ITEMS_POR_PAGINA;
  const fin = inicio + ITEMS_POR_PAGINA;

  // Obtener solo las colecciones de la página actual
  const colecciones = todasLasColecciones.slice(inicio, fin);

  return {
    colecciones,
    total,
    totalPaginas,
    paginaActual: pagina,
  };
}
