# Plantillas de spec

Son las secciones que sostienen un plan, más lo que esta skill exige (la matriz de escenarios, `**Base:**` y el reporte de archivos). **Quita las secciones que no apliquen** al proyecto o a la feature: una sección de permisos en un proyecto sin permisos es relleno. No agregues relleno para que "se vea completo".

Idioma: el del proyecto según el perfil (los specs existentes mandan; si no hay, lo que el usuario haya decidido). Eso cubre la prosa de los documentos, nunca los nombres: el `<slug>` del plan, los nombres de los tests unitarios, los de los tests end-to-end y los mensajes de commit van siempre en inglés. Los identificadores de código van tal cual (`User.hasPermission`), nunca traducidos. Prefiere tablas cuando hay más de tres elementos paralelos (endpoints, permisos, riesgos).

---

## requirements.md

```markdown
# Requisitos — <Nombre de la feature>

**Estado:** borrador
**Fecha:** AAAA-MM-DD
**Importancia:** urgente / media / baja — Decisión (usuario, AAAA-MM-DD)
**Repos afectados:** <repo> (<qué hace ahí>) — <otros repos: se modifican / solo se consumen>
**Spec relacionado:** [<slug>](<ruta relativa>/requirements.md) — <extiende / reemplaza la decisión X / depende de>

## Problema

<Qué pasa hoy, con evidencia del código (`archivo:línea`). Qué consecuencia tiene para el usuario.>

## Objetivo

<Una o dos frases: el estado final deseado.>

## Historias de usuario

### HU-1: <Título corto>

**Como** <actor, con su permiso o rol si aplica>, **quiero** <acción>, **para** <beneficio>.

Criterios de aceptación:

- [ ] <Verificable y observable: qué ve o qué persiste, no "funciona bien">
- [ ] <Incluye los casos negativos: sin permiso, estado inválido, validación>

## Reglas de negocio

1. <Regla numerada, con su fuente en el código o su Decisión del usuario>

## Permisos / roles

| Permiso | Uso |
|---|---|
| `<clave, con su origen>` | <qué habilita> |

## Fuera de alcance

- **<Cosa>.** <Por qué queda fuera o dónde se hará.>

## Decisiones del usuario

- **Decisión (usuario, AAAA-MM-DD):** <pregunta resumida> → <respuesta>.

## Preguntas abiertas

<Solo temas que el usuario decidió postergar explícitamente. Si no hay: "Ninguna.">
```

---

## design.md

