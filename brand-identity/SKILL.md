---
name: brand-identity
description: Crear la identidad de marca completa de una app, producto o empresa como lo haría un diseñador de marca senior — descubrimiento con el usuario, investigación en internet del sector y de la competencia (sitios, colores, fuentes, logos, posicionamiento), plataforma estratégica (propósito, atributos, arquetipo, voz, nombre y búsqueda de marcas registradas), rutas creativas, logo en SVG con correcciones ópticas y hoja de pruebas, paleta accesible (OKLCH, WCAG/APCA, daltonismo, CMYK/Pantone), tipografía con licencia, sistema visual, iconos de app iOS/Android, favicons, PWA, redes, papelería e impresión, manual de marca en HTML/PDF y tokens para el código y los vídeos. Presenta siempre varias opciones de cada cosa (logos, colores, fuentes) y pregunta todo lo que no esté claro. Úsala SIEMPRE que el usuario quiera crear, rediseñar, ampliar o revisar una marca, un logo, un isotipo, una paleta de marca, una tipografía de marca, un manual o guía de marca (brand book), un icono de app o un naming — aunque no diga "marca".
---

# Identidad de marca

Una marca no es un logo: es **una estrategia hecha sistema**. El logo, el color, la tipografía y la voz son la expresión visible de una posición en el mercado, y cada decisión se defiende con esa posición, no con el gusto. Esta skill trabaja como un estudio de branding: primero entiende el negocio, después investiga el terreno y solo entonces dibuja, y en cada paso deja al usuario decidir entre opciones bien argumentadas.

Instalación de los scripts (una sola vez por máquina): `cd ~/.claude/skills/brand-identity/scripts && npm install`.

## Reglas que no se negocian

1. **Estrategia antes que píxeles.** No se dibuja ni un boceto hasta tener aprobados el brief (§ fase 1), la investigación (fase 2) y la plataforma (fase 3). Si el usuario pide "solo un logo rápido", se le explica el porqué y se hace la versión corta de esas fases, pero no se saltan.
2. **Se investiga en internet, siempre.** Sector, público, competidores (5-8 reales, con su web analizada), convenciones y clichés de la categoría, y las normas vigentes de cada plataforma (tamaños de iconos, redes). Nada de memoria cuando la fuente puede haber cambiado. Cada dato lleva su enlace en `research/sources.md`.
3. **Se pregunta todo lo que no esté claro.** Nunca se inventa un dato del negocio (público, precio, competidores, valores, ambición, mercados). Antes de preguntar, se busca: el repo, la web o la app del usuario, sus redes. Lo que se encuentra se muestra para confirmar; lo que no, se pregunta con `AskUserQuestion`, con opciones concretas y una recomendada. Las dudas se agrupan, máximo 4 por tanda, para no interrogar de a una.
4. **Varias opciones de todo.** Cada decisión se presenta con **2-4 opciones reales y distintas entre sí** (no variaciones de lo mismo), cada una con: qué es, por qué encaja con los atributos de marca, una **muestra visual** renderizada y su licencia o riesgo. Una va marcada como recomendada, con su porqué. Mínimos: 3 rutas creativas, 3+ símbolos por ronda de logo, 3-4 paletas, 3 combinaciones tipográficas, 2-3 familias de iconos, 5+ taglines si hay tagline. El usuario puede mezclar ("el símbolo de B con el color de A") y eso es válido.
5. **Aprobación por fase.** Nada que dependa de una decisión avanza sin ella. Cada decisión aprobada se anota **con fecha** en el `README.md` de la carpeta de la marca: es el registro de por qué la marca es como es.
6. **Ver antes de mostrar.** Todo lo visual se renderiza a PNG y **se mira** (con `Read`) antes de enseñarlo: texto cortado, desequilibrio óptico, contraste, algo que se lea mal en pequeño. Todo símbolo pasa por `proof.mjs` antes de presentarse. Si algo se ve mal, se corrige primero.
7. **Original y en regla.** Nada que imite a una marca existente, ni siquiera "inspirado en". Del nombre y del logo elegido se hace una búsqueda de marcas registradas en las bases oficiales (`references/strategy.md` § Búsqueda de marcas), aclarando que **no es asesoría legal**. Fuentes, iconos e imágenes solo con licencia verificada que permita uso comercial.
8. **Vector, exacto y con una única fuente de verdad.** El logo final es SVG con el texto convertido a curvas (`outline-text.mjs`). Los valores (hex, familias, pesos) se copian tal cual, nunca redondeados. `brand.json` es la fuente de verdad; tokens, kit y manual salen de él con scripts.
9. **Accesible por defecto.** Texto con contraste WCAG AA (4.5:1, o 3:1 en texto grande e interfaz), con APCA como segunda opinión; la paleta se comprueba con simulación de daltonismo y ningún significado depende solo del color.
10. **Se defiende con estrategia.** Cada opción se justifica con los atributos y el posicionamiento aprobados ("transmite *cercana* porque…"), nunca con "queda bonito" o "es tendencia".

