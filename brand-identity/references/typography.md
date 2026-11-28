# Fase 7 · Tipografía

La tipografía es la voz de la marca hecha forma, y es lo que más se ve después del color: cada pantalla, cada correo, cada factura. Se elige por personalidad, legibilidad, idiomas y **licencia**.

## Opciones (3 combinaciones)

Cada combinación tiene un rol por familia: **titulares** (display), **texto** (lectura) y, si hace falta, **mono** (código, cifras) o **acento**. Máximo dos familias principales; una sola familia con buen rango de pesos también es una opción válida (y suele ser la más coherente).

Busca candidatas en línea, no solo de memoria:

| Fuente | Licencia típica | Nota |
| --- | --- | --- |
| Google Fonts | OFL / Apache: uso comercial, apps y web sin coste | La opción segura; el riesgo es que sea muy vista (Inter, Roboto, Montserrat, Poppins: evitarlas como titular salvo motivo) |
| Fontshare (Indian Type Foundry) | Licencia propia gratuita para uso comercial | Leer los términos de cada familia |
| Velvetyne, Collletttivo, The League of Moveable Type | Libres (OFL u otras) | Más personalidad |
| Fundiciones comerciales (Klim, Grilli, Commercial Type, Dinamo, Pangram Pangram…) | De pago, **por uso**: escritorio, web (por visitas), **app (embebida)**, ePub, logo | Precio y alcance de licencia a confirmar con el usuario antes de proponerla en firme |

Para cada combinación:

1. **Muestra real** con `templates/type-specimen.html` (titular con el nombre y la promesa de la marca, un párrafo en español con tildes y ñ, cifras, una interfaz mínima: botón, etiqueta, precio) → `screenshot.mjs` → mirar.
2. **Comprobación técnica**: descarga la fuente y corre `node scripts/font-check.mjs <archivo>`: cobertura de los idiomas de la marca (como mínimo `ÁÉÍÓÚÜÑ¿¡`), cifras tabulares (precios, tablas), pesos disponibles, si es variable, licencia declarada.
3. **Porqué**: qué atributo expresa (geométrica → precisa, humanista → cercana, serif de contraste → editorial y premium, grotesca → neutral y moderna, redondeada → amable), en qué se diferencia de lo que usa la competencia (fase 2), y su licencia.

Presenta las 3 en una hoja y pregunta. Si ninguna convence, pregunta qué falla (más carácter, más seria, menos fría…) y busca otras.

## Al elegir: hacer sistema

- **Escala tipográfica** modular (razón 1.2 para interfaces densas, 1.25 general, 1.333 o más para editorial), en `brand.json → typography.scale` en px. Interlineado más apretado en titulares (1.05-1.2) y abierto en texto (1.4-1.6); *tracking* ligeramente negativo en titulares grandes y positivo en mayúsculas pequeñas.
- **Jerarquía**: qué familia, peso y tamaño tiene cada nivel (H1-H4, cuerpo, pie, botón, etiqueta, cifra destacada).
- **Respaldo (fallback)**: la pila de fuentes del sistema más parecida, para que la página no salte mientras carga (`size-adjust` si hace falta).
- **Fuentes en local**: los archivos se guardan en `assets/fonts/<familia>/` con su licencia, y se anota en `assets/fonts/CREDITS.md`. Nada se carga desde una URL externa en vídeos ni en el manual en PDF.
- **El wordmark no es la fuente de marca**: está dibujado a partir de una fuente, convertido a curvas y modificado (fase 5). La fuente de marca se usa para todo lo demás.
