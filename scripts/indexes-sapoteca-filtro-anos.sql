-- ============================================================================
-- Índices para optimizar el filtro de años en Sapoteca (Supabase Postgres best practices)
-- query-missing-indexes: índices en columnas WHERE para evitar full table scan
-- query-partial-indexes: índice parcial para publicaciones Ecuador
-- ============================================================================

-- 1. publicacion_ano(ano) — filtro por años (CRÍTICO: sin esto hay full table scan)
CREATE INDEX IF NOT EXISTS idx_publicacion_ano_ano
  ON publicacion_ano (ano);

-- 2. publicacion_ano(publicacion_id) — lookups y futuros JOINs
CREATE INDEX IF NOT EXISTS idx_publicacion_ano_publicacion_id
  ON publicacion_ano (publicacion_id);

-- 3. publicacion: índice parcial para listado Sapoteca (anfibios_ecuador = true, orden por año/fecha)
CREATE INDEX IF NOT EXISTS idx_publicacion_ecuador_orden
  ON publicacion (numero_publicacion_ano DESC NULLS LAST, fecha DESC NULLS LAST)
  WHERE anfibios_ecuador = true;

-- 4. publicacion(anfibios_ecuador) — usado en todas las consultas de lista
CREATE INDEX IF NOT EXISTS idx_publicacion_anfibios_ecuador
  ON publicacion (anfibios_ecuador)
  WHERE anfibios_ecuador = true;
