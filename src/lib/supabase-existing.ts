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
      .eq("en_ecuador", true)
      .eq("rank_id", 7); // especie

    // Obtener especies endémicas
    const {count: endemicSpecies} = await supabase
      .from("taxon")
      .select("*", {count: "exact", head: true})
      .eq("en_ecuador", true)
      .eq("endemica", true)
      .eq("rank_id", 7); // especie

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
        id_taxon,
        taxon,
        autor_ano,
        taxon_id,
        rank_id
      `,
      )
      .eq("en_ecuador", true)
      .eq("rank_id", 4) // Orden
      .order("taxon");

    if (error) throw error;

    // Mapear a nuestro formato
    return (
      data?.map((order) => ({
        id: order.id_taxon.toString(),
        name: order.taxon,
        scientific_name: order.taxon,
        description: this.getOrderDescription(order.taxon),
        species_count: this.getOrderSpeciesCount(order.taxon),
      })) || []
    );
  },

  // Obtener especies por orden - versión simplificada
  async getSpeciesByOrder(orderId: string, limit = 20) {
    // Por ahora, vamos a mostrar todas las especies hasta que implementemos la consulta correcta
    // TODO: Implementar consulta SQL compleja con JOINs para filtrar por orden
    const supabase = await createClient();

    const {data, error} = await supabase
      .from("taxon")
      .select(
        `
        idtaxon,
        taxon,
        nombre_comun,
        autorano,
        endemica,
        taxon_id
      `,
      )
      .eq("en_ecuador", true)
      .eq("rank_id", 7) // especie
      .limit(limit);

    if (error) throw error;

    return (
      data?.map((specie) => ({
        id: specie.id_taxon.toString(),
        scientific_name: specie.taxon,
        common_name: specie.nombre_comun || specie.taxon,
        discoverers: "",
        discovery_year: this.extractYear(specie.autor_ano),
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
        id_taxon,
        taxon,
        nombre_comun,
        autor_ano,
        endemica
      `,
      )
      .eq("en_ecuador", true)
      .eq("endemica", true)
      .eq("rank_id", 7) // especie
      .limit(limit);

    if (error) throw error;

    return (
      data?.map((specie) => ({
        id: specie.id_taxon.toString(),
        scientific_name: specie.taxon,
        common_name: specie.nombre_comun || specie.taxon,
        discoverers: "",
        discovery_year: this.extractYear(specie.autor_ano),
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
        id_taxon,
        taxon,
        nombre_comun,
        autor_ano,
        endemica
      `,
      )
      .eq("en_ecuador", true)
      .eq("rank_id", 7) // especie
      .limit(limit);

    if (error) throw error;

    return (
      data?.map((specie) => ({
        id: specie.id_taxon.toString(),
        scientific_name: specie.taxon,
        common_name: specie.nombre_comun || specie.taxon,
        discoverers: "",
        discovery_year: this.extractYear(specie.autor_ano),
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
