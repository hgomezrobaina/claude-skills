# Hallazgos de interfaz: cuándo son reales y qué se hace con ellos

Dos regímenes distintos, y confundirlos es el error que convierte un plan de feature en un rediseño que nadie pidió:

| | Código que **este plan escribe** | Código que **ya existe** y el plan solo ve |
|---|---|---|
| Qué se le exige | La checklist completa de `ui-rules.md`, como criterio de aceptación | Nada, salvo que el problema **pase la puerta de prueba** de abajo |
| Si no cumple | Se corrige antes de marcar la tarea | Se reporta; se corrige solo si entra en el alcance y el usuario lo aprueba |
| Dónde se registra | Criterio de aceptación en `requirements.md`, verificación en `tasks.md` | `pending-items.md` (`Deuda` si es deriva del sistema, `Mejora` si es una forma mejor) |

Lo nuevo se escribe bien desde el principio: ahí la checklist no se discute. Lo viejo **no se reescribe porque al agente le parezca mejorable** — esa es la regla 5 de `rules.md` (no corregir deuda fuera del alcance) aplicada a la interfaz.

## La puerta de prueba: tres cosas o no es hallazgo

Un problema en código existente solo se reporta si se cumplen las **tres**:

1. **Contrato.** Hay una decisión vinculante **para esa propiedad y en ese alcance** que la implementación incumple: un token con nombre, la variante de un componente compartido, una guía escrita del repo, o **dos presentaciones de la misma tarea que se contradicen entre sí** (la misma clase de modal con dos radios distintos). *No son contrato*: que se repita, que tenga un nombre parecido, que falte algo, ni "lo normal sería".
2. **Realidad.** El token o el componente que se cita **llega de verdad a esa pantalla** por la ruta que se trazó (import, render, herencia, configuración resuelta). No se comparan cosas de capas distintas.
3. **Una sola corrección.** Existe **una** corrección, y se puede nombrar exactamente: este token, esta variante, este componente, este ejemplar. Si la evidencia admite dos arreglos distintos, o hay que inventar una intención de producto para elegir, **se descarta**.

**Pase de falsación, antes de reportar.** Se vuelve a abrir cada fuente e se intenta tumbar el propio hallazgo. Se borra si: el problema no coincide exactamente con el código citado; la regla no gobierna esa propiedad; hay evidencia de que es deliberado; admite varias correcciones; u otro hallazgo ya describe la misma causa.

**Lo que se puede afirmar leyendo código** es lo que tiene fuente: un token, un tamaño, un color, un espaciado, una variante, un estado que falta, un atributo de accesibilidad ausente. **Lo que exige verlo renderizado** —que la jerarquía no se entiende, que la densidad agobia, que algo no se descubre— no se afirma desde el código: o se mira la pantalla, o se plantea como pregunta.

**Prioridad**, en este orden: confianza en la prueba → impacto para quien usa la app → alcance (cuántas pantallas lo heredan) → coste de arreglarlo. El coste nunca sube un hallazgo de posición, y tampoco lo baja (regla 8 de `rules.md`).

## Formato del hallazgo

Una fila por hallazgo, en el reporte del chat y, si no entra en el alcance, en `pending-items.md`:

| # | Problema | Prueba (`archivo:línea`) | Corrección | Alcance | Confianza |
|---|---|---|---|---|---|
| 1 | El modal de alta usa radio 8 y los demás 16 | `…/CreateCar.tsx:34` vs `--radius-card` en `index.css:117` | Usar el token `--radius-card` | solo esa pantalla | alta |

Si no sobrevive ninguno, se dice: **"sin hallazgos con prueba"**. Es una respuesta válida y mucho mejor que rellenar con impresiones.

## Tocar un componente compartido: es un contrato

**Un componente de la librería de UI es un contrato, igual que un DTO o un `*Response` del backend** (regla 9 de `rules.md`): lo consumen pantallas que el plan no abre, y cambiarlo las cambia a todas. Por eso se trata igual.

- **Se puede cambiar, y a veces es la respuesta correcta**: si al componente le falta un estado, una variante o un estado de accesibilidad, mejorarlo en la librería vale más que envolverlo, duplicarlo o parchearlo en la pantalla. Lo que no se hace es un componente paralelo que haga lo mismo con otro nombre.
- **Nunca sin confirmación.** Añadir una prop, cambiar un valor por defecto, cambiar su espaciado o su radio, añadirle un estado: todo se pregunta antes de escribirlo, con los consumidores ya buscados.
- **Los consumidores se buscan, no se suponen**: `grep -rn '<NombreDelComponente' src` en **cada** repo del workspace que lo use, y se clasifican:

| Consumidor | Qué pasa con él |
|---|---|
| **Hereda** | Recibe la mejora y no hace falta tocarlo (pero se nombra) |
| **Verificar** | Puede verse distinto; hay que mirarlo, y es su propia tarea |
| **Excluir** | Queda fuera a propósito, con el motivo |

- La decisión queda en `design.md`, junto al árbol de componentes, y **cada consumidor a verificar es su propia tarea en `tasks.md`**. Ninguna pantalla se deja roto ni se descubre roto al final.

### Plantilla de un cambio en la librería

Cuando el plan modifica o añade un componente compartido, su bloque en `design.md` lleva esto:

```markdown
### <Componente> (<añadir / extender>)

**Por qué el sistema actual no lo expresa:** <qué se intentó reutilizar y por qué no alcanza>
**Ejemplar que imita:** <archivo:línea del componente más parecido de la librería>
**Cambios por archivo:**

| Archivo | Cambia | Se conserva | Se verifica |
|---|---|---|---|
| `ui/components/X/X.tsx` | <la prop nueva, agrupada en su objeto> | <la API actual, los estados existentes> | <qué se mira para saber que sigue bien> |

**Alcance:** hereda: <lista> · verificar: <lista, cada una con su tarea> · excluir: <lista con motivo>
**Validación:** producto: <la tarea real que tiene que poder hacerse> · interfaz: <estados, extremos de contenido, anchos> · sistema: <que no quede un patrón paralelo> · repo: <comando exacto → resultado esperado>
**Parar si:** <el supuesto que, si cae, obliga a volver a preguntar — p. ej. "si aparece un cuarto consumidor que no hereda">
```

El campo que más trabajo ahorra es **"por qué el sistema actual no lo expresa"**: si no se puede contestar sin dar vueltas, el componente nuevo no hacía falta.
