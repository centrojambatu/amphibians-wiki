-- Recreate vw_ficha_especie_conservacion and vw_ficha_especie_investigacion,
-- consumed by the JetEngine integration on WordPress. Both dropped in cascade
-- when columns were removed from ficha_especie.
--
-- Shape mirrors the previous schema minus `colector` (also dropped from
-- ficha_especie). Filter columns anfibio_conservacion / anfibio_investigacion
-- are booleans on ficha_especie.

CREATE OR REPLACE VIEW public.vw_ficha_especie_conservacion AS
SELECT
    fe.id_ficha_especie,
    e.id_taxon,
    g.id_taxon                       AS id_genero,
    e.taxon                          AS especie,
    g.taxon                          AS genero,
    concat_ws(' ', g.taxon, e.taxon) AS nombre_cientifico,
    e.nombre_comun,
    e.autor_ano,
    e.en_ecuador,
    e.endemica,
    fe.etimologia,
    fe.taxonomia,
    fe.habitat_biologia
FROM taxon e
JOIN taxon g          ON e.taxon_id = g.id_taxon
JOIN ficha_especie fe ON fe.taxon_id = e.id_taxon
WHERE e.rank_id = 7
  AND fe.anfibio_conservacion = true;

CREATE OR REPLACE VIEW public.vw_ficha_especie_investigacion AS
SELECT
    fe.id_ficha_especie,
    e.id_taxon,
    g.id_taxon                       AS id_genero,
    e.taxon                          AS especie,
    g.taxon                          AS genero,
    concat_ws(' ', g.taxon, e.taxon) AS nombre_cientifico,
    e.nombre_comun,
    e.autor_ano,
    e.en_ecuador,
    e.endemica,
    fe.etimologia,
    fe.taxonomia,
    fe.habitat_biologia
FROM taxon e
JOIN taxon g          ON e.taxon_id = g.id_taxon
JOIN ficha_especie fe ON fe.taxon_id = e.id_taxon
WHERE e.rank_id = 7
  AND fe.anfibio_investigacion = true;
