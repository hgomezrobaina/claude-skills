# Perfil del proyecto

Lo que esta skill necesita saber de un proyecto para escribir planes en él. Se llena con lo que la fase 0 **detectó** (leyendo el repo) más lo que el usuario **decidió**. Si el proyecto ya tiene una skill de planes propia (`.claude/skills/*-plans/`), ese archivo **es** el perfil: no dupliques.

Cuando no había perfil, ofrécele al usuario guardarlo en `.claude/plans-profile.md` al cerrar la ronda de preguntas. Es un archivo de contexto, no una skill: no lleva frontmatter. Lo usan tanto `plan-creation` como `plan-implementation`.

## Qué tiene que quedar registrado

| Campo | Cómo se obtiene |
|---|---|
| Forma del workspace | Repo único o lista de repos hermanos, con qué hace cada uno |
| Dónde viven los specs | `docs/specs/<pending\|in-progress\|finished>/<slug>/` del repo, o de la raíz cuando el plan cruza repos (salvo que el perfil declare otra organización) |
| Idioma de los specs | El de la prosa de los specs existentes; si no hay, decisión del usuario. No cubre nombres: el `<slug>` del plan, los nombres de los tests y los mensajes de commit van siempre en inglés |
| Comandos de verificación | Build, typecheck, lint y test **reales**, por repo, copiados de `package.json`/`Makefile`/etc. |
| Framework end-to-end | Cuál, dónde vive, cómo se levanta el entorno, cómo se corre un spec suelto |
| Datos de prueba | Escenarios, fixtures, factories o seeds: dónde se definen y cómo los pide un test |
| Modo demo de los e2e (videos por caso) | Qué repos tienen Cypress, cómo se levanta el entorno y se sirve el frontend para correr **specs sueltos** (comandos exactos, puertos, build en carpeta privada si el `dist/` es compartido), los argumentos extra de Cypress que hagan falta (`DEMO_CYPRESS_ARGS`: `--config baseUrl=…`, `chromeWebSecurity=false`…) y las trampas del entorno. Lo usa `plan-implementation` en la tarea `M.2b` |
| Convención de selectores | Ids de DOM derivados, `data-testid`, roles accesibles… y dónde está el archivo de selectores |
| Permisos / roles | De dónde salen las claves (paquete, enum, tabla) |
| i18n | Si los textos visibles llevan forma de diccionario (`{ es, en }`) o van literales |
| Sistema visual (por repo de interfaz) | Dónde están los tokens y el tema, dónde vive la librería de UI compartida y qué contiene, qué primitivos / iconos / librería de animación usa, y los anchos en que la app tiene que funcionar. Lo levanta `plan-ui-design/references/ui-evidence.md`; se anota aquí para no repetirlo en cada plan |
| Base de datos (por repo con persistencia) | Motor y versión, ORM, herramienta de migraciones y cómo se genera una, estrategia de ids, columnas de auditoría, borrado lógico, zona horaria, mapeo de enums. Lo levanta `data-model-rules.md` § 1 |
| Skills y agentes del proyecto | Cuáles usar para ubicar patrones (servicios, tablas, formularios, permisos, suite e2e) |
| Repos sin cobertura e2e | Cuáles todavía no tienen suite montada y qué decidió el usuario al respecto |

## Plantilla

```markdown
# Perfil de planes — <proyecto>

**Detectado el:** AAAA-MM-DD · usado por las skills globales `plan-creation` y `plan-implementation`.

## Forma

- Workspace multi-repo en `<ruta>`; la raíz no es un repo git.
  - `<repo-a>` — <qué es> (`<comandos de verificación>`)
  - `<repo-b>` — <qué es> (`<comandos de verificación>`)
- Specs: `<repo>/docs/specs/<pending|in-progress|finished>/<slug>/`; los que cruzan repos, en `docs/specs/<pending|in-progress|finished>/<slug>/` de la raíz.
- Idioma de los specs: <idioma>.

## Pruebas

| Repo | Suite | Cómo se corre | Datos | Selectores |
|---|---|---|---|---|
| `<repo>` | <framework> en `<ruta>` | `<comando>` | <escenarios/fixtures> | <convención> |

Sin suite end-to-end todavía: `<repo>` — **Decisión (usuario, AAAA-MM-DD):** <qué se hará>.

### Videos de los casos (modo demo)

<!-- Solo repos con Cypress. Lo usa la tarea M.2b de `plan-implementation`. -->

| Repo | Entorno para specs sueltos | Frontend servido en | `DEMO_CYPRESS_ARGS` | Trampas |
|---|---|---|---|---|
| `<repo>` | `<comando que levanta el backend de pruebas>` (esperar a que termine) | `<comando>` en `<puerto>` | `<argumentos, o ninguno>` | <p. ej. el entorno siembra al arrancar; el puerto habitual lo usa otra cosa> |

## Convenciones

- Permisos: <origen de las claves>.
- Textos visibles: <i18n>.
- Skills del proyecto: `<skill>` (<para qué>), …

## Sistema visual

<!-- Una entrada por repo de interfaz. Lo usa `plan-ui-design`; si falta, lo levanta y ofrece anotarlo aquí. -->

| Repo | Tokens y tema | Librería de UI compartida | Primitivos / iconos / animación | Anchos |
|---|---|---|---|---|
| `<repo>` | `<archivo>` (<qué declara: fuentes, escala, radios por rol, paleta, breakpoints>) | `<ruta>` — <n> componentes | <librerías> | <mínimo y de trabajo> |

- Modo oscuro: <sí / no>.
- Documento de diseño del repo: `<ruta de DESIGN.md>` / <no existe — anotado en pendientes como Mejora>.

## Base de datos

| Repo | Motor | ORM · migraciones | Ids | Auditoría · borrado | Convenciones |
|---|---|---|---|---|---|
| `<repo>` | <motor y versión> | <ORM> · <herramienta, comando> | <estrategia> | <columnas> | <nombres, enums, zona horaria> |

## Decisiones vigentes

- **Decisión (usuario, AAAA-MM-DD):** <qué se decidió y por qué>.
```
