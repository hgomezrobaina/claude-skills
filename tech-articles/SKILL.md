---
name: tech-articles
description: Planificar, investigar y redactar artículos técnicos (sobre todo de programación y arquitectura de software) para publicar en dev.to, Medium, Hashnode o un blog propio, con un método por fases que termina en un borrador que el autor edita. Úsala SIEMPRE que el usuario quiera escribir, planificar, retomar, revisar, traducir o difundir un artículo, post técnico, entrada de blog o tutorial; cuando diga "quiero escribir sobre X", "armar el artículo", "el borrador", "la bitácora", "es.md/en.md", "el hilo de X/LinkedIn del artículo", "el vídeo del artículo/post", "una demo animada para redes"; o cuando trabaje dentro de una carpeta `publish/<slug>/` — aunque no diga "artículo".
---

# tech-articles

Un artículo técnico con este método no es un tutorial ni una taxonomía: es **una tesis discutible**, defendida con código que compila, afirmaciones verificadas y el coste dicho de frente. El resultado de la skill es un **borrador** (`es.md`) que el autor edita a mano hasta su versión final; la skill planifica, investiga, redacta, mide y revisa, y deja escrito en una bitácora todo lo decidido para que nada se re-litigue.

El autor es el editor. La skill propone, el autor decide.

## No asumir: preguntar

**Nada se supone.** Ante cualquier duda, se pregunta al autor antes de seguir, en cualquier fase. En concreto, se para y se pregunta cuando:

- **algo no se entiende**: del encargo, del código de referencia, de una decisión anterior de la bitácora o de una edición del autor;
- **se ve una mejora posible**: otro enfoque, una tesis más fuerte, un ejemplo mejor, un recorte, una sección que sobra o que falta;
- **se encuentra un error de contenido**: una afirmación falsa o sin verificar, un snippet que no compila, una cifra que no cuadra, una cita mal atribuida;
- **se encuentra un error en la idea**: la tesis no se sostiene, el argumento atacado es un hombre de paja, el hueco no existe, la investigación contradice el plan, o el código del autor tiene un fallo que el artículo heredaría.

Cómo se pregunta: se explica lo encontrado con su evidencia (archivo, línea, fuente), se proponen 2-3 salidas con su coste y una recomendación, y **se espera la respuesta**. Lo que dependa de esa respuesta no avanza; lo que no dependa, sí. Nunca se resuelve en silencio ni se "arregla" sin consultarlo, aunque el arreglo parezca obvio. Una propuesta propia (un dominio, un título, un dueño del argumento) se presenta como propuesta pendiente de visto bueno, nunca como decisión tomada. La respuesta del autor se anota en `TODO.md` como decisión.

## Mapa de la skill

| Archivo | Cuándo leerlo |
| --- | --- |
| `references/structure.md` | Fase 1: título, tesis, esqueleto de secciones y presupuesto de palabras |
| `references/research.md` | Fase 2: cómo investigar, qué cuenta como verificado, criterio de cierre |
| `references/style.md` | Fase 3: voz, tono, snippets, notas, lo que no se escribe nunca |
| `references/diagrams.md` | Fase 1 (plan de figuras) y fase 3 (generarlas con Remotion; método general en `visual-media`) |
| `references/review.md` | Al cerrar el borrador y cada vez que el autor devuelve una edición |
| `references/publishing.md` | Fase 4: traducción, plataformas, difusión |
| `references/video.md` | Fase 4: el vídeo de los posts de LinkedIn y X (HyperFrames, proyecto `hyperframes/`; método general en la skill `visual-media`) |
| `assets/` | Plantillas: `TODO.md`, `fuentes.md`, `recortes.md`, `social.md`, `contacto.md`, `devto.json` |
| `scripts/measure.py` | Medir presupuesto, lint de estilo y paridad `es.md`/`en.md` |
| `scripts/social_check.py` | Comprobar los posts de `posts/*.txt`: 280 caracteres ponderados en X, formato para móvil en LinkedIn |
| `scripts/devto.py` | Crear o actualizar el artículo en dev.to por su API (borrador por defecto; `--publish` sólo con el visto bueno del autor) |

