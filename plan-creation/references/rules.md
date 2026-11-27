# Reglas compartidas: creación e implementación

Este archivo es el único origen de verdad de las nueve reglas, lo lee tanto `plan-creation` (para escribir `requirements.md`/`design.md` que las respeten) como `plan-implementation` (para escribir código que las siga y para el `/code-review` de cierre). No lo dupliques: si algo cambia, cambia aquí.

## Las nueve reglas que no se negocian

### 1. Nunca asumir: preguntar

El agente **no asume nada** y pregunta ante cualquier duda. El motivo es concreto: un permiso que se copió de un handoff sin confirmarlo obligó a corregir el diseño a mitad de camino. Un plan con un supuesto equivocado produce tareas equivocadas, y eso cuesta mucho más que una pregunta.

Distingue entre dos tipos de duda:

- **Lo que el código responde no se pregunta: se verifica y se cita.** Endpoints, shapes de DTO o payload, permisos que valida un handler, excepciones que lanza, nombres de componentes, firmas de funciones. Léelo y anota `archivo:línea`. Verificar no es asumir.
- **Lo que el código no responde se pregunta siempre.** Intención de negocio, alcance (qué entra y qué no), prioridades, comportamiento deseado cuando hay varias opciones razonables, textos y copy, casos borde que el producto no define, ubicación del spec, si algo se reutiliza o se crea nuevo cuando ambas cosas son válidas, y cualquier contradicción entre lo que pidió el usuario y lo que dice el código.

Cómo preguntar:

- Junta las dudas y hazlas con `AskUserQuestion` (hasta 4 por llamada, con opciones concretas y el porqué de cada una). Si hay más, haz varias rondas.
- **Todas las dudas se cierran antes de escribir el documento.** No se dejan dudas que afecten tareas en "Preguntas abiertas" para seguir adelante. Esa sección solo existe para temas que el usuario decidió postergar de forma explícita, y así se indica.
- Registra cada respuesta donde aplique, como **Decisión (usuario, AAAA-MM-DD):** …, para que quien lea el plan después sepa que no fue una suposición.
- Si al implementar aparece algo que el plan no cubre o que resultó falso, **para y pregunta**. No improvises. Luego anota en `tasks.md` una **Corrección AAAA-MM-DD:** con qué se descubrió y dónde.
- Frases como "probablemente", "asumo que", "debería bastar con" o "si alcanza con" en un borrador son señal de una pregunta que no se hizo. Búscalas antes de entregar.

### 2. Pruebas end-to-end para todo lo que se pueda probar así, cubriendo todos los escenarios

Si una historia de usuario tiene un flujo que el usuario ve o hace, el plan **debe** incluir sus pruebas automatizadas al nivel más externo que el proyecto permita, y deben cubrir **todos** los escenarios posibles, no solo el camino feliz. Cómo enumerarlos está en "Planificar las pruebas end-to-end" (skill `plan-creation`).

Según lo que haya detectado la fase 0:

- **El proyecto ya tiene framework end-to-end** (Cypress, Playwright, Selenium, Capybara…): se usa ese, con sus convenciones de escenarios de datos y de selectores. Si hay una skill del proyecto para esa suite, se usa.
- **Tiene interfaz pero no tiene framework end-to-end montado**: pregúntale al usuario si el montaje va como sección previa de este plan o como un spec propio del que este depende. En cualquier caso, las pruebas del plan se diseñan igual. Si hay otro repo del workspace con la suite ya montada, ese es el patrón a replicar.
- **Sin interfaz** (API, CLI, job, regla de dominio): las pruebas van en la suite de integración del proyecto (HTTP, request specs, `pytest` contra la app real), con el mismo rigor de escenarios.
- **Si una historia no se puede probar así**, el plan lo dice explícitamente y explica por qué. Si queda alguna duda, se pregunta.

### 3. Aprobación por documento

Los documentos se aprueban de a uno. Primero `requirements.md`; con ese aprobado, `design.md`; con ese aprobado, `tasks.md`. Al entregar cada uno, para y espera la aprobación o los cambios del usuario. No escribas el siguiente por adelantado. Cuando el usuario aprueba, cambia el `**Estado:**` a `aprobado`.

### 4. Parar al terminar cada sección: revisar antes de commitear

El plan se ejecuta por secciones (los bloques numerados de `tasks.md`). Al terminar la última tarea de una sección el agente **se detiene**: no abre la siguiente y no commitea. Entrega el resumen de la sección (qué quedó hecho, los archivos que tocó, sacados de `git status`, y el resultado de la verificación) y espera. **(Decisión del usuario, 2026-10-20.)**

El orden es siempre el mismo: terminar la sección → **parar** → el usuario revisa → el usuario da luz verde ("sigue" o equivalente) → el agente **commitea esa sección** → abre la siguiente. Un commit nunca va antes de la revisión, y una sección nueva nunca empieza con la anterior sin commitear.

- **El commit lo hace el agente con la luz verde**, sin pedir otro permiso, y cubre solo lo de la sección revisada. Se añaden los archivos por nombre, nunca con `git add -A` ni `git add .`, para no arrastrar cambios ajenos que ya estaban sucios al empezar. Mensaje convencional **en inglés** (como el `<slug>` del plan y los nombres de los tests, ver Fase 0), con la atribución que corresponda.
- **Si el usuario pide cambios en la revisión**, se corrigen y se vuelve a parar. El commit espera a la aprobación, no a que el código esté "casi bien".
- **Sin petición explícita siguen prohibidos** `push`, `commit --amend`, `stash`, `reset` y `rebase`, y crear PRs. El permiso de commitear no cubre ninguno de ellos. Crear una rama es la única excepción con petición explícita ya incorporada al flujo: se crea si el usuario la elige en la pregunta obligatoria del paso 1 de "Implementar un plan"; fuera de esa respuesta, tampoco se crea una rama sin que el usuario la pida.
- **Si el usuario dijo expresamente que no se commitee nada hasta el final**, manda eso: las secciones se revisan igual, pero todo queda en el working tree.
- Si en algún momento un commit parece necesario fuera de este ritmo (una tarea que pide "commitear", una herramienta que lo sugiere), pregunta antes.

