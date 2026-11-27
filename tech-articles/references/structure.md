# Estructura: título, tesis, secciones y presupuesto

## El título

**Fórmula:** `<keyword buscable>: <la tesis como aforismo>`, con dos puntos, no raya.

- *El patrón Criteria en NestJS: lo que un cliente puede pedir es un archivo, no una firma*
- *El patrón Strategy en NestJS: el registro es código de dominio, y lo cierra el compilador*
- *Arquitectura de un proyecto NestJS: el contenedor cablea infraestructura, no compone tu dominio*

La keyword va delante porque es lo que se busca. La tesis va detrás porque es lo que distingue el artículo de los otros cincuenta con la misma keyword. Ideal: la tesis se entiende antes de leer y significa más después; lo mejor es que sea literalmente la regla práctica del cierre.

Siempre una tabla de **candidatos descartados con su porqué**. Motivos típicos de descarte:

| Defecto | Ejemplo |
| --- | --- |
| Promete exhaustividad ("guía completa") | el artículo defiende una cosa, no lo cubre todo |
| Enumera en vez de afirmar ("Dos formas de…") | no dice qué se defiende |
| Enuncia el beneficio, no la tesis ("una sola forma de filtrar…") | serviría para el artículo de cualquiera |
| Compra el argumento que el artículo descarta | contradice la §de descarte antes de empezar |
| Pierde la keyword | buen gancho para X, mal título; se recicla en `social.md` |
| Registro de blog personal ("Cómo estructuro…") | cuenta, no argumenta |
| Opaco hasta la mitad del texto | la tesis exacta, pero nadie la entiende en el feed |
| Demasiado largo (> ~90 caracteres) | sobrevive como frase dentro del artículo |

Si el artículo es parte de una serie, el título repite la forma de los anteriores (consolida la serie). Comprueba `SERIES.md`.

Comprueba la saturación de la keyword en cada idioma durante la fase 2: un tema saturado en inglés puede estar vacío en español, y eso decide en qué idioma sale primero.

## La tesis

Una línea, en negrita, en el cuerpo del artículo. Se llega a ella así: **cita canónica primero** (Evans, Fowler, PoEAA, la doc oficial — verificada literalmente), **formulación propia después**, e inmediatamente **qué determina eso al escribir código**, que es lo que ocupa el resto del artículo.

Prueba de una buena tesis: alguien competente podría defender lo contrario, y el artículo tiene un mecanismo (no una opinión) que la sostiene.

## El esqueleto

Las secciones en este orden. Los nombres son orientativos; los *beats* no.

| Bloque | Sección | Beat: qué queda demostrado |
| --- | --- | --- |
| Diagnóstico | **1. El gancho** (sin título H2: el artículo abre con código) | Se abre con el código que todo el mundo escribe, real y correcto. Se le concede lo que tiene ("hace lo que promete, se lee de una pasada, aguanta años en producción"). Lo que se cambia no es el juicio sobre el código, sino el criterio con que se mide. **Inventario de acoplamiento** en negrita + mecanismo, **clasificado**: los puntos locales y reversibles primero, y aparte el que es de otra naturaleza (el que planta la tesis). **Condición de validez dicha aquí**: cuándo nada de esto tiene coste observable. |
| | **2. Adónde va esto** | El destino en bruto, sin justificar: dos o tres bloques cortos y la frase de qué cuesta llegar ahí. Quien abandone en el minuto tres se lleva la solución. Planta la prueba de fuego sin nombrarla. |
| | **3. Los costes** (dos o tres) | Numerados, porque el resto del artículo los referencia. Cada uno con su **efecto de segundo orden** concreto (las URLs se comparten y se rompen fuera del repo; `?sortBy=passwordHash` filtra por el orden). |
| Contexto y descarte | **4. Qué hay ya resuelto, y qué conviene descartar** | Un párrafo por familia de soluciones existentes, **diciendo primero qué resuelve bien**. Cierra con **tabla herramienta × costes** (celdas cortas, incluidas las de *no lo aborda*), una `> **Nota:**` con lo que la tabla no mide y contra qué versiones se verificó, y **el hueco** en una frase. Aquí va el **argumento popular con dueño**: se cita, se le concede, se mide. |
| | **5. La tesis** | Cita canónica → formulación propia en una línea → qué determina al escribir código. Si el ecosistema hace lo contrario, se dice aquí, pronto y con números. |
| Solución | **6. La implementación, pieza por pieza** | Subsecciones por pieza, archivo completo cuando es corto. **El coste va aquí, junto a la pieza que lo genera.** Cierra con la **vuelta al inventario** del gancho, punto por punto. |
| | **7. ⭐ La prueba de fuego** | El caso que rompe casi todas las implementaciones que hay publicadas. Estructura fija: el problema con forma precisa → **la salida obvia y por qué falla** → la solución → **qué no cambió** (inventario de lo que no se tocó). Es la sección que justifica el artículo; no se recorta. |
| | (opcional) **8. Lo mismo contra otra tecnología** | Prueba de portabilidad comprobable: qué cambia (idealmente un archivo) y qué no. |
| Cierre | **Matices honestos** | Dos, cada uno con **síntoma observable** y su mecanismo (no "podría haber problemas de rendimiento", sino qué falla, cómo se ve y por qué). Y lo que la propuesta **no es**. |
| | **Para quién es (y para quién no)** | **El NO primero**, con el caso concreto donde lo simple gana. Después las condiciones que invierten el balance y un umbral operativo ("con dos o más presentes…"). **La regla práctica en una línea**, en negrita. |
| | **El código** | Repo ejecutable con una métrica concreta medida ("26 tests en 19 ms sin base de datos"). |
| | Cierre (opcional) | Sólo si es la tesis vista desde el final. Nunca terminar nombrando otra herramienta. Si la regla práctica ya cierra, no hay cierre. |
| | **Hablemos** | Bloque de contacto fijo (`assets/contacto.md`). |