## Antes de empezar: alcance y carpeta

1. **Alcance.** Pregunta qué se quiere (si no está claro): *marca completa* (todas las fases), *rediseño* de una marca existente (se suma una auditoría de la marca actual: qué capital visual conservar), *extender* una marca que ya existe (nuevas piezas que respeten su sistema) o *solo logo y básicos* (fases 1-3 en versión corta, luego 5-7 y un kit mínimo).
2. **Carpeta de la marca.** Busca una existente (`brand/`, `branding/`, `<nombre>-brand/`, un `brand.json`). Si no hay, propón dónde crearla (dentro del repo del producto o como carpeta o repo hermano, explicando por qué) y créala con `templates/README.md`. Si el proyecto ya tiene una carpeta de recursos visuales de `visual-media` (con `frame.md`), la marca vive **en esa misma carpeta**, para que vídeos y figuras la usen sin duplicar nada.

```
<marca>/
├── README.md              # qué es, decisiones con fecha, comandos
├── brief.md               # fase 1
├── research/              # fase 2: competitors.md, sources.md, positioning-map.excalidraw, <dominio>/ (capturas, dna.json)
├── strategy.md            # fase 3: plataforma, voz, nombre, búsqueda de marcas
├── concepts/              # fase 4: ruta-a/, ruta-b/, ruta-c/ (moodboard, bocetos, hojas)
├── logo/                  # fase 5: rondas/ (exploración), svg/ (finales), proof/
├── brand.json             # FUENTE DE VERDAD: logos, colores, tipografía, radios, movimiento
├── assets/fonts/          # fuentes elegidas, en local, con su licencia (CREDITS.md)
├── tokens/                # generado: tokens.json (DTCG), tokens.css, tailwind.css
├── exports/               # generado: logos PNG/PDF, iconos de app, web, redes
├── applications/          # fase 9: mockups (HTML + PNG), papelería para imprenta
├── guidelines/            # fase 10: brand-book.html + brand-book.pdf
├── frame.md               # marca para vídeo (visual-media / hyperframes)
└── DESIGN.md              # marca para la interfaz del producto (agentes de código)
```

## Fases

| # | Fase | Leer | Entregable | Puerta |
| --- | --- | --- | --- | --- |
| 1 | Descubrimiento | `references/discovery.md` | `brief.md` | El usuario aprueba el brief |
| 2 | Investigación y competencia | `references/research.md` | `research/` (auditoría, mapa de posicionamiento, espacios libres, clichés, fuentes) | Aprueba las conclusiones y el territorio a ocupar |
| 3 | Estrategia | `references/strategy.md` | `strategy.md` (propósito, promesa, posicionamiento, 3-5 atributos, arquetipo, voz; nombre y búsqueda de marcas si aplica) | Elige entre las opciones de cada pieza |
| 4 | Rutas creativas | `references/concepts.md` | 3 rutas con idea, moodboard, dirección de símbolo, color y tipografía | Elige una ruta (o una mezcla) |
| 5 | Logo | `references/logo.md` | Rondas de símbolos/wordmarks → refinado → variantes + construcción + hojas de prueba | Aprueba el logo final |
| 6 | Color | `references/color.md` | 3-4 paletas → paleta con escalas, pares de contraste, modo oscuro, CMYK/Pantone | Elige y aprueba |
| 7 | Tipografía | `references/typography.md` | 3 combinaciones con muestra real → escala tipográfica, licencias, fuentes locales | Elige y aprueba |
| 8 | Sistema visual y movimiento | `references/visual-system.md` | Iconografía, elementos gráficos, ilustración/fotografía, retícula, principios de movimiento | Aprueba |
| 9 | Aplicaciones | `references/applications.md` | Mockups en contexto real (app, web, redes, papelería) | Aprueba; lo que falla aquí vuelve a su fase |
| 10 | Kit y manual | `references/guidelines.md` | `exports/` completo + `guidelines/brand-book.html` y `.pdf` | Aprueba |
| 11 | Traspaso | `references/handoff.md` | `tokens/`, `frame.md`, `DESIGN.md`, `README.md` al día; ofrecer animación del logo y vídeo de marca | — |

Las fases 5, 6 y 7 se influyen entre sí: está bien volver a una anterior cuando una posterior lo pide (el color elegido cambia cómo se lee el símbolo). Lo que no está bien es saltarse una puerta.

## Cómo se presenta una decisión

Siempre igual, para que el usuario compare rápido:

