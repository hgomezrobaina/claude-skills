---
name: plan-ui-design
model: claude-fable-5-2
description: La pieza de diseño de interfaz de un plan de implementación — cómo se diseña, se documenta y se verifica una pantalla nueva dentro de una app que ya tiene su propio sistema visual y su librería de componentes. Úsala SIEMPRE que un plan (`requirements.md` → `design.md` → `tasks.md`) toque interfaz: una pantalla, un modal, un formulario, una tabla, un estado vacío o de error, un componente de la librería compartida. Se carga junto a `plan-creation` al escribir la sección de interfaz de `design.md`, junto a `plan-implementation` al escribir el código de cada componente, y sola cuando el usuario pide revisar, pulir o mejorar una pantalla existente. Obliga a levantar el sistema vigente del repo con pruebas antes de decidir nada visual, a declarar todos los estados de cada pantalla (carga, vacío, error, sin permiso, extremos de contenido) y cubrirlos en las pruebas, a tratar cada componente de la librería compartida como un contrato cuyos consumidores se buscan y se preguntan antes de tocarlo, a aplicar las reglas verificables de tipografía, espaciado, radios, color, movimiento y accesibilidad al código nuevo, y a no reportar un problema del código existente sin prueba de que es real. Enruta además a las skills globales de craft (`animate`, `choreograph`, `gestures`, `break-ui`, `mobile-native`, `pick-ui-library`, `review-animations`) sin dejar que ninguna pise el sistema visual del repo, deja `hallmark` y `stageshow` fuera de las pantallas del producto, y cubre el diseño de los **correos** del proyecto (plantilla equivalente, matriz de correos, reglas verificables del HTML de correo).
---

# Diseño de interfaz en planes

Esta skill es la parte visual y de interacción de un plan. No reemplaza a nadie: **se carga junto a** `plan-creation` (al diseñar) y `plan-implementation` (al implementar), que son las que mandan en el método, los documentos y las paradas.

Qué resuelve: que una pantalla planificada salga con el aspecto, el comportamiento y los estados que la app ya tiene, en lugar de salir "funcionando" y visualmente a medias. Y que mejorar un componente compartido sea una decisión del usuario con sus consumidores a la vista, no un efecto colateral.

**Modelo:** diseñar e implementar interfaz corre en Claude Fable 5.2, a diferencia del resto de `plan-creation` (Opus 5.5) y `plan-implementation` (Sonnet 5.5). El `model:` del frontmatter solo rige el turno en que esta skill se carga, así que justo al cargarla (planeando la sección de interfaz, o por escribir el código de un componente) revisa el modelo activo y, si no es Fable 5.2, avisa al usuario y sugiere `/model claude-fable-5-2`. Al volver al resto del plan (sección no visual), avisa el regreso al modelo de la skill que llamó (`plan-creation` o `plan-implementation`).

## Regla 0: el sistema de la app manda

El lenguaje visual del proyecto es la fuente de verdad. Estas reglas **no autorizan a rediseñar nada**: llenan los huecos que el repo no decide y detectan la deriva. Un plan de feature nunca introduce otra tipografía, otra paleta, otra escala ni otro sistema de primitivos; si el sistema actual no alcanza, eso se pregunta (regla 1 de `rules.md`).

Orden de precedencia, siempre: **token o componente del repo → la pantalla equivalente que ya existe → las tablas de `references/ui-rules.md`**.

## Los archivos de referencia

| Archivo | Para qué | Cuándo se lee |
|---|---|---|
| `references/ui-evidence.md` | Levantar el sistema vigente del repo con pruebas (tokens, inventario de la librería, pantalla equivalente) y, si hace falta, escribir su `DESIGN.md` | **Antes** de escribir la sección de interfaz de `design.md` |
| `references/ui-rules.md` | Las reglas verificables: tipografía, espaciado, radios, color, estados obligatorios, layout y densidad, formularios, tablas, movimiento, accesibilidad, y los olores que son hallazgo | Al diseñar cada pantalla y al cerrar cada tarea de interfaz |
| `references/ui-findings.md` | Cuándo un problema del código existente es un hallazgo real, y cómo se toca un componente compartido (es un contrato) | Al encontrar algo mejorable, y antes de modificar la librería |
| `references/craft-skills.md` | Qué skill global de craft se carga para cada pieza (movimiento, coreografía, gestos, datos extremos, móvil, elección de librería), con qué precedencia, y qué no autoriza ninguna | Antes de diseñar movimiento o interacción, y antes de escribir cada componente |
| `references/mockup-rules.md` | El mockup HTML opcional: cuándo se ofrece, cómo se genera con los tokens reales y cómo se itera | Con `design.md` aprobado, si el plan crea o rediseña una pantalla, antes de `tasks.md` |
| `references/email-rules.md` | Los correos: la evidencia que se levanta, las reglas verificables del HTML de correo, la matriz de correos y qué va en cada documento | Si el plan crea o cambia un correo, una notificación por correo o el layout que comparten |

