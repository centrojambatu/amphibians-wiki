// Minimal mock taxonomy dataset for Order → Family → Genus → Species navigation

export type MockOrder = {
  id: string;
  name: string;
  scientific_name: string;
  description: string;
};

export type MockFamily = {
  id: string;
  orderId: string;
  name: string;
  scientific_name: string;
  description?: string;
};

export type MockGenus = {
  id: string;
  familyId: string;
  name: string;
  scientific_name: string;
  description?: string;
};

export type MockSpecies = {
  id: string;
  genusId: string;
  scientific_name: string;
  common_name?: string;
  endemic?: boolean;
  conservation_status?: "CR" | "EN" | "VU" | "NT" | "LC";
  discovery_year?: number | null;
  distribution?: string;
};

const orders: MockOrder[] = [
  {
    id: "anura",
    name: "Anura",
    scientific_name: "Anura",
    description: "Ranas y sapos",
  },
  {
    id: "caudata",
    name: "Caudata",
    scientific_name: "Caudata",
    description: "Salamandras",
  },
  {
    id: "gymnophiona",
    name: "Gymnophiona",
    scientific_name: "Gymnophiona",
    description: "Cecilias",
  },
];

const families: MockFamily[] = [
  { id: "hylidae", orderId: "anura", name: "Hylidae", scientific_name: "Hylidae", description: "Ranas arborícolas" },
  { id: "bufonidae", orderId: "anura", name: "Bufonidae", scientific_name: "Bufonidae", description: "Sapos verdaderos" },
  { id: "plethodontidae", orderId: "caudata", name: "Plethodontidae", scientific_name: "Plethodontidae" },
  { id: "typhlonectidae", orderId: "gymnophiona", name: "Typhlonectidae", scientific_name: "Typhlonectidae" },
];

const genera: MockGenus[] = [
  { id: "hypsiboas", familyId: "hylidae", name: "Hypsiboas", scientific_name: "Hypsiboas" },
  { id: "dendropsophus", familyId: "hylidae", name: "Dendropsophus", scientific_name: "Dendropsophus" },
  { id: "rhinella", familyId: "bufonidae", name: "Rhinella", scientific_name: "Rhinella" },
  { id: "bolitoglossa", familyId: "plethodontidae", name: "Bolitoglossa", scientific_name: "Bolitoglossa" },
  { id: "typhlonectes", familyId: "typhlonectidae", name: "Typhlonectes", scientific_name: "Typhlonectes" },
];

const species: MockSpecies[] = [
  { id: "sp1", genusId: "hypsiboas", scientific_name: "Hypsiboas pellucens", common_name: "Rana de cristal", endemic: true, conservation_status: "LC", discovery_year: 1882, distribution: "Costa del Ecuador" },
  { id: "sp2", genusId: "dendropsophus", scientific_name: "Dendropsophus bifurcus", common_name: "Ranita amarilla", conservation_status: "NT", discovery_year: 1883, distribution: "Amazonía" },
  { id: "sp3", genusId: "rhinella", scientific_name: "Rhinella marinus", common_name: "Sapo de caña", conservation_status: "LC", discovery_year: 1758 },
  { id: "sp4", genusId: "bolitoglossa", scientific_name: "Bolitoglossa equatoriana", common_name: "Salamandra ecuatoriana", endemic: true, conservation_status: "EN", discovery_year: 1954 },
  { id: "sp5", genusId: "typhlonectes", scientific_name: "Typhlonectes compressicauda", common_name: "Cecilia acuática", conservation_status: "VU" },
];

export const mockTaxonomy = {
  // Orders
  getOrders(): MockOrder[] {
    return orders;
  },
  getOrderById(id: string): MockOrder | undefined {
    return orders.find((o) => o.id === id);
  },

  // Families
  getFamiliesByOrder(orderId: string): MockFamily[] {
    return families.filter((f) => f.orderId === orderId);
  },
  getFamilyById(id: string): MockFamily | undefined {
    return families.find((f) => f.id === id);
  },

  // Genera
  getGeneraByFamily(familyId: string): MockGenus[] {
    return genera.filter((g) => g.familyId === familyId);
  },
  getGenusById(id: string): MockGenus | undefined {
    return genera.find((g) => g.id === id);
  },

  // Species
  getSpeciesByGenus(genusId: string): MockSpecies[] {
    return species.filter((s) => s.genusId === genusId);
  },
  getSpeciesById(id: string): MockSpecies | undefined {
    return species.find((s) => s.id === id);
  },
};


