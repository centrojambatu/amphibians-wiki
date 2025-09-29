import {createClient} from "@/utils/supabase/server";
import {Database} from "@/types/supabase";

// Servicios para obtener datos de anfibios
export const amphibianService = {
  // Obtener estadísticas generales
  async getStatistics() {
    const supabase = await createClient();
    const {data, error} = await supabase
      // @ts-ignore
      .from("amphibian_statistics")
      .select("*")
      .order("last_updated", {ascending: false})
      .limit(1)
      .single();

    if (error) throw error;

    return data;
  },

  // Obtener todos los órdenes
  async getOrders() {
    const supabase = await createClient();
    const {data, error} = await supabase
      // @ts-ignore
      .from("amphibian_orders")
      .select("*")
      .order("species_count", {ascending: false});

    if (error) throw error;

    return data;
  },

  // Obtener familias por orden
  async getFamiliesByOrder(orderId: string) {
    const supabase = await createClient();
    const {data, error} = await supabase
      // @ts-ignore
      .from("amphibian_families")
      .select("*")
      .eq("order_id", orderId)
      .order("species_count", {ascending: false});

    if (error) throw error;

    return data;
  },

  // Obtener especies por orden
  async getSpeciesByOrder(orderId: string, limit = 10) {
    const supabase = await createClient();
    const {data, error} = await supabase
      // @ts-ignore
      .from("amphibian_species")
      .select(
        `
        *,
        amphibian_genera!inner(
          *,
          amphibian_families!inner(
            *
          )
        )
      `,
      )
      .eq("amphibian_genera.amphibian_families.order_id", orderId)
      .limit(limit);

    if (error) throw error;

    return data;
  },

  // Obtener especies endémicas
  async getEndemicSpecies(limit = 10) {
    const supabase = await createClient();
    const {data, error} = await supabase
      // @ts-ignore
      .from("amphibian_species")
      .select(
        `
        *,
        amphibian_genera!inner(
          *,
          amphibian_families!inner(
            *
          )
        )
      `,
      )
      .eq("endemic", true)
      .limit(limit);

    if (error) throw error;

    return data;
  },

  // Obtener especies en peligro
  async getEndangeredSpecies(limit = 10) {
    const supabase = await createClient();
    const {data, error} = await supabase
      // @ts-ignore
      .from("amphibian_species")
      .select(
        `
        *,
        amphibian_genera!inner(
          *,
          amphibian_families!inner(
            *
          )
        )
      `,
      )
      .in("conservation_status", ["EN", "CR", "VU"])
      .limit(limit);

    if (error) throw error;

    return data;
  },
};
