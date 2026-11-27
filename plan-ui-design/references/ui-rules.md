# Reglas de interfaz verificables

Cada regla de aquí se escribe para poder **comprobarse en un diff o en pantalla**, no para discutirse. Son las que `plan-ui-design` aplica al diseñar, al implementar y al revisar.

No repiten lo que ya fija `~/.claude/skills/plan-creation/references/rules.md`: la componetización extrema, el tope de 80 líneas, las props agrupadas en objetos, buscar en la librería de UI compartida antes de crear un componente y preguntar cuando falta uno **viven en la regla 6 de ese archivo** y no se duplican aquí. Este archivo cubre lo que la regla 6 no dice: cómo tiene que verse y comportarse lo que se construye.

## 0. Precedencia: el repo manda

1. **Token o componente del repo.** Si el proyecto ya tiene el valor (una variable CSS, una clase de tema, un componente de la librería compartida), se usa ese, aunque no coincida con las tablas de abajo. Las tablas **no autorizan a reescribir el sistema del proyecto**.
2. **El patrón de la pantalla equivalente.** Si una pantalla del mismo tipo ya resolvió el caso (una tabla con filtros, un modal de confirmación, un formulario de alta), la nueva se comporta igual.
3. **Las tablas de este archivo**, solo para lo que el repo no decide todavía, y para detectar deriva: un valor del diff que no esté en la escala del proyecto ni en estas tablas es un hallazgo.

**Nunca se introduce un lenguaje visual nuevo** (otra familia tipográfica, otra paleta, otro radio, otra escala de sombras) dentro de un plan de feature. Si el sistema actual no alcanza, eso es un hallazgo que se pregunta (ver `ui-findings.md`), no una decisión que se toma al escribir el componente.

## 1. Sistema visual

### Tipografía

La escala es cerrada: **cada tamaño de texto es un paso de la escala del proyecto**. Nada de `text-[19px]`, `1.4rem` ni un `font-size` inline. Si un valor cae entre dos pasos, se usa el **inferior**, con su altura de línea.

Escala de referencia (Tailwind, por si el repo no declara una propia) — tamaño / altura de línea en px:

| Paso | px / LH | Paso | px / LH |
|---|---|---|---|
| `text-xs` | 12 / 16 | `text-3xl` | 30 / 36 |
| `text-sm` | 14 / 20 | `text-4xl` | 36 / 40 |
| `text-base` | 16 / 24 | `text-5xl` | 48 / 48 |
| `text-lg` | 18 / 28 | `text-6xl` | 60 / 60 |
| `text-xl` | 20 / 28 | `text-7xl` | 72 / 72 |
| `text-2xl` | 24 / 32 | — | — |

**Estilos nombrados antes que tamaño + peso sueltos.** Un texto no se estiliza repitiendo utilidades en cada elemento: se usa el estilo nombrado del proyecto (una clase o token: `heading-1`, `body-3`, `button-md`, `caption-2`). Los grupos y para qué sirve cada uno:

| Grupo | Para qué | Tamaños típicos |
|---|---|---|
| `heading-1…6` | Títulos de página y de sección | 60, 48, 36, 30, 24, 20 |
| `title-1…5` | Títulos de card, ítems de lista, labels que encabezan un bloque, navegación | 20, 18, 16, 14, 12 |
| `body-1…6` | Texto corrido (dentro de cada tamaño, del peso más fuerte al regular) | 16 y 14 |
| `button-lg/md/sm/xs` | Solo texto dentro de botones | 18, 16, 14, 12 |
| `caption-1…5` | Metadatos, texto de ayuda, badges, marcas de tiempo, letra chica | 14 y 12 |

**El peso de cada grupo lo fija el repo**, no estas tablas: si los títulos del proyecto son `semibold`, todos lo son. Si hace falta un estilo que no existe, se añade **el siguiente número de su grupo** (`body-7`) construido con un paso de la escala; no se inventa un nombre ni un tamaño nuevo.

Reglas de composición del texto:

