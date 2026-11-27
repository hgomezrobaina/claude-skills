# Vídeo para la difusión (fase 4)

Un vídeo corto y sin sonido que acompaña al post de LinkedIn o X. No resume el artículo: **enseña en movimiento la única idea que hace pararse a alguien en el feed**, y lo manda al enlace. Se hace después de `social.md`, porque el gancho del vídeo es el mismo que el del post.

## Herramientas

- **Proyecto:** `publish/videos/` (Remotion), uno para toda la serie. Una composición por artículo e idioma: `<slug>-<lang>`, en `src/compositions/<slug>/`. Lee su `README.md` antes de tocar nada: kit, reglas y comandos.
- **Skills que se cargan:**
  - `remotion-best-practices` — siempre, antes de escribir una composición (sus referencias de `remotion-markup`: timing, secuencias, transiciones, textos, 3D).
  - `threejs-*` — sólo si una escena lleva 3D más allá de `CardStack3D` (geometría, materiales, luces). En Remotion manda la regla de `remotion-markup/3d.md`: todo dentro de `<ThreeCanvas>` y animado con `useCurrentFrame()`, nunca con `useFrame()`.
  - Las figuras del artículo salen del mismo proyecto (`src/figures/`, ver `diagrams.md`) y del mismo tema: un beat que cuenta lo mismo que una figura puede reutilizar su componente.
- **Kit** (`src/kit/`): tema con la paleta de Chaca (`theme.ts`), la interfaz maquetada (`src/kit/ui/`: `AppWindow`, `Dialog`, `Backdrop`, `Field`, `Button`, `Cursor`), `SectionChip`, `Stage`, `Headline`, `CodeBlock`, `Box`, `Arrow`, `BarChart`, `Counter`, `CardStack3D`, y los helpers de `animation.ts`. Si una escena necesita una pieza que no existe, se añade **al kit**, no a la composición, para que el siguiente vídeo la tenga.

## Qué se cuenta: el guion

Antes de escribir código, el guion va a `TODO.md` → *Distribución* → *Vídeo*, y **el autor lo aprueba** (regla 15). Formato:

| Tiempo | Beat | Qué se ve | Texto en pantalla | Dato y su fila en *Afirmaciones verificadas* |
| --- | --- | --- | --- | --- |

Reglas del guion:

1. **Enfoque publicitario: la solución primero.** Decidido por el autor el 2026-10-13. El vídeo no explica el artículo en orden, sino que lo vende: (1) **el resultado**, la interfaz haciendo lo que el patrón permite (un modal que se abre, una lista que se filtra…), maquetada con el kit `ui`; (2) **el código** que lo consigue, corto; (3) **la comparación** con cómo se hace normalmente (el snippet del gancho del artículo frente al de la solución); (4) **el caso difícil** (la prueba de fuego) resuelto en la interfaz; (5) **la tesis** y dónde está el código. Un solo fragmento de código por escena.
1b. **Contexto en cada escena.** Cada escena lleva arriba un `SectionChip` con su número y su nombre («1/4 El resultado», «3/4 La comparación»…) además del titular: quien entra a mitad del vídeo sabe dónde está.
2. **El gancho en los primeros 3-5 segundos**, con un número o un contraste que se entienda sin sonido. La única guía oficial que hay es la de anuncios de LinkedIn: *"Establish your point in the first 5 seconds"* y vídeos de 7-15 s con más finalización; para orgánico no hay cifra oficial.
3. **Duración: 20-30 segundos.** Más largo sólo si el autor lo pide.
4. **Cada forma, en el formato que mejor la cuenta:** la interfaz maquetada (`AppWindow`, `Dialog`, `Field`, `Button`, `Cursor`, con `zoom` para que se lea en un móvil) para el resultado; código que se escribe para el antes; un diagrama que se dibuja para una relación; barras o un contador para una medida; 3D sólo cuando la profundidad *es* el argumento (una pila frente a un único hueco, capas, algo que está debajo). El 3D por decoración se descarta.
5. **Ningún número tecleado:** cada cifra del vídeo tiene su fila en la tabla de afirmaciones verificadas del artículo, y se anota en el guion.
6. **El texto en pantalla se lee en un móvil:** titulares de 60-70 px a 1080 de ancho, una idea por titular, nada pegado a los bordes.
7. **El último beat es un eslogan de beneficio**, no la tesis literal del artículo: lo que el espectador gana, legible de un vistazo («Todos tus modales, un solo estado.»), y tiene que ser cierto tal cual (regla 4). Debajo, dónde está el código; el pie dice dónde leer el artículo. Sin logos ni música. Propón 3-4 eslóganes al autor y que elija.
8. **El dominio del vídeo es el del artículo** (regla 3): los mismos nombres que los snippets, y la interfaz maquetada copia los textos y los datos de `example/` (títulos, botones, datos semilla), en inglés como el código.