No se repite aquí lo que ya fija `~/.claude/skills/plan-creation/references/rules.md`: la componetización extrema, el tope de 80 líneas por componente, las props agrupadas en objetos, buscar en la librería antes de crear y preguntar cuando falta un componente son su **regla 6**, y siguen vigentes tal cual.

## Las skills de craft aportan, no mandan

En la máquina hay skills globales de craft de interfaz: `animate`, `choreograph`, `gestures`, `animation-performance`, `emil-design-eng`, `apple-design`, `break-ui`, `mobile-native`, `pick-ui-library`, `review-animations`, `learn-taste`, `prototype`, `animation-vocabulary`, `ask-sonner`, y las de auditoría `improve-animations`, `find-animation-opportunities` y `remove-animations`. **Se carga la que corresponde a la pieza, en el momento de escribirla**, nunca todas por si acaso.

Entran **por debajo** del sistema del repo: la precedencia pasa a ser **token o componente del repo → la pantalla equivalente → `references/ui-rules.md` → la skill de craft**. Ninguna autoriza, por sí sola, instalar una librería (eso es la regla 6: se pregunta), escribir como literal un valor de sus tablas (una curva o una duración entra como **token** del tema), ni rediseñar algo que ya existe.

`hallmark` y `stageshow` quedan **fuera de las pantallas del producto**: la primera diseña una página o un sitio nuevo y autónomo —y su propia regla es no tocar un diseño que ya existe salvo que el usuario la nombre—, la segunda hace UI falsa para ilustrar marketing, y nada de lo que produce entra en la librería de componentes. Si un plan parece necesitarlas, es una **pregunta al usuario**, no un camino que se toma solo.

El enrutado completo —qué skill para qué situación, qué se toma de cada una y qué no— está en `references/craft-skills.md`.

## Al planificar (con `plan-creation`)

Esto se intercala en el flujo que ya tiene esa skill; no es un flujo paralelo.

1. **Evidencia primero** (paso 3 de su flujo, "Investigar el código"): además de la ruta de la feature, se levanta el sistema visual con `references/ui-evidence.md` — tokens, inventario de la librería compartida, primitivos, iconos, y la **pantalla equivalente** que el diseño va a imitar, citada con `archivo:línea`. Sin esto, lo que venga después es invención.

2. **Decisión por pieza.** Para cada parte de la pantalla, una de cuatro, y la cuarta es nueva:

   | Decisión | Cuándo | Qué exige |
   |---|---|---|
   | **Reutilizar** | El componente de la librería sirve tal cual | Nombrarlo con su ruta y las variantes que usa |
   | **Extender** | Casi sirve: le falta una variante o un estado | Es un cambio de contrato: `references/ui-findings.md` § "Tocar un componente compartido" |
   | **Crear** | No hay nada que sirva | Regla 6: se avisa y se pregunta (librería, local o externa). Nunca en silencio. Si una librería externa podría resolverlo, el candidato concreto sale de `pick-ui-library` (mirando primero el `package.json` del repo) y la Decisión sigue siendo del usuario |
   | **Mejorar** | El que hay está por debajo del estándar (le falta `focus-visible`, no tiene estado vacío, el color es su único indicador) | Hallazgo con prueba. Si entra en el alcance, su tarea; si no, `pending-items.md` |

