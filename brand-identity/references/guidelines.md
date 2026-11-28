# Fase 10 · Manual de marca (brand book)

El manual existe para que **otra persona**, sin hablar contigo, use la marca bien. Por eso cada regla lleva su ejemplo visual, y cada "no" también.

Se construye desde `templates/brand-book.html` en `guidelines/brand-book.html`, usando `tokens/tokens.css`, las fuentes locales y los archivos de `exports/`. Se exporta a PDF con:

```bash
node ~/.claude/skills/brand-identity/scripts/screenshot.mjs guidelines/brand-book.html guidelines/brand-book.pdf
```

y se revisan páginas sueltas a PNG antes de darlo por bueno.

## Estructura

1. **Portada** y **índice**.
2. **La marca**: propósito, promesa, posicionamiento, valores, atributos *es / no es*, arquetipo. Una página, sin relleno.
3. **Voz y tono**: principios, tabla *decimos / no decimos*, ejemplos reales por situación (bienvenida, error, cobro, notificación, redes), vocabulario y reglas de escritura (tuteo o usteo, mayúsculas, emojis sí/no).
4. **Logo**: la idea detrás (breve), la retícula de construcción, variantes y cuándo usar cada una, logo responsive, área de respeto, tamaño mínimo digital e impreso, fondos permitidos, sobre fotografía, **usos incorrectos** (6-9 ejemplos tachados, generados de verdad: estirado, rotado, recoloreado, con sombra, con contorno, otra fuente, reordenado, sobre fondo sin contraste, versión antigua).
5. **Color**: cada color con nombre, rol, HEX, RGB, OKLCH, CMYK (con perfil) y Pantone; escalas; pares accesibles aprobados y combinaciones prohibidas; proporción de uso; modo oscuro.
6. **Tipografía**: familias, pesos, escala y jerarquía con ejemplos, reglas (interlineado, tracking, alineación, mayúsculas), dónde conseguirlas y su licencia, fuente de respaldo.
7. **Iconografía** y **elementos gráficos**: familia, tamaños, reglas, ejemplos.
8. **Imagen**: fotografía e ilustración, con *sí / no*.
9. **Retícula, espaciado y radios**.
10. **Movimiento**: principios, duraciones y curvas, animación del logo si existe.
11. **Aplicaciones**: los mockups de la fase 9.
12. **Recursos**: qué hay en `exports/` y dónde, nombres de archivo, el fragmento `<head>` para la web, contacto del responsable de la marca.
13. **Lista de comprobación** rápida para quien crea una pieza ("¿usé la variante correcta? ¿respeté el área? ¿el contraste pasa?…").
14. **Registro de cambios** (versión y fecha).

## Reglas de forma

- El manual es una pieza de la marca: usa su tipografía, color y retícula.
- Cada página responde a una pregunta ("¿qué logo uso aquí?"). Si una página no ayuda a decidir algo, sobra.
- Valores copiados de `brand.json`, nunca reescritos a mano (si se cambia uno, se regenera el manual).
- Un PDF para compartir y el HTML para mantener. Si el usuario quiere compartirlo como página web, se puede publicar como artifact (opcional).
