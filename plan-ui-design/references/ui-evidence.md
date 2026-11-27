# Evidencia: levantar el sistema vigente antes de diseñar

Aplicar "buen diseño" en una app que ya existe significa aplicar **el diseño de esa app**. Este archivo es el procedimiento para averiguar cuál es, con pruebas, antes de escribir una línea de `design.md`.

Sin este paso, el agente inventa: mete un radio que no está en la escala, un gris que no es ninguno de los seis del tema, un componente que ya existía con otro nombre. Con este paso, cada decisión visual del plan cita de dónde sale.

## 1. Descubrimiento

Se corre una vez por repo de interfaz que el plan toca, y se guarda en el perfil del proyecto para no repetirlo.

**Antes de nada, mira si el proyecto ya se documenta solo.** Si el repo tiene una **página de Foundations** (una ruta de desarrollo que renderiza los tokens resueltos y la galería de componentes con sus estados) o un `DESIGN.md`, esa es la primera parada y responde de un vistazo las dos preguntas que más cuesta contestar leyendo código: qué valores existen de verdad y qué estados tiene cada componente. El perfil del proyecto dice si existe y dónde. Levantar la evidencia a mano es el camino cuando no hay ninguna de las dos.

**Tokens y tema.** Dónde están declarados los valores:

```bash
# hojas de tema y variables
find src -maxdepth 3 -name '*.css' -o -maxdepth 3 -name 'theme.*' -o -maxdepth 3 -name 'tokens.*' | head
grep -rln '@theme\|:root\|--color-\|design-tokens' src --include=*.css | head
# configuración del framework de estilos
ls tailwind.config.* postcss.config.* panda.config.* 2>/dev/null
```

Anota: familias tipográficas y sus pesos, escala de tamaños, escala de espaciado, radios (por valor o por rol: `--radius-card`, `--radius-input`), sombras, paleta con sus nombres, puntos de ruptura, y si hay modo oscuro.

**Librería de componentes compartida.** La que la regla 6 de `rules.md` obliga a mirar antes de crear nada:

```bash
# la carpeta de UI común de la app, con su inventario
ls <ruta de la librería de UI>/components
# y qué hay suelto por dominio que debería estar ahí
grep -rl 'className=.*rounded-\|className=.*shadow-' src --include=*.tsx | head -30
```

Anota el **inventario con una línea por componente**: nombre, para qué sirve, qué variantes y qué estados tiene, y si es el que usan las pantallas nuevas o solo el legacy.

**Primitivos y librerías.** De `package.json`: el sistema de primitivos accesibles (Radix, Base UI, React Aria, Headless UI, MUI…), la librería de animación, la de iconos, la de tablas, la de formularios, la de i18n. **Dos sistemas de primitivos no se mezclan en la misma superficie**: si la pantalla ya usa uno, se extiende ese.

**La pantalla equivalente.** La más parecida a lo que el plan va a construir: la misma clase de pantalla (listado con filtros, formulario de alta, modal de confirmación, detalle con pestañas). Es la referencia de patrón del diseño visual, igual que la regla 5 pide una referencia de patrón para el código. Se cita con `archivo:línea`.

## 2. Ledger de evidencia

Lo descubierto se anota con su prueba. Una fila por decisión que el plan va a usar:

| Rol | Valor | Fuente (`archivo:línea`) | Alcance | Recurrencia | Confianza |
|---|---|---|---|---|---|
| Radio de card | `--radius-card` → `lg` | `src/index.css:117` | toda la app | 40+ usos | alta |
| Alto de fila de tabla | 48px | `ui/components/Table/Row.tsx:12` | tablas del dashboard | 12 tablas | alta |

- **Confianza alta**: el valor está declarado como token o en el componente compartido. **Media**: se repite en varias pantallas pero nadie lo nombró. **Baja**: aparece una vez.
- **Una fuente solo cuenta si la pantalla la carga de verdad** — por `import`, por render, por herencia de CSS o por configuración resuelta. Nombres parecidos, carpetas vecinas y "parece relacionado" no conectan nada. Otra app del workspace, un preview, un registro generado o código legacy que esta pantalla no renderiza **se excluyen**.
- **La repetición no es una decisión.** Un valor repetido en tres pantallas es un hábito, no un token: se puede imitar (confianza media), pero no se cita como si fuera una regla del sistema, y **no se asciende a token dentro de un plan de feature** sin preguntar.
- **La ausencia de documentación no es un hallazgo.** Que el repo no tenga un documento de diseño no es un problema que este plan tenga que arreglar.

## 3. Qué entra en `design.md`

No el ledger completo: su conclusión. En la sección de interfaz del diseño van tres tablas cortas:

**Componentes que se reutilizan** — lo que la regla 6 ya pide, con el dato visual añadido:

| Pieza de la pantalla | Componente que la resuelve | Variante / estados que usa | Hay que tocarlo |
|---|---|---|---|
| Filtros | `Filters` (`ui/components/Filters`) | con chips, estado vacío | no |
| Fila de resultado | — | — | **falta** → Decisión del usuario |

**Tokens y estilos que usa la pantalla** (solo los que no son obvios: densidad elegida, radios anidados, color de estado, anchos de columna).

**Pantalla equivalente que imita** (`archivo:línea`), y en qué se aparta de ella y por qué.

## 4. Documento de diseño del repo (`DESIGN.md`)

Cuando el proyecto no tiene su lenguaje visual escrito en ningún sitio, cada plan vuelve a levantar el inventario desde cero. Escribirlo una vez lo arregla, pero **no es trabajo de un plan de feature**: se ofrece como spec propio y, mientras no exista, queda en `pending-items.md` como `Mejora`.

Si se escribe, estas son sus reglas:

- **Secciones, en este orden y solo si hay evidencia**: `Overview` (el propósito y la dirección que la evidencia demuestra) → `Colors` → `Themes` → `Typography` → `Layout` → `Elevation & Depth` → `Shapes` → `Components` → `Do's and Don'ts`. No se crea una sección por rellenar el formato.
- **Los valores normativos van estructurados** (el frontmatter o un bloque de datos), y la prosa solo explica cómo aplicarlos. Los grupos de tokens son mapas, no valores sueltos: `typography.sans.fontFamily: …`, no `typography.sans: …`. Si el repo declara un solo `--radius`, se documenta ese y **no se derivan** un `sm`, un `md` y un `lg` que nadie definió.
- **Nada de patrones accidentales ascendidos a decisión**: una clase de utilidad repetida, un literal que aparece tres veces o el estilo local de un componente **no** son escalas ni intenciones de producto. Una regla en prosa necesita, para existir: una guía explícita del repo, o un token/variante con nombre, o un componente compartido que usen al menos dos pantallas reales.
- **Un "no hagas" solo se escribe si alguna fuente lo prohíbe.** Lo que al agente le parece mal gusto no entra.
- **Si la implementación contradice la guía escrita**, se documenta la guía y el conflicto se reporta **fuera** del documento (en `pending-items.md`), no como una nota de duda dentro.
- **No se inventa personalidad de marca**, audiencia ni razonamiento emocional. Fuera del `Overview`, cada frase tiene que cambiar una decisión de implementación; si no la cambia, se borra.
- Lo que un documento anterior ya decidió **se conserva**, salvo que el usuario o la evidencia vigente lo reemplacen.

**Mantenerlo vivo es parte del plan**: si un plan añade un componente a la librería compartida, un token nuevo o un estado que antes no existía, actualizar el documento (o el inventario del perfil del proyecto) es una tarea de ese plan, en la misma sección que lo creó.
