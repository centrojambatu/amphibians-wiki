-- Recreate view vw_ficha_especie_completa
-- Dropped in cascade when columns were removed from ficha_especie.
-- Columns distribucion / observacion_zona_altitudinal / referencia_area_protegida /
-- rango_altitudinal no longer exist in ficha_especie, so they are exposed as NULL
-- to keep the view surface stable for consumers.

CREATE OR REPLACE VIEW public.vw_ficha_especie_completa AS
SELECT
    fe.id_ficha_especie,
    e.id_taxon                                   AS especie_taxon_id,
    concat_ws(' ', g.taxon, e.taxon)             AS nombre_cientifico,
    e.taxon                                      AS especie,
    e.autor_ano                                  AS especie_autor,
    g.taxon                                      AS genero,
    f.taxon                                      AS familia,
    o.taxon                                      AS orden,
    cl.taxon                                     AS clase,
    ph.taxon                                     AS phylum,
    re.taxon                                     AS reino,
    e.en_ecuador,
    e.endemica,
    e.nombre_comun,
    fe.publicar,
    fe.rango_altitudinal_min,
    fe.rango_altitudinal_max,
    NULL::text                                   AS rango_altitudinal,
    NULL::text                                   AS distribucion,
    NULL::text                                   AS distribucion_global,
    NULL::text                                   AS observacion_zona_altitudinal,
    NULL::text                                   AS referencia_area_protegida,
    fe.area_distribucion,
    fe.temperatura_prom                          AS temperatura,
    fe.pluviocidad_prom                          AS pluviocidad,
    fe.ultimo_avistamiento::text                 AS ultimo_avistamiento,
    fe.fuente_lista_roja,
    (
        SELECT string_agg(DISTINCT gp.nombre, ', ' ORDER BY gp.nombre)
        FROM taxon_geopolitica tg
        JOIN geopolitica gp ON gp.id_geopolitica = tg.geopolitica_id
        WHERE tg.taxon_id = e.id_taxon
          AND gp.rank_geopolitica_id = 3
    )                                            AS ubicaciones_geopoliticas,
    (
        SELECT string_agg(DISTINCT gp.nombre, ', ' ORDER BY gp.nombre)
        FROM taxon_geopolitica tg
        JOIN geopolitica gp ON gp.id_geopolitica = tg.geopolitica_id
        WHERE tg.taxon_id = e.id_taxon
          AND gp.rank_geopolitica_id = 3
          AND tg.principal = true
    )                                            AS ubicaciones_principales,
    (SELECT string_agg(DISTINCT c.nombre, ', ' ORDER BY c.nombre)
       FROM taxon_catalogo_awe tc
       JOIN catalogo_awe c ON c.id_catalogo_awe = tc.catalogo_awe_id
      WHERE tc.taxon_id = e.id_taxon AND c.tipo_catalogo_awe_id = 3)  AS awe_areas_protegidas_estado,
    (SELECT string_agg(DISTINCT c.nombre, ', ' ORDER BY c.nombre)
       FROM taxon_catalogo_awe tc
       JOIN catalogo_awe c ON c.id_catalogo_awe = tc.catalogo_awe_id
      WHERE tc.taxon_id = e.id_taxon AND c.tipo_catalogo_awe_id = 4)  AS awe_areas_protegidas_privadas,
    (SELECT string_agg(DISTINCT c.nombre, ', ' ORDER BY c.nombre)
       FROM taxon_catalogo_awe tc
       JOIN catalogo_awe c ON c.id_catalogo_awe = tc.catalogo_awe_id
      WHERE tc.taxon_id = e.id_taxon AND c.tipo_catalogo_awe_id = 23) AS awe_bosques_protegidos,
    (SELECT string_agg(DISTINCT c.nombre, ', ' ORDER BY c.nombre)
       FROM taxon_catalogo_awe tc
       JOIN catalogo_awe c ON c.id_catalogo_awe = tc.catalogo_awe_id
      WHERE tc.taxon_id = e.id_taxon AND c.tipo_catalogo_awe_id = 12) AS awe_cites,
    (SELECT string_agg(DISTINCT c.nombre, ', ' ORDER BY c.nombre)
       FROM taxon_catalogo_awe tc
       JOIN catalogo_awe c ON c.id_catalogo_awe = tc.catalogo_awe_id
      WHERE tc.taxon_id = e.id_taxon AND c.tipo_catalogo_awe_id = 5)  AS awe_distribucion_altitudinal,
    (SELECT string_agg(DISTINCT c.nombre, ', ' ORDER BY c.nombre)
       FROM taxon_catalogo_awe tc
       JOIN catalogo_awe c ON c.id_catalogo_awe = tc.catalogo_awe_id
      WHERE tc.taxon_id = e.id_taxon AND c.tipo_catalogo_awe_id = 21) AS awe_ecosistemas,
    (SELECT string_agg(DISTINCT c.nombre, ', ' ORDER BY c.nombre)
       FROM taxon_catalogo_awe tc
       JOIN catalogo_awe c ON c.id_catalogo_awe = tc.catalogo_awe_id
      WHERE tc.taxon_id = e.id_taxon AND c.tipo_catalogo_awe_id = 18) AS awe_estadio_animal,
    (SELECT string_agg(DISTINCT c.nombre, ', ' ORDER BY c.nombre)
       FROM taxon_catalogo_awe tc
       JOIN catalogo_awe c ON c.id_catalogo_awe = tc.catalogo_awe_id
      WHERE tc.taxon_id = e.id_taxon AND c.tipo_catalogo_awe_id = 17) AS awe_estatus_nombre_cientifico,
    (SELECT string_agg(DISTINCT c.nombre, ', ' ORDER BY c.nombre)
       FROM taxon_catalogo_awe tc
       JOIN catalogo_awe c ON c.id_catalogo_awe = tc.catalogo_awe_id
      WHERE tc.taxon_id = e.id_taxon AND c.tipo_catalogo_awe_id = 14) AS awe_estatus_tipologico,
    (SELECT string_agg(DISTINCT c.nombre, ', ' ORDER BY c.nombre)
       FROM taxon_catalogo_awe tc
       JOIN catalogo_awe c ON c.id_catalogo_awe = tc.catalogo_awe_id
      WHERE tc.taxon_id = e.id_taxon AND c.tipo_catalogo_awe_id = 2)  AS awe_etnia,
    (SELECT string_agg(DISTINCT c.nombre, ', ' ORDER BY c.nombre)
       FROM taxon_catalogo_awe tc
       JOIN catalogo_awe c ON c.id_catalogo_awe = tc.catalogo_awe_id
      WHERE tc.taxon_id = e.id_taxon AND c.tipo_catalogo_awe_id = 1)  AS awe_idioma,
    (SELECT string_agg(DISTINCT c.nombre, ', ' ORDER BY c.nombre)
       FROM taxon_catalogo_awe tc
       JOIN catalogo_awe c ON c.id_catalogo_awe = tc.catalogo_awe_id
      WHERE tc.taxon_id = e.id_taxon AND c.tipo_catalogo_awe_id = 11) AS awe_lista_roja_coloma,
    (SELECT string_agg(DISTINCT c.nombre, ', ' ORDER BY c.nombre)
       FROM taxon_catalogo_awe tc
       JOIN catalogo_awe c ON c.id_catalogo_awe = tc.catalogo_awe_id
      WHERE tc.taxon_id = e.id_taxon AND c.tipo_catalogo_awe_id = 10) AS awe_lista_roja_uicn,
    (SELECT string_agg(DISTINCT c.nombre, ', ' ORDER BY c.nombre)
       FROM taxon_catalogo_awe tc
       JOIN catalogo_awe c ON c.id_catalogo_awe = tc.catalogo_awe_id
      WHERE tc.taxon_id = e.id_taxon AND c.tipo_catalogo_awe_id = 6)  AS awe_regiones_biogeograficas,
    (SELECT string_agg(DISTINCT tc."observación", ', ' ORDER BY tc."observación")
       FROM taxon_catalogo_awe tc
       JOIN catalogo_awe c ON c.id_catalogo_awe = tc.catalogo_awe_id
      WHERE tc.taxon_id = e.id_taxon AND c.tipo_catalogo_awe_id = 6
        AND tc."observación" IS NOT NULL)                             AS awe_regiones_biogeograficas_detalle,
    (SELECT string_agg(DISTINCT c.nombre, ', ' ORDER BY c.nombre)
       FROM taxon_catalogo_awe tc
       JOIN catalogo_awe c ON c.id_catalogo_awe = tc.catalogo_awe_id
      WHERE tc.taxon_id = e.id_taxon AND c.tipo_catalogo_awe_id = 22) AS awe_reservas_biosfera,
    (SELECT string_agg(DISTINCT c.nombre, ', ' ORDER BY c.nombre)
       FROM taxon_catalogo_awe tc
       JOIN catalogo_awe c ON c.id_catalogo_awe = tc.catalogo_awe_id
      WHERE tc.taxon_id = e.id_taxon AND c.tipo_catalogo_awe_id = 20) AS awe_tipo_generacional
FROM taxon e
LEFT JOIN taxon g  ON e.taxon_id  = g.id_taxon
LEFT JOIN taxon f  ON g.taxon_id  = f.id_taxon
LEFT JOIN taxon o  ON f.taxon_id  = o.id_taxon
LEFT JOIN taxon cl ON o.taxon_id  = cl.id_taxon
LEFT JOIN taxon ph ON cl.taxon_id = ph.id_taxon
LEFT JOIN taxon re ON ph.taxon_id = re.id_taxon
JOIN ficha_especie fe ON fe.taxon_id = e.id_taxon
WHERE e.rank_id = 7;