Lee cada referencia al entrar en su fase, no todas de golpe.

## Carpeta de trabajo

Cada artículo vive en `publish/<slug>/` dentro del proyecto actual (si no existe `publish/`, pregunta dónde crearlo). El slug es kebab-case y describe el tema: `criteria-pattern-nest`, `module-architecture-nest`.

```
publish/
├── SERIES.md                 # índice de la serie: publicados, tesis, dominios, marcos usados
└── <slug>/
    ├── TODO.md               # la bitácora: estado, decisiones, plan, afirmaciones verificadas
    ├── es.md                 # el borrador (y luego el artículo) en español
    ├── en.md                 # traducción, sólo en fase 4
    ├── fuentes.md            # lo investigado que no entra, con su porqué
    ├── recortes.md           # lo redactado y cortado, con su porqué
    ├── social.md             # contexto de la difusión: enlaces, vídeos, avisos, notas
    ├── devto.json            # descripción, tags e id/url en dev.to, por idioma (scripts/devto.py)
    ├── posts/                # un .txt por red e idioma, listo para copiar y pegar
    ├── diagrams/             # NN-nombre.png (fuente: <Still> en Projects/tech-articles/videos/; publicadas en example/docs/diagrams/)
    ├── scratch/              # pruebas ejecutables que verifican afirmaciones
    └── example/              # proyecto ejecutable que acompaña al artículo (si aplica)
```

Crea los archivos desde `assets/` al arrancar. `SERIES.md` se crea la primera vez y se actualiza al publicar.

## Reanudar antes que empezar

Si `publish/<slug>/TODO.md` existe, **léelo entero antes de nada** — la sección *Estado* dice en qué fase está, qué falta y qué está decidido. Lee también `SERIES.md` para no repetir marco, dominio ni título con forma gastada. Si `es.md` existe, léelo completo: puede tener ediciones del autor posteriores a la última sesión (ver *El autor edita*).

## Las fases

Cada fase termina con algo concreto en disco. **Las puertas (🚪) exigen el visto bueno explícito del autor**; no se cruzan por inferencia.

### Fase 1 — Plan

1. **Definir el problema con el autor.** Pregunta lo que no se deduzca: tema y el problema real que lo motiva, a quién va (nivel, stack), qué repo propio sirve de referencia de estructura, qué quiere que el lector se lleve, idioma de salida y plataforma. Si el encargo es amplio ("arquitectura, SOLID, DDD y todo lo que se pueda investigar"), dilo: no cabe en un artículo y no debe caber. Se reduce a **una tesis**; lo demás entra como consecuencia.
2. **La tesis en una línea**, discutible (alguien serio podría defender lo contrario).
3. **Título** con la fórmula de `structure.md` y una tabla de candidatos descartados con su porqué.
4. **Dominio de ejemplo** único para todos los snippets (regla 3) y tabla *concepto → nombre en el artículo* + árbol de rutas de los snippets.
5. **Medir en el repo de referencia** lo que sostenga el argumento (tests, tiempos, censos con `grep`/`find`): tabla *medida | valor | cómo se midió | fecha*.
6. **Estructura de secciones** con su *beat* (qué queda demostrado) y presupuesto de palabras, según `structure.md`. Marca con ⭐ la prueba de fuego. Fija la **duración objetivo según la densidad** del contenido, siempre dentro de 10-15 min de lectura; si el plan no cabe, propón partirlo en dos.
7. **Plan de ilustraciones** y **qué dejar fuera**, ambos con su porqué.

Todo va a `TODO.md`. No se escribe prosa del artículo todavía.

### Fase 2 — Investigación

Sigue `references/research.md`: barrido online del *prior art* (dev.to, Medium, Hashnode, blogs, docs oficiales, issues, GitHub), canon con citas literales verificadas, convenciones del ecosistema por censo, y verificación ejecutable de cada afirmación técnica. Lanza subagentes en paralelo para el barrido y **re-verifica tú** lo que traigan antes de que entre en la tabla.

