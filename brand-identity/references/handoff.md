# Fase 11 · Traspaso y `brand.json`

La marca tiene que llegar **igual** a todas partes: el código del producto, los vídeos, las figuras, Figma. Por eso todo sale de un solo archivo, `brand.json`, mediante scripts, y cada consumidor recibe su formato.

## `brand.json` (esquema)

Rutas relativas a la carpeta de la marca. Los campos opcionales pueden omitirse; el resto es obligatorio para `export-kit.mjs` y `tokens.mjs`.

```jsonc
{
  "name": "Nodra",                       // nombre visible
  "shortName": "Nodra",                  // opcional: bajo el icono (≤ 12 caracteres)
  "slug": "nodra",                       // para nombres de archivo
  "version": "1.0.0",
  "logo": {                              // cada entrada: variante → SVG final en curvas
    "horizontal": "logo/svg/nodra-horizontal.svg",
    "vertical": "logo/svg/nodra-vertical.svg",
    "symbol": "logo/svg/nodra-symbol.svg",
    "wordmark": "logo/svg/nodra-wordmark.svg",
    "horizontal-black": "logo/svg/nodra-horizontal-black.svg",
    "horizontal-white": "logo/svg/nodra-horizontal-white.svg",
    "favicon": "logo/svg/nodra-favicon.svg"            // opcional: versión simplificada ≤ 32 px
  },
  "appIcon": {
    "background": "#1e2bfa",             // color o ruta a un SVG de fondo
    "foreground": "logo/svg/nodra-app-glyph.svg",       // glifo sin fondo
    "monochrome": "logo/svg/nodra-app-glyph-mono.svg",  // opcional: iconos temáticos / tintados
    "scale": 0.6                         // fracción del lado que ocupa el glifo (Android se limita a 66/108)
  },
  "web": { "themeColor": "#1e2bfa", "backgroundColor": "#fdfae7" },   // opcional
  "colors": {
    "palette": [
      { "id": "primary", "name": "Cobalto", "role": "primario", "hex": "#1e2bfa", "scale": true,
        "cmyk": [92, 78, 0, 0], "iccProfile": "PSO Coated v3", "pantone": "2728 C (validar con guía)" }
    ],
    "pairs": [ { "fg": "paper", "bg": "primary", "use": "text" } ],    // use: text | large | ui
    "dark": { "paper": "#121212", "ink": "#fdfae7" }                    // opcional: id → valor en modo oscuro
  },
  "typography": {
    "fontsDir": "assets/fonts",
    "families": [ { "id": "display", "family": "Space Grotesk", "weights": [500, 700],
                    "fallback": ["system-ui", "sans-serif"], "source": "Google Fonts", "license": "OFL-1.1" } ],
    "scale": { "sm": 14, "base": 16, "lg": 20, "xl": 25, "2xl": 31, "3xl": 39 }   // px
  },
  "radii": { "sm": 4, "md": 8, "lg": 16 },                // px
  "spacing": { "1": 4, "2": 8, "3": 12, "4": 16, "6": 24, "8": 32 },
  "motion": { "durations": { "fast": 150, "base": 250, "slow": 400 },
              "easing": { "standard": [0.2, 0, 0, 1], "exit": [0.4, 0, 1, 1] } }
}
```

`palette.mjs check brand.json` valida los pares de contraste; `export-kit.mjs brand.json --pdf` genera `exports/`; `tokens.mjs brand.json` genera `tokens/`.

## Qué se entrega y a quién

| Consumidor | Archivo | Cómo se hace |
| --- | --- | --- |
| Código del producto | `tokens/tokens.css`, `tokens/tailwind.css`, `tokens/tokens.json` (formato DTCG 2025.10) | `tokens.mjs`. Se ofrece copiarlos o enlazarlos en el repo del producto; **no se toca el repo del producto sin preguntar** |
| Agentes de código / interfaz | `DESIGN.md` | Escribirlo con la estructura de `create-design-md` a partir de `brand.json` y el manual (marca, no inventario) |
| Vídeos y figuras | `frame.md` | Desde `templates/frame.md`: tokens exactos en el frontmatter (formato de `hyperframes-creative/references/design-spec.md`) + prosa con los atributos, el uso del logo y los *Do / Don't*. Así `visual-media` encuentra la marca y no repite su entrevista de estilo. Las fuentes ya están en `assets/fonts/` |
| Figma | — | Con `figma-designer`: variables desde `tokens.json`, estilos de texto, componentes del logo |
| Web | `exports/web/` + `head.html` | Copiar al `public/` del sitio (preguntando) |
| Imprenta | `exports/logo/*.pdf`, `applications/*.pdf` | Ver `applications.md` § Impresión |
| Personas | `guidelines/brand-book.pdf` | — |

## Cierre

1. `README.md` al día: qué es cada carpeta, comandos para regenerar, y el **registro de decisiones** con fecha y porqué (fases 1-10).
2. Ofrece, sin hacerlo por defecto:
   - **animación del logo** y/o **vídeo de presentación de la marca** → `visual-media` (que deriva a `hyperframes`);
   - **diagrama de la plataforma de marca** para el equipo → `excalidraw-diagram`;
   - publicar el manual como página compartible.
3. Si la carpeta es un repo nuevo, `git init` y pregunta antes de crear un remoto o hacer push.
