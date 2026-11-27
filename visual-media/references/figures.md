# Figuras y diagramas (Remotion `<Still>`)

Una figura entra cuando enseña una **forma** que la prosa y el código no enseñan igual de bien: un grafo de dependencias, una frontera, un antes/después. Los mecanismos (un coste, una regla) se explican en texto.

Se hacen como `<Still>` de Remotion en el proyecto de figuras de la carpeta de recursos visuales (`workspace.md`), con un kit propio del contexto. Carga `remotion-best-practices` (y su `remotion-markup`) antes de escribir la primera.

## Criterio

- **Pocas.** En un artículo, 3-4; en unos docs, una por concepto difícil. Una figura de más hace que el lector hojee.
- **Plan antes de dibujar**, aprobado por el usuario: qué enseña cada figura, qué hay que mirar, con cuál se compara. Y una lista de **descartadas con su porqué**, para no volver a proponerlas.
- **El par obvio / solución** (lo que falla frente a lo que funciona, con **una sola diferencia visible**) suele ser la mejor figura.
- **Las figuras que se comparan se diseñan juntas**: mismo encuadre, mismas coordenadas para las cajas que se repiten, misma paleta, **constantes compartidas en el código**. Si se retoca una, se retoca la otra.
- El pie dice **qué mirar** ("la diferencia son las dos flechas de la izquierda"), no qué es la figura.
- El significado nunca depende sólo del color: también lo dicen la posición, el borde o una etiqueta.

## Vetos

- Diagramas genéricos que servirían para cualquier texto del tema (capas, círculos concéntricos de la arquitectura hexagonal).
- Cuadrantes con dos ejes que nadie ha medido.
- Un árbol de carpetas como imagen (va como bloque de texto).
- Una figura que repite una tabla o un snippet cercanos.
- Un diagrama de secuencia de algo que ya se lee en un snippet.

## El kit de figuras

Vive en `<media>/figures/src/kit/figure/` y lee la marca del contexto (`theme.ts` = los tokens de `frame.md`). Piezas mínimas; el de `Projects/tech-articles/videos/src/kit/figure/` es la referencia para copiar y adaptar a otra marca:

| Pieza | Qué hace |
| --- | --- |
| `Figure` | El lienzo: fondo de la marca, pie opcional de una línea, ancho fijo (`FIGURE_WIDTH`, p. ej. 1400 px) |
| `Node` | Una pieza con tono: `plain` (lo que ya existe), `accent` (lo que se defiende), `problem` (lo que falla), `muted` (montado pero no es el punto), `ghost` (tapado o ya no está) |
| `Edge` | Líneas de árbol sin flecha; flechas sólo con dirección; discontinuas para "escribe en" / "provee"; etiqueta opcional en mono |
| `Text` | Texto libre: fuente de prosa, o mono para código |
| `CodeCard` | Código con tonos por fragmento; da su geometría para que las flechas lleguen a una línea concreta |

Si una figura necesita una pieza que no existe, se añade **al kit**, no a la figura.

## Estructura y render

- Un componente por figura en `src/figures/<grupo>/<Nombre>.tsx`; los textos que no son código en `src/figures/<grupo>/copy.ts`, por idioma. Registro en `src/Root.tsx`:

```tsx
<Still id="<grupo>-fig-NN-<nombre>-es" component={Nombre} width={FIGURE_WIDTH} height={…} defaultProps={{ language: "es" as const }} />
```

- Render a 2× para que se vea nítido en pantallas retina:

```bash
npx remotion still <id> <destino>/NN-<nombre>.png --scale=2
```

- Dónde va el PNG y dónde se aloja al publicar lo decide el contexto (tech-articles: `diagrams/` del artículo y el repo del ejemplo).
- **Una figura y un beat de vídeo que cuentan lo mismo** comparten diseño: el vídeo (HyperFrames) copia la composición de la figura con los mismos tokens; no se intenta importar el componente React en el HTML.

## Bucle visual

`npx tsc --noEmit`, renderiza y **mira el PNG**: nada cortado ni solapado, las flechas llegan al borde de su caja, las etiquetas no pisan líneas, el pie no choca con el último elemento. Corrige y repite. Las figuras que se comparan se miran lado a lado.
