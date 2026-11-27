# Figuras

Una figura entra cuando enseña una **forma** que la prosa y el código no enseñan igual de bien: un grafo de dependencias, una frontera, un antes/después. Los mecanismos (un coste, una regla) se explican en texto.

## Presupuesto y criterio

- **Tres o cuatro figuras por artículo.** Una quinta empuja al lector a hojear.
- Cada figura en el plan de ilustraciones de `TODO.md`:

| Sección | Figura | Qué enseña | Composición (`<slug>-fig-NN-…`) | Estado |
| --- | --- | --- | --- | --- |

- Y una lista de **descartadas, con su porqué**, para no volver a proponerlas.
- **El par obvio / solución** (la salida que falla contra la que funciona, con **una sola diferencia visible**) suele ser la mejor figura de la prueba de fuego.
- **Las figuras que se comparan se diseñan juntas**: mismo encuadre, mismas coordenadas de las cajas que se repiten, misma paleta. Si una se retoca, la otra también. Lo único que cambia es la diferencia que se quiere enseñar.
- El pie dice **qué mirar** ("la diferencia son las dos flechas verticales de la izquierda"), no qué es la figura.

## Vetos

- **Los círculos concéntricos de la arquitectura hexagonal / clean.** Están en todos los artículos del tema, no dicen nada del argumento propio y hacen pensar que lo que viene es genérico.
- Diagramas de capas genéricos que servirían para cualquier artículo del tema.
- Cuadrantes con dos ejes que el artículo no ha medido.
- El árbol de carpetas como imagen (va como bloque de texto).
- Una figura que repite lo que ya enseña una tabla o un snippet dos secciones antes.
- Diagramas de secuencia de una petición cuyo recorrido ya se lee en un snippet.

## Estilo y paleta

Fondo oscuro moderno con los colores de Chaca (tokens de `chaca-web/src/index.css`), igual que los vídeos: las figuras y los vídeos salen del mismo kit y se ven iguales. Decidido por el autor el 2026-10-12.

- **Lienzo:** `scale-1` (`#161616`) con una rejilla de puntos tenue y un halo morado suave. Lo pone el componente `Figure`; no se dibuja a mano.
- **Tipografía:** JetBrains Mono para todo lo que es código (identificadores, tipos, valores); Space Grotesk para la prosa de la figura (notas, pasos, pie). Los identificadores no se traducen.
- **Tonos de `Node`** (el significado nunca depende sólo del color: lo dice también la posición, arriba/abajo, dentro/fuera):

| Tono | Rol | Color |
| --- | --- | --- |
| `plain` | componentes y piezas que ya existen | superficies `scale-3`/`scale-4`, borde `scale-7` |
| `accent` | lo que el artículo defiende | `purple-6` con halo, texto `purple-2`/`purple-3` |
| `problem` | lo que falla, el estado repartido | `carnation-500`, texto `carnation-300` |
| `muted` | lo que está montado pero no es el punto | `scale-2`, texto `scale-11` |
| `ghost` | lo tapado o lo que ya no está | borde discontinuo `scale-8` |

- **Datos que sobreviven** (un borrador, un valor que viaja): `green-400` como `subColor`.
- **Conectores (`Edge`):** líneas de árbol en gris sin flecha; flechas sólo cuando hay dirección; discontinuas para "escribe en" / "provee"; `accent` para el camino que el artículo defiende. Etiquetas de flecha en mono, 18 px.
- **Pie dentro de la figura (`footer`):** una línea con lo que demuestra, en números si los hay. El pie del artículo (`_…_` bajo la imagen) dice **qué mirar**.

## Herramienta: Remotion (`publish/videos/`)

Cada figura es un `<Still>` de Remotion en el mismo proyecto que los vídeos de la serie. Lee su `README.md` antes de tocarlo.

