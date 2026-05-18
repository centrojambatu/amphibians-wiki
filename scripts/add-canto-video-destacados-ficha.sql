-- =====================================================================
-- Migración: cantos y videos destacados de la ficha de especie
-- =====================================================================
-- Diseño:
--   1. ficha_especie.canto_destacado_id BIGINT NULL → canto(id_canto)
--   2. ficha_especie.video_destacado_id BIGINT NULL → video(id_video)
--   3. Trigger unificado (reemplaza al de fotografia) que valida que la
--      media destacada pertenece al mismo taxon que la ficha, usando la
--      cascada: coleccion.taxon_id → coleccion_externa.taxon_id → media.taxon_id.
--   4. Backfill automático: por cada ficha sin destacado, asignar el primer
--      registro candidato (publicar=true preferido, luego menor id).
--
-- IMPORTANTE: este script también reemplaza la función / trigger
-- `validar_fotografia_destacada_ficha` creada en
-- `add-fotografia-destacada-ficha.sql` por una versión más permisiva con
-- la misma cascada. Es estrictamente más amplia: nada de lo que pasaba
-- antes va a fallar ahora.
-- =====================================================================

BEGIN;

-- 1. Nuevas columnas FK
ALTER TABLE public.ficha_especie
  ADD COLUMN IF NOT EXISTS canto_destacado_id BIGINT NULL
    REFERENCES public.canto(id_canto) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS video_destacado_id BIGINT NULL
    REFERENCES public.video(id_video) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_ficha_especie_canto_destacado
  ON public.ficha_especie (canto_destacado_id)
  WHERE canto_destacado_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ficha_especie_video_destacado
  ON public.ficha_especie (video_destacado_id)
  WHERE video_destacado_id IS NOT NULL;

-- 2. Trigger unificado con cascada
DROP TRIGGER IF EXISTS trg_validar_fotografia_destacada_ficha ON public.ficha_especie;
DROP FUNCTION IF EXISTS public.validar_fotografia_destacada_ficha();

CREATE OR REPLACE FUNCTION public.validar_destacados_ficha()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_taxon_efectivo BIGINT;
BEGIN
  IF NEW.fotografia_destacada_id IS NOT NULL THEN
    SELECT COALESCE(c.taxon_id, ce.taxon_id, f.taxon_id)
    INTO v_taxon_efectivo
    FROM public.fotografia f
    LEFT JOIN public.coleccion c        ON c.id_coleccion = f.coleccion_id
    LEFT JOIN public.coleccion_externa ce ON ce.id        = f.coleccion_externa_id
    WHERE f.id_fotografia = NEW.fotografia_destacada_id;

    IF v_taxon_efectivo IS NULL THEN
      RAISE EXCEPTION
        'fotografia % no tiene taxon resolvible (ni directo ni via coleccion/coleccion_externa)',
        NEW.fotografia_destacada_id;
    END IF;
    IF v_taxon_efectivo <> NEW.taxon_id THEN
      RAISE EXCEPTION
        'fotografia % pertenece al taxon %, no coincide con el taxon % de la ficha %',
        NEW.fotografia_destacada_id, v_taxon_efectivo, NEW.taxon_id, NEW.id_ficha_especie;
    END IF;
  END IF;

  IF NEW.canto_destacado_id IS NOT NULL THEN
    SELECT COALESCE(c.taxon_id, ce.taxon_id, ca.taxon_id)
    INTO v_taxon_efectivo
    FROM public.canto ca
    LEFT JOIN public.coleccion c        ON c.id_coleccion = ca.coleccion_id
    LEFT JOIN public.coleccion_externa ce ON ce.id        = ca.coleccion_externa_id
    WHERE ca.id_canto = NEW.canto_destacado_id;

    IF v_taxon_efectivo IS NULL THEN
      RAISE EXCEPTION
        'canto % no tiene taxon resolvible (ni directo ni via coleccion/coleccion_externa)',
        NEW.canto_destacado_id;
    END IF;
    IF v_taxon_efectivo <> NEW.taxon_id THEN
      RAISE EXCEPTION
        'canto % pertenece al taxon %, no coincide con el taxon % de la ficha %',
        NEW.canto_destacado_id, v_taxon_efectivo, NEW.taxon_id, NEW.id_ficha_especie;
    END IF;
  END IF;

  IF NEW.video_destacado_id IS NOT NULL THEN
    SELECT COALESCE(c.taxon_id, ce.taxon_id, v.taxon_id)
    INTO v_taxon_efectivo
    FROM public.video v
    LEFT JOIN public.coleccion c        ON c.id_coleccion = v.coleccion_id
    LEFT JOIN public.coleccion_externa ce ON ce.id        = v.coleccion_externa_id
    WHERE v.id_video = NEW.video_destacado_id;

    IF v_taxon_efectivo IS NULL THEN
      RAISE EXCEPTION
        'video % no tiene taxon resolvible (ni directo ni via coleccion/coleccion_externa)',
        NEW.video_destacado_id;
    END IF;
    IF v_taxon_efectivo <> NEW.taxon_id THEN
      RAISE EXCEPTION
        'video % pertenece al taxon %, no coincide con el taxon % de la ficha %',
        NEW.video_destacado_id, v_taxon_efectivo, NEW.taxon_id, NEW.id_ficha_especie;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_destacados_ficha
  BEFORE INSERT OR UPDATE OF
    fotografia_destacada_id,
    canto_destacado_id,
    video_destacado_id,
    taxon_id
  ON public.ficha_especie
  FOR EACH ROW
  EXECUTE FUNCTION public.validar_destacados_ficha();

