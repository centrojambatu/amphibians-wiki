import {redirect} from "next/navigation";

import getEspeciesNavegacion, {toSlug} from "./get-especies-navegacion";

export default async function EditorCitasPage() {
  // Obtener la primera especie para redirigir
  const especies = await getEspeciesNavegacion();

  if (especies.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Editor de Citas</h1>
          <p className="mt-4 text-gray-600">No hay especies disponibles para editar.</p>
        </div>
      </div>
    );
  }

  // Redirigir a la primera especie usando el nombre científico
  redirect(`/sapopedia/editor-citas/${toSlug(especies[0].taxon)}`);
}

