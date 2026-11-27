# Estilo (fase 3)

La voz es la de un ingeniero que ha medido lo que dice y no necesita venderlo. Argumenta, no cuenta; concede antes de discutir; dice el coste sin que se lo pregunten.

## Voz y tono

- **Impersonal o primera del singular.** "Se le concede", "lo que interesa analizar", "conviene decirlo" —este último una vez por artículo como máximo: a la segunda es un tic (regla 14). La primera persona del singular sólo para lo que de verdad hizo el autor ("allí lo medí con detalle", "es la que a mí me dejó de dar sustos"). **Nunca "nosotros", "vamos a", "todos sabemos".**
- **Sin voseo** y con el tuteo al mínimo (sólo si el título o una regla práctica lo piden: "registra lo que tiene ciclo de vida").
- **Sin preguntas retóricas.** El único `¿` del artículo es el del bloque de contacto.
- **Sin párrafos de una sola oración** usados como remate lapidario de sección. Se toleran como entradilla de un snippet; los demás se funden con el párrafo anterior.
- **Sin superlativos ni registro comercial**: nada de "potente", "elegante", "game-changer", "adiós al X", "la guía definitiva". Nada de emojis en el cuerpo.
- **Conceder es un movimiento obligatorio.** Antes de criticar código o una herramienta, se dice qué resuelve bien, sin matizarlo ("es la que más lejos llega de fábrica y conviene decirlo sin matizarlo").
- **Mecanismo antes que adjetivo.** No "esto acopla", sino "el modelo de Mongoose entra por el constructor, así que la regla no puede evaluarse sin un modelo".
- **Números concretos y medidos**: "53 composiciones a mano en 16 controladores", "26 tests en 19 ms". Nunca "muchos", "bastante rápido".
- Las negritas marcan el mecanismo o la afirmación que sostiene el párrafo, no palabras sueltas. Los incisos van con raya —así— sin espacios.

## Cadencia (regla 14)

El nicho tiene frases hechas y se notan. La más gastada es la **fórmula de permanencia**: presentar el código del gancho diciendo que funciona y podría quedarse así durante años, que hace lo que promete, que lleva dos años en producción sin dar un problema. Dice algo verdadero y necesario —el código del gancho no es un error, y el artículo no va a burlarse de quien lo escribió— pero lo dice con el molde de todos los demás. Se dice de otra forma: que la línea sólo presente el código ("así despacha un envío el cliente de esta API:") y el juicio vaya después del snippet, en prosa propia; o que el autor asuma la autoría ("empiezo por un servicio mío que no tiene nada de malo"); o que se entre por el síntoma que ve el usuario.

Y lo mismo con los goznes del razonamiento. Cada uno es correcto una vez y un tic a la segunda:

| Gozne | Primera vez | A partir de la segunda |
| --- | --- | --- |
| "Conviene decir…" | pasa | "Hay un caso en el que…", o entrar directo por el hecho |
| "La salida obvia es…" | pasa | "La otra reacción inmediata es…" |
| "Hay que concederle…" | pasa | "…y esta merece más crédito" |
| "Lo que X es Y" (oración hendida) | pasa | sujeto y verbo: "llegar ahí cuesta dos catálogos" |
| "No es X, sino Y" | pasa | "X no cambia; cambia Y" |
| "…más de lo que parece" | pasa | decir cuánto, o "no es poca" |

Tres cosas más que delatan el molde: la **tríada de virtudes** como remate ("hace lo que promete, se lee de una pasada y aguanta años sin tocarlo"), el **mismo adjetivo-juicio** repetido de sección en sección, y abrir cuatro párrafos seguidos con la misma clase de oración. `measure.py --lint` cuenta todo esto y da la línea; el arreglo es variar el esquema, nunca quitar la idea ni dejarla a medias.

## Forma del texto

- `es.md` empieza con `# Título` y entra directo al código del gancho, sin introducción ("En este artículo veremos…" está prohibido).
- H2 para secciones, H3 para piezas o costes numerados. Sin numerar los H2.
- **Un párrafo por línea** (regla 9).
- Referencias internas **por título**: "como se vio en *Los costes*", nunca "en la §3" ni "en la sección siguiente" si no es literalmente la siguiente (regla 8).
- Listas sólo para inventarios y enumeraciones reales; el razonamiento va en prosa.
- Tablas sólo cuando hay dos ejes que comparar (herramienta × coste). Celdas cortas. Medium no las renderiza: ver `publishing.md`.

### Notas

Formato fijo, para lo que matiza sin interrumpir el hilo:

```markdown
> **Nota:** la tabla mide cobertura de estos dos costes, no calidad. Verificado en septiembre de 2026 contra NestJS 11.1.27 y …
```

La tesis va también como cita en negrita, sola:

```markdown
> **Un criteria no es una consulta que viaja por la URL: es la descripción de un listado […]**
```

Las notas que enlazan a otro artículo de la serie llevan el enlace **del mismo idioma** (al traducir se cambia).

## Snippets

- Primera línea: comentario con la ruta del archivo (`// src/lending/application/use-cases/create-loan.use-case.ts`).
- Archivo completo cuando es corto, y se dice ("el archivo completo:"). Si se elide, `// …` y se avisa en la prosa; si es una versión reducida de código ajeno, se dice "reducido", no "transcrito".
- Identificadores, comentarios y strings en inglés (regla 7). Los mensajes de error, literales y en inglés.
- Todos los snippets deben **compilar juntos**: mismo dominio, mismas firmas a lo largo del artículo. Si una firma cambia entre secciones (se añade un parámetro), la prosa lo dice explícitamente. Lo ideal es que salgan de `example/` y se comprueben con `tsc --noEmit`.
- Antes de cada snippet, una frase que diga qué mirar en él. Después, sólo lo que el código no dice solo.
- Árboles de carpetas como bloque de texto, nunca como imagen.
- Sigue las convenciones del ecosistema (ficha de la fase 2) salvo donde el nombre sea parte del argumento, y entonces se dice en una nota.

## Figuras mientras el borrador está abierto

Van como comentario HTML con todo redactado, nunca como `![](…)` a un archivo que no existe:

```markdown
<!--
FIGURA 2 — <sección>, <nombre corto>.
Fuente: publish/videos → <slug>-fig-02-<nombre> · pendiente de generar.
<restricciones: si comparte encuadre con otra figura, cuál y qué no puede cambiar>

Alt: <descripción completa de lo que se ve, para quien no ve la imagen>

Pie: <una frase que dice qué mirar, no qué es>
-->
```

Al generarla, el comentario se sustituye por:

```markdown
![<alt>](diagrams/02-<nombre>.png)

*<pie>*
```

## Lo que no se escribe nunca

- Introducciones que anuncian el artículo; conclusiones que lo resumen.
- "Como todos sabemos", "es importante destacar", "cabe mencionar", "en resumen", "sin más preámbulos", "¡Manos a la obra!".
- La fórmula de permanencia del gancho y sus variantes: "puede quedarse así durante años", "aguanta años sin tocarlo", "hace lo que promete", "lleva N años en producción y no ha dado un problema" (regla 14).
- Definiciones de libro de conceptos que el lector objetivo ya conoce (qué es DDD, qué es SOLID).
- Afirmaciones que no están en la tabla de verificadas (regla 4).
- El nombre de otra herramienta como última línea del artículo.
- Vocabulario **ni cifras** del proyecto real del autor: ni "126 códigos" ni "65 clases espejo". El coste se enuncia sin número (regla 3).