## Formatos por plataforma

Verificado el 2026-10-06 en las páginas de ayuda de LinkedIn y en la documentación de la API de X. **Las páginas de ayuda de X (help.x.com) no se pudieron abrir** (bloqueo de Cloudflare): lo de X sale de `docs.x.com` y de sus límites para subidas por API.

| | LinkedIn (post orgánico) | X (post) |
| --- | --- | --- |
| Duración | 3 s – 15 min | 0,5 s – 20 min sin Premium (docs de la API, changelog del 1-sep-2026) |
| Proporción | 1:2.4 – 2.4:1; en móvil, el reproductor vertical a pantalla completa puede recortar | 1:3 – 3:1; **recomendadas 16:9 y 1:1** |
| Resolución | 256×144 – 4096×2304 | 32×32 – 1280×1024 en la API; 1080p sólo con Premium, 720p sin él |
| Códec | MP4/H.264 (y otros) | H.264 High, AAC-LC si hay audio, YUV 4:2:0, ≤ 60 fps |
| Sonido | *"may play automatically without sound"* | autoplay; subtítulos SRT |
| Subtítulos | SRT desde escritorio | SRT desde la web |
| Portada | se sube desde escritorio | — |

Lo que eso decide:

- **LinkedIn:** `feed` (1080×1350, 4:5) es la que más pantalla ocupa en el móvil.
- **X:** `square` (1080×1080), decidido por el autor el 2026-10-06. La doc de la API recomienda 16:9 y 1:1; sin Premium, X reproduce a 720p, lo que no cambia el formato.
- Un artículo suele llevar **dos composiciones del mismo guion**: `<slug>-<lang>` en `feed` y `<slug>-<lang>-square`, el mismo componente con una prop `format`. Las posiciones verticales van en una tabla `LAYOUTS` por formato (ver `src/compositions/react-modals-slot/ModalSlot.tsx`): el cuadrado tiene ~870 px de alto útil frente a ~1140, así que lleva titulares, código y `zoom` menores, y las notas se juntan con su etiqueta o caben en una línea. Las coordenadas del cursor se calculan desde la app maquetada (`at(L, x, y)`), no a mano por formato.
- Salida: H.264 High, 30 fps, `yuv420p` BT.709 (ya fijado en `remotion.config.ts`).

## Cómo se construye y se comprueba

1. Guion aprobado en `TODO.md`.
2. `src/compositions/<slug>/copy.ts` (todo el texto, por idioma), `timing.ts` (los cortes de cada beat en frames, a partir de segundos) y el componente con un subcomponente por beat. Registro en `Root.tsx`.
3. `npx tsc --noEmit`.
4. **Bucle visual obligatorio**, igual que con las figuras: renderiza fotogramas sueltos de cada beat (`npx remotion still <id> out/fNNN.png --frame=NNN`), júntalos en una hoja de contacto y **míralos**. Busca texto cortado, elementos tapados (en 3D, que lo de detrás se lea), saltos entre beats y huecos vacíos. Corrige y repite.
5. Render: `npx remotion render <id> out/<id>.mp4`. Comprueba con `npx remotion ffprobe` duración, `yuv420p` y tamaño.
6. El `.mp4` se queda en `publish/videos/out/` (no se versiona) y `social.md` dice qué vídeo va en cada post y de qué fotograma sale la portada.

Si el autor quiere ver el vídeo mientras se hace, `npm run studio` abre la vista previa; no se renderiza el MP4 hasta que el guion esté cerrado.

## Checklist del vídeo

- [ ] guion aprobado por el autor, con cada dato enlazado a su fila verificada
- [ ] gancho legible en los primeros 5 s sin sonido
- [ ] 15-30 s; tesis en el último beat; pie con dónde leer el artículo
- [ ] hojas de contacto revisadas: nada cortado, nada tapado, ningún beat vacío
- [ ] `feed` para LinkedIn y `square` para X, `yuv420p`, 30 fps
- [ ] versión en inglés cuando exista `en.md` (sólo cambia `copy.ts`)
