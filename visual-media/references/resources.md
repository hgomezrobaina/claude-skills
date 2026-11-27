# Recursos: fuentes, iconos, música, sonidos, imágenes, paletas

Ningún recurso se elige en silencio. **En cada proyecto, y en cada pieza que necesite uno que el proyecto todavía no tenga decidido, se pregunta al usuario con opciones**, y las opciones se buscan: en el propio proyecto primero y en internet después.

## Cuándo se pregunta

- **En la entrevista de estilo** (`workspace.md`): fuentes (titulares, prosa, código), paleta, familia de iconos, criterio de audio (mudo, música, voz y qué voz).
- **En cada pieza**, cuando el guion pide algo que la marca no resuelve: una música concreta, un efecto de sonido, un icono que la familia elegida no tiene, una imagen de fondo, una voz para un idioma nuevo, una fuente para un estilo puntual (un vídeo con otra energía).
- **Cuando el usuario pide "algo mejor"** o una opción no convence: se vuelve a buscar, no se repite la misma lista.

Lo ya decidido en el `README.md` o el `frame.md` del contexto no se vuelve a preguntar; se usa.

## Cómo se buscan las opciones

1. **En el proyecto:** tokens y `@font-face` de la web, `assets/`, iconos que ya usa el frontend (p. ej. `lucide-react` en `package.json`), vídeos o figuras anteriores.
2. **En los catálogos de las herramientas:** `npx hyperframes catalog --query …` (bloques y efectos), `media-use resolve --candidates` (música, sonidos, iconos, logos, imágenes, voces), los `frame-presets` y `palettes` de `hyperframes-creative`.
3. **En internet** (`WebSearch`, y el agente `web-fetch` para leer una página): busca opciones actuales y adecuadas al caso, no sólo las que recuerdes. Fuentes de partida, sin cerrarse a ellas:

| Recurso | Dónde buscar |
| --- | --- |
| Fuentes | Google Fonts, Fontshare, la fundición de la fuente del producto; emparejamientos ("pairing") para titulares + prosa + mono |
| Iconos | Lucide, Phosphor, Tabler, Heroicons, Iconoir; los logos de marca, oficiales (`media-use --type logo`), nunca redibujados |
| Música | catálogo de `media-use` (HeyGen), Pixabay Music, YouTube Audio Library, Free Music Archive (filtrando licencia) |
| Efectos de sonido | biblioteca de `media-use`, Pixabay, Freesound (CC0/CC-BY), Zapsplat |
| Imágenes y texturas | `media-use --type image`, Unsplash, Pexels |
| Paletas | los tokens del producto; si no hay, Radix Colors, Tailwind, Coolors, comprobando contraste |
| Voces (TTS) | `media-use --type voice`; muestras de 2-3 voces por idioma |

4. **Licencia antes que gusto:** de cada opción, di la licencia y si permite uso comercial y en redes sin atribución (o qué atribución pide). Una opción sin licencia clara no se propone.

## Cómo se presentan

- **2-4 opciones**, cada una con: qué es, por qué encaja con este caso (tono, legibilidad en un móvil, idioma, peso), licencia, enlace a la fuente, y una **muestra**: una línea del titular real con esa fuente, el icono en el tamaño del vídeo, 10 s del corte de música, la voz leyendo la primera frase del guion. Si se puede, una hoja de contacto con las opciones lado a lado.
- Una recomendada, marcada como tal y con su porqué.
- Se espera la respuesta. Lo que dependa de ella no avanza.

## Después de elegir

- **Se descarga y se fija en local**: fuentes en `<media>/assets/fonts/` (o donde diga el contexto), música, sonidos e imágenes en el proyecto (`media-use` lo registra en su ledger). Nada se carga desde una URL externa en el render.
- **Se anota la decisión** con fecha, licencia y origen: lo que es de marca, en `frame.md` y `README.md` (y en el `theme.ts` de figuras si es una fuente o un color); lo que es de una pieza, en su `BRIEF.md` (`## Assets`) o la bitácora del contexto.
- Si el contexto tiene atribuciones obligatorias, van en un `CREDITS.md` del proyecto y donde la licencia pida (el pie del vídeo, el post).