-- 3. Backfill canto
WITH cantos_taxon AS (
  SELECT ca.id_canto, ca.publicar,
         COALESCE(c.taxon_id, ce.taxon_id, ca.taxon_id) AS taxon_efectivo
  FROM public.canto ca
  LEFT JOIN public.coleccion c        ON c.id_coleccion = ca.coleccion_id
  LEFT JOIN public.coleccion_externa ce ON ce.id        = ca.coleccion_externa_id
),
candidatos_canto AS (
  SELECT DISTINCT ON (fe.id_ficha_especie)
    fe.id_ficha_especie,
    ct.id_canto
  FROM public.ficha_especie fe
  JOIN cantos_taxon ct ON ct.taxon_efectivo = fe.taxon_id
  WHERE fe.canto_destacado_id IS NULL
  ORDER BY fe.id_ficha_especie, COALESCE(ct.publicar, false) DESC, ct.id_canto ASC
)
UPDATE public.ficha_especie fe
SET canto_destacado_id = c.id_canto
FROM candidatos_canto c
WHERE fe.id_ficha_especie = c.id_ficha_especie;

-- 4. Backfill video
WITH videos_taxon AS (
  SELECT v.id_video, v.publicar,
         COALESCE(c.taxon_id, ce.taxon_id, v.taxon_id) AS taxon_efectivo
  FROM public.video v
  LEFT JOIN public.coleccion c        ON c.id_coleccion = v.coleccion_id
  LEFT JOIN public.coleccion_externa ce ON ce.id        = v.coleccion_externa_id
),
candidatos_video AS (
  SELECT DISTINCT ON (fe.id_ficha_especie)
    fe.id_ficha_especie,
    vt.id_video
  FROM public.ficha_especie fe
  JOIN videos_taxon vt ON vt.taxon_efectivo = fe.taxon_id
  WHERE fe.video_destacado_id IS NULL
  ORDER BY fe.id_ficha_especie, COALESCE(vt.publicar, false) DESC, vt.id_video ASC
)
UPDATE public.ficha_especie fe
SET video_destacado_id = v.id_video
FROM candidatos_video v
WHERE fe.id_ficha_especie = v.id_ficha_especie;

-- 5. Sanity check
DO $$
DECLARE
  v_invalidas INT;
BEGIN
  WITH validacion AS (
    SELECT fe.id_ficha_especie
    FROM public.ficha_especie fe
    LEFT JOIN public.canto ca ON ca.id_canto = fe.canto_destacado_id
    LEFT JOIN public.coleccion cc        ON cc.id_coleccion = ca.coleccion_id
    LEFT JOIN public.coleccion_externa cce ON cce.id        = ca.coleccion_externa_id
    LEFT JOIN public.video vi ON vi.id_video = fe.video_destacado_id
    LEFT JOIN public.coleccion vc        ON vc.id_coleccion = vi.coleccion_id
    LEFT JOIN public.coleccion_externa vce ON vce.id        = vi.coleccion_externa_id
    WHERE
      (fe.canto_destacado_id IS NOT NULL
        AND COALESCE(cc.taxon_id, cce.taxon_id, ca.taxon_id) IS DISTINCT FROM fe.taxon_id)
      OR
      (fe.video_destacado_id IS NOT NULL
        AND COALESCE(vc.taxon_id, vce.taxon_id, vi.taxon_id) IS DISTINCT FROM fe.taxon_id)
  )
  SELECT COUNT(*) INTO v_invalidas FROM validacion;

  IF v_invalidas > 0 THEN
    RAISE EXCEPTION
      'Migracion fallo: % fichas con canto/video destacado inconsistente', v_invalidas;
  END IF;
END
$$;

COMMIT;
