# Traspaso: Herbario de palabras

Documento para continuar el proyecto en una sesión nueva de Claude Code. Actualizado el 20 de octubre de 2026.
Al empezar la sesión nueva, abre la carpeta `C:\Users\Admin\Claude\Projects\herbario-de-palabras` y pide: «Lee TRASPASO.md y README.md».

## Qué es

Es una web que dibuja **un árbol cuyas hojas son palabras hermosas**. Al tocar una hoja se abre una ficha con la esencia, el significado, la etimología y el aura de la palabra.
Subtítulo: *Colección etimológica de palabras españolas con esencias poéticas.*
Estilo pedido: **sobrio, orgánico y liviano a la vista**.

- Web publicada: https://jordiconstans.github.io/herbario-de-palabras/
- Repositorio: https://github.com/jordiconstans/herbario-de-palabras (rama `main`, GitHub Pages desde `/`)
- Carpeta local: `C:\Users\Admin\Claude\Projects\herbario-de-palabras`

## Archivos

| Archivo | Contenido |
|---|---|
| `index.html` | Estructura: cabecera, árbol SVG, índice, ficha lateral y panel para proponer palabras |
| `arbol.js` | Lógica: dibujo del árbol, ficha, índice y propuestas. La constante `PROPUESTAS_URL` está arriba |
| `estilos.css` | Estilos: tonos papel y sepia; tipografías Playfair Display, Lora y Cormorant Garamond |
| `datos/palabras.json` | **Única fuente de las palabras** (41) |
| `herramientas/propuestas.gs` | Script de Google Apps Script que hace de buzón de propuestas |
| `herramientas/corregir_v1.py` | Corrección de contenido aplicada una sola vez (histórica, no se vuelve a ejecutar) |
| `referencia/herbario-original.html` | Primera versión, hecha en Claude Chat |

## Cómo funciona el árbol

- Las palabras van en orden cronológico, con ramas de 6 palabras que alternan izquierda y derecha. Las más nuevas brotan arriba.
- El nombre del mes aparece en la rama donde empieza ese mes.
- El color de la hoja indica la categoría gramatical: sustantivo, adjetivo, verbo u otras.
- Las hojas que se superponen se separan solas mediante una relajación simple.
- Cada palabra tiene su enlace propio, con el formato `#slug` (por ejemplo, `#baladi`).
- Para ver la web en local: `python -m http.server 8420` y abrir http://localhost:8420. No funciona abriendo el archivo con doble clic.

## Formato de cada palabra (`datos/palabras.json`)

```json
{ "palabra": "", "fonetica": "/…/", "categoria": "", "fecha": "AAAA-MM-DD",
  "esencia": "", "significado": "", "etimologia": "", "aura": "" }
```
- `esencia`, `aura` e `imagen` son opcionales. Si un campo dice `"pendiente"`, no se muestra.
- La fonética es fonológica y usa **seseo** (español de Chile), por ejemplo `/kon.tuˈmas/`.

## Criterios de contenido acordados

- No inventar datos. Si una etimología es dudosa, se dice ("origen incierto", "es discutido").
- Se quitaron fechas y citas que no se podían verificar.
- Se usa *Ínfula* (no *Infula*) y *Lacticinio* (no *Laticinio*).
- *Heurístico* se queda como está. Jordi pidió **no** agregar *Heurística*.

## Propuestas de visitantes («brotes»)

- Decisión de Jordi: las propuestas **aparecen al instante** como brotes, sin aprobación previa. Se guardan en **Google Sheets**.
- Los brotes van en la copa del árbol, en la rama «brotes propuestos». Se ven como hojas pálidas de borde punteado, con «Propuesta por …» en la ficha.
- Para ocultar un brote, se cambia la columna `visible` a `FALSE` en la planilla.
- **Estado: falta activarlo.** Jordi tiene que crear la planilla, pegar `herramientas/propuestas.gs` en Apps Script e implementarlo como aplicación web («Ejecutar como: Yo»; «Acceso: Cualquier usuario»). Luego entrega la URL que termina en `/exec`.
- Con esa URL hay que poner la URL en `PROPUESTAS_URL` (en `arbol.js`), hacer commit y push, y probar una propuesta real. Mientras tanto, el botón «proponer una palabra» queda oculto.

## Pendientes

1. Activar el buzón de propuestas (ver arriba).
2. Esencias de las 34 palabras que aún no la tienen (por ahora la tienen 7: Baladí, Diptongo, Celibato, Abscisa, Idilio, Lacticinio y Elucubrar).
3. *Baladí*: falta el aura, y la fecha (2026-06-02) es provisoria.
4. Revisar la versión para celular: el árbol mide al menos 820 px de ancho y en pantallas chicas hay que deslizarlo hacia los lados.

## Forma de trabajo

- Para hacer commit: `git -c user.email=hola@auditagestion.cl -c user.name="Herbario" commit …`, terminando el mensaje con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Después, `git push`. GitHub Pages publica en 1 o 2 minutos.
- Jordi escribe en español, sin conocimientos técnicos profundos. Hay que explicarle los pasos de forma simple.
- Para agregar palabras, Jordi las dicta y Claude completa la entrada, revisa la etimología y la sube.