### 5. Imitar el patrón vigente y consultar antes de cualquier mala práctica

El usuario es exigente con el diseño del código. Que compile y pase los tests no alcanza: tiene que parecer escrito por quien escribió el mejor código del repo.

**Antes de escribir cada pieza** (entidad, caso de uso, servicio, controller, componente, hook, service de cliente, test), busca en **ese mismo repo** algo parecido ya resuelto y léelo entero:

- Busca por forma, no solo por nombre: otro caso de uso que haga lo mismo sobre otra entidad, otro modal de confirmación, otra tabla con filtros, otro endpoint de backoffice.
- Imita su estructura de carpetas, nombres de archivo y de clase, firma, manejo de errores, forma de inyectar dependencias y forma de testearlo.
- En `design.md`, cada pieza nueva cita su **referencia** (`archivo:línea`) en la sección "Patrones de referencia". Si no hay nada parecido en el repo, se dice explícitamente y la forma propuesta se consulta.
- Si el perfil del proyecto marca módulos de referencia (los más limpios y recientes) y zonas heredadas, la referencia sale de los primeros. **Si lo más parecido es código heredado con malas prácticas, no se copia en silencio:** pregunta si imitarlo (consistencia local) o seguir el módulo de referencia (patrón objetivo).

**Cualquier cosa que se considere mala práctica de DDD o clean code se consulta antes de escribirla**, aunque el repo tenga precedentes. Al preguntar, explica qué es, por qué se considera mala práctica, la alternativa limpia y su costo, y si el repo ya lo hace en otro lado (`archivo:línea`). Ejemplos, no exhaustivos:

- **Nombres de archivo: kebab-case (`file-name.ts`), siempre.** Todo archivo nuevo o renombrado usa guiones y minúsculas (`build-person-json-ld.ts`, no `buildPersonJsonLd.ts`). Excepción ya asentada en el repo: un archivo que declara un único componente de React o un único hook, cuyo nombre de archivo coincide con el identificador exportado (`Button.tsx` para `export function Button`, `useTheme.tsx` para `export function useTheme`) — ahí se imita ese patrón en vez de forzar kebab-case, porque el nombre de archivo documenta el nombre del componente/hook. Para todo lo demás (utils, mappers, constantes, dominio, servicios, commands, validators, tipos) no hay excepción: si el repo ya tiene archivos en camelCase o PascalCase fuera de esos dos casos, no se imitan — se escribe en kebab-case y la deuda heredada va a `pending-items.md`. En `/code-review` y en la relectura de cada tarea, cualquier archivo nuevo del diff que no sea kebab-case ni caiga en la excepción de componente/hook es un hallazgo que se corrige.
- **Capas:** el dominio importa del framework, del ORM, de infraestructura o de aplicación; la aplicación importa clases concretas de infraestructura en lugar de un puerto; lógica de negocio en controllers, handlers HTTP, componentes o servicios de cliente.
- **Controller delgado:** el controller solo recibe la petición, instancia el comando o la query y llama a su `execute`. **Toda la lógica va en el comando**, incluidas las validaciones (pertenencia a un dealer, existencia, permisos de dominio, estado): el controller no valida, no busca entidades para validarlas ni compara ids. **(Decisión del usuario, 2026-10-06.)**
- **Lógica como clase, no como función:** las reglas y validaciones de negocio (p. ej. `assertBelongsToDealer`) no son funciones sueltas ni helpers exportados. Son clases con un método `execute` que se inyectan en quien las usa (el comando) para poder sustituirlas y probarlas. Si el repo ya tiene una función suelta así, no se copia: se consulta (regla de referencias heredadas) y la deuda va a `pending-items.md`. **(Decisión del usuario, 2026-10-06.)**

  ```ts
  // mal: función suelta, 3 parámetros posicionales, llamada desde el controller
  assertBelongsToDealer(workflow.getDealerId(), dealerId, 'workflow');

  // bien: clase inyectada, usada dentro del comando; un solo objeto tipado
  interface AssertBelongsToDealerProps {
    ownerDealerId: string;
    dealerId: string;
    resource: string;
  }

  @Injectable()
  export class AssertBelongsToDealer {
    execute({ ownerDealerId, dealerId, resource }: AssertBelongsToDealerProps) {
      ...
    }
  }
  ```