1. **Una hoja visual** que muestre todas las opciones lado a lado (`contact-sheet.mjs`, `palette.mjs sheet`, una muestra tipográfica renderizada), mirada antes de enseñarla.
2. **Una ficha por opción:** nombre corto, la idea en una frase, por qué encaja (atributos y posicionamiento), riesgo o contra, licencia si aplica.
3. **La recomendación**, con su porqué.
4. **La pregunta** con `AskUserQuestion` (opciones = las de la hoja, más "mezclar" u "otra ronda" si tiene sentido). Para comparar algo textual corto (taglines, nombres) se puede usar `preview` en las opciones.

Si ninguna convence: pregunta **qué** falla (más serio, menos frío, otra forma, otro color…) y genera opciones nuevas, no reciclar las anteriores.

## Scripts (`scripts/`)

| Script | Para qué |
| --- | --- |
| `site-dna.mjs <url> --out research/` | Captura y ADN visual de un competidor: colores dominantes, fuentes reales, logo, favicon, og:image, H1 |
| `outline-text.mjs --font f.ttf --text "marca"` | Wordmark en curvas, con tracking y kerning por par; devuelve métricas para la retícula |
| `render-svg.mjs` | SVG → PNG a cualquier tamaño |
| `proof.mjs --logo s.svg [--lockup l.svg]` | Hoja de prueba: tamaños 16-128, fondos, recortes iOS/Android/avatar, silueta, desenfoque, lockup pequeño |
| `contact-sheet.mjs --images … --labels …` | Hoja comparativa de opciones |
| `palette.mjs scale/contrast/cvd/sheet/check` | Escalas OKLCH, contraste WCAG + APCA, daltonismo, hoja de paleta, validación de `brand.json` |
| `cmyk.py --icc perfil.icc "#hex"` | CMYK real con perfil ICC (imprenta); correr con `python3 -I` |
| `font-check.mjs f.ttf` | Cobertura de español y otros idiomas, rasgos OpenType, variable, licencia declarada |
| `screenshot.mjs in.html out.png/pdf` | Mockups, moodboards, muestras tipográficas, manual en PDF, logos en PDF vectorial |
| `export-kit.mjs brand.json [--pdf]` | Kit completo: logos, iconos iOS/Android, favicon, PWA, avatar |
| `tokens.mjs brand.json` | Tokens DTCG, CSS y Tailwind v4 |

## Con otras skills

| Necesidad | Skill | Cómo |
| --- | --- | --- |
| Animación del logo, vídeo de lanzamiento o presentación de marca | `visual-media` → `hyperframes` | Al cerrar, `frame.md` ya existe: `visual-media` encuentra la marca y no repite la entrevista de estilo |
| Mapa de posicionamiento, arquitectura de marca, diagrama de la plataforma | `excalidraw-diagram` | Bocetos de trabajo con su paleta neutra (no se cambia su `color-palette.md`) |
| Figuras o diagramas públicos con la marca | `visual-media` (Remotion `<Still>`) | Su `theme.ts` copia los tokens de `frame.md` |
| Pasar la marca a la interfaz del producto | `create-design-md`, `plan-ui-design` | `DESIGN.md` + `tokens/` |
| Llevar el sistema a Figma | `figma-designer` | Variables y estilos desde `tokens/tokens.json` |
| Landing con la marca | `landing-page-design`, `frontend-design` | Leen `DESIGN.md` y `tokens/` |
| Fotografía o ilustración generada con IA | `seo-image-gen`, `gemini-*` | Solo para moodboards o imágenes de apoyo, **nunca para el logo** (no es vectorial, no es exacto y su originalidad no es verificable) |
| Página compartible con las opciones o el manual | Artifact (`artifact-design`) | Opcional; el manual vive en `guidelines/` igualmente |

## Mapa de referencias

| Archivo | Cuándo |
| --- | --- |
| `references/discovery.md` | Fase 1: entrevista, qué buscar antes de preguntar, brief |
| `references/research.md` | Fase 2: investigación en línea, auditoría de competencia, mapa, espacios libres |
| `references/strategy.md` | Fase 3: plataforma, arquetipos, voz, naming, búsqueda de marcas |
| `references/concepts.md` | Fase 4: rutas creativas y moodboards |
| `references/logo.md` | Fase 5: tipos de logo, construcción, correcciones ópticas, variantes, SVG |
| `references/color.md` | Fase 6 |
| `references/typography.md` | Fase 7 |
| `references/visual-system.md` | Fase 8: iconos, gráficos, imagen, retícula, movimiento |
| `references/applications.md` | Fase 9: mockups, tamaños vigentes, impresión |
| `references/guidelines.md` | Fase 10: estructura del manual |
| `references/handoff.md` | Fase 11 y `brand.json` (esquema) |
| `references/anti-patterns.md` | Siempre antes de presentar algo: errores de IA genérica y de oficio |
| `references/sources.md` | Fuentes en las que se basa este método |