La investigación corrige el plan: cuando lo haga, **consulta al autor** con lo encontrado y las salidas posibles, y sólo después anótalo como decisión y reescribe la parte afectada.

🚪 **Puerta:** cierra con el checklist de `research.md` marcado en `TODO.md` y presenta al autor, en el chat, un resumen corto: tesis, título, el hueco del prior art en una frase, el argumento que se ataca y su dueño, la estructura con presupuesto, y lo que la investigación cambió del plan. Espera el visto bueno.

### Fase 3 — Borrador

1. Lee `references/style.md`. Redacta `es.md` sección por sección, en orden. Tras cada sección, mide con `scripts/measure.py` y apunta real vs. presupuesto en `TODO.md`. Si el reparto se desvía, decide (y anota) **antes** de seguir, no al final.
2. Figuras: mientras el borrador esté abierto, van como comentario HTML con su alt y su pie (`style.md`). Se generan al final como `<Still>` de Remotion en `Projects/tech-articles/videos/`, con el kit de figuras y la paleta de Chaca (ver `diagrams.md`); carga antes `visual-media` y `remotion-best-practices`.
3. Si el artículo promete un repo, monta `example/`: ejecutable, con su métrica medida y citada, código y README en inglés.
4. Pasada de revisión completa (`references/review.md`) y `measure.py --lint`.
5. Entrega: dile al autor que el borrador está listo, con la medición, lo pendiente y las 2-3 decisiones que más conviene que revise.

### El autor edita

A partir de aquí el autor reescribe `es.md` a mano. Cuando vuelva:

- Lee `es.md` entero. **Sus cambios son decisiones**, no errores: no los reviertas ni "mejores" su redacción sin que lo pida. Si un cambio suyo rompe algo comprobable (una cifra, una referencia cruzada, un snippet que ya no compila, una afirmación sin verificar), señálalo y propón el arreglo mínimo.
- Si pide reescrituras, toca sólo lo pedido. Lo cortado va a `recortes.md` con su motivo.
- Anota en `TODO.md` qué cambió y la nueva medición.

### Fase 4 — Traducción y difusión

Sigue `references/publishing.md`: `en.md` con paridad comprobada (`measure.py --parity`), checklist por plataforma, dev.to desde la skill con `scripts/devto.py` (borrador → revisión del autor → `--publish`), `posts/<red>-<lang>.txt` en texto plano para copiar y pegar, con `social.md` como contexto (seis ganchos con el método de `hook-generator` → el autor elige → LinkedIn con las reglas de `post-formatter` y X en un solo post de ≤ 280 caracteres, comprobados con `social_check.py`), y `SERIES.md` actualizado con las URLs.

Los posts llevan **vídeo** por defecto: sigue `references/video.md` (guion aprobado por el autor → proyecto HyperFrames en `hyperframes/<slug>-<lang>/` con la marca y los bloques de la serie → bucle visual con hojas de contacto → MP4 por plataforma). Carga `visual-media` y, desde ella, `hyperframes`, antes de crear el proyecto. Los vídeos anteriores al 2026-11-27 siguen en Remotion (`videos/`).

## Reglas duras

Son las que se citan por número en las bitácoras. No se negocian sin una decisión anotada.