- Datos numéricos, precios y cualquier columna de números: `tabular-nums` (si no, las cifras bailan al actualizarse).
- Titulares: `text-balance`. Párrafos: `text-pretty`.
- Longitud de línea de texto corrido: **menos de 80 caracteres**.
- En UI densa (tablas, filas, chips), texto que puede desbordar lleva `truncate` o `line-clamp-*`, con el valor completo accesible (tooltip o detalle).
- No se toca el `letter-spacing` salvo pedido explícito.
- `sentence case` en labels, botones y títulos; **nada de MAYÚSCULAS** como recurso de estilo.

### Espaciado

Escala cerrada. Si el repo no declara una, esta: **0, 2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96** px. Un valor intermedio se ajusta al token más cercano; `p-[13px]`, `gap-[7px]` o un `margin` inline son hallazgo.

- El espacio **dentro** de un bloque es siempre menor que el espacio **entre** bloques: si una card tiene 16px de separación interna entre sus elementos, entre cards hay 24 o más. Cuando la separación interna iguala o supera la externa, la agrupación se pierde — es el error de densidad más común y se ve a simple vista.
- La separación se resuelve con `gap` del contenedor, no con `margin` por hijo: así ningún hijo decide su propio espacio y el espaciado no se duplica al reordenar.
- La misma relación entre elementos tiene la misma separación en toda la app: si el label va a 4px de su campo en una pantalla, va a 4px en todas.

### Radios

Escala cerrada: **0, 2, 4, 6, 8, 12, 16, 24, full**. Lo habitual es que el proyecto los tenga por rol (`--radius-card`, `--radius-input`, `--radius-button`): entonces se usa el rol, nunca el valor.

**Radio anidado:** cuando una forma vive dentro de otra y el hueco entre ambas (el padding) es **menor que 32px**, el radio interno es `radio externo − hueco`, y solo se aplica si el resultado es **mayor que 2** (si no, el hijo va cuadrado). Una card de radio 16 con 8 de padding lleva hijos de radio 8. Dos radios iguales anidados se ven mal y es un hallazgo.

### Color

El color se nombra **por rol, nunca por color**: `surface`, `border`, `text`, `icon`, `action`, `overlay`, más su intención (`danger`, `success`, `warning`, `info`). Un token llamado `blue-500` usado directamente en una pantalla es un hallazgo; `action-primary` apuntando a `blue-500` es correcto.

Dos capas:

1. **Paletas crudas**: cada familia (primario, grises, rojo, verde, amarillo) con sus tonos. Las transparencias son su propia familia: un alias no puede añadir opacidad.
2. **Roles**, que son los únicos que la UI referencia, cada uno con sus variantes de estado: `-hover`, `-active`/`-selected`, `-disabled`, `-subtle`, `-inverted`.

Reglas:

- Un hex literal en un componente es un hallazgo: va por token. Un token nuevo se añade a la capa que corresponde, no como valor suelto en la pantalla.
- **Un solo color de acento por vista.** Varios acentos compitiendo dejan la pantalla sin jerarquía.
- **Nada de degradados** en fondos, botones ni overlays, y **nada de `glow`** como señal de que algo es pulsable. La escala de sombras del proyecto es la que hay.
- **Los bordes de una card van completos o no van**: un borde de un solo lado para "separar" es un hallazgo; para separar filas se usa el divisor de 1px con el token de borde.
- **El color nunca es el único portador de información**: todo estado (éxito, error, aviso, activo) lleva además icono, label o peso tipográfico. Un semáforo de colores sin texto no lo entiende quien no distingue esos colores.
- Si el proyecto tiene modo oscuro, cada token nuevo se define en los dos modos en el mismo cambio. Si no lo tiene, no se inventa en un plan de feature.

## 2. Componentes: estados obligatorios

Un componente no está terminado hasta que **todos sus estados están definidos y construidos**. Por tipo:

