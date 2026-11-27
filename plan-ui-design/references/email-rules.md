# Correos: la interfaz que no vive en la app

Un correo es una pantalla más del plan —tiene layout, estados, idioma, extremos de contenido y accesibilidad— pero se renderiza en motores de 2007 y el usuario lo ve **una sola vez, sin poder recargar**. Por eso tiene sus propias reglas verificables, y la regla 0 se aplica igual: **la plantilla que el repo ya tiene es la "plantilla equivalente"** que el diseño imita.

Se lee cuando el plan crea o cambia un correo, una notificación por correo, o el layout que comparten. No reemplaza a `ui-rules.md`: lo sustituye solo en lo que el HTML de correo no admite.

## 1. Evidencia antes de diseñar

Igual que `ui-evidence.md` para pantallas, y con el mismo rigor: nada se decide sin esto, y todo se cita con `archivo:línea`.

1. **Dónde viven las plantillas y cuál es el layout compartido.** Normalmente un archivo de layout y una plantilla por correo. Se nombra el layout, sus parámetros y los correos que lo usan.
2. **Si hay más de un layout, eso es deriva.** Dos envoltorios distintos (uno viejo y uno nuevo) es un hallazgo con prueba (`ui-findings.md`): se informa, se anota en `pending-items.md` y se pregunta cuál es el canónico **antes** de escribir una plantilla nueva. No se arregla de paso ni se elige por intuición.
3. **Los helpers que ya existen**: escapado de HTML, formato de dinero, de fecha y de números, y las constantes de color/marca exportadas por el layout. Una plantilla nueva los usa; no redefine ninguno.
4. **Cómo entran las imágenes**: adjunto con `cid:` o URL absoluta. Es una decisión del repo, no de la plantilla nueva.
5. **De dónde salen los textos** (constantes, paquete de traducciones, el mecanismo de i18n del proyecto) y **de quién sale el idioma**: del destinatario, siempre.
6. **Cómo se previsualiza y cómo se prueba**: servicio o endpoint de preview, tests de plantilla, y la lista blanca de direcciones que limita los envíos fuera de producción. Si el repo tiene preview, verificar un correo "a ojo" sin abrirlo no cuenta.
7. **Quién envía y qué dispara el envío**: proveedor, reintentos, deduplicación, idempotencia, y qué evento de dominio lo lanza. Un correo que se puede disparar dos veces es un problema de diseño, no de plantilla.
8. **De quién es el código.** En muchos proyectos el envío vive en el backend y lo implementa otro equipo: entonces el plan **diseña** el correo con este detalle y la implementación va al documento de handoff, no a una tarea del agente. Eso se resuelve con el perfil del proyecto, y se declara en `design.md`.

## 2. Reglas verificables del HTML

- **Estructura con tablas `role="presentation"`**, anidadas. Nada de flex, grid, `position`, `float` ni unidades relativas para el layout. Ancho de contenido **600px o menos**, centrado, con `max-width` además del `width`.
- **Todo el CSS inline, en el atributo `style`.** Un `<style>` en el `<head>` lo descartan varios clientes; se usa solo para lo que no se puede inlinear (media queries, `color-scheme`) y nunca para lo estructural. Nada de clases propias, variables CSS (`var()`), `rem`, `calc()`, pseudo-clases ni selectores descendentes para la estructura.
- **Unidades en `px`.** Tipografía con *stack* de fuentes del sistema y fallback; una webfont puede estar, pero nunca como única vía de que el texto se lea.
- **Los colores literales acá sí son correctos**, porque no hay tokens CSS: se declaran **una sola vez** como constantes exportadas del layout y se referencian desde las plantillas. Un hex suelto escrito en una plantilla nueva es hallazgo.
- **Imágenes**: `alt` siempre, ancho y alto explícitos, `display: block`. **Ningún mensaje depende de una imagen**: muchos clientes las bloquean por defecto, así que nada de texto dentro de la imagen ni de un botón que sea solo imagen. El logo va por el mecanismo del repo (`cid:` o URL absoluta HTTPS).
- **Nada de JavaScript, formularios, `iframe`, SVG, vídeo ni fuentes icónicas.**
- **Una sola acción principal**, como enlace con padding y color de fondo (botón "a prueba de balas"), nunca un `<button>`. Su URL es absoluta, y si lleva token se declara su vencimiento.
- **Asunto y preheader son parte del diseño**, no un detalle del envío: el asunto en una línea verificable y el preheader oculto de 40 a 90 caracteres. Sin preheader, el cliente muestra el primer texto que encuentre.
- **Versión en texto plano** cuando el proveedor la acepta, con el mismo contenido y el mismo enlace.
- **Modo oscuro**: se declara `color-scheme` y `supported-color-schemes`, y no se da por hecho un fondo blanco; varios clientes invierten colores por su cuenta. Los logos sobre fondo transparente se revisan en oscuro.
- **Todo texto que venga de un usuario o de un tercero se escapa** con el helper del repo (nombre de dealer, mensaje de un cliente, notas): interpolar crudo en el HTML es una inyección, además de un correo roto.
- **Idioma del destinatario, nunca del servidor.** Cada cadena nueva entra por el mecanismo de traducción del proyecto; los montos llevan su moneda y las fechas la zona del destinatario.
- **PII**: en el asunto, lo mínimo (los asuntos se ven en pantallas bloqueadas y se indexan). Nada de tokens ni identificadores sensibles en el cuerpo si no hacen falta.
- **Accesibilidad**: `lang` en `<html>`, jerarquía de encabezados real, contraste ≥ 4.5:1, enlaces con texto que dice a dónde van, y `role="presentation"` en toda tabla de layout para que un lector de pantalla no la anuncie como tabla de datos. Las tablas que **sí** son datos llevan `th` con `scope`.
- **Ancho de teléfono (320px)**: sin desbordamiento horizontal ni scroll lateral, con una sola columna cuando el contenido no cabe.

