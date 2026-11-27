# Formatos por destino

Verificado el 2026-10-06 en las páginas de ayuda de LinkedIn y en la documentación de la API de X (help.x.com estaba bloqueada por Cloudflare). **Vuelve a comprobarlo si han pasado más de seis meses** o si un destino rechaza la subida.

| | LinkedIn (post orgánico) | X (post) |
| --- | --- | --- |
| Duración | 3 s – 15 min | 0,5 s – 20 min sin Premium |
| Proporción | 1:2.4 – 2.4:1; en el móvil el reproductor vertical puede recortar | 1:3 – 3:1; **recomendadas 16:9 y 1:1** |
| Resolución | 256×144 – 4096×2304 | hasta 1280×1024 por API; 1080p sólo con Premium |
| Códec | MP4/H.264 | H.264 High, AAC-LC si hay audio, YUV 4:2:0, ≤ 60 fps |
| Sonido | puede reproducirse en automático **sin sonido** | autoplay |
| Subtítulos | SRT desde escritorio | SRT desde la web |

## Formatos por defecto

| Formato | Tamaño | Para |
| --- | --- | --- |
| `feed` | 1080×1350 (4:5) | LinkedIn: el que más pantalla ocupa en el móvil |
| `square` | 1080×1080 (1:1) | X |
| `wide` | 1920×1080 (16:9) | landing, README, YouTube, X si se pide |
| `vertical` | 1080×1920 (9:16) | Reels, Shorts, Stories |

- Salida: H.264 High, 30 fps, `yuv420p` BT.709; AAC si hay audio.
- Un mismo guion en dos formatos es **una composición con el formato como variable** y las posiciones por formato en una tabla: el cuadrado tiene menos alto útil (~870 px frente a ~1140), así que lleva titulares y código más pequeños.
- Texto legible en un móvil: titulares de 60-70 px a 1080 de ancho, una idea por titular, nada en el 6-8 % de cada borde.
- Landing: el ancho de su columna ×2 para retina, en bucle, sin audio, con póster `.jpg`/`.webp` sacado de un fotograma.
- README de GitHub: MP4 subido como adjunto o GIF corto (< 10 MB); el póster enlaza al vídeo.
