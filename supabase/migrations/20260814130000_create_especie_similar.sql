-- Tabla de especies similares (relación 1:N desde taxon).
--
-- Reemplaza al texto embebido en ficha_especie.identificacion, donde 183 fichas
-- llevaban un fragmento "Especies similares: <a href="...anfibioswebecuador...">
-- <i>Atelopus longirostris</i></a>" con enlaces muertos.
--
-- Unifica dos campos del prompt de sumarios: "Especies similares" y
-- "Comparaciones" (la prosa comparativa va en `comentario`).
--
-- taxon_similar_id es NULLABLE a propósito: de los 206 nombres científicos
-- citados hoy como similares, 70 (34%) son especies extranjeras que no existen
-- en `taxon` (Agalychnis callidryas, Atelopus carauta...). Un FK obligatorio
-- perdería un tercio de las relaciones, así que `nombre_similar` guarda siempre
-- el binomio y el FK se resuelve solo cuando la especie está en la BD.
--
-- La relación se guarda DIRIGIDA (tal como la declara la ficha origen). La
-- simetría se resuelve al leer:
--   WHERE taxon_id = X OR taxon_similar_id = X
-- Deliberadamente NO se usa un trigger espejo, para no repetir los problemas de
-- sincronización que tuvimos con taxon.nombre_comun <-> nombre_comun.

CREATE TABLE IF NOT EXISTS public.especie_similar (
  id_especie_similar bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  taxon_id           bigint NOT NULL REFERENCES public.taxon (id_taxon),
  taxon_similar_id   bigint REFERENCES public.taxon (id_taxon),
  nombre_similar     text   NOT NULL,
  comentario         text,
  publicacion_id     bigint REFERENCES public.publicacion (id_publicacion),
  orden              smallint,
  origen             text,
  CONSTRAINT especie_similar_no_auto
    CHECK (taxon_id IS DISTINCT FROM taxon_similar_id),
  CONSTRAINT especie_similar_nombre_no_vacio
    CHECK (btrim(nombre_similar) <> '')
);

-- Un par (taxón, especie similar) no se repite. Dos índices parciales porque la
-- identidad depende de si la especie similar está o no en `taxon`.
CREATE UNIQUE INDEX IF NOT EXISTS especie_similar_taxon_unico
  ON public.especie_similar (taxon_id, taxon_similar_id)
  WHERE taxon_similar_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS especie_similar_nombre_unico
  ON public.especie_similar (taxon_id, lower(nombre_similar))
  WHERE taxon_similar_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_especie_similar_taxon
  ON public.especie_similar (taxon_id);

CREATE INDEX IF NOT EXISTS idx_especie_similar_taxon_similar
  ON public.especie_similar (taxon_similar_id)
  WHERE taxon_similar_id IS NOT NULL;

COMMENT ON TABLE public.especie_similar IS
  'Especies similares / comparaciones por taxón. Relación dirigida; la simetría se resuelve en la consulta.';
COMMENT ON COLUMN public.especie_similar.taxon_similar_id IS
  'FK a taxon cuando la especie similar está en la BD; NULL para especies extranjeras.';
COMMENT ON COLUMN public.especie_similar.nombre_similar IS
  'Binomio siempre presente, incluso cuando taxon_similar_id es NULL.';
COMMENT ON COLUMN public.especie_similar.comentario IS
  'Prosa comparativa del campo "Comparaciones" del sumario.';
COMMENT ON COLUMN public.especie_similar.origen IS
  'Procedencia del registro: identificacion_legacy | sumario_word | manual.';