```markdown
# Diseño — <Nombre de la feature>

**Estado:** borrador
**Requisitos:** [requirements.md](./requirements.md)
**Repo:** <repo base de las rutas de este documento> — <aclaración de rutas si hace falta>

## Enfoque

<La idea central y por qué, en uno a tres párrafos.>

## Modelo de datos

<!-- Solo si el plan crea o cambia persistencia; reglas en `data-model-rules.md`. Se escribe y se
     aprueba ANTES que el resto de este documento. Si no toca persistencia: "No cambia el esquema." -->

**Esquema vigente:** motor <motor y versión> · ORM/migraciones <herramienta> · modelos `<archivo:línea>` · última migración `<archivo>`.

![Modelo de datos](./diagrams/data-model.png)

[PDF](./diagrams/data-model.pdf) · [fuente](./diagrams/data-model.mmd) <!-- y data-model-before.* si modifica tablas -->

### Diccionario de datos

#### `<tabla>` (nueva / modificada)

<Para qué existe, volumen esperado y crecimiento.>

| Columna | Tipo | Nulo | Default | Restricciones | Índice | Uso | Origen del dato |
|---|---|---|---|---|---|---|---|
| `id` | `<uuid/bigint>` | no | `<gen>` | PK | PK | actual | sistema |
| `<columna>` | `<tipo>` | no | — | `UNIQUE (<…>)` | `ix_<…>` | **previsto**: <estadística / funcionalidad que lo justifica> | <API de la fuente · campo> |

Datos de la fuente que **no** se guardan: <campo — motivo (tamaño, privacidad, términos de uso)>.

### Relaciones, restricciones e índices

| Relación / índice | Definición | `ON DELETE` / consulta que lo usa | Por qué |
|---|---|---|---|

### Herencia / polimorfismo

| Opción | Cómo queda | Ventajas | Costos | Elegida |
|---|---|---|---|---|
| Una tabla | … | … | … | |
| Tabla por clase | … | … | … | ✓ Decisión (usuario, AAAA-MM-DD) |
| Tabla concreta | … | … | … | |

Cómo se garantiza que cada fila base tenga exactamente una hija: <…>.

### Migración

<Pasos (expand → backfill → contract si hay datos), reversibilidad, bloqueo esperado, backfill.>

### Esquemas de referencia

| Referencia | URL · fecha | Qué se tomó | Qué se descartó y por qué |
|---|---|---|---|

**Aprobación del esquema:** Decisión (usuario, AAAA-MM-DD) — <"de acuerdo" tras la pregunta explícita, con los cambios pedidos si los hubo>.

## <Capa de servidor / API> (<ya existe / cambios>)

| Endpoint u operación | Permiso | Uso |
|---|---|---|
| `METHOD /ruta` | `PERMISO` | <para qué> |

Contratos confirmados (`<archivo>:<líneas>`):

    <payload de request y de response, tal como los define el código>

Consulta de cada lectura (regla 9: un `GET`, una sola consulta):

| Endpoint | Consulta única | Tablas / joins | Filtros · orden · paginación | Agregados en el motor |
|---|---|---|---|---|
| `GET /ruta` | sí / **no** (ver Decisión) | <tablas y joins> | <filtros, orden, page/pageSize> | <conteos, sumas> |

## Contratos modificados

<!-- Regla 9: todo DTO o `*Response` que ya existía y el plan cambia, aditivo o rompedor, con la
     Decisión del usuario que lo aprobó. Si no hay: "Ninguno." -->

| Contrato (`archivo:línea`) | Antes | Después | Consumidores a actualizar | Decisión |
|---|---|---|---|---|
| `<CarResponse>` (`<archivo:línea>`) | `<campo: tipo>` | `<campo: tipo>` | `<repo/archivo>`, `<spec e2e>`, `<suite http>` | Decisión (usuario, AAAA-MM-DD) |

Errores relevantes (de la cadena entrada → caso de uso → dominio):

| Status | Mensaje o código exacto | Origen | Cuándo |
|---|---|---|---|
| 409 | `entity-cannot-be-validated` | `validate-entity.ts:42` | <precondición> |

## <Interfaz / cliente>

### <Módulo o componente>

<Cambios con rutas de archivo, fragmentos de código cuando aclaran, y tablas de archivos nuevos.>

Árbol de componentes (uno por pantalla o modal nuevo; regla 7):

    <Pantalla>/<Pantalla>.tsx                     → hooks/use<Pantalla>.tsx
    ├── components/<Encabezado>/<Encabezado>.tsx
    ├── components/<Lista>/<Lista>.tsx
    │   └── components/<Fila>/<Fila>.tsx           → hooks/use<Fila>.tsx
    └── components/<EstadoVacio>/<EstadoVacio>.tsx

<!-- Las tres tablas siguientes son de `plan-ui-design`; van en todo plan que toque pantallas.
     Si el plan no toca interfaz, se omiten junto con esta sección. -->

Decisión por pieza (reutilizar / extender / crear / mejorar):

| Pieza de la pantalla | Componente que la resuelve | Variantes y estados que usa | Decisión |
|---|---|---|---|
| <Filtros> | `<Componente>` (`<ruta de la librería>`) | <variante, estados> | reutilizar |
| <Fila> | — | — | **crear** — Decisión (usuario, AAAA-MM-DD): <librería / local / externa> |

Matriz de estados (cada celda dice **qué se ve**, y cada una tiene su fila en la matriz end-to-end):

| Pantalla / región | Cargando | Vacío | Sin resultados (filtro) | Error | Sin permiso | Extremos de contenido |
|---|---|---|---|---|---|---|
| <Listado> | <skeleton de n filas> | <mensaje + acción> | <mensaje + limpiar filtros> | <mensaje + reintentar> | <qué no se renderiza> | <textos largos, cifras grandes> |

**Sistema visual:** pantalla equivalente que imita `<archivo:línea>`, y en qué se aparta. Tokens no obvios que usa: <densidad, radios anidados, color de estado>. Ancho mínimo en que funciona: <px>, y qué hace la tabla cuando no cabe.
**Movimiento:** <qué se anima, con qué duración y qué token de curva — o "nada">.
**Accesibilidad:** <foco, teclado, anuncios, contraste de los estados nuevos>.

Cambios en la librería de UI compartida (si los hay; es un contrato, como los del backend):

| Componente | Cambia | Se conserva | Consumidores: hereda / verificar / excluir | Decisión |
|---|---|---|---|---|
| `<ui/components/X>` | <la prop nueva, agrupada> | <API y estados actuales> | <listas, cada "verificar" con su tarea> | (usuario, AAAA-MM-DD) |

## Patrones de referencia

Cada pieza nueva imita código existente del mismo repo (regla 6).

| Pieza nueva | Imita a | Por qué esa referencia |
|---|---|---|
| `<ruta nueva>` | `<archivo:línea>` | <misma forma; módulo de referencia / heredado con Decisión> |

## Desvíos aprobados

Malas prácticas de DDD o clean code que el diseño acepta, cada una con su Decisión. Si no hay: "Ninguno."

| Desvío | Dónde | Por qué se acepta | Alternativa descartada | Decisión |
|---|---|---|---|---|

## Alternativas contrastadas

<!-- Regla 8: lo que se buscó fuera del repo para cuestionar este diseño. Una fila por decisión
     que el repo no cierra. Sin esta sección, el diseño no se entrega. -->

| Decisión | Alternativa considerada | Fuente (URL · fecha) | Por qué se descartó |
|---|---|---|---|
| <qué se eligió> | <la otra opción> | <enlace · AAAA-MM-DD> | <motivo, o Decisión del usuario> |

## Pruebas end-to-end

**Dónde:** <ruta de la suite> — **framework:** <el del proyecto>

### Matriz de escenarios

| ID | HU / criterio | Escenario | Datos sembrados | Acción | Aserción UI | Aserción backend | Spec |
|---|---|---|---|---|---|---|---|
| E2E-1 | HU-1 · c1 | ... | ... | ... | ... | ... | `<dominio>/<feature>.<ext>` |

### Flujos de prueba

<!-- Uno por HU o pantalla. Fuente: diagrams/plan-*.mmd; imágenes con `plan-files.sh diagrams`.
     Acciones = rectángulos, condiciones = rombos, hojas = lo que se ve + `· E2E-n`. -->

#### HU-1 — <título>

![Flujo de prueba HU-1](./diagrams/plan-us-1.png)

[PDF](./diagrams/plan-us-1.pdf) · [fuente](./diagrams/plan-us-1.mmd)

### Cobertura

| Criterio | Escenarios |
|---|---|
| HU-1 · c1 | E2E-1, E2E-2 |

Exclusiones aprobadas: <ninguna / lista con su Decisión>.

### Datos de prueba nuevos

| Escenario / fixture | Siembra | Qué expone | Por qué esta forma |
|---|---|---|---|

### Selectores nuevos

| Selector | Componente | Derivado de |
|---|---|---|

## Deuda, riesgos y pendientes

Viven en [pending-items.md](./pending-items.md), no aquí. Referencia solo los IDs que condicionan el diseño (`P-n`).

## Decisiones

- **<Decisión>**: <por qué, y alternativa descartada>. <(usuario, AAAA-MM-DD) si la tomó el usuario>
```

