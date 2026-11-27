---
name: plan-creation
model: claude-opus-5-5
description: Crear y revisar planes de implementación (specs) en cualquier proyecto — el trío `requirements.md` → `design.md` → `tasks.md` bajo `docs/specs/<slug>/`, más el registro `pending-items.md`, en un repo único o cruzando varios repos de un workspace. Úsala SIEMPRE que el usuario pida planificar una feature, "armar el plan", "hacer el spec", escribir requisitos/historias de usuario/diseño/tareas, desglosar un trabajo antes de programarlo, revisar un plan o diseño ajeno, o cuando pida algo grande que claramente necesita plan antes de código — aunque no diga "spec" ni "plan". No la uses para ejecutar un `tasks.md` ya aprobado ni para retomar una implementación en curso: eso es la skill hermana `plan-implementation`. Se adapta al proyecto (su forma, su stack, su framework de pruebas, su idioma) detectando sus convenciones antes de escribir. Obliga a preguntar ante cualquier duda en vez de asumir, a planificar pruebas end-to-end que cubran todos los escenarios, a imitar el patrón de código vigente del repo (incluida la convención de nombres de archivo) y consultar antes de cualquier mala práctica de DDD o clean code, a cuestionar todo plan o diseño contra fuentes externas (búsqueda en la web) antes de aprobarlo y a dejar las mejoras posibles anotadas en los pendientes, a que toda API responda errores con el contrato `{time, status, error:{code, message, status, params}}` con un `code` único por error, a componetizar al extremo en el frontend y a diseñar sus pantallas con el sistema visual vigente del repo cargando la skill hermana `plan-ui-design` (matriz de estados de cada pantalla, reglas verificables de tipografía, espaciado, color, movimiento y accesibilidad, los componentes de la librería de UI tratados como contratos, las skills de craft que aportan el detalle de movimiento y de datos extremos, y las reglas verificables de los **correos** del proyecto), a tratar los contratos del backend (DTO y `*Response` de los controllers) como concretos y mínimos y sin opcionales, pidiendo confirmación antes de cambiar uno que ya existe, a resolver cada `GET` con una sola consulta a la base de datos e informar cuando no sea posible, a diseñar todo esquema de base de datos con mentalidad senior y escalable (guardando todo dato útil para estadística o funcionalidades futuras, contrastado con esquemas publicados en la web, con diagrama entidad-relación en PNG y PDF y aprobado explícitamente por el usuario antes de seguir), y a aprobar los documentos de a uno, deteniéndose al entregar cada uno para esperar la revisión del usuario.
---

# Planes de implementación — creación

Esta skill cubre **desde que se entiende el pedido hasta que `tasks.md` queda aprobado**. Cuando el usuario quiera ejecutar ese `tasks.md` (o retomar uno que ya tiene tareas marcadas), eso es trabajo de la skill hermana `plan-implementation` — ofrécele cambiar a ella en ese momento, o indícale que la invoque.

**Modelo:** planear corre en Claude Opus 5.5. El `model:` del frontmatter solo rige el turno en que se invoca la skill, así que al arrancar la fase 0 (y de nuevo si la conversación sigue muchos turnos después) revisa el modelo activo de la sesión y, si no es Opus 5.5, avisa al usuario y sugiere cambiarlo con `/model claude-opus-5-5` antes de seguir. **Si la sección a planear toca interfaz** (se carga `plan-ui-design`), eso corre en Claude Fable 5.2 en vez de Opus — avisa el cambio al llegar a esa sección y sugiere `/model claude-fable-5-2`, volviendo a avisar el regreso a Opus 5.5 cuando la sección de interfaz termine.

Un plan es un **spec de tres documentos más un registro de pendientes** en `docs/specs/<slug>/`:

| Archivo | Responde | Estado | Quién lo escribe |
|---|---|---|---|
| `requirements.md` | Qué y por qué: problema, objetivo, historias de usuario con criterios, reglas de negocio, permisos, fuera de alcance | `borrador` → `aprobado` | esta skill |
| `design.md` | Cómo: enfoque, contratos confirmados del código, cambios por módulo, **pruebas end-to-end**, riesgos, decisiones | `borrador` → `aprobado` | esta skill |
| `tasks.md` | En qué orden: tareas numeradas y verificables, progreso, commit base | vivo durante la implementación | esta skill lo crea; `plan-implementation` lo actualiza |
| `pending-items.md` | Todo lo que queda abierto: deuda técnica, riesgos y cosas pendientes que aparecen al planificar o implementar | vivo, desde el primer documento hasta el reporte final | ambas skills |