- **Modelo:** entidades anémicas cuyo estado se muta desde afuera en lugar de con métodos que protegen sus invariantes; reglas de negocio duplicadas en vez de vivir en un solo lugar; primitivas sueltas donde el repo ya tiene un value object.
- **Mappers puros, sin validación ni efectos secundarios:** un `[Model]Mapper.execute(dto)` convierte datos, nada más. No valida el dto, no decide si un valor es válido o desconocido, y no hace `console.warn`/`console.log`/`console.error` ni ningún otro efecto secundario (logging, métricas, side-effects). Si un valor puede ser inválido o desconocido, el mapper lo mapea igual (tal cual, o a un valor por defecto del propio dominio) y quien necesite advertir o rechazar ese caso es una clase de validación separada, no el mapper. **(Decisión del usuario, 2026-10-22, tras encontrar un `console.warn` por propósito desconocido dentro de `PaymentSplitMapper.execute`.)** En `/code-review` y en la relectura de cada tarea, cualquier `if`/`console.*` dentro de un `*Mapper.execute` del diff es un hallazgo que se corrige.
- **Errores:** `throw new Error(...)` genérico o errores sin tipo donde el repo tiene excepciones de dominio; `catch` vacíos o que se tragan el error. Todo backend con API HTTP sigue además el **contrato de errores** de la sección siguiente.
- **Tamaño y responsabilidad:** clases, funciones o componentes que hacen más de una cosa; agregar endpoints o métodos a un archivo que ya es una "clase dios" en lugar de partirlo.
- **Prohibido `any`, `unknown` y `never`:** ningún código nuevo o modificado declara, anota ni castea con `any`, `unknown` o `never` (tampoco `as unknown as`, `Record<string, any>`, `Promise<unknown>`, `catch (e: unknown)` explícito, genéricos con default `any`, ni `never` puesto a mano en una firma). Se usa el tipo real: la entidad, el DTO, una `interface`/`type` con nombre, un genérico acotado o una unión discriminada. **Si de verdad no hay otra forma** (una librería externa que lo impone, un exhaustive check con `never`, un JSON de entrada antes de validarlo), **se pregunta al usuario antes de escribirlo**, explicando por qué no hay alternativa y qué tipo concreto se intentó; si lo aprueba, queda como Decisión y el uso se acota a la línea mínima. En `/code-review` y en la relectura de cada tarea, cada `any`/`unknown`/`never` del diff sin Decisión aprobada es un hallazgo que se corrige. Vale para todo proyecto TypeScript. **(Decisión del usuario, 2026-10-08.)**
- **Valores constantes: `enum`, nunca `type` de literales:** un conjunto cerrado de valores constantes (pasos de un flujo, estados, modos, tabs, roles, tipos de evento) se declara como `enum`, no como `type X = 'a' | 'b'` ni como objeto `as const`. Se usa el miembro (`SubscribeStep.Plan`), no el string suelto. Los `type` quedan para formas de objeto, props y uniones de tipos que no son valores constantes. Si el repo ya tiene un `type` de literales para algo así, no se imita: se pregunta antes (el patrón vigente no justifica la excepción). Ejemplo: `type SubscribeStep = 'plan' | 'payment'` → `enum SubscribeStep { Plan = 'plan', Payment = 'payment' }`. En `/code-review` y en la relectura de cada tarea, cada `type` de literales del diff es un hallazgo que se corrige. **(Decisión del usuario, 2026-10-09.)**
- **Respuestas de API: ni opcionales ni `undefined`, lo que no viene es `null`:** ningún tipo de respuesta —la clase `*Response` de un backend ni el DTO de lectura (`dto/read/`) de un cliente— declara una propiedad opcional (`campo?: T`) ni una unión con `undefined`. Todo campo está **siempre presente**; si puede no tener valor se declara `campo: T | null` y el servidor lo envía como `null` (en Swagger, `@ApiProperty({ nullable: true })`, no `@ApiPropertyOptional`). El mapper del cliente asigna `campo: r.campo` sin `?? null`, porque el contrato ya lo garantiza. La regla es solo para **respuestas**: un request o un query param sí puede omitir un campo. Si el repo ya tiene respuestas con opcionales, no se imitan: se escribe el tipo nuevo bien, no se toca lo heredado y la deuda va a `pending-items.md` con su conteo. En `/code-review` y en la relectura de cada tarea, cada `?:` o `| undefined` de un tipo de respuesta del diff es un hallazgo que se corrige. **(Decisión del usuario, 2026-10-27.)**
- **Dinero y valores sensibles: siempre con la librería `decimal` del repo (Decimal.js u otra ya instalada), nunca con `number` nativo ni operadores aritméticos directos.** Cualquier cálculo sobre un precio, monto, comisión, descuento, impuesto, saldo o cualquier otro valor monetario o sensible se hace instanciando esa librería (`new Decimal(x).plus(y)...`), nunca sumando/restando/multiplicando/dividiendo `number`s nativos ni redondeando a mano (`Math.round`, `toFixed`). El resultado se formatea o persiste siempre con **2 lugares decimales** (`.toDecimalPlaces(2)` o el equivalente de la librería del repo). Si el repo ya tiene operaciones de dinero con `number` nativo, no se imitan: la pieza nueva se escribe con la librería y la deuda heredada va a `pending-items.md`. Si el repo no tiene aún una librería de este tipo, se pregunta antes de agregar la dependencia. En `/code-review` y en la relectura de cada tarea, cualquier operación aritmética (`+`, `-`, `*`, `/`) del diff sobre una variable o propiedad cuyo nombre sugiera dinero o un valor sensible (`price`, `amount`, `total`, `cost`, `fee`, `balance`, `subtotal`, `tax`, `discount`, `precio`, `monto`, `comisión`, `saldo`...) sin pasar por esa librería es un hallazgo que se corrige. **(Decisión del usuario, 2026-11-05.)**
- **Tipos y legibilidad:** casts forzados, `@ts-ignore`/`eslint-disable`; parámetros booleanos que bifurcan el comportamiento; strings y números mágicos en lugar de constantes o enums; nombres genéricos (`data`, `info`, `handle`, `utils`, `helper`).
- **Parámetros:** toda función o método con **2 o más parámetros** recibe un único objeto, y ese objeto está tipado con un `type` o `interface` con nombre (declarado arriba o en el archivo de tipos del repo), nunca con un tipo anónimo inline en la firma. Vale para hooks, servicios de escritura, commands, validators y cualquier función propia — no solo para las de 3+. Un id de ruta más un DTO (`distributeDealPayment(dealId, paymentId, props)`) también cuenta: los tres van en un objeto. **(Decisión del usuario, 2026-10-06; el umbral bajó de 3 a 2 el 2026-10-22, tras encontrar un service nuevo con `(dealId, paymentId, props)` sueltos.)** En `/code-review` y en la relectura de cada tarea, cada función o método del diff con 2+ parámetros posicionales es un hallazgo que se corrige. **Los hooks y los componentes de React reciben SIEMPRE un objeto, aunque sea un solo dato** (`useDocumentTitle({ screen })`, no `useDocumentTitle(screen)`): el llamador nombra lo que pasa y añadir un segundo dato no cambia ningún llamador. Solo se libran los hooks que no reciben nada (`useModal()`).

  ```ts
  // mal: tipo inline en la firma
  const togglePermission = useCallback(
    ({ permission, checked }: { permission: Permission; checked: boolean }) => { ... },
    [],
  );

  // bien
  interface TogglePermissionProps {
    permission: Permission;
    checked: boolean;
  }

  const togglePermission = useCallback(
    ({ permission, checked }: TogglePermissionProps) => { ... },
    [],
  );
  ```
