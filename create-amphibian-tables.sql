-- Crear tablas para Anfibios de Ecuador
-- Ejecutar este script en el SQL Editor de Supabase

-- Tabla de órdenes de anfibios
CREATE TABLE IF NOT EXISTS amphibian_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  scientific_name VARCHAR(100) NOT NULL,
  description TEXT,
  species_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de familias de anfibios
CREATE TABLE IF NOT EXISTS amphibian_families (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES amphibian_orders(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  scientific_name VARCHAR(100) NOT NULL,
  species_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de géneros de anfibios
CREATE TABLE IF NOT EXISTS amphibian_genera (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID REFERENCES amphibian_families(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  scientific_name VARCHAR(100) NOT NULL,
  species_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de especies de anfibios
CREATE TABLE IF NOT EXISTS amphibian_species (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  genus_id UUID REFERENCES amphibian_genera(id) ON DELETE CASCADE,
  scientific_name VARCHAR(200) NOT NULL,
  common_name VARCHAR(200) NOT NULL,
  discoverers TEXT,
  discovery_year INTEGER,
  first_collectors TEXT,
  etymology TEXT,
  distribution TEXT,
  habitat TEXT,
  conservation_status VARCHAR(50),
  endemic BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de estadísticas generales
CREATE TABLE IF NOT EXISTS amphibian_statistics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  total_species INTEGER NOT NULL,
  endemic_species INTEGER NOT NULL,
  endangered_species INTEGER NOT NULL,
  extinct_species INTEGER NOT NULL,
  data_insufficient INTEGER NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_amphibian_orders_name ON amphibian_orders(name);
CREATE INDEX IF NOT EXISTS idx_amphibian_families_order_id ON amphibian_families(order_id);
CREATE INDEX IF NOT EXISTS idx_amphibian_genera_family_id ON amphibian_genera(family_id);
CREATE INDEX IF NOT EXISTS idx_amphibian_species_genus_id ON amphibian_species(genus_id);
CREATE INDEX IF NOT EXISTS idx_amphibian_species_endemic ON amphibian_species(endemic);
CREATE INDEX IF NOT EXISTS idx_amphibian_species_conservation_status ON amphibian_species(conservation_status);

-- Función para actualizar el timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar automáticamente updated_at
DROP TRIGGER IF EXISTS update_amphibian_orders_updated_at ON amphibian_orders;
CREATE TRIGGER update_amphibian_orders_updated_at BEFORE UPDATE ON amphibian_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_amphibian_families_updated_at ON amphibian_families;
CREATE TRIGGER update_amphibian_families_updated_at BEFORE UPDATE ON amphibian_families FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_amphibian_genera_updated_at ON amphibian_genera;
CREATE TRIGGER update_amphibian_genera_updated_at BEFORE UPDATE ON amphibian_genera FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_amphibian_species_updated_at ON amphibian_species;
CREATE TRIGGER update_amphibian_species_updated_at BEFORE UPDATE ON amphibian_species FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE amphibian_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE amphibian_families ENABLE ROW LEVEL SECURITY;
ALTER TABLE amphibian_genera ENABLE ROW LEVEL SECURITY;
ALTER TABLE amphibian_species ENABLE ROW LEVEL SECURITY;
ALTER TABLE amphibian_statistics ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir lectura pública
DROP POLICY IF EXISTS "Allow public read access" ON amphibian_orders;
CREATE POLICY "Allow public read access" ON amphibian_orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON amphibian_families;
CREATE POLICY "Allow public read access" ON amphibian_families FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON amphibian_genera;
CREATE POLICY "Allow public read access" ON amphibian_genera FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON amphibian_species;
CREATE POLICY "Allow public read access" ON amphibian_species FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON amphibian_statistics;
CREATE POLICY "Allow public read access" ON amphibian_statistics FOR SELECT USING (true);
