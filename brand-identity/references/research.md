# Fase 2 · Investigación y competencia

Diseñar sin mirar el terreno produce marcas que se confunden con las de al lado. Esta fase responde con fuentes reales: **¿cómo se ve hoy la categoría, qué está gastado y qué territorio queda libre?**

Todo en `research/`. Cada dato lleva su enlace en `research/sources.md` (título, URL, fecha de consulta, qué se sacó de ahí).

## 1. El sector y el público (en línea)

Con `WebSearch` (varias búsquedas en paralelo; `extended` si el nicho es raro o el tema reciente) y el agente `web-fetch` para leer una página entera:

- Tamaño y tendencias del sector, cambios recientes, regulación que afecte a la comunicación (salud, finanzas, menores).
- Cómo habla el público: reseñas en tiendas de apps, foros, Reddit, comentarios de redes. Copia frases literales: alimentan la voz y el posicionamiento.
- Convenciones visuales del sector (colores, metáforas, tipos de logo habituales) y **por qué** existen; romper una convención tiene que ser una decisión.

## 2. Elegir competidores

Ni muy pocos ni demasiados: **5-8**, mezclando:

- **Directos** (mismo producto, mismo público), **indirectos** (otro producto, mismo trabajo por resolver) y **aspiracionales** (marcas que el público admira aunque sean de otro sector).
- Los que dio el usuario + los que encuentres buscando como lo haría el cliente ("app para …", "mejor … 2026", rankings de tiendas de apps, G2/Capterra para B2B, Product Hunt).

Presenta la lista con una línea por competidor y por qué entra, y pregunta si falta o sobra alguno antes de analizarlos (`AskUserQuestion` multiselección).

## 3. Auditoría de cada competidor

Para cada uno:

```bash
node ~/.claude/skills/brand-identity/scripts/site-dna.mjs https://competidor.com --out research/
node ~/.claude/skills/brand-identity/scripts/site-dna.mjs https://competidor.com --out research/ --mobile
```

Eso deja captura, colores dominantes (por área visible), fuentes reales, logo, favicon y og:image en `research/<dominio>/`. **Mira la captura** y completa a mano:

| Dimensión | Qué anotar |
| --- | --- |
| Logo | Tipo (wordmark, monograma, símbolo + texto, emblema, abstracto), forma dominante, peso, mayúsculas/minúsculas |
| Color | Primario y acento (hex), temperatura, saturación, ¿claro u oscuro? |
| Tipografía | Familia y categoría (geométrica, humanista, grotesca, serif, mono) |
| Imagen | Fotografía, ilustración, 3D, capturas de producto, personas o no |
| Icono de app | Forma, fondo, color (mirar la ficha en App Store y Google Play) |
| Mensaje | Promesa principal (el H1), tono, palabras que repiten |
| Personalidad | 3 adjetivos que transmite, ¿se ve coherente o improvisada? |

Escríbelo en `research/competitors.md` con `templates/competitors.md`, y monta una **hoja de logos e iconos** lado a lado (`contact-sheet.mjs` con los logos descargados o las capturas recortadas) para ver el paisaje de un vistazo. Los logos ajenos solo se usan para el análisis interno; **nunca** se toman como base para dibujar.

## 4. Patrones, clichés y espacios libres

Con la auditoría delante:

- **Agrupa:** ¿cuántos usan azul? ¿cuántos una grotesca geométrica? ¿cuántos un símbolo abstracto con degradado? Lo que repite más de la mitad es **la convención de la categoría**.
- **Lista de clichés del sector**, por escrito: metáforas visuales gastadas (el escudo en seguridad, la hoja en ecología, el rayo en velocidad, el cohete en crecimiento, la casa en inmobiliarias, el engranaje en "tecnología"), colores y palabras que todos usan.
- **Mapa de posicionamiento:** dos ejes que importen *al cliente* y que de verdad separen a los competidores (p. ej. *experto ↔ para todos* y *serio ↔ cercano*, o *premium ↔ económico*). Se dibuja con `excalidraw-diagram` en `research/positioning-map.excalidraw` (y su PNG). Proponer 2 pares de ejes posibles y que el usuario elija el que describe mejor su mercado.
- **Espacios libres:** dónde no hay nadie en el mapa, qué colores no usa nadie, qué tono nadie se atreve a tener. No todo espacio libre es bueno (a veces está vacío porque no funciona): argumenta cuál vale la pena ocupar y por qué.

## 5. Normas vigentes de las plataformas

Si la marca va a una app o a redes, comprueba en la fuente oficial lo que cambia con frecuencia, y anótalo en `sources.md` con la fecha:

- Apple Human Interface Guidelines → *App icons* (capas, Liquid Glass, variantes claro/oscuro/tintado, Icon Composer).
- Android → *Adaptive icons* (108 dp, zona segura 66 dp, capa monocromática).
- Tamaños vigentes de perfil, portada y publicaciones de cada red que vaya a usar.

## 6. Conclusiones (puerta)

Presenta en 1 página: el paisaje visual (la hoja de logos), los clichés a evitar, el mapa con 2-3 territorios posibles y tu recomendación. Pregunta qué territorio ocupar (`AskUserQuestion`, una opción por territorio). Lo elegido se anota en el `README.md` y alimenta la estrategia.
