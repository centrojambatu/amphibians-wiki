-- Lightweight map response at country scale, with record details fetched only
-- for the visible viewport after the user zooms in.

CREATE OR REPLACE FUNCTION public.get_mapoteca_filtered_rows(
  p_provincias text[] DEFAULT NULL,
  p_especies text[] DEFAULT NULL,
  p_localidades text[] DEFAULT NULL,
  p_catalogos text[] DEFAULT NULL,
  p_elevacion_min real DEFAULT NULL,
  p_elevacion_max real DEFAULT NULL,
  p_fecha_desde date DEFAULT NULL,
  p_fecha_hasta date DEFAULT NULL,
  p_taxon_ids bigint[] DEFAULT NULL,
  p_south double precision DEFAULT NULL,
  p_north double precision DEFAULT NULL,
  p_west double precision DEFAULT NULL,
  p_east double precision DEFAULT NULL
)
RETURNS SETOF public.mv_colecciones_mapa
LANGUAGE sql
STABLE
SET search_path = ''
AS $function$
  SELECT m.*
  FROM public.mv_colecciones_mapa AS m
  WHERE
    (p_provincias IS NULL OR m.provincia = ANY(p_provincias))
    AND (p_especies IS NULL OR EXISTS (
      SELECT 1
      FROM unnest(p_especies) AS requested_species(nombre)
      WHERE m.nombre_especie ILIKE '%' || requested_species.nombre || '%'
    ))
    AND (p_localidades IS NULL OR m.localidad = ANY(p_localidades))
    AND (p_catalogos IS NULL OR EXISTS (
      SELECT 1
      FROM unnest(p_catalogos) AS requested_catalog(catalogo_value)
      WHERE CASE
        WHEN position('::' IN requested_catalog.catalogo_value) > 0 THEN
          m.catalogo_museo = split_part(requested_catalog.catalogo_value, '::', 1)
          AND m.numero_museo = split_part(requested_catalog.catalogo_value, '::', 2)
        WHEN position(' ' IN requested_catalog.catalogo_value) > 0 THEN
          m.catalogo_museo = split_part(requested_catalog.catalogo_value, ' ', 1)
          AND m.numero_museo = split_part(requested_catalog.catalogo_value, ' ', 2)
        ELSE m.catalogo_museo = requested_catalog.catalogo_value
      END
    ))
    AND (p_elevacion_min IS NULL OR m.elevacion >= p_elevacion_min)
    AND (p_elevacion_max IS NULL OR m.elevacion <= p_elevacion_max)
    AND (p_fecha_desde IS NULL OR m.fecha_coleccion >= p_fecha_desde)
    AND (p_fecha_hasta IS NULL OR m.fecha_coleccion <= p_fecha_hasta)
    AND (p_taxon_ids IS NULL OR m.taxon_id = ANY(p_taxon_ids))
    AND (p_south IS NULL OR m.latitud >= p_south)
    AND (p_north IS NULL OR m.latitud <= p_north)
    AND (p_west IS NULL OR m.longitud >= p_west)
    AND (p_east IS NULL OR m.longitud <= p_east)
$function$;

REVOKE ALL ON FUNCTION public.get_mapoteca_filtered_rows(
  text[], text[], text[], text[], real, real, date, date, bigint[],
  double precision, double precision, double precision, double precision
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_mapoteca_filtered_rows(
  text[], text[], text[], text[], real, real, date, date, bigint[],
  double precision, double precision, double precision, double precision
) TO service_role;

CREATE OR REPLACE FUNCTION public.get_mapoteca_clusters(
  p_provincias text[] DEFAULT NULL,
  p_especies text[] DEFAULT NULL,
  p_localidades text[] DEFAULT NULL,
  p_catalogos text[] DEFAULT NULL,
  p_elevacion_min real DEFAULT NULL,
  p_elevacion_max real DEFAULT NULL,
  p_fecha_desde date DEFAULT NULL,
  p_fecha_hasta date DEFAULT NULL,
  p_taxon_ids bigint[] DEFAULT NULL,
  p_south double precision DEFAULT NULL,
  p_north double precision DEFAULT NULL,
  p_west double precision DEFAULT NULL,
  p_east double precision DEFAULT NULL,
  p_cell_size double precision DEFAULT 0.2
)
RETURNS TABLE(latitud double precision, longitud double precision, registros bigint)
LANGUAGE sql
STABLE
SET search_path = ''
AS $function$
  SELECT
    avg(filtered.latitud)::double precision AS latitud,
    avg(filtered.longitud)::double precision AS longitud,
    count(*)::bigint AS registros
  FROM public.get_mapoteca_filtered_rows(
    p_provincias, p_especies, p_localidades, p_catalogos,
    p_elevacion_min, p_elevacion_max, p_fecha_desde, p_fecha_hasta,
    p_taxon_ids, p_south, p_north, p_west, p_east
  ) AS filtered
  WHERE filtered.latitud IS NOT NULL AND filtered.longitud IS NOT NULL
  GROUP BY
    floor(filtered.latitud / greatest(p_cell_size, 0.01)),
    floor(filtered.longitud / greatest(p_cell_size, 0.01))
$function$;

REVOKE ALL ON FUNCTION public.get_mapoteca_clusters(
  text[], text[], text[], text[], real, real, date, date, bigint[],
  double precision, double precision, double precision, double precision, double precision
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_mapoteca_clusters(
  text[], text[], text[], text[], real, real, date, date, bigint[],
  double precision, double precision, double precision, double precision, double precision
) TO service_role;

CREATE OR REPLACE FUNCTION public.get_mapoteca_taxon_ids(
  p_provincias text[] DEFAULT NULL,
  p_especies text[] DEFAULT NULL,
  p_localidades text[] DEFAULT NULL,
  p_catalogos text[] DEFAULT NULL,
  p_elevacion_min real DEFAULT NULL,
  p_elevacion_max real DEFAULT NULL,
  p_fecha_desde date DEFAULT NULL,
  p_fecha_hasta date DEFAULT NULL,
  p_taxon_ids bigint[] DEFAULT NULL
)
RETURNS TABLE(taxon_id bigint)
LANGUAGE sql
STABLE
SET search_path = ''
AS $function$
  SELECT DISTINCT filtered.taxon_id
  FROM public.get_mapoteca_filtered_rows(
    p_provincias, p_especies, p_localidades, p_catalogos,
    p_elevacion_min, p_elevacion_max, p_fecha_desde, p_fecha_hasta,
    p_taxon_ids
  ) AS filtered
  WHERE filtered.rank_id = 7
$function$;

REVOKE ALL ON FUNCTION public.get_mapoteca_taxon_ids(
  text[], text[], text[], text[], real, real, date, date, bigint[]
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_mapoteca_taxon_ids(
  text[], text[], text[], text[], real, real, date, date, bigint[]
) TO service_role;

NOTIFY pgrst, 'reload schema';
