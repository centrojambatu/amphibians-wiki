-- Add renacuajo column to ficha_especie.
-- Reemplaza a la antigua columna `larva` (eliminada en julio 2026, tenía 16
-- filas con contenido real). Destino del campo "Renacuajo" del prompt de
-- sumarios: introducciones de series de renacuajos y detalles de hábitat.
-- Texto libre con HTML inline (<i> para nombres científicos) y citas
-- {{id_publicacion}}.

ALTER TABLE public.ficha_especie
  ADD COLUMN IF NOT EXISTS renacuajo text;

COMMENT ON COLUMN public.ficha_especie.renacuajo IS
  'Descripción del renacuajo: series, estadíos y detalles de hábitat. Admite HTML inline y citas {{id_publicacion}}.';
