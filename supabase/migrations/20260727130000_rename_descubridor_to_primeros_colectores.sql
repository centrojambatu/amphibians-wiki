-- Rename ficha_especie.descubridor -> ficha_especie.primeros_colectores
-- to better reflect the semantic meaning of the field.

ALTER TABLE public.ficha_especie
  RENAME COLUMN descubridor TO primeros_colectores;
