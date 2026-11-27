# Dónde vive un spec según su estado

Compartido por `plan-creation` y `plan-implementation`. `plan-creation` lo usa para ubicar un spec nuevo; `plan-implementation` lo usa para moverlo cuando su estado cambia.

Dentro de `docs/specs/` (o `<repo>/docs/specs/` en un plan de un solo repo) la carpeta de cada spec no queda suelta: vive bajo una de tres subcarpetas según en qué punto está el plan, y el agente la mueve **en el momento** en que el estado cambia — nunca se deja para ordenar después. **(Decisión del usuario, 2026-11-12.)**

**Los nombres de estas subcarpetas son siempre en inglés (`pending`, `in-progress`, `finished`), aunque el resto del plan esté en español; nunca `pendientes`, `en-proceso` ni `terminados`. (Decisión del usuario, 2026-11-20.)**

| Subcarpeta | Cuándo |
|---|---|
| `docs/specs/pending/<slug>/` | El spec existe (al menos `requirements.md`) pero la implementación todavía no arrancó: `tasks.md` no existe, o existe pero ninguna de sus tareas está marcada `[x]` todavía. |
| `docs/specs/in-progress/<slug>/` | Ya se marcó al menos una tarea de `tasks.md` o se commiteó al menos una sección (regla 4), y el plan todavía no cerró. |
| `docs/specs/finished/<slug>/` | El plan cerró: todas las tareas que le tocan al agente están `[x]` (las que quedan para otro equipo, si el perfil del proyecto las separa en un documento de handoff, no cuentan en contra) y se entregó el reporte final de "Implementar un plan", paso 8. |

- **Un spec nuevo se crea directamente en `pending/`**: la ubicación que se pregunta en la fase 0 (paso 4 de `plan-creation`) ya incluye esta subcarpeta.
- **Al marcar la primera tarea `[x]`** (arranca el paso 3 de "Implementar un plan"), el agente mueve la carpeta completa de `pending/` a `in-progress/` en ese mismo momento, antes de seguir con la tarea siguiente.
- **Al cerrar el plan** (paso 8 de "Implementar un plan": reporte final entregado, sin tareas abiertas del agente), el agente mueve la carpeta de `in-progress/` a `finished/`.
- **Si un spec ya cerrado necesita más trabajo** (el usuario pide retomarlo o ampliarlo), vuelve a `in-progress/` apenas se marca la primera tarea nueva, igual que un spec que arranca por primera vez.
- **Cómo se mueve:** si `docs/specs/` no es parte de un repo git (workspace multi-repo con raíz sin `.git`, ver fase 0 de `plan-creation`), es un `mv` directo de la carpeta, sin pedir permiso aparte. Si vive dentro de un repo (`<repo>/docs/specs/...`), es un `git mv` de la carpeta completa, y el movimiento espera la misma revisión y luz verde que cualquier otro cambio (regla 4 de `references/rules.md`): no se commitea solo porque cambió el estado, va junto con el commit de la sección que lo disparó.
- **El perfil del proyecto puede declarar que esta organización no aplica** (por ejemplo, un repo que ya tiene su propia convención de carpetas para specs); en ese caso se sigue lo que diga el perfil.

## `handoff/`

**Todo lo que el plan produzca para otro equipo va en `handoff/`, dentro de la carpeta del plan** (`docs/specs/<estado>/<slug>/handoff/`): el documento de encargo, una propuesta técnica, un reporte de defecto, la respuesta a un handoff ajeno, y los PDF si el perfil del proyecto los pide. Nunca en una carpeta por tema fuera de `docs/specs/`, nunca sueltos en la raíz del plan mezclados con los cuatro documentos principales. **(Decisión del usuario, 2026-11-12.)** El motivo es doble: un informe guardado lejos pierde el rastro del trabajo del que nació, y sus enlaces al plan se pudren cada vez que el plan cambia de carpeta de estado. Adentro, los enlaces al propio plan son `../requirements.md` y el plan enlaza al informe como `./handoff/<archivo>`, así que mover el plan de estado no rompe ninguno de los dos. Si el plan entrega a más de un equipo, los documentos conviven en ese mismo `handoff/`, cada uno con su destinatario en la cabecera, y un `README.md` ahí adentro dice qué es cada uno y qué se espera. Al mover un plan de estado, `handoff/` se mueve con él sin tocar nada adentro.

## `diagrams/`

Los diagramas de flujo de prueba viven en `docs/specs/<estado>/<slug>/diagrams/`: `plan-*.mmd` (de `design.md`) y `walkthrough-*.mmd` (del recorrido de prueba del cierre), cada uno con su `.png` y su `.pdf` exportados al lado por `plan-files.sh diagrams`. Los tres archivos se commitean con el spec y se mueven con él al cambiar de estado. Los documentos los enlazan como `./diagrams/<archivo>`. **(Decisión del usuario, 2026-11-20.)**

## `videos/`

Los clips de video de los casos end-to-end viven en `docs/specs/<estado>/<slug>/videos/`: un `E2E-n.mp4` por cada caso que se prueba por interfaz, generados por la tarea `M.2b` de `plan-implementation` con `plan-files.sh videos`. **No se commitean**: si el spec vive dentro de un repo, `videos/` tiene que estar ignorada por git (`docs/specs/**/videos/` en el `.gitignore`), y `plan-files.sh videos` se niega a grabar si no lo está. Son regenerables con el mismo comando en cualquier máquina. Mientras se generan, los intermedios (subtítulos, marcas de tiempo y videos crudos) están en `videos/.work/`, que se borra al terminar bien. Las casillas de `test-walkthrough.md` los enlazan como `./videos/E2E-n.mp4`, así que moverse de `pending/` a `in-progress/` y a `finished/` no rompe ningún enlace. **(Decisión del usuario, 2026-11-27.)**
