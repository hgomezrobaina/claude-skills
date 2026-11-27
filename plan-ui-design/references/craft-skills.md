# Skills de craft de interfaz: cuál se carga y para qué

Son skills globales instaladas aparte (de `emilkowalski/skills`, `Nutlope/hallmark` y `benjitaylor/skills`). Cada una es un cuerpo de conocimiento sobre una pieza concreta del craft: movimiento, gestos, pulido de componentes, datos extremos, móvil, librerías. **Ninguna manda sobre el método ni sobre el sistema visual del repo.**

## Precedencia (extiende la de `ui-rules.md` § 0)

**token o componente del repo → la pantalla equivalente que ya existe → las tablas de `ui-rules.md` → la skill de craft.**

Una skill de craft llena el hueco que el repo no decide y explica *por qué* una decisión es mejor. Nunca autoriza, por sí sola:

- introducir una librería o una dependencia nueva (es la regla 6 de `plan-creation/references/rules.md`: se avisa y lo decide el usuario);
- escribir un valor visual literal porque la skill lo trae en una tabla —una `cubic-bezier`, una duración o un color de sus ejemplos entra al repo **como token del tema**, nunca inline;
- rediseñar nada que ya exista, ni tocar un componente compartido salteando `ui-findings.md` § "Tocar un componente compartido";
- saltarse una parada del método (regla 1: ante cualquier duda se pregunta).

**Se carga solo la que corresponde a la pieza que se está diseñando o escribiendo**, en el momento de escribirla — no todas "por si acaso". Y el guion de "Initial Response" que varias traen (*"I'm ready to…"*) es para cuando el usuario las invoca directo: cargada dentro de un plan, no se imprime esa línea, se usa el contenido.

## Tabla de enrutado

| Situación | Skill | Qué se toma de ella | Qué no se toma |
|---|---|---|---|
| Hay que animar algo nuevo (modal, drawer, toast, dropdown, acordeón, entrada de lista) | `animate` (+ su `RECIPES.md`) | La secuencia de decisión en orden: ¿anima o no (gate de frecuencia) → qué propósito tiene → la herramienta más barata que sirve (transición CSS → `@starting-style` → animación CSS → WAAPI → librería) → qué propiedades → curva y duración → cómo se interrumpe → cómo sale | Sus `cubic-bezier` y duraciones **como literales**: entran como token. Y su permiso implícito de instalar una librería de movimiento |
| Varios elementos se mueven juntos (stagger, entrada de pantalla, cambio de vista en un contenedor, un ítem que se va y los hermanos cierran el hueco) | `choreograph` | El casting (qué se mueve y **qué se queda quieto**), la relación de cada par (juntos / solapado / en secuencia), y la *timeline* que se documenta en `design.md` | Coreografías de más de dos o tres piezas en una pantalla de trabajo diario: `ui-rules.md` § 6 pone el tope |
| Arrastrar, deslizar, sheets, pull-to-refresh, hold-to-confirm | `gestures` (el porqué físico, en `apple-design`) | Las dos fases (seguimiento 1:1 mientras el dedo está abajo, física al soltar), interrumpibilidad, `touch-action`, snap points, y su primera recomendación: usar una solución que ya existe antes de hacerlo a mano | Hacer a mano lo que una librería ya resuelve sin preguntar (regla 6) |
| Una animación que ya existe va a tirones | `animation-performance` | Tabla de síntomas → causa, propiedades compositoras, dónde corre cada técnica, las trampas (`will-change`, animar a través del estado de React), y cómo se diagnostica | Conclusiones sin medir: un "va lento" sin prueba no es hallazgo (`ui-findings.md`) |
| Pulido de un componente: press, hover, origen de un popover, delay de un tooltip, `clip-path`, detalles de arrastre | `emil-design-eng` | El criterio de detalle y el formato de revisión | — |
| La decisión por pieza dio **crear** y quizá lo resuelve una librería | `pick-ui-library` | El candidato para esa tarea concreta (diálogos y popovers, toasts, drawers, OTP, números animados, tablas virtualizadas, drag and drop, estilos por variantes) y qué cubre | La instalación. Primero se mira el `package.json` del repo; si ya hay una equivalente, se usa esa. La Decisión es del usuario (regla 6) |
| Hay que llenar la columna **extremos de contenido** de la matriz de estados | `break-ui` (su `CATALOG.md`) | Los valores peores realistas (nombre larguísimo, email sin puntos de corte, nombre de una letra, campo ausente, cero ítems, miles de ítems, texto no latino, emoji, números extremos) y el arreglo típico de cada rotura (`min-width: 0`, `overflow-wrap: anywhere`, `flex-shrink: 0`) | Su fase de cablear un toggle *"Demo data / Worst case"* en la app: en un plan, cada valor extremo se convierte en **una celda de la matriz de estados y una fila de la matriz end-to-end**, no en código de demostración que después hay que sacar |
| La pantalla se usa con el dedo o en pantalla chica | `mobile-native` | Su baseline (hover que queda pegado, flash de tap, el bug de `100vh`, el zoom al enfocar un input, el notch, el scroll secuestrado) y la exigencia de probar en hardware real | Reescribir el layout de la app para móvil si el plan no lo pide: el **ancho mínimo declarado** manda |
| Al cerrar: revisar el movimiento que se escribió | `review-animations` (+ su `STANDARDS.md`) | Sus diez estándares y los disparadores de escalado, como entrada extra del `/code-review` de cierre | Reabrir decisiones que el usuario ya aprobó en `design.md`: si el estándar choca con la Decisión, se informa, no se cambia solo |
| El usuario pidió auditar el movimiento de un repo, sin plan de por medio | `improve-animations`, `find-animation-opportunities`, `remove-animations` | El inventario y la priorización (son de solo lectura, proponen) | Aplicarlo sin plan: si de ahí sale algo grande, se ofrece convertirlo en spec con `plan-creation`; lo chico, a `pending-items.md` |
| No se sabe cómo se llama el efecto que pidió el usuario | `animation-vocabulary` | El término exacto, para poder preguntar bien | — |
| El proyecto usa Sonner para toasts | `ask-sonner` | Montaje, estilos, posicionamiento y los fallos típicos | — |
| El usuario corrigió una decisión visual o de movimiento | `learn-taste` | El método para convertir la corrección en una regla **con su porqué** | Dónde la escribe: en este método la regla va al perfil del proyecto (`.claude/plans-profile.md` o la skill de proyecto) o al `DESIGN.md` del repo, y la corrección queda además como **Corrección** en el documento del spec. Nunca se edita una skill global |
| El usuario pide ver varias direcciones visuales genuinamente distintas | `prototype` | El arnés de variantes y cómo se promueve la elegida | Usarlo por defecto: en una app con sistema propio, la regla 0 ya decidió casi todo. Es la excepción, y la pide el usuario |

