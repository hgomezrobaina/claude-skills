---
name: visual-media
description: Método para crear vídeos, animaciones, figuras y diagramas en cualquier proyecto — decide la herramienta (HyperFrames para todo lo que se mueve, con o sin voz, música o subtítulos; Remotion `<Still>` para figuras y diagramas estáticos; Excalidraw para bocetos rápidos), localiza o crea la carpeta de recursos visuales del proyecto con su marca, pregunta con opciones buscadas en internet qué fuentes, iconos, música, sonidos, imágenes y voces usar, y aplica las reglas de la casa (guion aprobado antes de construir, ninguna cifra tecleada, gancho en los primeros segundos, legible en un móvil, bucle visual con fotogramas, formatos por red). Úsala SIEMPRE, antes de `hyperframes` o `remotion-best-practices`, cuando el usuario pida un vídeo, una demo animada, un clip para LinkedIn/X/la landing, una figura, un diagrama o una ilustración técnica para un artículo, unos docs o un README, o cuando quiera añadir voz, música o subtítulos a un vídeo — aunque no nombre ninguna herramienta.
---

# Visual media

Una pieza visual (un vídeo, una figura) existe para que **una idea se entienda de un vistazo**. Esta skill no enseña HyperFrames ni Remotion — eso lo hacen sus propias skills —: decide qué herramienta toca, dónde vive el trabajo y qué reglas se cumplen siempre, en cualquier proyecto.

## 1. ¿Hay una skill del contexto?

Antes de nada, busca si el contexto ya tiene su adaptación:

- una skill de proyecto (`<repo>/.claude/skills/*/SKILL.md`) sobre vídeos o figuras, como `chaca-videos/.claude/skills/videos/`;
- una skill global que la adapta, como `tech-articles` (`references/video.md` y `references/diagrams.md`).

**La del contexto manda en lo suyo** (su kit, su guion, sus destinos, sus formatos); esta skill pone lo que la otra no dice. Si las dos chocan, avisa al usuario y pregunta: nunca elijas en silencio.

Un proyecto que ya hace sus vídeos en Remotion (como `chaca-videos`) **sigue en Remotion** mientras el usuario no decida portarlo. Retocar un vídeo Remotion existente se hace en Remotion; portarlo a HyperFrames sólo se hace si el usuario lo pide expresamente (ruta `remotion-to-hyperframes` de `hyperframes`).

## 2. Qué herramienta

| Pieza | Herramienta | Referencia |
| --- | --- | --- |
| Cualquier vídeo nuevo: promo, explicación, demo de producto, clip para redes, con o sin voz, música o subtítulos | **HyperFrames** (`hyperframes` → su ruta) | `references/video.md` |
| Voz en off, subtítulos, música, efectos, recursos (iconos, logos, imágenes) de un vídeo | `media-use` + `hyperframes-audio` | `references/video.md` § Audio |
| Figura o diagrama estático para un artículo, unos docs, un README o una landing | **Remotion `<Still>`** con el kit de figuras del contexto | `references/figures.md` |
| Boceto rápido para pensar o discutir, sin pulir | `excalidraw-diagram` | — |
| Figura isométrica interactiva (un mecanismo como objeto físico) | `anatomy` | — |
| Interfaz falsa animada para una web (no un vídeo) | `stageshow` | — |
| Gráfico de datos | `dataviz` para el criterio; se dibuja en la herramienta de la pieza | — |

Si una pieza encaja en dos filas, propón la que mejor cuenta la idea, con su porqué, y pregunta.

## 3. Dónde vive el trabajo: la carpeta de recursos visuales

Cada contexto tiene **una carpeta o un repo dedicado sólo a sus recursos visuales**, con su marca, su kit y sus fuentes. Ejemplos: `chaca-videos/` (vídeos de producto de Chaca), `Projects/tech-articles/videos/` (figuras de los artículos). Ahí van los proyectos HyperFrames y Remotion de ese contexto; el resto del repo no se llena de composiciones.

Lee `references/workspace.md` para **localizarla** y, si no existe, para **crearla en ese momento con la entrevista de estilo** (paleta, tipografías, tono, destinos, idiomas, audio). Nunca inventes una marca: se saca de los tokens del producto o se pregunta.

## 4. Reglas que no se negocian

Valen para vídeos y figuras, en cualquier contexto, salvo que su skill diga otra cosa por escrito.

1. **Guion o plan aprobado antes de construir.** Vídeo: tabla de beats por tiempo (`references/video.md`). Figura: qué enseña, qué se mira y con qué otra se compara (`references/figures.md`). Hasta el visto bueno no se escribe una composición.
2. **Ninguna cifra tecleada.** Cada número en pantalla sale de una fuente con nombre (un benchmark, un dato generado, una afirmación verificada) y el guion dice cuál. Si no hay fuente, el número no entra.
3. **Una idea por beat y por figura.** Lo que no sirve a esa idea, fuera.
4. **El gancho, en los primeros 3-5 s**, y que se entienda sin sonido: en redes el vídeo arranca mudo. Si hay voz, el mensaje sigue en pantalla y hay subtítulos.
5. **Se lee en un móvil.** Titulares grandes, nada pegado a los bordes, el texto dentro de la zona segura del formato (`references/platforms.md`).
6. **El vídeo no promete lo que el producto no hace.** Una espera comprimida se comprime sin falsear el reloj; una interfaz maquetada copia los textos y datos reales.
7. **Bucle visual obligatorio.** Se renderizan fotogramas sueltos, se juntan en una hoja de contacto y **se miran** antes de dar nada por bueno: texto cortado, elementos tapados, saltos entre beats, huecos vacíos, contraste. Se corrige y se repite. Un `check` que pasa no certifica los píxeles.
8. **No se renderiza el final sin el visto bueno** sobre la vista previa.
9. **Lo reutilizable va al kit del contexto**, no a la pieza: el siguiente vídeo o figura lo tendrá.
10. **Bilingüe cuando el contexto lo es:** el texto vive en un archivo de textos por idioma; el dibujo es el mismo.
11. **Ningún recurso se elige en silencio.** Fuentes, iconos, música, sonidos, imágenes, paletas y voces se preguntan en cada proyecto, y en cada pieza que necesite uno no decidido, con 2-4 opciones buscadas en el proyecto, en los catálogos y **en internet**, cada una con su muestra y su licencia (`references/resources.md`).

## Mapa

| Archivo | Cuándo leerlo |
| --- | --- |
| `references/workspace.md` | Siempre al empezar: localizar o crear la carpeta de recursos visuales y su marca |
| `references/video.md` | Cualquier vídeo nuevo (HyperFrames): guion, proyecto, audio, verificación |
| `references/figures.md` | Cualquier figura o diagrama estático (Remotion `<Still>`) |
| `references/resources.md` | Al elegir fuentes, iconos, música, sonidos, imágenes, paletas o voces: en la entrevista de estilo y en cada pieza que pida uno nuevo |
| `references/platforms.md` | Al elegir formato, duración y códec para LinkedIn, X, una landing o un README |