`pending-items.md` no es un cuarto documento a aprobar: es el registro único donde se anota, apenas aparece, cualquier deuda, riesgo o cosa pendiente (ver `references/rules.md` § "Registro de pendientes"). Las plantillas de los cuatro archivos están en `references/templates.md`; léelas antes de redactar cada documento. El método de abajo es igual en todos los proyectos; lo que cambia (rutas, stack, comandos, framework de pruebas) sale del **perfil del proyecto** (`references/project-profile.md`).

**Dónde vive la carpeta de un spec según su estado** (`pending/`, `in-progress/`, `finished/`) y cómo se organiza `handoff/` dentro de ella está en `references/spec-locations.md` — léelo en la fase 0, paso 4, para saber dónde crear el spec nuevo. Ese mismo archivo es el que usa `plan-implementation` para mover la carpeta cuando el estado cambia.

**Las nueve reglas que no se negocian** (preguntar en vez de asumir, pruebas e2e exhaustivas, aprobación por documento, parar antes de commitear, imitar el patrón del repo y consultar malas prácticas —incluida la convención de nombres de archivo—, componetización extrema del frontend, contrastar con fuentes externas, recomendar por mejora del producto, y contratos del backend/arquitectura de consultas), más el contrato de errores HTTP y el registro de pendientes, están en `references/rules.md`. **Léelo completo antes de escribir `requirements.md` o `design.md`**: define lo que esta skill exige y es también lo que `/code-review` y `plan-implementation` verifican después. No lo repitas de memoria ni lo dupliques en otro archivo: es la única fuente.

**Si el plan crea o cambia persistencia** (una tabla, colección, columna, índice, relación o migración), **lee `references/data-model-rules.md` completo antes de diseñar el esquema**: levantar el esquema vigente, guardar todo dato que pueda servir (estadística, funcionalidades futuras, procedencia, copia cruda, métricas en el tiempo) aunque hoy no se use, diseñar con mentalidad senior y a escala (integridad en la base, índices por consulta, herencia elegida entre sus tres formas, migraciones seguras), **buscar en la web esquemas parecidos ya publicados** como guía, generar el diagrama entidad-relación en `.mmd` exportado a **PNG y PDF**, y **preguntar siempre al usuario si está de acuerdo con el esquema** antes de seguir con el resto de `design.md`. **(Decisión del usuario, 2026-11-22.)**

**Si el plan toca interfaz** (una pantalla, un modal, un formulario, una tabla, un estado vacío o un componente de la librería de UI), **carga también la skill `plan-ui-design`**: es la parte visual y de interacción del plan, y es la que dice cómo se levanta el sistema visual vigente del repo antes de decidir nada, cómo se declara la **matriz de estados** de cada pantalla (carga, vacío, sin resultados, error, sin permiso, extremos de contenido), qué reglas verificables cumple el código nuevo, y cómo se toca un componente compartido —que es un contrato, como los del backend en la regla 9—. La regla 6 (componetización) sigue viviendo en `references/rules.md`; `plan-ui-design` cubre lo que esa regla no dice: cómo tiene que verse y comportarse lo que se construye.

Esa misma skill es la que **enruta a las skills globales de craft** (`animate`, `choreograph`, `gestures`, `break-ui`, `mobile-native`, `pick-ui-library`, `review-animations`, entre otras) sin que ninguna pise el sistema visual del repo, y la que deja `hallmark` y `stageshow` **fuera de las pantallas del producto** (son para una landing nueva o una ilustración de marketing, y entran solo con Decisión del usuario): ver `plan-ui-design/references/craft-skills.md`. **Si el plan manda un correo** —uno nuevo, un cambio en uno que existe o en el layout que comparten—, eso también es interfaz: se diseña con `plan-ui-design/references/email-rules.md`, aunque el envío lo implemente otro equipo.

## Fase 0: perfilar el proyecto

