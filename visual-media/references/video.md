# Vídeo (HyperFrames)

HyperFrames renderiza vídeo desde HTML: cada composición es un HTML con los tiempos en atributos `data-*` y una animación que se puede buscar fotograma a fotograma. Su skill `hyperframes` es la puerta de entrada y trae su propia entrevista, guion, storyboard y bucle de revisión. Aquí sólo va **lo que se le añade y cómo se le encaja**.

## Antes de empezar

1. Localiza la carpeta de recursos visuales y su `frame.md` (`workspace.md`). Sin marca no se construye.
2. Carga `hyperframes` y sigue su tabla de estado: proyecto nuevo, retomar o editar. Antes de escribir HTML, `hyperframes-core`; para la dirección visual, `hyperframes-creative`; para el movimiento, `hyperframes-animation`; antes de hacer a mano un efecto con nombre, `hyperframes-registry` (`npx hyperframes catalog --query "…"`).
3. `npx hyperframes usage --json` al empezar y antes de renderizar, como pide `hyperframes`.

## El guion: antes que nada

El guion se propone **en el chat** (o en la bitácora del contexto, si la tiene) y el usuario lo aprueba antes de crear el proyecto:

| Tiempo | Beat | Qué se ve | Texto en pantalla | Voz (si hay) | Dato y su fuente |
| --- | --- | --- | --- | --- | --- |

- 3-5 beats; el gancho en el primero, dentro de los 3-5 s.
- Duración por defecto: 15-30 s para redes; más sólo si se pide.
- El último beat dice lo que gana el espectador y adónde ir (el enlace, el repo). Propón 3-4 frases de cierre y que el usuario elija.
- Cada forma en el formato que mejor la cuenta: la interfaz maquetada para un resultado, código que se escribe para un antes/después, un diagrama que se dibuja para una relación, barras o un contador para una medida, 3D sólo si la profundidad *es* el argumento.

### Cómo se encaja con la entrevista de HyperFrames

El guion aprobado responde a casi todo lo que pregunta la entrevista de `hyperframes` (`references/intent-interview.md`). No hagas las mismas preguntas dos veces:

- Pasa por la entrevista sólo para lo que el guion no diga (la ruta, `flow`, `storyboard`) y da por confirmado lo que ya esté aprobado.
- Al crear el proyecto (`hyperframes init`), el `BRIEF.md` recoge el guion: `message` = la idea del vídeo; `destination`/`aspect`/`language`/`length` según `platforms.md`; el guion completo en `## Intent` y `## Notes`; las cifras con su fuente en `## Notes`.
- Ruta habitual: `faceless-explainer` (un artículo o una idea), `product-launch-video` (un producto desde su web), `pr-to-video` (un cambio de código), `motion-graphics` (< 10 s, sin voz). Si dudas, `general-video`.

## El proyecto

- Vive en `<media>/videos/`. Uno por vídeo, o uno por serie si el contexto lo decide así (lo dice su `README.md`).
- `frame.md` en la raíz del proyecto: copia del de la carpeta de recursos visuales (o un enlace simbólico), nunca una marca nueva.
- Lo que se repite entre vídeos de un contexto (la tarjeta de cierre, el chip de sección, la ventana de la app maquetada, el bloque de código que se escribe solo) es un **bloque propio** en `<media>/videos/blocks/`, montado como sub-composición. Antes de hacer uno, busca en el catálogo.
- El texto en pantalla, por idioma, en un archivo aparte (variables de la composición), para que la versión en otro idioma sólo cambie los textos.

## Audio

El audio es opcional, no por defecto: lo que diga la entrevista de estilo del contexto. La pista concreta, cada efecto y la voz se eligen con el usuario entre opciones con muestra y licencia (`resources.md`); `media-use` no decide solo.

- **Voz en off:** `media-use resolve --type voice` (TTS). Con voz, **subtítulos obligatorios** (`media-use` → transcripción → captions; o la ruta `embedded-captions` sobre metraje).
- **Música y efectos:** `media-use resolve --type bgm|sfx`. La música de fondo no puede tapar la voz (`hyperframes-audio`: ducking).
- La primera vez, `media-use` pide el CLI `heygen` (con `heygen auth login --oauth` hay un cupo gratis de TTS). **Pregunta al usuario** antes de instalar o iniciar sesión.
- Aunque haya audio, el vídeo se tiene que entender en mudo (regla 4).

## Construir y comprobar

1. `npx hyperframes lint` tras el primer HTML y tras cada cambio de estructura.
2. **Bucle visual:** `npx hyperframes snapshot --at <t1>,<t2>,…` con un tiempo por beat (y los de entrada y salida), júntalos en una hoja de contacto y **míralos**. Busca texto cortado, cosas tapadas, saltos entre beats, huecos vacíos, texto ilegible en un móvil. Corrige y repite.
3. `npx hyperframes check` (puerta final: errores, layout, contraste WCAG). Con `--snapshots` saca recortes de lo que falle.
4. `npx hyperframes preview --background` y dale la URL al usuario. **No se renderiza sin su visto bueno.**
5. `npx hyperframes render --output out/<id>.mp4`. Comprueba con `ffprobe -v error -show_format -show_streams` la duración, los fps, `yuv420p` y el tamaño (`platforms.md`), y mira fotogramas del MP4: un render correcto no garantiza los píxeles.
6. Los MP4 van en `out/` y no se versionan; el contexto dice dónde se anota qué vídeo va en cada post y de qué fotograma sale la portada.

## Checklist

- [ ] guion aprobado, cada cifra con su fuente
- [ ] marca del contexto (`frame.md`), sin colores ni fuentes inventados
- [ ] gancho legible en los primeros 5 s sin sonido
- [ ] con voz: subtítulos; con música: no tapa la voz
- [ ] hojas de contacto revisadas; `check` en verde
- [ ] visto bueno sobre la vista previa antes del render
- [ ] formato, fps y códec del destino (`platforms.md`)
- [ ] versión en cada idioma del contexto (sólo cambian los textos)
