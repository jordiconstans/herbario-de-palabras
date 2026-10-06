# Herbario de palabras

Colección etimológica de palabras españolas con esencias poéticas.
Es un árbol cuyas hojas son las palabras. Al tocar una hoja se abre su ficha, con el significado, la etimología y el aura.

## Cómo crece el árbol

- Las palabras están en `datos/palabras.json`, que es la única fuente.
- El árbol se dibuja solo, en orden cronológico. Cada rama reúne unas 6 palabras, y las más recientes brotan arriba.
- El color de cada hoja indica su categoría gramatical: sustantivo, adjetivo, verbo u otras.
- Cada palabra tiene su propio enlace, por ejemplo `.../#baladi`.

## Agregar una palabra

Agrega una entrada al final de `datos/palabras.json`:

```json
{
  "palabra": "Baladí",
  "fonetica": "/ba.laˈdi/",
  "categoria": "Adjetivo",
  "fecha": "2026-06-02",
  "esencia": "lo trivial nombrado sin desprecio",
  "significado": "…",
  "etimologia": "…",
  "aura": "…"
}
```

Los campos `esencia`, `aura` e `imagen` son opcionales. Si un campo dice `"pendiente"`, no se muestra.
La fonética es fonológica y usa seseo (español de Chile).

## Ver en local

La página carga el JSON, así que necesita un servidor y no funciona con doble clic:

```bash
python -m http.server 8420
```

y abre http://localhost:8420.

## Estructura

- `index.html`, `estilos.css`, `arbol.js`: la página.
- `datos/palabras.json`: las palabras.
- `referencia/herbario-original.html`: la primera versión, hecha en Claude Chat.
- `herramientas/corregir_v1.py`: la revisión de contenido aplicada al importar (6 oct 2026).
