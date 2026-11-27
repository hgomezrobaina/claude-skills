# Difusión — <título corto>

- **Artículo (es):** <url>
- **Artículo (en):** <url o pendiente>
- **Repo:** <url>

> **Aviso:** <lo que falta comprobar antes de que el enlace circule>

## Vídeo

| Post | Composición | Archivo | Portada |
| --- | --- | --- | --- |
| LinkedIn | `<slug>-<lang>` (feed 4:5) | `publish/videos/out/<slug>-<lang>.mp4` | fotograma NNN |
| X | `<slug>-<lang>-square` (1:1) | `publish/videos/out/<slug>-<lang>-square.mp4` | fotograma NNN |

Regenerar: `cd publish/videos && npx remotion render <id> out/<id>.mp4`.

---

## Los posts

Cada post es un archivo de texto plano en `posts/`, sin Markdown: se abre, se selecciona todo (Ctrl+A) y se pega tal cual. Los saltos de línea se conservan.

| Red | Archivo | Vídeo | Medida |
| --- | --- | --- | --- |
| LinkedIn (<lang>) | [`posts/linkedin-<lang>.txt`](posts/linkedin-<lang>.txt) | `<slug>-<lang>` | <palabras, líneas> |
| X (<lang>) | [`posts/x-<lang>.txt`](posts/x-<lang>.txt) | `<slug>-<lang>-square` | <n>/280 caracteres ponderados |

Forma de `posts/linkedin-<lang>.txt`: gancho en dos líneas de ≤ 50 caracteres, cuerpo PAS o BAB con una línea en blanco entre cada línea (≤ 20 líneas con texto), `Artículo: <url>`, `Repo: <url>` y 3-5 hashtags.

Forma de `posts/x-<lang>.txt`: el gancho en dos líneas, una línea en blanco, una frase de qué resuelve el artículo y la URL. ≤ 280 caracteres ponderados.

---

## Notas

- **Comprobación:** `python3 ~/.claude/skills/tech-articles/scripts/social_check.py publish/<slug>/posts/*.txt` → <resultado>
- **Ganchos descartados**, por si el elegido no rinde: <…>
