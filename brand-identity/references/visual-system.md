# Fase 8 · Sistema visual y movimiento

Logo, color y tipo no bastan para que dos piezas distintas se vean de la misma marca. El sistema define el resto del lenguaje, y cada parte se presenta con **2-3 opciones** y su muestra.

## Iconografía

- Opciones de familia existente (Lucide, Phosphor, Tabler, Heroicons, Iconoir, Material Symbols…) buscadas y comparadas con los mismos 8-10 iconos que usará el producto (inicio, buscar, perfil, ajustes, añadir, notificación, pago, ayuda), en una hoja.
- Criterio: que el **trazo, los extremos y los radios** se parezcan al logo y a la tipografía (un logo de esquinas redondeadas con iconos afilados chirría). Licencia comercial verificada.
- Reglas: tamaños (16/20/24), grosor de trazo, relleno o contorno según estado, área de respeto. Si la marca necesita iconos propios, se dibujan sobre la misma retícula.

## Elementos gráficos

Un recurso propio que no sea el logo y que se pueda usar en todas partes: un patrón derivado del símbolo, una forma recortada, una línea, una textura, un uso particular del color en bloques. Se proponen 2-3, cada uno derivado de la idea de la ruta, y se muestran aplicados (una portada, un post, una cabecera).

## Imagen

- **Fotografía:** dirección con ejemplos de *sí / no* (luz, encuadre, personas o no, tratamiento de color, situaciones reales frente a stock). Las referencias del moodboard sirven de punto de partida.
- **Ilustración:** estilo (plana, con trazo, 3D, a mano), paleta permitida, nivel de detalle. Si se generan con IA, decirlo y comprobar la licencia de la herramienta.
- **Capturas del producto:** cómo se enmarcan (dispositivo, sombra, fondo).

## Retícula y formas

- Unidad base de espaciado (4 u 8 px) y escala (`brand.json → spacing`).
- Radios de esquina coherentes con el logo (`brand.json → radii`): si el símbolo es recto, radios pequeños o ninguno.
- Retícula de maquetación para formatos recurrentes (post 4:5, historia 9:16, diapositiva 16:9, A4).

## Movimiento

El movimiento también es marca: la misma interfaz se siente seria o juguetona según cómo se mueve.

- **Principios** (2-3, derivados de los atributos): p. ej. *precisa* → movimientos cortos y sin rebote; *juguetona* → muelles con algo de rebote.
- **Duraciones y curvas** como tokens (`brand.json → motion.durations`, `motion.easing` como cubic-bezier). Punto de partida de interfaz: 150 ms (microinteracciones), 250 ms (entradas), 400 ms (transiciones grandes); salida un poco más rápida que la entrada. Respetar `prefers-reduced-motion`.
- **Animación del logo** (opcional): idea en una frase, 1-2 s en interfaz o carga, hasta ~3 s en el cierre de un vídeo. Se hace con `visual-media` → `hyperframes` en la fase 11, partiendo de las capas del SVG.
- Las skills `animate` y `apple-design` sirven para afinar el movimiento de interfaz.

## Sonido (opcional)

Si la marca vive en vídeo o en una app con sonidos: un logo sonoro o una paleta de sonidos de interfaz. Se buscan opciones con licencia (ver `visual-media` → `references/resources.md`).

## Puerta

Una hoja por bloque y una composición de conjunto (5-6 piezas distintas juntas: ¿se ven de la misma marca?). El usuario aprueba; se anota en el `README.md` y en `brand.json`.