---

## tasks.md

```markdown
# Tareas — <Nombre de la feature>

**Diseño:** [design.md](./design.md)
**Progreso:** 0 / N
**Base:** <salida de `plan-files.sh base`: repo@sha por cada repo que se toca>
**Rama:** <rama/entorno elegido por repo para implementar (rama nueva creada, o la rama/entorno en que ya estaba parado) — Decisión (usuario, AAAA-MM-DD)>

> Marca `[x]` apenas la tarea esté verificada, no al final de la sesión.
> Este archivo es el estado real del trabajo.

Verificación estándar tras cada tarea de código (salvo que la tarea diga otra cosa):
<comandos exactos del proyecto, por repo — p. ej. build, typecheck y lint de los archivos tocados>
+ relectura de lo escrito contra su referencia de patrón (design.md § Patrones de referencia) y contra las reglas 6 y 7: ningún desvío fuera de "Desvíos aprobados", ningún componente con más de una responsabilidad.
En las tareas de interfaz, además, la checklist corta de `plan-ui-design` (todos los estados del componente construidos, ningún valor fuera de escala, solo `transform`/`opacity` animados, teclado y foco completos, etiqueta en botones de solo icono, ningún estado comunicado solo con color, ancho mínimo sin desbordamiento, textos por el sistema de traducción).

## 1. <Bloque lógico> (HU-1)

- [ ] 1.1 <Acción concreta sobre archivo concreto> — *design.md § <sección>*
- [ ] 1.2 ...

## N. Pruebas end-to-end

- [ ] N.1 Datos sembrados `<nombre>` en <donde viven los escenarios/fixtures> + espejo en la suite; reiniciar el entorno de pruebas
- [ ] N.2 Selectores: <lista> en <componente compartido> + el archivo de selectores
- [ ] N.3 `<spec>` — cubre E2E-1..E2E-4
- [ ] N.4 Correr los specs nuevos y la suite completa; confirmar que cada test nuevo falla si se invierte su aserción
- [ ] N.4b <solo si el plan toca interfaz y el proyecto tiene suite de navegador> Captura por cada estado de la matriz de estados, en los anchos declarados, guardadas en `handoff/`
- [ ] N.5 <typecheck de la suite, si el proyecto lo tiene>

## M. Cierre

- [ ] M.1 Lint y formato de cada repo tocado
- [ ] M.2 Revisión final del diff completo contra las reglas 6 y 7 (incluidos los topes de tamaño del frontend); en el reporte, listar cada desvío aprobado y dónde quedó
- [ ] M.2a Recorrido de prueba: `test-walkthrough.md` + `diagrams/walkthrough-*.mmd` con los datos reales (cómo levantar el entorno y sembrar, URL, actor y credenciales por rama), exportados con `plan-files.sh diagrams`; re-exportar los `plan-*.mmd` si el diseño cambió y correr `plan-files.sh diagrams-check`
- [ ] M.2b Revisar y completar `pending-items.md` (deuda, riesgos y pendientes de toda la implementación); resumirlo en el reporte
- [ ] M.3 `/code-review` sobre el diff de cada repo tocado, más búsqueda de `any`/`unknown`/`never` en el diff (cada uno sin Decisión aprobada se corrige o se pregunta), de `type` de literales que deban ser `enum`, y de archivos nuevos o renombrados que no estén en kebab-case fuera de la excepción de componente/hook único (regla 5), más las búsquedas que declare el perfil del proyecto (en Dealernode: `{ es, en }[language]` en vez de `useTranslation`); corregir y volver a verificar los hallazgos reales, y listar en el reporte los que no se corrigen, con el porqué
- [ ] M.4 Actualizar specs relacionados si este reemplaza alguna decisión suya
- [ ] M.5 Enumerar `pending-items.md` completo con el usuario en **un solo mensaje de texto** (no `AskUserQuestion`, no entrada por entrada): las entradas que sigan `abierto`, agrupadas por tipo, cada una con qué es, por qué importa y alternativas concretas de solución (regla 8: la opción recomendada es la que más mejora el producto, con su costo a la vista, nunca la más barata), y cerrar pidiendo la decisión de cada una; si alguna resolución es compleja y amerita un plan propio, preguntar si se arma ahí mismo como un spec nuevo. Anotar cada respuesta como Decisión en `pending-items.md` y actualizar su estado (`decidido`/`resuelto`, o dejarlo `abierto` si el usuario la posterga). **El plan no se cierra hasta que todas las entradas tengan respuesta**: un pedido genérico de commitear o subir no sustituye esta tarea
- [ ] M.6 Revisión del usuario — **parada**: el commit de esta sección se hace solo tras su aprobación
```