- **Props privado, no exportado:** en un archivo que declara una sola clase de servicio o de lógica (un
  `*Algorithm`, `*Validator`, un command, cualquier clase con un `execute`/`validate` y nada más público en
  el archivo), la interfaz de sus parámetros se llama siempre `Props` — no `<NombreDeLaClase>Props` — y **no
  se exporta**: nada fuera del archivo la necesita, porque nadie fuera de él construye ese objeto más que
  quien llama a `execute()` con un literal. Es distinto del `type`/`interface` con nombre propio que exporta
  un módulo con varios métodos públicos (`UniformProps`, `NormalProps` de `DistributionModule`, igual que
  `IntProps` de `DatatypeModule`): ahí el nombre evita choques entre los métodos del mismo archivo y la
  interfaz sí es parte de la superficie pública del módulo, así que esos siguen exportados con su nombre
  propio. **(Decisión del usuario, 2026-11-06, visto en `BinomialBtpeAlgorithm`.)** En `/code-review` y en la
  relectura de cada tarea, cada interfaz de parámetros exportada o con el nombre de la clase en un archivo de
  una sola clase de servicio/lógica es un hallazgo que se corrige.

  ```ts
  // mal: nombra la clase, y se exporta sin que nada fuera del archivo la use
  export interface BinomialSampleProps {
    trials: number;
    probability: number;
  }

  export class BinomialBtpeAlgorithm {
    execute({ trials, probability }: BinomialSampleProps): number { ... }
  }

  // bien
  interface Props {
    trials: number;
    probability: number;
  }

  export class BinomialBtpeAlgorithm {
    execute({ trials, probability }: Props): number { ... }
  }
  ```
- **Llaves y `return` explícitos:** ni las funciones flecha ni los `if` van en forma abreviada. Una flecha siempre abre llaves y lleva `return`, aunque el cuerpo sea de una sola línea (`(x) => { return x.id; }`, no `(x) => x.id`), y un `if` siempre abre llaves (`if (a) { return b; }`, no `if (a) return b;`). Vale también para callbacks de `.map`/`.filter`/`useMemo`. **(Decisión del usuario, 2026-10-06.)**
- **Instanciar en una variable:** una clase nunca se instancia y se usa en la misma expresión (`new X(...).execute(...)`), ni dentro de un hook ni dentro de un command o controller. Se guarda en una variable con nombre y luego se invoca el método. Vale para cualquier clase propia con un método de negocio (`execute`, `validate`, `matches`…), no solo para las que se llaman `*Command`. **(Decisión del usuario, 2026-10-06; reconfirmada 2026-10-22 tras encontrarlo en un validator de un hook de frontend — `new PaymentSplitsValidator({...}).validate()`.)** En `/code-review` y en la relectura de cada tarea, cada `new X(...).método(...)` del diff es un hallazgo que se corrige: `git diff <base> | grep -nE '^\+.*new [A-Za-z]\w*\([^;]*\)\.[a-zA-Z]+\('` (heurística de una línea; una llamada multilínea no la detecta, así que la relectura manual sigue haciendo falta). Quedan fuera las librerías externas de encadenado fluido que no son del repo (`new Decimal(x).plus(y).toNumber()`, `dayjs(x).add(1, 'day')`): la regla es sobre clases de dominio propias, no sobre builders de terceros.

  ```ts
  // mal
  new ExecutetestWorkflowCommand(a, b, c).execute({ body, dealerId });

  // bien
  const command = new ExecutetestWorkflowCommand(a, b, c);
  command.execute({ body, dealerId });
  ```
- **Clases de dominio usadas en la interfaz: se editan sobre una copia, con `copy()` y setters; nunca con un `with(patch)`.** Una clase de dominio del frontend que la UI edita (un borrador de formulario, un filtro, un nodo) tiene campos mutables, un método `setX(valor)` por cada propiedad editable y un `copy()` que devuelve una **instancia nueva** igual. El hook o componente copia, cambia la copia con los setters y guarda la copia, para que React vea una instancia distinta: `const next = draft.copy(); next.setNote(note); setDraft(next);`. No se escriben métodos `with({ ...patch })` que construyen una instancia a partir de un `Partial` del propio tipo, ni campos `readonly` que obliguen a reconstruir el objeto en cada cambio. La referencia es la de `StringColumnFilter` / `NumberColumnFilter` / `SelectColumnFilter` (`copy()` + `setMin`/`setValue`…) y `JustificationDraft`. Si el repo ya tiene un `with` en otra clase, no se imita: se pregunta (y la deuda va a `pending-items.md`). **(Decisión del usuario, 2026-10-14.)**

  ```ts
  // mal: with(patch) sobre campos readonly
  setDraft(draft.with({ code, note }));

  // bien: copy() + setters
  const next = draft.copy();
  next.setCode(code);
  next.setNote(note);
  setDraft(next);
  ```
- **Una pantalla, una llamada: prohibido que el cliente haga N llamadas al backend.** Ningún frontend recorre páginas en un bucle, ni pide un recurso por cada id de una lista, ni junta en el cliente lo que son partes de una misma vista (p. ej. pedir el catálogo y, aparte, el estado que decide qué parte de ese catálogo se ofrece). Si lo que una pantalla necesita no cabe en una llamada que ya exista, **el plan incluye la tarea de crear o ampliar el endpoint** que lo devuelva completo y de una sola vez, aunque eso signifique un endpoint nuevo de "opciones" y una respuesta sin paginar. Vale también para una tarea que parece solo de frontend: si lo que hay obliga a N llamadas, se agrega la ruta. Si de verdad no se puede evitar (el backend es de un tercero, o el volumen hace inviable una sola respuesta), se pregunta antes de escribirlo. **(Decisión del usuario, 2026-10-14.)**

  ```ts
  // mal: el cliente recorre las páginas, y además pide por separado el estado
  // que decide qué opciones se ofrecen
  do {
    const page = await getAllDealers({ params: { page, pageSize: 100 } });
    options.push(...page.items);
  } while (page <= totalPages);
  const open = await getOpenRelationships({ dealerId });

  // bien: un endpoint que devuelve la vista completa en una llamada
  // GET /backoffice/dealers/:dealerId/relationships/counterpart-options
  const options = await getCounterpartOptions({ dealerId });
  ```
