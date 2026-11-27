# Modelo de datos: cómo se diseña un esquema en un plan

Se carga **siempre que el plan cree o cambie persistencia**: una tabla, una colección, una columna, un índice, una restricción, una relación, una migración, una vista o un enum de base de datos. Es la parte de `design.md` que más cuesta corregir después: un endpoint mal diseñado se reescribe en una tarde; un dato que no se guardó no se recupera nunca, y una tabla con millones de filas mal modelada se migra con miedo. Por eso el esquema se diseña **con mentalidad senior y a escala**, se contrasta contra esquemas reales publicados, se diagrama y **se aprueba aparte**. **(Decisión del usuario, 2026-11-22.)**

Las reglas 1 (preguntar), 5 (imitar el patrón), 7 (fuentes externas), 8 (recomendar por mejora del producto) y 9 (una consulta por `GET`) de `rules.md` siguen vigentes; este archivo dice cómo se aplican a los datos.

## 1. Levantar el esquema vigente antes de proponer nada

Con `archivo:línea`, y anotándolo en el perfil del proyecto (§ "Base de datos") para no repetirlo:

- **Motor y versión** (PostgreSQL, MySQL, SQLite, Mongo…), y qué tipos y funciones ofrece esa versión (`jsonb`, `uuid`, `generated columns`, particionado, `CHECK`, índices parciales).
- **ORM / capa de acceso y herramienta de migraciones** (SQLAlchemy + Alembic, Prisma, TypeORM, Django…), cómo se nombra y se genera una migración, y si las migraciones son reversibles (`downgrade`).
- **Convenciones del repo:** nombres de tablas (singular/plural, `snake_case`), estrategia de id (autoincremental, UUID v4/v7, ULID), columnas de auditoría (`created_at`, `updated_at`), borrado lógico, zona horaria de los timestamps, cómo se mapean enums, dónde vive el modelo de dominio frente al modelo de persistencia.
- **Las tablas vecinas** que la nueva va a referenciar, con sus claves, índices y restricciones reales.
- **Volumen esperado:** filas hoy, crecimiento previsible, patrón de lectura/escritura. Si nadie lo sabe, se pregunta: decide índices, particionado y tipos.

## 2. Guardar todo lo que pueda hacer falta, no solo lo que la pantalla de hoy usa

El principio: **capturar un dato al momento de ingresarlo es barato; recuperarlo después es caro o imposible** (la fuente cambia, se borra o deja de exponerlo). Por eso, por cada entidad nueva se recorre esta lista y se propone cada campo que aplique, aunque ninguna funcionalidad actual lo lea:

| Categoría | Qué se pregunta | Ejemplos |
|---|---|---|
| Identidad | ¿Clave sustituta propia? ¿Clave natural/externa con `UNIQUE`? | `id`, `(source, external_id)` único |
| Procedencia | ¿De dónde vino el dato, cuándo y quién lo trajo? | `source`, `fetched_at`, `created_by`, versión de la API de origen |
| Metadatos de la fuente | Todo lo que la fuente expone y podría servir para mostrar, filtrar, buscar o analizar | título, descripción, duración, idioma, fecha de publicación, canal, etiquetas, miniaturas por tamaño, estado de privacidad, licencia |
| Copia cruda | ¿Conviene guardar la respuesta original completa para re-procesarla sin volver a pedirla? | columna `raw_payload jsonb` con la versión del esquema de la fuente |
| Métricas en el tiempo | ¿Algún valor cambia y su evolución tiene valor estadístico? Entonces **no se sobrescribe**: va a una tabla de instantáneas | `*_snapshots (entity_id, captured_at, view_count, like_count…)` |
| Ciclo de vida | ¿Estados, disponibilidad, verificación, borrado? | `status`, `unavailable_since`, `last_checked_at`, `deleted_at` |
| Auditoría | ¿Quién creó/cambió, cuándo? | `created_at`, `updated_at`, `created_by` |
| Relaciones de dominio | ¿Con qué entidades se cruza para análisis futuros? Muchos-a-muchos con atributos propios | participantes con su rol, resultado, ronda |
| Búsqueda e índices | ¿Por qué columnas se filtra, ordena o busca texto? | índices compuestos, `tsvector`, trigram |
| Privacidad y retención | ¿Hay datos personales o con términos de uso de la fuente que limiten cuánto se guarda? | PII, cuotas y políticas de la API, plazos de borrado |

- Cada campo propuesto se marca en el diccionario de datos como **uso actual** (lo lee algo del plan) o **uso previsto** (con qué funcionalidad o estadística futura lo justifica). Un campo de uso previsto no es "por si acaso": tiene un motivo escrito.
- **Esto no contradice la regla 9.** Los contratos de la API (DTO, `*Response`) siguen siendo mínimos: el esquema guarda todo lo valioso; cada endpoint expone solo lo que su consumidor necesita.
- **Lo que no se guarda también se decide:** si un dato de la fuente se descarta (por tamaño, privacidad o términos de uso), queda escrito con su motivo en el diccionario de datos.