Antes de preguntar nada, averigua cómo es este proyecto. Detectar no es asumir; preguntar lo que el repo ya dice le hace perder tiempo al usuario.

1. **¿Ya hay perfil escrito?** Búscalo, en este orden, y si existe úsalo y salta al paso 4:
   - una skill de proyecto de planes (`.claude/skills/*-plans/SKILL.md`, `*-specs`) — suele traer repos, comandos y skills hermanas ya resueltos;
   - `.claude/plans-profile.md`;
   - `CLAUDE.md` (raíz y por repo).
2. **Forma del workspace.** `git rev-parse --show-toplevel`. Si el directorio de trabajo no es un repo, cada carpeta hija que sí lo sea es un repo del workspace (típico de multi-repo). Anota la rama de **cada** repo.
   **Actualiza con `git pull` cada repo involucrado en el plan antes de investigar el código**: un repo local cientos de commits atrás produce un plan escrito contra código viejo. Antes de hacer pull, revisa `git status`: si el repo tiene cambios sin commitear, o la rama no tiene upstream, o el pull no es fast-forward, **no lo fuerces** (nada de `stash`, `reset`, `rebase` ni merge manual): avísale al usuario y pregúntale qué hacer. Anota en el chat a qué commit quedó cada repo.
3. **Convenciones, leyendo el repo.**
   - Specs existentes: `find . -path '*docs/specs/*' -name 'requirements.md'`. Si hay, imita su ubicación, su estructura y su **idioma**. Si hay uno relacionado con el pedido, hay que decidir si este lo extiende o lo reemplaza (eso se pregunta).
   - **El idioma detectado es el de la prosa de los documentos, nunca el de los nombres.** El nombre del plan (el `<slug>` de `docs/specs/<slug>/`) va siempre en inglés, igual que los nombres de los tests unitarios, los nombres de los tests end-to-end y los mensajes de commit — sin importar en qué idioma estén escritos los specs. Lo mismo vale para los nombres de archivo de código (regla 5 de `references/rules.md`): van en inglés y en kebab-case, sin importar el idioma del spec.
   - **Dentro de `docs/specs/`, todas las carpetas y todos los archivos van siempre en inglés** (y en kebab-case): el `<slug>`, las carpetas de estado (`pending/`, `in-progress/`, `finished/`), las subcarpetas (diagramas, imágenes exportadas, etc.) y cada archivo que se cree (`.md`, `.mmd`, imágenes…). Aplica aunque la prosa del spec esté en español y aunque un spec existente use nombres en español: no se imita ese nombre, se usa su equivalente en inglés y se avisa al usuario. Los nombres fijos son `pending-items.md`, `changed-files.md`, `test-walkthrough.md`, `diagrams/` (`plan-<us-n>-*.mmd`, `walkthrough-*.mmd`, `data-model*.mmd`) y `handoff/`. Solo el contenido de los documentos sigue el idioma detectado.
   - Stack y comandos: `package.json`, `pyproject.toml`, `go.mod`, `Makefile`, `composer.json`, `Gemfile` → cómo se hace build, lint, typecheck y test en este proyecto.
   - Pruebas end-to-end: `cypress.config.*`, `playwright.config.*`, `tests/e2e/`, `features/`, `tests/http/`, `*_spec.rb`, `conftest.py`. Anota cómo se siembran datos (escenarios, fixtures, factories, seeds) y cómo se seleccionan elementos (ids de DOM, roles, page objects).
   - Skills del proyecto (`.claude/skills/`) y agentes: son el atajo para ubicar patrones de servicios, tablas, formularios y permisos.
   - Paquete o módulo de permisos/roles, si existe.
4. **Pregunta solo los huecos** que quedaron (regla 1 de `references/rules.md`), junto con la ubicación del spec: si toca un solo repo, `<repo>/docs/specs/pending/<slug>/`; si cruza repos, `docs/specs/pending/<slug>/` en la raíz del workspace (ver `references/spec-locations.md`). **En esa misma ronda, pregunta siempre la importancia del plan** (`urgente` / `media` / `baja`) — a diferencia de los huecos, esta pregunta no es condicional: se hace en todo plan nuevo, para que quede registrada en `requirements.md` y se pueda saber a simple vista qué specs son urgentes.
5. **Ofrece guardar el perfil.** Si no había ninguno, al terminar la ronda de preguntas ofrécele al usuario escribir `.claude/plans-profile.md` con lo detectado y lo decidido, para no repetir la ronda en la próxima sesión. La plantilla del perfil está en `references/project-profile.md`.