3. **Matriz de estados** — el artefacto que más errores evita. Una fila por pantalla o región, una columna por estado, y **cada celda dice qué se ve**:

   | Pantalla / región | Cargando | Vacío | Sin resultados (filtro) | Error | Sin permiso | Extremos de contenido |
   |---|---|---|---|---|---|---|
   | Listado de coches | Skeleton de 5 filas | "Aún no hay coches" + botón de alta | "Ningún coche coincide" + limpiar filtros | Mensaje en la tabla + reintentar | El botón de alta no se renderiza | VIN de 17, nombre de 80, precio de 7 cifras |

   Las columnas se adaptan a la pantalla (un formulario tiene `enviando` y `error de envío`; un modal, `cerrando`). **Cada celda de esa matriz se convierte en una fila de la matriz de escenarios end-to-end** de `design.md`: es la misma lista vista desde el otro lado, y es como se garantiza que los estados no se queden sin construir ni sin probar.

   **Los valores de la columna de extremos salen del catálogo de `break-ui`** (nombre larguísimo, email sin puntos de corte, nombre de una letra, campo ausente, cero ítems y miles, texto no latino, emoji, números extremos), con datos plausibles del dominio real y, cuando exista, el límite real del esquema o del contrato. Lo que no se hace es cablear en la app su toggle de datos de demostración: acá esos valores viven en la matriz y en los escenarios end-to-end.

4. **Movimiento y accesibilidad, declarados, no improvisados.** En la sección de interfaz del diseño, dos líneas: qué se anima (con su duración y su token de curva, o **"nada"**, que es la respuesta correcta en lo que se usa cien veces al día) y qué exige la pantalla en accesibilidad (foco, teclado, anuncios, contraste de los estados nuevos). Los valores están en `references/ui-rules.md` §§ 6 y 7. Si hay movimiento de verdad —una entrada, un drawer, varios elementos que se mueven juntos, un gesto—, la decisión se toma con la skill que corresponda (`animate`, `choreograph`, `gestures`) y queda escrita con el criterio aplicado en una línea (*"gate de frecuencia de `animate`: se usa decenas de veces al día → sin animación"*); el enrutado está en `references/craft-skills.md`.

5. **En `requirements.md`**, los criterios de aceptación de las historias que tocan interfaz incluyen los estados y el comportamiento, en lenguaje verificable: *"con el filtro aplicado y sin coincidencias, la tabla muestra el vacío de filtro con la acción de limpiar, no el vacío inicial"*. Un criterio de interfaz que no se puede comprobar mirando la pantalla no es un criterio.

6. **En `tasks.md`**, tres cosas que normalmente faltan:
   - una tarea por **estado** que haya que construir, no una sola tarea "la pantalla" (los estados vacío y de error son los que se olvidan al final);
   - si el plan toca la librería compartida, la tarea de **cada consumidor a verificar**;
   - la **verificación de interfaz** en la verificación estándar de las tareas de UI: además de build, typecheck y lint, la checklist corta de abajo.

7. **Si el plan manda un correo, eso también es interfaz**: se diseña con `references/email-rules.md` — la plantilla equivalente del repo citada con `archivo:línea`, la decisión por pieza sobre el layout compartido (que es un contrato), la **matriz de correos** con sus variantes, los textos exactos (asunto, preheader, cuerpo, CTA) y de dónde sale cada cadena. Que lo envíe el backend o otro equipo no exime de diseñarlo: el diseño va igual, y la implementación al handoff que use el proyecto.

## Al implementar (con `plan-implementation`)

- **Antes de escribir un componente**: abrir su ejemplar (el componente más parecido de la librería) y sus tokens. Se escribe con los tokens y los estilos nombrados del proyecto, nunca con valores literales.
- **Antes de escribir una transición o un gesto**: cargar la skill que corresponde (`animate`, `choreograph`, `gestures`, o `animation-performance` si algo va a tirones) y aplicar su secuencia de decisión **con los tokens del repo**. Si hace falta un valor que el repo no tiene, se agrega como token y se dice; inline no entra.
- **Antes de marcar `[x]` una tarea de interfaz**, la checklist corta:

  - [ ] Todos los estados del componente existen: `hover` (bajo su media query), `active`, `focus-visible` con anillo visible, `disabled` con su motivo a la vista; y si es una vista de datos, `loading`, `empty`, `error`.
  - [ ] Ningún valor fuera de escala: ni tamaño de texto, ni espaciado, ni radio, ni color literal, ni `z-index` arbitrario, ni curva inline.
  - [ ] Solo se animan `transform` y `opacity`, sin `transition: all`, y nada se anima en lo que el usuario repite todo el día.
  - [ ] Teclado completo: se alcanza con `Tab` en el orden visual, `Enter`/`Espacio` activa, `Escape` cierra, y el foco vuelve a su disparador al cerrar una capa.
  - [ ] Los botones de solo icono tienen etiqueta; ningún estado se comunica solo con color; los números de una columna llevan cifras tabulares.
  - [ ] Funciona en el ancho mínimo declarado sin desbordamiento horizontal, y con los extremos de contenido de la matriz de estados.
  - [ ] Los textos salen del sistema de traducción del proyecto, y los que se componen de varios campos los arma el dominio, no el JSX.
  - [ ] Si la tarea es de un correo, pasa además la checklist de `references/email-rules.md` § 4 (previsualizado y mirado, una prueba por variante de la matriz, escapado, imágenes bloqueadas, 320px, asunto y preheader).
