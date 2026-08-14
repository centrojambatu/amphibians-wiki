# amphibians-wiki — Centro Jambatu

Enciclopedia digital de anfibios del Ecuador. Next.js (App Router) + Supabase.

## Base de datos

Proyecto Supabase `amphibians-wiki`, ref **`dvjnsxvzwrfrolmhikzb`**, org `kruftahvafpxzmrinxsp`, us-east-2, PG 17.6.
Cuando el usuario dice "la base" o "Supabase", es este proyecto. Los otros accesibles vía MCP son de otra organización.

### Jerarquía taxonómica

`taxon` es autorreferencial: `taxon_id` apunta al padre. `rank_id = 7` es especie, `6` género.
El binomio se arma como `padre.taxon + " " + taxon`. Hay **880 taxa**, de los cuales **737 son especies**.

`ficha_especie` es **1:1 con las especies** (737 filas, 52 columnas). Cualquier carga masiva es en la
práctica un UPDATE por `taxon_id`, no un INSERT.

### Tablas relacionadas

| Tabla | Para qué |
|---|---|
| `publicacion` | 3.593 publicaciones. `cita_corta` **no es única** (320 grupos repetidos) |
| `taxon_publicacion` | Vínculo taxón↔publicación. Campos `referencia_clave` y `tema` |
| `especie_similar` | Especies similares / comparaciones (ver migración 20260814130000) |
| `tipo` | Material tipo (holotipos, sintipos), 521 filas |
| `nombre_comun` | Nombres comunes multiidioma |
| `catalogo_awe` | Catálogo genérico. `tipo_catalogo_awe_id` agrupa: 1=Idioma, 12=CITES, etc. |
| `taxon_catalogo_awe` | Vincula taxón con entradas del catálogo (CITES, listas rojas, regiones) |
| `manejo_ex_situ` | Manejo en cautiverio (solo 2 filas) |

### Vistas

- `vw_ficha_especie_completa` — jerarquía + datos numéricos. La consume el acordeón y la mapoteca.
- `vw_nombres_comunes` — nombres por idioma.
- `vw_ficha_especie_conservacion` / `vw_ficha_especie_investigacion` — **las lee WordPress vía JetEngine**.
  Exponen `etimologia`, `habitat_biologia` y `taxonomia` filtradas por los flags `anfibio_conservacion` /
  `anfibio_investigacion`. Cambiar esas columnas altera el sitio de WordPress en vivo.

## Reglas críticas

### Nombres comunes en español

`taxon.nombre_comun` es la **fuente de verdad**. La fila principal en `nombre_comun` es un espejo
mantenido por trigger, y un segundo trigger **rechaza la edición manual** del principal en español.
Editar solo en `taxon`. Otros idiomas sí se editan directo en `nombre_comun`.

### Citas bibliográficas

El marcador es **`{{id_publicacion}}`** literal dentro del texto. `processCitationReferences`
(`src/lib/process-html-links.ts`) lo sustituye por `cita_corta` con un popup que muestra `cita_larga`.

- **"Literatura citada" solo muestra las publicaciones referenciadas en el texto.** Una publicación
  vinculada en `taxon_publicacion` pero sin su `{{id}}` en ningún campo **no aparece**.
- El vínculo en `taxon_publicacion` **no es necesario** para que la cita resuelva: si falta, se carga
  directo de `publicacion` por id.
- Un `{{id}}` inexistente se renderiza crudo en la página. Nunca inventar ids.
- Solo **13 campos** escanean citas, listados en `camposTexto` de
  `src/app/sapopedia/species/[id]/get-ficha-especie.ts`. Un campo nuevo debe añadirse ahí o sus citas
  no funcionan.

### HTML en los campos de texto

Usar **`<i>`** para nombres científicos, no `<em>` (la base tiene 13.048 `<i>` contra 4 `<em>`).
Los enlaces se procesan con `processHTMLLinks`.

### Validación de claves foráneas

Nunca validar con `SELECT COUNT(*) ... WHERE col IN (...)`. Sin restricción `UNIQUE` los duplicados
inflan el conteo y dan falsos positivos. Ya ocurrió: una validación reportó 287/287 y el INSERT falló
con 5 huérfanos. Usar `NOT EXISTS` para listar exactamente cuáles faltan.

### "No disponible" es relleno, no dato

Varias columnas parecen llenas pero son texto de relleno: `dieta` 492 de 502, `distribucion_global`
406 de 496, `reproduccion` 374 de 502, `color_en_vida` 294 de 502. Cualquier regla del tipo
"actualizar solo si está vacío" debe tratar ese texto como vacío o no escribirá casi nada.