## Flujo para crear un plan

1. **Entender el pedido.** Reformula en 2 o 3 líneas qué entendiste. Si el pedido ya es ambiguo, esa es la primera pregunta.
2. **Perfilar el proyecto** (fase 0).
3. **Investigar el código de todo lo involucrado** antes de preguntar nada. Así no preguntas lo que el código responde, y las preguntas que sí hagas llevan contexto. Recorre la ruta completa de la feature de punta a punta:
   - Capa de entrada: ruta, controller o handler; validación del payload; permisos o autorización; cada `throw`/`raise`/error de retorno con su status y su mensaje exacto.
   - Dominio y datos: servicios, casos de uso, entidades, migraciones o esquema. Si el plan toca persistencia, el levantamiento completo del esquema vigente (motor, ORM, migraciones, convenciones, tablas vecinas, volumen) de `references/data-model-rules.md` § 1.
   - Interfaz: contenedores, hooks, servicios de cliente, condiciones que muestran u ocultan controles, componentes reutilizables.
   - **Sistema visual del repo de interfaz** (si el plan toca pantallas): tokens y tema, inventario de la librería de UI compartida, primitivos y librerías de iconos/animación, y la **pantalla equivalente** que el diseño va a imitar, con `archivo:línea`. El procedimiento está en `plan-ui-design/references/ui-evidence.md`; lo detectado se anota en el perfil del proyecto para no repetirlo en cada plan.
   - **Correos del proyecto** (si el plan manda alguno): dónde viven las plantillas, cuál es el layout compartido, qué helpers usan (escapado, formato de dinero y fechas), de dónde salen los textos y el idioma, cómo se previsualiza y cómo se prueba, y quién implementa el envío. El procedimiento está en `plan-ui-design/references/email-rules.md` § 1. Dos layouts distintos es deriva: se informa y se pregunta cuál es el canónico antes de escribir una plantilla nueva.
   - Specs existentes relacionados y estado de git de cada repo.
   - **Referencias de patrón** (regla 5 de `references/rules.md`): para cada pieza que el plan va a crear, el código más parecido del repo (incluida la convención de nombre de archivo que usa), y si es de un módulo de referencia o heredado.
4. **Contrastar el enfoque con fuentes externas** (regla 7 de `references/rules.md`): busca en la web lo que el repo no decide, anota alternativas y fuentes, y convierte en preguntas lo que cambie el rumbo.
5. **Ronda de preguntas** (regla 1), incluida la ubicación del spec, los desvíos de buenas prácticas que el diseño vaya a necesitar (regla 5) y **todo cambio sobre un DTO o `*Response` que ya existe**, con sus consumidores ya buscados y las lecturas que no se resuelvan en una sola consulta (regla 9).
6. **`requirements.md`** → commitear (regla 4, commit de los documentos del plan) → entregar → esperar aprobación.
7. **Si el plan toca persistencia: el modelo de datos primero** (`references/data-model-rules.md`): búsqueda de esquemas publicados parecidos, diccionario de datos completo, `diagrams/data-model.mmd` exportado a PNG y PDF → **preguntar con `AskUserQuestion` si el usuario está de acuerdo con el esquema** → corregir y volver a preguntar hasta un "sí" explícito. El resto de `design.md` no se escribe antes.
8. **`design.md`** (con el modelo de datos aprobado, las pruebas end-to-end, sus diagramas de flujo exportados a PNG y PDF, y las alternativas contrastadas; si toca interfaz, con el árbol de componentes, la matriz de estados y las decisiones por pieza de `plan-ui-design`) → commitear → entregar → esperar aprobación.
8b. **Si el plan crea o rediseña una pantalla concreta: ofrecer el mockup HTML.** Con `design.md` aprobado, pregunta con `AskUserQuestion` si el usuario quiere generarlo; si sí, sigue `plan-ui-design/references/mockup-rules.md`, itera con él hasta su visto bueno y commitea. No se escribe `tasks.md` antes.
9. **`tasks.md`** (con las tareas de pruebas y el commit base) → commitear → entregar → esperar aprobación. Cada cambio pedido por el usuario y cada `**Estado:** aprobado` se commitean también, en el repo donde vive el spec. Una vez aprobado, el plan está listo para `plan-implementation`.