| Tipo | Estados que exige |
|---|---|
| Cualquier cosa pulsable (botón, fila clicable, chip, tab) | `default`, `hover`, `active`/`pressed`, `focus-visible`, `disabled` |
| Campo de formulario (input, select, textarea, checkbox…) | los cinco de arriba más `filled`, `error`, y `read-only` si aplica |
| Vista de datos (tabla, lista, card, panel, gráfico) | `loading`, `empty`, `error`, `con datos`, y `parcial`/`filtrado sin resultados` cuando tiene filtros |
| Contenedor de flujo (modal, drawer, wizard) | `abriendo`/`abierto`, `enviando`, `error de envío`, `cerrando` |

Reglas por estado:

- **`loading`: skeleton con la forma del contenido real**, no un spinner centrado que tapa la pantalla. El spinner se reserva para acciones puntuales dentro de un control (un botón que envía) o cuando no se conoce la forma del resultado. Lo que ya está en pantalla no se desmonta para mostrar carga: si se recarga una tabla por un filtro, las filas se atenúan o se superpone el skeleton, no desaparece todo.
- **`empty`: explica qué falta y ofrece una sola acción siguiente.** Un panel en blanco, o un "No hay datos" suelto, es un hallazgo. "Sin resultados por el filtro" y "todavía no hay nada" son **dos** estados vacíos distintos: el primero ofrece limpiar el filtro, el segundo ofrece crear.
- **`error`: en el sitio donde ocurrió la acción**, específico, y con reintento si la acción se puede repetir. Un error de un campo se pinta en el campo; un error de una tabla, en la tabla. Un toast global **no puede ser el único canal** de un error que bloquea el trabajo, y nunca se usa `alert()`.
- **`disabled` tiene que explicarse**: si un botón está deshabilitado, el motivo está a la vista (tooltip, texto de ayuda o el propio campo marcado). Un control deshabilitado sin motivo visible es un hallazgo. Se ve deshabilitado (opacidad entre 0.38 y 0.5) **y** lo está de verdad (el atributo, no solo el estilo). **`read-only` no es `disabled`**: un campo de solo lectura se lee con normalidad, se puede copiar y recibe foco; uno deshabilitado, no.
- **`focus-visible`: anillo visible de 2px por fuera del control**, con contraste **≥ 3:1** contra el fondo. Nunca se quita el outline sin un reemplazo visible.
- **`active`: una señal física**, `scale(0.97)` (rango 0.95–0.98) o `translateY(1px)`, con transición de 100–160ms. Un pulsable sin respuesta al clic se siente roto.
- **`hover` solo bajo `@media (hover: hover) and (pointer: fine)`**: en táctil, el hover se queda pegado al tocar.

Botones: cada **tipo** (primario, secundario, terciario, peligro) tiene sus cinco estados definidos por tamaño. El relleno sale de los tokens de `action`, el borde de los de `border`, el texto de los de `text`. Un botón nuevo que no encaje en los tipos existentes es un hallazgo que se pregunta, no un tipo nuevo creado al paso.

Más reglas de componente:

- Toda acción destructiva o irreversible pasa por **confirmación explícita** (el modal de confirmación del proyecto), nunca por el `onClick` directo. Su botón lleva el color de peligro y está **separado físicamente** del primario. Si la operación se puede revertir, se ofrece deshacer en lugar de un segundo diálogo.
- **Avisos (toasts)**: se cierran solos entre 3 y 5 segundos, se anuncian con `aria-live="polite"` y **no roban el foco**. Lo que el usuario necesita releer o accionar no vive en un toast.
- **Respuesta en menos de 100ms** a todo clic o tecla (aunque sea el estado `active`); si la espera pasa de un segundo, entra el skeleton. Nada queda sin acuse de recibo.
- **El hueco del contenido asíncrono se reserva antes de que llegue** (alto, ancho o `aspect-ratio` declarados): la pantalla no puede saltar al terminar de cargar.
- El nombre de una acción es **el mismo en todo su recorrido**: el botón "Publicar" produce el aviso "Publicado". Y está en voz activa, diciendo qué va a pasar ("Guardar cambios", no "Enviar").
- Los botones de solo icono llevan `aria-label` **y** tooltip. Un icono sin etiqueta no se entiende.
- Nunca se bloquea pegar (`paste`) en un campo de texto.
- Nada de enlaces muertos (`href="#"`): o enlaza, o es texto.
- La página o sección actual se indica en la navegación.

