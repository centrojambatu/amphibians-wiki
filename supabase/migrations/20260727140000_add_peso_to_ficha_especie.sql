-- Add peso column to ficha_especie, exposed in the Morfometría section.
-- Kept as text so it can hold ranges + units (e.g. "5-8 g").

ALTER TABLE public.ficha_especie
  ADD COLUMN IF NOT EXISTS peso text;