Cuando entregues un documento, resume en el chat lo esencial: cuántas historias, la importancia del plan, las decisiones que tomó el usuario y cuántos escenarios de prueba hay, y si se agregaron entradas a `pending-items.md`. No pegues el documento entero.

## Planificar las pruebas end-to-end

### Enumerar los escenarios

"Todos los escenarios posibles" se obtiene de forma sistemática, no por intuición. Recorre estas cinco fuentes para cada historia de usuario:

1. **Cada salida del punto de entrada.** Todo error de la cadena entrada → caso de uso → dominio: uno por cada permiso distinto (403), no encontrado (404), cada conflicto de precondición de estado (409 — cada precondición es un escenario), validación del payload (400: obligatorios, rangos, formatos). Además el camino feliz y **todo lo que persiste o dispara** (entidades que se crean de rebote, auditoría, cambios de estado, eventos, correos).
2. **Cada rama de la interfaz.** Cada condición que muestra u oculta un control (permiso **y** estado), cada validador del formulario, y los estados vacío, cargando y error.
3. **Variantes de datos y actores.** Con todos los permisos, sin el permiso, solo lectura, dueño contra no dueño, sin organización asignada, usuario inactivo, "sobre sí mismo". Y cada estado de la entidad en que la acción aplica o no.
4. **Navegación.** Entrar por URL directa sin permiso, recargar a mitad del flujo, volver atrás.
5. **Aislamiento.** Que la acción afecte solo a la fila o entidad objetivo y no a otras. Por eso los datos sembrados llevan cantidades distintas por estado.

Si un escenario no vale la pena probarlo end-to-end (por ejemplo, porque ya lo cubre una suite de integración y la interfaz no cambia), no lo descartes en silencio: proponlo como exclusión y pregunta.

### Documentarlos en `design.md`

La sección `## Pruebas end-to-end` lleva una **matriz de escenarios**, una fila por escenario:

| ID | HU / criterio | Escenario | Datos sembrados | Acción | Aserción UI | Aserción backend | Spec |
|---|---|---|---|---|---|---|---|
| E2E-1 | HU-2 · c1 | Operador con `USERS.MANAGE` crea un usuario | `admin` (nuevo) | Llenar form + guardar | Fila nueva con el email | `POST` 201 + `GET /users/:id` lo devuelve | `users/create-user.cy.ts` |
| E2E-2 | HU-2 · c1 | Operador sin `USERS.MANAGE` | `read-only` (nuevo) | — | Control positivo visible, botón `not.exist` | — | `users/create-user.cy.ts` |

Debajo de la matriz van:

- **Cobertura:** cada criterio de aceptación de `requirements.md` aparece en al menos una fila. Ninguno queda sin escenario salvo exclusión aprobada, anotada como Decisión.
- **Datos de prueba nuevos:** nombre del escenario/fixture/factory, qué siembra, qué expone y por qué tiene esa forma (control positivo, cantidades distintas).
- **Selectores nuevos** que la interfaz tiene que exponer, con la convención del proyecto (ids de DOM derivados, `data-testid`, roles accesibles). Nunca se selecciona por texto libre si el proyecto tiene otra convención.

### Diagramar los flujos de prueba

La matriz dice **qué** se prueba; el diagrama dice **qué hace una persona, en qué orden, para recorrerlo**. Se deriva de la matriz (la matriz manda: si no coinciden, se corrige el diagrama) y sirve para revisar el diseño y para probar a mano lo construido. **(Decisión del usuario, 2026-11-20.)**