- **Duplicación:** copiar y pegar algo que ya existe en el repo en lugar de reutilizarlo o extraerlo.
- **Atajos:** dejar `TODO`, código comentado, `console.log`, o desactivar una validación o un test para que pase.

Lo que el perfil del proyecto declara como **convención documentada** del repo (por ejemplo, en su `CLAUDE.md`) no es un desvío: se sigue. Si dudas de si algo es convención o deuda, pregunta.

**El código heredado que se toca se deja como está: se respeta el alcance del plan.** Solo se cambia lo que el plan pide, aunque el archivo tenga malas prácticas al lado. Lo que encuentres va a `pending-items.md` (tipo `Deuda`), con `archivo:línea`, qué es y cómo se arreglaría, tanto si lo ves al diseñar como si aparece al implementar; se repite en el reporte final. La excepción es cuando el cambio pedido no se puede escribir limpio sin tocar esa deuda: eso es un desvío y se pregunta. **(Decisión del usuario, 2026-10-05.)**

Cómo se registra:

- **Al diseñar:** los desvíos que el diseño necesita se preguntan antes de entregar `design.md`. Los aprobados quedan en su sección "Desvíos aprobados", con la Decisión del usuario.
- **Al implementar:** si aparece un desvío que el diseño no tenía, **para, no lo escribas, y pregunta**. Luego anota la Decisión en `tasks.md`.
- **Al cerrar cada tarea**, relee lo que escribiste contra esta regla y contra su referencia antes de marcarla `[x]`.

### Contrato de errores HTTP (vale para toda app que se construya)

Toda API que se planifique responde sus errores con el mismo contrato, el de `chaca-web-server` (`ChacaHttpException` + filtro global) y el de `freestyle-grader` (`backend/src/shared/domain/error/errors.py`, `backend/src/shared/infrastructure/http/error_handlers.py`). Si el repo ya tiene otro formato, **no se imita en silencio**: se pregunta si migrarlo o mantenerlo. **(Decisión del usuario, 2026-10-17.)**

```json
{ "time": "2026-10-17T12:00:00Z",
  "status": 404,
  "error": { "code": "freestyler-not-found",
             "message": "Freestyler not found",
             "status": 404,
             "params": [] } }
```

- **Envoltorio:** `{time, status, error: {code, message, status, params}}`. `time` en ISO-8601 con zona; `status` repetido fuera y dentro de `error` (como chaca). Sin `path`, salvo que el usuario lo pida.
- **`code`: uno por error, propio y único en toda la app.** Es lo que el frontend usa para identificar qué pasó y reaccionar (mostrar un texto, marcar un campo, redirigir) sin leer el mensaje. Kebab-case, estable: cambiar un `code` rompe al cliente. **Un `code` por categoría no sirve** (`validation-error`, `not-found`, `conflict` compartidos por muchos errores): "nombre vacío" y "nombre demasiado largo" son dos errores y llevan dos `code` (`stage-name-empty`, `stage-name-too-long`).
- **Cada error concreto lo declara todo él mismo:** `status`, `code`, `message` y `params` (y las cabeceras que correspondan: `WWW-Authenticate` en 401, `Retry-After` en 429). El manejador global **solo serializa**; no tiene un mapeo por categoría escrito aparte. Las categorías (validación, no encontrado, conflicto, autenticación, límite de uso) son clases base que fijan el `status` y **no definen `code`**, así que un error concreto sin `code` no pasa los tests.
- **`message` en inglés**, claro y sin datos internos, aunque los specs y los comentarios estén en otro idioma. El texto no es la API: el cliente decide qué mostrar según el `code`.
- **`params`: lista de `{name, value}`**, datos para el cliente. Validación: un param por campo (`name` es el campo, `value` el motivo). Límite de uso: `retry_after_seconds`. Cualquier otro error pone aquí lo que el frontend necesite (el máximo permitido, el recurso afectado…). Sin datos que no pueda ver quien llama.
- **Errores del framework** (cuerpo mal formado, parámetro de ruta con tipo incorrecto) pasan por el mismo envoltorio con un `code` que no se confunda con los de dominio (`request-validation-error`), con un param por campo. Los de ruta inexistente o método no permitido derivan el `code` del status (`not-found`, `method-not-allowed`), como el filtro de chaca.
- **Lo imprevisto es un 500 `internal-error`** con mensaje genérico: se registra con traza completa y nunca se expone el detalle. **Nunca** se traga un fallo convirtiéndolo en 400. Un error de dominio que **no declara** status (el 500 por defecto) se trata igual que un imprevisto: se responde `internal-error` y se oculta su mensaje.
- **Un 5xx declarado a propósito sí conserva su `code`.** Cuando el fallo es de un servicio externo del que depende la operación (una API de terceros, un proveedor de pagos, un scraper), una categoría propia lo declara —por ejemplo `UpstreamError` con `502`— y cada error concreto aporta su `code` (`youtube-search-failed`). El cliente necesita distinguir «el proveedor falló» de «no hay resultados» y de «el servidor tiene un bug». La guarda del manejador que oculta detalles mira **solo** el 500 por defecto, no «≥ 500»; y todo error de dominio con status ≥ 500, declarado o no, se registra con nivel `error`. *(Decisión del usuario, 2026-10-17; referencia: `freestyle-grader/backend/src/shared/domain/error/errors.py` y `shared/infrastructure/http/error_handlers.py`.)*
- **Los controllers no escriben `HTTPException` ni `try/except`:** lanzan el error de dominio y el manejador global responde.
- **En `design.md`:** la sección de errores incluye el envoltorio y **una fila por error con su `status`, su `code`, quién lo lanza y cuándo**; los escenarios end-to-end comprueban el `code` concreto, no solo el status.
- **En las pruebas:** un test recorre todos los errores del proyecto y falla si alguno no declara su `code` o si dos lo repiten (en Python, `tests/unit/shared/test_error_codes.py` de `freestyle-grader`; en TypeScript, un `describe` que instancie cada excepción). Un helper de pruebas lee el `error` de la respuesta y comprueba de paso que `time` es válido y que los dos `status` coinciden con el HTTP.
- **En `/code-review` y en la relectura de cada tarea:** un error nuevo sin `code` propio, con `code` copiado de otro, con mensaje que no esté en inglés, o una respuesta de error fuera del envoltorio es un hallazgo que se corrige.