- **Al cerrar**, el movimiento del diff pasa además por los diez estándares de `review-animations`, como una entrada más del `/code-review` de cierre. Y toda corrección visual o de movimiento que haga el usuario se convierte en regla con `learn-taste`: la regla se escribe en el perfil del proyecto o en el `DESIGN.md` del repo —nunca en una skill global— y queda como **Corrección** en el documento del spec.
- **Si aparece algo que el diseño no previó** (un estado que nadie pensó, un componente que no encaja), **para y pregunta** — regla 1. Un estado inventado al vuelo es el que después nadie prueba.
- **Verificación visual, si el proyecto tiene suite de navegador**: una captura por estado de la matriz, en los anchos declarados, guardadas en el `handoff/` del spec. Es la única forma de que "el estado vacío quedó bien" sea una afirmación comprobable y no una suposición.

## Al revisar una pantalla existente (sin plan)

Cuando el usuario pide "mejora esta pantalla" sin un spec de por medio:

1. Se delimita **una superficie** (una pantalla o una familia de pantallas de una misma tarea), no el repo.
2. Se traza la ruta renderizada y se levanta la evidencia (`references/ui-evidence.md`).
3. Cada problema pasa la **puerta de prueba** y el pase de falsación de `references/ui-findings.md`. Lo que no pasa, no se reporta.
4. Se entrega la tabla de hallazgos priorizada y se pregunta cuál se arregla. Si alguno es grande, se ofrece convertirlo en un spec propio con `plan-creation`.

## Checklist de interfaz antes de entregar `design.md`

- [ ] La sección de interfaz cita la **pantalla equivalente** que imita (`archivo:línea`) y en qué se aparta de ella.
- [ ] Cada pieza de la pantalla tiene su decisión (reutilizar / extender / crear / mejorar), y toda "crear" o "extender" tiene la Decisión del usuario, nunca un componente dado por hecho.
- [ ] Si se toca la librería compartida: sus consumidores están **buscados** (no supuestos) y clasificados en hereda / verificar / excluir, cada "verificar" con su tarea.
- [ ] Está la **matriz de estados**, y cada celda tiene su escenario en la matriz end-to-end (o una exclusión aprobada).
- [ ] Están declarados el movimiento (o su ausencia) y lo que la pantalla exige en accesibilidad.
- [ ] Está declarado el **ancho mínimo** en que la pantalla tiene que funcionar, y qué hace una tabla densa cuando no cabe.
- [ ] Ningún valor visual del diseño está fuera de la escala del proyecto; ninguno es un literal cuando existe el token.
- [ ] Los hallazgos sobre código existente que no entran en el alcance están en `pending-items.md`, con su prueba; ninguno se "arregla de paso".
- [ ] Toda decisión de movimiento tiene su criterio escrito —o declara que no se anima—, y ningún valor traído de una skill de craft entró como literal: curva y duración son tokens del repo.
- [ ] Si el plan manda un correo, `design.md` trae su **matriz de correos**, los textos exactos con su origen, la plantilla equivalente citada y quién lo implementa (`references/email-rules.md`).
- [ ] Si el plan toca una landing o una ilustración de marketing (territorio de `hallmark` / `stageshow`), está la Decisión del usuario que lo autoriza y declarado qué parte del sistema del repo se respeta igual.
- [ ] Ningún componente nuevo de la librería existe sin poder responder **por qué el sistema actual no lo expresa**.