- **Kit de figuras** (`src/kit/figure/`): `Figure` (lienzo y pie), `Node`, `Edge`, `Text`, y `FIGURE_WIDTH` (1400 px). Coordenadas absolutas en píxeles de la figura. Si una figura necesita una pieza que no existe, se añade **al kit**, no a la figura.
- **Dónde va:** `src/figures/<slug>/<Nombre>.tsx`, un componente por figura, y todo el texto que no es código en `src/figures/<slug>/copy.ts`, por idioma. Registro en `src/Root.tsx`:

```tsx
<Still id="<slug>-fig-NN-<nombre>-es" component={Nombre} width={FIGURE_WIDTH} height={…} defaultProps={{ language: "es" as const }} />
```

- **Render** a 2× (2800 px de ancho: nítido en la columna de Medium y dev.to en pantallas retina), directo a la carpeta del artículo:

```bash
cd publish/videos
npx remotion still <slug>-fig-NN-<nombre>-es ../<slug>/diagrams/NN-<nombre>.png --scale=2
```

`NN` es el número de la sección. El PNG va en `diagrams/`; la fuente vive en `publish/videos/`.

- **Dónde se alojan al publicar** (decidido por el autor el 2026-10-13): en el repo del ejemplo, en `docs/diagrams/`, y el artículo las enlaza con su URL absoluta:

```md
![alt](https://raw.githubusercontent.com/<usuario>/<repo>/main/docs/diagrams/NN-<nombre>.png)
```

Así el Markdown se pega tal cual en dev.to, Hashnode o el importador de Medium, sin subir imágenes a mano en cada plataforma. Mientras el repo no existe, el borrador usa la ruta local `diagrams/NN-<nombre>.png`; al crear el repo se copian los PNG (los de `es` y los `-en`) a `docs/diagrams/`, se suben con un commit (con el visto bueno del autor: es un push) y se cambian las rutas de `es.md` y `en.md`. Comprueba que cada URL responde `200 image/png` con `curl -s -o /dev/null -w "%{http_code} %{content_type}" <url>`.
- **Si se retoca una figura** después de publicar: se vuelve a renderizar, se copia a `docs/diagrams/` con el mismo nombre y se sube. La URL no cambia; GitHub sirve la nueva en minutos, pero la plataforma puede tener la vieja en caché un tiempo.
- **Un artículo sin repo de ejemplo** necesita otro sitio: se pregunta al autor (crear el repo, o un repo de recursos de la serie) antes de publicar.

- **Bucle visual obligatorio:** `npx tsc --noEmit`, renderiza y **mira el PNG** antes de darla por buena: nada cortado ni solapado, las flechas llegan al borde de su caja, las etiquetas no pisan líneas, el pie no choca con el último elemento. Corrige y repite.
- **Las figuras que se comparan comparten constantes** (columnas, anchos, posiciones) en el código: si una se retoca, la otra se entera.
- **Para `en.md`:** se añade `en` a `copy.ts`, se registra `<slug>-fig-NN-<nombre>-en` y se renderiza a `NN-<nombre>-en.png`. Sólo cambia el texto; el dibujo es el mismo componente.
- **Una figura y un beat de vídeo que cuentan lo mismo** pueden compartir componente: la figura es su fotograma fijo.

Excalidraw (skill `excalidraw-diagram`) queda sólo para bocetos rápidos con el autor o si él lo pide; no para las figuras publicadas.

### Capturas de terminal → `freeze`

Para enseñar una métrica ejecutándose (la suite de tests, un benchmark): [`freeze`](https://github.com/charmbracelet/freeze) de Charm genera PNG/SVG de la salida real.

```bash
freeze --execute "npx vitest run" --output diagrams/NN-tests.png
```

Si no está instalado, pregunta antes de instalarlo (`go install github.com/charmbracelet/freeze@latest` o el binario de sus releases). Alternativa: un bloque de código con la salida literal, que además es buscable.

### Diagramas en texto

Mermaid sólo si la plataforma lo renderiza (GitHub sí; dev.to y Medium no): en artículos, exportar siempre a imagen. No propongas D2 salvo que el autor lo pida: exige otro toolchain.