1. **Una sola tesis discutible.** El artículo defiende algo; los conceptos generales (SOLID, DDD, capas…) entran sólo donde un mecanismo concreto los demuestra, nunca como sección-taxonomía.
2. **El argumento que se ataca tiene dueño citable** — doc oficial, libro, mantenedor, artículo de referencia — con cita literal. Si no se encuentra dueño, es un hombre de paja y se descarta. Al argumento contrario se le concede primero lo que tiene.
3. **Un solo dominio de ejemplo para todos los snippets**, neutro y entendible sin explicación. Nada del vocabulario del proyecto real **ni sus cifras** —cuántos códigos declara, cuántas clases tiene—: las mediciones del repo privado sostienen decisiones y viven en la bitácora, pero el lector no las ve ni las puede comprobar, así que en el texto se enuncia el coste sin número. Nada de clichés del tema (pagos con Stripe/PayPal, notificaciones email/SMS, la *todo app*). **El prefijo de las piezas transversales** (el error base, el filtro, el resolver) no puede ser una palabra del dominio del ejemplo: si la app se llama como una de sus operaciones, `DispatchError` se lee como «el error de despachar». Mejor `App`, o un nombre propio que no sea vocabulario del dominio.
4. **Nada se afirma sin comprobar.** Cada afirmación técnica está en la tabla de *Afirmaciones verificadas* con fuente, versión y fecha. Lo que no se pudo comprobar no se afirma: se reformula a lo que sí es cierto. El artículo declara contra qué versiones se verificó.
5. **El coste se dice donde está el beneficio**, no en una sección final de trade-offs. Y el *para quién no es* va antes que el *para quién sí*.
6. **Snippets honestos:** la ruta del archivo como primera línea; el archivo completo cuando es corto; si se reduce, se dice. Se escriben a mano calcando forma y convenciones del repo de referencia, no se copian. Tienen que compilar.
7. **Código en inglés:** identificadores, comentarios de código, `example/` y su README, aunque el artículo esté en español.
8. **Las referencias cruzadas van por título, nunca por número.** El lector no ve `§7`.
9. **Un párrafo por línea**, sin ajuste de columnas, en `es.md`, `en.md`, `social.md` y `posts/*.txt`. Dev.to convierte cada salto simple en salto real.
10. **Las decisiones se escriben** en `TODO.md` como `> **Decisión (al <momento>):** …` con su porqué. Lo descartado lleva *No reintroducir* y no se vuelve a proponer sin una razón nueva.
11. **Nada se tira:** lo investigado que no entra va a `fuentes.md`; lo redactado y cortado, a `recortes.md`. Ambos con motivo. La traducción traduce lo que quedó, no lo que hubo.
12. **Entre 10 y 15 minutos de lectura** (2.750-4.125 palabras a 275 ppm, código incluido). El punto dentro de la banda lo decide la densidad; fuera de ella, se recorta o se parte en dos artículos, nunca se rellena ni se estira.
13. **Las puertas son del autor.** No se pasa de la fase 2 a la 3 sin su visto bueno, no se publica nada en su nombre, y sus ediciones de `es.md` mandan.
14. **Cadencia propia.** Ninguna frase con la forma de las que ya se repiten en el nicho, y ningún gozne retórico dos veces en el mismo artículo. Prohibidas la fórmula de permanencia («hace su trabajo y puede quedarse así durante años», «lleva dos años en producción y no ha dado un problema», «hace lo que promete») y los remates con tríada de virtudes. Vigiladas, porque a la segunda son un tic: «conviene decir…», «la salida obvia…», «hay que concederle…», «lo que no cambió…», «no es X, sino Y», «más de lo que parece», y la oración hendida «lo que X es Y» repetida como esquema. `measure.py --lint` avisa de las conocidas, de la repetida y de todo molde que abra cuatro oraciones; el aviso se resuelve **diciendo lo mismo de otra forma**, no borrando la idea.
15. **No se asume nada.** Dudas, mejoras posibles y errores de contenido o de idea se consultan con el autor, con evidencia y opciones, antes de decidir (ver *No asumir: preguntar*).

## Otros formatos

El método completo es para el **ensayo técnico con tesis** (el formato por defecto). Para otros, recorta:

- **Tutorial / how-to:** misma fase 2 (verificar cada paso ejecutándolo), estructura de `structure.md` → *Variante tutorial*. La tesis se convierte en "el resultado que el lector tendrá funcionando".
- **Release notes / anuncio de versión:** sin fases 1-2 completas. Fuente = changelog + diff + benchmarks medidos. Salida: artículo corto + `social.md` por idioma y plataforma, con el material adjunto listado (vídeos, capturas) y un checklist *Antes de publicar*.
- **Nota interna / post-mortem técnico** (como `generalizacion-unit-of-work.md`): contexto → qué se cambió → por qué → cómo se verificó. Puede ser semilla de un ensayo posterior; anótalo en `SERIES.md`.