### Caché

Las páginas de fichas usan `unstable_cache`. Tras una carga masiva hay que invalidar o los cambios
no se ven, aunque los datos estén correctos.

## Añadir un campo de texto a la ficha

Hay que tocar **7 puntos** (referencia: los commits de `peso` y `renacuajo`):

1. Migración SQL en `supabase/migrations/`
2. `src/components/card-species-content.tsx` — sección en la interfaz
3. `src/components/card-species-content.tsx` — array `sections` del PDF exportable
4. `src/app/sapopedia/species/[id]/get-ficha-especie.ts` — `camposTexto` (para las citas)
5. `src/app/sapopedia/species/[id]/get-ficha-especie.ts` — objeto de retorno
6. `src/app/sapopedia/editor-citas/get-ficha-especie-editor.ts` — interfaz TS
7. `src/components/EditorCitas.tsx` + `src/app/api/ficha-especie/[taxonId]/route.ts` — campo editable
   y lista `camposEditables` (sin esto el editor no guarda)

Después, regenerar `src/types/supabase.ts`.

## Entorno y trampas conocidas

- **El MCP de Supabase devuelve "permission denied"**. Alternativas: la service role key de
  `.env.local` vía PostgREST (los scripts de `scripts/` usan ese patrón), o el SQL Editor.
- **No usar `supabase db push`**: 7 migraciones locales figuran como no aplicadas en remoto porque se
  aplicaron vía MCP con otro timestamp. Un push las re-ejecutaría todas.
- `npx tsc --noEmit` arroja **14 errores preexistentes** (fototeca y moleculoteca). Comparar antes y
  después, no buscar cero.
- macOS guarda los nombres de archivo en **NFD**. Comparar nombres con acentos requiere normalizar
  Unicode o los `dict.get()` fallan silenciosamente.
- Las columnas eliminadas en julio de 2026 siguen disponibles en `ficha_especie_backup_pre_recovery`
  (690 filas). Contenido real recuperable: `sinonimia` 451, `distribucion` 409, autoría de fichas
  (`compilador`, `editor`, `fecha_edicion`).

## Proyecto en curso: carga de sumarios

Fuente: **79 documentos .docx** en `~/Documents/1 Sumarios especies`, uno por género.
Análisis completo en `~/Documents/Analisis preliminar - Carga de sumarios.docx`.

### Hallazgos

- 649 fichas de especie; cubren **647 de las 737 especies (87,8 %)**. 90 sin cobertura.
- No son tablas: prosa con marcadores `Sección.—texto`. El encabezado de especie está casi siempre en
  mayúsculas, pero 12 fichas lo usan en formato normal.
- **La estructura no coincide con los campos destino.** "Color en vida" aparece 0 veces y "Peso" 0
  veces en 4,5 millones de caracteres: hay que dividir Identificación e Historia natural en siete
  campos. Es trabajo de criterio, no mecánico.
- **52 de los 79 archivos no tienen cursivas** y hay 1.395 párrafos con `**` literales. Los nombres
  científicos deben re-italizarse contra el índice de `taxon`.
- El sistema de citas está sin usar: **7 marcadores en 3 fichas de 737**. Todo el texto actual tiene
  las citas en prosa, así que casi ninguna ficha muestra bibliografía.
- 183 fichas llevan "Especies similares:" embebido en `identificacion` con enlaces muertos. De ahí
  salen 388 relaciones (`scripts/seed-especie-similar.py`, dry-run por defecto).
- El corpus usa el género `Noblella` donde la base usa `Phyllonastes` (6 especies).

### Pendiente

- Aplicar `20260814120000_add_renacuajo_to_ficha_especie.sql` y `20260814130000_create_especie_similar.sql`.
- Verificar que exista restricción `UNIQUE` en `ficha_especie.taxon_id` antes de cualquier upsert.
- Renderizar `especie_similar` en la ficha (hoy nada la muestra).
- 32 preguntas para el experto en la sección 7 del documento de análisis; 15 son bloqueantes.
- Confirmar si existe una segunda entrega de Pristimantis (el archivo se llama "1" y faltan 29 especies).

### Decidido

- El canto **no** se carga.
- "Comparaciones" y "Especies similares" son lo mismo → ambos van a `especie_similar`;
  la prosa comparativa en `comentario`.
- "Renacuajo" es columna propia de `ficha_especie`, mostrada dentro de Identificación.
- Las traducciones al inglés son **otra fase**; no mencionarlas en los entregables de esta.