### Presupuesto por bloque

| Bloque | Proporción |
| --- | --- |
| Diagnóstico (gancho, destino, costes) | ≤ 25 % |
| Contexto y descarte (estado del arte, tesis) | ≤ 20 % |
| Solución y prueba de fuego | ≥ 45 % |
| Matices, para quién, código, cierre | ≤ 10 % |

**Duración: entre 10 y 15 minutos de lectura, siempre** (2.750-4.125 palabras a 275 palabras/min, código incluido). Es una restricción dura: fuera de la banda, el artículo se recorta o se parte en dos.

El objetivo dentro de la banda se fija en la fase 1 según la densidad del contenido, y se apunta en `TODO.md` con su porqué:

| Densidad | Objetivo | Señales |
| --- | --- | --- |
| Conceptual | 10-11 min (~2.750-3.000) | la tesis se sostiene con pocos snippets cortos; el peso está en el argumento y el estado del arte |
| Media | 12-13 min (~3.300-3.600) | implementación por piezas con 6-10 snippets y una prueba de fuego con código |
| Densa | 14-15 min (~3.850-4.125) | varias piezas con archivo completo, una segunda tecnología para demostrar portabilidad, o una prueba de fuego larga |

- La densidad la decide el contenido de la solución, nunca un diagnóstico o un estado del arte largos: el tiempo extra de un artículo denso tiene que estar en el bloque de solución.
- **Si el plan no cabe en 15 minutos, no se estira la banda**: se parte en dos artículos (p. ej. la segunda tecnología o la prueba de fuego secundaria pasan a ser el siguiente de la serie) o se mueve material a `fuentes.md`. Es una decisión que se anota y se consulta con el autor.
- Si el borrador queda por debajo de 10 minutos, se revisa si falta la prueba de fuego, los matices o la vuelta al inventario antes de pensar en añadir nada; nunca se rellena.

Reglas del presupuesto:

- **El código cuenta.** Planifica las palabras de los snippets dentro de la sección, o el plan saldrá un 30 % corto. `measure.py` separa prosa y código.
- Mide tras cada sección, no al final. Si una se pasa, decide en el momento qué se recorta y anótalo.
- Si el reparto no se cumple y cuadrarlo empeora el artículo (tirar evidencia comprobada o rellenar la solución), **se acepta a conciencia y se dice en la bitácora**, con el orden de recorte si hiciera falta. Lo que no se toca nunca es la prueba de fuego.

## Variante tutorial

1. Lo que vas a tener funcionando (captura o salida real) y requisitos con versiones.
2. Pasos numerados, cada uno con un resultado comprobable al final ("deberías ver…").
3. Lo que falla típicamente en cada paso, con el mensaje de error literal.
4. Qué no cubre, y hacia dónde seguir.
5. Repo con el estado final y, si ayuda, una rama por paso.

Aplican las reglas 3, 4, 6, 7, 8 y 9.
