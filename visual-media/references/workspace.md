# La carpeta de recursos visuales

## Localizarla

En el proyecto (o el workspace) en el que se trabaja, busca en este orden y quédate con la primera que exista:

1. Lo que diga la skill del contexto (§ 1 de `SKILL.md`): `tech-articles` → `Projects/tech-articles/videos/` (figuras) y su proyecto HyperFrames; `chaca-videos` → el propio repo.
2. Una carpeta de marca creada con `brand-identity` (tiene `brand.json` y `frame.md`; suele ser `brand/` o `<nombre>-brand/`): esa **es** la carpeta de recursos visuales. Su `frame.md`, sus fuentes en `assets/fonts/` y sus logos en `exports/logo/` ya están decididos: la entrevista de estilo solo pregunta lo que la marca no cubre (audio, destinos, idiomas). Los vídeos y las figuras van en sus subcarpetas `videos/` y `figures/`.
3. Un repo o carpeta hermana dedicada: `<nombre>-videos/`, `<nombre>-media/`, `media/`, `videos/`, `visuals/`.
4. Señales en el árbol: `hyperframes.json`, `frame.md`, `remotion.config.ts`, un `src/Root.tsx` con `<Composition>`/`<Still>`.

```bash
find . -maxdepth 3 \( -name hyperframes.json -o -name frame.md -o -name 'remotion.config.*' \) -not -path '*/node_modules/*'
```

Si aparece más de una candidata o no está claro de qué contexto es, pregunta.

## Lo que contiene

```
<media>/
├── README.md            # qué hay, para qué destino, comandos, marca
├── frame.md             # la marca para vídeo (tokens en el frontmatter) — fuente de verdad visual
├── assets/              # fuentes, iconos, audio e imágenes elegidos, en local, con su licencia (CREDITS.md)
├── videos/              # proyectos HyperFrames, uno por vídeo o serie (cada uno con su hyperframes.json)
│   └── blocks/          # bloques propios reutilizables del contexto (sub-composiciones)
└── figures/             # proyecto Remotion de figuras (<Still>) con su kit (src/kit/figure/)
```

La estructura se adapta a lo que el contexto ya tenga: si ya existe un proyecto Remotion de figuras, se reutiliza; no se duplica.

`frame.md` (formato en `hyperframes-creative` → `references/design-spec.md`) es la marca de los vídeos. El kit de figuras de Remotion lee **los mismos valores** (un `theme.ts` que copia los tokens de `frame.md`), para que vídeos y figuras se vean iguales. Si cambia uno, cambia el otro.

## Crearla cuando no existe

No se crea en silencio. Explica que el proyecto no tiene carpeta de recursos visuales, propón dónde ponerla (carpeta dentro del repo o repo hermano, con su porqué) y haz la **entrevista de estilo**. Antes de preguntar, **busca la respuesta en el proyecto**; lo que encuentres se enseña para confirmar, y lo que no, se pregunta con 2-4 opciones buscadas en catálogos e internet, con muestra y licencia (`resources.md`). Aunque el proyecto ya use una fuente o unos iconos, pregunta si el vídeo debe usar los mismos u otros:

| Pregunta | Dónde buscar antes |
| --- | --- |
| Paleta: fondo, superficies, texto, acento, color de "problema", color de "dato" | tokens del frontend (`index.css` con `@theme`, `tailwind.config`, variables CSS), `DESIGN.md` |
| Tipografías: titulares, prosa, código | `@font-face`, `fonts/`, el `<head>` de la web |
| Iconos: familia y estilo (trazo, relleno) | dependencias del frontend (`lucide-react`, `@phosphor-icons/…`), `assets/icons/` |
| Tema: claro u oscuro | la web del producto |
| Tono y energía (sobrio, técnico, juguetón…) y referencias que le gusten | — (preguntar; ofrecer 2-3 presets de `hyperframes-creative/frame-presets/` como punto de partida) |
| Destinos habituales (LinkedIn, X, landing, README, docs) | posts o vídeos existentes |
| Idiomas | i18n de la web, README |
| Audio por defecto: mudo, música de fondo, voz en off; si hay, qué estilo de música y qué voz por idioma | — (preguntar con muestras; recordar que las redes arrancan mudas) |
| Qué se puede enseñar: datos reales del producto, capturas, logos | — (preguntar) |

Con las respuestas:

1. Crea la carpeta y su `README.md` (qué es, comandos, marca, reglas propias).
2. Escribe `frame.md` con los tokens exactos (hex, familias, pesos tal cual: nunca redondeados). Descarga las fuentes elegidas a `<media>/assets/fonts/` y anota su licencia.
3. El proyecto HyperFrames se crea con `npx hyperframes init` **cuando llega el primer vídeo** (necesita un directorio vacío y su `BRIEF.md`); el de figuras, con el primer `<Still>` (`references/figures.md`).
4. Si la carpeta es un repo nuevo, `git init` y pregunta antes de crear un remoto o hacer push.
5. Anota en el `README.md` las decisiones de la entrevista, con fecha: son las reglas del contexto.