## Lo que queda fuera del producto: `hallmark` y `stageshow`

Las dos son para **superficies de marketing nuevas y autónomas**, no para pantallas de la app:

- **`hallmark`** diseña una página o un sitio nuevo con su propio material (temas, fotografía, *sloplint*). Su propia regla es que **nunca corre sobre un diseño que ya existe salvo que el usuario la nombre** (`/hallmark redesign <ruta>`). En un plan: solo si la pieza es una landing o una página suelta que **no** vive dentro del sistema visual de la app. Si vive dentro, manda la regla 0 y esta skill no entra.
- **`stageshow`** construye UI falsa y creíble para ilustrar (hero, tarjeta de feature, docs) con un cursor animado. Nada de lo que produce entra en la librería de componentes ni se reutiliza como componente real: es una ilustración.

Si un plan parece necesitar una de las dos, **eso es una pregunta al usuario** (regla 1), no un camino que se toma solo. Y su floor nunca sustituye los tokens del repo: en una página que igual se publica desde el repo, la escala, la tipografía y el color siguen saliendo del proyecto salvo Decisión del usuario en contra.

## Cómo se cita en los documentos

- **`design.md` § interfaz**: cada animación declarada con su propósito, su duración y su **token** de curva, y, cuando la decisión vino de una skill, una nota de una línea con el criterio aplicado (*"gate de frecuencia de `animate`: el botón se usa decenas de veces al día → sin animación"*). La ausencia de movimiento también se declara.
- **Matriz de estados**: la columna de extremos de contenido sale del catálogo de `break-ui`, con valores plausibles del dominio real, no inventados.
- **`tasks.md`**: una tarea por estado y por variante extrema que haya que construir y probar; si se eligió una librería, su tarea de instalación lleva la Decisión del usuario.
- **`pending-items.md`**: lo que la skill señala del código existente y queda fuera del alcance, con su prueba.
