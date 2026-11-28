# Fase 9 · Aplicaciones, entregables e impresión

Una marca se prueba **en su contexto real**. Muchos logos que se ven bien en una hoja fallan en la pantalla de inicio, recortados en un círculo o impresos a 2 cm. Lo que falla aquí vuelve a su fase.

## Mockups (solo los que apliquen según el brief)

Cada mockup es un HTML (con los tokens de `tokens/tokens.css` y las fuentes locales) renderizado con `screenshot.mjs`, guardado en `applications/`. **Mira cada uno.**

| Contexto | Qué comprobar |
| --- | --- |
| Icono en la pantalla de inicio (iOS y Android, claro y oscuro), junto a iconos de otras apps | ¿Se distingue? ¿Se lee a tamaño real? |
| Ficha de la tienda de apps (icono + nombre + capturas) | Junto a los competidores de la fase 2 |
| Pantalla de carga (splash) y una pantalla clave de la app | Logo, color y tipo en uso |
| Pestaña del navegador con el favicon | A 16 px, en pestaña clara y oscura |
| Cabecera y hero de la web | Lockup horizontal, jerarquía tipográfica |
| Imagen al compartir un enlace (Open Graph 1200×630) | Legible en miniatura |
| Avatar y portada en redes | Recorte circular, zonas tapadas por la interfaz de cada red |
| 2-3 publicaciones tipo (anuncio, dato, cita) | El sistema visual en acción |
| Firma de correo y una plantilla de correo | Logo en PNG (los clientes de correo no muestran SVG) |
| Papelería: tarjeta, hoja membretada, sobre | Ver § Impresión |
| Presentación (portada + 2 diapositivas) | — |
| Merchandising, packaging, señalética | Solo si el brief lo pide |

Composición final: una hoja con 6-8 aplicaciones (`contact-sheet.mjs`): ¿todo se ve de la misma marca?

## Tamaños y formatos digitales

`export-kit.mjs` genera lo estándar (ver su cabecera). Referencia de lo que produce:

| Pieza | Formato |
| --- | --- |
| iOS | `AppIcon-1024.png` opaco y sin alfa (Xcode genera el resto) + capas fondo/frente por separado para **Icon Composer**. iOS 26+ aplica Liquid Glass a las capas: sin sombras, brillos ni degradados horneados, bordes nítidos, pocas formas, sin solapamientos complejos |
| Android | Icono adaptativo: capas de 108 dp (frente, fondo, monocromo para iconos temáticos de Android 13+), glifo dentro de la zona segura de 66 dp; heredados 48-192 px; Play Store 512 px |
| Web | `favicon.ico` (16/32/48), `favicon.svg`, `apple-touch-icon.png` 180 opaco, PWA 192 y 512, `maskable` 512 (glifo dentro del círculo del 80 %), `site.webmanifest`, fragmento `<head>` |
| Redes | Avatar 800×800 seguro para recorte circular; portadas y posts: **buscar los tamaños vigentes de cada red al hacerlos** (cambian a menudo) y anotarlos con fecha en `research/sources.md` |
| Logos | SVG + PNG 256-2048 + PDF vectorial (`--pdf`) |

Las especificaciones de Apple y Google cambian cada año: antes de exportar, confirma en las páginas oficiales (fase 2, § 5) que no haya cambiado nada, y ajusta el script si hace falta.

## Impresión

Pregunta qué se imprimirá, en qué región y con qué proveedor (a veces el proveedor pide su propio perfil o formato).

| Pieza | Tamaño habitual |
| --- | --- |
| Tarjeta de visita | 85×55 mm (Europa) · 3,5×2 in (EE. UU.) · 90×50 mm (varios países de Latinoamérica) — confirmar con la imprenta |
| Hoja membretada | A4 (210×297 mm) o Carta (8,5×11 in) |
| Sobre | DL (110×220 mm) o #10 (4,125×9,5 in) |

Reglas:

- **Sangrado de 3 mm** (o 1/8 in) por lado y **margen de seguridad** de 3-5 mm hacia dentro; nada importante cerca del corte.
- Colores en **CMYK con el perfil correcto** (`cmyk.py`) o en **Pantone** si es impresión a tintas planas; negro de texto 100 % K, negro de fondos grandes "enriquecido" según indique la imprenta.
- Texto en curvas o fuentes incrustadas; imágenes a 300 ppp a tamaño final.
- Entrega en **PDF** (idealmente PDF/X-1a o PDF/X-4, que el navegador no genera: si la imprenta lo exige, avisa al usuario de que hay que pasar el PDF por una herramienta de preimpresión como Acrobat, Affinity o Scribus).
- Las piezas se maquetan en HTML con `@page { size: 91mm 61mm; margin: 0 }` (tamaño + sangrado), con marcas de corte si se piden, y se exportan con `screenshot.mjs pieza.html pieza.pdf`. Se mira el PDF renderizado a PNG antes de entregar.
