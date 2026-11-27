# Traducción, publicación y difusión (fase 4)

Nada se publica en nombre del autor sin que lo pida explícitamente (regla 13). La skill prepara los archivos y los checklists; publicar es del autor.

## `en.md` — la traducción

- Se traduce **lo que quedó**, no lo que hubo: nada de `recortes.md` vuelve.
- Escrito ya con un párrafo por línea (regla 9).
- Título con la misma fórmula y la keyword en inglés (*The Criteria pattern in NestJS: what a client may ask for is a file, not a signature*).
- Los enlaces a otros artículos de la serie apuntan a su versión en inglés (comprueba `SERIES.md`).
- Las figuras con texto en español necesitan su export `-en` (ver `diagrams.md`).
- Comprobar paridad estructural:

```bash
python3 ~/.claude/skills/tech-articles/scripts/measure.py publish/<slug>/es.md --parity publish/<slug>/en.md
```

Debe coincidir: H2, H3, bloques de código, filas de tabla, notas, figuras. Apunta el resultado en *Estado*.

## Checklist antes de publicar

En `TODO.md` → *Estado*:

- [ ] `measure.py --lint` limpio o con avisos aceptados
- [ ] figuras generadas, sin comentarios `FIGURA` pendientes ni `PENDIENTE` en el texto
- [ ] cada figura de `es.md` y `en.md` apunta a `raw.githubusercontent.com/…/docs/diagrams/` (ninguna ruta local) y responde `200 image/png`
- [ ] el repo de `example/` es público, el README dice cómo ejecutarlo y la métrica citada se ha vuelto a medir
- [ ] todos los enlaces abren
- [ ] verificaciones pendientes cerradas o la frase reformulada

## Por plataforma

### dev.to (por defecto, publicación principal)

Se publica **desde la skill** con `scripts/devto.py`, que llama a la API v1 de Forem (sin MCP: la API es oficial y la clave no pasa por terceros). Verificado contra developers.forem.com/api/v1 el 2026-11-06.

**Una vez por autor:** la clave se genera en dev.to → *Settings → Extensions → DEV Community API Keys* y se exporta como `DEVTO_API_KEY` (en `~/.zshrc` o similar). **Nunca se pide ni se pega en el chat**, y el script no la imprime ni la guarda.

**Por artículo:** `publish/<slug>/devto.json` desde `assets/devto.json`, una entrada por idioma con `description` (≤ 160 caracteres, con la keyword), `tags` (máx. 4, minúsculas y números, sin guiones), y opcionales `series`, `canonical_url` y `main_image`. La descripción y los tags se proponen al autor y él los aprueba. El script escribe ahí `id` y `url` tras crear el artículo, para que las siguientes ejecuciones actualicen el mismo y no dupliquen.

```bash
S=~/.claude/skills/tech-articles/scripts/devto.py
python3 $S publish/<slug>/es.md --dry-run     # valida y enseña lo que se enviaría; no llama a la API
python3 $S publish/<slug>/es.md               # crea o actualiza el BORRADOR en dev.to
python3 $S publish/<slug>/es.md --status      # borrador o publicado, con su URL
python3 $S publish/<slug>/es.md --publish     # publica
```

Reglas:

- **El borrador primero, siempre.** Se crea como borrador, el autor lo revisa en el editor de dev.to (vista previa, imágenes, tablas, resaltado) y **sólo con su «publica» explícito** se lanza `--publish` (regla 13). Crear el borrador también es enviar contenido a un servicio externo: se pide permiso antes de la primera llamada.
- **El título sale del H1** del `.md` y se quita del cuerpo; nada de front matter dentro del Markdown (la API no documenta qué gana si choca con los campos JSON).
- **Validación previa** (`--dry-run` y antes de cada envío): descripción y tags válidos, ninguna imagen con ruta local, ninguna marca `FIGURA`/`PENDIENTE`/`PENDING`. Si falla, no se envía nada.
- **Los tags se envían como lista**, aunque la documentación de Forem diga cadena separada por comas: con la cadena, dev.to los ignora y pone tags automáticos (pasó el 2026-11-06). Tras publicar, `--status` y la API pública confirman los tags guardados.
- **Actualizar no despublica:** al actualizar sólo se envía `published` con `--publish`, porque un `published: false` sobre un artículo publicado lo devuelve a borrador.
- **Tras publicar:** la URL de `devto.json` sustituye `PENDIENTE`/`PENDING` en `posts/*.txt` y `social.md`, y va a `SERIES.md` y a *Estado* en `TODO.md`. Vuelve a pasar `social_check.py`.
- Los saltos de línea simples se respetan: por eso la regla 9. Las figuras ya apuntan a `raw.githubusercontent.com` (ver `diagrams.md`). Las tablas y el resaltado de código funcionan.

### Medium

- No renderiza tablas Markdown: convertir cada tabla en imagen (captura limpia) o en lista, y anótalo como decisión.
- Lo más fiable es **importar desde la URL de dev.to** (*Import a story*): conserva el formato básico y añade el enlace canónico solo. Revisa después bloques de código e imágenes.
- Máximo 5 *topics*. El subtítulo es la descripción.

### Hashnode

- Admite Markdown completo con tablas. Fija la URL canónica en *Article settings* si ya salió en otro sitio.

### Blog propio

- Si existe el blog del autor (p. ej. un módulo `blog` en su web), pregunta si se publica allí primero y las demás plataformas apuntan con `canonical_url`.