## 3. Layout y densidad

- **Escala de `z-index` del proyecto, por nombre.** Un `z-[37]` o un `z-index: 9999` arbitrario es un hallazgo: toda capa tiene su nivel declarado y el orden entre ellas es deliberado. Si el proyecto no tiene escala, una de seis pasos alcanza: contenido `0`, sticky `10`, dropdown `20`, overlay/modal `40`, popover sobre modal `100`, avisos `1000`.
- **Una sola acción primaria por pantalla.** Las demás quedan visualmente subordinadas (secundario, terciario, enlace). Dos botones primarios compitiendo es un hallazgo.
- **Una sola familia de iconos**, un grosor de trazo por nivel, tamaños por token, y nunca `filled` y `outline` mezclados en el mismo nivel. **Un emoji no es un icono.**
- Altura de viewport: `100dvh`/`h-dvh`, no `100vh` (en móvil la barra del navegador se come el `vh`). Los elementos fijos respetan `safe-area-inset-*`.
- Elementos cuadrados con una sola utilidad de tamaño (`size-*`), no ancho y alto por separado.
- **Cada pantalla declara a qué anchos tiene que funcionar** y se comprueba en todos. Los puntos de control habituales son **375 / 768 / 1024 / 1440**, y el mínimo es **375px sin desbordamiento horizontal** (también en horizontal). Una tabla densa necesita decidir explícitamente qué hace en estrecho (scroll horizontal con la primera columna fija, o colapsar a cards): eso se diseña, no se descubre.
- **La navegación está en el mismo sitio en todas las pantallas** y no se mezclan dos niveles del mismo tipo (tabs dentro de sidebar dentro de nav inferior). Desde tres niveles de profundidad hacen falta migas de pan. Un destino al que el usuario no puede entrar se explica, no se esconde.
- **Volver atrás restaura lo que había**: posición de scroll, filtros aplicados y estado de la vista. Al cambiar de ruta, el foco se mueve al contenido principal.
- Texto corrido: cuerpo mínimo **16px en móvil** (por debajo, el navegador hace zoom solo), nunca menos de 12px en ningún sitio, y altura de línea entre 1.5 y 1.75.
- La jerarquía se ve **entrecerrando los ojos**: en cada vista hay un solo elemento dominante y el orden de lectura es evidente. Si todo pesa lo mismo, falta jerarquía.
- Los recursos estructurales (bordes, divisores, numeración, fondos alternos) **codifican información**; si no separan nada real, se quitan.
- El alto de las filas, la densidad y la alineación son consistentes en toda la app: números a la derecha, texto a la izquierda, y la misma columna de acciones en el mismo sitio en todas las tablas.

## 4. Formularios

- Todo campo tiene **label visible** (el `placeholder` no es label) y el `placeholder`, si está, muestra un ejemplo, no la instrucción.
- El texto de ayuda vive **debajo del campo**, siempre presente, y no aparece solo al fallar.
- **Validación al salir del campo** (`blur`) y al enviar, no en cada tecla. El error se muestra junto al campo, dice **qué hay que hacer** ("El VIN tiene 17 caracteres"), no "Campo inválido".
- Al enviar con errores: si hay **uno**, el foco va a ese campo; si hay **varios**, el foco va a un resumen enfocable arriba del formulario, con un enlace por error, y los errores **siguen pintados** en cada campo. Los errores se anuncian (`role="alert"` o `aria-live`).
- El mensaje de error dice **qué pasó, cómo arreglarlo y por dónde salir** (reintentar, editar, pedir ayuda). "Entrada inválida" a secas es un hallazgo.
- **Tipos de campo semánticos** (`email`, `tel`, `number`, `date`) con su `autocomplete`. Los gestores de contraseñas funcionan, se puede pegar, y las contraseñas tienen su botón de mostrar.
- Un formulario largo **autoguarda** o avisa antes de perderse: cerrar un modal con cambios sin guardar pide confirmación.
- Los campos obligatorios se marcan de forma consistente, y se anuncian (`required`/`aria-required`).
- El botón de envío muestra su estado de envío y **queda bloqueado mientras envía** para no duplicar la operación; si está deshabilitado por validación, el motivo está a la vista.
- El orden de los campos sigue el orden mental de la tarea, agrupado por secciones con su título. Nada de dos columnas en un formulario de una sola tarea en pantalla estrecha.
- Un formulario largo no se pierde: si el usuario puede salir a mitad, se decide explícitamente si se guarda el borrador o se avisa antes de salir.
- Lo que el sistema puede saber, no lo pregunta (valores por defecto sensatos, el dato que ya tiene de otra pantalla).

