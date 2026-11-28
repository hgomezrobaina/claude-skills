---
version: alpha
name: {{NOMBRE}} — Frame (video / frame layer)
description: >
  Marca de {{NOMBRE}} para vídeo, generada desde brand.json por la skill brand-identity.
  Átomos sagrados (color exacto, familias, pesos, uso del logo); composición libre.
unit: the frame — 1920×1080 primary; 9:16 and 1:1 documented
principle: atoms are sacred · composition is free · numbers come from the script

colors:
  bg: "{{hex fondo}}"
  surface: "{{hex superficie}}"
  text: "{{hex texto}}"
  text-muted: "{{hex texto secundario}}"
  primary: "{{hex primario}}"
  accent: "{{hex acento}}"
  positive: "{{hex éxito}}"
  negative: "{{hex error}}"

radii:
  card: "{{px}}"
  pill: "100px"

typography:
  display: { fontFamily: "{{familia titulares}}", weight: {{peso}}, lineHeight: 1.05, tracking: "-0.02em", color: "text" }
  body:    { fontFamily: "{{familia texto}}", weight: 400, lineHeight: 1.5, color: "text-muted" }
  label:   { fontFamily: "{{familia texto}}", weight: 600, tracking: "0.06em", upper: true, color: "primary" }
  mono:    { fontFamily: "{{familia mono}}", weight: 400 }

fonts:
  dir: "assets/fonts"

logo:
  horizontal: "exports/logo/horizontal.svg"
  symbol: "exports/logo/symbol.svg"
  on-dark: "exports/logo/horizontal-white.svg"

motion:
  durations: { fast: "{{ms}}", base: "{{ms}}", slow: "{{ms}}" }
  easing: { standard: "cubic-bezier({{…}})" }
---

## Overview
{{La idea de la marca en 2-3 frases y sus atributos (es / no es).}}

## The Frame
{{Fondo habitual (claro/oscuro), cuánto aire, dónde vive el logo en un frame (esquina, cierre).}}

## Composition Rules
- {{Proporción de color: neutros / primario / acento.}}
- {{El acento solo para el dato o la acción principal.}}

## Logo in Motion
{{Cómo entra y sale el logo; duración; nunca deformarlo ni recolorearlo.}}

## Do's
-

## Don'ts
-
