# Optimización de carga – Sapoteca / Sapopedia

Resumen de cambios aplicados siguiendo **supabase-postgres-best-practices** para reducir el tiempo de carga de la página Sapoteca.

## Cambios aplicados

### 1. Índices (migración `indexes_sapopedia_filtros_performance`)

- **taxon_catalogo_awe**: `taxon_id`, `catalogo_awe_id` (consultas con `.in("taxon_id", taxonIds)` y JOINs).
- **taxon_geopolitica**: `taxon_id`, `geopolitica_id`.
- **catalogo_awe**: `tipo_catalogo_awe_id` (filtros por tipo en getFilterCatalogs y get-all-especies).
- **geopolitica**: `rank_geopolitica_id`.
- **nombre_comun**: índice parcial `(principal, catalogo_awe_idioma_id) WHERE principal = true` e índice en `taxon_id` (getTaxonNombres).

Referencias: `query-missing-indexes`, `schema-foreign-key-indexes`, `schema-partial-indexes`.

### 2. Consultas en paralelo en `get-all-especies.ts`

Las cinco consultas auxiliares (categorías UICN, taxon_catalogo_awe, taxon_geopolitica, ficha_especie, vw_nombres_comunes) se ejecutan ahora en un único `Promise.all` en lugar de en secuencia, reduciendo el tiempo total de round-trips.

Referencia: `data-n-plus-one` (evitar waterfall, batch/paralelizar).

### 3. Chunking de `.in()` en get-all-especies

Cuando `taxonIds` o `fichaEspecieIds` superan 200 elementos, las consultas se ejecutan por chunks de 200 IDs en paralelo y se unen los resultados en memoria. Así se evitan requests demasiado grandes y planes de ejecución ineficientes.

### 4. RPC get_taxon_hierarchy (página Nombres / getTaxonNombres)

Función SQL `get_taxon_hierarchy(taxon_ids)` que devuelve en una sola query (JOINs especie → género → familia → orden) la jerarquía para cada `id_taxon`. Sustituye las 4 consultas secuenciales por lote por 1 llamada RPC por lote (batches de 200), reduciendo round-trips en la página de nombres vernáculos.

## Recomendaciones opcionales (pendientes)

- **vw_ficha_especie_completa**: revisar definición y tablas base; asegurar índices en columnas usadas en la vista; valorar paginación o límite en la carga inicial.
- **EXPLAIN (ANALYZE)** en las consultas más costosas para validar uso de índices antes/después.