## 5. Tablas y listas

- **Columnas con propósito**: cada una se justifica, y el orden es el de la pregunta que responde la tabla. Las acciones van al final.
- Los números se alinean a la derecha con `tabular-nums` y la misma cantidad de decimales en toda la columna; las unidades y monedas se formatean en el dominio, no en el JSX.
- **El encabezado se queda visible** al hacer scroll (sticky) cuando la tabla pasa de una pantalla.
- Orden, filtros y paginación son **visibles y reversibles**: se ve qué filtro está aplicado y se puede quitar de uno en uno.
- La fila entera es clicable solo si su acción principal es obvia; si no, el enlace está en una celda. Una fila clicable con botones dentro necesita que los botones detengan la propagación.
- **Selección múltiple**: el contador de seleccionados y las acciones en lote aparecen en una barra, no escondidos en un menú.
- Las listas largas no se pintan enteras: desde unos **50 elementos** visibles toca paginar o virtualizar con lo que el proyecto ya tenga.
- La columna por la que se ordena lo declara (`aria-sort`), no solo una flecha pintada.
- **Gráficos**: leyenda visible y cerca, ejes con sus unidades y su granularidad, números y fechas en el formato del idioma activo, y las series distinguibles por algo más que el color (forma, patrón o etiqueta directa). Contraste de los datos **≥ 3:1** contra el fondo. Nada de tartas con más de cinco porciones. Un gráfico siempre tiene su alternativa en texto o tabla, y su tooltip es alcanzable sin ratón. Si falla la carga: mensaje y reintento, no un gráfico roto. Y su estado vacío es "todavía no hay datos" con la guía de qué falta, no unos ejes en blanco.

## 6. Movimiento

**Primero se decide si hay animación, y eso lo decide la frecuencia de uso:**

| Cuántas veces al día lo ve el usuario | Animación |
|---|---|
| Decenas o cientos (atajos de teclado, paleta de comandos, guardar, navegar entre filas) | **Ninguna.** Lo que se repite todo el día tiene que ser instantáneo. |
| Varias veces (abrir un modal, un drawer, un toast, un dropdown) | La estándar del proyecto, corta. |
| Rara vez o la primera (onboarding, un vacío ilustrado, una celebración) | Se permite algo más elaborado. |

Nunca se anima una acción iniciada con el teclado. Nunca se anima algo que el usuario no disparó, salvo que comunique un cambio real (un valor que se actualiza, algo que entra en una lista).

Duraciones, por propósito:

| Qué | Duración |
|---|---|
| Respuesta a una pulsación (`active`, cambio de color) | 100–160ms |
| Tooltip, popover pequeño | 125–200ms |
| Dropdown, select, acordeón | 150–250ms |
| Modal, drawer, panel lateral | 200–300ms |
| Cambio de layout grande (una columna que aparece, una vista que se reorganiza) | hasta 500ms, y solo si ayuda a seguir el cambio |

