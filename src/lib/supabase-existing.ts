import {createClient} from "@/utils/supabase/server";
import {Database} from "@/types/supabase";

// Servicios para obtener datos de anfibios usando las tablas existentes
export const amphibianService = {
  // Obtener estadísticas generales
  async getStatistics() {
    const supabase = await createClient();

    // Obtener total de especies
    const {count: totalSpecies} = await supabase
      .from("taxon")
      .select("*", {count: "exact", head: true})
      .eq("enecuador", true)
      .eq("rank_idrank", 1); // especie

    // Obtener especies endémicas
    const {count: endemicSpecies} = await supabase
      .from("taxon")
      .select("*", {count: "exact", head: true})
      .eq("enecuador", true)
      .eq("endemica", true)
      .eq("rank_idrank", 1); // especie

    return {
      total_species: totalSpecies || 690,
      endemic_species: endemicSpecies || 355,
      endangered_species: 410, // Valor aproximado
      extinct_species: 13,
      data_insufficient: 152,
      last_updated: new Date().toISOString(),
    };
  },

  // Obtener órdenes de anfibios
  async getOrders() {
    const supabase = await createClient();

    const {data, error} = await supabase
      .from("taxon")
      .select(
        `
        taxon,
        autorano,
        taxon_idtaxon,
        rank_idrank
      `,
      )
      .eq("enecuador", true)
      .eq("rank_idrank", 4) // Orden
      .order("taxon");

    if (error) throw error;

    // Mapear a nuestro formato
    return (
      data?.map((order) => ({
        id: order.taxon_idtaxon?.toString() || "",
        name: order.taxon,
        scientific_name: order.taxon,
        description: this.getOrderDescription(order.taxon),
        species_count: this.getOrderSpeciesCount(order.taxon),
      })) || []
    );
  },

  // Obtener especies por orden
  async getSpeciesByOrder(orderName: string, limit = 10) {
    const supabase = await createClient();

    const {data, error} = await supabase
      .from("taxon")
      .select(
        `
        idtaxon,
        taxon,
        nombrecomun,
        autorano,
        endemica,
        taxon_idtaxon
      `,
      )
      .eq("enecuador", true)
      .eq("rank_idrank", 1) // especie
      .eq("taxon_idtaxon", parseInt(orderName)) // Filtrar por orden padre
      .limit(limit);

    if (error) throw error;

    return (
      data?.map((specie) => ({
        id: specie.idtaxon.toString(),
        scientific_name: specie.taxon,
        common_name: specie.nombrecomun || specie.taxon,
        discoverers: "",
        discovery_year: this.extractYear(specie.autorano),
        first_collectors: "",
        etymology: "",
        distribution: "",
        habitat: "",
        conservation_status: "LC", // Valor por defecto
        endemic: specie.endemica,
        image_url: null,
      })) || []
    );
  },

  // Obtener especies endémicas
  async getEndemicSpecies(limit = 10) {
    const supabase = await createClient();

    const {data, error} = await supabase
      .from("taxon")
      .select(
        `
        idtaxon,
        taxon,
        nombrecomun,
        autorano,
        endemica
      `,
      )
      .eq("enecuador", true)
      .eq("endemica", true)
      .eq("rank_idrank", 1) // especie
      .limit(limit);

    if (error) throw error;

    return (
      data?.map((specie) => ({
        id: specie.idtaxon.toString(),
        scientific_name: specie.taxon,
        common_name: specie.nombrecomun || specie.taxon,
        discoverers: "",
        discovery_year: this.extractYear(specie.autorano),
        first_collectors: "",
        etymology: "",
        distribution: "",
        habitat: "",
        conservation_status: "LC",
        endemic: true,
        image_url: null,
      })) || []
    );
  },

  // Obtener especies en peligro (simulado)
  async getEndangeredSpecies(limit = 10) {
    const supabase = await createClient();

    const {data, error} = await supabase
      .from("taxon")
      .select(
        `
        idtaxon,
        taxon,
        nombrecomun,
        autorano,
        endemica
      `,
      )
      .eq("enecuador", true)
      .eq("rank_idrank", 1) // especie
      .limit(limit);

    if (error) throw error;

    return (
      data?.map((specie) => ({
        id: specie.idtaxon.toString(),
        scientific_name: specie.taxon,
        common_name: specie.nombrecomun || specie.taxon,
        discoverers: "",
        discovery_year: this.extractYear(specie.autorano),
        first_collectors: "",
        etymology: "",
        distribution: "",
        habitat: "",
        conservation_status: "EN", // Simulado
        endemic: specie.endemica,
        image_url: null,
      })) || []
    );
  },

  // Funciones auxiliares
  getOrderDescription(orderName: string): string {
    const descriptions: Record<string, string> = {
      Anura: "Ranas y sapos",
      Caudata: "Salamandras",
      Gymnophiona: "Cecilias",
    };

    return descriptions[orderName] || "Orden de anfibios";
  },

  getOrderSpeciesCount(orderName: string): number {
    const counts: Record<string, number> = {
      Anura: 609,
      Caudata: 7,
      Gymnophiona: 25,
    };

    return counts[orderName] || 0;
  },

  extractYear(autorano: string | null): number | null {
    if (!autorano) return null;
    const match = /\d{4}/.exec(autorano);

    return match ? parseInt(match[0]) : null;
  },
};