## 3. Principios de diseño que se aplican por defecto

Apartarse de cualquiera es un desvío (regla 5): se pregunta y queda en "Desvíos aprobados".

- **Normalizado (3FN) por defecto.** Desnormalizar (columnas calculadas, contadores en cache, vistas materializadas) solo con una consulta concreta que lo justifique y cómo se mantiene consistente.
- **La base protege sus invariantes**, no solo el código: `NOT NULL` en todo lo obligatorio, `UNIQUE` en cada clave natural, `CHECK` para rangos y formatos, `FOREIGN KEY` siempre, con su `ON DELETE` (`RESTRICT` / `CASCADE` / `SET NULL`) **decidido y justificado** por relación.
- **Tipos exactos:** timestamps con zona y en UTC (`timestamptz`); duraciones con la unidad en el nombre (`duration_seconds`); dinero con `numeric` y la regla de dinero de `rules.md`; enums como tipo/lookup según la convención del repo; textos con su tope cuando la fuente lo define; nada de números o fechas guardados como texto.
- **Información agrupada: tabla hija o columna JSONB, nunca columnas sueltas en el padre.** **(Decisión del usuario, 2026-11-23.)**

  Cuando varias columnas describen **un mismo hecho y se llenan juntas**, no van sueltas en la tabla padre con un prefijo común. Ejemplos:
  - quién y cuándo confirmó: `confirmed_at` + `confirmed_by`;
  - el fallo: `error_code` + `error_detail`;
  - la asignación: `freestyler_id` + `assigned_at` + `assigned_by`;
  - el idioma detectado: `language_code` + `language_probability`.

  Tampoco se usa un enum o booleano de estado que repita lo que la presencia del dato ya dice. El grupo se guarda de una de dos formas:
  - **Tabla hija** (1:1 con PK = FK al padre, o 1:N si el hecho se repite). Va obligatoriamente aquí si el grupo:
    - tiene alguna FK (a `users`, a otra entidad);
    - se filtra, se une o se agrega en SQL;
    - necesita restricciones propias.

    **La existencia de la fila es el hecho**: sin fila, no hubo confirmación, fallo o asignación. Por eso la columna de estado que lo repetía sobra.
  - **Columna JSONB con el grupo.** Solo si el grupo es descriptivo, sin FKs, no se une con otras tablas y se lee entero. Desde un JSONB no se puede declarar una FK ni hacer joins con integridad, así que **un grupo con referencias nunca va en JSONB**.

  Quedan en el padre:
  - las columnas que el padre necesita en sus propias restricciones o índices, por ejemplo `status` y `finished_at` de un índice parcial;
  - la auditoría de creación siempre presente (`created_at` / `created_by`).

  **La señal** para detectarlo: dos o más columnas con el mismo prefijo (`assignment_…`, `error_…`, `language_…`), o columnas que siempre son nulas o no nulas a la vez. En el diccionario de datos, cada grupo dice qué forma se eligió y por qué.
- **Un índice por cada patrón de consulta declarado** en la tabla de "Consulta de cada lectura" (regla 9), incluidos los que exigen las claves foráneas y la unicidad. Ningún índice sin la consulta que lo usa.
- **Herencia y polimorfismo: se eligen, no se improvisan.** Cuando una entidad base tiene variantes (p. ej. una fuente por tabla hija), se presentan al usuario las tres formas clásicas con su costo, y la recomendada según la regla 8:
  - *Una tabla* (single table inheritance): todas las variantes en una tabla con discriminador y columnas nulas por variante.
  - *Tabla por clase* (class table / joined): una tabla base con lo común y una tabla hija por variante con PK = FK a la base (relación 1:1). Integridad fuerte, cada variante con sus `NOT NULL` y su `UNIQUE` propios.
  - *Tabla concreta* (concrete table): cada variante repite las columnas comunes; sin tabla base.
  Además, cómo se garantiza que una fila base tenga **exactamente una** hija (discriminador en la base + `CHECK`/FK compuesta, o invariante del dominio con su test). Las asociaciones polimórficas sin FK (`entity_type` + `entity_id`) se tratan como desvío.
- **Escalabilidad:** claves que no se agoten (`bigint`/UUID), ids no secuenciales si se exponen en URLs, particionado o retención para tablas de instantáneas que crecen sin tope, y consultas analíticas que no bloqueen las transaccionales.
- **Migraciones seguras:** reversibles, en pasos *expand → backfill → contract* cuando la tabla ya tiene datos, sin bloquear tablas grandes (índices concurrentes donde el motor lo permite), y con el backfill como tarea propia en `tasks.md`.
- **Dominio separado de la persistencia** según el patrón del repo: el modelo de dominio no hereda del ORM si el repo no lo hace; el repositorio traduce.

