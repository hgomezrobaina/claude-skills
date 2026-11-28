# Fase 1 · Descubrimiento

El objetivo es un **brief** que el usuario reconozca como verdadero y que sirva para decir *no* a ideas visuales. Un brief vago ("moderna, limpia, confiable") produce una marca genérica: hay que llegar a lo específico.

## 1. Buscar antes de preguntar

Antes de la primera pregunta, reúne lo que ya existe y muéstralo para confirmar:

- **El repo o la app:** `README`, landing, textos de la interfaz, `package.json` (nombre), tokens o colores actuales, capturas de pantalla, tiendas de apps.
- **La web y las redes del usuario o del producto**, si las hay (agente `web-fetch`, `site-dna.mjs` sobre su propia web).
- **Una marca anterior** (rediseño): logo, colores y fuentes actuales; qué se reconoce de ella y qué no funciona.

Resume lo encontrado en 5-10 líneas ("Esto es lo que entendí; corrígeme") antes de preguntar lo que falta.

## 2. La entrevista

Pregunta solo lo que no se pudo deducir. Usa `AskUserQuestion` en tandas de **hasta 4 preguntas**, cada una con opciones concretas (el usuario siempre puede escribir "Otra"). Para preguntas abiertas de verdad (la historia del fundador, qué le molesta de la competencia), pregúntalas en texto, una tanda corta cada vez.

### Bloques (en este orden)

**A · El negocio**
- ¿Qué hace el producto, en una frase que entendería un niño de 12 años?
- ¿Qué problema resuelve y cómo se resolvía antes (la alternativa real, que a veces es "Excel" o "nada")?
- ¿Modelo y etapa? (idea, MVP, en el mercado, escalando); ¿B2C, B2B, ambos?
- ¿Ambición a 3-5 años? (un mercado local, una región, global) → condiciona el nombre, los idiomas y la búsqueda de marcas.
- ¿Mercados e idiomas en que vivirá la marca?

**B · Las personas**
- ¿Quién compra y quién usa? (pueden ser distintos)
- Edad, contexto, nivel técnico, qué valoran, qué les da miedo o desconfianza.
- ¿Dónde se van a encontrar con la marca? (tienda de apps, redes, en persona, en un correo, en una factura impresa).

**C · Competencia y referencias**
- ¿Qué competidores conoce? (directos, indirectos y la alternativa "no hacer nada").
- ¿Qué marcas admira, de cualquier sector, y por qué? ¿Cuáles detesta?
- ¿Qué **no** quiere parecer bajo ningún concepto?

**D · Personalidad (preparación de la fase 3)**
- Si la marca fuera una persona, ¿cómo hablaría? Ofrece pares de escalas para elegir un punto: *seria ↔ juguetona*, *clásica ↔ vanguardista*, *exclusiva ↔ accesible*, *técnica ↔ humana*, *calmada ↔ enérgica*, *discreta ↔ llamativa*. Con `AskUserQuestion` va bien una pregunta por escala, con 3-4 opciones (extremo, inclinado, centro…).
- Tres palabras que quiere que digan sus clientes; tres que no quiere oír nunca.

**E · Restricciones y alcance**
- ¿Hay nombre ya decidido? ¿Está registrado? ¿Dominio y redes disponibles?
- ¿Algo que deba conservarse (colores de una marca madre, un símbolo con historia)?
- ¿Dónde se va a usar? Marca *todo lo que aplique*: app iOS/Android, web, redes, presentaciones, correo, papelería, packaging, señalética, merchandising, vídeo. Esto decide qué entregables entran.
- ¿Plazo, y quién aprueba? (si decide más de una persona, hay que saberlo ya).
- ¿Impresión? ¿En qué región? (decide el perfil CMYK: FOGRA en Europa, GRACoL/SWOP en América).

## 3. El brief

Escribe `brief.md` con `templates/brief.md`. Reglas:

- Todo lo que escribas sale de una respuesta o de algo encontrado; lo inferido se marca como *(supuesto: confirmar)*.
- **Objetivo de la marca en una frase** medible o comprobable ("que un dueño de taller confíe en ella lo suficiente como para dar su tarjeta en la primera visita").
- **Criterios de éxito del diseño:** 3-5 frases con las que luego se evalúan las opciones ("se distingue del azul corporativo del sector", "se lee a 16 px", "funciona en una camiseta a una tinta").
- Lista de **entregables** acordados (de la sección E).

Presenta el brief y pide aprobación (`AskUserQuestion`: *Aprobado* / *Ajustar…*). Anota la aprobación con fecha en el `README.md`.