## 3. La matriz de correos (el equivalente de la matriz de estados)

Una fila por correo, y **cada celda dice qué se ve**:

| Correo | Campos opcionales ausentes | Lista vacía / 1 / muchas | Textos largos | Montos extremos | Idioma | Imágenes bloqueadas | 320px | Oscuro |
|---|---|---|---|---|---|---|---|---|
| Recibo de pago | Sin dirección del dealer: no se renderiza la línea | — / 1 fila / 12 filas de detalle | Nombre de dealer de 80 caracteres: corta con `overflow-wrap` | 0.00, 7 cifras, negativo (reembolso) | es / en según el destinatario | Logo ausente, el texto alternativo lo reemplaza y el recibo sigue completo | Una columna, detalle en dos líneas | Fondo y texto declarados, el sello sigue legible |

Las columnas se adaptan al correo (una invitación tiene "enlace vencido"; una notificación, "sin ruta de destino"). Los valores extremos se toman del catálogo de `break-ui` (ver `craft-skills.md`), con datos plausibles del dominio real.

**Cada fila de esta matriz se convierte en una prueba**: un test de plantilla por variante (lo que el repo use: aserción sobre el HTML, snapshot) y, si hay preview, una captura guardada en el `handoff/` del spec. Una variante sin prueba es una variante que nadie vio.

## 4. Checklist antes de marcar `[x]` una tarea de correo

- [ ] La plantilla sale del layout vigente del repo y usa sus constantes y helpers; no define colores, formatos ni escapado propios.
- [ ] Previsualizada y **mirada**, no solo compilada; una captura por variante si el repo lo permite.
- [ ] Un test por fila de la matriz de correos, y cada uno puede fallar (se invierte una aserción una vez).
- [ ] Sin flex, grid, `position`, clases propias ni CSS no inline para la estructura; ancho ≤ 600px.
- [ ] Todo texto de origen externo pasa por el escapado del repo.
- [ ] Imágenes con `alt` y medidas; el correo se entiende con las imágenes bloqueadas.
- [ ] Asunto y preheader escritos, en el idioma del destinatario, con sus cadenas en el mecanismo de traducción.
- [ ] Legible a 320px y en modo oscuro.
- [ ] Un solo CTA principal, con URL absoluta y su vencimiento declarado si lleva token.
- [ ] El envío es idempotente o está deduplicado, y en entornos no productivos respeta la lista blanca de direcciones.

## 5. Qué va en cada documento del plan

- **`requirements.md`**: qué correo, a quién llega, qué lo dispara, en qué idioma, qué datos muestra y los criterios verificables (*"el recibo de un reembolso parcial muestra el monto en negativo y el estado 'Partial refund'"*).
- **`design.md`**: la plantilla equivalente citada con `archivo:línea`, la **decisión por pieza** (reutilizar el layout / extenderlo —que es un cambio de contrato, con sus consumidores buscados— / plantilla nueva), la matriz de correos, los **textos exactos** (asunto, preheader, cuerpo, CTA) y de dónde sale cada cadena, el disparador con su idempotencia, y quién lo implementa (agente o handoff).
- **`tasks.md`**: una tarea por plantilla, una por las pruebas de sus variantes, y la de previsualizar y mirar el resultado. Si el envío es de otro equipo, la tarea queda marcada como handoff y bloquea a las que la consumen.
- **`pending-items.md`**: la deriva encontrada (dos layouts, hex sueltos, plantillas sin prueba, correos sin preheader), con su prueba, sin arreglarla de paso.
