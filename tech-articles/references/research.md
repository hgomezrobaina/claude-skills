# Investigación (fase 2)

El objetivo no es acumular enlaces: es que **ninguna afirmación del artículo se sostenga sólo en lo que el modelo recuerda**, saber exactamente qué hay publicado para encontrar el hueco, y localizar con nombre y cita al que defiende lo contrario.

## Los cinco frentes

Lanza subagentes en paralelo (uno por frente es un buen reparto) con instrucciones de devolver **citas literales con URL**, no resúmenes.

### 1. Prior art — qué hay publicado y dónde se detiene

Busca en inglés **y** en el idioma del artículo: dev.to, Medium, Hashnode, blogs de consultoras del ecosistema (p. ej. Trilon para NestJS), LogRocket, freeCodeCamp, la doc oficial, gists y repos boilerplate con muchas estrellas, Reddit/Hacker News para el sentir de la comunidad.

Tabla en `TODO.md`:

| Artículo | Qué cubre | Dónde se detiene |
| --- | --- | --- |

Después, **el hueco en una frase**: "existe literatura de A y literatura de B, pero nadie escribe el puente: …". Si no hay hueco, el artículo no tiene razón de ser o la tesis está mal enfocada — dilo.

Mide también la **saturación por idioma** de la keyword (decide en qué idioma sale primero) y busca activamente la postura del artículo ("nadie defiende X" es un hallazgo: sube la exigencia del estado del arte, hay que conceder mucho).

Ojo con las estrellas: **cita estrellas junto al último commit y la versión del framework**. El boilerplate más estrellado puede llevar dos años abandonado.

### 2. El argumento con dueño

Quién defiende en serio lo que el artículo discute: doc oficial, libro, mantenedor, artículo canónico del nicho. Cita literal + URL. Busca especialmente **contradicciones internas** del dueño (promete "sin `switch`" y publica una fábrica con `switch`; compone a mano y luego lo envuelve en el contenedor): es el mejor material de la sección de descarte.

Si el candidato inicial resulta ser un hombre de paja, cámbialo y anótalo como decisión.

### 3. Canon — las citas que anclan la tesis

Evans, Fowler, PoEAA, GoF, la doc oficial del framework. **Verificadas por ti, literalmente**, nunca de memoria ni por el agente: fetch propio a la fuente, o extraer el texto del PDF. Anota capítulo/sección/página y cómo se verificó. Si la página impresa no se puede confirmar, no se cita página.

### 4. Convenciones del ecosistema

Cómo se hace "de verdad", por **censo**, no por impresión: clonar los ejemplos oficiales y 2-3 repos de producción grandes y contar (`find`, `grep -c`) sufijos de archivo, ubicación de módulos/tests, cómo se inyecta, cuántos usan X. Anota el SHA del repo. Ficha:

| Convención | Cómo se hace | Dónde se leyó (repo@SHA o doc anclada) |
| --- | --- | --- |

Si la convención es **contraria** a lo que propone el artículo, no se disimula: se dice en el artículo, pronto, y se convierte en argumento.

### 5. Verificación ejecutable

Toda afirmación sobre el comportamiento de una herramienta se comprueba **ejecutándola** o **leyendo su código instalado**:

- **Tipos y API de una librería:** `npm pack <pkg>@<versión> && tar -xzf` y leer los `.d.ts`, el `README` y el `lib/*.js`. Más rápido y fiable que instalar.
- **Comportamiento:** un scratch mínimo en `publish/<slug>/scratch/` (p. ej. `di-check/a-lifecycle.ts`) que se ejecuta y cuya salida se copia. **Los mensajes de error se copian literales.**
- **Mecanismo interno:** citar el archivo y la línea del paquete instalado que lo explica (`node_modules/@nestjs/core/hooks/on-module-init.hook.js`).
- **Versión actual:** `npm view <pkg> version time --json`. Si salió una major hace poco, el artículo dice "verificado contra X.Y.Z", nunca "la versión actual".

## La tabla de afirmaciones verificadas

En `TODO.md`. **Ninguna afirmación entra al borrador si no está aquí.** La señal de que hay que reabrir la fase 2 es una sola: estás a punto de escribir una afirmación que no está en esta tabla.

| Afirmación | Fuente (URL, archivo:línea, scratch) | Versión | Comprobada (fecha) |
| --- | --- | --- | --- |

Y la tabla de **versiones y fecha** que el artículo tiene que declarar (normalmente en la `> **Nota:**` de la tabla del estado del arte).

Lo que no se pudo verificar va a *Verificaciones pendientes* con el motivo y cómo se haría. Si no se verifica antes de publicar, la frase se reformula a la versión genérica que sí es cierta.

Las páginas que no se pueden leer (bot-wall, 403, render por JS) van a *Pendiente de verificar a mano*: **no se cita lo que no se ha leído.**

## Los matices: dos síntomas

Durante la investigación, busca los dos matices honestos del cierre: fallos reales de la propuesta con **síntoma observable** (qué se ve, qué no se ve, qué mensaje sale o deja de salir) y su mecanismo. Mejor aún si se reproducen en un scratch. Un matiz atado a una regresión de una versión concreta envejece mal: va a `fuentes.md`.

## Lo que se descarta

Todo lo encontrado que no entra va a `fuentes.md` con su porqué y, si da para ello, como candidato de otro artículo (anótalo también en `SERIES.md` → *Ideas*).

## Criterio de cierre

Se copia en `TODO.md` y se marca punto por punto:

- [ ] barrido online hecho: ninguna afirmación se sostiene sólo en lo que el modelo recordaba
- [ ] cada fila de la tabla de afirmaciones tiene fuente, versión y fecha
- [ ] la tabla del estado del arte tiene todas sus celdas, incluidas las de *"no lo aborda"*
- [ ] el hueco está enunciado en una frase
- [ ] el estado del arte tiene su argumento con dueño (cita literal + URL), y el cierre sus dos matices con síntoma
- [ ] la ficha de convenciones tiene, en cada fila, el repo@SHA o la doc anclada de donde salió
- [ ] las citas del canon están verificadas por mí, literalmente
- [ ] **re-verificación propia de las filas que entraron por los agentes**, con fecha y lo que se corrigió
- [ ] el plan de `TODO.md` está actualizado con lo que la investigación cambió
