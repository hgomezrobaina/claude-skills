# Fase 5 · Logo

Un buen logo es **simple, distintivo, apropiado, memorable y atemporal**, y funciona a 16 px, en una sola tinta y en negativo. No tiene que contar todo lo que hace la empresa: tiene que ser reconocible y cargarse de significado con el uso.

## Tipos y cuándo usar cada uno

| Tipo | Cuándo conviene | Cuidado |
| --- | --- | --- |
| **Wordmark** (solo el nombre) | Nombre corto, distintivo y nuevo que hay que enseñar a leer | Una app necesita igual un símbolo para su icono |
| **Lettermark / monograma** | Nombre largo o siglas | Las iniciales se parecen a muchas otras: verificar |
| **Símbolo + wordmark** (combinado) | Lo más versátil para apps: el símbolo vive solo en el icono y en el avatar | Que cada parte funcione por separado |
| **Símbolo abstracto** | Marca que quiere crecer a varias líneas o mercados | Cuesta cargarlo de significado; necesita uso y presupuesto |
| **Pictórico** (un objeto reconocible) | Producto concreto y fácil de evocar | El riesgo de cliché es máximo |
| **Emblema** (texto dentro de una forma) | Tradición, comunidad, sellos | Se lee mal en pequeño; prever una versión simplificada |
| **Mascota** | Marcas de consumo con mucho contenido | Exige un sistema de poses y expresiones |

## Proceso por rondas

### Ronda 1 · Exploración (amplia)

- Desde la ruta elegida, dibuja **3-6 símbolos** de ideas distintas (no variaciones de uno) y **2-3 wordmarks** con fuentes de categorías diferentes. Todo en **blanco y negro**: si no funciona sin color, no funciona.
- Cada idea en su propio SVG en `logo/rondas/r1/`, sobre una retícula simple (lienzo 100×100 o múltiplos de una unidad).
- Pasa **cada símbolo** por `proof.mjs` y míralo: descarta los que se vuelven mancha en silueta, los que no se reconocen desenfocados o los que se pierden a 16-24 px.
- Presenta los supervivientes en una hoja (`contact-sheet.mjs`), cada uno con su idea en una línea y qué atributo expresa. El usuario elige 1-2 para refinar (o pide otra ronda diciendo qué falta).

### Ronda 2 · Refinado

- Construcción en retícula: grosores consistentes, radios de una misma familia, ángulos repetidos (p. ej. solo 0°, 45° y 90°), proporciones con relación entre sí (1:2, 2:3, √2). Documenta la retícula en `logo/construction.svg`: el manual la muestra y permite redibujar el logo.
- **Correcciones ópticas** (la geometría perfecta se ve mal):
  - *Overshoot:* lo redondo y lo puntiagudo sobresale ~1-3 % de la línea base y de la altura para verse igual de alto que lo recto.
  - Los trazos horizontales se ven más gruesos que los verticales del mismo grosor: afínalos un poco.
  - En las uniones y cruces los trazos se "empastan": estréchalos en la intersección (*ink traps* cuando el tamaño es muy pequeño).
  - El centro óptico está un poco por encima del centro geométrico; un triángulo se centra por su masa, no por su caja.
  - Los círculos se ven más pequeños que los cuadrados de igual tamaño: compénsalos.
  - Un símbolo blanco sobre oscuro se ve más grueso: considera una versión en negativo con trazo afinado.
- **Wordmark:** fuente como punto de partida, nunca tal cual. Convierte a curvas con `outline-text.mjs`, ajusta el *tracking* y el **kerning par a par** (`--kern "r,a:-15;…"`), y modifica glifos para que sea propio (una terminación, una ligadura, un corte que remita al símbolo). Comprueba en minúsculas y mayúsculas cuál se ajusta a la personalidad.
- **Lockup:** relación de tamaño y distancia entre símbolo y texto (p. ej. el símbolo a la altura de las mayúsculas + x, separado por una unidad de la retícula); alineación óptica, no de caja.
- Aplica el color candidato **al final** y repite `proof.mjs` con él.

### Ronda 3 · Sistema de variantes

| Variante | Archivo (`logo/svg/`) | Uso |
| --- | --- | --- |
| Principal (horizontal) | `<slug>-horizontal.svg` | Cabeceras, documentos |
| Vertical (apilada) | `<slug>-vertical.svg` | Espacios cuadrados, portadas |
| Símbolo | `<slug>-symbol.svg` | Icono de app, avatar, favicon |
| Wordmark solo | `<slug>-wordmark.svg` | Cuando el símbolo ya aparece cerca |
| Monocromo negro / blanco | `<slug>-*-black.svg`, `-white.svg` | Una tinta, grabado, sobre fotos |
| Favicon simplificado | `<slug>-favicon.svg` | ≤ 32 px: menos detalle, trazos más gruesos |
| Glifo del icono de app | `<slug>-app-glyph.svg` (+ `-mono`) | Frente del icono, sin fondo |

**Logo responsive:** cómo se simplifica según el espacio (horizontal → símbolo + nombre corto → símbolo → favicon). Se muestra en el manual.

## Reglas de uso (van al manual)

- **Área de respeto** medida con un elemento del propio logo (la altura de la x, el ancho del símbolo), no en px fijos.
- **Tamaño mínimo** en px (digital) y en mm (impresión), con la muestra a ese tamaño.
- Fondos permitidos, versiones sobre fotografía, y **usos incorrectos** (estirar, rotar, recolorear, sombras, contornos, cambiar la fuente, reordenar el lockup, ponerlo sobre fondos sin contraste).

## Higiene del SVG final

- `viewBox` ajustado a la tinta; sin `width`/`height` fijos innecesarios; sin `<text>` (todo en curvas); sin `transform` anidados, metadatos de editores, ids aleatorios ni imágenes embebidas.
- Colores en hex exactos de `brand.json`; la versión monocroma puede usar `currentColor`.
- Revisa que el trazo esté **expandido a relleno** si debe escalar sin cambiar de grosor.
- Exporta y mira el resultado (`render-svg.mjs` + `Read`).

## Originalidad (puerta)

Antes de aprobar el logo: compáralo con la hoja de logos de la competencia (fase 2), haz la búsqueda **por imagen** en WIPO Global Brand Database y la de *design codes* de las bases de su mercado (`strategy.md`), y cuéntale al usuario lo encontrado. No se garantiza la ausencia de conflictos, pero se reduce el riesgo.
