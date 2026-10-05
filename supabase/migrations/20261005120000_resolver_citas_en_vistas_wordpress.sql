-- Las fichas pasan a citar con marcadores {{id_publicacion}} (ver processCitationReferences en
-- src/lib/process-html-links.ts). WordPress lee etimologia, taxonomia y habitat_biologia por
-- JetEngine a través de estas dos vistas y no procesa los marcadores: sin esto mostraría "{{632}}".
--
-- resolver_citas() hace en SQL lo mismo que processCitationReferencesPlain: sustituye cada
-- {{id}} por la cita_corta de la publicación. Un id inexistente se deja tal cual (igual que la app).
-- La forma de las vistas no cambia: mismas columnas, mismos nombres, mismo orden.

CREATE OR REPLACE FUNCTION public.resolver_citas(texto text)
RETURNS text
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
    resultado text := texto;
    marcador  text;
    cita      text;
BEGIN
    IF texto IS NULL OR position('{{' IN texto) = 0 THEN
        RETURN texto;
    END IF;

    FOR marcador IN
        SELECT DISTINCT m[1] FROM regexp_matches(texto, '\{\{(\d+)\}\}', 'g') AS m
    LOOP
        SELECT p.cita_corta INTO cita
        FROM publicacion p
        WHERE p.id_publicacion = marcador::bigint;

        IF cita IS NOT NULL THEN
            resultado := replace(resultado, '{{' || marcador || '}}', cita);
        END IF;
    END LOOP;

    RETURN resultado;
END;
$$;

CREATE OR REPLACE VIEW public.vw_ficha_especie_conservacion AS
SELECT
    fe.id_ficha_especie,
    e.id_taxon,
    g.id_taxon                          AS id_genero,
    e.taxon                             AS especie,
    g.taxon                             AS genero,
    concat_ws(' ', g.taxon, e.taxon)    AS nombre_cientifico,
    e.nombre_comun,
    e.autor_ano,
    e.en_ecuador,
    e.endemica,
    resolver_citas(fe.etimologia)       AS etimologia,
    resolver_citas(fe.taxonomia)        AS taxonomia,
    resolver_citas(fe.habitat_biologia) AS habitat_biologia
FROM taxon e
JOIN taxon g          ON e.taxon_id = g.id_taxon
JOIN ficha_especie fe ON fe.taxon_id = e.id_taxon
WHERE e.rank_id = 7
  AND fe.anfibio_conservacion = true;

CREATE OR REPLACE VIEW public.vw_ficha_especie_investigacion AS
SELECT
    fe.id_ficha_especie,
    e.id_taxon,
    g.id_taxon                          AS id_genero,
    e.taxon                             AS especie,
    g.taxon                             AS genero,
    concat_ws(' ', g.taxon, e.taxon)    AS nombre_cientifico,
    e.nombre_comun,
    e.autor_ano,
    e.en_ecuador,
    e.endemica,
    resolver_citas(fe.etimologia)       AS etimologia,
    resolver_citas(fe.taxonomia)        AS taxonomia,
    resolver_citas(fe.habitat_biologia) AS habitat_biologia
FROM taxon e
JOIN taxon g          ON e.taxon_id = g.id_taxon
JOIN ficha_especie fe ON fe.taxon_id = e.id_taxon
WHERE e.rank_id = 7
  AND fe.anfibio_investigacion = true;
