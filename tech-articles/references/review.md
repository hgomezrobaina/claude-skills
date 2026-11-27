# Revisión

Se ejecuta al cerrar el borrador (fase 3) y cada vez que el autor devuelve una edición. Primero los **defectos** (errores comprobables), después las **mejoras** (preferencias). Todo se presenta al autor con su evidencia y una propuesta de arreglo antes de tocar el texto (regla 15); sólo se aplica lo que apruebe, salvo que haya delegado explícitamente un tipo de arreglo.

## 1. Medición automática

```bash
python3 ~/.claude/skills/tech-articles/scripts/measure.py publish/<slug>/es.md --lint
```

Apunta en `TODO.md` → *Estado* la tabla por bloque (palabras, proporción, presupuesto) y los avisos del lint que se han corregido o aceptado.

## 2. Defectos — se buscan uno por uno

- **Referencias cruzadas rotas:** cada "como se vio en…", "la sección siguiente", "más abajo" apunta exactamente a lo que dice.
- **Cuentas que no cuadran:** "cuatro archivos" que luego se enumeran como tres, "el controlador queda en cuatro líneas" que son ocho, "cinco puntos" del inventario que en la vuelta al inventario son cuatro. Si se borra algo, se repasan todas las cifras que dependían de ello.
- **Prosa que promete lo que el código no hace:** el párrafo dice que el builder produce `{ author: { name } }` y el snippet no lo hace.
- **Snippets que no compilarían:** estrechamientos de tipo que no sobreviven a un callback, imports que faltan, firmas que cambian entre secciones sin decirlo. Si hay `example/`, `tsc --noEmit` y tests.
- **Afirmaciones fuera de la tabla de verificadas** (regla 4). Cada cifra, versión, cita y comportamiento de herramienta tiene su fila.
- **Enlaces:** cada URL abre, apunta a lo que dice y, en `en.md`, al artículo en inglés de la serie.
- **Reglas duras:** dominio único, código en inglés, sin referencias por número, un párrafo por línea, coste junto al beneficio, NO antes que sí.

## 3. Mejoras — la prueba del recorte

Para cada párrafo: si se borra, ¿el lector pierde algo que no está ya en la tabla, el snippet o el párrafo anterior? Si no, se corta (a `recortes.md`, con motivo). Señales típicas:

- un párrafo por familia que repite su fila de la tabla más una cita (se queda la cita);
- enumeraciones repetidas al recapitular;
- código muerto en un snippet (un `@Query()` que no se usa) y las cuentas que dependían de él;
- un matiz atado a una tecnología concreta en una sección que habla del patrón en general;
- el cierre que repite el cuerpo.

Orden de recorte si hay que bajar palabras: matices → estado del arte → diagnóstico. **La prueba de fuego no se toca.**

## 4. Pasada de tono

Con `--lint` como guía y lectura completa: voseo, "nosotros"/"vamos a", preguntas retóricas, párrafos de una oración que rematan sección, superlativos, introducciones que anuncian.

Los avisos de **cadencia** se tratan como defectos, no como preferencias: la fórmula de permanencia del gancho, el mismo gozne retórico dos veces y el molde que abre cuatro oraciones (regla 14, tabla de recambios en `style.md`). El lint da la línea y el conteo; lo que no detecta —un adjetivo-juicio que se repite, un párrafo que imita el ritmo del anterior— se busca leyendo las primeras ocho palabras de cada párrafo seguidas, que es donde se oye el molde.

## 5. Registro

En `TODO.md` → `### Pasada de revisión sobre el borrador (<fecha>)`: lista numerada de defectos corregidos, mejoras aplicadas, y qué fue a `recortes.md`.

## Revisión de una edición del autor

Cuando el autor ha editado `es.md`:

1. Compara con la versión que conoces (lo anotado en `TODO.md`, o `git diff` si el directorio está versionado) para saber **qué** tocó.
2. Sus decisiones de redacción no se revisan como defectos. Sólo se señala lo comprobable que su cambio haya roto: cifras, referencias, snippets, afirmaciones nuevas sin verificar (si añadió una afirmación, verifícala y añádela a la tabla, o dile que no se pudo).
3. Re-mide y actualiza *Estado*.