- **La salida es más rápida que la entrada** (en torno a la mitad). Lento donde el usuario decide, rápido donde el sistema responde.
- **Easing:** lo que entra o sale, `ease-out`; lo que se mueve o deforma dentro de la pantalla, `ease-in-out`; hover y color, `ease`; movimiento constante, `linear`. **`ease-in` no se usa en UI.**
- Las curvas se definen **una vez como tokens del tema** (dos o tres: una de entrada, una de movimiento, y la de un drawer si hay) y se referencian por nombre. Una `cubic-bezier` inline en un componente es un hallazgo.
- **Solo se animan `transform` y `opacity`.** Nunca `width`, `height`, `top`, `left`, `margin` ni `padding`: provocan layout en cada fotograma. `background` y `color` solo en superficies pequeñas.
- **Nunca `transition: all`**: se listan las propiedades.
- Nada entra desde `scale(0)`: se entra desde `scale(0.95)` con `opacity: 0`. El `transform-origin` de un popover es su disparador; un modal centrado, el centro.
- Para lo que se dispara rápido y puede interrumpirse (toasts, toggles, hover), **transiciones**, no `keyframes`: las transiciones se reorientan a mitad de camino.
- Entrada escalonada de una lista: **30–80ms entre ítems**, con la secuencia completa por debajo de 400ms, y **sin bloquear la interacción** mientras corre. Si la lista es larga, se animan los primeros y el resto aparece.
- **Toda animación es interrumpible**: un clic a mitad la cancela y nunca bloquea la entrada. Un cambio de estado rápido reemplaza la micro-interacción anterior, y **el estado final se fija explícitamente: la corrección jamás depende de que llegue un evento `animationend`**.
- Como máximo **uno o dos elementos animados por vista**, y cada animación expresa una causa y su efecto; si solo decora, se quita. Al reemplazar contenido en el mismo contenedor, se cruza (fade), no se mueve. Un modal entra desde su disparador.
- **`prefers-reduced-motion`: menos movimiento, no ninguno.** Se conserva el cambio de opacidad y color, se elimina el desplazamiento y la escala.
- Rendimiento: `will-change` solo mientras la animación corre; las animaciones en bucle se pausan fuera de pantalla; nada de animar `blur()` ni `backdrop-filter` en superficies grandes (y el blur por debajo de 8px); nada de leer `scrollTop` para animar (`IntersectionObserver` o las timelines de scroll); las lecturas de layout se agrupan antes de las escrituras; un `requestAnimationFrame` siempre tiene condición de parada.
- **La herramienta más barata que sirva**, en este orden: transición CSS para hover, press, color y un estado que se controla con una clase → `@starting-style` para una entrada al montar sin estado en JS → animación CSS para movimiento predeterminado que tiene que seguir fluido mientras la página carga → WAAPI para control programático sin librería → librería de movimiento solo cuando hace falta spring, animación de layout, salida real o un valor atado a un gesto. Instalar una librería para un *fade* es un hallazgo (y la librería la decide el usuario, regla 6).
- **Lo que depende de un gesto o se puede interrumpir va con spring**, no con duración fija: una duración obliga a terminar un recorrido que el dedo ya cambió.
- **Porcentajes en `translate()`** antes que píxeles fijos: `translateY(100%)` se mide contra el propio elemento y sigue siendo correcto cuando cambia su contenido.
- **El hover se condiciona**: toda animación de hover va dentro de `@media (hover: hover) and (pointer: fine)`, para que no se dispare al tocar en un teléfono y quede pegada.
- **Nunca se maneja el `transform` de los hijos desde una variable CSS del padre**: recalcula estilos de todos los hijos en cada fotograma. El `transform` se pone en el elemento que se mueve.
- Este bloque es el **suelo verificable**. Cuando hay movimiento de verdad que diseñar, la decisión se toma con la skill de craft que corresponda (`animate`, `choreograph`, `gestures`, `animation-performance`) y se traduce a los tokens del repo: ver `craft-skills.md`.

## 7. Accesibilidad

El suelo, no un extra. Cada punto es verificable:

