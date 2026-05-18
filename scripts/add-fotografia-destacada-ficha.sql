-- =====================================================================
-- Migración: foto destacada de la ficha de especie via FK a fototeca
-- =====================================================================
-- Diseño:
--   1. ficha_especie.fotografia_destacada_id BIGINT NULL → fotografia(id_fotografia)
--   2. Trigger que valida que la foto pertenece al mismo taxon que la ficha
--      y que la foto tiene taxon_id (no NULL).
--   3. Backfill desde el actual ficha_especie.fotografia_ficha (string)
--      cuando exista un registro en `fotografia` con misma URL y mismo taxon.
--   4. La columna ficha_especie.fotografia_ficha (varchar) se mantiene como
--      fallback hasta que se cure el catálogo. NO se elimina aquí.
-- =====================================================================

BEGIN;

-- 1. Nueva columna FK
ALTER TABLE public.ficha_especie
  ADD COLUMN IF NOT EXISTS fotografia_destacada_id BIGINT NULL
    REFERENCES public.fotografia(id_fotografia) ON DELETE SET NULL;

-- Índice para lookups rápidos al pintar la card y para JOINs reversos
CREATE INDEX IF NOT EXISTS idx_ficha_especie_fotografia_destacada
  ON public.ficha_especie (fotografia_destacada_id)
  WHERE fotografia_destacada_id IS NOT NULL;

-- 2. Función trigger: la foto debe tener taxon_id y debe coincidir con el de la ficha
CREATE OR REPLACE FUNCTION public.validar_fotografia_destacada_ficha()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_taxon_foto BIGINT;
BEGIN
  IF NEW.fotografia_destacada_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT taxon_id
  INTO v_taxon_foto
  FROM public.fotografia
  WHERE id_fotografia = NEW.fotografia_destacada_id;

  IF v_taxon_foto IS NULL THEN
    RAISE EXCEPTION
      'fotografia % no tiene taxon_id asignado; no puede ser destacada en ficha %',
      NEW.fotografia_destacada_id, NEW.id_ficha_especie;
  END IF;

  IF v_taxon_foto <> NEW.taxon_id THEN
    RAISE EXCEPTION
      'fotografia % pertenece al taxon %, no coincide con el taxon % de la ficha %',
      NEW.fotografia_destacada_id, v_taxon_foto, NEW.taxon_id, NEW.id_ficha_especie;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validar_fotografia_destacada_ficha ON public.ficha_especie;
CREATE TRIGGER trg_validar_fotografia_destacada_ficha
  BEFORE INSERT OR UPDATE OF fotografia_destacada_id, taxon_id
  ON public.ficha_especie
  FOR EACH ROW
  EXECUTE FUNCTION public.validar_fotografia_destacada_ficha();

-- 3. Backfill: matchear por URL exacta + mismo taxon.
--    Si una ficha tiene >1 candidato (raro), tomamos el de menor id_fotografia
--    para que la migración sea determinista.
WITH candidatos AS (
  SELECT
    fe.id_ficha_especie,
    fe.taxon_id,
    MIN(f.id_fotografia) AS id_fotografia
  FROM public.ficha_especie fe
  JOIN public.fotografia f
    ON f.taxon_id = fe.taxon_id
   AND f.enlace   = fe.fotografia_ficha
  WHERE fe.fotografia_ficha IS NOT NULL
    AND fe.fotografia_destacada_id IS NULL
  GROUP BY fe.id_ficha_especie, fe.taxon_id
)
UPDATE public.ficha_especie fe
SET fotografia_destacada_id = c.id_fotografia
FROM candidatos c
WHERE fe.id_ficha_especie = c.id_ficha_especie;

-- 4. Sanity check post-migración:
--    no debería quedar ningún FK apuntando a una foto de otro taxon.
DO $$
DECLARE
  v_invalidas INT;
BEGIN
  SELECT COUNT(*)
  INTO v_invalidas
  FROM public.ficha_especie fe
  JOIN public.fotografia f
    ON f.id_fotografia = fe.fotografia_destacada_id
  WHERE fe.fotografia_destacada_id IS NOT NULL
    AND (f.taxon_id IS NULL OR f.taxon_id <> fe.taxon_id);

  IF v_invalidas > 0 THEN
    RAISE EXCEPTION
      'Migración falló: % fichas quedaron con fotografia_destacada_id inconsistente',
      v_invalidas;
  END IF;
END
$$;

COMMIT;

-- =====================================================================
-- Resolución sugerida de la "foto de portada" en la app (cascada):
--   1. ficha_especie.fotografia_destacada_id (FK curado)
--   2. ficha_especie.fotografia_ficha (URL legacy)
--   3. primera fotografia.enlace del mismo taxon ordenada por
--      (orden NULLS LAST, id_fotografia)
--
-- Se puede materializar en una vista para simplificar el front:
--
-- CREATE OR REPLACE VIEW public.vw_ficha_especie_portada AS
-- SELECT
--   fe.id_ficha_especie,
--   fe.taxon_id,
--   COALESCE(
--     f_dest.enlace,
--     fe.fotografia_ficha,
--     f_fallback.enlace
--   ) AS portada_url,
--   COALESCE(f_dest.autor, fe.autor_foto_ficha, f_fallback.autor) AS portada_autor
-- FROM public.ficha_especie fe
-- LEFT JOIN public.fotografia f_dest
--   ON f_dest.id_fotografia = fe.fotografia_destacada_id
-- LEFT JOIN LATERAL (
--   SELECT enlace, autor
--   FROM public.fotografia
--   WHERE taxon_id = fe.taxon_id
--   ORDER BY orden NULLS LAST, id_fotografia
--   LIMIT 1
-- ) f_fallback ON TRUE;
-- =====================================================================