---

## pending-items.md

Un solo archivo por spec, en `docs/specs/<slug>/pending-items.md`. Se crea con el primer hallazgo y se actualiza al momento. No se aprueba por documento: lo revisa el usuario. Quita las secciones vacías solo si dejas "Ninguno." en ellas.

```markdown
# Pendientes — <Nombre de la feature>

**Spec:** [requirements.md](./requirements.md) · [design.md](./design.md) · [tasks.md](./tasks.md)
**Actualizado:** AAAA-MM-DD
**Resumen:** <N deuda · N riesgos · N pendientes — N abiertos esperando decisión>

## Deuda

Malas prácticas que ya existían en el código que el plan toca. **No se corrigen en este plan** (regla 6: respetar el alcance). Si no hay: "Ninguna."

| ID | Dónde | Qué es | Cómo se arreglaría | Estado |
|---|---|---|---|---|
| P-1 | `archivo:línea` | ... | ... | abierto |

## Riesgos

| ID | Riesgo | Impacto | Mitigación | Estado |
|---|---|---|---|---|

## Mejoras

<!-- Regla 8: formas mejores de resolver algo, encontradas al contrastar con fuentes externas,
     que no entran en el alcance. -->

| ID | Qué mejoraría | Fuente (URL · fecha) | Qué implicaría | Estado |
|---|---|---|---|---|
| P-N | ... | ... | ... | abierto |

## Pendientes

Trabajo postergado, no verificado o sugerido para un plan futuro. Si no hay: "Ninguno."

| ID | Qué falta | Por qué quedó pendiente | Qué se necesita | Estado |
|---|---|---|---|---|

## Decisiones sobre estas entradas

- **Decisión (usuario, AAAA-MM-DD):** P-n → <qué se decidió>.
```

IDs únicos y correlativos en todo el archivo (`P-1`, `P-2`…), sin importar el tipo. Estados: `abierto` / `decidido` / `resuelto`; las entradas no se borran.

---

Anotaciones que se agregan durante la implementación, en la tarea o sección afectada:

- `**Decisión (usuario, AAAA-MM-DD):** …` — el usuario resolvió una duda.
- `**Corrección AAAA-MM-DD:** …` — algo del plan resultó falso: qué se descubrió, cómo y dónde se corrigió.
- `— **bloqueada** hasta <tarea/condición>` — no se puede verificar todavía.