- **Uno por historia de usuario** (o por pantalla si una historia cruza varias), como `docs/specs/<estado>/<slug>/diagrams/plan-<us-n o pantalla>.mmd` en Mermaid `flowchart TD`. El `.mmd` es la única fuente: `design.md` no copia el bloque, muestra la imagen exportada.
- **Forma:** el primer nodo es el punto de partida (actor y datos sembrados); cada nodo rectangular es una **acción del usuario en la interfaz** (abrir, llenar, guardar, recargar, volver); cada rombo es una **condición** que bifurca (permiso, estado de la entidad, dato válido o inválido, lista vacía o con datos); cada **hoja** es lo que se ve en pantalla y termina con su ID (`· E2E-3`). Lo que se verifica solo en el backend queda en la columna de la matriz, no en el diagrama.
- **Cobertura:** cada fila de la matriz aparece en al menos una hoja y ninguna hoja queda sin ID (salvo una exclusión aprobada, marcada `· excluido`). Una rama que no termina en un ID es un escenario que falta en la matriz: se agrega o se pregunta.
- **Exportación:** antes de entregar `design.md`, desde la raíz del workspace:
  ```bash
  bash ~/.claude/skills/plan-implementation/scripts/plan-files.sh diagrams <carpeta-del-spec>
  bash ~/.claude/skills/plan-implementation/scripts/plan-files.sh diagrams-check <carpeta-del-spec>
  ```
  El primero genera al lado de cada `.mmd` un `.png` (escala 2, fondo blanco) y un `.pdf`; el segundo confirma que las imágenes están al día y que los IDs de los diagramas y de la matriz coinciden. El `.mmd`, el `.png` y el `.pdf` **se commitean** con el spec. Si falta `mmdc`, se instala global (`npm i -g @mermaid-js/mermaid-cli`); si Puppeteer no trae su navegador, se apunta a uno existente con `~/.config/mermaid/puppeteer.json` (`{"executablePath": "<ruta>", "headless": "shell"}`).
- **Al cerrar el plan**, `plan-implementation` deriva de estos el **recorrido de prueba** con los datos reales y, si el proyecto usa Cypress, un **video por cada `E2E-n` de interfaz** (ver su paso 6): por eso cada título de test lleva su `E2E-n`.

### Traducirlos en `tasks.md`

Una sección `## N. Pruebas end-to-end` con tareas para: los datos sembrados y su espejo en la suite, los selectores que falten, un archivo de spec por bloque con los IDs E2E que cubre, correr la suite, y confirmar que cada test nuevo **puede fallar** (invertir la aserción una vez). La verificación de cada tarea de prueba es correr su spec, no "probar a mano".

## Planificar las pruebas unitarias

Las pruebas end-to-end no reemplazan a las unitarias: una regla de cálculo, una transformación, un mapper, un store o un cliente de API se protege con un test unitario rápido, y el e2e se reserva para lo que solo se ve de punta a punta. **(Decisión del usuario, 2026-11-20.)**

- **Si el proyecto usa Vitest** (`vitest.config.*` o `vitest` en `package.json`; lo detectas en el paso de convenciones), carga la skill global **`vitest-unit-testing`** al escribir esta sección y úsala para decidir frontera, entorno, mocks y ubicación. Si el proyecto usa otro runner, esta sección se escribe igual con el runner que el repo ya tenga. Si no tiene ninguno, pregunta.
- **`design.md`** lleva una sección `## Pruebas unitarias` con una matriz corta, una fila por unidad con lógica propia (función pura, servicio, store, mapper, cliente): `ID` (`UT-1`…) · unidad (`archivo:línea`) · contrato observable · casos (feliz, bordes, error) · colaboradores que se mockean y cuáles se dejan reales · archivo de test siguiendo la convención del repo. Lo que solo cablea (re-exports, componentes sin lógica) no entra: se dice por qué.
- **Cada escenario e2e que dependa de una regla de cálculo o transformación** referencia el `UT-n` que la cubre, para no probar la misma regla dos veces por la interfaz.
- **`tasks.md`** lleva una sección `## N. Pruebas unitarias` antes de las e2e: una tarea por archivo de test con los `UT-n` que cubre, y la verificación es correr ese archivo (`vitest run <ruta>`), más confirmar que cada test nuevo **puede fallar** (romper la regla una vez).

## Checklist antes de entregar cada documento

