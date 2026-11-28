# Marca · {{NOMBRE}}

Identidad de marca de {{NOMBRE}}, creada con la skill `brand-identity`. **Fuente de verdad: `brand.json`.** Todo lo de `tokens/` y `exports/` se regenera desde ahí; no se edita a mano.

## Estado

| Fase | Estado | Fecha |
| --- | --- | --- |
| 1 Descubrimiento (`brief.md`) | pendiente | |
| 2 Investigación (`research/`) | pendiente | |
| 3 Estrategia (`strategy.md`) | pendiente | |
| 4 Rutas creativas (`concepts/`) | pendiente | |
| 5 Logo (`logo/`) | pendiente | |
| 6 Color | pendiente | |
| 7 Tipografía | pendiente | |
| 8 Sistema visual y movimiento | pendiente | |
| 9 Aplicaciones (`applications/`) | pendiente | |
| 10 Kit y manual (`exports/`, `guidelines/`) | pendiente | |
| 11 Traspaso (`tokens/`, `frame.md`, `DESIGN.md`) | pendiente | |

## Comandos

```bash
S=~/.claude/skills/brand-identity/scripts
node $S/palette.mjs check brand.json          # contraste de los pares declarados
node $S/export-kit.mjs brand.json --pdf       # exports/
node $S/tokens.mjs brand.json                 # tokens/
node $S/screenshot.mjs guidelines/brand-book.html guidelines/brand-book.pdf
```

## Registro de decisiones

Una línea por decisión aprobada: fecha · fase · qué se eligió · entre qué opciones · por qué.

- {{AAAA-MM-DD}} · Alcance · …