## `social.md` — los posts de X y LinkedIn

Plantilla en `assets/social.md`. **Cada post es un archivo de texto plano** en `publish/<slug>/posts/` (`linkedin-<lang>.txt`, `x-<lang>.txt`), sin Markdown ni bloques de código: el autor lo abre, selecciona todo y lo pega tal cual (decidido el 2026-10-13: copiar desde un bloque de código dentro de `social.md` pegaba el texto sin saltos de línea). `social.md` queda para el contexto: enlaces, avisos, vídeos, la tabla de posts y las notas. Cada post lleva su vídeo (`references/video.md`) y su texto **complementa** el vídeo, no lo repite: el vídeo enseña, el texto da contexto y lleva al enlace. Nada se publica en nombre del autor (regla 13): la skill deja los textos listos para pegar.

### Skills globales que se usan

Las skills `hook-generator`, `post-formatter` y `post-writer` (en `~/.agents/skills/`) están pensadas para LinkedIn en inglés y exigen un `about-me.md` y un `voice.md`. **No se invocan tal cual**: se aplican sus reglas, adaptadas al español y a esta serie, en los pasos de abajo.

- **Voz:** si existen `publish/voice.md` y `publish/about-me.md`, mandan. Si no, la voz sale de los `social.md` ya publicados de la serie (léelos antes de escribir) y se ofrece al autor crearlos con `voice-builder` una vez, para todos los artículos. No se inventa experiencia en primera persona: «me pasó», «en mi equipo» sólo si el autor lo ha contado (en el artículo, la bitácora o el chat).
- **`post-scorer`** (puntúa contra el historial de posts del autor) necesita Apify; se ofrece, no se da por hecho.

### Paso 1 — ganchos (método de `hook-generator`)

Seis ganchos de **dos líneas de ≤ 40 caracteres cada una** (cuéntalos): la primera afirma algo concreto e inesperado (sin pregunta), la segunda lo contradice o lo reencuadra. Un ángulo distinto cada uno:

1. **Número**: una cifra del artículo con su fila en *Afirmaciones verificadas*.
2. **Contrario**: la creencia del argumento atacado, y su vuelta.
3. **Antes / después**: lo de siempre frente a la solución (suele coincidir con el vídeo).
4. **Referencia**: una doc, librería o autor citados en el artículo.
5. **Admisión**: un error que el autor haya contado él mismo (si no lo hay, se dice y se sustituye).
6. **Consecuencia**: lo que pasa cuando el problema crece.

Se presentan al autor y **él elige** uno para LinkedIn y uno para X (pueden ser el mismo). Dígitos mejor que números escritos; nada de certezas que el artículo no tenga.

### Paso 2 — LinkedIn (reglas de `post-formatter`, adaptadas)

- **Gancho:** sus dos primeras líneas, cada una ≤ 50 caracteres: es lo único visible antes del «ver más» y tiene que funcionar solo.
- **Marco:** PAS (problema, agitación, solución) o BAB (antes, después, puente); el que mejor encaje con el vídeo. El problema en términos que se entienden sin contexto; **sin identificadores de código** (el código está en el vídeo y en el artículo).
- **Formato para móvil:** ≤ 20 líneas con texto, **una línea en blanco entre cada una**, la mayoría de una frase y ≤ 55 caracteres; como mucho 4 minipárrafos de ≤ 110. Objetivo 150-250 palabras.
- **Sin rayas (—)**, sin emojis salvo flechas o checks en listas, sin preguntas salvo que el gancho lo sea.
- **Cierre:** qué se lleva el lector al leer el artículo (el coste dicho, el repo que funciona) y los enlaces: artículo y repo. 3-5 hashtags al final como mucho.

### Paso 3 — X (cuenta sin Premium)

- **Un solo post, sin hilo**, de **≤ 280 caracteres ponderados**: cada URL cuenta 23; los emojis y las flechas como `→` cuentan 2. El autor no tiene X Premium (decidido el 2026-10-13), así que el límite es duro.
- Estructura: el gancho elegido (las dos líneas), una frase de qué resuelve el artículo, y el enlace. El vídeo cuadrado va adjunto.
- Sin hashtags salvo que sobre margen (uno, como mucho).

### Paso 4 — comprobar

```bash
python3 ~/.claude/skills/tech-articles/scripts/social_check.py publish/<slug>/posts/*.txt
```

Mide cada `x-*.txt` (caracteres ponderados) y cada `linkedin-*.txt` (líneas, longitudes, rayas, palabras). Lo que no pase se corrige o se anota como decisión del autor.

### Además

- Un archivo por red e idioma; cada uno enlaza al artículo de **su** idioma. Texto plano UTF-8 con saltos LF, sin nada que no se vaya a pegar (ni títulos, ni notas, ni comillas de código).
- Avisos arriba del archivo: lo que falta comprobar antes de que el enlace circule (p. ej. la URL del artículo, que no existe hasta publicarlo).
- Ganchos descartados, en *Notas* al final de `social.md`, por si el primero no rinde.

## `SERIES.md`

Al publicar, añade o actualiza la fila del artículo:

| Artículo | Slug | Tesis (una línea) | Dominio de ejemplo | Marco del gancho | es | en | Repo |
| --- | --- | --- | --- | --- | --- | --- | --- |

Y mueve a *Ideas* los candidatos de artículo que hayan salido en `fuentes.md`. Sirve para no repetir dominio ni marco de gancho en el siguiente, y para enlazar la serie.
