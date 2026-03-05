-- ============================================================================
-- Recrear vistas que utilizan la tabla publicacion
-- Ejecutar en el SQL Editor de Supabase si las vistas se eliminan o fallan
-- tras cambios en columnas de publicacion.
-- ============================================================================

-- Vista para Sapoteca: publicaciones Ecuador con total_enlaces, anos, autores_nombres, indexada
CREATE OR REPLACE VIEW vw_publicacion_completa_ecuador AS
SELECT
  p.id_publicacion,
  p.titulo,
  p.titulo_secundario,
  p.cita_corta,
  p.cita,
  p.cita_larga,
  p.numero_publicacion_ano,
  p.fecha,
  p.indexada,
  (SELECT COUNT(*)::bigint FROM publicacion_enlace e
   WHERE e.publicacion_id = p.id_publicacion
     AND e.enlace IS NOT NULL AND e.enlace <> '' AND e.enlace <> 'http://') AS total_enlaces,
  (SELECT string_agg(pa.ano::text, ', ' ORDER BY pa.ano)
   FROM publicacion_ano pa WHERE pa.publicacion_id = p.id_publicacion) AS anos,
  (SELECT string_agg(trim(COALESCE(a.nombres,'') || ' ' || COALESCE(a.apellidos,'')), '; ' ORDER BY pa.orden_autor)
   FROM publicacion_autor pa
   JOIN autor a ON a.id_autor = pa.autor_id
   WHERE pa.publicacion_id = p.id_publicacion) AS autores_nombres
FROM publicacion p
WHERE p.anfibios_ecuador = true;

-- Vista para sugerencias (título y autores); basada en publicaciones Ecuador
CREATE OR REPLACE VIEW vw_publicacion_completa AS
SELECT id_publicacion, titulo, autores_nombres
FROM vw_publicacion_completa_ecuador;

-- ============================================================================
-- Vistas para estadísticas Sapoteca: solo publicaciones tipo CIENTÍFICA/TESIS
-- Usadas por las cards (indexadas, no indexadas, promedio, año actual, etc.)
-- ============================================================================
CREATE OR REPLACE VIEW vw_publicacion_cientifica_ecuador AS
SELECT p.*
FROM publicacion p
WHERE p.anfibios_ecuador = true
AND EXISTS (
  SELECT 1 FROM publicacion_catalogo_awe pca
  JOIN catalogo_publicaciones cp ON cp.id = pca.catalogo_publicaciones_id
  WHERE pca.publicacion_id = p.id_publicacion
  AND cp.tipo IN ('CIENTIFICA', 'TESIS')
);

CREATE OR REPLACE VIEW vw_total_autores_ecuador_cientificas AS
SELECT COUNT(DISTINCT pa.autor_id)::integer AS total
FROM publicacion_autor pa
WHERE pa.publicacion_id IN (SELECT id_publicacion FROM vw_publicacion_cientifica_ecuador);

-- ============================================================================
-- Otras vistas que usan publicacion (solo recrear si fallan)
-- ============================================================================
-- vw_publicacion_slug: slug para URLs de bibliografía
-- CREATE OR REPLACE VIEW vw_publicacion_slug AS
-- SELECT id_publicacion, cita_corta, numero_publicacion_ano, fecha, titulo,
--   generate_publicacion_slug(cita_corta, COALESCE(numero_publicacion_ano, (EXTRACT(year FROM fecha))::bigint), titulo, id_publicacion) AS slug
-- FROM publicacion p;

-- vw_publicaciones_ecuador_por_ano: conteo por año para histograma
-- CREATE OR REPLACE VIEW vw_publicaciones_ecuador_por_ano AS
-- SELECT pa.ano, (count(*))::integer AS cantidad
-- FROM publicacion_ano pa
-- JOIN publicacion p ON p.id_publicacion = pa.publicacion_id
-- WHERE p.anfibios_ecuador = true AND pa.ano >= 1849 AND pa.ano <= (EXTRACT(year FROM CURRENT_DATE))::integer
-- GROUP BY pa.ano ORDER BY pa.ano;