- **Contraste**: texto normal **≥ 4.5:1**; texto grande (≥ 24px, o ≥ 18px en negrita) y elementos de interfaz (iconos, bordes de campo, anillo de foco) **≥ 3:1**. Si el color de marca no da contraste con texto blanco, se usa un tono más oscuro del rol, no se aclara el texto.
- **Área pulsable mínima de 24×24px CSS** (WCAG 2.2 AA), y **44×44 en lo que se usa con el dedo**: campos, botones de barra inferior, acciones de fila en móvil. El icono puede ser más chico; el área, no. (El 44pt/48dp que piden las guías de iOS y Android es para app nativa; en web el mínimo exigible es 24.)
- **Nombre accesible en todo control**: `aria-label` en los de solo icono, label asociado en todo campo, y texto de enlace que diga a dónde va (nunca "aquí").
- **Teclado**: todo lo pulsable se alcanza con `Tab` en un orden lógico, `Enter`/`Espacio` lo activan, `Escape` cierra lo que se abrió. `tabindex` nunca es mayor que 0. Nada de `div` con `onClick` sin rol ni teclado: se usa el elemento nativo.
- **Foco en capas**: un modal o drawer atrapa el foco mientras está abierto, lo coloca dentro al abrir y **lo devuelve al disparador al cerrar**. El anillo de foco **no puede quedar tapado** por una barra fija, un sticky o un banner: si el elemento enfocado queda debajo de algo, es un hallazgo.
- **El orden de tabulación es el orden visual.** Si no coincide, se arregla el orden del DOM, no con `tabindex`.
- **Todo arrastrar y soltar tiene alternativa**: la misma operación se puede hacer con un clic (menú, botones de mover) y con el teclado. Un reordenamiento que solo existe arrastrando queda fuera del alcance de medio equipo.
- El layout aguanta el **escalado de texto del sistema** y el zoom del navegador al 200% sin romperse ni truncar lo importante.
- **Semántica nativa antes que `role`**: `button`, `a`, `ul/li`, `table/th`, `fieldset/legend`. Si hay `role`, lleva los atributos que ese rol exige. Los niveles de encabezado no se saltan.
- **Formularios**: el error se liga al campo con `aria-describedby`, el campo inválido lleva `aria-invalid`, los obligatorios se anuncian.
- **Cambios que no están donde mira el usuario se anuncian**: `aria-live` para errores y resultados que llegan solos, `aria-busy` o texto de estado en la carga, `aria-expanded` + `aria-controls` en lo que despliega.
- Los iconos decorativos van `aria-hidden`.
- Nada que solo funcione con hover: toda interacción tiene equivalente de teclado.

## 8. Olores: lo que es hallazgo en cuanto se ve

En el diff o en pantalla, cada uno de estos se corrige o se pregunta:

- Un valor fuera de escala: `text-[19px]`, `p-[13px]`, `#3B82F6` inline, `z-[37]`, una `cubic-bezier` inline.
- `transition: all`, `h-screen`, `scale(0)` como entrada, `ease-in`, animar `width`/`height`/`top`/`left`.
- Un componente interactivo sin `focus-visible`, sin `disabled` o sin `active`.
- Una vista de datos sin `empty`, sin `loading` o sin `error` — o con "No hay datos" como único estado vacío.
- Un spinner centrado tapando una pantalla cuya forma se conoce.
- Un botón de solo icono sin etiqueta. Un `div` haciendo de botón.
- Color como único portador de un estado. Un `disabled` sin motivo visible.
- Degradados de fondo, `glow` como afordancia, dos acentos compitiendo, sombras inventadas fuera de la escala.
- Bordes de un solo lado en una card, dos radios iguales anidados, separación interna mayor que la externa.
- Texto en MAYÚSCULAS como estilo, `letter-spacing` tocado sin motivo, números sin `tabular-nums`.
- Una animación que el usuario no pidió en algo que usa cien veces al día.
- Un texto compuesto en el JSX a partir de varios campos (eso lo expone el dominio ya armado) o un literal sin el hook de traducción, si el proyecto es multiidioma.
