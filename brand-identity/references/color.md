# Fase 6 · Color

El color es lo primero que se reconoce de una marca, antes que la forma. Debe **diferenciar** (fase 2), **expresar** los atributos (fase 3) y **funcionar**: contraste, daltonismo, modo oscuro, pantalla e imprenta.

## Estructura de la paleta

| Rol | Cuántos | Nota |
| --- | --- | --- |
| Primario | 1 | El color que se asocia a la marca |
| Secundarios / acento | 1-2 | Para destacar acciones o dar ritmo; el acento se usa poco |
| Neutros | escala de 9-11 pasos | Ligeramente teñidos hacia el primario (no gris puro) suelen verse más propios |
| Semánticos | éxito, aviso, error, información | Ajustados a la paleta, distinguibles con daltonismo |
| Fondos | claro y oscuro | El "blanco" y el "negro" de la marca (rara vez #fff y #000 puros) |

**Proporción de uso**: define cuánto se ve cada color (punto de partida 60 % neutros / 30 % primario / 10 % acento) y muéstralo en el manual con una barra proporcional. Una marca con el primario en todas partes cansa; con el acento en todas partes, deja de ser acento.

## Opciones (3-4 paletas)

Cada paleta parte de la ruta creativa y de los espacios libres del mapa de competencia (un color que nadie del sector usa vale mucho). Para cada una:

```bash
S=~/.claude/skills/brand-identity/scripts
node $S/palette.mjs sheet --colors "#…,#…,#…,#…" --labels "Primario,Acento,Fondo,Texto" --title "Paleta A — …" --png concepts/color/paleta-a.png
```

La hoja muestra cada color con su texto encima y su contraste, la escala de cada uno y cómo se ve con deuteranopía, protanopía y tritanopía, y avisa si dos colores se confunden. **Mírala.** Acompaña cada paleta con: el porqué (atributo, significado cultural en sus mercados, diferenciación) y el logo aplicado con esos colores (`proof.mjs --brand`).

El significado del color depende de la cultura y del sector: búscalo para los mercados de la marca, no lo des por universal.

## Al elegir: hacer sistema

1. **Escalas** OKLCH de 11 pasos del primario, el acento y los neutros: `palette.mjs scale "#hex" --json color/primary.json`. El color de marca queda **exacto** en el paso que le corresponde (★); los demás pasos se calculan con luminosidad perceptual pareja. Revisa a ojo los extremos (los muy claros no deben verse chillones ni los muy oscuros sucios) y ajusta si hace falta.
2. **Pares de uso** declarados en `brand.json → colors.pairs` (texto sobre fondo, botón, enlace, texto sobre el primario…) y validados con `palette.mjs check brand.json`. Objetivo: **WCAG AA** (4.5:1 texto, 3:1 texto grande ≥ 24 px o ≥ 18,66 px en negrita, componentes de interfaz y gráficos). APCA como segunda opinión, sobre todo en modo oscuro (Lc ≥ 75 cuerpo, ≥ 60 texto grande, ≥ 45 titulares). Si el primario no da contraste con blanco ni con negro, se define un **paso de la escala para texto** distinto del color de superficie.
3. **Modo oscuro:** no es invertir. Fondos oscuros teñidos (no #000), primario a menudo un paso más claro para mantener contraste, saturación algo menor en superficies grandes. Se declara en `brand.json → colors.dark` y se valida igual.
4. **Daltonismo:** ningún significado solo por color (error = rojo + icono + texto). Si dos semánticos se confunden, cambiar la luminosidad, no solo el tono.
5. **Nombres:** cada color con un nombre propio de la marca (ayuda a que el equipo lo use bien) y su rol.

## Impresión

- **CMYK con perfil**, no por fórmula: pregunta dónde se imprime y descarga el perfil oficial (Europa: ISO Coated v2 / FOGRA39 o PSO Coated v3 / FOGRA51, de eci.org; América: GRACoL2013 / CRPC6 o US Web Coated SWOP). Luego `python3 -I scripts/cmyk.py --icc <perfil> "#hex" …`. Anota el perfil usado. Los colores RGB muy saturados (azules eléctricos, verdes neón) **no existen en CMYK**: avisa y muestra la diferencia.
- **Pantone:** no se calcula. Se propone el más cercano consultando Pantone Connect o la guía física (Solid Coated y Uncoated, porque cambian), y se marca *a validar con guía física*. Si el usuario no tiene acceso, se deja indicado como pendiente.
- Para tinta única (sellos, serigrafía, grabado), el logo monocromo.

## Registro

En `brand.json → colors.palette` cada color con `id`, `name`, `role`, `hex`, `scale` (true si genera escala), y si aplica `cmyk`, `pantone`, `iccProfile`. Hex, OKLCH, RGB, CMYK y Pantone van al manual.