### 6. Frontend: componetización extrema

En el frontend, los componentes son **pequeños, de una sola responsabilidad y legibles de un vistazo**. Cuando algo puede ser un componente, lo es.

- **Un componente, una responsabilidad visual.** Si el JSX tiene partes con nombre propio (encabezado, filtros, lista, fila, tarjeta, pie, acciones, estado vacío, estado de error), cada una es su propio componente.
- **El elemento de un `.map` siempre es un componente.** Lo mismo para un bloque condicional con JSX no trivial (`cond && (<div>…</div>)` de varias líneas) y para cada variante de un `switch` de render.
- **El componente solo renderiza.** El estado, los efectos, las llamadas a servicios, la validación, los toasts y los cálculos viven en su hook (`useX`) u otras capas, según el patrón del repo. Un componente sin lógica se lee de arriba abajo como un árbol.
- **Ubicación por alcance:** un hijo que solo usa un padre vive anidado bajo ese padre; si lo usan dos, sube al ancestro común; si lo usan varios dominios, va a la capa compartida que el repo tenga. Siempre según la convención de carpetas del repo.
- **Antes de crear**, busca en la librería de UI compartida del repo (el módulo de componentes común a toda la app). Si existe algo que sirve, se usa; si casi sirve, se pregunta si extenderlo. **Si no existe nada que sirva, no se crea el componente nuevo en silencio dentro de la pantalla: se avisa al usuario con el nombre del componente que falta y dónde se necesita, y se pregunta qué solución prefiere** (agregarlo a la librería de UI compartida para que quede reutilizable, crearlo local a esta pantalla porque es un caso de uso único, o incorporar una librería externa). La decisión queda anotada en `design.md` junto al árbol de componentes, y si se aprueba agregarlo a la librería compartida, esa alta es su propia tarea en `tasks.md`. **(Decisión del usuario, 2026-10-26.)**
- **Props explícitas y tipadas**, con la convención del repo (interfaz `Props`, desestructuradas). Nada de pasar objetos enteros cuando el hijo usa dos campos, y nada de "prop drilling" profundo sin preguntar por un contexto.
- **Props agrupadas por concepto: un objeto, no props sueltas.** Cuando varias props describen una misma cosa se agrupan en **un único objeto tipado con nombre**, nunca prefijadas ni sueltas: un valor y su cambio (`search: { value, onChange }`, `countries: { values, onChange }`, no `search` + `onSearch`), y todo lo de un botón o de un campo (`next: { text, id, disabled }`, no `nextText` + `nextId` + `nextDisabled`; el patrón ya existe en `close: { text, onClick }`). Vale para las props de un componente, para lo que **devuelve** un hook y para las props de un componente de la librería de UI cuando se le añade una. Al **añadir** una prop a un componente que ya tiene un grupo (p. ej. un `disabled` más al botón principal), entra en ese grupo; si el grupo aún no existe y ya habría dos props del mismo concepto, se crea en ese momento. La señal para detectarlo: dos o más props con el mismo prefijo (`next…`, `on…` junto a la prop que cambian), o un valor con su `onChange` pasados por separado. En `/code-review` y en la relectura de cada tarea, cada caso del diff es un hallazgo que se corrige; si agrupar obliga a tocar pantallas que el plan no toca, se pregunta antes. **(Decisión del usuario, 2026-10-20.)**
- **En `design.md`**, cada pantalla o modal nuevo lleva su **árbol de componentes** (componente → hijos → hook de cada uno, con rutas). Así el usuario aprueba la granularidad antes de que exista el código.
- **Tope de tamaño: 80 líneas por componente**, contando el archivo entero. El perfil del proyecto puede excluir código que el repo exige escribir inline. Pasar el tope obliga a partir el archivo; si no se puede partir sin forzar el diseño, es un desvío y se pregunta. **(Decisión del usuario, 2026-10-05; tope de hooks retirado el 2026-10-26, solo queda el de componentes.)**
- Si al implementar un componente empieza a crecer o a mezclar responsabilidades, **pártelo en ese momento**, no al final.
- **Esta regla dice cómo se parte la interfaz, no cómo se ve.** Lo visual y lo de interacción —el sistema visual vigente del repo y cómo se levanta, la matriz de estados de cada pantalla (carga, vacío, sin resultados, error, sin permiso, extremos de contenido), las reglas verificables de tipografía, espaciado, radios, color, movimiento y accesibilidad, y el tratamiento de un componente de la librería compartida **como un contrato** cuyos consumidores se buscan y se preguntan antes de tocarlo— vive en la skill **`plan-ui-design`**, que se carga junto a esta cada vez que un plan toca pantallas. Lo que esa skill decide queda igualmente en `design.md` y en `tasks.md`; no es un documento aparte.

### 7. Contrastar el diseño con fuentes externas antes de darlo por bueno

Un plan no se entrega solo porque sea coherente con el repo: **se juzga**. Antes de aprobar `requirements.md` o `design.md`, el agente busca activamente en qué se equivoca la idea planteada y si existe una forma mejor, conocida y documentada, de resolver el problema. El repo dice cómo se escribe el código aquí; **no dice si el enfoque es el correcto**. *(Decisión del usuario, 2026-10-20.)*

- **Cuándo es obligatorio buscar en la web.** Siempre que una decisión del diseño no la cierre el propio repo:
  - elegir una librería, un servicio, una imagen de Docker o una versión (¿está mantenida?, ¿está deprecada?, ¿hay una alternativa estándar?);
  - un problema que la industria ya resolvió (consistencia entre una base y un almacén de objetos, idempotencia, paginación, reintentos, caducidad de URLs, subidas de archivos, migraciones con bloqueo, concurrencia);
  - cualquier cosa con implicaciones de seguridad, privacidad o límites (tamaños, topes, metadatos, permisos, contenido que sube un tercero);
  - detalles de un formato, un protocolo o una API ajena (lo que dice la especificación, no lo que uno recuerda);
  - rendimiento y costes a escala, cuando el diseño elige una estrategia entre varias;
  - **todo esquema de datos nuevo o modificado**: se buscan esquemas publicados parecidos (la documentación de la fuente, vocabularios estándar, proyectos reales) y se usan como guía, según `data-model-rules.md` § 4.
