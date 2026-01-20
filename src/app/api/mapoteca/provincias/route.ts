import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

// Función para convertir nombre a slug (igual que en get-filter-catalogs.ts)
function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("geopolitica")
    .select("id_geopolitica, nombre")
    .eq("rank_geopolitica_id", 3) // RANK_PROVINCIAS = 3
    .order("nombre", { ascending: true });

  if (error) {
    console.error("Error al obtener provincias:", error);
    return NextResponse.json(
      { error: "Error al obtener provincias" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    (data || []).map((item) => ({
      id: item.id_geopolitica,
      nombre: item.nombre,
      value: toSlug(item.nombre),
    }))
  );
}