## 4. Contrastar con esquemas publicados (obligatorio)

Además de lo que exige la regla 7, antes de proponer el esquema se buscan en la web **esquemas parecidos ya resueltos** y se toman como guía. Como mínimo:

- **La fuente misma:** la documentación oficial del recurso que se va a guardar (p. ej. el recurso `videos` de la YouTube Data API), para conocer cada campo que expone, sus tipos, sus cuotas y sus términos de uso.
- **Vocabularios estándar** del dominio (p. ej. schema.org `VideoObject`, `Event`, `SportsEvent`, `Person`), para nombres y relaciones que ya están pensados.
- **Esquemas de proyectos reales** de dominios parecidos (proyectos open source, datasets públicos, modelos de datos de APIs del sector) y la literatura de patrones (p. ej. Fowler, *Patterns of Enterprise Application Architecture*, para herencia; documentación del motor para tipos e índices).

Se registra en `design.md` § "Modelo de datos" → **Esquemas de referencia**: qué se miró (URL y fecha), qué se tomó y qué se descartó y por qué. Lo que sugieren y no entra en el alcance va a `pending-items.md` como `Mejora`. Sin búsqueda en la web disponible, se dice explícitamente y entra como `Pendiente`.

## 5. Diagramas: entidad-relación en PNG y PDF

- **`diagrams/data-model.mmd`** en Mermaid `erDiagram`: cada tabla nueva o modificada con **todas sus columnas** (tipo, `PK`, `FK`, `UK`, y comentario corto), más las tablas existentes con las que se relaciona (solo sus claves), y cada relación con su cardinalidad. Si el modelo es grande, un diagrama por agregado (`data-model-<aggregate>.mmd`) además del general.
- Si el plan **modifica** tablas existentes, se añade `diagrams/data-model-before.mmd` con el estado actual, para comparar antes/después.
- Se exportan con el mismo script que los flujos (genera `.png` escala 2 y `.pdf` al lado de cada `.mmd`):
  ```bash
  bash ~/.claude/skills/plan-implementation/scripts/plan-files.sh diagrams <carpeta-del-spec>
  bash ~/.claude/skills/plan-implementation/scripts/plan-files.sh diagrams-check <carpeta-del-spec>
  ```
- El `.mmd` es la única fuente; `design.md` muestra la imagen y enlaza el PDF. Los tres archivos se commitean con el spec. Si el esquema cambia durante la implementación, se corrige el `.mmd` y se re-exporta.

## 6. Aprobación del esquema: siempre se pregunta

El esquema **no se aprueba implícitamente junto con `design.md`**: es una parada propia. Con el modelo de datos redactado y los diagramas exportados, y **antes de escribir el resto de `design.md`** (servicios, endpoints, interfaz, pruebas dependen de él):

1. Resume en el chat las tablas, las relaciones, la estrategia de herencia elegida, los campos de uso previsto más relevantes y lo que se descartó, con la ruta absoluta de `diagrams/data-model.png` y `.pdf`.
2. **Pregunta con `AskUserQuestion` si está de acuerdo con el esquema**, presentando como opciones las decisiones abiertas (estrategia de herencia, campos dudosos, política de borrado, instantáneas sí/no), con la recomendada primero según la regla 8.
3. Si pide cambios, se corrigen el diccionario y los diagramas, se re-exportan y **se vuelve a preguntar**. No se sigue con el resto de `design.md` hasta tener un "sí" explícito, que queda como Decisión (usuario, AAAA-MM-DD) en la sección.

Lo mismo vale si durante la implementación aparece la necesidad de cambiar el esquema aprobado: se para y se pregunta.

## 7. Qué queda en `design.md`

La sección `## Modelo de datos` (plantilla en `templates.md`), con:

- **Esquema vigente relevante** (`archivo:línea` de modelos y migraciones).
- **Diagramas** ER exportados (PNG + enlace al PDF y al `.mmd`).
- **Diccionario de datos:** una tabla por tabla nueva o modificada, una fila por columna: columna · tipo · nulo · default · restricciones · índice · uso actual/previsto · origen del dato.
- **Restricciones e índices**, cada índice con la consulta que lo usa.
- **Grupos de información** (§ 3): cada grupo de columnas que describen un mismo hecho, con la forma elegida (tabla hija o JSONB) y por qué.
- **Estrategia de herencia/polimorfismo** con las alternativas presentadas y la elegida.
- **Migración:** pasos, reversibilidad, backfill, bloqueo esperado.
- **Esquemas de referencia** consultados.
- **Decisión** de aprobación del esquema.

En `tasks.md`: una tarea por migración (con su `downgrade` probado), otra por modelo/repositorio, otra por backfill si hay datos, y pruebas que verifiquen las restricciones (que la base rechace el duplicado, el nulo y la FK inválida).