- **Cómo buscar.** Consultas concretas y en inglés cuando el tema es técnico; varias búsquedas en el mismo turno. Prioriza documentación oficial, especificaciones y RFC, el código o el changelog del propio proyecto, y por último artículos. **Comprueba la fecha** de lo que encuentres: una respuesta de hace cinco años puede describir una API que ya no existe. Para un dato que decide algo, **dos fuentes independientes**.
- **Qué hacer con lo que encuentres.**
  - Si aparece un enfoque mejor, **para y pregunta** (regla 1) con las dos opciones y el enlace. No cambies el diseño en silencio ni lo dejes como estaba sin avisar.
  - Si lo encontrado **contradice una decisión que el usuario ya tomó**, no la revierta: dilo, cita la fuente y pregunta si la revisa.
  - Si el enfoque sobrevive, queda en `design.md` § **Alternativas contrastadas**: qué se consideró, la fuente con su URL y su fecha, y por qué se descartó. Un diseño sin esa sección es un diseño que nadie cuestionó.
- **Toda mejora posible que no entre en el alcance va a `pending-items.md` como tipo `Mejora`**, con la fuente que la sugiere. Es la parte que más valor deja para después: el plan se cierra, pero la idea no se pierde.
- **También al revisar.** Cuando el usuario pide revisar un plan ajeno o un diseño ya escrito, este trabajo es el centro de la revisión, no un extra. Y en el cierre (`/code-review`), repasa si algo de lo que se encontró cambia lo que se acaba de implementar.
- **Sin acceso a la web no se finge.** Si no hay herramienta de búsqueda disponible, se dice de forma explícita en el documento qué decisiones quedaron sin contrastar, y eso entra en `pending-items.md`.

### 8. Recomendar por mejora del producto, nunca por menor esfuerzo

Cuando el agente **recomienda** entre varias opciones (al preguntar con `AskUserQuestion`, en "Alternativas contrastadas", al decidir si algo entra en el alcance, al sugerir si conviene un refactor), la recomendación se basa en **qué tan buena es la solución para el producto o la funcionalidad**, nunca en qué tan poco trabajo da implementarla. Lo costosa, larga o grande que sea una tarea o un refactor **no es motivo para evitarla, acotarla ni dejarla fuera de la recomendación**. **(Decisión del usuario, 2026-10-22.)**

- **La opción recomendada es la que mejor resuelve el problema del usuario o mejora el producto**, aunque implique reescribir varios módulos, tocar más archivos o agregar más tareas a `tasks.md` que la alternativa más simple.
- El esfuerzo de implementación (tiempo, cantidad de archivos, tamaño del refactor) se puede **mencionar como dato**, para que el usuario decida con información completa, pero nunca se usa como criterio para elegir qué opción marcar como preferida ni para descartar en silencio la mejor solución.
- Esto no contradice la regla 5 (no tocar deuda fuera de alcance) ni la regla 1 (no asumir): si una mejora real requiere ampliar el alcance o tocar código heredado, eso se pregunta explícitamente, presentando la opción completa (la que mejora el producto) como la recomendada, con su costo a la vista, en vez de ofrecer de entrada una versión recortada "para ahorrar trabajo".
- Si el usuario, con el costo ya a la vista, prefiere la opción más barata o más chica, se respeta su decisión y se anota como Decisión; lo que no se negocia es que la primera propuesta del agente **no** nazca ya recortada por ahorrar esfuerzo.

### 9. Contratos del backend y arquitectura de consultas

La forma en que el backend habla con sus clientes a través de los controllers —los DTO de entrada, las clases `*Response` de salida y el DTO de lectura espejo del cliente— es parte del diseño y se juzga como tal. **(Decisión del usuario, 2026-11-05.)**

**Un contrato existente se puede cambiar, pero nunca sin confirmación.** Si el DTO o el `*Response` que ya existe no sirve para lo que el plan necesita, **la respuesta correcta es cambiarlo**, no parchear el cliente, no recalcular en el frontend lo que el servidor debería devolver, ni crear un endpoint paralelo que haga lo mismo con otro shape. Pero **todo cambio sobre un contrato que ya existe se pregunta antes de escribirlo, sea aditivo o rompedor**: agregar un campo, quitarlo, renombrarlo, cambiarle el tipo o la nulabilidad, anidarlo o desanidarlo, cambiar un query param o el status de una respuesta.

- Al preguntar, lleva: qué contrato es (`archivo:línea`), el shape **actual y el propuesto lado a lado**, por qué el actual no alcanza, y **quién lo consume hoy**. Los consumidores se buscan, no se suponen: los otros frontends del workspace, las apps móviles, las suites HTTP del backend, los specs end-to-end y cualquier integración externa. Si alguno vive en un repo que el plan no toca (por ejemplo una app que el perfil del proyecto declara de solo lectura), eso se dice en la pregunta: es justamente lo que el usuario necesita saber para decidir.
- Si lo aprueba, el cambio queda en `design.md` § **Contratos modificados** (antes → después, consumidores, Decisión), y **cada consumidor que haya que actualizar es su propia tarea en `tasks.md`**. Ningún cliente se deja roto ni se descubre roto al correr los tests.
- Si no lo aprueba, el contrato se respeta y la limitación que eso impone al diseño se anota (en `design.md` como Decisión, y en `pending-items.md` como `Mejora` si el contrato debería cambiar más adelante).

**Contratos concretos y mínimos.** Un DTO o un `*Response` es un contrato concreto, no un saco de datos:

