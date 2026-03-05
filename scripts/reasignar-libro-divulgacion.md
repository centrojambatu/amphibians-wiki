# Por qué no hay publicaciones con tipo "Libro divulgación"

## Diagnóstico (consulta a la BD)

- En `catalogo_publicaciones` existe el ítem **"Libro divulgación"** (id = 9), tipo DIVULGACIÓN.
- En `publicacion_catalogo_awe` **ninguna fila** tiene `catalogo_publicaciones_id = 9`.
- Los ítems de divulgación con asignaciones son:
  - **Sitio WEB** (id 24): 383 publicaciones
  - Guía de campo, Lámina, Libro divulgación, Reportaje: 0 cada uno.

Entre las publicaciones que hoy están como divulgación (cualquier ítem de ese tipo), **ninguna** tiene la palabra "libro" en título ni en resumen. Por tanto, con los datos actuales no hay candidatos automáticos para reasignar a "Libro divulgación" solo por texto.

## Causas probables

1. **Origen de los datos**: Al cargar o migrar (p. ej. desde Excel o desde el antiguo `catalogo_awe`), es posible que:
   - No se usara el valor "libro divulgación" en la columna de tipo, o
   - Toda la divulgación se haya mapeado a un solo ítem (p. ej. "Sitio WEB").
2. **Script `assign-sin-asignar-publicaciones.py`**: Solo asigna tipo a publicaciones **sin ninguna** fila en `publicacion_catalogo_awe`. No cambia publicaciones que ya tienen tipo (p. ej. Sitio WEB), por eso no crea asignaciones a "Libro divulgación" a partir de las actuales.

## Qué hacer para tener "Libro divulgación"

- **Si tenéis una lista de `id_publicacion`** que deben ser "Libro divulgación", se puede ejecutar un `UPDATE` en `publicacion_catalogo_awe` poniendo `catalogo_publicaciones_id = 9` para esos IDs (y así no tocar el resto).
- **Si queréis usar reglas por texto** (título/resumen/editorial), se puede añadir un script que, solo sobre filas que ya son de tipo divulgación (p. ej. Sitio WEB), reasigne a "Libro divulgación" cuando cumplan un patrón (p. ej. "libro divulgación", "popular science book"). Con los datos actuales eso no encuentra candidatos; serviría para futuras cargas o si ampliáis el patrón.
- **Revisar el Excel/origen**: Comprobar si en la columna de tipo de publicación aparece "libro divulgación" y si esa columna es la que se usa para rellenar `publicacion_catalogo_awe` en la carga o migración.

Si indicas si preferís reasignar por lista de IDs o por reglas de texto, se puede concretar el script o la consulta SQL exacta.
