-- ============================================================================
-- vw_nombres_comunes: añadir orden, familia, genero desde vw_ficha_especie_completa
-- Objetivo: permitir que getTaxonNombres use una sola query en lugar de 5.
-- Postgres CREATE OR REPLACE VIEW exige preservar el orden de las columnas
-- existentes, por eso las nuevas van al final.
-- ============================================================================

CREATE OR REPLACE VIEW public.vw_nombres_comunes AS
SELECT
  vfc.id_ficha_especie,
  vfc.especie_taxon_id AS id_taxon,
  vfc.especie::character varying(100) AS especie,
  vfc.nombre_cientifico,
  MAX(CASE WHEN nc.catalogo_awe_idioma_id = 1 THEN nc.nombre END) AS nombre_comun_espanol,
  MAX(CASE WHEN nc.catalogo_awe_idioma_id = 8 THEN nc.nombre END) AS nombre_comun_ingles,
  MAX(CASE WHEN nc.catalogo_awe_idioma_id = 9 THEN nc.nombre END) AS nombre_comun_aleman,
  MAX(CASE WHEN nc.catalogo_awe_idioma_id = 10 THEN nc.nombre END) AS nombre_comun_frances,
  MAX(CASE WHEN nc.catalogo_awe_idioma_id = 11 THEN nc.nombre END) AS nombre_comun_portugues,
  MAX(CASE WHEN nc.catalogo_awe_idioma_id = 545 THEN nc.nombre END) AS nombre_comun_chino,
  MAX(CASE WHEN nc.catalogo_awe_idioma_id = 546 THEN nc.nombre END) AS nombre_comun_italiano,
  MAX(CASE WHEN nc.catalogo_awe_idioma_id = 547 THEN nc.nombre END) AS nombre_comun_hindu,
  MAX(CASE WHEN nc.catalogo_awe_idioma_id = 548 THEN nc.nombre END) AS nombre_comun_arabe,
  MAX(CASE WHEN nc.catalogo_awe_idioma_id = 549 THEN nc.nombre END) AS nombre_comun_ruso,
  MAX(CASE WHEN nc.catalogo_awe_idioma_id = 550 THEN nc.nombre END) AS nombre_comun_japones,
  MAX(CASE WHEN nc.catalogo_awe_idioma_id = 551 THEN nc.nombre END) AS nombre_comun_holandes,
  COALESCE(
    jsonb_object_agg(nc.catalogo_awe_idioma_id::text, nc.nombre)
      FILTER (WHERE nc.catalogo_awe_idioma_id IS NOT NULL AND nc.nombre IS NOT NULL),
    '{}'::jsonb
  ) AS nombres_comunes_json,
  vfc.orden,
  vfc.familia,
  vfc.genero
FROM public.vw_ficha_especie_completa vfc
LEFT JOIN public.nombre_comun nc
  ON nc.taxon_id = vfc.especie_taxon_id
  AND nc.principal = true
WHERE vfc.publicar = true
GROUP BY
  vfc.id_ficha_especie,
  vfc.especie_taxon_id,
  vfc.especie,
  vfc.nombre_cientifico,
  vfc.orden,
  vfc.familia,
  vfc.genero;