- **Exactamente los campos que el consumidor necesita**, con el tipo real (enum, no string suelto; `string` de fecha ISO, no `Date` serializado a medias). Nada "por si acaso", nada que el cliente tenga que interpretar, recomponer o volver a pedir.
- **Plano antes que anidado**, y **un contrato por operación antes que uno polimórfico**: si una misma respuesta sirve a dos pantallas y la mitad de sus campos viaja vacío en cada una, son dos contratos. Dos endpoints explícitos valen más que uno con modos.
- **Sin envoltorios genéricos ni shapes abiertos** (`data: Record<string, …>`, un `payload` cuyo contenido depende de un `type`, un genérico que cada llamada instancia distinto). Si el repo necesita una unión, es una **unión discriminada** con todas sus variantes declaradas.
- **Sin opcionales.** En las respuestas ya es regla (regla 5: lo que puede faltar es `T | null`, siempre presente). En un **DTO de entrada**, cada campo opcional se justifica: si un campo solo aplica a la mitad de los casos, suele ser la señal de que son dos operaciones distintas; si de verdad hace falta, se pregunta antes.

**Cada `GET`, una sola consulta.** Por el bien de la arquitectura, toda petición de lectura se resuelve con **una sola consulta** al motor de datos del proyecto —una sentencia SQL con sus `join`s, una query del ORM con sus relaciones, una agregación de Mongo— y no con N+1, ni con varias consultas que se juntan en memoria, ni con un bucle por cada id de una lista. Es la contraparte de servidor de «una pantalla, una llamada» (regla 5): no sirve esconder las N llamadas del cliente detrás de un endpoint que hace N consultas.

- **En `design.md`, cada endpoint de lectura dice con qué consulta se resuelve**: tablas o colecciones, `join`s, filtros, orden, paginación y los agregados que calcula el motor (conteos, sumas) en lugar del proceso.
- **Si no se puede con una sola, no se improvisa: se informa y lo decide el usuario.** Explica por qué no se puede (el dato vive en otra base o en un servicio externo, el motor no expresa esa agregación, el `join` haría inviable la paginación, el volumen revienta la respuesta), cuántas consultas haría la alternativa, y las opciones concretas (una vista o una consulta nativa, desnormalizar, partir el endpoint, aceptar las N consultas con su costo a la vista). La respuesta queda como Decisión en `design.md`.
- Esto **no autoriza a reescribir lecturas existentes fuera del alcance**: lo que ya hace N consultas y el plan no toca va a `pending-items.md` como `Deuda`, con `archivo:línea` y cómo se arreglaría.

**En `/code-review` y en la relectura de cada tarea:** un contrato existente modificado en el diff sin su Decisión, un `*Response` o DTO nuevo con envoltorios genéricos, campos de más o modos, y un handler de lectura nuevo que dispare más de una consulta (un `await` de repositorio dentro de un `for`/`map`, o dos `find` seguidos para armar una respuesta) son hallazgos que se corrigen.

## Registro de pendientes

Todas las deudas, riesgos y cosas pendientes que aparezcan durante el proceso (al investigar, planificar o implementar) van a **un solo archivo aparte, `pending-items.md`, en la carpeta del spec** (`docs/specs/<slug>/pending-items.md`), para que el usuario los revise sin tener que buscarlos dentro de `design.md`, `tasks.md` ni del chat. **(Decisión del usuario, 2026-10-13.)**

- **Qué entra:**
  - `Deuda`: malas prácticas o código heredado que el plan toca o ve y no corrige (regla 5).
  - `Riesgo`: algo que puede salir mal, con su mitigación.
  - `Mejora`: una forma mejor de resolver algo, encontrada al contrastar el diseño con fuentes externas (regla 7), que no entra en el alcance. Lleva la fuente (URL y fecha).
  - `Pendiente`: trabajo que quedó fuera, se postergó, o no se pudo verificar (tests que no se corrieron, tareas bloqueadas, temas que el usuario decidió postergar, exclusiones de pruebas e2e, ideas para un plan futuro).
- **Cuándo:** se crea con el primer hallazgo (normalmente al entregar `requirements.md` o `design.md`) y se **actualiza en el momento** en que algo aparece, también durante la implementación; no se junta todo para el final. Si al cerrar no hay nada, se deja con "Ninguno." para que se vea que se revisó.
- **Solo ahí:** `design.md` y `tasks.md` no llevan secciones de deuda ni de riesgos. Pueden referenciar un ID (`P-3`), pero el contenido vive en `pending-items.md`. Lo que bloquea una tarea concreta se marca además `— **bloqueada**` en `tasks.md` con el ID.
- **Cada entrada** lleva ID (`P-1`…), tipo, dónde se vio (`archivo:línea` o documento), qué es, impacto, cómo se resolvería o mitigaría, y estado (`abierto` / `decidido` / `resuelto`). Una entrada no se borra: si se resuelve o el usuario decide, cambia de estado y se anota la Decisión.
- **Las dudas que bloquean no van aquí:** esas se preguntan (regla 1). Este registro es para lo que se sabe y queda abierto, no para evitar preguntar.
- **Al entregar cada documento y en el reporte final**, menciona cuántas entradas hay por tipo y enlaza el archivo; en el reporte final, destaca las que requieren decisión del usuario.
- **Resolución final, todas juntas, en un solo mensaje.** La última tarea de la sección de Cierre de todo plan (`M.5` en la plantilla de `tasks.md`) enumera `pending-items.md` completo con el usuario en un solo mensaje de texto (no `AskUserQuestion` ni otra ronda entrada por entrada): cada entrada que siga `abierta`, agrupada por tipo, con qué es, por qué importa y alternativas concretas de solución; si alguna es compleja, se ofrece armar un plan propio. **El plan no se considera cerrado hasta que todas las entradas tengan una respuesta del usuario** (aunque la respuesta sea postergarla tal cual); un pedido genérico de commitear o subir no sustituye este paso. El detalle de cómo se hace está en "Implementar un plan" (skill `plan-implementation`), paso 7. **(Decisión del usuario, 2026-11-10: antes se recorría de a una con `AskUserQuestion`; ahora se enumeran todas juntas y el cierre del plan queda condicionado a que cada una tenga respuesta.)**