- [ ] `requirements.md` tiene su campo `**Importancia:**` (`urgente` / `media` / `baja`) con la Decisión del usuario que la fijó; nunca se asume de oficio.
- [ ] Todo dato técnico lleva su fuente (`archivo:línea`), o viene de una Decisión del usuario.
- [ ] No hay "probablemente", "asumo" ni "debería". No quedan preguntas abiertas que afecten tareas.
- [ ] Cada criterio de aceptación es verificable, y en `design.md` está mapeado a escenarios de prueba (o tiene una exclusión aprobada).
- [ ] Están los caminos de error: cada permiso denegado, no encontrado, conflicto de estado y validación tiene su escenario.
- [ ] Cada historia de usuario (o pantalla) tiene su `diagrams/plan-*.mmd` con su `.png` y `.pdf` exportados, `design.md` los muestra, y `plan-files.sh diagrams-check` pasa: cada E2E de la matriz está en una hoja y ninguna hoja cita un ID inexistente.
- [ ] Si el plan toca persistencia, `design.md` § "Modelo de datos" cumple `references/data-model-rules.md`: esquema vigente citado, diccionario de datos con cada columna marcada uso actual/previsto (y lo descartado con su motivo), restricciones e índices con la consulta que los usa, **ningún grupo de columnas del mismo hecho suelto en el padre** (tabla hija si tiene FKs o se consulta en SQL; JSONB si es descriptivo), estrategia de herencia con sus alternativas, migración reversible, **esquemas de referencia buscados en la web** con URL y fecha, `diagrams/data-model.mmd` con su `.png` y `.pdf` exportados y mostrados, y la **Decisión del usuario que aprobó el esquema** tras preguntarle explícitamente.
- [ ] Cada pieza nueva de `design.md` cita su referencia de patrón (`archivo:línea`) de un módulo de referencia, o una Decisión del usuario si no hay referencia o la referencia es heredada.
- [ ] Cada desvío de DDD o clean code está en "Desvíos aprobados" con su Decisión. Ninguno queda implícito en el diseño.
- [ ] Ninguna función de `design.md` ni del código tiene 2 o más parámetros sueltos ni un tipo inline en la firma: objeto único con `type`/`interface` con nombre.
- [ ] Ningún hook de React recibe un parámetro suelto, ni siquiera uno solo: siempre un objeto con `interface` nombrada (`useDocumentTitle({ screen })`).
- [ ] Ningún nombre de archivo nuevo de `design.md` es camelCase o PascalCase fuera de la excepción de componente/hook único (regla 5 de `references/rules.md`): va en kebab-case.
- [ ] Ningún controller contiene lógica ni validaciones: solo instancia el comando/query y lo ejecuta. Ninguna regla de negocio es una función suelta: son clases con `execute`, inyectadas en el comando.
- [ ] Si el plan tiene API HTTP, `design.md` fija el contrato de errores (envoltorio `{time, status, error:{code, message, status, params}}`, mensajes en inglés) y lista **un `code` único por error** con su `status`, y los escenarios de error comprueban ese `code`.
- [ ] Ningún tipo de respuesta de `design.md` ni del código (`*Response`, `dto/read/`) tiene un campo opcional (`?:`) ni `undefined`: lo que puede faltar es `T | null`, siempre presente.
- [ ] Ningún cambio sobre un DTO o `*Response` que ya existía se dio por hecho: cada uno está en `design.md` § "Contratos modificados" con su shape antes/después, sus consumidores y la Decisión del usuario, y cada consumidor por actualizar tiene su tarea en `tasks.md` (regla 9).
- [ ] Cada DTO y `*Response` nuevo es un contrato concreto: solo los campos que el consumidor necesita, tipos reales, sin envoltorios genéricos, sin modos ni campos que viajen vacíos según la pantalla (regla 9).
- [ ] Cada endpoint de lectura de `design.md` declara la **única** consulta con que se resuelve; si alguno necesita más de una, está informado con su motivo, sus opciones y la Decisión del usuario (regla 9).
- [ ] Ninguna clase se instancia y se usa en la misma expresión (`new X().método()`): siempre va a una variable primero.
- [ ] Ninguna flecha ni `if` va sin llaves y sin `return` explícito.
- [ ] Ningún tipo de `design.md` ni del código es `any`, `unknown` o `never`, salvo los que tienen una Decisión del usuario que los apruebe.
- [ ] En el frontend, cada pantalla o modal nuevo tiene su árbol de componentes y ningún componente del árbol mezcla responsabilidades ni va a pasar del tope de tamaño.
- [ ] En el frontend, ningún componente del árbol que no exista en la librería de UI compartida se dio por creado sin preguntar: está la Decisión del usuario sobre si se agrega a esa librería, se crea local o se incorpora una externa.
- [ ] En el frontend, ningún componente ni hook declara props sueltas que describen una misma cosa (`nextText` + `nextId`, `search` + `onSearch`): van en un objeto tipado (`next: { text, id, disabled }`, `search: { value, onChange }`).
- [ ] Si el plan toca interfaz, `design.md` pasa la **checklist de `plan-ui-design`**: pantalla equivalente citada, una decisión por pieza (reutilizar / extender / crear / mejorar), **matriz de estados** con cada celda cubierta por un escenario end-to-end, movimiento y accesibilidad declarados, ancho mínimo declarado, y ningún valor visual fuera de la escala del proyecto.
- [ ] Ninguna decisión de movimiento quedó sin criterio escrito, y ningún valor traído de una skill de craft (curva, duración, color de ejemplo) entró como literal: va como token del repo (`plan-ui-design/references/craft-skills.md`).
- [ ] Si el plan manda un correo, `design.md` trae su plantilla equivalente citada, la decisión sobre el layout compartido, la **matriz de correos** con sus variantes y los textos exactos (asunto, preheader, cuerpo, CTA) con el origen de cada cadena (`plan-ui-design/references/email-rules.md`).
- [ ] Si el plan modifica un componente de la librería de UI compartida, sus consumidores están **buscados** (`grep` en cada repo que lo usa) y clasificados en hereda / verificar / excluir, con la Decisión del usuario y una tarea por cada "verificar" — igual que un contrato del backend (regla 9).
- [ ] Cada decisión que el repo no cierra se contrastó con fuentes externas (regla 7): `design.md` tiene "Alternativas contrastadas" con URL y fecha, y lo que podría mejorarse está en `pending-items.md` como `Mejora`.
- [ ] Ninguna recomendación del plan está recortada para dar menos trabajo: la opción marcada como preferida es la que más mejora el producto, con su costo a la vista, no la más barata de implementar (regla 8).
- [ ] La deuda, los riesgos y las cosas pendientes vistos hasta ahora están en `pending-items.md` (no en secciones de `design.md`/`tasks.md`), y ninguna tarea corrige deuda fuera del alcance.
- [ ] El cierre de `tasks.md` incluye la tarea del recorrido de prueba (`test-walkthrough.md` con sus diagramas exportados y la línea `🎬` de cada casilla que se grabará), la de videos por caso (`M.2b`, solo si el proyecto usa Cypress y hay casos de interfaz; si no, con el motivo de por qué no aplica), la de `/code-review`, la de revisar/actualizar `pending-items.md` y, como última tarea, la de enumerarlo completo con el usuario en un solo mensaje (alternativas por entrada, la oferta de un plan propio si alguna es compleja, y el plan sin cerrarse hasta que cada entrada tenga respuesta). Ninguna tarea de cierre escribe un archivo con la lista de archivos cambiados.
- [ ] Si el plan crea o rediseña una pantalla, se le ofreció el mockup HTML tras aprobar `design.md` y antes de `tasks.md`; si dijo sí, `mockup/` está en el spec y commiteado.
- [ ] Todo documento del plan creado o modificado quedó commiteado en el repo del spec (por nombre de archivo, sin mezclar código ni `videos/`).
- [ ] Cada sección de `tasks.md` termina en una parada de "revisión del usuario" antes de su commit, y ninguna tarea pide pushear ni abrir PR.
- [ ] `tasks.md` tiene `**Base:**`, verificación estándar con los comandos reales del proyecto, sección de pruebas y una sección de cierre cuya última tarea es el `/code-review` final.
- [ ] `tasks.md` registra, junto a `**Base:**`, que la rama/entorno de implementación y la creación de una rama nueva se decidirán con el usuario antes de tocar código (paso 1 de "Implementar un plan" en `plan-implementation`), no asumidos de antemano.
- [ ] Rutas relativas al repo indicado en la cabecera; idioma, convenciones de i18n y origen de los permisos según el perfil del proyecto.
- [ ] La ubicación elegida para la carpeta del spec es `docs/specs/pending/<slug>/` (ver `references/spec-locations.md`): un spec nuevo siempre se crea ahí.
