# Vídeo para la difusión (fase 4)

Un vídeo corto que acompaña al post de LinkedIn o X. No resume el artículo: **enseña en movimiento la única idea que hace pararse a alguien en el feed**, y lo manda al enlace. Se hace después de `social.md`, porque el gancho del vídeo es el mismo que el del post.

**Método general: skill global `visual-media`** (herramienta, reglas, bucle visual, formatos). Carga primero esa skill y su `references/video.md`; aquí va sólo lo propio de la serie.

## Herramientas

- **Desde el 2026-11-27, los vídeos nuevos se hacen con HyperFrames** (decidido por el autor: para poder añadir voz, música y subtítulos más adelante). Proyecto de la serie: `Projects/tech-articles/hyperframes/`, un proyecto HyperFrames por vídeo (`<slug>-<lang>/`), con la marca de la serie en `hyperframes/frame.md` (mismos tokens que el kit de Remotion) y las piezas que se repiten en `hyperframes/blocks/`. Lee su `README.md` antes de tocar nada.
- **Los vídeos hechos antes** (`react-modals-slot`, `domain-errors-nest-react`) siguen en el proyecto Remotion `Projects/tech-articles/videos/` y se retocan allí, con `remotion-best-practices`. No se portan salvo que el autor lo pida.
- **Las figuras** siguen en Remotion (`diagrams.md`).
- **Piezas de la serie que hay que tener como bloques** (existían en el kit de Remotion, `videos/src/kit/`; se rehacen en HTML la primera vez que un vídeo las necesite, con su mismo aspecto): `SectionChip`, `Headline` con `*fragmento*` en acento, `CodeBlock` que se escribe solo y luego señala líneas, `Box`/`Arrow` que se dibujan, `BarChart`, `Counter`, `RepoBadge` de cierre, y la app maquetada (`AppWindow`, `Dialog`, `Field`, `Button`, `Cursor`, `Toast`). Antes de rehacer una, busca en el catálogo (`npx hyperframes catalog --query …`).

## Qué se cuenta: el guion

Antes de escribir código, el guion va a `TODO.md` → *Distribución* → *Vídeo*, y **el autor lo aprueba** (regla 15). Formato: la tabla de `visual-media/references/video.md` (tiempo, beat, qué se ve, texto, voz, dato) con el dato apuntando a su fila de *Afirmaciones verificadas*. Ese guion alimenta el `BRIEF.md` del proyecto HyperFrames (ruta `faceless-explainer`, salvo que el vídeo enseñe una web, que es `product-launch-video`).

Reglas propias de la serie:

1. **Enfoque publicitario: la solución primero.** Decidido por el autor el 2026-10-13. El vídeo no explica el artículo en orden, sino que lo vende: (1) **el resultado**, la interfaz haciendo lo que el patrón permite (un modal que se abre, una lista que se filtra…), maquetada; (2) **el código** que lo consigue, corto; (3) **la comparación** con cómo se hace normalmente (el snippet del gancho del artículo frente al de la solución); (4) **el caso difícil** (la prueba de fuego) resuelto en la interfaz; (5) **la tesis** y dónde está el código. Un solo fragmento de código por escena.
1b. **Contexto en cada escena.** Cada escena lleva arriba un chip de sección con su número y su nombre («1/4 El resultado», «3/4 La comparación»…) además del titular: quien entra a mitad del vídeo sabe dónde está.
2. **Duración: 20-30 segundos.** Más largo sólo si el autor lo pide.
3. **Ningún número tecleado:** cada cifra tiene su fila en la tabla de afirmaciones verificadas del artículo, y se anota en el guion.
4. **El último beat es un eslogan de beneficio**, no la tesis literal del artículo: lo que el espectador gana, legible de un vistazo («Todos tus modales, un solo estado.»), y tiene que ser cierto tal cual (regla 4). Debajo, dónde está el código (`RepoBadge`); el pie dice dónde leer el artículo. Sin logos. Propón 3-4 eslóganes al autor y que elija.
5. **Sin audio por defecto** (LinkedIn y X arrancan mudos). Voz o música sólo si el autor la pide para ese vídeo; con voz, subtítulos (ver `visual-media`, § Audio).
6. **El dominio del vídeo es el del artículo** (regla 3): los mismos nombres que los snippets, y la interfaz maquetada copia los textos y los datos de `example/` (títulos, botones, datos semilla), en inglés como el código.

## Formatos

Los de `visual-media/references/platforms.md`. En la serie:

- **LinkedIn:** `feed` (1080×1350). **X:** `square` (1080×1080), decidido por el autor el 2026-10-06.
- Un artículo suele llevar **dos versiones del mismo guion**, `<slug>-<lang>` en `feed` y `<slug>-<lang>-square`, con el formato como variable y las posiciones por formato en una tabla (el cuadrado lleva titulares, código y zoom menores).
- Versión en inglés cuando exista `en.md`: sólo cambian los textos.

## Entrega

El `.mp4` se queda en `out/` de su proyecto (no se versiona) y `social.md` dice qué vídeo va en cada post y de qué fotograma sale la portada.

## Checklist del vídeo

- [ ] guion aprobado por el autor, con cada dato enlazado a su fila verificada
- [ ] estructura de la serie: resultado → código → comparación → caso difícil → eslogan, con chip de sección
- [ ] el checklist de `visual-media/references/video.md` completo
- [ ] `feed` para LinkedIn y `square` para X
- [ ] versión en inglés cuando exista `en.md`
